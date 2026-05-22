import homeHtml from "./home.html";
import photo from "./photo.jpg";

interface Env {
	ASSETS: Fetcher;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Batsirai OS dashboard — static SPA built to dist/posthog.
		if (url.pathname === "/posthog" || url.pathname.startsWith("/posthog/")) {
			// API proxy for live PostHog stats (wired in phase 2).
			if (url.pathname === "/posthog/api/stats") {
				return Response.json(
					{ status: "pending", message: "live stats wire up in phase 2" },
					{ headers: { "cache-control": "no-store" } },
				);
			}

			// Bare /posthog → canonical trailing-slash index.
			if (url.pathname === "/posthog") {
				return Response.redirect(`${url.origin}/posthog/`, 301);
			}

			const assetResponse = await env.ASSETS.fetch(request);
			// SPA fallback: serve the dashboard shell for unknown sub-paths.
			if (assetResponse.status === 404) {
				return env.ASSETS.fetch(new Request(`${url.origin}/posthog/index.html`));
			}
			return assetResponse;
		}

		if (url.pathname === "/photo.jpg") {
			return new Response(photo, {
				headers: {
					"content-type": "image/jpeg",
					"cache-control": "public, max-age=86400",
				},
			});
		}

		return new Response(homeHtml, {
			headers: {
				"content-type": "text/html; charset=UTF-8",
				"cache-control": "public, max-age=3600",
			},
		});
	},
} satisfies ExportedHandler<Env>;
