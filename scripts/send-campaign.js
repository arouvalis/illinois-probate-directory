#!/usr/bin/env node
'use strict';
// Sends the attorney "Verify your listing" email, a batch at a time.
//
//   node scripts/send-campaign.js                 dry run: prints what would be sent, sends nothing
//   node scripts/send-campaign.js --send          sends the next batch (50 unless --limit says otherwise)
//   node scripts/send-campaign.js --limit 20      batch size
//   node scripts/send-campaign.js --send --test-to you@example.com
//                                                 sends ONE sample to you and records nothing
//   node scripts/send-campaign.js --unsubscribe someone@firm.com
//                                                 adds an address to the unsubscribe list by hand
//   node scripts/send-campaign.js --forget someone@firm.com
//                                                 clears the "sent" mark so the next run sends to it again
//
// Reads   data/campaign/attorneys.csv   firm_name, email and (optional) slug
//         data/campaign/verify-email.md the email text
//         data/verify-listing-links.csv each listing's own verify link
// Writes  data/campaign/unmatched.csv   rows it could not tie to one listing
//         data/campaign/skipped.csv     rows left out, and why
//         data/campaign/send-log.csv    one line per send or failed send
//
// Skips anyone already verified, unsubscribed, marked "do not send", or already
// sent this campaign. Full instructions: data/campaign/README.md
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const c = require('./lib/campaign');

const ROOT = path.join(__dirname, '..');
const FROM_ADDRESS = 'andy@illinoisprobatedirectory.com';
const REPLY_TO = 'arouvalis@gmail.com';
const DEFAULT_FROM_NAME = 'Andy Rouvalis';
const DEFAULT_LIMIT = 50;
const PAUSE_MS = 600; // Resend allows about two sends a second
const STOP_AFTER_FAILURES = 3;

// ── Settings ────────────────────────────────────────────────────────────────

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function parseArgs(argv) {
  const a = { send: false, limit: DEFAULT_LIMIT, campaign: 'verify-listing', csv: null, out: null, template: null, testTo: null, unsubscribe: null, forget: null, storeEnv: 'production' };
  const value = (i, flag) => {
    if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) die(`${flag} needs a value after it.`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=(.*)/s);
    const next = () => (inline !== undefined ? inline : (i++, value(i - 1, flag)));
    if (flag === '--send') a.send = true;
    else if (flag === '--dry-run') a.send = false;
    else if (flag === '--limit') a.limit = Number(next());
    else if (flag === '--campaign') a.campaign = next();
    else if (flag === '--csv') a.csv = next();
    else if (flag === '--out') a.out = next();
    else if (flag === '--template') a.template = next();
    else if (flag === '--test-to') a.testTo = next().trim().toLowerCase();
    else if (flag === '--unsubscribe') a.unsubscribe = next().trim().toLowerCase();
    else if (flag === '--forget') a.forget = next().trim().toLowerCase();
    else if (flag === '--store-env') a.storeEnv = next();
    else if (flag === '--help' || flag === '-h') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 23).map((l) => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0); }
    else die(`Unknown option: ${argv[i]}. Run with --help to see the options.`);
  }
  if (argv.includes('--dry-run') && argv.includes('--send')) die('Use either --dry-run or --send, not both.');
  if (!Number.isInteger(a.limit) || a.limit < 1 || a.limit > 500) die('--limit must be a whole number from 1 to 500.');
  if (!/^[a-z0-9-]{1,40}$/.test(a.campaign)) die('--campaign may only use lower-case letters, digits and dashes (max 40).');
  if (!/^(production|preview|development)$/.test(a.storeEnv)) die('--store-env must be production, preview or development.');
  for (const [flag, v] of [['--test-to', a.testTo], ['--unsubscribe', a.unsubscribe], ['--forget', a.forget]]) {
    if (v !== null && !c.EMAIL_RE.test(v)) die(`${flag} needs a valid email address.`);
  }
  if (a.testTo && !a.send) die('--test-to sends a real email, so it needs --send as well.');
  return a;
}

function die(message) {
  console.error(`\nSTOPPED: ${message}\n`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── The database (the site's Upstash store, same keys the site uses) ────────

function makeStore(storeEnv) {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) return null;
  const prefix = `ipd:${storeEnv}:`;
  const run = async (command) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) throw new Error(`Database error: ${data?.error ?? res.status}`);
    return data.result;
  };
  const parse = (raw) => { try { return typeof raw === 'string' ? JSON.parse(raw) : null; } catch { return null; } };
  return {
    get: async (key) => parse(await run(['GET', prefix + key])),
    /** Many keys at once; returns values in the same order (null where missing). */
    getMany: async (keys) => {
      const out = [];
      for (let i = 0; i < keys.length; i += 200) {
        const part = keys.slice(i, i + 200);
        out.push(...(await run(['MGET', ...part.map((k) => prefix + k)])).map(parse));
      }
      return out;
    },
    set: (key, value) => run(['SET', prefix + key, JSON.stringify(value)]),
    /** Saves only if the key is not there yet. True when this call saved it. */
    setIfNew: async (key, value) => (await run(['SET', prefix + key, JSON.stringify(value), 'NX'])) === 'OK',
    del: (key) => run(['DEL', prefix + key]),
  };
}

// ── Files ───────────────────────────────────────────────────────────────────

const LOG_COLUMNS = ['time', 'campaign', 'mode', 'email', 'firm_name', 'slug', 'status', 'resend_id', 'error'];

function readLog(file) {
  return fs.existsSync(file) ? c.csvObjects(fs.readFileSync(file, 'utf8')).rows : [];
}

function appendLog(file, entry) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, LOG_COLUMNS.join(',') + '\n');
  fs.appendFileSync(file, c.csvLine(LOG_COLUMNS.map((k) => entry[k] ?? '')) + '\n');
}

function writeReport(file, columns, rows) {
  fs.writeFileSync(file, [columns.join(','), ...rows.map((r) => c.csvLine(columns.map((k) => r[k])))].join('\n') + '\n');
}

function doNotSendSlugs() {
  const file = path.join(ROOT, 'data/attorney-records.json');
  if (!fs.existsSync(file)) return new Set();
  const records = JSON.parse(fs.readFileSync(file, 'utf8'));
  return new Set(Object.keys(records).filter((slug) => !slug.startsWith('_') && String(records[slug]?.referral_preference ?? '').trim().toLowerCase() === 'do not send'));
}

// ── Sending ─────────────────────────────────────────────────────────────────

async function resendSend(payload, idempotencyKey) {
  const base = (process.env.RESEND_API_URL || 'https://api.resend.com').replace(/\/+$/, '');
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${base}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 429 && attempt < 4) { await sleep(2000 * attempt); continue; }
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: `Resend said ${res.status}: ${data?.message ?? 'no details'}` };
    return { ok: true, id: data?.id ?? '' };
  }
}

function buildPayload(template, fromName, to, rendered, unsubscribeLink) {
  return {
    from: `${fromName} <${FROM_ADDRESS}>`,
    to: [to],
    reply_to: REPLY_TO,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    // Lets Gmail, Outlook and others show their own "Unsubscribe" button.
    headers: { 'List-Unsubscribe': `<${unsubscribeLink.replace('/unsubscribe?', '/api/unsubscribe?')}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

/** Asks the site whether it recognises an unsubscribe link we just made. */
async function siteKnowsToken(siteUrl, token) {
  try {
    const res = await fetch(`${siteUrl}/api/unsubscribe?t=${token}`, { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => null);
    return data?.valid === true ? { ok: true } : { ok: false, why: `the site answered ${res.status}${data ? ' ' + JSON.stringify(data) : ''}` };
  } catch (err) {
    return { ok: false, why: `the site could not be reached (${err.cause?.code ?? err.message})` };
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnvFile(path.join(ROOT, '.env.local'));
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = (process.env.CAMPAIGN_SITE_URL || 'https://www.illinoisprobatedirectory.com').replace(/\/+$/, '');
  const store = makeStore(args.storeEnv);
  const NO_STORE = 'The database settings are missing (KV_REST_API_URL and KV_REST_API_TOKEN). See data/campaign/README.md.';

  if (args.unsubscribe) {
    if (!store) die(NO_STORE);
    const key = `unsub:${c.emailKey(args.unsubscribe)}`;
    if (await store.get(key)) console.log(`${args.unsubscribe} was already on the unsubscribe list.`);
    else {
      await store.set(key, { email: args.unsubscribe, at: new Date().toISOString(), via: 'manual' });
      console.log(`Added ${args.unsubscribe} to the unsubscribe list. Campaign emails will skip it from now on.`);
    }
    return;
  }

  if (args.forget) {
    if (!store) die(NO_STORE);
    const removed = await store.del(`campaign:${args.campaign}:sent:${c.emailKey(args.forget)}`);
    console.log(removed ? `Cleared the "sent" mark for ${args.forget} in campaign "${args.campaign}". The next run will send to it.` : `${args.forget} had no "sent" mark in campaign "${args.campaign}".`);
    if (removed) console.log('If data/campaign/send-log.csv has a "sent" line for this address, delete that line too.');
    return;
  }

  const csvPath = path.resolve(args.csv ?? path.join(ROOT, 'data/campaign/attorneys.csv'));
  const outDir = path.resolve(args.out ?? path.dirname(csvPath));
  const templatePath = path.resolve(args.template ?? path.join(ROOT, 'data/campaign/verify-email.md'));
  const logPath = path.join(outDir, 'send-log.csv');
  const rel = (p) => path.relative(process.cwd(), p) || p;

  if (!fs.existsSync(csvPath)) die(`The attorney list was not found at ${rel(csvPath)}. Save it there with the columns firm_name, email and (optional) slug.`);
  const input = c.csvObjects(fs.readFileSync(csvPath, 'utf8'));
  if (!input.columns.includes('email') || !['firm_name', 'firm', 'name', 'slug'].some((k) => input.columns.includes(k))) {
    die(`${rel(csvPath)} needs a first row naming its columns: firm_name, email and (optional) slug. Found: ${input.columns.join(', ') || 'nothing'}.`);
  }
  const listings = c.loadListings(fs.readFileSync(path.join(ROOT, 'data/verify-listing-links.csv'), 'utf8'));
  const template = c.parseTemplate(fs.readFileSync(templatePath, 'utf8'));
  const fromName = template.fromName || DEFAULT_FROM_NAME;
  const problems = c.templateProblems(template);

  console.log(`\n${args.send ? (args.testTo ? 'TEST SEND (one email, to you)' : 'SENDING') : 'DRY RUN: nothing will be sent'}   campaign "${args.campaign}"`);
  console.log(`List: ${rel(csvPath)} (${input.rows.length} rows)\n`);

  // 1. Tie each row to one listing.
  const { matched, unmatched } = c.matchRows(input.rows, listings);
  fs.mkdirSync(outDir, { recursive: true });
  writeReport(path.join(outDir, 'unmatched.csv'), ['line', 'firm_name', 'email', 'slug', 'reason', 'suggestions'], unmatched);

  // 2. Leave out anyone who should not get it.
  const noSend = doNotSendSlugs();
  const logged = readLog(logPath).filter((r) => r.campaign === args.campaign && r.mode === 'send' && r.status === 'sent');
  const sentLocally = new Set(logged.map((r) => r.email.toLowerCase()));
  let verified = matched.map(() => null);
  let unsubscribed = matched.map(() => null);
  let sentInStore = matched.map(() => null);
  if (store) {
    try {
      verified = await store.getMany(matched.map((m) => `attorney:${m.slug}`));
      unsubscribed = await store.getMany(matched.map((m) => `unsub:${c.emailKey(m.email)}`));
      sentInStore = await store.getMany(matched.map((m) => `campaign:${args.campaign}:sent:${c.emailKey(m.email)}`));
    } catch (err) {
      die(`The database could not be read (${err.message}). Nothing was sent.`);
    }
  } else if (args.send) die(NO_STORE);

  const skipped = [];
  const eligible = [];
  matched.forEach((m, i) => {
    let reason = '';
    if (noSend.has(m.slug)) reason = 'Marked "do not send" in data/attorney-records.json.';
    else if (verified[i]) reason = 'Already verified (the listing has an approved email).';
    else if (unsubscribed[i]) reason = `Unsubscribed${unsubscribed[i].at ? ' on ' + String(unsubscribed[i].at).slice(0, 10) : ''}.`;
    else if (sentInStore[i]?.status === 'sending') reason = 'An earlier run stopped part-way through this one. Check the Resend log to see whether it went, then see README ("If a run is interrupted").';
    else if (sentInStore[i] || sentLocally.has(m.email)) reason = `Already sent this campaign${sentInStore[i]?.at ? ' on ' + String(sentInStore[i].at).slice(0, 10) : ''}.`;
    if (reason) skipped.push({ ...m, reason });
    else eligible.push(m);
  });
  writeReport(path.join(outDir, 'skipped.csv'), ['line', 'firm_name', 'email', 'slug', 'reason'], skipped);

  const batch = eligible.slice(0, args.limit);
  const count = (re) => skipped.filter((s) => re.test(s.reason)).length;
  console.log(`  ${String(matched.length).padStart(4)} matched to a listing`);
  console.log(`  ${String(unmatched.length).padStart(4)} NOT matched${unmatched.length ? `  -> fix by hand: ${rel(path.join(outDir, 'unmatched.csv'))}` : ''}`);
  console.log(`  ${String(skipped.length).padStart(4)} skipped (${count(/^Already verified/)} verified, ${count(/^Unsubscribed/)} unsubscribed, ${count(/^Already sent/)} already sent, ${count(/do not send/)} do-not-send, ${count(/part-way/)} interrupted)${skipped.length ? `  -> ${rel(path.join(outDir, 'skipped.csv'))}` : ''}`);
  console.log(`  ${String(eligible.length).padStart(4)} still to send; this run takes ${batch.length} (batch size ${args.limit})\n`);
  if (!store) console.log('  WARNING: no database settings found, so this dry run could NOT check who is already\n  verified, unsubscribed or sent. Only the send log on this computer was checked.\n  A real send refuses to run without them.\n');
  if (problems.length) console.log(`  The email text (${rel(templatePath)}) is not ready:\n${problems.map((p) => `   - ${p}`).join('\n')}\n`);

  // ── Dry run ──
  if (!args.send) {
    if (!batch.length) { console.log('Nobody to send to in this run.\n'); return; }
    console.log(`Would send ${batch.length} email${batch.length === 1 ? '' : 's'} from ${fromName} <${FROM_ADDRESS}>, replies to ${REPLY_TO}:\n`);
    batch.forEach((m, i) => console.log(`  ${String(i + 1).padStart(3)}. ${m.email}\n       ${m.firm_name}${m.firm_name !== m.listing_name ? `  (listing: ${m.listing_name})` : ''}\n       ${m.verify_link}`));
    const first = batch[0];
    const sample = c.renderEmail(template, { ...first, unsubscribe_link: `${siteUrl}/unsubscribe?t=(made when the email is sent)` });
    console.log(`\n──── The first email, as it would be sent ────\nFrom: ${fromName} <${FROM_ADDRESS}>\nReply-To: ${REPLY_TO}\nTo: ${first.email}\nSubject: ${sample.subject}\n\n${sample.text}──────────────────────────────────────────────`);
    console.log(`\nDRY RUN: nothing was sent and nothing was recorded. Add --send to send these ${batch.length}.\n`);
    return;
  }

  // ── Real send ──
  if (problems.length) die('The email text is not ready (see above). Nothing was sent.');
  if (!process.env.RESEND_API_KEY) die('RESEND_API_KEY is missing. See data/campaign/README.md. Nothing was sent.');

  if (args.testTo) {
    const m = eligible[0] ?? matched[0];
    if (!m) die('There is no matched row to use as the sample.');
    const token = crypto.randomBytes(16).toString('hex');
    await store.set(`unsubtoken:${token}`, { email: args.testTo, campaign: args.campaign, slug: m.slug });
    const check = await siteKnowsToken(siteUrl, token);
    if (!check.ok) console.log(`  WARNING: the unsubscribe link in this test will not work yet: ${check.why}.`);
    const link = `${siteUrl}/unsubscribe?t=${token}`;
    const rendered = c.renderEmail(template, { ...m, unsubscribe_link: link });
    rendered.subject = `[TEST] ${rendered.subject}`;
    const result = await resendSend(buildPayload(template, fromName, args.testTo, rendered, link));
    appendLog(logPath, { time: new Date().toISOString(), campaign: args.campaign, mode: 'test', email: args.testTo, firm_name: m.firm_name, slug: m.slug, status: result.ok ? 'sent' : 'failed', resend_id: result.id, error: result.error });
    if (!result.ok) die(`The test email was not sent. ${result.error}`);
    console.log(`Sent one test email to ${args.testTo}, written as if to ${m.firm_name} (${m.email}). Nothing was recorded as sent to them.\n`);
    return;
  }

  if (!batch.length) { console.log('Nobody to send to in this run.\n'); return; }
  let sent = 0;
  let failed = 0;
  let failuresInARow = 0;
  let linkChecked = false;
  for (const m of batch) {
    const sentKey = `campaign:${args.campaign}:sent:${c.emailKey(m.email)}`;
    const log = (status, extra = {}) => appendLog(logPath, { time: new Date().toISOString(), campaign: args.campaign, mode: 'send', email: m.email, firm_name: m.firm_name, slug: m.slug, status, ...extra });
    // Reserve this address first, so two runs can never both send to it.
    const mine = await store.setIfNew(sentKey, { email: m.email, slug: m.slug, status: 'sending', at: new Date().toISOString() });
    if (!mine) { console.log(`  skipped  ${m.email} (another run got there first)`); continue; }
    const token = crypto.randomBytes(16).toString('hex');
    await store.set(`unsubtoken:${token}`, { email: m.email, campaign: args.campaign, slug: m.slug });

    if (!linkChecked) {
      // Before the first email leaves: make sure its unsubscribe link really works on the site.
      const check = await siteKnowsToken(siteUrl, token);
      if (!check.ok) {
        await store.del(sentKey);
        await store.del(`unsubtoken:${token}`);
        die(`The unsubscribe link would not work: ${check.why}.\nChecked ${siteUrl}/api/unsubscribe. The /unsubscribe page must be live and using the same database as this script. Nothing was sent.`);
      }
      linkChecked = true;
    }

    const link = `${siteUrl}/unsubscribe?t=${token}`;
    const rendered = c.renderEmail(template, { ...m, unsubscribe_link: link });
    let result;
    try {
      result = await resendSend(buildPayload(template, fromName, m.email, rendered, link), `${args.campaign}-${c.emailKey(m.email)}`);
    } catch (err) {
      result = { ok: false, error: `Could not reach Resend (${err.cause?.code ?? err.message})` };
    }
    if (result.ok) {
      await store.set(sentKey, { email: m.email, slug: m.slug, status: 'sent', at: new Date().toISOString(), resend_id: result.id });
      log('sent', { resend_id: result.id });
      sent++;
      failuresInARow = 0;
      console.log(`  sent     ${m.email}  (${m.firm_name})`);
    } else {
      await store.del(sentKey); // so a later run tries this one again
      await store.del(`unsubtoken:${token}`);
      log('failed', { error: result.error });
      failed++;
      failuresInARow++;
      console.log(`  FAILED   ${m.email}  ${result.error}`);
      if (failuresInARow >= STOP_AFTER_FAILURES) {
        console.log(`\n${STOP_AFTER_FAILURES} failures in a row, so the run stopped early.`);
        break;
      }
    }
    await sleep(Number(process.env.CAMPAIGN_PAUSE_MS ?? PAUSE_MS));
  }
  console.log(`\nSent ${sent}, failed ${failed}. ${eligible.length - sent} still to send. Log: ${rel(logPath)}\n`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`\nSTOPPED: ${err.message}\n`);
  process.exit(1);
});
