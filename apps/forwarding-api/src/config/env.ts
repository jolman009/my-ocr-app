import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });
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
