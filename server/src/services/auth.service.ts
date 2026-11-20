import { UserRole, StudentStatus } from "../types/enums.js";
import { userRepository } from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { studentRepository } from "../repositories/student.repository.js";
import prisma from "../prisma/client.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/jwt.js";
import { AppError } from "../middleware/errorHandler.js";
import { JwtUserPayload } from "../types/index.js";

export class AuthService {
  /**
   * Signup: ALWAYS forces role = STUDENT
   */
  async signup(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    rollNumber?: string;
    admissionYear?: number;
    departmentId?: string;
    semesterId?: string;
    role?: any; // Ignored deliberately to prevent privilege escalation
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email is already registered. Please login.", 409);
    }

    const passwordHash = await hashPassword(data.password);

    // Fetch default department and semester if not provided
    let departmentId = data.departmentId;
    let semesterId = data.semesterId;

    if (!departmentId) {
      const defaultDept = await prisma.department.findFirst();
      if (defaultDept) departmentId = defaultDept.id;
    }

    if (!semesterId) {
      const defaultSem =
        (await prisma.semester.findFirst({ where: { isCurrent: true } })) ||
        (await prisma.semester.findFirst());
      if (defaultSem) semesterId = defaultSem.id;
    }

    // Wrap user and student creation in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: UserRole.STUDENT, // ALWAYS STUDENT
          phone: data.phone,
          gender: data.gender,
          isVerified: true,
          isActive: true,
        },
      });

      if (departmentId && semesterId) {
        const generatedRoll =
          data.rollNumber ||
          `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.student.create({
          data: {
            userId: createdUser.id,
            departmentId,
            semesterId,
            rollNumber: generatedRoll,
            admissionYear: data.admissionYear || new Date().getFullYear(),
            currentCGPA: 0.0,
            status: StudentStatus.ACTIVE,
          },
        });
      }

      return createdUser;
    });

    const jwtPayload: JwtUserPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
      fullName: newUser.fullName,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const {
      token: refreshTokenRaw,
      tokenHash,
      expiresAt,
    } = generateRefreshToken();

    await refreshTokenRepository.create(newUser.id, tokenHash, expiresAt);

    return {
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role as UserRole,
        phone: newUser.phone,
        avatarUrl: newUser.avatarUrl,
        gender: newUser.gender,
      },
      accessToken,
      refreshTokenRaw,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || user.deletedAt) {
      throw new AppError("Invalid email or password credentials.", 401);
    }

    if (!user.isActive) {
      throw new AppError(
        "Account is disabled. Please contact campus admin.",
        403,
      );
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid email or password credentials.", 401);
    }

    await userRepository.updateLastLogin(user.id);

    const jwtPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const {
      token: refreshTokenRaw,
      tokenHash,
      expiresAt,
    } = generateRefreshToken();

    await refreshTokenRepository.create(user.id, tokenHash, expiresAt);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
      },
      accessToken,
      refreshTokenRaw,
    };
  }

  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new AppError("Refresh token required.", 401);
    }

    const tokenHash = hashRefreshToken(refreshTokenRaw);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    if (!storedToken) {
      throw new AppError("Invalid refresh token.", 401);
    }

    if (storedToken.revoked) {
      // Possible token reuse attempt! Revoke all tokens for this user for security
      await refreshTokenRepository.revokeAllUserTokens(storedToken.userId);
      throw new AppError(
        "Compromised refresh token. Please sign in again.",
        401,
      );
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AppError("Refresh token expired. Please sign in again.", 401);
    }

    const user = storedToken.user;
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError("User account is inactive.", 401);
    }

    // Token rotation: Revoke current and issue replacement
    const {
      token: newRefreshRaw,
      tokenHash: newHash,
      expiresAt: newExpires,
    } = generateRefreshToken();

    await refreshTokenRepository.revoke(tokenHash, newHash);
    await refreshTokenRepository.create(user.id, newHash, newExpires);

    const jwtPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = generateAccessToken(jwtPayload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshTokenRaw: newRefreshRaw,
    };
  }

  async logout(refreshTokenRaw?: string) {
    if (refreshTokenRaw) {
      const tokenHash = hashRefreshToken(refreshTokenRaw);
      await refreshTokenRepository.revoke(tokenHash);
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        gender: true,
        isActive: true,
        createdAt: true,
        student: {
          include: {
            department: true,
            semester: true,
          },
        },
        faculty: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }
}

export const authService = new AuthService();
