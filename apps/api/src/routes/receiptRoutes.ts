import multer from "multer";
import { Router } from "express";
import { ReceiptController } from "../controllers/receiptController.js";
import { requireAuth } from "../middleware/authenticate.js";
import { HttpError } from "../utils/httpError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new HttpError(400, "Unsupported file type."));
      return;
    }

    callback(null, true);
  }
});

export const createReceiptRouter = (controller: ReceiptController) => {
  const router = Router();
  router.post("/", requireAuth, upload.single("file"), controller.create);
  router.get("/", requireAuth, controller.list);
  router.get("/:id", requireAuth, controller.getById);
  router.patch("/:id", requireAuth, controller.update);
  return router;
};
