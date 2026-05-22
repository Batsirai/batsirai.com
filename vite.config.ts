import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The dashboard is served under batsirai.com/posthog. Build output lands in
// dist/posthog so the Worker's static-asset paths line up with the URL.
export default defineConfig({
	root: "web",
	base: "/posthog/",
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "web/src"),
		},
	},
	build: {
		outDir: path.resolve(__dirname, "dist/posthog"),
		emptyOutDir: true,
	},
});
