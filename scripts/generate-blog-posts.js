#!/usr/bin/env node
'use strict';
// Step 2 of the blog pipeline: Claude Haiku writes a DRAFT for each new topic.
//
// Drafts go to pipeline-output/drafts/, which the website does not read.
// Nothing here publishes. Each topic is checked against the topic guard again
// before any writing, so a topic file edited by hand cannot get round the map.
//
// Usage: node scripts/generate-blog-posts.js [--max=3] [--dry-run] [--mock]

const fs = require('fs');
const path = require('path');
const { PATHS, WRITER_MODEL, dirs, parseArgs, ensureDir, readJson, writeJson } = require('./lib/config');
const { loadGuard } = require('./lib/topic-guard');
const { getClient, writeDraft } = require('./lib/anthropic');

function writerSystem(facts, map) {
  const factList = facts.facts.map((f) => `- ${f.statement}`).join('\n');
  const owned = map.topics
    .filter((t) => t.owner.site === 'IPD')
    .map((t) => `- ${t.topic}: ${t.owner.url}`)
    .join('\n');
  return `You write articles for IllinoisProbateDirectory.com, a directory of probate attorneys in six Illinois counties (Cook, DuPage, Kane, Lake, McHenry, Will). Readers are families dealing with a death: stressed, short of time and new to the legal process. Write in plain English and explain any legal term the first time you use it.

Every draft is checked before publication, and a draft that breaks any of these rules is thrown away:

1. Legal statements. The only statements of Illinois law, deadlines, dollar limits, typical timelines, court procedure or court locations you may make are the confirmed facts below, in your own words but without changing their meaning or adding to them. For everything else, describe the question in general terms and tell the reader it depends on the estate and is a question for an Illinois probate attorney. Do not state any other number, deadline, fee, percentage, form name, statute or rule, even one you are sure of.

<confirmed_facts>
${factList}
</confirmed_facts>

2. No names. Never name an attorney, a law firm, a judge or any other private person or business. Do not recommend, rank or compare attorneys.

3. Nothing invented. No statistics, testimonials, case studies, client stories or example families.

4. Stay on the topic you are given. These topics already have their own pages; do not re-explain them. Where one is relevant, give it one sentence and a markdown link to its page:
${owned}
- Finding an attorney: the directory homepage, /
- What to do with an inherited house: /for-families

Format: markdown. Begin with a single "# " heading that contains the topic naturally; nothing before it, no front matter. Use "## " subheadings. 700 to 1,000 words. End with a short paragraph inviting the reader to use the directory to find a local probate attorney. Return only the article.`;
}

function writerPrompt(candidate) {
  const related = candidate.related && candidate.related.length ? `\nRelated searches to cover if they fit naturally: ${candidate.related.map((r) => `"${r}"`).join(', ')}` : '';
  return `TOPIC: "${candidate.query}"${related}\n\nWrite the article.`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const out = dirs(args.dryRun);
  if (!fs.existsSync(out.gaps)) {
    console.error(`No topic list at ${out.gaps}. Run find-keyword-gaps.js first.`);
    process.exit(1);
  }
  const gaps = readJson(out.gaps);
  const facts = readJson(PATHS.facts);
  const guard = loadGuard();
  const client = getClient({ mock: args.mock });
  const system = writerSystem(facts, guard.map);
  ensureDir(out.drafts);

  console.log(`\nWriting drafts${args.dryRun ? ' (dry run)' : ''}${args.mock ? ' with canned answers, no API calls' : ` with ${WRITER_MODEL}`}`);
  let written = 0;
  for (const candidate of gaps.candidates) {
    if (written >= args.max) break;
    const verdict = guard.check(candidate.query);
    if (!verdict.allowed) {
      console.log(`  Skipped "${candidate.query}": ${verdict.reason}`);
      continue;
    }
    const draftFile = path.join(out.drafts, `${verdict.slug}.md`);
    if (fs.existsSync(draftFile)) {
      console.log(`  Skipped "${candidate.query}": a draft is already waiting for review.`);
      continue;
    }
    try {
      const draft = await writeDraft(client, { system, prompt: writerPrompt(candidate) });
      if (!draft.startsWith('# ')) throw new Error('The draft does not begin with a "# " heading.');
      fs.writeFileSync(draftFile, draft + '\n');
      writeJson(path.join(out.drafts, `${verdict.slug}.meta.json`), {
        slug: verdict.slug,
        query: candidate.query,
        related: candidate.related || [],
        writerModel: args.mock ? 'mock' : WRITER_MODEL,
        writtenAt: new Date().toISOString(),
      });
      written++;
      console.log(`  Draft written: ${path.relative(PATHS.root, draftFile)}`);
    } catch (err) {
      console.error(`  Failed "${candidate.query}": ${err.message}`);
    }
  }
  console.log(`  ${written} draft(s) written. Drafts are not on the site; the review step is next.\n`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
