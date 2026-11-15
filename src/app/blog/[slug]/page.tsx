import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import EstateHouseBlock from '@/components/EstateHouseBlock';
import JsonLd from '@/components/JsonLd';
import { extractFaqs, faqPageSchema } from '@/lib/schema';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

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
    title,
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
  const faqs = extractFaqs(markdown);
  const lastUpdated = getLastUpdated(filePath);

  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqPageSchema(faqs)} />}
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-gray-400 text-sm mb-6">Last updated: {lastUpdated}</p>
      <article
        className="prose prose-lg prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-gold-600"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EstateHouseBlock placement={`blog_${params.slug}`} className="mt-10" />
    </div>
    </>
  );
}