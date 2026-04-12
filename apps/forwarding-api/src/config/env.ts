import dotenv from "dotenv";
import { z } from "zod";

// Local .env is authoritative in dev so shell-inherited PORT or other vars
// can't shadow the developer's explicit choices. Render injects env vars
// directly into the container in prod, so this override has no effect there.
dotenv.config({ path: ".env", override: true });
dotenv.config({ path: "../../.env" });

// NOTE: Forwarding-api's schema only declares the vars this app reads
// directly. OCR_PROVIDER, STORAGE_PROVIDER, GOOGLE_*, S3_*, UPLOAD_DIR
// are consumed by apps/api/src/config/env.ts (which is loaded transitively
// when we import OCR/storage providers via @receipt-radar/api/*). Those
// vars MUST still be present in apps/forwarding-api/.env — see .env.example.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  PORT: z.coerce.number().default(4001),
  JWT_SECRET: z.string().default("development-secret"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  WEB_ORIGINS: z.string().optional(),
  AUTH_REQUIRED: z.coerce.boolean().default(false),
  OCR_PROVIDER: z.enum(["mock", "google-vision"]).default("mock"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local")
});

export const env = envSchema.parse(process.env);
