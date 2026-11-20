import prisma from "../prisma/client.js";
import { Prisma, User } from "@prisma/client";
import { UserRole } from "../types/enums.js";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async listUsers(role?: UserRole, search?: string) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
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
        lastLoginAt: true,
        student: {
          include: { department: true, semester: true },
        },
        faculty: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const userRepository = new UserRepository();
