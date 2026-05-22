import { HeroKPIs } from "@/components/HeroKPIs";
import { Timeline } from "@/components/Timeline";
import { ExperimentTable } from "@/components/ExperimentTable";
import { LiveCommits } from "@/components/LiveCommits";
import { LivePostHog } from "@/components/LivePostHog";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";

function Section({
	children,
}: {
	children: React.ReactNode;
}) {
	return <section className="mt-10 animate-fade-in">{children}</section>;
}

export default function App() {
	return (
		<div className="min-h-screen">
			{/* Dashboard top bar — looks like a PostHog project header */}
			<header className="border-b-2 border-border bg-card">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-2">
						<span className="text-xl">🦔</span>
						<span className="font-mono text-sm font-bold uppercase tracking-wider">
							Batsirai OS
						</span>
						<span className="hidden font-mono text-xs text-muted-foreground sm:inline">
							/ Career analytics
						</span>
					</div>
					<div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
						<span className="size-2 animate-pulse rounded-full bg-ph-green" />
						live
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 pb-16">
				<div className="mt-8 max-w-2xl">
					<h1 className="font-mono text-2xl font-bold leading-tight sm:text-3xl">
						A resume is the wrong artifact for an analytics company.
					</h1>
					<p className="mt-2 text-base text-muted-foreground">
						So here's my career as a live dashboard — the kind you might open
						in your own PostHog. Built by Batsirai Chada for the Technical
						Ex-Founder role.
					</p>
				</div>

				<Section>
					<SectionHeader index="01" title="Hero KPIs" subtitle="all-time" />
					<HeroKPIs />
				</Section>

				<Section>
					<SectionHeader
						index="02"
						title="Builder Timeline"
						subtitle="2010 → present"
					/>
					<Timeline />
				</Section>

				<Section>
					<SectionHeader
						index="03"
						title="Experiment Scoreboard"
						subtitle="hypothesis → outcome → learning"
					/>
					<ExperimentTable />
				</Section>

				<Section>
					<SectionHeader
						index="04"
						title="Currently Building"
						subtitle="live from GitHub"
					/>
					<LiveCommits />
				</Section>

				<Section>
					<SectionHeader
						index="05"
						title="Live PostHog Loop"
						subtitle="this page, watching itself"
					/>
					<LivePostHog />
				</Section>

				<Footer />
			</main>
		</div>
	);
}
