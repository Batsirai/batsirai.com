import { track } from "@/lib/posthog";

const links = [
	{ label: "Resume (PDF)", href: "/posthog/resume.pdf", target: "resume" },
	{ label: "GitHub", href: "https://github.com/Batsirai", target: "github" },
	{
		label: "LinkedIn",
		href: "https://linkedin.com/in/batsirai-chada",
		target: "linkedin",
	},
	{
		label: "Source for this page",
		href: "https://github.com/Batsirai/batsirai-os",
		target: "source",
	},
	{ label: "Email", href: "mailto:batsirai@gmail.com", target: "email" },
];

export function Footer() {
	return (
		<footer className="mt-12 border-t-2 border-border pt-8">
			<div className="max-w-2xl space-y-4 text-sm leading-relaxed">
				<p>
					I built this because a resume felt like the wrong artifact for an
					analytics company. PostHog helps builders understand what users do.
					This dashboard shows what I've done as a builder — products, users,
					revenue, experiments, lessons.
				</p>
				<p className="font-semibold">It's also instrumented with PostHog. Of course it is.</p>
			</div>

			<p className="mt-6 font-mono text-xs italic text-muted-foreground">
				Every session on this page is recorded — including yours. Wave at the
				camera. 🦔
			</p>

			<div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
				{links.map((l) => (
					<a
						key={l.label}
						href={l.href}
						target={l.href.startsWith("http") ? "_blank" : undefined}
						rel="noreferrer"
						onClick={() =>
							track("outbound_link_clicked", { target: l.target })
						}
						className="font-mono text-sm font-semibold text-ph-orange underline underline-offset-2 hover:opacity-80"
					>
						{l.label}
					</a>
				))}
			</div>
		</footer>
	);
}
