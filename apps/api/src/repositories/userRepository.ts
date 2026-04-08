import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  }

  create(input: { email: string; name?: string; passwordHash?: string; googleId?: string; authProvider?: string }) {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        googleId: input.googleId,
        authProvider: input.authProvider ?? "password"
      }
    });
  }

  linkGoogle(id: string, googleId: string) {
    return prisma.user.update({
      where: { id },
      data: { googleId, authProvider: "google" }
    });
  }

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null }
    });
  }

  setResetToken(id: string, resetTokenHash: string, resetTokenExpiresAt: Date) {
    return prisma.user.update({
      where: { id },
      data: { resetTokenHash, resetTokenExpiresAt }
    });
  }

  findByResetToken(resetTokenHash: string) {
    return prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: { gt: new Date() }
      }
    });
  }
}
