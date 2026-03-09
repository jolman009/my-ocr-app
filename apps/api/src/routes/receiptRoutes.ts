import multer from "multer";
import { Router } from "express";
import { ReceiptController } from "../controllers/receiptController.js";
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
  router.post("/", upload.single("file"), controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  return router;
};