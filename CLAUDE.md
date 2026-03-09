# CLAUDE.md — Receipt OCR Workspace

## Project Overview

Full-stack receipt OCR application. Users upload/capture receipt images, extract structured data via OCR, and review/edit results. Exports to CSV/Excel.

## Monorepo Structure

- `apps/api` — Express + TypeScript backend (port 4000)
- `apps/web` — React 19 + Vite frontend (port 5173)
- `docs/` — Setup guides and implementation plans
- Root uses **npm workspaces**

## Tech Stack

- **Backend:** Express, TypeScript, Prisma (PostgreSQL), Zod, Sharp, Multer
- **Frontend:** React 19, Vite, Tailwind CSS, React Query, React Hook Form, React Router
- **OCR:** Google Cloud Vision (production) / Mock provider (development)
- **Database:** PostgreSQL 15 via Docker Compose

## Key Commands

```bash
npm run dev:api         # Start API server
npm run dev:web         # Start web dev server
npm run build           # Build both apps
npm run test            # Run all tests
npm run lint            # Type-check all workspaces
npm run prisma:migrate --workspace api   # Run DB migrations
npm run prisma:generate --workspace api  # Regenerate Prisma client
docker-compose up -d    # Start PostgreSQL
```

## Architecture Patterns

- **Backend:** Controllers → Services → Repositories → Prisma (MVC + service layer)
- **OCR:** Provider pattern (`OcrProvider` interface) — swap between `mock` and `google-vision`
- **Validation:** Zod schemas at API boundaries (controller level)
- **Error handling:** Centralized `errorHandler` middleware + `HttpError` utility
- **Frontend:** React Query for server state, React Hook Form for forms, component-based UI

## API Endpoints

- `POST /api/receipts` — Upload receipt (multipart/form-data)
- `GET /api/receipts` — List with filters (page, limit, merchant, dateFrom, dateTo, status)
- `GET /api/receipts/:id` — Get single receipt
- `PATCH /api/receipts/:id` — Update receipt
- `GET /api/exports/receipts.csv` / `.xlsx` — Export data
- `GET /api/health` — Health check

## Database Models

- **User** — Optional user association (auth not yet implemented)
- **Receipt** — Core entity (merchant, date, amounts, status, confidence, OCR data)
- **ReceiptItem** — Line items (name, quantity, unitPrice, totalPrice)

## Environment

- Config validated via Zod in `apps/api/src/config/env.ts`
- `.env` file at `apps/api/.env` (not committed)
- `GOOGLE_CLOUD_PROJECT` is not needed — project ID comes from the key file
- Mock OCR provider requires no external credentials

## Important Conventions

- Use `npm.cmd` in workspace scripts (Windows environment)
- Receipt statuses: `processed`, `needs_review`, `failed`
- Uploaded images stored locally in `uploads/` (development only)
- CORS restricted to `WEB_ORIGIN` env var
- Zod schemas for item fields must use `.nullable().optional()` (not just `.optional()`) since the frontend sends `null` for empty numeric fields

## Future Plans

- Android app via Expo (React Native) — see `docs/ANDROID_IMPLEMENTATION_PLAN.md`
- Cloud storage for uploads (replacing local `uploads/`)
- JWT authentication
- Rate limiting
