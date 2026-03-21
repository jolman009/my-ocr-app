# Updated Android Implementation Plan

## Purpose

This document replaces the original greenfield-style Android plan with an execution plan based on the current codebase state.

The repo already includes:

- a working Express + Prisma backend
- a working React web app
- a shared workspace package for receipt types, API config, client calls, and React Query hooks
- an Expo mobile app scaffold with core screens
- backend auth/storage groundwork for mobile support

The remaining work is no longer "start Android from scratch". The work is now to harden, complete, test, and ship the mobile implementation.

## Current Status Summary

### Completed

- [x] Phase 0: shared code extraction
- [x] Expo project created in `apps/mobile`
- [x] Basic navigation and app shell
- [x] Shared API configuration wired into mobile
- [x] Initial dashboard, camera/upload, and receipt detail flows
- [x] Backend CORS/rate limiting/auth groundwork
- [x] Storage abstraction for local vs. S3
- [x] Mobile UX refinement and reliability
- [x] Auth end-to-end flow in mobile
- [x] Backend production readiness (Render deployment)
- [x] Offline queue and sync
- [x] Production deployment (Render + Vercel + Supabase)
- [x] Play Store release preparation (AAB built, submitted to closed testing)

### Remaining

- [ ] Test coverage depth (Phase E — deferred)
- [ ] Post-launch monitoring integrations (Sentry project setup, analytics provider)

## Updated Phases

### Phase A: Stabilize Shared and Mobile Foundation — COMPLETE

- [x] Audit `packages/shared` exports and remove any remaining web-only assumptions
- [x] Confirm all shared imports resolve cleanly in `web`, `mobile`, and `api`
- [x] Normalize API configuration so web and mobile use the same shared setup pattern
- [x] Verify request timeout, error parsing, and response typing in shared API client
- [x] Clean up mobile project configuration for local dev, emulator, and physical device usage
- [ ] Fix or stabilize mobile Jest setup so it can run in CI — **deferred**
- [ ] Document local run/test steps for web, API, and mobile in one place — **partially done via CLAUDE.md**

### Phase B: Complete Core Mobile Workflow — COMPLETE

- [x] Finish dashboard UX states: loading, empty, retry, pull-to-refresh
- [x] Finish camera flow: permission, retake, preview, upload progress
- [x] Confirm gallery upload flow works on Android
- [x] Finish receipt detail editing UX and save confirmation
- [x] Improve line item editing behavior on mobile
- [x] Confirm export flow works via file download and share sheet
- [x] Add low-confidence indicators where extraction confidence is weak
- [x] Add navigation guards for unsaved edits
- [x] Add basic accessibility checks for touch targets and labels

### Phase C: Finish Auth and Multi-User Backend Support — COMPLETE

- [x] Review current auth routes and JWT middleware for correctness
- [x] Add registration/login screens in mobile
- [x] Persist auth token securely on device (expo-secure-store)
- [x] Attach bearer token automatically from shared/mobile API client
- [x] Enforce per-user receipt ownership on all receipt/export routes
- [x] Add logout flow and expired-token handling
- [x] Add auth-aware route guards in web and mobile
- [x] Validate `AUTH_REQUIRED=true` end-to-end
- [x] Add change password endpoint
- [x] Add password visibility toggle on auth screens

### Phase D: Harden Storage, OCR, and Production Backend Readiness — COMPLETE

- [x] Validate local storage provider behavior in development
- [x] Complete S3 provider configuration and URL generation (Supabase Storage)
- [x] Test image upload and retrieval with `STORAGE_PROVIDER=s3`
- [x] Confirm `OCR_PROVIDER=google-vision` works with real credentials
- [x] Add health/readiness checks suitable for deployment
- [x] Review API rate limiting thresholds
- [x] Verify exports work with authenticated requests and cloud-hosted images
- [x] Server binds to `0.0.0.0` for Render compatibility
- [x] `trust proxy` configured for reverse proxy
- [x] Google Vision credentials via separate env vars (not JSON blob)
- [ ] Add clearer OCR failure classification for unreadable receipts — **deferred**
- [ ] Improve receipt parsing confidence and fallback handling — **deferred**

### Phase E: Expand Test Coverage — NOT STARTED

- [ ] Add shared API client tests for auth, timeout, and error cases
- [ ] Expand backend integration tests for upload/list/detail/update/export
- [ ] Add tests for auth-protected routes
- [ ] Add more receipt parser fixtures for real-world formats
- [ ] Add mobile component tests for dashboard, camera, and detail screens
- [ ] Add at least one end-to-end mobile happy-path test
- [ ] Add CI-friendly commands and documentation for the test matrix

**Status:** Deferred — not blocking initial Play Store release. Should be addressed before scaling to more users.

### Phase F: Offline Support and Mobile UX Polish — MOSTLY COMPLETE

- [x] Add persisted query cache (AsyncStorage + React Query)
- [x] Add offline queue for upload/update actions (useMutationState)
- [x] Add connectivity listener and retry/sync manager (NetInfo)
- [x] Store pending receipt images locally until synced
- [x] Show offline and pending-sync indicators in the app
- [x] Add haptics on capture and upload
- [x] Improve image compression/resizing strategy on device (2048px, 80% JPEG)
- [x] Error boundary with recovery UI
- [x] Empty state with CTA button
- [ ] Add toasts for save/delete confirmation — **deferred**
- [ ] Add thumbnail caching and perceived-performance improvements — **deferred**

### Phase G: Release and Operations — MOSTLY COMPLETE

- [x] Configure EAS build profiles (development, preview, production)
- [x] Produce and test development and preview Android builds
- [x] Create production signing/release configuration
- [x] Prepare Play Store listing assets and policy requirements
- [x] Privacy policy hosted and linked on auth screens
- [x] Add crash reporting framework (Sentry wrapped, DSN not yet configured)
- [x] Define rollout and rollback plan
- [x] Document production environment variables and release process (RELEASE_RUNBOOK.md)
- [x] Production AAB built and submitted to closed testing
- [ ] Create Sentry project and set DSN — **not done**
- [ ] Add analytics provider (PostHog/Mixpanel) — **not done**

## Blockers — All Resolved

- ~~Mobile Jest stability~~ — deferred, not blocking release
- ~~Production OCR credentials~~ — working via `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY` on Render
- ~~Cloud storage configuration~~ — Supabase Storage S3-compatible bucket live
- ~~Managed Postgres target environment~~ — Supabase pooler connected with RLS enabled

## Milestones

### Milestone 1: Development Stable — ACHIEVED

- [x] shared/mobile foundation stable
- [x] local setup documented (CLAUDE.md)
- [x] all active apps build successfully

### Milestone 2: Android Core Workflow Complete — ACHIEVED

- [x] capture/upload/review/edit/export all working in Android

### Milestone 3: Production-Ready Backend for Mobile — ACHIEVED

- [x] auth, storage, OCR, and cloud-ready backend configuration complete
- [x] Deployed on Render with Supabase PostgreSQL and Supabase Storage

### Milestone 4: Release Candidate — ACHIEVED

- [x] Production AAB built
- [x] Submitted to Google Play closed testing (alpha track)
- [x] Privacy policy, listing assets, and descriptions completed
- [x] Google Play Console forms (content rating, data safety, target audience)
- [ ] Automated test expansion — deferred to post-launch
