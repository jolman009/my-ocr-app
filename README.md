# Receipt OCR Workspace

A full-stack receipt OCR application with web and Android clients that share the same API contract, receipt types, and React Query hooks.

## Tech Stack

- Backend: Express, TypeScript, Prisma, PostgreSQL, Sharp, Zod
- Web: React 19, Vite, Tailwind CSS, React Query, React Hook Form, React Router
- Mobile: Expo, React Native, React Navigation
- Shared: workspace package for receipt types, API config/client, and hooks
- OCR: Google Cloud Vision (production) or mock provider (development)

## Project Structure

```text
my-ocr-app/
|-- apps/
|   |-- api/
|   |-- web/
|   `-- mobile/
|-- packages/
|   `-- shared/
|-- docs/
|-- docker-compose.yml
|-- .env.example
`-- package.json
```

## Features

- Web receipt upload, capture, review, filtering, and CSV/XLSX export
- Expo Android client with dashboard, camera capture, upload, detail review, and export sharing
- Shared receipt types, API client, and React Query hooks used by web and mobile
- JWT auth routes with optional route enforcement via environment config
- Local or S3-backed receipt image storage

## Quick Start

1. Install dependencies:
   `npm install`
2. Copy env config:
   `cp .env.example apps/api/.env`
3. Start PostgreSQL:
   `docker-compose up -d`
4. Run Prisma migrations:
   `npm run prisma:migrate --workspace api`
5. Start the apps in separate terminals:
   - `npm run dev:api`
   - `npm run dev:web`
   - `npm run dev:mobile`

## Environment

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: API server port
- `WEB_ORIGIN`: primary allowed frontend origin
- `WEB_ORIGINS`: comma-separated allowed origins for web/mobile
- `OCR_PROVIDER`: `mock` or `google-vision`
- `UPLOAD_DIR`: local upload directory when using local storage
- `AUTH_REQUIRED`: require JWT auth on receipt/export routes when `true`
- `JWT_SECRET`: JWT signing secret
- `STORAGE_PROVIDER`: `local` or `s3`
- `AWS_REGION`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`: S3 storage settings
- `GOOGLE_APPLICATION_CREDENTIALS`: path to Google Vision service account key

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/receipts`
- `GET /api/receipts`
- `GET /api/receipts/:id`
- `PATCH /api/receipts/:id`
- `GET /api/exports/receipts.csv`
- `GET /api/exports/receipts.xlsx`
- `GET /api/health`

## Scripts

- `npm run dev:api`
- `npm run dev:web`
- `npm run dev:mobile`
- `npm run build`
- `npm run test`
- `npm run lint`

## Notes

- The mobile app defaults to `http://10.0.2.2:4000/api` for Android emulator access.
- Set `AUTH_REQUIRED=true` and a strong `JWT_SECRET` before production use.
- Switch `STORAGE_PROVIDER=s3` for non-local environments.
