import path from "node:path";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { AuthController } from "./controllers/authController.js";
import { ReceiptController } from "./controllers/receiptController.js";
import { ExportController } from "./controllers/exportController.js";
import { createAuthenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { GoogleVisionOcrProvider } from "./providers/googleVisionOcrProvider.js";
import { MockOcrProvider } from "./providers/mockOcrProvider.js";
import { LocalStorageProvider } from "./providers/localStorageProvider.js";
import { S3StorageProvider } from "./providers/s3StorageProvider.js";
import { ReceiptRepository } from "./repositories/receiptRepository.js";
import { UserRepository } from "./repositories/userRepository.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createExportRouter } from "./routes/exportRoutes.js";
import { createReceiptRouter } from "./routes/receiptRoutes.js";
import { privacyRouter } from "./routes/privacyPolicy.js";
import { AuthService } from "./services/authService.js";
import { ExportService } from "./services/exportService.js";
import { ImageService } from "./services/imageService.js";
import { ReceiptExtractor } from "./services/receiptExtractor.js";
import { ReceiptService } from "./services/receiptService.js";

const repository = new ReceiptRepository();
const users = new UserRepository();
const extractor = new ReceiptExtractor();
const storageProvider = env.STORAGE_PROVIDER === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
const imageService = new ImageService(storageProvider);
const ocrProvider = env.OCR_PROVIDER === "google-vision" ? new GoogleVisionOcrProvider() : new MockOcrProvider();
const authService = new AuthService(users);
const receiptService = new ReceiptService(repository, ocrProvider, extractor, imageService);
const exportService = new ExportService(repository);
const authController = new AuthController(authService);
const receiptController = new ReceiptController(receiptService);
const exportController = new ExportController(exportService);
const allowedOrigins = new Set(
  (env.WEB_ORIGINS ?? env.WEB_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    }
  })
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(createAuthenticate(authService));
if (env.STORAGE_PROVIDER === "local") {
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));
}
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ ok: false, status: "unhealthy", error: String(error) });
  }
});
app.use("/privacy", privacyRouter);
app.use("/api/auth", createAuthRouter(authController));
app.use("/api/receipts", createReceiptRouter(receiptController));
app.use("/api/exports", createExportRouter(exportController));
app.use(errorHandler);
