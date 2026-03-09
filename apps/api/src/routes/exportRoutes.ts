import { Router } from "express";
import { ExportController } from "../controllers/exportController.js";

export const createExportRouter = (controller: ExportController) => {
  const router = Router();
  router.get("/receipts.csv", controller.csv);
  router.get("/receipts.xlsx", controller.xlsx);
  return router;
};