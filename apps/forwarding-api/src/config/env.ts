import dotenv from "dotenv";
import { z } from "zod";

// Local .env is authoritative in dev so shell-inherited PORT or other vars
// can't shadow the developer's explicit choices. Render injects env vars
// directly into the container in prod, so this override has no effect there.
dotenv.config({ path: ".env", override: true });
dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  PORT: z.coerce.number().default(4001),
  JWT_SECRET: z.string().default("development-secret"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  WEB_ORIGINS: z.string().optional(),
  AUTH_REQUIRED: z.coerce.boolean().default(false)
});

export const env = envSchema.parse(process.env);
