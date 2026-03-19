# Pre-Production TODO Checklist

## Critical (Must-Have for Play Store)

- [x] **Privacy Policy** — Hosted at `https://receipt-radar-api.onrender.com/privacy`, linked on auth screen
- [ ] **Play Store Listing Assets**
  - [ ] Feature graphic (1024x500 PNG)
  - [ ] 4-8 phone screenshots (16:9 or 9:16)
  - [ ] Short description (80 chars max)
  - [ ] Full description (4000 chars max)
- [ ] **Google Play Console Setup**
  - [x] Developer account ($25 one-time — already have from ShelfQuest)
  - [ ] Content rating questionnaire
  - [ ] Data safety form (camera, photos, network, analytics)
  - [ ] Target audience declaration
  - [ ] Google Service Account JSON for EAS Submit
- [x] **S3/Supabase Storage** — Images stored in Supabase Storage `receipts` bucket
- [ ] **Production AAB Build** — `eas build --profile production --platform android`

## High Priority (Should-Have)

- [x] **Error Boundary** — Graceful fallback UI when a screen crashes (Sentry catches it but user sees a blank screen)
- [ ] **Analytics Integration** — `analytics.ts` currently logs to console only; needs a real provider (PostHog, Mixpanel, etc.)
- [ ] **Multi-device Testing** — Test on Android 9-15, different screen sizes
- [ ] **Sentry DSN** — Add `EXPO_PUBLIC_SENTRY_DSN` to EAS build profiles
- [ ] **Auth Token Refresh** — Currently forces logout when token expires mid-session

## UI Improvement Flow Plan

| Area | Current State | Improvement |
|---|---|---|
| **Receipt Image** | Fixed 320px height, no interaction | Pinch-to-zoom + full-screen lightbox |
| **Receipt List** | `ActivityIndicator` spinner on load | Skeleton loader cards for perceived speed |
| **Upload Feedback** | Alert.alert on error, no progress | Progress bar during upload + toast notifications |
| **Dark Mode** | Not supported (`userInterfaceStyle: "light"`) | Dark theme using `theme.ts` system |
| **Onboarding** | None — drops straight to login | 2-3 swipeable intro slides on first launch |
| ~~**Empty Dashboard**~~ | ~~"No receipts yet" text~~ | ~~Done — CTA button added~~ |
| **Camera UX** | Basic capture + gallery | Receipt alignment guide overlay |
| **Search** | Filter by merchant/status only | Full-text search bar on dashboard |
| **Deep Linking** | Not configured | `receiptradar://receipt/:id` for sharing |
| **Haptic Feedback** | Only on capture/upload | Subtle haptics on save, delete, navigation |

## Nice-to-Have (Post-Launch)

- [ ] Dark mode support
- [ ] Onboarding flow (first-time user experience)
- [ ] Receipt image pinch-to-zoom
- [ ] Skeleton loaders for receipt list
- [ ] Camera alignment guide overlay
- [ ] Full-text search on dashboard
- [ ] Deep linking support
- [ ] Push notifications (export ready, OCR complete)
- [ ] Multi-currency support
- [ ] Receipt categories/tags
- [ ] Monthly spending charts/analytics
- [ ] Biometric auth (fingerprint/face unlock)
