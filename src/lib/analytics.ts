// GA4 event helper. Safe to call anywhere on the client; no-op if gtag hasn't loaded.
export function trackEvent(name: string, params: Record<string, string | undefined> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag("event", name, { page_path: window.location.pathname, ...params });
}

/**
 * For events sent as soon as a page opens. GA4 loads a moment after the page,
 * so wait for it (up to 5 seconds) instead of dropping the event.
 */
export function trackEventWhenReady(name: string, params: Record<string, string | undefined> = {}, triesLeft = 20) {
  if (typeof window === "undefined") return;
  if ((window as unknown as { gtag?: unknown }).gtag) return trackEvent(name, params);
  if (triesLeft > 0) window.setTimeout(() => trackEventWhenReady(name, params, triesLeft - 1), 250);
}
