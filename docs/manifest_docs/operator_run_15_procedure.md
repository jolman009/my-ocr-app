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

## Operator — on-device steps

These are the exact taps on the Manifest 956 app (screens: Home → Scan a
package → SCAN COMPLETE → optional Review Queue).

### Before you start
1. **Wake the server.** The API sleeps after idle and takes ~30s to wake. A
   minute before starting, open
   `https://manifest-956-api.onrender.com/api/health` in any browser (or trigger
   the GitHub `warmup` workflow). The first scan otherwise hangs ~30s.
2. **Open the app** (the dev build is already installed) and **sign in**. Use
   cell data, not WiFi, for real field conditions.
3. On **Home** ("MANIFEST 956" + your name), confirm the workspace card loaded
   (not stuck on "Setting up…").
4. **Gather 20 packages with distinct labels.** Don't scan the same tracking
   number twice — repeats are intentionally flagged as duplicates and won't
   count toward the 20.

### Scan loop — repeat for each of the 20 packages
1. Tap **"Scan a package" → "Open scanner"** (the orange card).
2. **Fill the camera frame with the shipping label** so the tracking barcode is
   large and in focus, then capture. A label shot from a distance can fall back
   to low-confidence OCR.
3. On the **"SCAN COMPLETE"** screen, check the three rows:
   - **Confidence: High (green, ≥90%)** with a tracking number at the top → clean.
   - **Medium (amber) / Low (red)**, **"No tracking number found"**, or a
     **"Marked for review" / "Possible duplicate"** banner → note this package.
4. **Glance-check** the big tracking number against the label to catch obvious
   mismatches early.
5. Tap **"Scan another"** to continue, or **"Done"** to return Home.

### Handling flagged scans (optional, during or after)
- The Home **Review Queue** card shows an orange badge with the flagged count.
  Tap it → tap a document → on the **Review** screen you can correct the tracking
  number and **Accept** (or **Reject** a bad capture). Every edit is logged.
- You don't have to clear the queue for the test — scoring counts what's
  *correct*, whether it came in clean or was fixed.

### What "counts"
| On SCAN COMPLETE you see | Counts as correct? |
|---|---|
| High confidence + tracking # matches label | ✅ yes |
| Flagged/low, but corrected in Review to match the label | ✅ yes (mark Y when scoring) |
| Wrong number, or unresolved / no tracking # | ❌ no |

Pass = **≥18 of the 20** end up with the correct tracking number. When 20 are
done, tell whoever's scoring **when you started** (or that it was the last 20
scans) — no further action on the phone.

---

## Observer / scoring setup

The hands-on flow is under **Operator — on-device steps** above. The observer's
only extra job is to make scoring exact:

- **Note the run start time (UTC)** so you can select precisely this run's rows
  with `--since`. If you'd rather not, just score the last 20 documents
  (`--last=20`, the default).
- Optionally jot down any package the app got wrong or dropped to needs_review,
  as a cross-check against the generated run sheet.

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
