import type { Metadata } from "next";
import CityPage from "@/components/CityPage";
import { cityMetadata, type CityPageConfig } from "@/lib/cityPages";

const config: CityPageConfig = {
  slug: "chicago-probate-attorney",
  city: "Chicago",
  counties: ["Cook"],
  title: "Chicago Probate Attorneys: {N} Local Listings",
  description:
    "{N} probate attorney listings in Chicago, from the Loop to the neighborhoods, with phone numbers and Google ratings. Chicago estates are filed at the Daley Center.",
  intro:
    "Chicago estates are handled by the Probate Division of the Circuit Court of Cook County at the Richard J. Daley Center downtown. The listings below are law offices with a Chicago address, in the Loop and in the neighborhoods.",
  searchable: true,
  seeAlso: [
    { title: "Probate Attorneys in Cicero", href: "/city/cicero-probate-attorney" },
    { title: "Probate Attorneys in Northbrook", href: "/city/northbrook-probate-attorney" },
    { title: "Probate Attorneys in Orland Park", href: "/city/orland-park-probate-attorney" },
    { title: "Probate Attorneys in Palos Heights", href: "/city/palos-heights-probate-attorney" },
  ],
};

export const metadata: Metadata = cityMetadata(config);

export default function ChicagoProbatePage() {
  return <CityPage config={config} />;
}
