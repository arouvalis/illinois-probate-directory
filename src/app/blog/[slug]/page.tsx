import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export async function generateStaticParams() {
  const files = fs.readdirSync(BLOG_DIR);
  return files.map(file => ({ slug: file.replace('.md', '') }));
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
