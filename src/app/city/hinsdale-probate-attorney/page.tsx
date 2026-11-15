import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "hinsdale-probate-attorney",
  city: "Hinsdale",
  counties: ["DuPage", "Cook"],
  title: "Probate Attorneys in Hinsdale, IL",
  description:
    "Probate attorneys in and near Hinsdale, with phone numbers and ratings. Hinsdale spans DuPage and Cook counties; see which court handles the estate.",
  intro:
    "Hinsdale lies mostly in DuPage County, with its eastern edge in Cook County. Which court handles an estate depends on the side of the county line the person lived on. This page lists offices in Hinsdale first, then offices in the neighboring towns.",
  nearbyTowns: ["Burr Ridge", "Oak Brook", "Oakbrook Terrace", "Western Springs", "La Grange", "Willowbrook", "Darien", "Downers Grove"],
  seeAlso: [
    { title: "Probate Attorneys in Burr Ridge", href: "/city/burr-ridge-probate-attorney" },
    { title: "Probate Attorneys in Naperville", href: "/city/naperville-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function HinsdaleProbatePage() {
  return <CityPage config={config} />;
}
