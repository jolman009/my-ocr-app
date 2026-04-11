import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { env } from "./config/env.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { OrganizationRepository } from "./repositories/organizationRepository.js";
import { OrganizationService } from "./services/organizationService.js";
import { OrganizationController } from "./controllers/organizationController.js";
import { createOrganizationRouter } from "./routes/organizationRoutes.js";

const organizationRepository = new OrganizationRepository();
const organizationService = new OrganizationService(organizationRepository);
const organizationController = new OrganizationController(organizationService);

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

app.get("/forwarding/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ ok: false, status: "unhealthy", error: String(error) });
  }
});

app.use("/forwarding/organizations", createOrganizationRouter(organizationController));

app.use(errorHandler);
