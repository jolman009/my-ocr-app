import type { Response } from "express";
import { z } from "zod";
import { CustomerAccountService } from "../services/customerAccountService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const createSchema = z.object({
  name: z.string().trim().min(1, "name is required."),
  mailboxNumber: z.string().trim().min(1, "mailboxNumber is required.")
});

const listFiltersSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export class CustomerAccountController {
  constructor(private readonly service: CustomerAccountService) {}

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const body = createSchema.parse(req.body);
    const customer = await this.service.create({
      organizationId: req.organizationId,
      name: body.name,
      mailboxNumber: body.mailboxNumber
    });
    res.status(201).json({ customer });
  });

  list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const filters = listFiltersSchema.parse(req.query);
    const result = await this.service.list({
      organizationId: req.organizationId,
      q: filters.q,
      page: filters.page,
      limit: filters.limit
    });
    res.json(result);
  });
}
