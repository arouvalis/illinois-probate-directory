#!/usr/bin/env node
'use strict';
// Tests for the blog pipeline guardrails. No API calls, nothing published.
// Run: npm run test:pipeline

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PATHS, dirs, readJson } = require('./lib/config');
const { loadGuard } = require('./lib/topic-guard');
const { scriptCheck } = require('./lib/legal-review');

const guard = loadGuard();
const facts = readJson(PATHS.facts);
const map = readJson(PATHS.map);
const run = (script, args) => spawnSync('node', [path.join(__dirname, script), ...args], { cwd: PATHS.root, encoding: 'utf8' });
const blogFiles = () => fs.readdirSync(PATHS.blog).sort().join(',');

test('all 23 posts removed in Phase 4b are refused', () => {
  assert.strictEqual(map.removedPosts.length, 23);
  for (const r of map.removedPosts) {
    const v = guard.check(r.slug.replace(/-/g, ' '));
    assert.strictEqual(v.allowed, false, r.slug);
  }
});

test('every older /blog redirect in next.config.mjs is refused too', () => {
  for (const slug of ['probate-attorney-naperville-illinois', 'joliet-wills-estates-attorney', 'probate-attorney-aurora-illinois']) {
    assert.ok(guard.removed.has(slug), slug);
    assert.strictEqual(guard.check(slug.replace(/-/g, ' ')).allowed, false, slug);
  }
});

test('topics owned by an IPD page are refused, with the owner named', () => {
  const cases = {
    'how long does probate take in cook county': '/resources/illinois-probate-timeline-by-county',
    'illinois probate process steps': '/resources/how-probate-works-illinois',
    'cook county probate court clerk': '/resources/illinois-probate-courts-by-county',
    'small estate affidavit illinois': '/blog/small-estate-affidavit-illinois',
    'how much does a probate lawyer cost': '/blog/how-much-does-a-probate-attorney-cost-in-illinois',
    'do i need a lawyer for probate in illinois': '/blog/do-i-need-a-probate-attorney-in-illinois',
    'what assets go through probate': '/blog/what-assets-go-through-probate-in-illinois',
    'lake county il probate': '/blog/lake-county-il-probate',
    'sell inherited house illinois': '/resources/selling-inherited-property-illinois',
    'probate attorney joliet': '/city/joliet-probate-attorney',
    'probate attorney downers grove': '/county/dupage',
    'kane county estate planning attorney': '/county/kane',
    'probate lawyers near me': '/',
  };
  for (const [q, url] of Object.entries(cases)) {
    const v = guard.check(q);
    assert.strictEqual(v.allowed, false, q);
    assert.strictEqual(v.owner && v.owner.url, url, q);
  }
});

test('topics owned by a CPS page are refused', () => {
  const cases = {
    'sell inherited house chicago': '/inherited-property/cook-county',
    'heirs disagree about selling inherited house': '/blog/heirs-disagree-selling-inherited-property-illinois',
    'inherited house with a mortgage illinois': '/blog/inherited-property-with-mortgage-illinois',
    'probate realtor near me': '/',
    'probate real estate services illinois': '/probate-services',
  };
  for (const [q, url] of Object.entries(cases)) {
    const v = guard.check(q);
    assert.strictEqual(v.allowed, false, q);
    assert.strictEqual(v.owner.site, 'CPS', q);
    assert.strictEqual(v.owner.url, url, q);
  }
  assert.strictEqual(guard.check('how to sell inherited house in mchenry county').allowed, false);
});

test('no directory listing name can become a topic', () => {
  for (const file of [PATHS.attorneys, PATHS.removedAttorneys]) {
    for (const a of readJson(file)) {
      assert.strictEqual(guard.check(a.name).allowed, false, a.name);
      assert.strictEqual(guard.check(`${a.name} probate`).allowed, false, a.name);
    }
  }
});

test('named attorneys, firms and unknown words are refused', () => {
  for (const q of ['kent heitzinger', 'michael laird attorney', 'meents law wilmington', 'william lee attorney', 'smith and associates probate', 'law office of jane doe', 'zbigniew probate illinois', '"some firm" probate']) {
    const v = guard.check(q);
    assert.strictEqual(v.allowed, false, q);
  }
  assert.strictEqual(guard.check('kent heitzinger').code, 'named-attorney');
});

test('rankings and out-of-area topics are refused', () => {
  assert.strictEqual(guard.check('best probate attorney chicago').code, 'rankings');
  assert.strictEqual(guard.check('probate law peoria il').allowed, false);
  assert.strictEqual(guard.check('divorce and estate illinois').allowed, false);
});

test('a genuinely new statewide topic is allowed', () => {
  for (const q of ['what does an executor do in illinois', 'who inherits if there is no will in illinois', 'letters of office illinois']) {
    assert.strictEqual(guard.check(q).allowed, true, q);
  }
});

test('the real Search Console export yields no removed, owned or named topic', () => {
  const zip = fs.readdirSync(PATHS.root).find((f) => f.endsWith('.zip') && f.includes('Performance-on-Search'));
  if (!zip) return;
  const csv = spawnSync('unzip', ['-p', path.join(PATHS.root, zip), 'Queries.csv'], { encoding: 'utf8' }).stdout;
  const queries = csv.trim().split(/\r?\n/).slice(1).map((l) => l.replace(/,\d+,\d+,[\d.]+%,[\d.]+$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
  assert.ok(queries.length > 900);
  const allowed = queries.filter((q) => guard.check(q).allowed);
  assert.deepStrictEqual(allowed, []);
});

test('the script check flags figures that are not in the facts file', () => {
  const bad = 'The limit is $50,000. File within 30 days. The spouse gets 50%. See 755 ILCS 5/2-1. Call (312) 555-0100. Go to 14 W. Jefferson St. in Joliet.';
  const kinds = scriptCheck(bad, facts, guard).map((p) => p.kind).sort();
  assert.deepStrictEqual(kinds, ['address', 'amount', 'citation', 'percentage', 'phone number', 'time period']);
});

test('the script check accepts the figures that are in the facts file', () => {
  const good = 'The limit is $150,000 for deaths on or after August 15, 2025 ($100,000 before), under 755 ILCS 5/25-1 and Public Act 104-0346. Creditors get six months (755 ILCS 5/18-3); the six-month period is the minimum. Most estates take 9 to 12 months, complex ones 12–24 months. File at 50 W. Washington Street, Chicago, (312) 603-6441; 100 W. Jefferson St., Joliet; 100 S. 3rd St., Geneva; 505 N. County Farm Rd., Wheaton; 18 N. County St., Waukegan; or 2200 N. Seminary Ave., Woodstock.';
  assert.deepStrictEqual(scriptCheck(good, facts, guard), []);
});

test('the script check flags named attorneys and firms in a draft', () => {
  const problems = scriptCheck('Many families use Peck Ritchey, LLC. Attorney Smith is popular. Judge Jones presides.', facts, guard);
  assert.ok(problems.some((p) => p.text === 'Peck Ritchey, LLC'));
  assert.ok(problems.some((p) => p.text === 'Attorney Smith'));
  assert.ok(problems.some((p) => p.text === 'Judge Jones'));
  assert.deepStrictEqual(scriptCheck('The Illinois Attorney General and the Probate Division are public offices.', facts, guard), []);
});

test('the five live articles do not trip the named-attorney check', () => {
  for (const f of fs.readdirSync(PATHS.blog)) {
    const names = scriptCheck(fs.readFileSync(path.join(PATHS.blog, f), 'utf8'), facts, guard).filter((p) => p.kind.startsWith('named'));
    assert.deepStrictEqual(names, [], f);
  }
});

test('publishing needs an explicit flag, and canned answers need --dry-run', () => {
  assert.strictEqual(run('publish-drafts.js', []).status, 1);
  assert.notStrictEqual(run('review-drafts.js', ['--mock']).status, 0);
  assert.notStrictEqual(run('run-pipeline.js', ['--publish', '--mock', '--topic=executor fees illinois']).status, 0);
});

test('full dry run: only new topics are drafted, unverified drafts are flagged, nothing is published', () => {
  const before = blogFiles();
  const gitBefore = spawnSync('git', ['status', '--porcelain'], { cwd: PATHS.root, encoding: 'utf8' }).stdout;
  const headBefore = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: PATHS.root, encoding: 'utf8' }).stdout;
  const topics = [
    'what does an executor do in illinois', 'executor fees illinois', 'who inherits if there is no will in illinois', 'how to contest a will in illinois',
    'michael laird attorney', 'probate attorney cicero', 'how long does probate take in illinois', 'sell inherited house chicago', 'best probate attorney chicago',
  ];
  const res = run('run-pipeline.js', ['--dry-run', '--mock', '--max=10', ...topics.map((t) => `--topic=${t}`)]);
  assert.strictEqual(res.status, 0, res.stderr);

  const out = dirs(true);
  const gaps = readJson(out.gaps);
  assert.deepStrictEqual(gaps.candidates.map((c) => c.query), topics.slice(0, 4));
  assert.strictEqual(gaps.rejected.length, 5);

  const verdict = (slug) => readJson(path.join(out.reviews, `${slug}.json`)).verdict;
  assert.strictEqual(verdict('what-does-an-executor-do-in-illinois'), 'approved');
  assert.strictEqual(verdict('executor-fees-illinois'), 'flagged'); // Sonnet's answer: statements not in the facts file
  assert.strictEqual(verdict('who-inherits-if-there-is-no-will-in-illinois'), 'flagged'); // script check alone
  assert.strictEqual(verdict('how-to-contest-a-will-in-illinois'), 'flagged'); // names a firm

  const decisions = readJson(path.join(out.base, 'publish-decisions.json'));
  assert.ok(decisions.every((d) => d.ok === false));
  assert.ok(fs.existsSync(out.report));

  assert.strictEqual(blogFiles(), before);
  assert.strictEqual(spawnSync('git', ['status', '--porcelain'], { cwd: PATHS.root, encoding: 'utf8' }).stdout, gitBefore);
  assert.strictEqual(spawnSync('git', ['rev-parse', 'HEAD'], { cwd: PATHS.root, encoding: 'utf8' }).stdout, headBefore);
});
