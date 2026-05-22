// Thin analytics shim. Phase 1 is static, so this is a safe no-op until the
// PostHog SDK is initialized in phase 2. Components call track() now so the
// event wiring is final and phase 2 only flips the SDK on.
declare global {
	interface Window {
		posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
	}
}

export function track(event: string, props?: Record<string, unknown>) {
	if (typeof window !== "undefined" && window.posthog) {
		window.posthog.capture(event, props);
	}
}
