import React from "react";
import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import "./image-slot.js";
import "./batsirai-os.css";
import App from "./batsirai-os.jsx";

// Public project key — safe to ship in the client bundle (this is how PostHog works).
posthog.init("phc_r9Xuec3PqRcydfxhfJQRPsJpvvNjNphCZi2ptLYRkr8Z", {
	api_host: "https://us.i.posthog.com",
	person_profiles: "always",
	capture_pageview: true,
	capture_pageleave: true,
	autocapture: true,
	session_recording: { recordCanvas: true },
});
window.posthog = posthog;

// When feature flags load, broadcast the dashboard-theme variant so the App
// can apply it as the initial palette. Stored in a window slot so an App
// instance that mounts AFTER the flags are ready still gets the value.
posthog.onFeatureFlags(() => {
	try {
		const v = posthog.getFeatureFlag("dashboard-theme");
		if (v && ["posthog", "apple", "terminal"].includes(v)) {
			window.__ph_theme = v;
			window.dispatchEvent(new CustomEvent("ph-theme", { detail: v }));
		}
	} catch {
		/* posthog not ready yet */
	}
});

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
