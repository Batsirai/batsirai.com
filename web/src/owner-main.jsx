import React from "react";
import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import "./image-slot.js";
import "./owner-os.css";
import App from "./owner-os.jsx";

// Public project key — safe to ship in the client bundle (this is how PostHog works).
// The Owner application page is instrumented exactly like the PostHog one: the live
// funnel on the Live tab is real, not a mockup.
posthog.init("phc_r9Xuec3PqRcydfxhfJQRPsJpvvNjNphCZi2ptLYRkr8Z", {
	api_host: "https://us.i.posthog.com",
	person_profiles: "always",
	capture_pageview: true,
	capture_pageleave: true,
	autocapture: true,
	session_recording: { recordCanvas: true },
});
window.posthog = posthog;

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
