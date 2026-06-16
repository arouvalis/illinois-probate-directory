import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ForFamiliesBanner from '@/components/ForFamiliesBanner';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function extractFAQs(markdown: string) {
  const faqs: { question: string; answer: string }[] = [];
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isHeading = line.startsWith('## ') || line.startsWith('### ');
    if (!isHeading) continue;

    const question = line.replace(/^#{2,3}\s+/, '').trim();
    if (!question.endsWith('?')) continue;

    // Find next non-empty paragraph
    let answer = '';
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim();
      if (next.length > 20 && !next.startsWith('#')) {
        answer = next.replace(/\*\*/g, '').slice(0, 300);
        break;
      }
    }

    if (answer) faqs.push({ question, answer });
    if (faqs.length >= 5) break;
  }

  return faqs;
}

function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

function getLastUpdated(filePath: string): string {
  const stat = fs.statSync(filePath);
  return stat.mtime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export async function generateStaticParams() {
  const files = fs.readdirSync(BLOG_DIR);
  return files.map(file => ({ slug: file.replace('.md', '') }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const filePath = path.join(BLOG_DIR, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) return {};

  const markdown = fs.readFileSync(filePath, 'utf8');
  const lines = markdown.split('\n');
  const firstLine = lines.find(line => line.startsWith('# '));
  const title = firstLine ? firstLine.replace('# ', '').trim() : params.slug;
  const firstPara = lines.find(line => line.trim().length > 80 && !line.startsWith('#') && !line.startsWith('!'));
  const description = firstPara ? firstPara.replace(/\*\*/g, '').slice(0, 155).trim() + '...' : `${title} — Illinois Probate Directory`;

  return {
    title: `${title} | Illinois Probate Directory`,
    description,
    alternates: {
      canonical: `https://www.illinoisprobatedirectory.com/blog/${params.slug}`,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const filePath = path.join(BLOG_DIR, `${params.slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const markdown = fs.readFileSync(filePath, 'utf8');
  const html = marked(markdown);
  const faqs = extractFAQs(markdown);
  const faqSchema = buildFAQSchema(faqs);
  const lastUpdated = getLastUpdated(filePath);

  return (
    <>
    <div className="max-w-3xl mx-auto px-4 py-12">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <p className="text-gray-400 text-sm mb-6">Last updated: {lastUpdated}</p>
      <article
        className="prose prose-lg prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-gold-600"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
    <ForFamiliesBanner />
    </>
  );
}