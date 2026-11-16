#!/usr/bin/env node
'use strict';
// The whole blog pipeline, in order:
//   1. find new topics      (find-keyword-gaps.js, reads the Phase 4 map)
//   2. write drafts         (generate-blog-posts.js, Claude Haiku)
//   3. review the drafts    (review-drafts.js, Claude Sonnet + data/legal-facts.json)
//   4. publish              (publish-drafts.js, approved drafts only)
//
// It runs as a DRY RUN unless you add --publish. A dry run does every step,
// keeps its files in pipeline-output/dry-run/, writes a plain-English report
// there, and publishes nothing: no file reaches the site, no commit, no push.
//
// Usage:
//   node scripts/run-pipeline.js <Queries.csv or the Search Console .zip>            dry run
//   node scripts/run-pipeline.js <export> --topic="what does an executor do"         add a topic by hand
//   node scripts/run-pipeline.js <export> --dry-run --mock                           no API calls, canned answers
//   node scripts/run-pipeline.js <export> --publish                                  the real thing

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PATHS, WRITER_MODEL, REVIEWER_MODEL, dirs, parseArgs, ensureDir, readJson } = require('./lib/config');

function step(label, script, scriptArgs) {
  console.log(`── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}`);
  execFileSync('node', [path.join(__dirname, script), ...scriptArgs], { cwd: PATHS.root, stdio: 'inherit' });
}

function writeReport(out, args) {
  const gaps = readJson(out.gaps);
  const decisions = readJson(path.join(out.base, 'publish-decisions.json'));
  const lines = [];
  lines.push('# Blog pipeline dry run', '');
  lines.push(`Run: ${new Date().toISOString()}`);
  lines.push(args.mock ? 'Models: none. Canned test answers were used; no API calls were made.' : `Models: ${WRITER_MODEL} wrote the drafts, ${REVIEWER_MODEL} reviewed them.`);
  lines.push('', '**Nothing was published.** No file was added to the site, nothing was committed or pushed.', '');
  lines.push('## Topics', '');
  lines.push(`- Queries considered: ${gaps.queriesConsidered}`);
  lines.push(`- Turned away: ${gaps.rejected.length}`);
  for (const [code, n] of Object.entries(gaps.rejectedCounts).sort((a, b) => b[1] - a[1])) lines.push(`  - ${n} × ${code}`);
  lines.push(`- New topics: ${gaps.candidates.length}`);
  for (const c of gaps.candidates) lines.push(`  - "${c.query}"`);
  const byHand = gaps.rejected.filter((r) => r.source === 'given by hand');
  if (byHand.length) {
    lines.push('', '### Topics given by hand that were turned away', '');
    for (const r of byHand) lines.push(`- "${r.query}": ${r.reason}`);
  }
  lines.push('', '## Drafts and review', '');
  if (!decisions.length) lines.push('No drafts were written.');
  for (const d of decisions) {
    lines.push(`### ${d.slug}`, '');
    lines.push(`- Outcome: ${d.ok ? 'would be published' : 'would NOT be published'}. ${d.why}`);
    const reviewFile = path.join(out.reviews, `${d.slug}.json`);
    if (fs.existsSync(reviewFile)) {
      const review = readJson(reviewFile);
      lines.push(`- Review verdict: ${review.verdict}. Legal statements found: ${review.claims.length}.`);
      for (const r of review.reasons) lines.push(`  - ${r}`);
    }
    lines.push('');
  }
  fs.writeFileSync(out.report, lines.join('\n') + '\n');
  console.log(`Report: ${path.relative(PATHS.root, out.report)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = !args.publish;
  const source = args.positional[0];
  if (!source && !args.topics.length) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
    process.exit(0);
  }
  const out = dirs(dryRun);
  if (dryRun) fs.rmSync(out.base, { recursive: true, force: true }); // each dry run starts clean
  ensureDir(out.base);

  let csv = source;
  if (source && source.endsWith('.zip')) {
    csv = path.join(out.base, 'Queries.csv');
    fs.writeFileSync(csv, execFileSync('unzip', ['-p', source, 'Queries.csv']));
  }

  const mode = dryRun ? ['--dry-run'] : [];
  const mock = args.mock ? ['--mock'] : [];
  console.log(`\nIllinois Probate Directory blog pipeline: ${dryRun ? 'DRY RUN (nothing will be published)' : 'LIVE RUN (approved drafts will be published)'}\n`);
  step('Step 1: find new topics', 'find-keyword-gaps.js', [...(csv ? [csv] : []), ...args.topics.map((t) => `--topic=${t}`), ...mode]);
  step('Step 2: write drafts (Haiku)', 'generate-blog-posts.js', [`--max=${args.max}`, ...mode, ...mock]);
  step('Step 3: review drafts (Sonnet)', 'review-drafts.js', [...mode, ...mock]);
  step('Step 4: publish', 'publish-drafts.js', dryRun ? ['--dry-run'] : ['--publish']);
  if (dryRun) writeReport(out, args);
}

try {
  main();
} catch (err) {
  console.error(`\nPipeline stopped: ${err.message}`);
  process.exit(1);
}
