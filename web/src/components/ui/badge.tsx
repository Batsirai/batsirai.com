import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center border-2 border-border px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider",
	{
		variants: {
			variant: {
				default: "bg-card text-foreground",
				founded: "bg-ph-orange text-white border-ph-orange",
				built: "bg-ph-blue text-white border-ph-blue",
				led: "bg-ph-yellow text-foreground border-ph-yellow",
				experiment: "bg-card text-ph-red border-ph-red",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
