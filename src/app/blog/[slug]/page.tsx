import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export async function generateStaticParams() {
  const files = fs.readdirSync(BLOG_DIR);
  return files.map(file => ({ slug: file.replace('.md', '') }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const filePath = path.join(BLOG_DIR, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) return {};

  const markdown = fs.readFileSync(filePath, 'utf8');
  const firstLine = markdown.split('\n').find(line => line.startsWith('# '));
  const title = firstLine ? firstLine.replace('# ', '').trim() : params.slug;

  return {
    title: `${title} | Illinois Probate Directory`,
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <article
        className="prose prose-lg prose-headings:font-serif prose-headings:text-navy-800 prose-a:text-gold-600"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
