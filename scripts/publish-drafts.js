#!/usr/bin/env node
'use strict';
// Step 4 of the blog pipeline: publish the drafts that passed review.
//
// A draft is published only if ALL of these hold:
//   - it has a review, and the review says "approved";
//   - the review was done by Claude Sonnet (never by canned test answers);
//   - the draft has not been edited since it was reviewed;
//   - the review used the current facts file;
//   - the topic still passes the topic guard, and no article has that address.
// Publishing means copying the draft into src/content/blog, committing and
// pushing. That only happens with --publish. With --dry-run the same checks
// run and the script reports what it WOULD do, and touches nothing.
//
// Usage: node scripts/publish-drafts.js --dry-run | --publish

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PATHS, dirs, parseArgs, readJson, writeJson, ensureDir } = require('./lib/config');
const { loadGuard } = require('./lib/topic-guard');
const { sha256 } = require('./lib/legal-review');

function decide(slug, out, guard, facts) {
  const draftFile = path.join(out.drafts, `${slug}.md`);
  const reviewFile = path.join(out.reviews, `${slug}.json`);
  const metaFile = path.join(out.drafts, `${slug}.meta.json`);
  if (!fs.existsSync(reviewFile)) return { ok: false, why: 'It has not been reviewed.' };
  if (!fs.existsSync(metaFile)) return { ok: false, why: 'Its topic record is missing.' };
  const review = readJson(reviewFile);
  const meta = readJson(metaFile);
  const draft = fs.readFileSync(draftFile, 'utf8');
  if (review.verdict !== 'approved') return { ok: false, why: `The review flagged it (${review.reasons.length} problem(s)).`, review };
  if (review.draftSha256 !== sha256(draft)) return { ok: false, why: 'It was edited after the review. Review it again.' };
  if (review.factsVersion !== `${facts.version} (${facts.updated})`) return { ok: false, why: 'The facts file changed after the review. Review it again.' };
  const realReviewer = /^claude-sonnet/.test(review.reviewerModel || '');
  const topic = guard.check(meta.query);
  if (!topic.allowed) return { ok: false, why: `The topic is no longer allowed: ${topic.reason}` };
  if (topic.slug !== slug) return { ok: false, why: 'The file name does not match its topic.' };
  if (fs.existsSync(path.join(PATHS.blog, `${slug}.md`))) return { ok: false, why: 'An article with this address already exists.' };
  if (!realReviewer) return { ok: false, mockOnly: true, why: 'It passed every check, but the review used canned test answers, not Claude Sonnet.' };
  return { ok: true, why: 'Reviewed by Claude Sonnet; every legal statement is in the facts file.' };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dryRun && !args.publish) {
    console.error('Nothing done. Say which you want:\n  --dry-run   show what would be published, change nothing\n  --publish   publish the approved drafts to the live site');
    process.exit(1);
  }
  const out = dirs(args.dryRun);
  const guard = loadGuard();
  const facts = readJson(PATHS.facts);
  const slugs = fs.existsSync(out.drafts) ? fs.readdirSync(out.drafts).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : [];
  const decisions = slugs.map((slug) => ({ slug, ...decide(slug, out, guard, facts) }));
  const go = decisions.filter((d) => d.ok);

  console.log(`\nPublish step${args.dryRun ? ' (dry run: nothing will be published)' : ''}`);
  for (const d of decisions) {
    const verb = d.ok ? (args.dryRun ? 'WOULD PUBLISH    ' : 'PUBLISHING       ') : (args.dryRun ? 'WOULD NOT PUBLISH' : 'NOT PUBLISHED    ');
    console.log(`  ${verb} ${d.slug}: ${d.why}`);
  }
  if (!decisions.length) console.log('  No drafts.');
  writeJson(path.join(out.base, 'publish-decisions.json'), decisions.map(({ review, ...d }) => d));

  if (args.dryRun) {
    console.log('  Dry run: no file was copied to the site, nothing was committed or pushed.\n');
    return;
  }
  if (!go.length) return console.log('  Nothing to publish.\n');

  const published = path.join(out.base, 'published');
  ensureDir(published);
  const added = [];
  for (const d of go) {
    const target = path.join(PATHS.blog, `${d.slug}.md`);
    fs.copyFileSync(path.join(out.drafts, `${d.slug}.md`), target);
    added.push(path.relative(PATHS.root, target));
    for (const f of [`${d.slug}.md`, `${d.slug}.meta.json`]) fs.renameSync(path.join(out.drafts, f), path.join(published, f));
  }
  const git = (...a) => execFileSync('git', a, { cwd: PATHS.root, stdio: 'inherit' });
  execFileSync('node', ['scripts/update-content-dates.js'], { cwd: PATHS.root, stdio: 'inherit' });
  git('add', '--', ...added, 'data/content-dates.json');
  git('commit', '-m', `Blog pipeline: add ${go.length} reviewed post(s)`);
  git('push');
  console.log(`  Published ${go.length} post(s).\n`);
}

main();
