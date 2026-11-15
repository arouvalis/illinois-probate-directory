import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "burr-ridge-probate-attorney",
  city: "Burr Ridge",
  counties: ["DuPage", "Cook"],
  title: "Probate Attorneys in Burr Ridge, IL",
  description:
    "Burr Ridge straddles Cook and DuPage counties. See which court handles the estate and browse probate attorneys in and near Burr Ridge.",
  intro:
    "Burr Ridge straddles DuPage and Cook counties. Which court handles an estate depends on the side of the county line the person lived on. This page lists offices in Burr Ridge first, then offices in the neighboring towns.",
  nearbyTowns: ["Hinsdale", "Willowbrook", "Darien", "Willow Springs", "Western Springs"],
  seeAlso: [
    { title: "Probate Attorneys in Hinsdale", href: "/city/hinsdale-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function BurrRidgeProbatePage() {
  return <CityPage config={config} />;
}
