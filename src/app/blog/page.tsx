import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { Metadata } from 'next';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const SITE = 'https://www.illinoisprobatedirectory.com';

export const metadata: Metadata = {
  title: 'Illinois Probate Guides for Families and Executors',
  description:
    'Plain-language guides to Illinois probate: timelines, costs, small estates, what goes through probate, and when you need an attorney.',
  alternates: { canonical: `${SITE}/blog` },
};

// Link text and one-line summary for each article. An article without an entry
// here is still listed, under its own main heading.
const SUMMARIES: Record<string, { title: string; summary: string }> = {
  'do-i-need-a-probate-attorney-in-illinois': {
    title: 'Do I Need a Probate Attorney in Illinois?',
    summary: 'When Illinois families can settle an estate on their own, and when an attorney is worth it.',
  },
  'how-much-does-a-probate-attorney-cost-in-illinois': {
    title: 'What Does a Probate Attorney Cost in Illinois?',
    summary: 'Hourly, flat-fee and percentage billing, typical filing costs, and questions to ask before you hire.',
  },
  'small-estate-affidavit-illinois': {
    title: 'Small Estate Affidavit in Illinois',
    summary: 'The $150,000 limit, which estates qualify, and how the affidavit avoids a court case.',
  },
  'what-assets-go-through-probate-in-illinois': {
    title: "What Goes Through Probate in Illinois, and What Doesn't",
    summary: 'Houses, bank accounts, joint property, beneficiary accounts and trusts: what needs probate and what passes outside it.',
  },
  'lake-county-il-probate': {
    title: 'Lake County, IL Probate: Court, Steps and Timeline',
    summary: 'Where to file in Waukegan, the steps, and how long Lake County probate takes.',
  },
};

// Longer guides that live outside /blog.
const RESOURCES = [
  {
    href: '/resources/how-probate-works-illinois',
    title: 'How Probate Works in Illinois',
    summary: 'The process from opening the estate to closing it, step by step.',
  },
  {
    href: '/resources/illinois-probate-timeline-by-county',
    title: 'How Long Does Probate Take in Illinois?',
    summary: 'Each stage, the six-month claims period, and notes for six Chicago-area counties.',
  },
  {
    href: '/resources/illinois-probate-courts-by-county',
    title: 'Illinois Probate Courts by County',
    summary: 'Courthouse addresses, phone numbers and filing details for six counties.',
  },
  {
    href: '/resources/selling-inherited-property-illinois',
    title: 'Selling an Inherited House in Illinois: The Legal Steps',
    summary: 'Who can sell, whether probate is needed first, and what the title company will ask for.',
  },
];

function headingOf(file: string, slug: string): string {
  const first = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8').split('\n').find((l) => l.startsWith('# '));
  return first ? first.replace('# ', '').trim() : slug;
}

export default function BlogIndex() {
  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const known = SUMMARIES[slug];
      return {
        href: `/blog/${slug}`,
        title: known?.title ?? headingOf(file, slug),
        summary: known?.summary ?? '',
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Illinois Probate Guides for Families and Executors',
    url: `${SITE}/blog`,
  };

  const list = (items: { href: string; title: string; summary: string }[]) => (
    <ul className="space-y-6">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="text-lg font-semibold text-gold-600 hover:underline">
            {item.title}
          </Link>
          {item.summary && <p className="text-gray-600 mt-1 leading-relaxed">{item.summary}</p>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="text-3xl font-serif font-bold text-navy-800 mb-3">
        Illinois Probate Guides for Families and Executors
      </h1>
      <p className="text-gray-600 leading-relaxed mb-10">
        Plain-language answers to the questions families ask first. Looking for an attorney
        instead?{' '}
        <Link href="/" className="text-navy-700 font-semibold underline hover:text-navy-900">
          Search the directory
        </Link>{' '}
        by town or name.
      </p>

      <h2 className="text-xl font-serif font-bold text-navy-800 mb-5">Common questions</h2>
      {list(posts)}

      <h2 className="text-xl font-serif font-bold text-navy-800 mt-12 mb-5">Step-by-step guides</h2>
      {list(RESOURCES)}
    </div>
  );
}
