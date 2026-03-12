# Receipt Radar – Production Release Runbook

## Environment Variables

### Mobile (Expo / EAS)

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL for the backend API | ✅ |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry Data Source Name for crash reporting | ✅ |

These are set per-profile in `eas.json` under each build profile's `env` block.

### Backend (API)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ |
| `JWT_EXPIRES_IN` | Token TTL (e.g. `7d`) | Default `7d` |
| `AUTH_REQUIRED` | Enable auth middleware | Default `true` |
| `OCR_PROVIDER` | `google-vision` or `mock` | Default `google-vision` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service-account JSON | When `OCR_PROVIDER=google-vision` |
| `STORAGE_PROVIDER` | `local` or `s3` | Default `local` |
| `AWS_ACCESS_KEY_ID` | AWS key for S3 | When `STORAGE_PROVIDER=s3` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret for S3 | When `STORAGE_PROVIDER=s3` |
| `AWS_S3_BUCKET` | S3 bucket name | When `STORAGE_PROVIDER=s3` |
| `AWS_REGION` | AWS region | When `STORAGE_PROVIDER=s3` |
| `PORT` | API server port | Default `3000` |

---

## Build & Release Workflow

### Prerequisites

1. Install EAS CLI globally: `npm install -g eas-cli`
2. Login: `eas login`
3. Ensure a Google Play Service Account JSON exists at `apps/mobile/google-service-account.json`

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

Produces an Android App Bundle signed with your production key.

### Submit to Play Store

```bash
eas submit --profile production --platform android
```

Submits to the **internal** testing track. Promote to closed/open beta or production from the Play Console.

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

## Crash Reporting (Sentry)

- DSN is configured via `EXPO_PUBLIC_SENTRY_DSN`
- Sentry is initialized in `App.tsx` and wraps the entire component tree
- In production, traces are sampled at 20% (`tracesSampleRate: 0.2`)
- Source maps are uploaded automatically by the `@sentry/react-native/expo` plugin during EAS builds

---

## Analytics

- Defined in `src/lib/analytics.ts`
- Type-safe event tracking with console logging in dev mode
- Production: swap the `track()` body for your provider (Amplitude, Mixpanel, PostHog)
- Key events tracked: `receipt_uploaded`, `receipt_viewed`, `receipt_edited`, `receipt_exported`, `login_success`, `logout`, `offline_upload_queued`, `offline_upload_synced`

---

## Play Store Listing Checklist

- [ ] App icon (512×512 PNG)
- [ ] Feature graphic (1024×500 PNG)
- [ ] 4–8 phone screenshots (16:9 or 9:16)
- [ ] Short description (≤80 chars)
- [ ] Full description (≤4000 chars)
- [ ] Privacy policy URL (required for camera/photo permissions)
- [ ] Content rating questionnaire
- [ ] Target audience declaration
- [ ] Data safety form (camera, photos, network usage)
