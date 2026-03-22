import type { Response } from "express";
import { z } from "zod";
import { exportColumnKeys } from "@receipt-ocr/shared/types";
import { ExportService } from "../services/exportService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const exportTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  columns: z.array(
    z.object({
      key: z.enum(exportColumnKeys),
      label: z.string()
    })
  ).min(1),
  dateFormat: z.enum(["iso", "us"]),
  amountFormat: z.enum(["plain", "currency"]),
  createdAt: z.string(),
  updatedAt: z.string()
});

const filtersSchema = z.object({
  merchant: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["processed", "needs_review", "failed"]).optional(),
  template: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      try {
        return exportTemplateSchema.parse(JSON.parse(value));
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid export template."
        });
        return z.NEVER;
      }
    })
});

export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  csv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const filters = filtersSchema.parse(req.query);
    const csv = await this.exportService.generateCsv(filters, req.auth?.userId, filters.template);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=receipts.csv");
    res.send(csv);
  });

  xlsx = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const filters = filtersSchema.parse(req.query);
    const workbook = await this.exportService.generateWorkbook(filters, req.auth?.userId, filters.template);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=receipts.xlsx");
    res.send(workbook);
  });
}
