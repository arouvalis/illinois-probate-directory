'use strict';
// Helpers for scripts/send-campaign.js. Nothing in this file sends email or
// touches the network, so it can be tested on its own (scripts/test-campaign.js).
const crypto = require('crypto');
const { marked } = require('marked');

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const MAILING_ADDRESS = 'HomeSmart Connect, 1367 W Chicago Ave, Chicago, IL 60642';
// The sender refuses to send while this marker is still in the email text.
const PLACEHOLDER = '[[PLACEHOLDER]]';

// ── CSV ─────────────────────────────────────────────────────────────────────

/** Reads CSV text (quoted cells, commas and line breaks inside quotes, Excel's
 *  hidden first character) into an array of rows, each an array of cells. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Rows as objects keyed by the header row (lower-cased, spaces to underscores). */
function csvObjects(text) {
  const [header, ...rows] = parseCsv(text);
  if (!header) return { columns: [], rows: [] };
  const columns = header.map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
  return {
    columns,
    rows: rows.map((r, i) => {
      const o = { _line: i + 2 };
      columns.forEach((c, j) => { o[c] = (r[j] ?? '').trim(); });
      return o;
    }),
  };
}

function csvLine(cells) {
  return cells.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
}

// ── Matching CSV rows to listings ───────────────────────────────────────────

function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[&+]/g, ' and ')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Company endings that people include or leave off: "Adler Law Firm PC" and
// "Adler Law Firm" are treated as the same name, as long as only one listing fits.
const ENDINGS = new Set(['llc', 'pllc', 'pc', 'ltd', 'llp', 'inc', 'chtd', 'sc', 'pa', 'apc', 'lpa', 'the']);
function looseName(name) {
  const words = normalizeName(name).split(' ').filter((w) => !ENDINGS.has(w));
  return words.join(' ');
}

/** "a-traub-associates-lombard" from a slug, a profile link or a verify link. */
function cleanSlug(value) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  const path = v.replace(/[?#].*$/, '').replace(/\/+$/, '');
  return path.slice(path.lastIndexOf('/') + 1).toLowerCase();
}

/** Listings from data/verify-listing-links.csv: [{ slug, name, city, verify_link }]. */
function loadListings(linksCsvText) {
  return csvObjects(linksCsvText).rows
    .filter((r) => r.verify_link)
    .map((r) => ({ slug: cleanSlug(r.verify_link), name: r.name, city: r.city, website: r.website, verify_link: r.verify_link }));
}

// Words too common in firm names to say anything about which firm it is.
const COMMON = new Set(['law', 'laws', 'legal', 'group', 'firm', 'office', 'offices', 'attorney', 'attorneys', 'associates', 'partners', 'and', 'of', 'at', 'estate', 'probate']);
const keyWords = (name) => new Set(looseName(name).split(' ').filter((w) => w.length > 1 && !COMMON.has(w)));

function suggestions(firmName, listings) {
  const want = keyWords(firmName);
  if (!want.size) return [];
  return listings
    .map((l) => {
      const have = keyWords(l.name);
      let shared = 0;
      for (const w of want) if (have.has(w)) shared++;
      return { l, score: shared / (want.size + have.size - shared || 1) };
    })
    .filter((x) => x.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.l);
}

const describe = (l) => `${l.name} (${l.city}) = ${l.slug}`;

/**
 * Matches each CSV row to one listing: by slug when the row has one, otherwise
 * by firm name. A name only matches when exactly one listing has it; anything
 * less certain goes to the unmatched report rather than risk emailing one firm
 * another firm's link.
 */
function matchRows(rows, listings) {
  const bySlug = new Map(listings.map((l) => [l.slug, l]));
  const index = (fn) => {
    const m = new Map();
    for (const l of listings) {
      const k = fn(l.name);
      if (k) m.set(k, [...(m.get(k) ?? []), l]);
    }
    return m;
  };
  const exact = index(normalizeName);
  const loose = index(looseName);

  const matched = [];
  const unmatched = [];
  const seenEmail = new Map();
  for (const row of rows) {
    const firmName = row.firm_name ?? row.firm ?? row.name ?? '';
    const email = (row.email ?? '').trim().toLowerCase();
    const slugGiven = cleanSlug(row.slug);
    const fail = (reason, suggest = []) =>
      unmatched.push({ line: row._line, firm_name: firmName, email: row.email ?? '', slug: row.slug ?? '', reason, suggestions: suggest.map(describe).join(' | ') });

    if (!EMAIL_RE.test(email)) { fail(email ? 'The email address does not look valid.' : 'No email address.'); continue; }
    if (seenEmail.has(email)) { fail(`Same email address as line ${seenEmail.get(email)}; only the first is used.`); continue; }

    let listing = null;
    if (slugGiven) {
      listing = bySlug.get(slugGiven) ?? null;
      if (!listing) { fail('No listing has this slug.', suggestions(firmName, listings)); continue; }
    } else {
      if (!normalizeName(firmName)) { fail('No firm name and no slug.'); continue; }
      const hits = exact.get(normalizeName(firmName)) ?? loose.get(looseName(firmName)) ?? [];
      if (hits.length === 1) listing = hits[0];
      else if (hits.length > 1) { fail(`${hits.length} listings have this name. Add the right slug to the row.`, hits); continue; }
      else { fail('No listing has this name. Add the right slug to the row.', suggestions(firmName, listings)); continue; }
    }
    seenEmail.set(email, row._line);
    matched.push({ line: row._line, email, firm_name: firmName.trim() || listing.name, slug: listing.slug, listing_name: listing.name, verify_link: listing.verify_link });
  }
  return { matched, unmatched };
}

// ── The email ───────────────────────────────────────────────────────────────

/** Short fingerprint of an email address, used in database keys. Must stay the
 *  same as emailKey in src/lib/verifyListing.ts and src/lib/unsubscribe.ts. */
function emailKey(email) {
  return crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex').slice(0, 24);
}

/** Splits data/campaign/verify-email.md into its "Subject:" style lines and the body. */
function parseTemplate(text) {
  const lines = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');
  const headers = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const m = /^([A-Za-z-]+):\s*(.*)$/.exec(lines[i]);
    if (!m) break;
    headers[m[1].toLowerCase()] = m[2].trim();
  }
  const body = lines.slice(i).join('\n').trim();
  return { subject: headers.subject ?? '', fromName: headers['from-name'] ?? '', body };
}

/** Reasons the email text is not ready to send. Empty when it is. */
function templateProblems(template) {
  const problems = [];
  if (!template.subject) problems.push('There is no "Subject:" line at the top.');
  if (!template.body) problems.push('The email has no text.');
  if ((template.subject + template.body).includes(PLACEHOLDER)) problems.push(`It still contains the ${PLACEHOLDER} marker, so the text has not been filled in.`);
  if (!template.body.includes('{{verify_link}}')) problems.push('It does not contain {{verify_link}}, so nobody would get their link.');
  const unknown = [...new Set((template.subject + template.body).match(/\{\{[^}]*\}\}/g) ?? [])].filter((t) => !['{{firm_name}}', '{{verify_link}}'].includes(t));
  if (unknown.length) problems.push(`Unknown fill-in field: ${unknown.join(', ')}. Only {{firm_name}} and {{verify_link}} are filled in.`);
  return problems;
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (text, values) => text.replace(/\{\{(firm_name|verify_link)\}\}/g, (_, k) => values[k]);

/** Markdown to plain text: links become "label: address", emphasis marks go. */
function markdownToText(md) {
  return md
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => (label.trim() === url ? url : `${label}: ${url}`))
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/^#{1,6}\s+/gm, '');
}

/**
 * One recipient's email: subject, plain-text and HTML versions. The footer
 * (mailing address and unsubscribe link) is added here, not in the text file,
 * so it cannot be left out by accident.
 */
function renderEmail(template, { firm_name, verify_link, unsubscribe_link }) {
  const subject = fill(template.subject, { firm_name, verify_link });
  const text = `${fill(markdownToText(template.body), { firm_name, verify_link })}\n\n--\n${MAILING_ADDRESS}\nUnsubscribe: ${unsubscribe_link}\n`;

  // Fill in after converting, so a firm name containing * or _ or & is shown as typed.
  const bodyHtml = marked
    .parse(template.body, { breaks: true })
    .replace(/%7B%7B(firm_name|verify_link)%7D%7D/g, '{{$1}}');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1f2937;max-width:600px">
${fill(bodyHtml, { firm_name: escapeHtml(firm_name), verify_link: escapeHtml(verify_link) })}
<p style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280">${escapeHtml(MAILING_ADDRESS)}<br><a href="${escapeHtml(unsubscribe_link)}" style="color:#6b7280">Unsubscribe</a></p>
</div>`;
  return { subject, text, html };
}

module.exports = {
  EMAIL_RE, MAILING_ADDRESS, PLACEHOLDER,
  parseCsv, csvObjects, csvLine,
  normalizeName, looseName, cleanSlug, loadListings, matchRows,
  emailKey, parseTemplate, templateProblems, renderEmail, markdownToText,
};
