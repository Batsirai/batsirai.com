import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
	return (
		<div className="w-full overflow-x-auto">
			<table
				data-slot="table"
				className={cn("w-full border-collapse text-left text-sm", className)}
				{...props}
			/>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
	return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn("border-b-2 border-border last:border-0", className)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"border-b-2 border-border px-3 py-2 font-mono text-[0.7rem] font-semibold uppercase tracking-wider align-bottom",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			data-slot="table-cell"
			className={cn("px-3 py-3 align-top", className)}
			{...props}
		/>
	);
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
