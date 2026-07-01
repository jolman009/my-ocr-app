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

  // Batch upload (#23) — up to 25 files per request under the "images" field.
  // Each file still gets the 15 MB cap; sequential processing lives in the
  // service. Async fan-out for high volume is deferred to #24.
  router.post(
    "/batch",
    requireOrgContext,
    upload.array("images", 25),
    controller.createBatch
  );

  router.get("/", requireOrgContext, controller.list);
  router.get("/:id", requireOrgContext, controller.getById);
  router.get("/:id/corrections", requireOrgContext, controller.listCorrections);
  router.patch("/:id", requireOrgContext, controller.update);

  return router;
};
