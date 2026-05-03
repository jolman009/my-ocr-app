 Manifest 956 — V0 Timeline
                                                                                                                                                                  
  Here's the full picture of what we've done, what's next, and what the path to a testable product looks like:

  Phase 1: Foundation (DONE)

  ┌─────┬───────────────────────────────────────────────────────────────────┬─────────────────────────────────┐
  │  #  │                               What                                │             Status              │
  ├─────┼───────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ 1   │ Prisma schema: Organization, OrganizationMember, ShipmentDocument │ ✅ Committed + migrated to prod │
  ├─────┼───────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ 2   │ apps/forwarding-api workspace scaffold                            │ ✅ Committed                    │
  ├─────┼───────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ 3   │ Bootstrap endpoint (auto-create org for user)                     │ ✅ Committed + smoke tested     │
  ├─────┼───────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ 4   │ pgBouncer / PORT / JWT fixes                                      │ ✅ Committed                    │
  └─────┴───────────────────────────────────────────────────────────────────┴─────────────────────────────────┘

  Phase 2: Core Document Pipeline (DONE)

  ┌─────┬──────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  #  │                   What                   │                                              Status / Notes                                       │
  ├─────┼──────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 5   │ Barcode service — zxing-wasm/reader      │ ✅ Committed. Decodes CODE_128/QR/DataMatrix/EAN. Prefers tracking-pattern matches over routing │
  │     │                                          │ codes (real labels carry multiple barcodes — see feedback_barcode_tracking_preference.md).      │
  ├─────┼──────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 6   │ Shipment document endpoints              │ ✅ Committed + smoke tested end-to-end with real UPS label.                                     │
  │     │                                          │ POST /forwarding/documents (upload → barcode decode → OCR fallback → save)                      │
  │     │                                          │ GET /forwarding/documents?q=<tracking> (list with substring search)                             │
  │     │                                          │ GET /forwarding/documents/:id (detail with image URL)                                           │
  ├─────┼──────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 7   │ Path mapping first real use              │ ✅ In place via @receipt-radar/api/* (used by shipmentDocumentService for OCR + image resize).  │
  └─────┴──────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────┘

  Phase 3: Mobile App (DONE)

  ┌─────┬────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┐
  │  #  │                              What                              │                                  Status / Notes                                 │
  ├─────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ 8   │ apps/forwarding-mobile Expo workspace                          │ ✅ Committed. com.jolma.manifest956 package, separate EAS config + project ID. │
  ├─────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ 9   │ Camera screen with barcode overlay                             │ ✅ Committed. expo-camera live detection (Code128/QR/DataMatrix/Code39/EAN/PDF) │
  ├─────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ 10  │ Capture flow: scan → extract tracking → confirm/correct → save │ ✅ Committed. Camera → preview → upload → ScanResult with confidence display.   │
  ├─────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ 11  │ Document list with search                                      │ ✅ Committed + live-tested. DocumentsScreen FlatList + debounced search,        │
│     │                                                                │ DocumentDetailScreen with image + OCR text. Reachable from Home.                │
  ├─────┼────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ 12  │ Auth (reuse Receipt Radar login)                               │ ✅ Committed. Same JWT, AuthProvider reused via @receipt-radar/mobile/* alias.  │
  └─────┴────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

  Phase 4: Deploy + Test with a Real Operator

  ┌─────┬────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  #  │                  What                  │                                            Status / Notes                                            │
  ├─────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 13  │ Create forwarding-api Render service   │ ✅ Live 2026-04-30 at https://manifest-956-api.onrender.com. Health passing, mobile .env wired.     │
  │     │                                        │ Cell-signal verification (off-WiFi end-to-end) is the only piece left before #15.                   │
  ├─────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 14  │ Build dev APK via EAS                  │ ✅ Built + installed 2026-04-26. Project ID 853000ca-d62e-45fa-be8e-a4fd59ab16b5.                   │
  │     │                                        │ Live device test PASSED end-to-end (camera → upload → barcode/OCR → ScanResult).                    │
  │     │                                        │ No-match path validated (receipt photo); high-confidence path with real shipping label still pending│
  ├─────┼────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 15  │ Hand the phone to a warehouse operator │ ⏳ Pending — V0 success criteria: scan 20 packages, 18 get correct tracking number.                  │
  └─────┴────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────┘

  Phase 5: V0 → MVP (after operator feedback)

  ┌─────┬───────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────┐
  │  #  │                   What                    │                                   Notes                                   │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 16  │ PDF ingestion (pdfjs-dist)                │ Shipping docs/invoices arrive as PDFs                                     │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 17  │ Document classifier                       │ Rules + OCR keywords (label / invoice / packing slip / customs / unknown) │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 18  │ Customer/account fuzzy matching (fuse.js) │ Auto-route by matching OCR'd recipient to existing customer records       │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 19  │ Review queue UI                           │ Needs-review list, editable fields, accept/correct/reject flow            │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 20  │ Audit trail                               │ Log every human edit to FieldCorrection table                             │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 21  │ Duplicate tracking detection              │ Unique constraint + soft-block on repeated tracking numbers               │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 22  │ apps/forwarding-web admin surface         │ Search, review, audit — for office managers, not warehouse floor          │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 23  │ Batch upload                              │ Multiple documents at once                                                │
  ├─────┼───────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ 24  │ Async job queue (graphile-worker)         │ Only needed when volume makes inline processing too slow                  │
  └─────┴───────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────┘

  ---
  Where you are right now (as of 2026-05-02)

  Phase 1 ████████████████████ DONE  (foundation + bootstrap)
  Phase 2 ████████████████████ DONE  (server pipeline, smoke tested with real UPS label)
  Phase 3 ████████████████████ DONE  (mobile V0 complete — capture, scan, list+search, detail)
  Phase 4 █████████████░░░░░░░ 2/3   (#13 Render deploy live, #14 dev APK device-tested; #15 operator test pending)
  Phase 5 ░░░░░░░░░░░░░░░░░░░░ after operator feedback

  Next concrete step: Phase 4 #15 — verify the dev client works off-WiFi against the Render URLs (login + scan + Documents list), then hand the phone to a warehouse operator and run the 18/20 success test.
