import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  WEB_ORIGINS: z.string().optional(),
  OCR_PROVIDER: z.enum(["mock", "google-vision"]).default("mock"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CREDENTIALS_JSON: z.string().optional(),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  UPLOAD_DIR: z.string().default("uploads"),
  AUTH_REQUIRED: z.coerce.boolean().default(false),
  JWT_SECRET: z.string().default("development-secret"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  AWS_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("Receipt Radar <onboarding@resend.dev>"),
  APP_URL: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);

// Guard against the config drift that broke Manifest 956 image URLs (2026-05-12):
// s3StorageProvider writes keys as `receipts/<file>` and builds public URLs as
// `${S3_PUBLIC_BASE_URL}/${key}`. For Supabase Storage the URL must include the
// bucket segment (`.../public/<bucket>`), so S3_PUBLIC_BASE_URL must end with the
// bucket name — otherwise every uploaded image 404s even though the PUT succeeds.
// Warn (not throw) so legitimate CDN/custom-domain setups that map to the bucket
// root are not broken.
if (
  env.STORAGE_PROVIDER === "s3" &&
  env.S3_BUCKET &&
  env.S3_PUBLIC_BASE_URL &&
  !env.S3_PUBLIC_BASE_URL.replace(/\/$/, "").endsWith(`/${env.S3_BUCKET}`)
) {
  console.warn(
    `[env] S3_PUBLIC_BASE_URL ("${env.S3_PUBLIC_BASE_URL}") does not end with ` +
      `the bucket name "/${env.S3_BUCKET}". For Supabase Storage this produces ` +
      `image URLs that 404. Expected it to end with "/${env.S3_BUCKET}". ` +
      `Ignore this only if you front the bucket with a CDN mapped to its root.`
  );
}
