import type { Request, Response } from "express";
import { z } from "zod";
import { ExportService } from "../services/exportService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const filtersSchema = z.object({
  merchant: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["processed", "needs_review", "failed"]).optional()
});

export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  csv = asyncHandler(async (req: Request, res: Response) => {
    const filters = filtersSchema.parse(req.query);
    const csv = await this.exportService.generateCsv(filters);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=receipts.csv");
    res.send(csv);
  });

  xlsx = asyncHandler(async (req: Request, res: Response) => {
    const filters = filtersSchema.parse(req.query);
    const workbook = await this.exportService.generateWorkbook(filters);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=receipts.xlsx");
    res.send(workbook);
  });
}