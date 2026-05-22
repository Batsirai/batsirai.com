import kpis from "@/data/kpis.json";
import { Card } from "@/components/ui/card";
import { track } from "@/lib/posthog";

export function HeroKPIs() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{kpis.map((kpi) => (
				<Card
					key={kpi.label}
					onMouseEnter={() => track("kpi_hovered", { label: kpi.label })}
					className="flex flex-col p-4 transition-transform hover:-translate-y-0.5"
				>
					<span className="font-mono text-4xl font-bold leading-none tracking-tight lg:text-5xl">
						{kpi.value}
					</span>
					<span className="mt-3 text-sm font-semibold">{kpi.label}</span>
					<span className="mt-1 text-xs leading-snug text-muted-foreground">
						{kpi.methodology}
					</span>
				</Card>
			))}
		</div>
	);
}
