import type { CustomerAccount } from "@prisma/client";
import {
  CustomerAccountRepository,
  type CustomerAccountListResult,
  type ListCustomerAccountsFilters
} from "../repositories/customerAccountRepository.js";
import { HttpError } from "../utils/httpError.js";

// Customers are keyed by mailbox number, so it's normalized the same way the
// label extractor normalizes parsed numbers — uppercase, no whitespace — so an
// exact lookup at match time succeeds regardless of how it was typed on input.
const normalizeMailbox = (value: string): string => value.replace(/\s+/g, "").toUpperCase();

export class CustomerAccountService {
  constructor(private readonly repository: CustomerAccountRepository) {}

  async create(input: {
    organizationId: string;
    name: string;
    mailboxNumber: string;
  }): Promise<CustomerAccount> {
    const mailboxNumber = normalizeMailbox(input.mailboxNumber);
    if (!mailboxNumber) {
      throw new HttpError(400, "mailboxNumber must contain at least one character.");
    }

    const existing = await this.repository.findByMailbox(input.organizationId, mailboxNumber);
    if (existing) {
      throw new HttpError(409, `A customer with mailbox ${mailboxNumber} already exists.`);
    }

    return this.repository.create({
      organizationId: input.organizationId,
      name: input.name.trim(),
      mailboxNumber
    });
  }

  async list(filters: ListCustomerAccountsFilters): Promise<CustomerAccountListResult> {
    return this.repository.list(filters);
  }
}
