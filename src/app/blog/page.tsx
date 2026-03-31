import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function getTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function BlogIndex() {
  const files = fs.readdirSync(BLOG_DIR);
  const posts = files.map(file => ({
    slug: file.replace('.md', ''),
    title: getTitle(file.replace('.md', '')),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-navy-800 mb-8">
        Illinois Probate Resources
      </h1>
      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-lg text-gold-600 hover:underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
