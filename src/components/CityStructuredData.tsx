import fs from "fs";
import path from "path";
import JsonLd from "@/components/JsonLd";
import { COUNTY_SLUGS, type Attorney } from "@/lib/attorneys";
import { SITE, extractFaqs, faqPageSchema, listingPageSchema, attorneyItemList } from "@/lib/schema";

/**
 * JSON-LD for a city page: the listing page with its attorney list, the
 * breadcrumb trail, and FAQ markup for any question headings in the town's
 * guide (src/content/city/<slug>.md).
 */
export default function CityStructuredData({
  city,
  slug,
  countySlug,
  attorneys,
  nearby = [],
}: {
  city: string;
  /** Folder name under /city, e.g. "joliet-probate-attorney". */
  slug: string;
  /** Main county, e.g. "will". */
  countySlug: string;
  attorneys: Attorney[];
  /** Listings in neighboring towns, shown in their own labelled section. */
  nearby?: Attorney[];
}) {
  const url = `${SITE}/city/${slug}`;
  const county = COUNTY_SLUGS[countySlug];
  const guide = path.join(process.cwd(), "src/content/city", `${slug}.md`);
  const faqs = fs.existsSync(guide) ? extractFaqs(fs.readFileSync(guide, "utf8")) : [];

  const schema: unknown[] = [
    listingPageSchema({
      name: `Probate Attorneys in ${city}, Illinois`,
      url,
      about: { "@type": "City", name: `${city}, Illinois` },
      attorneys,
      listName: `Probate attorney listings in ${city}, Illinois`,
    }),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: `${county} County`, item: `${SITE}/county/${countySlug}` },
        { "@type": "ListItem", position: 3, name: city, item: url },
      ],
    },
  ];
  if (nearby.length > 0) {
    schema.push({
      "@context": "https://schema.org",
      ...attorneyItemList(nearby, `Probate attorney listings in towns near ${city}, Illinois`),
    });
  }
  if (faqs.length > 0) schema.push(faqPageSchema(faqs));

  return <JsonLd data={schema} />;
}
