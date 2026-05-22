type Props = {
	index: string;
	title: string;
	subtitle?: string;
};

export function SectionHeader({ index, title, subtitle }: Props) {
	return (
		<div className="mb-4 flex items-baseline gap-3 border-b-2 border-border pb-2">
			<span className="font-mono text-xs font-semibold text-ph-orange">
				{index}
			</span>
			<h2 className="font-mono text-sm font-semibold uppercase tracking-wider">
				{title}
			</h2>
			{subtitle && (
				<span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:block">
					{subtitle}
				</span>
			)}
		</div>
	);
}
