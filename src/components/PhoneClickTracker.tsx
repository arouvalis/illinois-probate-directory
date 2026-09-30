"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Sends a phone_click event whenever any tel: link on the site is tapped.
export default function PhoneClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (link) trackEvent("phone_click", { phone_number: link.getAttribute("href")?.slice(4) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
