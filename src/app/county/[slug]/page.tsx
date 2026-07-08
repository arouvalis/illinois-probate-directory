import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  COUNTY_SLUGS,
  getAttorneysByCounty,
  getAllAttorneys,
} from "@/lib/attorneys";
import AttorneyCard from "@/components/AttorneyCard";
import AttorneySearch from "@/components/AttorneySearch";
import Link from "next/link";
import React from "react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(COUNTY_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const county = COUNTY_SLUGS[params.slug];
  if (!county) return {};
  return {
    title: `Probate Attorneys in ${county} County, IL | Free Directory`,
    description: county === 'Cook'
      ? `Browse 240+ probate attorneys in Cook County, IL. Compare ratings, find free consultations, and connect with verified probate lawyers serving Chicago and suburbs.`
      : county === 'Will'
      ? `Browse 59 probate attorneys in Will County, IL. Find verified probate lawyers in Joliet, Naperville, and Plainfield. Compare ratings and free consultations.`
      : county === 'Lake'
      ? `Browse 70 probate attorneys in Lake County, IL. Find verified probate lawyers in Waukegan, Lake Forest, and Libertyville. Compare ratings and free consultations.`
      : county === 'Kane'
      ? `Browse 65 probate attorneys in Kane County, IL. Find verified probate lawyers in Aurora, Elgin, and St. Charles. Compare ratings and free consultations.`
      : county === 'McHenry'
      ? `Browse 70 probate attorneys in McHenry County, IL. Find verified probate lawyers in Crystal Lake, Woodstock, and McHenry. Compare ratings and free consultations.`
      : county === 'DuPage'
      ? `Browse 55 probate attorneys in DuPage County, IL. Find verified probate lawyers in Wheaton, Naperville, and Oak Brook. Compare ratings and free consultations.`
      : `Find experienced probate attorneys in ${county} County, Illinois. Compare ratings, specializations, free consultations, and more.`,
    alternates: { canonical: `https://www.illinoisprobatedirectory.com/county/${params.slug}` },
  };
}

const COUNTY_INTROS: Record<string, string> = {
  Cook: "Cook County is home to the largest probate court in Illinois, located in Chicago at the Daley Center. The court handles thousands of estate cases annually across Chicago and its suburbs.",
  Lake: "Lake County probate cases are handled at the Lake County Courthouse in Waukegan. Attorneys here serve communities from Waukegan and Gurnee to Highland Park and Lake Forest.",
  Will: "Will County probate is administered from Joliet. Attorneys in this county serve Joliet, Naperville, Plainfield, Bolingbrook, and surrounding communities.",
  Kane: "Kane County probate cases are heard in Geneva at the Kane County Courthouse. Local attorneys handle estates across Aurora, Elgin, St. Charles, Batavia, and surrounding areas.",
  McHenry: "McHenry County probate court is located in Woodstock. Attorneys serve Crystal Lake, McHenry, Algonquin, Huntley, Marengo, and surrounding communities.",
  DuPage: "DuPage County probate is handled at the DuPage County Courthouse in Wheaton. Attorneys cover Naperville, Oak Brook, Wheaton, Downers Grove, Lisle, and surrounding suburbs.",
};


const COUNTY_BLOG_LINKS: Record<string, { title: string; href: string }[]> = {
  Cook: [
    { title: "Chicago Probate Real Estate Help", href: "https://www.chicagoprobatespecialist.com" },
    { title: "Probate Attorneys in Northbrook, IL", href: "/city/northbrook-probate-attorney" },
    { title: "Probate Attorneys in Orland Park, IL", href: "/city/orland-park-probate-attorney" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
    { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
    { title: "Joliet Illinois Probate Lawyers", href: "/blog/joliet-illinois-probate-lawyers" },
  ],
  DuPage: [
    { title: "Probate Attorneys in Naperville, IL", href: "/city/naperville-probate-attorney" },
    { title: "Finding a Probate Attorney in Hinsdale", href: "/blog/probate-attorney-hinsdale" },
    { title: "Finding a Probate Attorney in Burr Ridge", href: "/blog/probate-attorney-burr-ridge" },
    { title: "Estate Law in Arlington Heights", href: "/blog/estate-law-arlington-heights-il" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
  ],
  Will: [
    { title: "Probate Attorneys in Joliet, IL", href: "/city/joliet-probate-attorney" },
    { title: "Joliet Illinois Probate Lawyers", href: "/blog/joliet-illinois-probate-lawyers" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
    { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
  ],
  Kane: [
    { title: "Probate Attorneys in Elgin, IL", href: "/city/elgin-probate-attorney" },
    { title: "Probate Attorneys in Aurora, IL", href: "/city/aurora-probate-attorney" },
    { title: "Estate Law in Arlington Heights", href: "/blog/estate-law-arlington-heights-il" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
    { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
  ],
  McHenry: [
    { title: "Probate Attorneys in Crystal Lake, IL", href: "/city/crystal-lake-probate-attorney" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
    { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
  ],
  Lake: [
    { title: "Probate Attorneys in Libertyville, IL", href: "/city/libertyville-probate-attorney" },
    { title: "Executor Selling a House in Illinois", href: "/blog/executor-selling-house-illinois" },
    { title: "What to Do With an Inherited House in Illinois", href: "/blog/inherited-house-illinois" },
  ],
};

const COUNTY_CONTENT: Record<string, React.ReactNode> = {
  Cook: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in Cook County, Illinois</h2>
      <p>
        Cook County handles more probate cases than any other county in Illinois. All Cook County
        probate matters are filed at the <strong>Cook County Circuit Court Probate Division</strong>,
        located at the Richard J. Daley Center, 50 W Washington St, Chicago, IL 60602. The court
        processes thousands of estates annually, covering Chicago and all surrounding suburbs.
      </p>

      <h3>How Cook County Probate Works</h3>
      <p>
        Illinois probate in Cook County follows a structured process. After a loved one passes away,
        the executor files a petition with the Probate Division. The court validates the will,
        appoints the executor, and issues Letters of Office — the legal document authorizing the
        executor to manage and sell estate assets. Creditors have 6 months from the publication of
        notice to file claims. Once that period closes, the executor distributes remaining assets
        to heirs and petitions for the estate to be closed.
      </p>
      <p>
        Cook County&apos;s high case volume means filings must be precise and deadlines strictly
        observed. An attorney experienced with the Cook County Probate Division can navigate the
        court&apos;s specific procedures and prevent costly delays.
      </p>

      <h3>Chicago Probate Attorneys</h3>
      <p>
        Chicago is home to the largest concentration of probate attorneys in Illinois. Whether
        you need help with a straightforward estate or a complex situation involving disputed
        assets, trust litigation, or multiple properties, Chicago probate lawyers handle the
        full range of estate matters. Many offer free initial consultations and serve clients
        throughout Cook County regardless of where the attorney&apos;s office is located.
      </p>

      <h3>Cook County Suburbs We Serve</h3>
      <p>
        Our directory includes probate attorneys serving every Cook County community, including:
      </p>
      <ul>
        <li><strong><a href="/blog/probate-attorney-cicero-illinois">Cicero</a></strong> — One of the most densely populated Cook County suburbs, with many estates centered on family homes passed through generations.</li>
        <li><strong><a href="/blog/probate-attorney-rolling-meadows-illinois">Rolling Meadows</a></strong> — Northwest suburban community with active probate activity through the Cook County Probate Division.</li>
        <li><strong><a href="/city/northbrook-probate-attorney">Northbrook</a></strong> — North Shore suburb with attorneys serving Glenview, Deerfield, and surrounding communities.</li>
        <li><strong><a href="/city/orland-park-probate-attorney">Orland Park</a></strong> — Southwest suburban hub serving Tinley Park, Mokena, and surrounding communities.</li>
        <li><strong><a href="/city/barrington-probate-attorney">Barrington</a></strong> — Northwest community at the intersection of Cook, Lake, McHenry, and Kane counties.</li>
        <li><strong><a href="/city/palos-heights-probate-attorney">Palos Heights</a></strong> — Southwest Cook County community serving Palos Hills and surrounding suburbs.</li>
        <li><strong>Schaumburg, Arlington Heights, Evanston</strong> — Additional high-activity Cook County communities with strong probate attorney representation.</li>
      </ul>

      <h3>Real Estate in Cook County Probate</h3>
      <p>
        Many Cook County probate estates include real property — often a family home in Chicago
        or the suburbs that was solely titled in the deceased&apos;s name. When that happens,
        the property must go through probate before it can be sold or transferred to heirs.
        The executor receives authority to sell the property through the Letters of Office issued
        by the court.
      </p>
      <p>
        If you&apos;re dealing with a property in a Cook County estate — whether it needs to be
        sold, cleaned out, or maintained while the estate is open — we can help connect you with
        the right resources. Many probate properties sit vacant for months while the estate
        settles. <a href="/for-families">Get help with the property side →</a>
      </p>

      <h3>Frequently Asked Questions</h3>
      <h4>How long does probate take in Cook County?</h4>
      <p>
        A straightforward Cook County probate case typically takes 12 to 18 months from filing
        to closing. Complex estates with disputes, multiple properties, or creditor issues can
        take longer. The mandatory 6-month creditor period is the primary driver of the timeline.
      </p>
      <h4>Do I need a probate attorney in Cook County?</h4>
      <p>
        Illinois law does not require an attorney for probate, but Cook County&apos;s court
        procedures are complex enough that most executors benefit significantly from legal
        representation. Attorneys familiar with the Daley Center&apos;s Probate Division can
        prevent filing errors that cause costly delays.
      </p>
      <h4>Where is the Cook County Probate Court?</h4>
      <p>
        The Cook County Circuit Court Probate Division is located at the Richard J. Daley Center,
        50 W Washington St, Chicago, IL 60602, on the 18th floor. Hours are Monday through Friday,
        8:30 AM to 4:30 PM.
      </p>
    </div>
  ),
  McHenry: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in McHenry County, Illinois</h2>
      <p>McHenry County probate cases are filed at the <strong>McHenry County Courthouse</strong>, located at 2200 N Seminary Ave, Woodstock, IL 60098. The court serves Crystal Lake, McHenry, Algonquin, Huntley, Marengo, and surrounding communities.</p>
      <h3>How McHenry County Probate Works</h3>
      <p>After a loved one passes away in McHenry County, the executor files a petition at the Woodstock courthouse. The court appoints the executor, issues Letters of Office, and begins administration. Creditors have 6 months from publication of notice to file claims. Once that period closes, assets are distributed to heirs and the estate is closed.</p>
      <h3>McHenry County Communities We Serve</h3>
      <ul>
        <li><strong><a href="/city/crystal-lake-probate-attorney">Crystal Lake</a></strong> — The largest city in McHenry County, with 30 probate attorneys serving the area.</li>
        <li><strong>Woodstock</strong> — County seat and home to the McHenry County Courthouse where all probate cases are filed.</li>
        <li><strong>McHenry</strong> — Active Fox River community with strong probate attorney representation.</li>
        <li><strong>Algonquin, Huntley, Marengo</strong> — Additional McHenry County communities served by local probate attorneys.</li>
      </ul>
      <h3>Real Estate in McHenry County Probate</h3>
      <p>Many McHenry County estates include residential property in Crystal Lake, Woodstock, or surrounding communities. If the estate includes a property that needs to be maintained, cleaned out, or sold, we can help. <a href="/for-families">Get help with the property side</a></p>
      <h3>Frequently Asked Questions</h3>
      <h4>Where is the McHenry County Probate Court?</h4>
      <p>The McHenry County Courthouse is located at 2200 N Seminary Ave, Woodstock, IL 60098. All McHenry County probate filings are made here.</p>
      <h4>How long does probate take in McHenry County?</h4>
      <p>A straightforward McHenry County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline.</p>
    </div>
  ),
  Kane: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in Kane County, Illinois</h2>
      <p>Kane County probate cases are filed at the <strong>Kane County Courthouse</strong>, located at 100 S 3rd St, Geneva, IL 60134. The court serves Aurora, Elgin, St. Charles, Batavia, and surrounding communities.</p>
      <h3>How Kane County Probate Works</h3>
      <p>After a loved one passes away in Kane County, the executor files a petition at the Geneva courthouse. The court appoints the executor, issues Letters of Office, and begins administration. Creditors have 6 months from publication of notice to file claims. Once that period closes, remaining assets are distributed to heirs.</p>
      <h3>Kane County Communities We Serve</h3>
      <ul>
        <li><strong><a href="/city/aurora-probate-attorney">Aurora</a></strong> — The second largest city in Illinois, spanning Kane and DuPage counties with 12 probate attorneys.</li>
        <li><strong><a href="/city/elgin-probate-attorney">Elgin</a></strong> — One of the largest Kane County cities with 14 probate attorneys serving the area.</li>
        <li><strong>St. Charles, Batavia, Geneva</strong> — Fox Valley communities with strong probate attorney representation, including the county seat in Geneva.</li>
        <li><strong>Carpentersville, Dundee</strong> — Additional Kane County communities served by local probate attorneys.</li>
      </ul>
      <h3>Real Estate in Kane County Probate</h3>
      <p>Many Kane County probate estates include residential property in Aurora, Elgin, or the Fox Valley communities. If the estate includes a property that needs to be maintained, cleaned out, or sold during probate, we can help. <a href="/for-families">Get help with the property side</a></p>
      <h3>Frequently Asked Questions</h3>
      <h4>Where is the Kane County Probate Court?</h4>
      <p>The Kane County Courthouse is located at 100 S 3rd St, Geneva, IL 60134. All Kane County probate filings are made here.</p>
      <h4>How long does probate take in Kane County?</h4>
      <p>A straightforward Kane County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline.</p>
    </div>
  ),
  Will: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in Will County, Illinois</h2>
      <p>Will County probate cases are filed at the <strong>Will County Courthouse</strong>, located at 14 W Jefferson St, Joliet, IL 60432. The court serves Joliet, Naperville, Plainfield, Bolingbrook, Romeoville, and surrounding communities.</p>
      <h3>How Will County Probate Works</h3>
      <p>After a loved one passes away in Will County, the executor files a petition at the Joliet courthouse. The court appoints the executor, issues Letters of Office, and begins administration. Creditors have 6 months from publication of notice to file claims. Once that period closes, remaining assets are distributed to heirs and the estate is closed.</p>
      <h3>Will County Communities We Serve</h3>
      <ul>
        <li><strong><a href="/city/joliet-probate-attorney">Joliet</a></strong> — The Will County seat and largest city, with 26 probate attorneys serving the area.</li>
        <li><strong>Naperville</strong> — One of Illinois most populous suburbs, spanning Will and DuPage counties.</li>
        <li><strong>Plainfield, Bolingbrook, Romeoville</strong> — Fast-growing Will County communities with active probate activity.</li>
        <li><strong>Mokena, New Lenox, Frankfort</strong> — Additional Will County communities served by local probate attorneys.</li>
      </ul>
      <h3>Real Estate in Will County Probate</h3>
      <p>Many Will County probate estates include residential property in Joliet, Plainfield, or surrounding communities. If the estate includes a property that needs to be maintained, cleaned out, or sold during probate, we can help. <a href="/for-families">Get help with the property side</a></p>
      <h3>Frequently Asked Questions</h3>
      <h4>Where is the Will County Probate Court?</h4>
      <p>The Will County Courthouse is located at 14 W Jefferson St, Joliet, IL 60432. All Will County probate filings are made here.</p>
      <h4>How long does probate take in Will County?</h4>
      <p>A straightforward Will County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline.</p>
    </div>
  ),
  Lake: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in Lake County, Illinois</h2>
      <p>Lake County probate cases are filed at the <strong>Lake County Courthouse</strong>, located at 18 N County St, Waukegan, IL 60085. The court serves Waukegan, Lake Forest, Libertyville, Gurnee, Highland Park, and surrounding communities.</p>
      <h3>How Lake County Probate Works</h3>
      <p>After a loved one passes away in Lake County, the executor files a petition at the Waukegan courthouse. The court appoints the executor, issues Letters of Office, and begins administration. Creditors have 6 months from publication of notice to file claims. Once that period closes, remaining assets are distributed to heirs and the estate is closed.</p>
      <h3>Lake County Communities We Serve</h3>
      <ul>
        <li><strong>Waukegan</strong> — Lake County seat and home to the courthouse where all probate cases are filed.</li>
        <li><strong><a href="/city/libertyville-probate-attorney">Libertyville</a></strong> — Prominent Lake County community with 11 probate attorneys serving the area.</li>
        <li><strong>Lake Forest, Highland Park</strong> — North Shore communities with active estate activity and strong attorney representation.</li>
        <li><strong>Gurnee, Mundelein, Vernon Hills</strong> — Additional Lake County communities served by local probate attorneys.</li>
      </ul>
      <h3>Real Estate in Lake County Probate</h3>
      <p>Many Lake County probate estates include residential property — often homes in Waukegan, Libertyville, or the North Shore communities. If the estate includes a property that needs to be maintained, cleaned out, or sold during probate, we can help. <a href="/for-families">Get help with the property side</a></p>
      <h3>Frequently Asked Questions</h3>
      <h4>Where is the Lake County Probate Court?</h4>
      <p>The Lake County Courthouse is located at 18 N County St, Waukegan, IL 60085. All Lake County probate filings are made here.</p>
      <h4>How long does probate take in Lake County?</h4>
      <p>A straightforward Lake County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline.</p>
    </div>
  ),
  DuPage: (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-navy-700">
      <h2>Probate in DuPage County, Illinois</h2>
      <p>DuPage County probate cases are filed at the <strong>DuPage County Courthouse</strong>, located at 505 N County Farm Rd, Wheaton, IL 60187. The court serves Naperville, Oak Brook, Wheaton, Downers Grove, Lisle, and surrounding suburbs.</p>
      <h3>How DuPage County Probate Works</h3>
      <p>After a loved one passes away in DuPage County, the executor files a petition at the Wheaton courthouse. The court appoints the executor, issues Letters of Office, and begins administration. Creditors have 6 months from publication of notice to file claims. Once that period closes, remaining assets are distributed to heirs and the estate is closed.</p>
      <h3>DuPage County Communities We Serve</h3>
      <ul>
        <li><strong><a href="/city/naperville-probate-attorney">Naperville</a></strong> — One of Illinois most populous suburbs, spanning DuPage and Will counties with 11 probate attorneys.</li>
        <li><strong>Wheaton</strong> — DuPage County seat and home to the courthouse where all probate cases are filed.</li>
        <li><strong>Oak Brook, Downers Grove, Lisle</strong> — Prominent DuPage communities with strong probate attorney representation.</li>
        <li><strong>Hinsdale, Burr Ridge, Elmhurst</strong> — Additional high-activity DuPage County communities.</li>
      </ul>
      <h3>Real Estate in DuPage County Probate</h3>
      <p>Many DuPage County probate estates include residential property in Naperville, Wheaton, or surrounding communities. If the estate includes a property that needs to be maintained, cleaned out, or sold during probate, we can help. <a href="/for-families">Get help with the property side</a></p>
      <h3>Frequently Asked Questions</h3>
      <h4>Where is the DuPage County Probate Court?</h4>
      <p>The DuPage County Courthouse is located at 505 N County Farm Rd, Wheaton, IL 60187. All DuPage County probate filings are made here.</p>
      <h4>How long does probate take in DuPage County?</h4>
      <p>A straightforward DuPage County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline.</p>
    </div>
  ),
};
const COUNTY_FAQ: Record<string, { question: string; answer: string }[]> = {
  Cook: [
    { question: "How long does probate take in Cook County?", answer: "A straightforward Cook County probate case typically takes 12 to 18 months from filing to closing. Complex estates with disputes, multiple properties, or creditor issues can take longer. The mandatory 6-month creditor period is the primary driver of the timeline." },
    { question: "Do I need a probate attorney in Cook County?", answer: "Illinois law does not require an attorney for probate, but Cook County's court procedures are complex enough that most executors benefit significantly from legal representation. Attorneys familiar with the Daley Center's Probate Division can prevent filing errors that cause costly delays." },
    { question: "Where is the Cook County Probate Court?", answer: "The Cook County Circuit Court Probate Division is located at the Richard J. Daley Center, 50 W Washington St, Chicago, IL 60602, on the 18th floor. Hours are Monday through Friday, 8:30 AM to 4:30 PM." },
  ],
  McHenry: [
    { question: "Where is the McHenry County Probate Court?", answer: "The McHenry County Courthouse is located at 2200 N Seminary Ave, Woodstock, IL 60098. All McHenry County probate filings are made here." },
    { question: "How long does probate take in McHenry County?", answer: "A straightforward McHenry County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline." },
  ],
  Kane: [
    { question: "Where is the Kane County Probate Court?", answer: "The Kane County Courthouse is located at 100 S 3rd St, Geneva, IL 60134. All Kane County probate filings are made here." },
    { question: "How long does probate take in Kane County?", answer: "A straightforward Kane County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline." },
  ],
  Will: [
    { question: "Where is the Will County Probate Court?", answer: "The Will County Courthouse is located at 14 W Jefferson St, Joliet, IL 60432. All Will County probate filings are made here." },
    { question: "How long does probate take in Will County?", answer: "A straightforward Will County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline." },
  ],
  Lake: [
    { question: "Where is the Lake County Probate Court?", answer: "The Lake County Courthouse is located at 18 N County St, Waukegan, IL 60085. All Lake County probate filings are made here." },
    { question: "How long does probate take in Lake County?", answer: "A straightforward Lake County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline." },
  ],
  DuPage: [
    { question: "Where is the DuPage County Probate Court?", answer: "The DuPage County Courthouse is located at 505 N County Farm Rd, Wheaton, IL 60187. All DuPage County probate filings are made here." },
    { question: "How long does probate take in DuPage County?", answer: "A straightforward DuPage County estate typically takes 12 to 18 months. The mandatory 6-month creditor notice period is the primary driver of the timeline." },
  ],
};
export default function CountyPage({ params }: Props) {
  const county = COUNTY_SLUGS[params.slug];
  if (!county) notFound();

  const attorneys = getAttorneysByCounty(county);
  const verified = attorneys.filter((a) => a.probate_verified === "YES");
  const freeConsult = attorneys.filter((a) => a.free_consultation === "YES");

  // Sort: verified + rated first
  const sorted = [...attorneys].sort((a, b) => {
    const aScore = (a.featured ? 100 : 0) + (a.probate_verified === "YES" ? 10 : 0) + (a.rating ?? 0);
    const bScore = (b.featured ? 100 : 0) + (b.probate_verified === "YES" ? 10 : 0) + (b.rating ?? 0);
    return bScore - aScore;
  });

  const allCounties = Object.entries(COUNTY_SLUGS).filter(
    ([slug]) => slug !== params.slug
  );
  const countySchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (COUNTY_FAQ[county] || []).map((qa) => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer,
      },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Probate Attorneys in ${county} County, Illinois`,
    "url": `https://www.illinoisprobatedirectory.com/county/${params.slug}`,
    "about": {
      "@type": "AdministrativeArea",
      "name": `${county} County, Illinois`,
    },
  };
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(countySchema) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
    />
      {/* Hero */}
      <section className="bg-gradient-to-r from-navy-800 to-navy-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>{county} County</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            Probate Attorneys in {county} County, Illinois
          </h1>
          <p className="text-gray-200 max-w-2xl leading-relaxed">
            {COUNTY_INTROS[county]}
          </p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-2xl font-bold">{attorneys.length}</span>
              <span className="text-gray-300 ml-1.5">Total Listings</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{verified.length}</span>
              <span className="text-gray-300 ml-1.5">Probate Verified</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{freeConsult.length}</span>
              <span className="text-gray-300 ml-1.5">Free Consultations</span>
            </div>
          </div>
        </div>
      </section>

      {COUNTY_CONTENT[county] && (
        <section className="py-12 px-4 bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto">
            {COUNTY_CONTENT[county]}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main listing */}
          <div className="flex-1 min-w-0">
            <AttorneySearch attorneys={sorted} totalCount={attorneys.length} />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-serif font-bold text-navy-800 mb-4">
                Other Counties
              </h3>
              <ul className="space-y-2">
                {allCounties.map(([slug, name]) => {
                  const count = getAllAttorneys().filter(
                    (a) => a.source_county === name
                  ).length;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/county/${slug}`}
                        className="flex justify-between items-center text-sm text-navy-700 hover:text-navy-900 hover:underline"
                      >
                        <span>{name} County</span>
                        <span className="text-gray-400">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-navy-50 rounded-lg p-5 border border-navy-200">
              <h3 className="font-serif font-bold text-navy-800 mb-2">
                Not Sure Where to Start?
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Read our guide to understand the probate process before reaching
                out to an attorney.
              </p>
              <Link
                href="/resources/how-probate-works-illinois"
                className="text-navy-700 text-sm font-semibold hover:underline"
              >
                How Probate Works in Illinois →
              </Link>
            </div>
          
            {COUNTY_BLOG_LINKS[county] && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-serif font-bold text-navy-800 mb-4">
                  Helpful Resources
                </h3>
                <ul className="space-y-2">
                  {COUNTY_BLOG_LINKS[county].map((post) => (
                    <li key={post.href}>
                      <Link
                        href={post.href}
                        className="text-sm text-navy-700 hover:text-navy-900 hover:underline"
                      >
                        {post.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
