# batsirai.com

Personal site served by a [Cloudflare Worker](https://developers.cloudflare.com/workers/) (`batsirai-site`) on `batsirai.com` and `www.batsirai.com`.

## Structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | Worker: home page at `/`, JPEG at `/photo.jpg`, dashboard at `/posthog/*` |
| `src/home.html` | Home page markup and styles (edit this for copy/layout) |
| `src/photo.jpg` | Profile image |
| `web/` | Batsirai OS dashboard — Vite + React + Tailwind/shadcn, served at `/posthog` |
| `web/src/data/*.json` | Career data (KPIs, milestones, experiments) |
| `wrangler.jsonc` | Worker name, routes, static-asset binding |

## Batsirai OS dashboard (`batsirai.com/posthog`)

A PostHog-styled career analytics dashboard. Vite builds it into `dist/posthog`;
the Worker serves it via the `ASSETS` binding.

```bash
npm run dev:web   # Vite dev server for the dashboard alone
npm run build     # build the dashboard into dist/posthog
npm run dev       # build, then run the full Worker (home + dashboard) locally
npm run check     # typecheck Worker and dashboard
```

Live PostHog data (Section 5) and the GitHub commit feed wire up in a follow-up
pass against a dedicated PostHog project.

## Prerequisites

- Node 20+
- Cloudflare account with zone **batsirai.com** (zone ID is already set in `wrangler.jsonc`)
- API token with **Workers Scripts: Edit** and routes permission for the zone (or use `wrangler login`)

## Local dev

```bash
npm install
npm run dev
```

Open the URL Wrangler prints (often `localhost:8787`).

## Deploy

```bash
export CLOUDFLARE_API_TOKEN=...   # optional if you use `wrangler login`
npm run deploy
```

Edits to `home.html` or `photo.jpg` go live on the next deploy.

## `www` DNS

If `www.batsirai.com` does not resolve, add a **CNAME** in Cloudflare DNS for `www` pointing to `batsirai.com` (proxied), or an appropriate target for your setup—the Worker routes are already configured for both hostnames.
