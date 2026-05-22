import { useEffect, useRef } from "react";
import experiments from "@/data/experiments.json";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { track } from "@/lib/posthog";

export function ExperimentTable() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					track("experiment_viewed");
					observer.disconnect();
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className="border-2 border-border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[22%]">Experiment</TableHead>
						<TableHead className="w-[26%]">Hypothesis</TableHead>
						<TableHead className="w-[26%]">Outcome</TableHead>
						<TableHead className="w-[26%]">Learning</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{experiments.map((e, i) => (
						<TableRow
							key={e.experiment}
							className={i % 2 === 1 ? "bg-muted" : undefined}
						>
							<TableCell className="font-semibold">{e.experiment}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{e.hypothesis}
							</TableCell>
							<TableCell className="font-mono text-sm font-semibold text-ph-red">
								{e.outcome}
							</TableCell>
							<TableCell className="text-sm">{e.learning}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
