import homeHtml from "./home.html";
import photo from "./photo.jpg";
import alreadyLovedCover from "./already-loved-book-cover.png";

interface Env {
	ASSETS: Fetcher;
	// PostHog personal API key with `query:read` scope. Set via
	// `wrangler secret put PH_PERSONAL_KEY`. Absent during local dev; the
	// stats endpoint then returns a pending shape and the LiveLoop widget
	// falls back to its rolling mock data.
	PH_PERSONAL_KEY?: string;
}

const PH_PROJECT_ID = 436808;
const PH_HOST = "https://us.posthog.com";
const PH_SURVEY_ID = "019e5311-0e15-0000-8fdb-1b1105559ffe";
const STATS_CACHE_MS = 30_000;

type RecentEvent = { e: string; city: string; country: string; ts: string };
type RefRow = { host: string; count: number };
type LocRow = { city: string; country: string };
type TallyRow = { answer: string; count: number };

type StatsBody = {
	status: "ok" | "pending" | "error";
	message?: string;
	live?: number;
	weekUnique?: number;
	weekEvents?: number;
	totalToday?: number;
	highIntent?: number;
	referrers?: RefRow[];
	locations?: LocRow[];
	recentEvents?: RecentEvent[];
	surveyTally?: TallyRow[];
};

let statsCache: { ts: number; body: StatsBody } | null = null;

async function hogql(query: string, key: string): Promise<unknown[]> {
	const r = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT_ID}/query/`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${key}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
	});
	if (!r.ok) throw new Error(`PostHog ${r.status}`);
	const j = (await r.json()) as { results?: unknown[] };
	return j.results ?? [];
}

async function fetchStats(env: Env): Promise<StatsBody> {
	if (!env.PH_PERSONAL_KEY) {
		return { status: "pending", message: "PH_PERSONAL_KEY not set" };
	}
	if (statsCache && Date.now() - statsCache.ts < STATS_CACHE_MS) {
		return statsCache.body;
	}
	const k = env.PH_PERSONAL_KEY;
	try {
		const [
			live,
			weekUnique,
			weekEvents,
			totalToday,
			highIntent,
			referrers,
			locations,
			recent,
			tally,
		] = await Promise.all([
			hogql(
				"SELECT count(DISTINCT distinct_id) FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 5 MINUTE",
				k,
			),
			hogql(
				"SELECT count(DISTINCT distinct_id) FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY",
				k,
			),
			hogql(
				"SELECT count() FROM events WHERE timestamp > now() - INTERVAL 7 DAY",
				k,
			),
			hogql(
				"SELECT count() FROM events WHERE timestamp > now() - INTERVAL 1 DAY",
				k,
			),
			hogql(
				"SELECT count(DISTINCT distinct_id) FROM events WHERE event IN ('milestone_expanded','kpi_clicked','outbound_link_clicked','survey_responded','venture_card_opened') AND timestamp > now() - INTERVAL 30 DAY",
				k,
			),
			hogql(
				"SELECT coalesce(properties.$referring_domain, 'direct') AS r, count() AS c FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY GROUP BY r ORDER BY c DESC LIMIT 5",
				k,
			),
			hogql(
				"SELECT DISTINCT properties.$geoip_city_name AS city, properties.$geoip_country_code AS country FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 1 DAY AND properties.$geoip_city_name != '' LIMIT 10",
				k,
			),
			hogql(
				"SELECT event AS e, coalesce(properties.$geoip_city_name, '') AS city, coalesce(properties.$geoip_country_code, '') AS country, toString(timestamp) AS ts FROM events WHERE event NOT IN ('$pageleave','$autocapture','$web_vitals') AND timestamp > now() - INTERVAL 30 MINUTE ORDER BY timestamp DESC LIMIT 8",
				k,
			),
			hogql(
				`SELECT if(event = 'survey_responded', toString(properties.answer), toString(properties.$survey_response)) AS answer, count() AS c FROM events WHERE (event = 'survey_responded') OR (event = 'survey sent' AND properties.$survey_id = '${PH_SURVEY_ID}') GROUP BY answer ORDER BY c DESC`,
				k,
			),
		]);
		const n = (rows: unknown[]) =>
			Number((rows[0] as unknown[] | undefined)?.[0] ?? 0);
		const body: StatsBody = {
			status: "ok",
			live: n(live),
			weekUnique: n(weekUnique),
			weekEvents: n(weekEvents),
			totalToday: n(totalToday),
			highIntent: n(highIntent),
			referrers: (referrers as unknown[][]).map((r) => ({
				host: String(r[0] ?? "direct"),
				count: Number(r[1] ?? 0),
			})),
			locations: (locations as unknown[][]).map((r) => ({
				city: String(r[0] ?? ""),
				country: String(r[1] ?? ""),
			})),
			recentEvents: (recent as unknown[][]).map((r) => ({
				e: String(r[0] ?? ""),
				city: String(r[1] ?? ""),
				country: String(r[2] ?? ""),
				ts: String(r[3] ?? ""),
			})),
			surveyTally: (tally as unknown[][]).map((r) => ({
				answer: String(r[0] ?? ""),
				count: Number(r[1] ?? 0),
			})),
		};
		statsCache = { ts: Date.now(), body };
		return body;
	} catch (err) {
		return { status: "error", message: (err as Error).message };
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/posthog" || url.pathname.startsWith("/posthog/")) {
			if (url.pathname === "/posthog/api/stats") {
				const body = await fetchStats(env);
				return Response.json(body, {
					headers: { "cache-control": "public, max-age=30" },
				});
			}

			// Geo + timezone for the current visitor, derived from Cloudflare's
			// per-request `cf` data (same Maxmind GeoIP that PostHog enriches
			// person profiles with — but available instantly on first hit so
			// the "we see you" moment in YourSession lands immediately).
			if (url.pathname === "/posthog/api/whereami") {
				const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
				const body = {
					city: cf?.city ?? null,
					region: cf?.region ?? null,
					regionCode: cf?.regionCode ?? null,
					country: cf?.country ?? null,
					continent: cf?.continent ?? null,
					timezone: cf?.timezone ?? null,
					postalCode: cf?.postalCode ?? null,
				};
				return Response.json(body, {
					headers: { "cache-control": "no-store" },
				});
			}

			if (url.pathname === "/posthog") {
				return Response.redirect(`${url.origin}/posthog/`, 301);
			}

			const assetResponse = await env.ASSETS.fetch(request);
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

		if (url.pathname === "/already-loved-book-cover.png") {
			return new Response(alreadyLovedCover, {
				headers: {
					"content-type": "image/png",
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
