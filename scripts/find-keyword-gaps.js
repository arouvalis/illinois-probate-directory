#!/usr/bin/env node
'use strict';
// Step 1 of the blog pipeline: find topics worth writing about.
//
// Reads a Search Console "Queries.csv" export, and/or topics given by hand with
// --topic="...", and passes every one through the topic guard, which reads the
// Phase 4 query-to-page map (data/query-page-map.json). Only topics no page on
// IPD or CPS already owns come out as candidates. Everything else is listed
// with the reason it was turned away.
//
// Usage: node scripts/find-keyword-gaps.js [Queries.csv] [--topic="..."] [--dry-run]

const fs = require('fs');
const { dirs, parseArgs, writeJson } = require('./lib/config');
const { loadGuard, similarity } = require('./lib/topic-guard');

function parseCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const split = (line) => {
    const cells = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  };
  const headers = split(lines[0]).map((h) => h.trim());
  const col = (name) => headers.indexOf(name);
  const q = col('Top queries'), c = col('Clicks'), i = col('Impressions'), p = col('Position');
  if (q < 0 || i < 0) throw new Error(`${file} does not look like a Search Console Queries.csv (no "Top queries" column).`);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    return {
      query: (cells[q] || '').trim(),
      clicks: parseInt(cells[c], 10) || 0,
      impressions: parseInt(cells[i], 10) || 0,
      position: parseFloat(cells[p]) || 0,
    };
  }).filter((r) => r.query);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const csv = args.positional[0];
  if (!csv && !args.topics.length) {
    console.error('Usage: node scripts/find-keyword-gaps.js [Queries.csv] [--topic="..."] [--dry-run]');
    process.exit(1);
  }
  const out = dirs(args.dryRun);
  const guard = loadGuard();

  // Same opportunity tests as before: searched but not clicked, or close to page one.
  const rows = csv ? parseCsv(csv) : [];
  const worthALook = rows.filter((r) =>
    (r.impressions >= 5 && r.clicks === 0) || (r.position >= 11 && r.position <= 35 && r.impressions >= 3)
  );
  const pool = [
    ...args.topics.map((t) => ({ query: t, clicks: 0, impressions: 0, position: 0, source: 'given by hand' })),
    ...worthALook.map((r) => ({ ...r, source: 'Search Console' })),
  ];

  const candidates = [];
  const rejected = [];
  const seen = new Set();
  for (const row of pool) {
    const key = row.query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const verdict = guard.check(row.query);
    if (!verdict.allowed) {
      rejected.push({ query: row.query, source: row.source, impressions: row.impressions, code: verdict.code, reason: verdict.reason, owner: verdict.owner });
      continue;
    }
    // Two candidates on the same topic become one, so a run cannot duplicate itself.
    const twin = candidates.find((c) => similarity(c.query, row.query) >= 0.6);
    if (twin) { twin.related.push(row.query); continue; }
    const score = row.impressions * Math.max(0, (100 - row.position) / 100);
    candidates.push({ query: row.query, slug: verdict.slug, source: row.source, impressions: row.impressions, position: row.position, score, related: [] });
  }
  candidates.sort((a, b) => (a.source === b.source ? b.score - a.score : a.source === 'given by hand' ? -1 : 1));

  const counts = {};
  for (const r of rejected) counts[r.code] = (counts[r.code] || 0) + 1;
  writeJson(out.gaps, {
    generatedAt: new Date().toISOString(),
    dryRun: args.dryRun,
    csv: csv || null,
    queriesInExport: rows.length,
    queriesConsidered: seen.size,
    rejectedCounts: counts,
    candidates,
    rejected,
  });

  const label = {
    'named-attorney': 'name an attorney or law firm',
    owned: 'belong to an existing page on IPD or CPS',
    removed: 'were removed in Phase 4b or now redirect',
    exists: 'already have an article',
    rankings: 'ask for a ranking ("best", "top")',
    'outside-scope': 'are outside the six counties or the probate field',
    'unknown-word': 'contain a word that may be a name',
    junk: 'are phone numbers, zip codes or web addresses',
    'off-topic': 'are not probate topics',
  };
  console.log(`\nTopic check${args.dryRun ? ' (dry run)' : ''}`);
  console.log(`  Queries considered: ${seen.size}${csv ? ` (from ${rows.length} in the export)` : ''}`);
  console.log(`  Turned away: ${rejected.length}`);
  for (const [code, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${label[code] || code}`);
  console.log(`  New topics: ${candidates.length}`);
  for (const c of candidates) console.log(`    - "${c.query}"${c.impressions ? ` (${c.impressions} impressions, position ${c.position.toFixed(1)})` : ` (${c.source})`}`);
  console.log(`  Saved to ${out.gaps}\n`);
}

main();
