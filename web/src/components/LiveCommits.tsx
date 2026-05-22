import { useEffect, useState } from "react";
import { track } from "@/lib/posthog";

// GitHub handle for the live commit feed. Confirm this is the right account
// before launch — the PRD lists "Batsirai".
const GH_USER = "Batsirai";
const CACHE_KEY = "batsirai-os:commits";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

type Commit = {
	repo: string;
	message: string;
	url: string;
	date: string;
};

function timeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 60) return `${Math.max(mins, 1)}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	return `${days}d ago`;
}

type State =
	| { status: "loading" }
	| { status: "ok"; commits: Commit[] }
	| { status: "error" };

export function LiveCommits() {
	const [state, setState] = useState<State>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;

		function fromCache(): Commit[] | null {
			try {
				const raw = localStorage.getItem(CACHE_KEY);
				if (!raw) return null;
				const { ts, commits } = JSON.parse(raw);
				if (Date.now() - ts > CACHE_TTL) return null;
				return commits;
			} catch {
				return null;
			}
		}

		const cached = fromCache();
		if (cached && cached.length > 0) {
			setState({ status: "ok", commits: cached });
			return;
		}

		fetch(`https://api.github.com/users/${GH_USER}/events/public`)
			.then((r) => {
				if (!r.ok) throw new Error(`GitHub ${r.status}`);
				return r.json();
			})
			.then((events: unknown[]) => {
				const commits: Commit[] = [];
				for (const ev of events as Array<Record<string, any>>) {
					if (ev.type !== "PushEvent") continue;
					for (const c of ev.payload?.commits ?? []) {
						commits.push({
							repo: ev.repo?.name ?? "",
							message: c.message?.split("\n")[0] ?? "",
							url: `https://github.com/${ev.repo?.name}/commit/${c.sha}`,
							date: ev.created_at,
						});
						if (commits.length >= 10) break;
					}
					if (commits.length >= 10) break;
				}
				if (cancelled) return;
				if (commits.length === 0) {
					setState({ status: "error" });
					return;
				}
				try {
					localStorage.setItem(
						CACHE_KEY,
						JSON.stringify({ ts: Date.now(), commits }),
					);
				} catch {
					/* ignore quota */
				}
				setState({ status: "ok", commits });
			})
			.catch(() => {
				if (!cancelled) setState({ status: "error" });
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (state.status === "loading") {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="h-12 animate-pulse border-2 border-border bg-muted"
					/>
				))}
			</div>
		);
	}

	if (state.status === "error") {
		return (
			<div className="border-2 border-border bg-card p-4 text-sm">
				GitHub's having a moment —{" "}
				<a
					href={`https://github.com/${GH_USER}`}
					target="_blank"
					rel="noreferrer"
					className="font-semibold text-ph-orange underline"
					onClick={() => track("outbound_link_clicked", { target: "github" })}
				>
					see commits directly →
				</a>
			</div>
		);
	}

	return (
		<ul className="divide-y-2 divide-border border-2 border-border bg-card">
			{state.commits.map((c, i) => (
				<li key={`${c.url}-${i}`}>
					<a
						href={c.url}
						target="_blank"
						rel="noreferrer"
						onClick={() =>
							track("commit_clicked", { repo: c.repo, url: c.url })
						}
						className="flex items-baseline gap-3 p-3 hover:bg-muted"
					>
						<span className="font-mono text-xs text-ph-blue shrink-0">
							{c.repo.split("/")[1] ?? c.repo}
						</span>
						<span className="flex-1 truncate text-sm">{c.message}</span>
						<span className="font-mono text-xs text-muted-foreground shrink-0">
							{timeAgo(c.date)}
						</span>
					</a>
				</li>
			))}
		</ul>
	);
}
