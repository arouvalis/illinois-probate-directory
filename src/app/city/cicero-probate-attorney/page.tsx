import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "cicero-probate-attorney",
  city: "Cicero",
  counties: ["Cook"],
  title: "Probate Attorneys Serving Cicero, IL",
  description:
    "Probate attorneys in and near Cicero, with phone numbers and ratings. Cicero estates are filed with the Cook County court at the Daley Center.",
  intro:
    "Cicero is in Cook County, so a Cicero estate is filed with the Probate Division at the Richard J. Daley Center in Chicago. Few law offices are in Cicero itself, so this page also lists offices in the neighboring towns, shown separately below.",
  nearbyTowns: ["Berwyn", "Oak Park", "Forest Park", "Riverside", "North Riverside", "Lyons", "Brookfield"],
  seeAlso: [
    { title: "Probate Attorneys in Chicago", href: "/city/chicago-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function CiceroProbatePage() {
  return <CityPage config={config} />;
}
