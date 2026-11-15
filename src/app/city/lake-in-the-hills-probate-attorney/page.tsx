import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "lake-in-the-hills-probate-attorney",
  city: "Lake in the Hills",
  counties: ["McHenry"],
  title: "Probate Attorneys in Lake in the Hills, IL",
  description:
    "Probate and living trust attorneys in and near Lake in the Hills, with phone numbers and ratings. McHenry County estates are filed in Woodstock.",
  intro:
    "Lake in the Hills is in McHenry County, so an estate is filed at the McHenry County Courthouse in Woodstock. This page lists offices in Lake in the Hills first, then offices in the neighboring towns.",
  nearbyTowns: ["Algonquin", "Huntley", "Cary"],
  seeAlso: [
    { title: "Probate Attorneys in Crystal Lake", href: "/city/crystal-lake-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function LakeInTheHillsProbatePage() {
  return <CityPage config={config} />;
}
