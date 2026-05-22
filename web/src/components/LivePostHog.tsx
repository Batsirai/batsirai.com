import { Card } from "@/components/ui/card";

// Phase 1 placeholder. The live numbers come from the Worker /api/posthog-stats
// proxy (HogQL against the dedicated PostHog project) in phase 2. Everything
// here is clearly marked PENDING so no fabricated data ships.
function Pending() {
	return (
		<span className="border-2 border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
			pending
		</span>
	);
}

const sparkline = [3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 16];

export function LivePostHog() {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
							Live now
						</span>
						<Pending />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="size-2 animate-pulse rounded-full bg-ph-green" />
						<span className="font-mono text-4xl font-bold">—</span>
						<span className="text-sm text-muted-foreground">
							visitors in the last 5 min
						</span>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
							This week
						</span>
						<Pending />
					</div>
					<div className="mt-2 flex items-end justify-between gap-3">
						<span className="font-mono text-4xl font-bold">—</span>
						<div className="flex h-10 items-end gap-0.5">
							{sparkline.map((h, i) => (
								<div
									key={i}
									className="w-1.5 bg-ph-blue/40"
									style={{ height: `${(h / 16) * 100}%` }}
								/>
							))}
						</div>
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
							Top referrers
						</span>
						<Pending />
					</div>
					<ul className="mt-2 space-y-1 font-mono text-sm text-muted-foreground">
						<li>posthog.com</li>
						<li>linkedin.com</li>
						<li>direct</li>
					</ul>
				</Card>

				<Card className="p-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
							Recent locations
						</span>
						<Pending />
					</div>
					<div className="mt-2 flex flex-wrap gap-2">
						{["🇬🇧 London", "🇺🇸 SF", "🇩🇪 Berlin", "🇨🇦 Toronto"].map((l) => (
							<span
								key={l}
								className="border-2 border-border px-2 py-0.5 font-mono text-xs"
							>
								{l}
							</span>
						))}
					</div>
				</Card>
			</div>

			{/* 5b — PostHog Survey embed (native Surveys product wires in phase 2) */}
			<Card className="p-4">
				<div className="flex items-center justify-between">
					<span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
						Survey
					</span>
					<Pending />
				</div>
				<p className="mt-2 font-semibold">Was this more useful than a resume?</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{["Yes", "No", "Honestly weirder"].map((opt) => (
						<button
							key={opt}
							type="button"
							disabled
							className="cursor-not-allowed border-2 border-border bg-card px-3 py-1.5 text-sm font-semibold opacity-70"
						>
							{opt}
						</button>
					))}
				</div>
			</Card>
		</div>
	);
}
