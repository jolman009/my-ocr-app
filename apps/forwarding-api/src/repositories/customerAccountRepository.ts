import { PrismaClient, Prisma, type CustomerAccount } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateCustomerAccountInput {
  organizationId: string;
  name: string;
  mailboxNumber: string;
}

export interface ListCustomerAccountsFilters {
  organizationId: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CustomerAccountListResult {
  data: CustomerAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CustomerAccountRepository {
  async create(input: CreateCustomerAccountInput): Promise<CustomerAccount> {
    return prisma.customerAccount.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        mailboxNumber: input.mailboxNumber
      }
    });
  }

  async list(filters: ListCustomerAccountsFilters): Promise<CustomerAccountListResult> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const where: Prisma.CustomerAccountWhereInput = {
      organizationId: filters.organizationId,
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" } },
              { mailboxNumber: { contains: filters.q, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [total, data] = await Promise.all([
      prisma.customerAccount.count({ where }),
      prisma.customerAccount.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  /** All active customers for an org — used to build the fuzzy match index. */
  async listActiveForMatching(organizationId: string): Promise<CustomerAccount[]> {
    return prisma.customerAccount.findMany({
      where: { organizationId, active: true }
    });
  }

  async findByMailbox(organizationId: string, mailboxNumber: string): Promise<CustomerAccount | null> {
    return prisma.customerAccount.findUnique({
      where: { organizationId_mailboxNumber: { organizationId, mailboxNumber } }
    });
  }
}
