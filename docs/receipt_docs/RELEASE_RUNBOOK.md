# Receipt Radar – Production Release Runbook

## Environment Variables

### Mobile (Expo / EAS)

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL for the backend API | Yes |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry Data Source Name for crash reporting | No (not yet configured) |
| `SENTRY_DISABLE_AUTO_UPLOAD` | Set to `true` to skip Sentry source map uploads | Yes (until Sentry project is created) |

These are set per-profile in `eas.json` under each build profile's `env` block.

Current EAS profile values:
- **development:** `http://10.0.2.2:4000` (Android emulator → host machine)
- **preview:** `https://receipt-radar-api.onrender.com/api`
- **production:** `https://receipt-radar-api.onrender.com/api`

### Backend (API) — Deployed on Render

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) | — | Yes |
| `PORT` | API server port | `4000` | No |
| `WEB_ORIGIN` | Primary allowed frontend origin | `http://localhost:5173` | No |
| `WEB_ORIGINS` | Comma-separated allowed origins (web + mobile) | — | Yes (production) |
| `AUTH_REQUIRED` | Enable JWT auth middleware on receipt/export routes | `false` | Yes (production: `true`) |
| `JWT_SECRET` | Secret key for signing JWTs | `development-secret` | Yes (production) |
| `OCR_PROVIDER` | `google-vision` or `mock` | `mock` | No |
| `GOOGLE_APPLICATION_CREDENTIALS` | Absolute path to GCP service account JSON key | — | Local dev only |
| `GOOGLE_CLIENT_EMAIL` | GCP service account email | — | Render (production) |
| `GOOGLE_PRIVATE_KEY` | GCP service account private key | — | Render (production) |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` | No |
| `S3_BUCKET` | S3 bucket name | — | When `STORAGE_PROVIDER=s3` |
| `S3_ENDPOINT` | S3-compatible endpoint URL | — | When `STORAGE_PROVIDER=s3` |
| `S3_ACCESS_KEY_ID` | S3 access key (note: must include `_ID`) | — | When `STORAGE_PROVIDER=s3` |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | — | When `STORAGE_PROVIDER=s3` |
| `S3_PUBLIC_BASE_URL` | Public base URL for uploaded images | — | When `STORAGE_PROVIDER=s3` |
| `AWS_REGION` | AWS region for S3 | `us-east-1` | When `STORAGE_PROVIDER=s3` |
| `UPLOAD_DIR` | Local upload directory | `uploads` | When `STORAGE_PROVIDER=local` |

### Production Checklist

All items completed on Render:
- [x] `AUTH_REQUIRED=true`
- [x] `JWT_SECRET` set to a strong random value
- [x] `STORAGE_PROVIDER=s3` with Supabase Storage credentials
- [x] `OCR_PROVIDER=google-vision` with `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`
- [x] `WEB_ORIGINS` includes all allowed client origins
- [x] Server binds to `0.0.0.0` (required for Render)
- [x] `trust proxy` set to 1 (required for express-rate-limit behind Render's reverse proxy)

### Important Notes

- **Google Vision on Render:** Do NOT use `GOOGLE_CREDENTIALS_JSON` — Render mangles `\n` in env vars. Use `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY` separately.
- **Database password:** Use literal `#` in Render env vars (not `%23` — Render doesn't URL-encode).
- **CORS:** Env var is `WEB_ORIGINS` (not `WEB_ORIGENS` — typo caused a past failure).
- **S3 key name:** Must be `S3_ACCESS_KEY_ID` (not `S3_ACCESS_KEY`).

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `POST` | `/api/auth/change-password` | Yes | Change password (requires `currentPassword` + `newPassword`) |
| `POST` | `/api/receipts` | When `AUTH_REQUIRED` | Upload receipt (multipart/form-data) |
| `GET` | `/api/receipts` | When `AUTH_REQUIRED` | List receipts with filters |
| `GET` | `/api/receipts/:id` | When `AUTH_REQUIRED` | Get single receipt |
| `PATCH` | `/api/receipts/:id` | When `AUTH_REQUIRED` | Update receipt data |
| `GET` | `/api/exports/receipts.csv` | When `AUTH_REQUIRED` | Export receipts as CSV |
| `GET` | `/api/exports/receipts.xlsx` | When `AUTH_REQUIRED` | Export receipts as Excel |
| `GET` | `/api/health` | No | Health check |
| `GET` | `/privacy` | No | Privacy policy page (HTML) |

---

## Deployments

### Backend — Render

- **URL:** `https://receipt-radar-api.onrender.com`
- **Service:** `receipt-radar-api`
- **Root directory:** `apps/api`
- **Build command:** `cd ../.. && npm install --include=dev && npx prisma generate --schema=apps/api/prisma/schema.prisma && npm run build --workspace api`
- **Start command:** `node dist/index.js`
- **Auto-deploy:** Connected to GitHub `main` branch
- Free tier has cold starts (~15s) — mobile timeout set to 60s

### Web Frontend — Vercel

- **URL:** `https://my-ocr-app-nu.vercel.app`
- **Framework:** Vite
- **Build command:** `npm run build --workspace web`
- **Output directory:** `apps/web/dist`
- **Env var:** `VITE_API_URL=https://receipt-radar-api.onrender.com/api`
- SPA rewrite rule in `vercel.json` for direct URL access (e.g., `/privacy`)

### Database — Supabase

- **Pooler:** `aws-1-us-east-1.pooler.supabase.com:5432` (session mode with `?pgbouncer=true`)
- RLS enabled on all tables
- Receipt images stored in Supabase Storage `receipts` bucket (public, S3-compatible)

---

## Build & Release Workflow

### Prerequisites

1. Install EAS CLI globally: `npm install -g eas-cli`
2. Login: `eas login`
3. Ensure a Google Play Service Account JSON exists at `apps/mobile/google-service-account.json`
4. Android package: `com.jolma.receiptradar`

### Development Build (debug APK)

```bash
cd apps/mobile
eas build --profile development --platform android
```

Installs on emulators or sideloaded devices. Uses Expo Dev Client.

### Preview Build (internal test APK)

```bash
eas build --profile preview --platform android
```

Distributes via EAS internal distribution. Share the download link with testers.

### Production Build (Play Store AAB)

```bash
eas build --profile production --platform android
```

Produces an Android App Bundle signed with your production key. Version auto-increments via `appVersionSource: "remote"`.

### Submit to Play Store

First submission must be done manually via Google Play Console. After that:

```bash
eas submit --profile production --platform android
```

Submits to the **closed testing** (alpha) track. Promote to open beta or production from the Play Console.

### OTA Updates (JS-only changes)

```bash
eas update --branch production --message "description of change"
```

Pushes JavaScript bundle updates without requiring a new Play Store build. Only works for non-native changes.

---

## Rollout Strategy

| Phase | Track | Audience | Duration |
|---|---|---|---|
| 1 | Closed Testing (Alpha) | Invited testers | 3–5 days |
| 2 | Open Beta | Public opt-in | 5–7 days |
| 3 | Production | Staged 10% → 50% → 100% | 1 week |

### Rollback Plan

- **OTA Rollback**: Publish a previous JS bundle via `eas update` to instantly revert logic changes.
- **Native Rollback**: Halt the staged rollout in Play Console and revert to the last stable AAB.
- **API Rollback**: Redeploy previous commit on Render via Manual Deploy. Database migrations should always be backward-compatible.

---

## Crash Reporting (Sentry)

- DSN configured via `EXPO_PUBLIC_SENTRY_DSN` (not yet set up — Sentry project needs to be created)
- Sentry is initialized in `App.tsx` and wraps the entire component tree
- In production, traces are sampled at 20% (`tracesSampleRate: 0.2`)
- Source map uploads disabled via `SENTRY_DISABLE_AUTO_UPLOAD=true` until Sentry project is configured
- Sentry org: `receipt-radar`, project: `receipt-radar-mobile` (configured in `app.config.ts`)

---

## Analytics

- Defined in `src/lib/analytics.ts`
- Type-safe event tracking with console logging in dev mode
- Production: swap the `track()` body for your provider (Amplitude, Mixpanel, PostHog)
- Key events tracked: `receipt_uploaded`, `receipt_viewed`, `receipt_edited`, `receipt_exported`, `login_success`, `logout`, `offline_upload_queued`, `offline_upload_synced`

---

## Play Store Listing Checklist

- [x] App icon (512x512 PNG)
- [x] Feature graphic (1024x500 PNG)
- [x] 4–8 phone screenshots
- [x] Short description (80 chars max)
- [x] Full description (4000 chars max)
- [x] Privacy policy URL — `https://my-ocr-app-nu.vercel.app/privacy`
- [x] Content rating questionnaire
- [x] Target audience declaration
- [x] Data safety form
