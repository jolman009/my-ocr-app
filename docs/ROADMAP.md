# Receipt Radar — Roadmap

Last updated: 2026-04-07

## Completed Recently

- [x] **Fix local Supabase connection** — Root cause: wrong password (`%23` added a `#` that didn't exist) + port 5432 blocked locally. Fixed by correcting password and using port 6543.

## High Priority — Tester Feedback (2026-04-07)

External testers (Testers Community) found zero bugs/crashes. These are their top recommendations:

- [ ] **Play Store screenshots redesign** — current screenshots are plain captures; need feature highlights, annotations, engaging visuals to improve conversion
- [x] **Google Sign-in** — backend endpoint + mobile OAuth flow via expo-auth-session (needs GCP OAuth client IDs configured)
- [x] **Onboarding walkthrough** — 3-slide swipeable intro for first-time users (Scan, Review, Export)
- [x] **Dark mode** — light/dark/system toggle in Settings, full theme system with semantic color tokens

## High Priority — Existing

- [ ] **Auth token refresh** — currently forces logout after 7-day JWT expiry; needs silent refresh
- [ ] **Analytics integration** — `analytics.ts` logs to console only; connect PostHog or Mixpanel
- [x] **Settings screen** — real account info, current plan, scan usage, default export settings

## Medium Priority

- [ ] **Export format integrations** — accounting software (QuickBooks, Xero) import compatibility
- [ ] **Vendor memory** — auto-suggest merchants based on previous scans
- [ ] **Auto-categorization** — AI-suggested receipt categories based on merchant/items
- [ ] **In-app feedback mechanism** — allow users to report issues or request features from within the app
- [ ] **Full-text search** — search bar on dashboard beyond merchant/status filters
- [ ] **Camera alignment guide** — receipt overlay to help users frame captures

## Nice-to-Have (Post-Launch)

- [ ] Pinch-to-zoom on receipt images
- [ ] Deep linking (`receiptradar://receipt/:id`)
- [ ] Push notifications (export ready, OCR complete)
- [ ] Multi-currency support
- [x] Receipt categories/tags
- [ ] Monthly spending charts/analytics
- [ ] Biometric auth (fingerprint/face unlock)
- [ ] In-app chat support
- [ ] Social media login options (Facebook, Apple)

## Completed

- [x] V1 feature-complete — all navigation/UX phases (1-7)
- [x] Web app restructured: Home, Capture, Exports, Settings
- [x] Mobile app working on physical Android device
- [x] Bottom tab navigation (Home, Scan, Exports, Settings)
- [x] Google Vision OCR in production
- [x] Backend deployed to Render
- [x] Web frontend deployed to Vercel
- [x] Receipt images in Supabase Storage
- [x] Privacy policy (Vercel + Render fallback)
- [x] Production AAB built and submitted to Play Store (closed testing)
- [x] Password reset via email (Resend)
- [x] Export templates with column selection, header renaming, formatting
- [x] Export history tracking
- [x] Landing page + auth page with plan selection
- [x] Sentry DSN configured
- [x] Haptic feedback on save/delete
- [x] Skeleton loaders on mobile
- [x] Upload progress indicator
- [x] Error boundary with recovery
- [x] Password visibility toggle
- [x] Change password endpoint
- [x] Empty dashboard CTA
