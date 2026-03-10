import { Router } from "express";
import { ExportController } from "../controllers/exportController.js";
import { requireAuth } from "../middleware/authenticate.js";

export const createExportRouter = (controller: ExportController) => {
  const router = Router();
  router.get("/receipts.csv", requireAuth, controller.csv);
  router.get("/receipts.xlsx", requireAuth, controller.xlsx);
  return router;
};
