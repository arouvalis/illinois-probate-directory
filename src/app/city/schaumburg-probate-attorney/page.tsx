import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "schaumburg-probate-attorney",
  city: "Schaumburg",
  counties: ["Cook"],
  title: "Probate Attorneys in Schaumburg, IL",
  description:
    "Probate attorneys in and near Schaumburg, with phone numbers and ratings. Schaumburg estates are filed with the Cook County court at the Daley Center in Chicago.",
  intro:
    "Schaumburg is in Cook County, so a Schaumburg estate is filed with the Probate Division at the Richard J. Daley Center in Chicago. This page lists offices in Schaumburg first, then offices in the neighboring northwest suburbs.",
  nearbyTowns: ["Hoffman Estates", "Rolling Meadows", "Roselle", "Palatine", "Arlington Heights"],
  seeAlso: [
    { title: "Probate Attorneys in Rolling Meadows", href: "/city/rolling-meadows-probate-attorney" },
    { title: "Probate Attorneys in Barrington", href: "/city/barrington-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function SchaumburgProbatePage() {
  return <CityPage config={config} />;
}
