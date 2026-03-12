# Receipt Radar – Production Release Runbook

## Environment Variables

### Mobile (Expo / EAS)

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL for the backend API | Yes |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry Data Source Name for crash reporting | Yes |

These are set per-profile in `eas.json` under each build profile's `env` block.

Current EAS profile defaults:
- **development:** `http://10.0.2.2:3000` (Android emulator → host machine)
- **preview:** `https://staging-api.receiptradar.example.com`
- **production:** `https://api.receiptradar.example.com`

### Backend (API)

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — | Yes |
| `PORT` | API server port | `4000` | No |
| `WEB_ORIGIN` | Primary allowed frontend origin | `http://localhost:5173` | No |
| `WEB_ORIGINS` | Comma-separated allowed origins (web + mobile) | — | No |
| `AUTH_REQUIRED` | Enable JWT auth middleware on receipt/export routes | `false` | No |
| `JWT_SECRET` | Secret key for signing JWTs | `development-secret` | Yes (production) |
| `OCR_PROVIDER` | `google-vision` or `mock` | `google-vision` | No |
| `GOOGLE_APPLICATION_CREDENTIALS` | Absolute path to GCP service account JSON key | — | When `OCR_PROVIDER=google-vision` |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` | No |
| `S3_BUCKET` | S3 bucket name | — | When `STORAGE_PROVIDER=s3` |
| `S3_ENDPOINT` | S3-compatible endpoint URL | — | When `STORAGE_PROVIDER=s3` |
| `S3_ACCESS_KEY_ID` | S3 access key | — | When `STORAGE_PROVIDER=s3` |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | — | When `STORAGE_PROVIDER=s3` |
| `S3_PUBLIC_BASE_URL` | Public base URL for uploaded images | — | When `STORAGE_PROVIDER=s3` |
| `AWS_REGION` | AWS region for S3 | `us-east-1` | When `STORAGE_PROVIDER=s3` |
| `UPLOAD_DIR` | Local upload directory | `uploads` | When `STORAGE_PROVIDER=local` |

### Production Checklist

Before deploying to production, ensure:
- [ ] `AUTH_REQUIRED=true`
- [ ] `JWT_SECRET` set to a strong random value (not `development-secret`)
- [ ] `STORAGE_PROVIDER=s3` (local filesystem doesn't work on ephemeral cloud containers)
- [ ] `OCR_PROVIDER=google-vision` with valid service account key
- [ ] `WEB_ORIGINS` includes all allowed client origins

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `POST` | `/api/receipts` | When `AUTH_REQUIRED` | Upload receipt (multipart/form-data) |
| `GET` | `/api/receipts` | When `AUTH_REQUIRED` | List receipts with filters |
| `GET` | `/api/receipts/:id` | When `AUTH_REQUIRED` | Get single receipt |
| `PATCH` | `/api/receipts/:id` | When `AUTH_REQUIRED` | Update receipt data |
| `GET` | `/api/exports/receipts.csv` | When `AUTH_REQUIRED` | Export receipts as CSV |
| `GET` | `/api/exports/receipts.xlsx` | When `AUTH_REQUIRED` | Export receipts as Excel |
| `GET` | `/api/health` | No | Health check |

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

```bash
eas submit --profile production --platform android
```

Submits to the **internal** testing track. Promote to closed/open beta or production from the Play Console.

### OTA Updates (JS-only changes)

```bash
eas update --branch production --message "description of change"
```

Pushes JavaScript bundle updates without requiring a new Play Store build. Only works for non-native changes.

---

## Rollout Strategy

| Phase | Track | Audience | Duration |
|---|---|---|---|
| 1 | Internal Testing | Team only | 1–2 days |
| 2 | Closed Beta | Invited testers (~50) | 3–5 days |
| 3 | Open Beta | Public opt-in | 5–7 days |
| 4 | Production | Staged 10% → 50% → 100% | 1 week |

### Rollback Plan

- **OTA Rollback**: Publish a previous JS bundle via `eas update` to instantly revert logic changes.
- **Native Rollback**: Halt the staged rollout in Play Console and revert to the last stable AAB.
- **API Rollback**: Redeploy the previous backend container/image. Database migrations should always be backward-compatible.

---

## Backend Deployment

### Recommended Providers

- **Railway** — simplest (GitHub auto-deploy, managed PostgreSQL)
- **Render** — free tier available, managed PostgreSQL
- **Fly.io** — good for low-latency global distribution

### Deploy Steps

1. Push to your deploy branch (or connect GitHub repo to provider)
2. Set all backend environment variables (see table above)
3. Run Prisma migrations on production DB: `npx prisma migrate deploy`
4. Verify health check: `curl https://your-api.example.com/api/health`

### Database Migrations

```bash
# From apps/api directory, with production DATABASE_URL set
npx prisma migrate deploy
```

Always run migrations **before** deploying new app code that depends on schema changes. Migrations should be backward-compatible to allow safe rollbacks.

---

## Crash Reporting (Sentry)

- DSN is configured via `EXPO_PUBLIC_SENTRY_DSN`
- Sentry is initialized in `App.tsx` and wraps the entire component tree
- In production, traces are sampled at 20% (`tracesSampleRate: 0.2`)
- Source maps are uploaded automatically by the `@sentry/react-native/expo` plugin during EAS builds
- Sentry org: `receipt-radar`, project: `receipt-radar-mobile` (configured in `app.json`)

---

## Analytics

- Defined in `src/lib/analytics.ts`
- Type-safe event tracking with console logging in dev mode
- Production: swap the `track()` body for your provider (Amplitude, Mixpanel, PostHog)
- Key events tracked: `receipt_uploaded`, `receipt_viewed`, `receipt_edited`, `receipt_exported`, `login_success`, `logout`, `offline_upload_queued`, `offline_upload_synced`

---

## Play Store Listing Checklist

- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] 4–8 phone screenshots (16:9 or 9:16)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy policy URL (required for camera/photo permissions)
- [ ] Content rating questionnaire
- [ ] Target audience declaration
- [ ] Data safety form (camera, photos, network usage)
