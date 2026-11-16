#!/usr/bin/env node
'use strict';
// Step 3 of the blog pipeline: review every draft before anything is published.
//
// Each legal statement in a draft is checked against data/legal-facts.json,
// by the script itself and by Claude Sonnet (see lib/legal-review.js). A draft
// with any statement that is not in the facts file is FLAGGED, and a flagged
// draft is never published.
//
// Usage: node scripts/review-drafts.js [--dry-run] [--mock]

const fs = require('fs');
const path = require('path');
const { PATHS, REVIEWER_MODEL, dirs, parseArgs, readJson, writeJson } = require('./lib/config');
const { loadGuard } = require('./lib/topic-guard');
const { getClient } = require('./lib/anthropic');
const { reviewOne } = require('./lib/legal-review');

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const out = dirs(args.dryRun);
  const drafts = fs.existsSync(out.drafts) ? fs.readdirSync(out.drafts).filter((f) => f.endsWith('.md')) : [];
  console.log(`\nReviewing ${drafts.length} draft(s)${args.dryRun ? ' (dry run)' : ''}${args.mock ? ' with canned answers, no API calls' : ` with ${REVIEWER_MODEL}`}`);
  if (!drafts.length) return console.log('  Nothing to review.\n');

  const facts = readJson(PATHS.facts);
  const guard = loadGuard();
  const client = getClient({ mock: args.mock });

  for (const file of drafts) {
    const slug = file.replace(/\.md$/, '');
    const draft = fs.readFileSync(path.join(out.drafts, file), 'utf8');
    const review = await reviewOne({ client, draft, facts, guard, slug });
    if (args.mock) review.reviewerModel = 'mock';
    writeJson(path.join(out.reviews, `${slug}.json`), review);
    if (review.verdict === 'approved') {
      console.log(`  APPROVED  ${slug}  (${review.claims.length} legal statement(s), all in the facts file)`);
    } else {
      console.log(`  FLAGGED   ${slug}  (${review.reasons.length} problem(s); will not be published)`);
      for (const r of review.reasons.slice(0, 6)) console.log(`              - ${r}`);
      if (review.reasons.length > 6) console.log(`              ... and ${review.reasons.length - 6} more in ${path.relative(PATHS.root, path.join(out.reviews, slug + '.json'))}`);
    }
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
