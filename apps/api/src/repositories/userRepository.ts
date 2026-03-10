import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(input: { email: string; name?: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash
      }
    });
  }
}
