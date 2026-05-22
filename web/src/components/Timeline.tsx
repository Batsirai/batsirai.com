import { useState } from "react";
import milestones from "@/data/milestones.json";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/posthog";

type Variant = "founded" | "built" | "led" | "experiment";

function tagVariant(tag: string): Variant {
	const t = tag.toLowerCase();
	if (t.includes("founded")) return "founded";
	if (t.includes("led")) return "led";
	if (t.includes("experiment")) return "experiment";
	return "built";
}

export function Timeline() {
	const [open, setOpen] = useState<string | null>(null);

	return (
		<ol className="relative ml-2 border-l-2 border-border">
			{milestones.map((m) => {
				const isOpen = open === m.title;
				return (
					<li key={m.title} className="relative pb-4 pl-6 last:pb-0">
						<span className="absolute -left-[7px] top-1.5 size-3 border-2 border-border bg-ph-orange" />
						<button
							type="button"
							onClick={() => {
								const next = isOpen ? null : m.title;
								setOpen(next);
								if (next) track("milestone_expanded", { milestone: m.title });
							}}
							className="w-full cursor-pointer border-2 border-border bg-card p-3 text-left transition-transform hover:-translate-y-0.5"
						>
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-mono text-xs text-muted-foreground">
									{m.year}
								</span>
								<Badge variant={tagVariant(m.tag)}>{m.tag}</Badge>
							</div>
							<div className="mt-1 flex flex-wrap items-baseline gap-x-2">
								<span className="font-semibold">{m.title}</span>
								<span className="text-xs text-muted-foreground">{m.type}</span>
							</div>
							<div className="mt-1 font-mono text-sm text-ph-red">
								{m.impact}
							</div>
							{isOpen && (
								<p className="mt-2 border-t-2 border-border pt-2 text-sm leading-snug text-foreground animate-fade-in">
									{m.detail}
								</p>
							)}
						</button>
					</li>
				);
			})}
		</ol>
	);
}
