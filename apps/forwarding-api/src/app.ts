import path from "node:path";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { GoogleVisionOcrProvider } from "@receipt-radar/api/providers/googleVisionOcrProvider.js";
import { MockOcrProvider } from "@receipt-radar/api/providers/mockOcrProvider.js";
import { LocalStorageProvider } from "@receipt-radar/api/providers/localStorageProvider.js";
import { S3StorageProvider } from "@receipt-radar/api/providers/s3StorageProvider.js";
import type { OcrProvider } from "@receipt-radar/api/providers/ocrProvider.js";
import type { StorageProvider } from "@receipt-radar/api/providers/storageProvider.js";
import { ImageService } from "@receipt-radar/api/services/imageService.js";
import { env } from "./config/env.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createRequireOrgContext } from "./middleware/requireOrgContext.js";
import { OrganizationRepository } from "./repositories/organizationRepository.js";
import { ShipmentDocumentRepository } from "./repositories/shipmentDocumentRepository.js";
import { OrganizationService } from "./services/organizationService.js";
import { BarcodeService } from "./services/barcodeService.js";
import { ShipmentDocumentService } from "./services/shipmentDocumentService.js";
import { OrganizationController } from "./controllers/organizationController.js";
import { ShipmentDocumentController } from "./controllers/shipmentDocumentController.js";
import { createOrganizationRouter } from "./routes/organizationRoutes.js";
import { createShipmentDocumentRouter } from "./routes/shipmentDocumentRoutes.js";

// ---- Providers (shared with apps/api via path-mapped imports) ----
const storageProvider: StorageProvider =
  env.STORAGE_PROVIDER === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
const imageService = new ImageService(storageProvider);
const ocrProvider: OcrProvider =
  env.OCR_PROVIDER === "google-vision" ? new GoogleVisionOcrProvider() : new MockOcrProvider();
const barcodeService = new BarcodeService();

// ---- Repositories ----
const organizationRepository = new OrganizationRepository();
const shipmentDocumentRepository = new ShipmentDocumentRepository();

// ---- Services ----
const organizationService = new OrganizationService(organizationRepository);
const shipmentDocumentService = new ShipmentDocumentService(
  shipmentDocumentRepository,
  barcodeService,
  ocrProvider,
  imageService,
  storageProvider
);

// ---- Controllers ----
const organizationController = new OrganizationController(organizationService);
const shipmentDocumentController = new ShipmentDocumentController(shipmentDocumentService);

// ---- Middleware factories ----
const requireOrgContext = createRequireOrgContext(organizationRepository);

// ---- CORS origin allowlist ----
const allowedOrigins = new Set(
  (env.WEB_ORIGINS ?? env.WEB_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const prisma = new PrismaClient();

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
  "/forwarding",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(authenticate);

// Serve uploaded images when using local storage. On S3 the URLs are absolute
// and served by the bucket directly, so no static mount is needed.
if (env.STORAGE_PROVIDER === "local") {
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
}

app.get("/forwarding/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ ok: false, status: "unhealthy", error: String(error) });
  }
});

app.use("/forwarding/organizations", createOrganizationRouter(organizationController));
app.use(
  "/forwarding/documents",
  createShipmentDocumentRouter(shipmentDocumentController, requireOrgContext)
);

app.use(errorHandler);
