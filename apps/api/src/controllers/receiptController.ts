import { z } from "zod";
import type { Request, Response } from "express";
import { ReceiptService } from "../services/receiptService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const filtersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  merchant: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["processed", "needs_review", "failed"]).optional()
});

const updateSchema = z.object({
  merchantName: z.string().nullable().optional(),
  receiptDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  tip: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  rawText: z.string().optional(),
  confidence: z.record(z.number()).optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().nullable().optional(),
    unitPrice: z.number().nullable().optional(),
    totalPrice: z.number()
  })).optional()
});

export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "Receipt file is required." });
      return;
    }

    const receipt = await this.receiptService.createFromUpload(req.file);
    res.status(201).json({ id: receipt.id, status: receipt.status, receipt });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const filters = filtersSchema.parse(req.query);
    const receipts = await this.receiptService.list(filters);
    res.json(receipts);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const receipt = await this.receiptService.getById(String(req.params.id));
    res.json(receipt);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const payload = updateSchema.parse(req.body);
    const receipt = await this.receiptService.update(String(req.params.id), payload);
    res.json(receipt);
  });
}