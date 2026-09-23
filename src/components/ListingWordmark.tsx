import { Merriweather } from "next/font/google";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700"] });

type Brand = { bg: string; text: string; accent: string };

// Defaults = IPD look. Add per-attorney overrides by slug.
const DEFAULT_BRAND: Brand = { bg: "#0f1f4b", text: "#ffffff", accent: "#c9a24d" };

const BRAND_OVERRIDES: Record<string, Brand> = {
  "john-farrell-attorney-at-law-oak-lawn": {
    bg: "#16275a",
    text: "#ffffff",
    accent: "#b8995a",
  },
};

export default function ListingWordmark({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const b = BRAND_OVERRIDES[slug] ?? DEFAULT_BRAND;
  return (
    <div
      style={{
        background: b.bg,
        minHeight: 134,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "24px 16px",
        textAlign: "center",
      }}
      role="img"
      aria-label={label}
    >
      <span
        className={merriweather.className}
        style={{ color: b.text, fontSize: 28, lineHeight: 1.2 }}
      >
        {label}
      </span>
      <span style={{ width: 48, height: 2, background: b.accent }} />
    </div>
  );
}
