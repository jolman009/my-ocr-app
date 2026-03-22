# Receipt Radar Project Memory

Last updated: March 22, 2026

## Product Direction

- Product name: `Receipt Radar`
- Positioning: `freelancer bookkeeping assistant with a consumer-simple UX`
- Core audience: solo freelancers and one-person businesses
- Core promise: `scan receipts, verify key fields, and export clean records in the user's preferred spreadsheet format`
- OCR scope: best-effort extraction optimized for header fields first
- Line items: not a core promise in the MVP

## Current Architecture

- Monorepo with:
  - `apps/api`
  - `apps/web`
  - `apps/mobile`
  - `packages/shared`
- API:
  - Node / Express
  - Prisma
  - PostgreSQL
- Web:
  - React
  - Vite
  - React Router
- Shared package:
  - `@receipt-ocr/shared`
  - now built to `dist` for runtime-safe ESM usage

## Storage / Deployment Notes

- Render is hosting the API service
- Supabase Postgres is being used as the database
- Supabase Storage has also been part of the deployment picture, but production environment details have been mixed historically
- Important fix already applied:
  - `@receipt-ocr/shared` must build to `dist`
  - package exports must point to built JS, not raw TypeScript source

## Repo Truth

- Canonical repo:
  - `C:\Users\Jolma\Documents\Vibe-Code\my-ocr-app`
- The old OneDrive copy should be treated as abandoned
- Legacy upload-file recovery was intentionally abandoned as a sunk-cost detour

## Key Docs In Repo

- Competitive research:
  - `docs/competitive-research.md`
- Screen spec:
  - `docs/screen-spec.md`
- Navigation and UX phase planning:
  - `docs/navigation-and-ux-phase-plan.md`

## Implemented Product Work

### Core product surfaces

- Public landing page
- Auth page
- Workspace home / dashboard
- Receipt review page
- Privacy page

### Export work

- Export templates
- Saved template selection during export
- Lightweight export history

Current note:
- template persistence and export history are browser-local right now, not server-synced

### UX restructuring

Phase 1 completed:

- app navigation shell
- dedicated routes for:
  - `/app/capture`
  - `/app/exports`
  - `/app/settings`

Phase 2 completed:

- uploader and OCR processing flow moved into dedicated `Capture` screen
- dashboard simplified to behave more like a home surface

## Current Route Structure

- `/` -> landing
- `/auth` -> auth
- `/privacy` -> privacy
- `/app` -> workspace home
- `/app/capture` -> dedicated capture surface
- `/app/exports` -> dedicated exports surface stub
- `/app/settings` -> dedicated settings surface stub
- `/app/receipts/:id` -> receipt review

## Screen Spec Status

Implemented as dedicated pages or surfaces:

- Public Landing Page
- Sign-In / Sign-Up
- Dashboard / Receipt Inbox
- Receipt Capture
- Receipt Review

Implemented but still lightweight / partial:

- OCR Processing State
- Export Builder
- Export History

Not fully implemented yet:

- Onboarding - Profile Intent
- Onboarding - Export Template Setup as a true onboarding step
- Settings / Billing as a functional account screen

## Recent Important Commits

- `5db03c7` Add competitive research brief
- `ef3e753` Add export templates and history
- `9f422db` Fix shared package ESM imports
- `ba67f16` Build shared package before app deploys
- `d6784c3` Add phase one app navigation shell
- `498ff66` Move upload flow into capture page

## Current Product Reality

The app is no longer just a one-surface dashboard, but it is still mid-transition from:

- dashboard-centric MVP

to:

- structured product with dedicated working surfaces

The `Capture` screen is now real.
The `Exports` and `Settings` screens exist structurally but still need their real feature moves.

## Best Next Steps

### Immediate next UX phase

Move real export tools into the dedicated `Exports` screen:

- template manager
- export actions
- export history

Then simplify the dashboard further so it stays focused on:

- recent receipts
- filters
- quick status
- shortcuts into focused workflows

### After that

Implement real `Settings` behavior:

- account info
- current plan
- scan usage
- default export settings
- billing-ready structure

### Later

- onboarding profile intent
- onboarding export template setup
- plan enforcement
- billing integration
- AI-assisted cleanup and categorization

## Operational Notes

- Be careful not to commit generated web `.js` artifacts created during builds
- After local web builds, cleanup is often needed for:
  - generated `apps/web/src/*.js` artifacts
  - `apps/web/tsconfig.tsbuildinfo`
- Prefer committing only source `.tsx/.ts` and intentional docs changes

## Collaboration Notes

- Favor repo-local docs over hidden memory
- Keep major product decisions documented in `docs/`
- Update this file when:
  - architecture changes
  - deployment assumptions change
  - a phase is completed
  - priorities change
