#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── CONFIG ───────────────────────────────────────────────────────────────────
const GAPS_FILE  = path.join(__dirname, 'keyword-gaps-output.json');
const BLOG_DIR   = path.join(__dirname, '../src/content/blog');
const MAX_POSTS  = parseInt(process.argv[2]) || 5;
const API_KEY    = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY not set.');
  process.exit(1);
}
if (!fs.existsSync(GAPS_FILE)) {
  console.error(`❌  keyword-gaps-output.json not found. Run find-keyword-gaps.js first.`);
  process.exit(1);
}
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function toSlug(keyword) {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Returns true for junk queries we should never write a post about:
// phone numbers, quoted firm names, branded name lookups.
function isJunk(query) {
  const q = query.toLowerCase();
  // Phone numbers
  if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(q)) return true;
  // Zip codes
  if (/\b\d{5}\b/.test(q)) return true;
  // Heavily quoted strings (GSC wraps firm names in triple quotes)
  if ((query.match(/"/g) || []).length >= 4) return true;
  // Pure name lookups — no probate/estate/wills/trust/property keyword
  const topical = ['probate', 'estate', 'wills', 'trust', 'inherit', 'sell', 'property', 'executor', 'attorney', 'lawyer'];
  if (!topical.some(t => q.includes(t))) return true;
  return false;
}

// Group similar queries by their primary location/topic to avoid duplicate posts.
function clusterKeywords(gaps) {
  const { ctrGaps = [], page2 = [], geo = [] } = gaps;
  const all = [...ctrGaps, ...page2, ...geo];

  const seen   = new Set();
  const unique = all.filter(r => {
    if (seen.has(r.query)) return false;
    seen.add(r.query);
    return true;
  }).filter(r => !isJunk(r.query));

  // Score by opportunity: high impressions + position close to page 1
  const scored = unique.map(r => ({
    ...r,
    score: r.impressions * Math.max(0, (100 - r.position) / 100),
  })).sort((a, b) => b.score - a.score);

  // Cluster by overlapping tokens (city name / topic)
  // Build ALL clusters first, then filter to unwritten ones up to MAX_POSTS
  const clusters = [];
  const claimedQueries = new Set();

  for (const row of scored) {
    if (claimedQueries.has(row.query)) continue;
    const tokens = row.query.toLowerCase().split(/\s+/);

    const related = scored.filter(r => {
      if (r.query === row.query || claimedQueries.has(r.query)) return false;
      const rTokens = r.query.toLowerCase().split(/\s+/);
      const shared  = tokens.filter(t => rTokens.includes(t) && t.length > 3);
      return shared.length >= 2;
    });

    clusters.push({ primary: row, related });
    claimedQueries.add(row.query);
    related.forEach(r => claimedQueries.add(r.query));
  }

  return clusters;
}

// ── ANTHROPIC API CALL ───────────────────────────────────────────────────────
function callAnthropic(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:      'claude-opus-4-5',
      max_tokens: 2048,
      system: `You are an SEO content writer for IllinoisProbateDirectory.com, a directory of 585+ Illinois probate attorneys. Your audience is families navigating probate in Illinois — stressed, time-pressured, unfamiliar with legal processes. Write in plain English. Never use legalese without explaining it.

BLOG POST RULES:
- Start with a single # H1 that naturally contains the target keyword. No frontmatter, no metadata, nothing before the H1.
- 900–1,200 words total.
- Use ## H2 subheadings to break up sections.
- Mention IllinoisProbateDirectory.com naturally at least once as a resource for finding local probate attorneys.
- If the post is about a specific city or county, note which Illinois county it falls in (e.g., Hinsdale is in DuPage County).
- End with a short call-to-action paragraph encouraging the reader to use the directory to find a local probate attorney.
- Do NOT include any frontmatter, YAML, or metadata blocks. The file must begin with the # H1 line.
- Do NOT add a line like "Word count:" or "Keywords:" at the end.`,
      messages,
    });

    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.content[0].text);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generatePost(cluster) {
  const { primary, related } = cluster;
  const relatedList = related.map(r => `"${r.query}"`).join(', ');

  const prompt = `Write a blog post for IllinoisProbateDirectory.com targeting the primary keyword: "${primary.query}"

Additional related keywords to work in naturally (do not stuff — use 1-2 times each if relevant):
${relatedList || 'none'}

GSC context: this keyword has ${primary.impressions} impressions at position ${primary.position.toFixed(1)} in Google — it is being searched but not yet ranking on page 1. The post should be authoritative enough to push it there.`;

  return callAnthropic([{ role: 'user', content: prompt }]);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const gaps     = JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8'));
  const clusters = clusterKeywords(gaps);

  console.log('\n════════════════════════════════════════════════════');
  console.log('  ILLINOIS PROBATE DIRECTORY — POST GENERATOR');
  console.log('════════════════════════════════════════════════════\n');
  console.log(`📋 Found ${clusters.length} keyword clusters. Writing up to ${MAX_POSTS} new post(s)...\n`);

  const results = [];

  for (const cluster of clusters) {
    if (results.length >= MAX_POSTS) break;

    const slug    = toSlug(cluster.primary.query);
    const outFile = path.join(BLOG_DIR, `${slug}.md`);

    if (fs.existsSync(outFile)) {
      console.log(`⏭️  Skipping "${cluster.primary.query}" — already exists`);
      continue;
    }

    console.log(`✍️  [${results.length + 1}/${MAX_POSTS}] "${cluster.primary.query}"`);
    if (cluster.related.length) {
      console.log(`    Related: ${cluster.related.map(r => r.query).join(' | ')}`);
    }

    try {
      const content = await generatePost(cluster);
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`    ✅ Saved → src/content/blog/${slug}.md`);
      results.push({ slug, keyword: cluster.primary.query, file: outFile });
    } catch (err) {
      console.error(`    ❌ Failed: ${err.message}`);
    }

    if (results.length < MAX_POSTS) {
      process.stdout.write('    ⏳ Waiting 2s...\n');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log(`✅  Done. ${results.length} post(s) written to src/content/blog/`);
  if (results.length) {
    console.log('\nFiles created:');
    results.forEach(r => console.log(`  • ${r.slug}.md  ("${r.keyword}")`));
    console.log('\nNext: git add src/content/blog && git commit -m "Add generated blog posts" && git push');
  }
  console.log('════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
