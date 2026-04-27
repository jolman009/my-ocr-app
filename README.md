# Receipt OCR Workspace

A monorepo hosting two products that share OCR, storage, auth, and image-processing infrastructure:

- **Receipt Radar** — freelancer receipt OCR app (web + Android, shipped to Play Store closed testing).
- **Manifest 956** — forwarding-center logistics document pipeline (Android, mid-V0 build).

## Tech Stack

- Backend: Express, TypeScript, Prisma, PostgreSQL (Supabase), Sharp, Zod
- Web: React 19, Vite, Tailwind CSS, React Query, React Hook Form, React Router
- Mobile: Expo, React Native, React Navigation
- Shared: `packages/shared` — receipt types, API client, hooks (used by web + Receipt Radar mobile)
- OCR: Google Cloud Vision (production) or mock provider (development)
- Barcode: `zxing-wasm` (Manifest 956) — Code128 / QR / DataMatrix / EAN

## Project Structure

```text
my-ocr-app/
|-- apps/
|   |-- api/                  # Receipt Radar backend (port 4000)
|   |-- forwarding-api/       # Manifest 956 backend (port 4001)
|   |-- web/                  # Receipt Radar web
|   |-- mobile/               # Receipt Radar Expo (com.jolma.receiptradar)
|   `-- forwarding-mobile/    # Manifest 956 Expo (com.jolma.manifest956)
|-- packages/
|   `-- shared/               # Shared receipt types + API client
|-- docs/
|   |-- receipt_docs/         # Receipt Radar guides + roadmap
|   `-- manifest_docs/        # Manifest 956 pivot plan + V0 timeline
|-- docker-compose.yml
`-- package.json
```

The two backends share `JWT_SECRET` — a token issued by `apps/api` verifies on `apps/forwarding-api`. Login still happens only on `apps/api`.

## Quick Start

1. Install dependencies:
   `npm install`
2. Copy env config:
   `cp apps/api/.env.example apps/api/.env`
   (Manifest 956 has its own template at `apps/forwarding-api/.env.example`.)
3. Start PostgreSQL (local dev only — production uses Supabase):
   `docker-compose up -d`
4. Run Prisma migrations:
   `npm run prisma:migrate --workspace api`
5. Start the apps in separate terminals:
   - `npm run dev:api`
   - `npm run dev:forwarding-api` (only if working on Manifest 956)
   - `npm run dev:web`
   - `npm run dev:mobile` or `npm run dev:forwarding-mobile`

## Environment

- `DATABASE_URL`: PostgreSQL connection string (Supabase pooler in prod)
- `PORT`: API server port (4000 for api, 4001 for forwarding-api)
- `WEB_ORIGIN`: primary allowed frontend origin
- `WEB_ORIGINS`: comma-separated allowed origins for web/mobile
- `OCR_PROVIDER`: `mock` or `google-vision`
- `UPLOAD_DIR`: local upload directory when using local storage
- `AUTH_REQUIRED`: require JWT auth on receipt/export routes when `true`
- `JWT_SECRET`: JWT signing secret (must be identical across both backends)
- `STORAGE_PROVIDER`: `local` or `s3`
- `AWS_REGION`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`: S3 / Supabase Storage settings
- `GOOGLE_APPLICATION_CREDENTIALS`: path to Google Vision service account key (local dev only — Render uses `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`)

## API Endpoints

Receipt Radar (`apps/api`):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/receipts`
- `GET /api/receipts`
- `GET /api/receipts/:id`
- `PATCH /api/receipts/:id`
- `GET /api/exports/receipts.csv`
- `GET /api/exports/receipts.xlsx`
- `GET /api/health`

Manifest 956 (`apps/forwarding-api`):

- `POST /forwarding/organizations/bootstrap`
- `GET /forwarding/organizations/me`
- `POST /forwarding/documents`
- `GET /forwarding/documents` (with `?q=<tracking>` substring search)
- `GET /forwarding/documents/:id`

## Scripts

- `npm run dev:api` / `npm run dev:forwarding-api`
- `npm run dev:web`
- `npm run dev:mobile` / `npm run dev:forwarding-mobile`
- `npm run build`
- `npm run test`
- `npm run lint`

## Notes

- Receipt Radar mobile defaults to `http://10.0.2.2:4000/api` for the Android emulator.
- Manifest 956 mobile uses `EXPO_PUBLIC_AUTH_API_URL` (Receipt Radar API for login) and `EXPO_PUBLIC_FORWARDING_API_URL` (forwarding-api for data).
- Set `AUTH_REQUIRED=true` and a strong `JWT_SECRET` before production use.
- Switch `STORAGE_PROVIDER=s3` for non-local environments.
