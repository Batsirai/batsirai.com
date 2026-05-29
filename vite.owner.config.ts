import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The Owner.com application page is served under batsirai.com/owner. Build output
// lands in dist/owner so the Worker's static-asset paths line up with the URL.
// Mirrors vite.config.ts (the /posthog build) but with the owner.html entry.
export default defineConfig({
	root: "web",
	base: "/owner/",
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "web/src"),
		},
	},
	build: {
		outDir: path.resolve(__dirname, "dist/owner"),
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, "web/owner.html"),
		},
	},
});
