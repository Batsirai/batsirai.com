# batsirai.com

Personal site served by a [Cloudflare Worker](https://developers.cloudflare.com/workers/) (`batsirai-site`) on `batsirai.com` and `www.batsirai.com`.

## Structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | Worker: HTML at `/`, JPEG at `/photo.jpg` |
| `src/home.html` | Page markup and styles (edit this for copy/layout) |
| `src/photo.jpg` | Profile image |
| `wrangler.jsonc` | Worker name, routes, bundling rules |

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
