import prisma from "../prisma/client.js";
import { Prisma, RefreshToken } from "@prisma/client";

export class RefreshTokenRepository {
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findByHash(
    tokenHash: string,
  ): Promise<(RefreshToken & { user: any }) | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  async revoke(
    tokenHash: string,
    replacedByToken?: string,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revoked: true,
        ...(replacedByToken ? { replacedByToken } : {}),
      },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
