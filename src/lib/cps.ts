// Links from this directory to ChicagoProbateSpecialist.com (CPS).
// Every CPS link on the site should be built with cpsUrl() so it carries the
// same UTM tags. The "placement" says where on IPD the link sits and is sent
// as utm_content, and as the "placement" parameter of the GA4 event.
export const CPS_HOST = "chicagoprobatespecialist.com";
export const CPS_BASE = "https://www.chicagoprobatespecialist.com";

export const CPS_UTM = {
  utm_source: "illinoisprobatedirectory",
  utm_medium: "referral",
  utm_campaign: "ipd_handoff",
} as const;

// GA4 event names for the handoff.
export const CPS_CLICK_EVENT = "cps_handoff_click"; // click on a link to CPS
export const PROPERTY_CLICK_EVENT = "inherited_property_click"; // click from a block to /for-families

export function cpsUrl(placement: string, path = "/"): string {
  const url = new URL(path, CPS_BASE);
  for (const [k, v] of Object.entries(CPS_UTM)) url.searchParams.set(k, v);
  url.searchParams.set("utm_content", placement);
  return url.toString();
}

export function isCpsHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === CPS_HOST || h.endsWith("." + CPS_HOST);
}
