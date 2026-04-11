import { PrismaClient, type Organization } from "@prisma/client";

const prisma = new PrismaClient();

export interface OrganizationWithRole {
  organization: Organization;
  role: string;
}

export class OrganizationRepository {
  async findFirstByUserId(userId: string): Promise<OrganizationWithRole | null> {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { organization: true }
    });

    if (!membership) {
      return null;
    }

    return {
      organization: membership.organization,
      role: membership.role
    };
  }

  async createWithOwner(input: {
    userId: string;
    name: string;
    slug: string;
  }): Promise<OrganizationWithRole> {
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: input.name,
          slug: input.slug
        }
      });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: input.userId,
          role: "owner"
        }
      });

      return organization;
    });

    return { organization: result, role: "owner" };
  }
}
