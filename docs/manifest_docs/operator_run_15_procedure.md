# Manifest 956 — #15 Operator Run Procedure (V0 sign-off gate)

**Goal:** the formal V0 acceptance test. A warehouse operator scans **20 real
packages**; the product passes if **≥18 of 20 get the correct tracking number**
(read against the physical label). This is the last gate before V0 is signed off
(everything upstream — capture, barcode/OCR, dup detection, review queue — is
shipped and merged; see `Manifest_956_V0_Timeline.md`).

Capture quality is already validated on-device (7/7 unique packages at 0.95 +
create-time duplicate soft-block, 2026-06-23). What remains is a **full 20-package
statistical run** for the official number.

---

## Before the run

1. **Warm the API.** forwarding-api is on Render free tier — the first request
   after idle cold-starts for ~30s. Trigger the warmup workflow
   (`.github/workflows/warmup.yml` → *Run workflow*), or just hit
   `https://manifest-956-api.onrender.com/api/health` from a browser a minute
   before starting. Business-hours cron already pings every 10 min.
2. **Fresh device login** on the Manifest 956 app, on cell signal (not WiFi) if
   you want to exercise the real field path.
3. **Note the start time (UTC)** — you'll use it to select exactly this run's
   rows when scoring. Or just plan to score the last 20 documents.
4. **Capture technique:** fill the camera frame with the label so the tracking
   barcode is large enough to decode. A label shot from a distance risks the
   0.6/needs_review OCR fallback (mitigated by the upscale-retry, but avoid it).

## During the run

- Scan 20 distinct packages (distinct tracking numbers — repeats trip the
  duplicate soft-block by design and won't count as clean).
- Note any package where the app shows the wrong number or drops to
  needs_review, so the observer can mark it later.

## After the run — score it

From `apps/forwarding-api` (reads `DATABASE_URL` from `.env`, **read-only** on
the DB):

```bash
# 1. Generate the scorecard + fillable run sheet (last 20 docs by default)
npm run score:run
#    or select an exact window:
npm run score:run -- --since=2026-07-02T13:00:00Z
```

This prints an **automated scorecard** (status / carrier / confidence breakdown,
duplicate flags, an "auto-clean" proxy count of processed rows ≥0.9 with a
tracking number) and writes `operator-run-<date>.csv`.

The DB can't know whether a decoded number is the *correct* one for the label —
only the operator can. So:

```
# 2. Open operator-run-<date>.csv, and for each row put Y or N in the
#    "correct (Y/N)" column (compare tracking_number to the physical label).
#    Add a reason in "notes" for any N.

# 3. Compute the real gate:
npm run score:run -- --verify=operator-run-<date>.csv
```

Verdicts:
- **PASS ✅** — ≥18 Y out of 20 scored.
- **FAIL ❌** — below 18/20.
- **INCOMPLETE** — unmarked rows remain (fill them first).
- **INCONCLUSIVE** — fewer than 20 rows scored.

## Selection flags (`npm run score:run -- ...`)

| Flag | Meaning |
|------|---------|
| `--last=N` | most recent N docs by createdAt (default 20) |
| `--since=<ISO>` / `--until=<ISO>` | createdAt window in UTC (overrides `--last`) |
| `--org=<id>` | restrict to an org (auto-detects the only org with docs otherwise) |
| `--csv=<path>` | run-sheet output path |
| `--verify=<path>` | score a filled-in sheet instead of generating one |

Generated `operator-run-*.csv` files are gitignored — they're local artifacts.

## Recording the result

Once you have a PASS/FAIL, update:
- `docs/manifest_docs/Manifest_956_V0_Timeline.md` row #15
- the `manifest-956-v0-phase-5-progress` memory (the #15 gate status)
