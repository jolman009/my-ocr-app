# Android Implementation Plan

## Recommended Approach: Expo (React Native)

Capacitor (wrapping the existing web UI) seems tempting, but the current frontend is desktop-first with wide tables and two-column layouts — you'd end up rewriting most of the UI anyway. Since you already know React/TypeScript, Expo gives you native camera control, better performance, and a natural mobile UX with minimal new learning.

### Why Expo over alternatives

| Factor | React Native / Expo | Capacitor (wrap web) | Flutter | PWA |
|--------|---------------------|----------------------|---------|-----|
| **Code reuse** | Types + API client + hooks reusable; UI rewritten | ~90% existing web code kept | Zero reuse; full rewrite | ~95% existing code |
| **Camera quality** | Excellent native control, autofocus, flash | Decent but limited live preview | Excellent native camera | Browser-dependent; no flash/autofocus control |
| **Offline support** | AsyncStorage + SQLite; robust | Same Capacitor plugins | Hive/Drift; robust | Service Worker only; fragile on Android |
| **Performance** | Native rendering; smooth | WebView; sluggish on older devices | Native rendering; best perf | WebView-equivalent |
| **Play Store release** | Yes, via EAS Build | Yes, via Capacitor CLI | Yes | No (TWA possible but limited) |
| **Learning curve** | Low — same React/TS | Lowest — keep existing code | High — new language (Dart) | Lowest — no new tooling |
| **Long-term maintainability** | Strong ecosystem, large community | Smaller ecosystem; WebView quirks | Strong but separate skill set | Not a real app |

---

## Implementation Checklist

### Phase 0: Shared Code Extraction

- [ ] **0.1** Create `packages/shared` workspace — move `types/receipt.ts`, `api/client.ts`, `hooks/useReceipts.ts` into it
- [ ] **0.2** Make the API base URL configurable (replace `import.meta.env.VITE_API_URL` with a setter function)
- [ ] **0.3** Update `apps/web` to import from `@receipt-ocr/shared`, verify it still works
- [ ] **0.4** Add `packages/shared` to root `package.json` workspaces
- [ ] **0.5** Set up `packages/shared/package.json` with name, main, and types fields

### Phase 1: Expo Project Setup

- [ ] **1.1** Create Expo app: `npx create-expo-app apps/mobile --template blank-typescript`
- [ ] **1.2** Add `apps/mobile` to workspaces
- [ ] **1.3** Configure `app.json` — package name, permissions (`CAMERA`, `READ_EXTERNAL_STORAGE`), `extra.apiUrl`
- [ ] **1.4** Add `@receipt-ocr/shared` as a dependency
- [ ] **1.5** Install core deps: `expo-camera`, `expo-image-picker`, `expo-file-system`, `expo-sharing`, `expo-sqlite`, `expo-network`, `@react-navigation/native`, `@react-navigation/native-stack`, `@tanstack/react-query`, `react-hook-form`, `zod`, `nativewind`
- [ ] **1.6** Run `npx expo prebuild` and verify it runs on Android emulator

### Phase 2: Navigation

- [ ] **2.1** Create `RootNavigator.tsx` with native stack: `Dashboard`, `Camera`, `ReceiptDetail`
- [ ] **2.2** Define `RootStackParamList` types
- [ ] **2.3** Wrap `App.tsx` with `QueryClientProvider`, `NavigationContainer`, `SafeAreaProvider`, `ApiConfigProvider`
- [ ] **2.4** Style headers to match brand colors (`ink`, `tide`, `ember`)

### Phase 3: API Client for Mobile

- [ ] **3.1** Read `apiUrl` from Expo constants, call shared `setApiBaseUrl()`
- [ ] **3.2** Add network error handling, timeouts (15s), and auth token support
- [ ] **3.3** Test all 4 API operations against local backend via `adb reverse tcp:4000 tcp:4000`

### Phase 4: Dashboard Screen

- [ ] **4.1** Create `DashboardScreen.tsx` with `FlatList` of receipts
- [ ] **4.2** Each row: merchant, date, status badge, total, item count
- [ ] **4.3** Floating action button (FAB) to open Camera screen
- [ ] **4.4** Pull-to-refresh via `FlatList` + React Query `refetch`
- [ ] **4.5** Filter controls: merchant search (debounced), status filter
- [ ] **4.6** Export: download CSV/XLSX via `expo-file-system`, share via `expo-sharing`
- [ ] **4.7** Empty state, loading skeleton, error + retry states
- [ ] **4.8** Tap row to navigate to `ReceiptDetail`

### Phase 5: Camera Screen

- [ ] **5.1** Create `CameraScreen.tsx` with full-screen `<CameraView>`
- [ ] **5.2** Request camera permission with rationale on deny
- [ ] **5.3** Back camera, autofocus, flash/torch toggle
- [ ] **5.4** Capture button (large circular)
- [ ] **5.5** Post-capture preview with "Use Photo" / "Retake"
- [ ] **5.6** Gallery fallback via `expo-image-picker`
- [ ] **5.7** On "Use Photo": show processing overlay, call `uploadReceipt()`, navigate to detail on success
- [ ] **5.8** Resize large images (>10MB) via `expo-image-manipulator` before upload

### Phase 6: Receipt Detail / Review Screen

- [ ] **6.1** Create `ReceiptDetailScreen.tsx`
- [ ] **6.2** Fetch receipt via `useReceipt(id)`
- [ ] **6.3** Zoomable receipt image at top
- [ ] **6.4** Confidence scores section
- [ ] **6.5** Edit form with `react-hook-form`: merchant, date, address, subtotal, tax, tip, total, currency
- [ ] **6.6** Line items with `useFieldArray`: add/remove items
- [ ] **6.7** Save button wired to `useUpdateReceipt()`
- [ ] **6.8** Saving state (spinner, disabled button)
- [ ] **6.9** Success toast on save
- [ ] **6.10** `KeyboardAvoidingView` + `ScrollView` for form

### Phase 7: Offline Support

- [ ] **7.1** Persist React Query cache with `@tanstack/react-query-persist-client` + AsyncStorage/SQLite
- [ ] **7.2** Create offline queue for failed uploads/updates
- [ ] **7.3** Sync manager: listen for connectivity via `expo-network`, flush queue on reconnect
- [ ] **7.4** Save captured images to document directory for offline upload
- [ ] **7.5** "Offline" banner when no connectivity
- [ ] **7.6** Pending sync count badge on dashboard
- [ ] **7.7** Show queued receipts in list with "pending upload" status

### Phase 8: Image Optimizations

- [ ] **8.1** Resize to max 2048px before upload via `expo-image-manipulator`
- [ ] **8.2** Compress to JPEG quality 0.8
- [ ] **8.3** Use thumbnails for list view
- [ ] **8.4** Use `expo-image` for efficient caching
- [ ] **8.5** Loading placeholders/skeletons

### Phase 9: UI Polish

- [ ] **9.1** Set up NativeWind or `theme.ts` with design tokens
- [ ] **9.2** Haptic feedback via `expo-haptics`
- [ ] **9.3** Screen transition animations
- [ ] **9.4** Toast/snackbar notifications
- [ ] **9.5** Minimum 44x44pt touch targets
- [ ] **9.6** Android back button handling
- [ ] **9.7** Splash screen via `expo-splash-screen`
- [ ] **9.8** App icon
- [ ] **9.9** Dark mode support (optional)

### Phase 10: Error Handling

- [ ] **10.1** Camera permission denied — settings redirect screen
- [ ] **10.2** Storage permissions (Android 13+ scoped storage)
- [ ] **10.3** API unreachable — clear error with retry
- [ ] **10.4** Upload timeout handling on slow connections
- [ ] **10.5** Out-of-memory for large images
- [ ] **10.6** Global `ErrorBoundary` component

### Phase 11: Testing

- [ ] **11.1** Set up Jest + React Native Testing Library
- [ ] **11.2** Unit test shared API client
- [ ] **11.3** Unit test offline queue + sync manager
- [ ] **11.4** Component tests: Dashboard, ReceiptDetail, Camera screens
- [ ] **11.5** Integration test: upload flow (Camera to Detail)
- [ ] **11.6** Integration test: edit + save receipt
- [ ] **11.7** E2E with Maestro (optional but recommended)

### Phase 12: Backend Deployment

- [ ] **12.1** Update CORS for mobile requests
- [ ] **12.2** Deploy Express API (Railway, Render, or Fly.io)
- [ ] **12.3** Set up managed PostgreSQL
- [ ] **12.4** Run `prisma migrate deploy` on production DB
- [ ] **12.5** Configure production env vars (`DATABASE_URL`, `OCR_PROVIDER=google-vision`, etc.)
- [ ] **12.6** Switch uploads from local `uploads/` to cloud storage (GCS, S3, or R2) — local filesystem doesn't work on ephemeral cloud containers
- [ ] **12.7** Add rate limiting (`express-rate-limit`)
- [ ] **12.8** Add JWT authentication (User model already exists in schema)
- [ ] **12.9** Set up health check monitoring

### Phase 13: Build & Play Store Release

- [ ] **13.1** Install EAS CLI, run `eas build:configure`
- [ ] **13.2** Configure build profiles: development, preview, production
- [ ] **13.3** Set up Android signing (let EAS manage keystore)
- [ ] **13.4** Build & test dev APK on physical device
- [ ] **13.5** Build preview AAB, test via internal distribution
- [ ] **13.6** Create Google Play Console account ($25 fee)
- [ ] **13.7** Create app listing: name, description, screenshots, privacy policy
- [ ] **13.8** Build production AAB: `eas build --platform android --profile production`
- [ ] **13.9** Submit: `eas submit --platform android`
- [ ] **13.10** Set up EAS Update for OTA JS bundle updates

### Phase 14: Post-Launch

- [ ] **14.1** Crash reporting: `sentry-expo`
- [ ] **14.2** Analytics: Firebase or PostHog
- [ ] **14.3** Monitor mobile-specific issues (slow uploads, large payloads)
- [ ] **14.4** Consider on-device receipt edge detection/cropping for better OCR accuracy
