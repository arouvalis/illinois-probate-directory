'use strict';
// The topic guard. Every stage of the blog pipeline asks it one question:
// "May the blog write about this search query?" The answer is no when
//   - the query names (or may name) an attorney or a law firm,
//   - a page on IPD or CPS already owns the topic (data/query-page-map.json),
//   - the topic was removed in Phase 4b, or its address now redirects,
//   - an article on the same topic already exists,
//   - the brief rules it out (rankings, places and practice areas IPD does not cover).
// When in doubt the answer is no.

const fs = require('fs');
const path = require('path');
const { PATHS, readJson } = require('./config');
const { VOCABULARY } = require('./vocabulary');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function slugify(text) {
  return normalize(text).replace(/ /g, '-');
}

function hasPhrase(normQuery, phrase) {
  return (' ' + normQuery + ' ').includes(' ' + phrase + ' ');
}

// One match alternative = list of groups; every group needs one of its phrases.
function matchesAny(normQuery, alternatives) {
  return (alternatives || []).some((groups) =>
    groups.every((group) => group.split('|').some((p) => hasPhrase(normQuery, normalize(p))))
  );
}

// Words that carry no topic of their own, ignored when comparing two topics.
const FILLER = new Set(
  'a an and are as at be by can do does for from how i if in into is it my of on or the to what when where which who why will with you your il ill illinois state'.split(' ')
);
function contentTokens(text) {
  return normalize(text).split(' ').filter((t) => t && !FILLER.has(t)).map(stem);
}
function stem(t) {
  if (t === 'lawyer' || t === 'lawyers' || t === 'attorneys') return 'attorney';
  if (t.length > 4 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}
function similarity(a, b) {
  const A = new Set(contentTokens(a));
  const B = new Set(contentTokens(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / (A.size + B.size - shared);
}
const SIMILAR = 0.6; // at or above this, two topics count as the same topic

function loadGuard(overrides = {}) {
  const map = overrides.map || readJson(PATHS.map);
  const attorneys = overrides.attorneys || readJson(PATHS.attorneys);
  const removedAttorneys = overrides.removedAttorneys || readJson(PATHS.removedAttorneys);
  const blogDir = overrides.blogDir || PATHS.blog;

  // ── Places: towns and counties in the directory ──
  const townCounty = new Map(); // "lake in the hills" -> "McHenry"
  for (const a of attorneys) {
    const town = normalize(a.city);
    if (town && !townCounty.has(town)) townCounty.set(town, a.source_county || '');
  }
  const counties = ['cook', 'dupage', 'kane', 'lake', 'mchenry', 'will'];
  const cityPages = fs.existsSync(PATHS.cityPages)
    ? fs.readdirSync(PATHS.cityPages).filter((d) => d.endsWith('-probate-attorney'))
    : [];
  const cityPageByTown = new Map(cityPages.map((d) => [d.replace(/-probate-attorney$/, '').replace(/-/g, ' '), `/city/${d}`]));
  const placePhrases = [...new Set([...townCounty.keys(), ...cityPageByTown.keys(), 'chicagoland', 'du page'])]
    .sort((a, b) => b.length - a.length);
  const placeWords = new Set(counties);
  for (const p of placePhrases) for (const w of p.split(' ')) placeWords.add(w);

  // ── Names: every word in a listing name that is not an ordinary word or a place ──
  const GENERIC_NAME_WORDS = new Set(
    'law laws office offices attorney attorneys lawyer lawyers legal group firm llc llp ltd pc p c inc co corp chartered associates associate partners and of the at esq jr sr ii iii center centre services service solutions planning elder care north south east west shore suburban northwest southwest midwest american national first pro matters'.split(' ')
  );
  const nameWords = new Set();
  const fullNames = [];
  for (const a of [...attorneys, ...removedAttorneys]) {
    const n = normalize(a.name);
    if (!n) continue;
    let distinctive = 0;
    for (const w of n.split(' ')) {
      if (w.length < 3 || /^\d+$/.test(w)) continue;
      if (VOCABULARY.has(w) || GENERIC_NAME_WORDS.has(w) || placeWords.has(w)) continue;
      nameWords.add(w);
      distinctive++;
    }
    fullNames.push({ name: a.name, norm: n, distinctive: distinctive > 0 });
  }

  // ── Removed and redirected blog addresses ──
  const removed = new Map(); // slug -> where it goes now
  for (const r of map.removedPosts || []) removed.set(r.slug, r.redirectTo);
  // Also every /blog/... redirect in next.config.mjs, so a redirect added later
  // is respected even if nobody updates the map.
  if (fs.existsSync(PATHS.nextConfig)) {
    const cfg = fs.readFileSync(PATHS.nextConfig, 'utf8');
    const re = /source:\s*"\/blog\/([^"]+)",\s*destination:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(cfg))) if (!removed.has(m[1])) removed.set(m[1], m[2]);
  }

  // ── Articles that exist today ──
  const existing = [];
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'))) {
      const first = fs.readFileSync(path.join(blogDir, f), 'utf8').split('\n').find((l) => l.startsWith('# ')) || '';
      existing.push({ slug: f.replace(/\.md$/, ''), title: first.replace(/^#\s+/, '') });
    }
  }

  function findPlace(q) {
    for (const c of counties) {
      if (hasPhrase(q, c + ' county') || (c === 'dupage' && hasPhrase(q, 'du page'))) return { county: c };
      // "lake" and "will" are ordinary words; the other four only mean the county.
      if (c !== 'lake' && c !== 'will' && hasPhrase(q, c)) return { county: c };
    }
    for (const p of placePhrases) if (hasPhrase(q, p)) return { town: p, county: (townCounty.get(p) || '').toLowerCase() };
    return null;
  }

  function attorneyPageFor(q) {
    const place = findPlace(q);
    if (!place) return '/';
    if (place.town && cityPageByTown.has(place.town)) return cityPageByTown.get(place.town);
    if (place.county) return `/county/${place.county}`;
    return '/';
  }

  const no = (code, reason, owner) => ({ allowed: false, code, reason, owner: owner || null });

  // The one question. Returns { allowed, code, reason, owner }.
  function check(query) {
    const q = normalize(query);
    const slug = slugify(query);
    if (!q) return no('empty', 'Empty query.');
    const words = q.split(' ');

    // 1. Junk: phone numbers, zip codes, web addresses.
    if (/\d{3}[-.\s)]+\d{3}[-.\s]+\d{4}/.test(query) || /\b\d{5}\b/.test(query) || /\.(com|net|org)\b|https?:/i.test(query)) {
      return no('junk', 'Looks like a phone number, zip code or web address, not a topic.');
    }
    if (words.length < 2) return no('junk', 'A single word is not a topic.');

    // 2. Named attorney or law firm. Checked first and never overridden.
    const namedWord = words.find((w) => nameWords.has(w));
    if (namedWord) {
      return no('named-attorney', `Contains "${namedWord}", which is part of an attorney or firm name in the directory. The pipeline never writes about a named attorney or law firm.`, { site: 'IPD', url: "that attorney's profile page" });
    }
    const listed = fullNames.find((f) => f.norm.split(' ').length >= 2 && hasPhrase(q, f.norm));
    if (listed) {
      return no('named-attorney', `Contains the directory listing name "${listed.name}". The pipeline never writes about a named attorney or law firm.`, { site: 'IPD', url: "that listing's profile page" });
    }
    if (String(query).includes('"')) {
      return no('named-attorney', 'A quoted search is almost always a search for one specific firm. The pipeline never writes about a named attorney or law firm.');
    }
    if (/\b(llc|llp|ltd|pc|esq|associates|law offices? of|law firm of|attorney at law)\b/.test(q) || / and associates\b/.test(q)) {
      return no('named-attorney', 'Reads as a law firm name. The pipeline never writes about a named attorney or law firm.', { site: 'IPD', url: "that firm's profile page" });
    }

    // 3. Rankings, and places or practice areas IPD does not cover.
    for (const rule of map.neverWrite || []) {
      if (rule.match && matchesAny(q, rule.match)) return no(rule.id, rule.rule);
    }

    // 4. Removed in Phase 4b, or the address redirects.
    if (removed.has(slug)) {
      return no('removed', `The post "${slug}" was removed and its address now redirects to ${removed.get(slug)}.`, { site: 'IPD', url: removed.get(slug) });
    }

    // 5. A page on IPD or CPS owns this topic.
    for (const t of map.topics || []) {
      if (matchesAny(q, t.match)) return no('owned', `Owned by ${t.owner.site} ${t.owner.url} ("${t.topic}").`, t.owner);
    }
    for (const r of map.intentRules || []) {
      if (!matchesAny(q, r.match)) continue;
      // "power of attorney" is a document, not a search for an attorney.
      if (r.id === 'find-an-attorney' && !matchesAny(q.replace(/\bpowers? of attorney\b/g, ' ').replace(/\s+/g, ' ').trim(), r.match)) continue;
      const owner = r.id === 'find-an-attorney' ? { site: 'IPD', url: attorneyPageFor(q) } : r.owner;
      return no('owned', `${r.rule} Owner: ${owner.site} ${owner.url}.`, owner);
    }

    // A town or county in the query means a local search. Local searches belong
    // to the pages with listings (Phase 4b: the town posts were general essays).
    if (findPlace(q) || /\b(local|nearby|near|area|chicagoland|suburbs|suburban)\b/.test(q)) {
      const url = attorneyPageFor(q);
      return no('owned', `Local searches belong to the page with listings for that place, not to a blog post. Owner: IPD ${url}.`, { site: 'IPD', url });
    }

    // Same topic as a removed post, worded differently.
    for (const [oldSlug, target] of removed) {
      if (similarity(q, oldSlug.replace(/-/g, ' ')) >= SIMILAR) {
        return no('removed', `Same topic as the removed post "${oldSlug}", which now redirects to ${target}.`, { site: 'IPD', url: target });
      }
    }

    // 6. An article on this topic already exists.
    for (const e of existing) {
      if (e.slug === slug || similarity(q, e.slug.replace(/-/g, ' ')) >= SIMILAR || similarity(q, e.title) >= SIMILAR) {
        return no('exists', `The article /blog/${e.slug} already covers this.`, { site: 'IPD', url: `/blog/${e.slug}` });
      }
    }

    // 7. Any word the pipeline does not recognise may be a name: turn it away.
    let rest = q;
    for (const p of placePhrases) rest = (' ' + rest + ' ').split(' ' + p + ' ').join(' ').trim();
    const unknown = rest.split(' ').filter((w) => w && !VOCABULARY.has(w) && !placeWords.has(w) && !/^(19|20)\d\d$/.test(w));
    if (unknown.length) {
      return no('unknown-word', `Contains a word the pipeline does not recognise ("${unknown.join('", "')}"). It may be a person's or a firm's name, so the topic is skipped. If it is an ordinary word, add it to scripts/lib/vocabulary.js.`);
    }

    // 8. A topic needs a subject the site covers.
    if (!/\b(probate|estate|estates|will|wills|trust|trusts|executor|executors|administrator|administration|letters of office|letters testamentary|transfer on death|heir|heirs|inherit|inherits|inheritance|intestate|beneficiary|beneficiaries|guardianship|power of attorney)\b/.test(q)) {
      return no('off-topic', 'Not a probate or estate topic.');
    }

    return { allowed: true, code: 'new', reason: 'No existing page on IPD or CPS owns this topic.', owner: null, slug };
  }

  // Used by the review step: names of listed attorneys and firms found in a draft.
  function findListedNames(text) {
    const norm = normalize(text);
    const found = [];
    for (const f of fullNames) {
      if (f.norm.split(' ').length < 2) continue;
      if (f.distinctive ? hasPhrase(norm, f.norm) : text.includes(f.name)) found.push(f.name);
    }
    return [...new Set(found)];
  }

  return { check, findListedNames, removed, existing, map, nameWords };
}

module.exports = { loadGuard, normalize, slugify, similarity };
