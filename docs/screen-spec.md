# Receipt Radar Screen-by-Screen Product Spec

## Product Frame

- Positioning: freelancer bookkeeping assistant with a consumer-simple UX
- Core promise: capture receipts, verify header fields, and export clean records in the user's preferred spreadsheet format
- Core audience: solo freelancers and one-person businesses
- Platforms: web first with aligned iOS and Android flows
- OCR scope: best-effort extraction optimized for header fields only

## Primary User Journey

1. Discover the product on the public landing page
2. Create an account or start a trial
3. Set up a preferred export format
4. Upload or capture receipts
5. Review and correct extracted fields
6. Search, filter, and export receipt data
7. Return monthly or at tax time for repeat exports

## Screen 1: Public Landing Page

- Goal: explain the value in one glance and convert visitors into free users
- Audience moment: freelancers comparing this against manual spreadsheets or broader expense tools
- Core content:
  - headline focused on clean, export-ready receipt records
  - short explanation of the workflow
  - pricing entry point
  - export template differentiation
  - clear path into the app
- Primary CTA: start free
- Secondary CTA: open the app workspace or view sample export

## Screen 2: Sign-In / Sign-Up

- Goal: reduce friction for self-serve acquisition
- Core content:
  - email sign-in
  - Google and Apple sign-in if supported
  - short explanation of what the free tier includes
- Notes:
  - keep this minimal
  - avoid business-team language

## Screen 3: Onboarding - Profile Intent

- Goal: tailor defaults without a long setup flow
- Questions:
  - what best describes your work
  - what you need exports for
  - which output format you prefer first
- Outcome:
  - prefill categories and export defaults

## Screen 4: Onboarding - Export Template Setup

- Goal: establish the product's key differentiator early
- Core actions:
  - choose CSV or XLSX
  - select columns
  - rename headers
  - choose date and currency formats
  - save a default template
- Notes:
  - users should understand that exports are customizable before they scan anything

## Screen 5: Dashboard / Receipt Inbox

- Goal: serve as the main working surface after onboarding
- Core content:
  - quick filters for vendor and processing status
  - receipt table
  - quick status and workflow shortcuts
  - links into Capture, Exports, and Settings
- Primary action: open the next focused workflow
- Secondary action: review receipts that need attention

## Screen 6: Receipt Capture

- Goal: make ingestion fast on desktop and mobile
- Inputs:
  - drag-and-drop upload
  - file picker
  - mobile camera capture
- Notes:
  - support image and PDF uploads
  - show basic quality hints before processing

## Screen 7: OCR Processing State

- Goal: keep the system understandable while OCR runs
- States:
  - queued
  - processing
  - needs review
  - failed
- Notes:
  - explain clearly when manual review is required
  - never imply guaranteed accuracy

## Screen 8: Receipt Review

- Goal: let the user validate and correct extracted header fields quickly
- Fields:
  - vendor
  - date
  - subtotal
  - tax
  - total
  - currency
  - category
  - notes or tags
- Interaction:
  - highlight low-confidence fields
  - show original image beside the form where possible
  - allow saving corrections without friction

## Screen 9: Export Builder

- Goal: turn corrected receipt data into a reusable output
- Core actions:
  - choose saved template
  - create a new template
  - export current filters from the dedicated Exports surface
  - export date range
- Template options:
  - column inclusion
  - column order
  - header labels
  - date format
  - amount formatting
- Notes:
  - this now lives as its own working surface rather than a dashboard utility block

## Screen 10: Export History

- Goal: reinforce reliability for recurring use cases like bookkeeping and taxes
- Core content:
  - recent exports
  - template used
  - record count
  - download again
- Notes:
  - especially important for paid users
  - now lives alongside the export builder on the Exports screen

## Screen 11: Settings / Billing

- Goal: support self-serve plan upgrades and account management
- Core content:
  - plan details
  - scan usage
  - extra scan purchase if offered
  - default export settings
  - account preferences

## Mobile Notes

- Mobile should emphasize:
  - capture
  - quick review
  - recent exports
- Navigation should stay shallow:
  - Home
  - Capture
  - Exports
  - Settings

## Implementation Status

| Screen | Route | Status |
|---|---|---|
| 1. Public Landing Page | `/` | Dedicated page |
| 2. Sign-In / Sign-Up | `/auth` | Dedicated page (includes forgot password flow) |
| 3. Onboarding - Profile Intent | — | Not implemented (future) |
| 4. Onboarding - Export Template Setup | — | Not implemented (future; functionality exists in Exports) |
| 5. Dashboard / Receipt Inbox | `/app` | Dedicated page |
| 6. Receipt Capture | `/app/capture` | Dedicated page |
| 7. OCR Processing State | `/app/capture` | Embedded in Capture page |
| 8. Receipt Review | `/app/receipts/:id` | Dedicated page |
| 9. Export Builder | `/app/exports` | Dedicated page |
| 10. Export History | `/app/exports` | Embedded in Exports page |
| 11. Settings / Billing | `/app/settings` | Dedicated page |

Additional routes:
- `/privacy` — Privacy policy (public, no auth required)
- `/auth/reset-password` — Password reset (public, token-based)

## Release Priorities

### V1 — Complete

- [x] landing page
- [x] sign-up with plan selection
- [x] dedicated home, capture, exports, and settings surfaces
- [x] receipt upload and OCR
- [x] header-field review with confidence indicators
- [x] CSV/XLSX export with template support
- [x] saved export templates (localStorage)
- [x] export history
- [x] password reset via email (Resend)
- [x] privacy policy page

### V1.1

- unlimited templates on paid tier
- vendor memory
- auto-categorization suggestions
- bulk upload
- onboarding flow (profile intent + export template setup)

### Later

- natural-language search
- tax-season summary packs
- accounting integrations
- line-item extraction
- teams, approvals, reimbursements
