const fs = require('fs');
const path = require('path');

// ── CONFIG ──────────────────────────────────────────────────────────────────
const GSC_CSV = process.argv[2];

if (!GSC_CSV) {
  console.error('Usage: node find-keyword-gaps.js <path-to-Queries.csv>');
  process.exit(1);
}

// ── PARSE CSV ────────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || '').replace(/^"|"$/g, '').trim();
    });
    return row;
  });
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
const rows = parseCSV(GSC_CSV).map(r => ({
  query:       r['Top queries'] || '',
  clicks:      parseInt(r['Clicks']) || 0,
  impressions: parseInt(r['Impressions']) || 0,
  ctr:         r['CTR'] || '0%',
  position:    parseFloat(r['Position']) || 0,
}));

// 1. CTR GAPS — high impressions, zero clicks
const ctrGaps = rows
  .filter(r => r.impressions >= 5 && r.clicks === 0)
  .sort((a, b) => b.impressions - a.impressions);

// 2. PAGE 2-3 RANKINGS — close to page 1
const page2 = rows
  .filter(r => r.position >= 11 && r.position <= 35 && r.impressions >= 3)
  .sort((a, b) => a.position - b.position);

// 3. GEOGRAPHIC PROBATE OPPORTUNITIES
const geoTerms = ['probate', 'estate law', 'estate lawyer', 'estate attorney', 'probate lawyer'];
const geo = rows
  .filter(r => geoTerms.some(t => r.query.toLowerCase().includes(t)))
  .filter(r => r.impressions >= 2)
  .sort((a, b) => b.impressions - a.impressions);

// ── OUTPUT ───────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════');
console.log('  ILLINOIS PROBATE DIRECTORY — KEYWORD GAP REPORT');
console.log('════════════════════════════════════════════════════\n');

console.log('📌 CTR GAPS (high impressions, zero clicks = easy wins)');
console.log('─────────────────────────────────────────────────────');
ctrGaps.slice(0, 15).forEach((r, i) => {
  console.log(`${i + 1}. "${r.query}"`);
  console.log(`   Impressions: ${r.impressions} | Position: ${r.position.toFixed(1)} | Action: Blog post targeting this keyword\n`);
});

console.log('\n📈 PAGE 2-3 RANKINGS (push these to page 1)');
console.log('─────────────────────────────────────────────────────');
page2.slice(0, 15).forEach((r, i) => {
  console.log(`${i + 1}. "${r.query}"`);
  console.log(`   Position: ${r.position.toFixed(1)} | Impressions: ${r.impressions} | Clicks: ${r.clicks}\n`);
});

console.log('\n🗺️  GEOGRAPHIC PROBATE OPPORTUNITIES');
console.log('─────────────────────────────────────────────────────');
geo.slice(0, 15).forEach((r, i) => {
  console.log(`${i + 1}. "${r.query}"`);
  console.log(`   Impressions: ${r.impressions} | Position: ${r.position.toFixed(1)} | Clicks: ${r.clicks}\n`);
});

// Save JSON for Script 2
const output = { ctrGaps: ctrGaps.slice(0, 20), page2: page2.slice(0, 20), geo: geo.slice(0, 20) };
const outPath = path.join(__dirname, 'keyword-gaps-output.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\n✅ Full results saved to: ${outPath}\n`);
