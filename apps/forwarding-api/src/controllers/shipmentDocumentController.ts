import type { Response } from "express";
import { z } from "zod";
import { ShipmentDocumentService } from "../services/shipmentDocumentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const SHIPMENT_STATUSES = ["processed", "needs_review", "failed"] as const;

const listFiltersSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["label", "invoice", "packing_slip", "customs", "unknown"]).optional(),
  customerId: z.string().optional(),
  status: z.enum(SHIPMENT_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

// Fields an operator may edit from the review queue. All optional; `null`
// explicitly clears a field. At least one key must be present (enforced below).
const updateSchema = z
  .object({
    trackingNumber: z.string().trim().min(1).nullable(),
    carrier: z.string().trim().min(1).nullable(),
    recipientName: z.string().trim().min(1).nullable(),
    mailboxNumber: z.string().trim().min(1).nullable(),
    documentType: z.enum(["label", "invoice", "packing_slip", "customs", "unknown"]).nullable(),
    matchedCustomerId: z.string().trim().min(1).nullable(),
    status: z.enum(SHIPMENT_STATUSES)
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required."
  });

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

export class ShipmentDocumentController {
  constructor(private readonly service: ShipmentDocumentService) {}

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new HttpError(400, "File is required in the 'image' form field.");
    }
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    if (!req.auth?.userId) {
      throw new HttpError(401, "Authentication is required.");
    }
    if (!ACCEPTED_MIME_TYPES.has(req.file.mimetype)) {
      throw new HttpError(400, `Unsupported file type: ${req.file.mimetype}.`);
    }

    const document = await this.service.createFromUpload({
      file: req.file,
      organizationId: req.organizationId,
      uploadedById: req.auth.userId
    });

    res.status(201).json({ document });
  });

  list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const filters = listFiltersSchema.parse(req.query);
    const result = await this.service.list({
      organizationId: req.organizationId,
      q: filters.q,
      type: filters.type,
      customerId: filters.customerId,
      status: filters.status,
      page: filters.page,
      limit: filters.limit
    });
    res.json(result);
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const document = await this.service.getById(String(req.params.id), req.organizationId);
    res.json({ document });
  });

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const patch = updateSchema.parse(req.body);
    const document = await this.service.update(
      String(req.params.id),
      req.organizationId,
      patch,
      req.auth?.userId ?? null
    );
    res.json({ document });
  });

  listCorrections = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.organizationId) {
      throw new HttpError(500, "Organization context missing — middleware misconfigured.");
    }
    const corrections = await this.service.listCorrections(
      String(req.params.id),
      req.organizationId
    );
    res.json({ corrections });
  });
}
