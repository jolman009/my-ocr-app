# Receipt Radar Navigation And UX Phase Plan

Last updated: March 22, 2026

## Current Screen Mapping

This map distinguishes between:

- `dedicated page`: its own route or clearly separated product surface
- `embedded screen`: implemented as a section inside another page
- `not implemented`: described in the spec but not yet built

| Screen spec item | Current state | Where it lives now | Notes |
|---|---|---|---|
| 1. Public Landing Page | dedicated page | `"/"` | Implemented |
| 2. Sign-In / Sign-Up | dedicated page | `"/auth"` | Implemented |
| 3. Onboarding - Profile Intent | not implemented | n/a | No dedicated onboarding flow yet |
| 4. Onboarding - Export Template Setup | embedded screen | dashboard export template section | Functionality exists, but not as onboarding |
| 5. Dashboard / Receipt Inbox | dedicated page | `"/app"` | Implemented |
| 6. Receipt Capture | embedded screen | dashboard uploader section | Not a dedicated task-focused surface yet |
| 7. OCR Processing State | embedded screen | uploader processing component | Present, but inline rather than a full flow state |
| 8. Receipt Review | dedicated page | `"/app/receipts/:id"` | Implemented |
| 9. Export Builder | embedded screen | dashboard export template + export controls | Partial implementation |
| 10. Export History | embedded screen | dashboard history panel | Lightweight implementation |
| 11. Settings / Billing | not implemented | n/a | No dedicated settings surface yet |

## Reality Check

The app is not just a single page, but the core working experience is still too concentrated inside the dashboard.

Right now the dashboard is doing too many jobs:

- inbox
- upload / capture
- export template setup
- export initiation
- export history

That is acceptable for an MVP, but it makes the product feel more like an admin workbench than a focused freelancer workflow.

## Best Next UX Phase

The next UX phase should split the core working flow into distinct product surfaces:

1. dedicated `Capture` screen
2. dedicated `Export` screen
3. dedicated `Settings` screen

This is the best next move because it improves:

- task clarity
- mobile navigation
- future monetization surfaces
- onboarding path design
- long-term product structure

## Recommended Navigation Structure

### Web

Primary navigation:

- `Home`
- `Capture`
- `Exports`
- `Settings`

Supporting routes:

- `Landing`
- `Auth`
- `Receipt Review`
- `Privacy`

Recommended route structure:

- `"/"` -> public landing page
- `"/auth"` -> auth flow
- `"/app"` -> receipt inbox / workspace home
- `"/app/capture"` -> dedicated capture flow
- `"/app/receipts/:id"` -> receipt review
- `"/app/exports"` -> export builder + export history
- `"/app/settings"` -> account, plan, defaults, preferences
- `"/privacy"` -> privacy page

### Mobile

Bottom navigation:

- `Home`
- `Capture`
- `Exports`
- `Settings`

Recommended mobile emphasis:

- `Home`: recent receipts and quick status
- `Capture`: camera-first flow
- `Exports`: template selection and recent export runs
- `Settings`: account, plan, defaults

### Why this structure is best

- `Capture` becomes a focused action rather than a dashboard block
- `Exports` groups templates and history in one monetizable area
- `Settings` creates a natural home for plan state and future billing
- `Home` remains lightweight and operational, not overloaded

## Proposed Role Of Each Surface

### Home

Purpose:

- recent receipts
- filters
- quick status
- jump-off point into review

Should contain:

- small recent receipt list
- status chips
- quick link to capture
- quick link to exports

Should not contain:

- full export builder
- full template editor
- full settings

### Capture

Purpose:

- focused ingestion flow

Should contain:

- drag-and-drop upload
- file picker
- mobile camera capture
- supported file-type hints
- OCR processing state
- upload success transition to review screen

Should not contain:

- receipt table
- export history
- broad dashboard controls

### Exports

Purpose:

- own the output side of the product

Should contain:

- template selection
- template creation / editing
- export buttons
- filtered export options
- recent export history

Should not contain:

- uploader
- receipt capture UI

### Settings

Purpose:

- account and commercial state

Should contain:

- account details
- current plan
- scan usage
- default export settings
- later: billing and upgrade controls

Should not contain:

- daily working receipt actions

## TODO Checklist For The Best Next UX Phase

### Phase 1: Navigation and routing foundation

- [ ] Add app sub-routes for `"/app/capture"`, `"/app/exports"`, and `"/app/settings"`
- [ ] Update the workspace shell header to include links to `Home`, `Capture`, `Exports`, and `Settings`
- [ ] Ensure mobile/responsive navigation adapts cleanly for the new route structure
- [ ] Keep `"/app/receipts/:id"` as the dedicated review route

### Phase 2: Dedicated Capture screen

- [ ] Create a new `CapturePage` component
- [ ] Move the existing upload block out of the dashboard into the new capture page
- [ ] Move OCR processing state into the capture flow so it feels like part of one dedicated task
- [ ] Add quality guidance copy for supported receipt image formats
- [ ] Redirect to the receipt review page after a successful upload
- [ ] Leave a lightweight “Go to Capture” CTA on the dashboard instead of the full uploader block

### Phase 3: Dedicated Exports screen

- [ ] Create a new `ExportsPage` component
- [ ] Move template management into the exports page
- [ ] Move export history into the exports page
- [ ] Keep template selection and export action together on the same surface
- [ ] Add a compact export summary area showing how many receipts match current filters
- [ ] Add a simple empty state explaining why templates matter for freelancers
- [ ] Replace the dashboard export controls with a lightweight “Go to Exports” CTA or compact quick-export bar

### Phase 4: Dedicated Settings screen

- [ ] Create a new `SettingsPage` component
- [ ] Add account summary section
- [ ] Add current plan / plan preview section
- [ ] Add scan-usage summary placeholder
- [ ] Add default export template selector
- [ ] Add default date / amount formatting preferences if useful
- [ ] Reserve space for future billing actions without pretending billing is live before it is

### Phase 5: Dashboard simplification

- [ ] Remove the full uploader from the dashboard
- [ ] Remove the full export template manager from the dashboard
- [ ] Remove the full export history panel from the dashboard
- [ ] Keep the dashboard focused on receipt inbox, quick filters, and recent activity
- [ ] Add clear shortcuts from dashboard to `Capture`, `Exports`, and `Settings`

### Phase 6: UX polish and transitions

- [ ] Add stronger visual distinction between working surfaces so each screen feels intentional
- [ ] Improve transitions from `Capture -> Review`
- [ ] Improve transitions from `Home -> Exports`
- [ ] Add empty states for no receipts, no templates, and no export history
- [ ] Verify responsive behavior for desktop and mobile widths

### Phase 7: Product consistency checks

- [ ] Update `screen-spec.md` to reflect which screens are now dedicated surfaces versus embedded flows
- [ ] Update any marketing/product copy that still implies a one-surface dashboard experience
- [ ] Verify auth redirects land users on the correct app surface
- [ ] Verify route guards still protect all app routes

## Recommended Build Order

The cleanest execution sequence is:

1. routing and nav shell
2. dedicated capture page
3. dedicated exports page
4. dedicated settings page
5. dashboard simplification
6. responsive polish

## Success Criteria

The phase is complete when:

- `Capture` feels like a distinct task flow
- `Exports` feels like a reusable output workspace
- `Settings` exists as a real product surface
- the dashboard is no longer overloaded
- the app feels structured like a product, not a single multi-purpose control panel
