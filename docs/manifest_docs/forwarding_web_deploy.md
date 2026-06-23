# Manifest 956 admin web (`apps/forwarding-web`) — Vercel deploy

The Manifest 956 office-manager admin (search / review / audit) is a separate
Vite SPA from Receipt Radar web. Vercel serves one output directory per project,
so it needs its **own Vercel project** pointing at this same GitHub repo — it
cannot share the Receipt Radar URL.

The repo root `vercel.json` is hardwired to build Receipt Radar
(`--workspace web` → `apps/web/dist`). To avoid that config applying here, this
project sets its **Root Directory to `apps/forwarding-web`**, so Vercel reads
`apps/forwarding-web/vercel.json` instead of the root one. The Receipt Radar
project (Root Directory = repo root) is unaffected.

## Vercel project settings

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| **Root Directory** | `apps/forwarding-web` |
| Include files outside root directory | **Enabled** (needed for the npm workspace + `@receipt-ocr/shared`) |
| Build / Install / Output | inherited from `apps/forwarding-web/vercel.json` (do not override in the dashboard) |

`apps/forwarding-web/vercel.json` does the workspace-aware build from the repo
root (`cd ../.. && npm run build --workspace forwarding-web`, which also builds
`@receipt-ocr/shared`) and serves `apps/forwarding-web/dist` with an SPA
rewrite. Verified locally: `npm run build --workspace forwarding-web` succeeds.

## Environment variables (set in the new Vercel project)

`apps/forwarding-web` reads two `VITE_*` vars (baked at build time):

| Var | Production value |
| --- | --- |
| `VITE_AUTH_API_URL` | `https://receipt-radar-api.onrender.com/api` |
| `VITE_FORWARDING_API_URL` | `https://manifest-956-api.onrender.com/forwarding` |

`VITE_AUTH_API_URL` is Receipt Radar's API — used **only** for login (shared JWT
across both products). All document/customer/org data goes through
`VITE_FORWARDING_API_URL` (manifest-956-api). Defaults in
`apps/forwarding-web/.env.example` are localhost for dev.

## CORS (required — do this after the URL exists)

Both backends restrict CORS to `WEB_ORIGINS`. After the first deploy gives a
URL (e.g. `https://manifest-956-admin.vercel.app`), add it to `WEB_ORIGINS` on:

- **receipt-radar-api** (Render) — login (`/api/auth/login`) is called from this origin.
- **manifest-956-api** (Render) — all forwarding-api calls come from this origin.

`WEB_ORIGINS` is comma-separated; append the new origin, don't replace. Until
this is done, login + data fetches from the deployed admin will fail CORS even
though the build is live. (Local dev origin `http://localhost:5175` is already
allowlisted.)

## First deploy

1. Create the Vercel project from the repo with the settings above.
2. Add the two env vars.
3. Deploy. Note the assigned `*.vercel.app` URL.
4. Add that URL to `WEB_ORIGINS` on both Render services and redeploy them.
5. Log in with a shared account (e.g. the `jolman009@yahoo.com` workspace owner).

## Note: monorepo split trigger

This makes `apps/forwarding-web` the third Manifest 956 instance (api + mobile +
web) with its own deploy — re-check the split triggers in the memory note
`feedback_manifest_monorepo_split_triggers` before adding more.
