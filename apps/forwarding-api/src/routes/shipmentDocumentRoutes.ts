import { Router, type RequestHandler } from "express";
import multer from "multer";
import { ShipmentDocumentController } from "../controllers/shipmentDocumentController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB — mobile JPEGs can be large
});

export const createShipmentDocumentRouter = (
  controller: ShipmentDocumentController,
  requireOrgContext: RequestHandler
) => {
  const router = Router();

  router.post(
    "/",
    requireOrgContext,
    upload.single("image"),
    controller.create
  );

  router.get("/", requireOrgContext, controller.list);
  router.get("/:id", requireOrgContext, controller.getById);

  return router;
};
