# Pre-Production TODO Checklist

## Critical (Must-Have for Play Store)

- [x] **Privacy Policy** — Hosted at `https://my-ocr-app-nu.vercel.app/privacy`, linked on auth screen
- [x] **Play Store Listing Assets**
  - [x] Feature graphic (1024x500 PNG)
  - [x] 4-8 phone screenshots
  - [x] Short description (80 chars max)
  - [x] Full description (4000 chars max)
- [x] **Google Play Console Setup**
  - [x] Developer account ($25 one-time — already have from ShelfQuest)
  - [ ] Content rating questionnaire (in progress)
  - [ ] Data safety form — camera, photos, network, analytics (in progress)
  - [ ] Target audience declaration (in progress)
  - [x] Google Service Account JSON for EAS Submit
- [x] **S3/Supabase Storage** — Images stored in Supabase Storage `receipts` bucket
- [x] **Production AAB Build** — Built via `eas build --profile production --platform android`
- [x] **First Play Store Submission** — Manually uploaded AAB to closed testing (alpha) track

## High Priority (Should-Have)

- [x] **Error Boundary** — Graceful fallback UI with "Try Again" recovery + Sentry reporting
- [x] **Password Visibility Toggle** — Show/Hide on login/signup (mobile + web)
- [x] **Change Password Endpoint** — `POST /api/auth/change-password`
- [x] **Empty Dashboard CTA** — "Scan a Receipt" button when no receipts exist
- [ ] **Sentry Project Setup** — Create project in Sentry dashboard, set `EXPO_PUBLIC_SENTRY_DSN`
- [ ] **Analytics Integration** — `analytics.ts` currently logs to console only; needs a real provider
- [ ] **Multi-device Testing** — Test on Android 9-15, different screen sizes
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
