#!/usr/bin/env node
'use strict';
// Tests for the campaign sender. No real email, database or internet: the
// script is pointed at a stand-in (scripts/lib/mock-services.js).
// Run: npm run test:campaign
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const c = require('./lib/campaign');
const { startMock } = require('./lib/mock-services');

const ROOT = path.join(__dirname, '..');
const FIXTURE = path.join(__dirname, 'test-fixtures/campaign/attorneys.csv');
const listings = c.loadListings(fs.readFileSync(path.join(ROOT, 'data/verify-listing-links.csv'), 'utf8'));
const READY = c.parseTemplate('Subject: A note for {{firm_name}}\nFrom-Name: Andy Rouvalis\n\nHi {{firm_name}},\n\nPlease **check** it: [Verify your listing]({{verify_link}})\n\nAndy');

// ── Pieces ──────────────────────────────────────────────────────────────────

test('CSV reader handles quotes, commas in cells, blank lines and Excel files', () => {
  const { columns, rows } = c.csvObjects('﻿Firm Name,Email\r\n"Smith, Jones & Co ""SJ""",a@b.com\r\n\r\nPlain,c@d.com');
  assert.deepStrictEqual(columns, ['firm_name', 'email']);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].firm_name, 'Smith, Jones & Co "SJ"');
  assert.strictEqual(rows[1]._line, 3);
});

test('every listing in verify-listing-links.csv has a slug and its own link', () => {
  assert.ok(listings.length >= 500);
  assert.strictEqual(new Set(listings.map((l) => l.slug)).size, listings.length);
  for (const l of listings) assert.ok(l.verify_link.includes(`/verify-listing/${l.slug}?`), l.slug);
});

test('rows are matched by slug, then by firm name, and anything uncertain is reported', () => {
  const { matched, unmatched } = c.matchRows(c.csvObjects(fs.readFileSync(FIXTURE, 'utf8')).rows, listings);
  const by = Object.fromEntries(matched.map((m) => [m.email, m.slug]));
  assert.deepStrictEqual(by, {
    'office@adler.example.com': 'adler-law-firm-pc-joliet',     // by slug
    'info@traub.example.com': 'a-traub-associates-lombard',     // "and" for "&", no slug
    'second@adler.example.com': 'adler-law-firm-pc-joliet',     // lower case, "PC" left off
    'gary@adelman.example.com': 'adelman-gary-m-round-lake',    // a pasted profile link as the slug
  });
  const why = Object.fromEntries(unmatched.map((u) => [u.line, u.reason]));
  assert.match(why[5], /3 listings have this name/);
  assert.match(why[6], /No listing has this name/);
  assert.match(why[7], /does not look valid/);
  assert.match(why[8], /Same email address as line 3/);
  assert.match(why[9], /No listing has this slug/);
  assert.match(unmatched.find((u) => u.line === 5).suggestions, /kelleher-holland-llc-waukegan/);
});

test('a slug always wins over the name, and a name shared by two listings never matches', () => {
  const rows = [{ _line: 2, firm_name: 'Adler Law Firm PC', email: 'x@y.com', slug: 'adelman-gary-m-round-lake' }, { _line: 3, firm_name: 'Michael Overmann, Ltd.', email: 'z@y.com', slug: '' }];
  const { matched, unmatched } = c.matchRows(rows, listings);
  assert.strictEqual(matched[0].slug, 'adelman-gary-m-round-lake');
  assert.strictEqual(unmatched.length, 1);
});

test('the email is personalised and always ends with the address and unsubscribe link', () => {
  const e = c.renderEmail(READY, { firm_name: 'Smith & <Sons> *LLC*', verify_link: 'https://www.illinoisprobatedirectory.com/verify-listing/x?src=email', unsubscribe_link: 'https://www.illinoisprobatedirectory.com/unsubscribe?t=abc' });
  assert.strictEqual(e.subject, 'A note for Smith & <Sons> *LLC*');
  assert.match(e.text, /Hi Smith & <Sons> \*LLC\*,/);
  assert.match(e.text, /Verify your listing: https:\/\/www\.illinoisprobatedirectory\.com\/verify-listing\/x\?src=email/);
  assert.match(e.text, /HomeSmart Connect, 1367 W Chicago Ave, Chicago, IL 60642\nUnsubscribe: https:\/\/www\.illinoisprobatedirectory\.com\/unsubscribe\?t=abc/);
  assert.match(e.html, /Hi Smith &amp; &lt;Sons&gt; \*LLC\*,/);
  assert.match(e.html, /<a href="https:\/\/www\.illinoisprobatedirectory\.com\/verify-listing\/x\?src=email">Verify your listing<\/a>/);
  assert.match(e.html, /HomeSmart Connect, 1367 W Chicago Ave, Chicago, IL 60642/);
  assert.match(e.html, /<a href="https:\/\/www\.illinoisprobatedirectory\.com\/unsubscribe\?t=abc"[^>]*>Unsubscribe<\/a>/);
  assert.ok(!/\{\{|%7B/.test(e.text + e.html));
});

test('the placeholder email text in the repository is refused; a finished one is accepted', () => {
  const shipped = c.parseTemplate(fs.readFileSync(path.join(ROOT, 'data/campaign/verify-email.md'), 'utf8'));
  assert.ok(c.templateProblems(shipped).length > 0);
  assert.deepStrictEqual(c.templateProblems(READY), []);
  assert.match(c.templateProblems(c.parseTemplate('Subject: Hi\n\nNo link here'))[0], /verify_link/);
  assert.match(c.templateProblems(c.parseTemplate('Subject: Hi\n\n{{verify_link}} {{first_name}}'))[0], /first_name/);
});

// ── The script, end to end, against the stand-in ────────────────────────────

const READY_TEXT = 'Subject: A note for {{firm_name}}\nFrom-Name: Andy Rouvalis\n\nHi {{firm_name}},\n\n[Verify your listing]({{verify_link}})\n\nAndy\n';

function run(args, mock, extraEnv = {}) {
  const env = { PATH: process.env.PATH, HOME: os.tmpdir(), CAMPAIGN_PAUSE_MS: '0' };
  if (mock) Object.assign(env, { KV_REST_API_URL: mock.url, KV_REST_API_TOKEN: 'test', RESEND_API_KEY: 're_test', RESEND_API_URL: mock.url, CAMPAIGN_SITE_URL: mock.url });
  return new Promise((resolve) => {
    const child = spawn('node', [path.join(__dirname, 'send-campaign.js'), ...args, ...readyTemplate], { cwd: ROOT, env: { ...env, ...extraEnv } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => resolve({ code, out }));
  });
}

/** Runs fn with a finished email text (a temporary file; the real one is not touched). */
async function withReadyTemplate(fn) {
  const file = path.join(tmp(), 'verify-email.md');
  fs.writeFileSync(file, READY_TEXT);
  readyTemplate = ['--template', file];
  try { await fn(); } finally { readyTemplate = []; }
}
let readyTemplate = [];

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'campaign-test-'));
const P = 'ipd:production:';

test('a run without --send sends nothing and records nothing', async () => {
  const mock = await startMock();
  const out = tmp();
  try {
    const r = await run(['--csv', FIXTURE, '--out', out], mock);
    assert.strictEqual(r.code, 0, r.out);
    assert.match(r.out, /DRY RUN: nothing was sent/);
    assert.match(r.out, /4 matched/);
    assert.match(r.out, /5 NOT matched/);
    assert.strictEqual(mock.emails.length, 0);
    assert.strictEqual(mock.data.size, 0);
    assert.ok(!fs.existsSync(path.join(out, 'send-log.csv')));
    assert.strictEqual(c.csvObjects(fs.readFileSync(path.join(out, 'unmatched.csv'), 'utf8')).rows.length, 5);
  } finally { await mock.close(); }
});

test('--send refuses while the email text is still the placeholder', async () => {
  const mock = await startMock();
  try {
    const r = await run(['--csv', FIXTURE, '--out', tmp(), '--send'], mock);
    assert.strictEqual(r.code, 1);
    assert.match(r.out, /not ready/);
    assert.strictEqual(mock.emails.length, 0);
  } finally { await mock.close(); }
});

test('--send refuses without the database settings or the Resend key', async () => {
  await withReadyTemplate(async () => {
    const none = await run(['--csv', FIXTURE, '--out', tmp(), '--send'], null);
    assert.strictEqual(none.code, 1);
    assert.match(none.out, /database settings are missing/);
    const mock = await startMock();
    try {
      const noKey = await run(['--csv', FIXTURE, '--out', tmp(), '--send'], mock, { RESEND_API_KEY: '' });
      assert.strictEqual(noKey.code, 1);
      assert.match(noKey.out, /RESEND_API_KEY is missing/);
      assert.strictEqual(mock.emails.length, 0);
    } finally { await mock.close(); }
  });
});

test('sending: batches, skips verified and unsubscribed, never sends twice, logs every send', async () => {
  const mock = await startMock();
  const out = tmp();
  try {
    await withReadyTemplate(async () => {
      // One listing is already verified, one address has unsubscribed.
      mock.data.set(`${P}attorney:a-traub-associates-lombard`, JSON.stringify({ email: 'real@traub.example.com' }));
      mock.data.set(`${P}unsub:${c.emailKey('gary@adelman.example.com')}`, JSON.stringify({ email: 'gary@adelman.example.com', at: '2026-11-01T00:00:00Z', via: 'page' }));

      const first = await run(['--csv', FIXTURE, '--out', out, '--send', '--limit', '1'], mock);
      assert.strictEqual(first.code, 0, first.out);
      assert.match(first.out, /1 verified, 1 unsubscribed/);
      assert.strictEqual(mock.emails.length, 1);
      const e = mock.emails[0];
      assert.deepStrictEqual(e.to, ['office@adler.example.com']);
      assert.strictEqual(e.from, 'Andy Rouvalis <andy@illinoisprobatedirectory.com>');
      assert.strictEqual(e.reply_to, 'arouvalis@gmail.com');
      assert.strictEqual(e.subject, 'A note for Adler Law Firm PC');
      assert.match(e.text, /verify-listing\/adler-law-firm-pc-joliet\?src=email/);
      assert.match(e.text, /HomeSmart Connect, 1367 W Chicago Ave, Chicago, IL 60642/);
      const token = /unsubscribe\?t=([a-f0-9]{32})/.exec(e.text)[1];
      assert.strictEqual(JSON.parse(mock.data.get(`${P}unsubtoken:${token}`)).email, 'office@adler.example.com');
      assert.strictEqual(e.headers['List-Unsubscribe'], `<${mock.url}/api/unsubscribe?t=${token}>`);
      assert.strictEqual(e.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
      assert.ok(e.idempotencyKey);

      // Second run takes the next person, not the same one.
      const second = await run(['--csv', FIXTURE, '--out', out, '--send'], mock);
      assert.strictEqual(second.code, 0, second.out);
      assert.match(second.out, /1 already sent/);
      assert.deepStrictEqual(mock.emails.map((m) => m.to[0]), ['office@adler.example.com', 'second@adler.example.com']);

      // Third run has nobody left.
      const third = await run(['--csv', FIXTURE, '--out', out, '--send'], mock);
      assert.match(third.out, /Nobody to send to/);
      assert.strictEqual(mock.emails.length, 2);

      // Even with the send log lost, the database remembers.
      fs.rmSync(path.join(out, 'send-log.csv'));
      await run(['--csv', FIXTURE, '--out', out, '--send'], mock);
      assert.strictEqual(mock.emails.length, 2);
    });
    const skipped = c.csvObjects(fs.readFileSync(path.join(out, 'skipped.csv'), 'utf8')).rows;
    assert.strictEqual(skipped.length, 4);
  } finally { await mock.close(); }
});

test('the send log has one line per send, and a refused send is logged and retried next run', async () => {
  const mock = await startMock({ failEmailsTo: ['office@adler.example.com'] });
  const out = tmp();
  try {
    await withReadyTemplate(async () => {
      const r = await run(['--csv', FIXTURE, '--out', out, '--send'], mock);
      assert.strictEqual(r.code, 1);
      const log = c.csvObjects(fs.readFileSync(path.join(out, 'send-log.csv'), 'utf8')).rows;
      assert.deepStrictEqual(log.map((l) => `${l.email} ${l.status}`), [
        'office@adler.example.com failed', 'info@traub.example.com sent', 'second@adler.example.com sent', 'gary@adelman.example.com sent',
      ]);
      assert.ok(log[1].resend_id && log[1].time && log[1].slug === 'a-traub-associates-lombard');
      assert.match(log[0].error, /mock refusal/);
      // The failed one is not marked as sent, so the next run would try it again.
      assert.ok(!mock.data.has(`${P}campaign:verify-listing:sent:${c.emailKey('office@adler.example.com')}`));
      const dry = await run(['--csv', FIXTURE, '--out', out], mock);
      assert.match(dry.out, /1 still to send/);
    });
  } finally { await mock.close(); }
});

test('nothing is sent if the site does not recognise the unsubscribe link', async () => {
  const mock = await startMock({ siteKnowsTokens: false });
  try {
    await withReadyTemplate(async () => {
      const r = await run(['--csv', FIXTURE, '--out', tmp(), '--send'], mock);
      assert.strictEqual(r.code, 1);
      assert.match(r.out, /unsubscribe link would not work/);
      assert.strictEqual(mock.emails.length, 0);
      assert.strictEqual(mock.data.size, 0);
    });
  } finally { await mock.close(); }
});

test('--test-to sends one sample to that address and marks nobody as sent', async () => {
  const mock = await startMock();
  try {
    await withReadyTemplate(async () => {
      const r = await run(['--csv', FIXTURE, '--out', tmp(), '--send', '--test-to', 'me@example.com'], mock);
      assert.strictEqual(r.code, 0, r.out);
      assert.strictEqual(mock.emails.length, 1);
      assert.deepStrictEqual(mock.emails[0].to, ['me@example.com']);
      assert.match(mock.emails[0].subject, /^\[TEST\] /);
      assert.ok(![...mock.data.keys()].some((k) => k.includes(':sent:')));
    });
    const noSend = await run(['--csv', FIXTURE, '--out', tmp(), '--test-to', 'me@example.com'], mock);
    assert.strictEqual(noSend.code, 1);
  } finally { await mock.close(); }
});

test('--unsubscribe adds an address by hand and the next run skips it', async () => {
  const mock = await startMock();
  try {
    const r = await run(['--unsubscribe', 'Office@Adler.example.com'], mock);
    assert.strictEqual(r.code, 0, r.out);
    const dry = await run(['--csv', FIXTURE, '--out', tmp()], mock);
    assert.match(dry.out, /1 unsubscribed/);
    assert.match(dry.out, /3 still to send/);
  } finally { await mock.close(); }
});
