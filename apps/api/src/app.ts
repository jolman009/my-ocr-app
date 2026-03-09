import path from "node:path";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { ReceiptController } from "./controllers/receiptController.js";
import { ExportController } from "./controllers/exportController.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { GoogleVisionOcrProvider } from "./providers/googleVisionOcrProvider.js";
import { MockOcrProvider } from "./providers/mockOcrProvider.js";
import { ReceiptRepository } from "./repositories/receiptRepository.js";
import { createExportRouter } from "./routes/exportRoutes.js";
import { createReceiptRouter } from "./routes/receiptRoutes.js";
import { ExportService } from "./services/exportService.js";
import { ImageService } from "./services/imageService.js";
import { ReceiptExtractor } from "./services/receiptExtractor.js";
import { ReceiptService } from "./services/receiptService.js";

const repository = new ReceiptRepository();
const extractor = new ReceiptExtractor();
const imageService = new ImageService();
const ocrProvider = env.OCR_PROVIDER === "google-vision" ? new GoogleVisionOcrProvider() : new MockOcrProvider();
const receiptService = new ReceiptService(repository, ocrProvider, extractor, imageService);
const exportService = new ExportService(repository);
const receiptController = new ReceiptController(receiptService);
const exportController = new ExportController(exportService);

export const app = express();

app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/receipts", createReceiptRouter(receiptController));
app.use("/api/exports", createExportRouter(exportController));
app.use(errorHandler);