import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "rolling-meadows-probate-attorney",
  city: "Rolling Meadows",
  counties: ["Cook"],
  title: "Probate Attorneys in Rolling Meadows, IL",
  description:
    "Probate attorneys in and near Rolling Meadows, with phone numbers and ratings. Rolling Meadows estates are filed at the Daley Center in Chicago.",
  intro:
    "Rolling Meadows is in Cook County, so a Rolling Meadows estate is filed with the Probate Division at the Richard J. Daley Center in Chicago. This page lists offices in Rolling Meadows first, then offices in the neighboring northwest suburbs.",
  nearbyTowns: ["Schaumburg", "Palatine", "Arlington Heights", "Hoffman Estates", "Mt Prospect"],
  seeAlso: [
    { title: "Probate Attorneys in Schaumburg", href: "/city/schaumburg-probate-attorney" },
    { title: "Probate Attorneys in Barrington", href: "/city/barrington-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function RollingMeadowsProbatePage() {
  return <CityPage config={config} />;
}
