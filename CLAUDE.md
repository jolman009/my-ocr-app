# CLAUDE.md — Receipt OCR Workspace

## Project Overview

This monorepo hosts two products that share infrastructure:

- **Receipt Radar** — freelancer receipt OCR app. Users upload/capture receipts, extract structured data via OCR, review/edit, and export CSV/Excel. Shipped to Play Store closed testing.
- **Manifest 956** — forwarding-center logistics document pipeline (B2B). Currently mid-V0 build. See `docs/manifest_docs/forwarding_center_pivot.md` for the strategic plan.

## Monorepo Structure

- `apps/api` — Receipt Radar Express + TypeScript backend (port 4000)
- `apps/forwarding-api` — Manifest 956 backend (port 4001)
- `apps/web` — Receipt Radar React 19 + Vite frontend (port 5173)
- `apps/mobile` — Receipt Radar Expo app (`com.jolma.receiptradar`)
- `apps/forwarding-mobile` — Manifest 956 Expo app (`com.jolma.manifest956`)
- `packages/shared` — shared receipt types, API client, hooks (used by web + mobile)
- `docs/receipt_docs/` — Receipt Radar guides + roadmap
- `docs/manifest_docs/` — Manifest 956 pivot plan + V0 timeline
- Root uses **npm workspaces**

The two backends share `JWT_SECRET` so a token issued by `apps/api` verifies on `apps/forwarding-api`. Code is shared via direct imports (`@receipt-radar/api/*`, `@receipt-radar/mobile/*` path aliases) — extraction to `packages/*` is deferred until the third-instance rule triggers.

## Tech Stack

- **Backend:** Express, TypeScript, Prisma (PostgreSQL), Zod, Sharp, Multer
- **Frontend:** React 19, Vite, Tailwind CSS, React Query, React Hook Form, React Router
- **OCR:** Google Cloud Vision (production) / Mock provider (development)
- **Database:** PostgreSQL 15 via Docker Compose

## Key Commands

```bash
npm run dev:api                  # Receipt Radar API (port 4000)
npm run dev:forwarding-api       # Manifest 956 API (port 4001)
npm run dev:web                  # Receipt Radar web
npm run dev:mobile               # Receipt Radar Expo
npm run dev:forwarding-mobile    # Manifest 956 Expo
npm run build                    # Build shared + both backends + web
npm run test                     # Run api + web tests
npm run lint                     # Type-check all workspaces
npm run prisma:migrate --workspace api   # Run DB migrations
npm run prisma:generate --workspace api  # Regenerate Prisma client
docker-compose up -d             # Start PostgreSQL (local dev only — prod uses Supabase)
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

- Rate limiting
- See `docs/receipt_docs/ROADMAP.md` for active Receipt Radar work
- See `docs/manifest_docs/` for Manifest 956 (forwarding-center pivot) plans
