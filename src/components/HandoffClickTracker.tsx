"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { CPS_CLICK_EVENT, CPS_UTM, PROPERTY_CLICK_EVENT, isCpsHost } from "@/lib/cps";

// Site-wide click listener for the IPD -> CPS handoff.
// - Any link to ChicagoProbateSpecialist.com fires "cps_handoff_click". If the
//   link is missing UTM tags (for example one typed into a blog post), they are
//   added before the browser follows it.
// - Any link marked data-property-placement (the "Does the estate include a
//   house?" blocks, pointing to /for-families) fires "inherited_property_click".
export default function HandoffClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      if (isCpsHost(link.hostname)) {
        const url = new URL(link.href);
        if (!url.searchParams.get("utm_source")) {
          for (const [k, v] of Object.entries(CPS_UTM)) url.searchParams.set(k, v);
          url.searchParams.set("utm_content", "untagged_link");
          link.href = url.toString();
        }
        trackEvent(CPS_CLICK_EVENT, {
          placement: url.searchParams.get("utm_content") || "untagged_link",
          link_url: url.origin + url.pathname,
          transport_type: "beacon",
        });
        return;
      }

      const placement = link.dataset.propertyPlacement;
      if (placement) trackEvent(PROPERTY_CLICK_EVENT, { placement, transport_type: "beacon" });
    };
    // "click" covers left clicks and keyboard; "auxclick" covers middle-click (open in new tab).
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, []);
  return null;
}
