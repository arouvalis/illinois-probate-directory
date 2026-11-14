import Link from "next/link";
import { cpsUrl } from "@/lib/cps";

// The one short "Does the estate include a house?" block used on county pages,
// city pages, articles and the selling guide. Plain links, so it works inside
// server-rendered pages; clicks are tracked by HandoffClickTracker.
// placement: where the block sits, e.g. "county_cook" or "blog_post".
export default function EstateHouseBlock({
  placement,
  className = "",
}: {
  placement: string;
  className?: string;
}) {
  return (
    <aside
      aria-label="Inherited property"
      className={`not-prose bg-navy-50 border border-navy-200 rounded-lg p-5 ${className}`}
    >
      <h2 className="font-serif font-bold text-navy-800 text-lg mb-1.5">
        Does the estate include a house?
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">
        A house in probate has to be insured, looked after and often sold.{" "}
        <Link
          href="/for-families"
          data-property-placement={placement}
          className="text-navy-700 font-semibold underline hover:text-navy-900"
        >
          What happens to a house during Illinois probate
        </Link>
        . For real estate help, the publisher of this directory also runs{" "}
        <a
          href={cpsUrl(placement)}
          target="_blank"
          rel="noopener"
          className="text-navy-700 font-semibold underline hover:text-navy-900"
        >
          Chicago Probate Specialist
        </a>
        , a real estate brokerage service (not a law firm).
      </p>
    </aside>
  );
}

// Attorney pages only: a single low-key line, no service list, no CPS link.
export function EstateHouseLine({
  placement,
  className = "",
}: {
  placement: string;
  className?: string;
}) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      Does the estate include a house?{" "}
      <Link
        href="/for-families"
        data-property-placement={placement}
        className="underline hover:text-navy-800"
      >
        See what happens to a house during Illinois probate
      </Link>
      .
    </p>
  );
}
