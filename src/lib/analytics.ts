// GA4 event helper. Safe to call anywhere on the client; no-op if gtag hasn't loaded.
export function trackEvent(name: string, params: Record<string, string | undefined> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag("event", name, { page_path: window.location.pathname, ...params });
}
