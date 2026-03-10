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

### Partially Complete

- [ ] Mobile UX refinement and reliability
- [ ] Auth end-to-end flow in mobile
- [ ] Backend production readiness
- [ ] Test coverage depth
- [ ] Release pipeline and Play Store setup

### Not Started or Not Complete Enough

- [ ] Offline queue and sync
- [ ] Production deployment and observability
- [ ] Play Store release preparation
- [ ] Post-launch monitoring integrations

## Execution Strategy

The next work should follow this order:

1. Stabilize the current mobile and shared foundation.
2. Finish the first production-usable mobile feature set.
3. Harden backend and auth for real users.
4. Expand automated test coverage.
5. Add offline and UX polish only after the core path is reliable.
6. Prepare deployment, release, and monitoring.

## Updated Phases

### Phase A: Stabilize Shared and Mobile Foundation

Goal: make the current shared package and Expo app reliable enough for day-to-day development.

Checklist:

- [ ] Audit `packages/shared` exports and remove any remaining web-only assumptions
- [ ] Confirm all shared imports resolve cleanly in `web`, `mobile`, and `api`
- [ ] Normalize API configuration so web and mobile use the same shared setup pattern
- [ ] Verify request timeout, error parsing, and response typing in shared API client
- [ ] Clean up mobile project configuration for local dev, emulator, and physical device usage
- [ ] Fix or stabilize mobile Jest setup so it can run in CI
- [ ] Document local run/test steps for web, API, and mobile in one place

Definition of done:

- [ ] `web`, `api`, and `mobile` all build cleanly
- [ ] shared package is the single source of truth for receipt API contracts
- [ ] mobile test runner is either working or explicitly replaced with an agreed test strategy

### Phase B: Complete Core Mobile Workflow

Goal: make Android capable of the same core receipt workflow as the web app.

Checklist:

- [ ] Finish dashboard UX states: loading, empty, retry, pull-to-refresh
- [ ] Finish camera flow: permission, retake, preview, upload progress
- [ ] Confirm gallery upload flow works on Android
- [ ] Finish receipt detail editing UX and save confirmation
- [ ] Improve line item editing behavior on mobile
- [ ] Confirm export flow works via file download and share sheet
- [ ] Add low-confidence indicators where extraction confidence is weak
- [ ] Add navigation guards for unsaved edits
- [ ] Add basic accessibility checks for touch targets and labels

Definition of done:

- [ ] user can capture or select a receipt
- [ ] upload succeeds against the local API
- [ ] parsed receipt opens in detail view
- [ ] user can edit and save receipt fields
- [ ] updated receipt is visible in dashboard list
- [ ] export works from the mobile app

### Phase C: Finish Auth and Multi-User Backend Support

Goal: move from development-only access to a real user model.

Checklist:

- [ ] Review current auth routes and JWT middleware for correctness
- [ ] Add registration/login screens in mobile
- [ ] Persist auth token securely on device
- [ ] Attach bearer token automatically from shared/mobile API client
- [ ] Enforce per-user receipt ownership on all receipt/export routes
- [ ] Add logout flow and expired-token handling
- [ ] Add auth-aware route guards in web and mobile
- [ ] Validate `AUTH_REQUIRED=true` end-to-end

Definition of done:

- [ ] a user can register, log in, and log out
- [ ] receipts are scoped to the authenticated user
- [ ] unauthenticated access is blocked when auth is enabled

### Phase D: Harden Storage, OCR, and Production Backend Readiness

Goal: remove local-development assumptions that block production and mobile deployment.

Checklist:

- [ ] Validate local storage provider behavior in development
- [ ] Complete S3 provider configuration and URL generation
- [ ] Test image upload and retrieval with `STORAGE_PROVIDER=s3`
- [ ] Confirm `OCR_PROVIDER=google-vision` works with real credentials
- [ ] Add clearer OCR failure classification for unreadable receipts
- [ ] Improve receipt parsing confidence and fallback handling
- [ ] Add health/readiness checks suitable for deployment
- [ ] Review API rate limiting thresholds
- [ ] Verify exports work with authenticated requests and cloud-hosted images

Definition of done:

- [ ] API can run with managed Postgres, S3, and Google Vision
- [ ] receipt images and exports work outside local disk assumptions
- [ ] OCR failures degrade gracefully into reviewable states

### Phase E: Expand Test Coverage

Goal: raise confidence in the mobile contract and core receipt workflows.

Checklist:

- [ ] Add shared API client tests for auth, timeout, and error cases
- [ ] Expand backend integration tests for upload/list/detail/update/export
- [ ] Add tests for auth-protected routes
- [ ] Add more receipt parser fixtures for real-world formats
- [ ] Add mobile component tests for dashboard, camera, and detail screens
- [ ] Add at least one end-to-end mobile happy-path test
- [ ] Add CI-friendly commands and documentation for the test matrix

Definition of done:

- [ ] backend contract regressions are caught automatically
- [ ] mobile core flow has automated coverage
- [ ] parser changes can be tested against fixture receipts

### Phase F: Offline Support and Mobile UX Polish

Goal: improve resilience and usability after the online core path is solid.

Checklist:

- [ ] Add persisted query cache
- [ ] Add offline queue for upload/update actions
- [ ] Add connectivity listener and retry/sync manager
- [ ] Store pending receipt images locally until synced
- [ ] Show offline and pending-sync indicators in the app
- [ ] Add haptics, toasts, and transition polish
- [ ] Improve image compression/resizing strategy on device
- [ ] Add thumbnail caching and perceived-performance improvements

Definition of done:

- [ ] user can continue limited work when offline
- [ ] queued items sync automatically when connectivity returns
- [ ] mobile UX feels production-ready rather than prototype-level

### Phase G: Release and Operations

Goal: get the Android app deployable and supportable.

Checklist:

- [ ] Configure EAS build profiles
- [ ] Produce and test development and preview Android builds
- [ ] Create production signing/release configuration
- [ ] Prepare Play Store listing assets and policy requirements
- [ ] Add crash reporting
- [ ] Add analytics or product telemetry
- [ ] Define rollout and rollback plan
- [ ] Document production environment variables and release process

Definition of done:

- [ ] preview and production builds are reproducible
- [ ] release process is documented
- [ ] crash and usage telemetry are available after launch

## Suggested Timeline

This timeline assumes one primary developer working part-time to full-time on the codebase. If there are multiple contributors, Phases C, D, and E can overlap.

### Week 1

- Phase A: stabilize shared/mobile foundation
- Fix mobile test runner or decide replacement strategy
- Clean up local development configuration

### Week 2

- Phase B: finish core mobile workflow
- Validate capture, upload, detail editing, save, and export on Android emulator

### Week 3

- Finish remaining Phase B gaps
- Start Phase C auth screens and token handling

### Week 4

- Complete Phase C auth and ownership enforcement
- Start Phase D storage/OCR production validation

### Week 5

- Complete Phase D
- Start Phase E backend/shared/mobile test expansion

### Week 6

- Complete Phase E
- Begin Phase F offline support and mobile polish

### Week 7

- Continue Phase F
- Start Phase G release setup and operational documentation

### Week 8

- Complete Phase G
- Run release candidate validation
- Prepare for internal or limited external testing

## Milestones

### Milestone 1: Development Stable

Target: end of Week 1

- [ ] shared/mobile foundation stable
- [ ] local setup documented
- [ ] all active apps build successfully

### Milestone 2: Android Core Workflow Complete

Target: end of Week 3

- [ ] capture/upload/review/edit/export all working in Android

### Milestone 3: Production-Ready Backend for Mobile

Target: end of Week 5

- [ ] auth, storage, OCR, and cloud-ready backend configuration complete

### Milestone 4: Release Candidate

Target: end of Week 8

- [ ] automated tests expanded
- [ ] offline support or explicit deferral decision made
- [ ] Android preview/production release process ready

## Recommended Immediate Next Steps

Execute these next, in order:

1. Stabilize the mobile test setup and shared package boundaries.
2. Finish the remaining mobile core workflow gaps.
3. Turn on auth end-to-end and validate user-scoped receipt access.
4. Validate S3 and Google Vision in a non-local environment.
5. Expand integration and mobile tests before release work.

## Status Tracking Template

Use this section as the working checklist during execution.

### In Progress

- [ ] Phase A
- [ ] Phase B
- [ ] Phase C
- [ ] Phase D
- [ ] Phase E
- [ ] Phase F
- [ ] Phase G

### Blockers

- [ ] Mobile Jest stability
- [ ] Production OCR credentials
- [ ] Cloud storage configuration
- [ ] Managed Postgres target environment

