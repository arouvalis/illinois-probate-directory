import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "waukegan-probate-attorney",
  city: "Waukegan",
  counties: ["Lake"],
  title: "Probate Attorneys in Waukegan, IL",
  description:
    "Probate attorneys in and near Waukegan, the Lake County seat, with phone numbers and ratings. Lake County estates are filed at the courthouse in Waukegan.",
  intro:
    "Waukegan is the Lake County seat. Every Lake County estate is filed at the Lake County Courthouse on County Street. This page lists offices in Waukegan first, then offices in the neighboring towns.",
  nearbyTowns: ["Gurnee", "Lake Bluff", "Grayslake"],
  seeAlso: [
    { title: "Probate Attorneys in Libertyville", href: "/city/libertyville-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function WaukeganProbatePage() {
  return <CityPage config={config} />;
}
