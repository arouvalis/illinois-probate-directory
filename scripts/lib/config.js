'use strict';
// Shared settings for the blog pipeline: where files live, which models run
// which step, and how the command-line flags are read.

const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');

// Models. Haiku writes drafts; Sonnet reviews them (Phase 5).
const WRITER_MODEL = 'claude-haiku-5-5';
const REVIEWER_MODEL = 'claude-sonnet-5-5';

const PATHS = {
  root: ROOT,
  blog: path.join(ROOT, 'src/content/blog'), // anything in here is LIVE on the site
  cityPages: path.join(ROOT, 'src/app/city'),
  nextConfig: path.join(ROOT, 'next.config.mjs'),
  map: path.join(ROOT, 'data/query-page-map.json'),
  facts: path.join(ROOT, 'data/legal-facts.json'),
  attorneys: path.join(ROOT, 'data/attorneys.json'),
  removedAttorneys: path.join(ROOT, 'data/removed-attorneys.json'),
  output: path.join(ROOT, 'pipeline-output'), // not committed, not served
};

// A dry run keeps everything it produces in its own folder, so it can never
// be mistaken for (or picked up by) a real run.
function workDir(dryRun) {
  return dryRun ? path.join(PATHS.output, 'dry-run') : PATHS.output;
}

function dirs(dryRun) {
  const base = workDir(dryRun);
  return {
    base,
    gaps: path.join(base, 'keyword-gaps.json'),
    drafts: path.join(base, 'drafts'),
    reviews: path.join(base, 'reviews'),
    report: path.join(base, 'report.md'),
  };
}

// Flags: --dry-run, --publish, --mock, --max=N, --topic="..." (repeatable),
// anything else is a positional argument.
function parseArgs(argv) {
  const out = { dryRun: false, publish: false, mock: false, max: 3, topics: [], positional: [] };
  for (const a of argv) {
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--publish') out.publish = true;
    else if (a === '--mock') out.mock = true;
    else if (a.startsWith('--max=')) out.max = Math.max(1, parseInt(a.slice(6), 10) || 3);
    else if (a.startsWith('--topic=')) out.topics.push(a.slice(8));
    else if (a.startsWith('--')) throw new Error(`Unknown option: ${a}`);
    else out.positional.push(a);
  }
  if (out.dryRun && out.publish) throw new Error('Choose one of --dry-run or --publish, not both.');
  if (out.mock && !out.dryRun) throw new Error('--mock only works together with --dry-run. Canned answers can never approve a real post.');
  return out;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

module.exports = { ROOT, PATHS, WRITER_MODEL, REVIEWER_MODEL, workDir, dirs, parseArgs, ensureDir, readJson, writeJson };
