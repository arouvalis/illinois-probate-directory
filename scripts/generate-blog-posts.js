const fs = require('fs');
const path = require('path');
const https = require('https');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const GAPS_FILE = path.join(__dirname, 'keyword-gaps-output.json');
const OUTPUT_DIR = path.join(__dirname, '../src/content/blog');
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY not set');
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
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

// ── PROMPT ────────────────────────────────────────────────────────────────────
function buildPrompt(keyword) {
  return `You are an SEO content writer for IllinoisProbateDirectory.com, a directory of Illinois probate attorneys.

Write a helpful, informative blog post targeting the keyword: "${keyword}"

The post should:
- Be written for families dealing with probate in Illinois
- Be empathetic and clear — avoid legal jargon
- Include the keyword naturally in the title, first paragraph, and 2-3 times throughout
- Be approximately 600-800 words
- Include these sections: intro, what to look for in a probate attorney, how our directory helps, closing CTA
- End with a call to action to search IllinoisProbateDirectory.com
- Be formatted in markdown

Return only the markdown content, no preamble.`;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const gaps = JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8'));

  // Pick top geographic opportunities only
  const targets = gaps.geo
    .filter(r => r.query.match(/probate|estate law|estate lawyer|estate attorney/i))
    .filter(r => !r.query.match(/^(gilbert|michael|meents|bear law|brian|clark)/i))
    .slice(0, 5);

  console.log(`\n🚀 Generating ${targets.length} blog posts...\n`);

  for (const target of targets) {
    const keyword = target.query;
    const slug = slugify(keyword);
    const outFile = path.join(OUTPUT_DIR, `${slug}.md`);

    if (fs.existsSync(outFile)) {
      console.log(`⏭️  Skipping "${keyword}" — already exists`);
      continue;
    }

    console.log(`✍️  Writing post for: "${keyword}"`);
    try {
      const content = await callClaude(buildPrompt(keyword));
      fs.writeFileSync(outFile, content);
      console.log(`✅ Saved: ${outFile}\n`);
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`❌ Failed for "${keyword}":`, err.message);
    }
  }

  console.log('\n🎉 Done! Blog posts saved to:', OUTPUT_DIR);
}

main();

