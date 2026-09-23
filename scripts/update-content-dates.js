#!/usr/bin/env node
// Keeps data/content-dates.json in sync with real content changes.
// Run before every commit: node scripts/update-content-dates.js
// A URL's date only changes when that page's content actually changes,
// so sitemap <lastmod> values stay trustworthy for Google.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data/content-dates.json");
const APP = path.join(ROOT, "src/app");
const BLOG = path.join(ROOT, "src/content/blog");
const NOW = new Date().toISOString();

const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);
const git = (cmd) => { try { return execSync(`git ${cmd}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const fileDate = (rel) => git(`log -1 --format=%cI -- "${rel}"`) || NOW;

const firstRun = !fs.existsSync(OUT);
const prev = firstRun ? {} : JSON.parse(fs.readFileSync(OUT, "utf8"));
const next = {};
let changed = 0, added = 0;

function record(key, contentHash, seedDate) {
  const old = prev[key];
  if (old && old.hash === contentHash) { next[key] = old; return; }
  next[key] = { hash: contentHash, date: old ? NOW : (seedDate || NOW) };
  old ? changed++ : added++;
}

// Seed attorney dates from git history on the first run: the last commit where each record changed
function attorneyHistory() {
  const seeds = {};
  const commits = git(`log --reverse --format="%H %cI" -- data/attorneys.json`).split("\n").filter(Boolean);
  for (const line of commits) {
    const [sha, date] = line.split(" ");
    let data; try { data = JSON.parse(git(`show ${sha}:data/attorneys.json`)); } catch { continue; }
    for (const a of data) {
      const h = hash(JSON.stringify(a));
      if (!seeds[a.slug] || seeds[a.slug].hash !== h) seeds[a.slug] = { hash: h, date };
    }
  }
  return seeds;
}

// Attorneys: a profile changes when its record OR the shared profile template changes
const TEMPLATE_FILES = ["src/app/attorney/[slug]/page.tsx", "src/lib/attorneys.ts"];
const templateHash = hash(TEMPLATE_FILES.map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join());
const templateDate = TEMPLATE_FILES.map(fileDate).sort().pop();
const attorneys = JSON.parse(fs.readFileSync(path.join(ROOT, "data/attorneys.json"), "utf8"));
const seeds = firstRun ? attorneyHistory() : {};
const countyDates = {};
for (const a of attorneys) {
  const recHash = hash(JSON.stringify(a));
  const h = hash(recHash + templateHash);
  const recSeed = seeds[a.slug] && seeds[a.slug].hash === recHash ? seeds[a.slug].date : undefined;
  const seed = [recSeed, templateDate].filter(Boolean).sort().pop();
  record(`/attorney/${a.slug}`, h, seed);
  const d = next[`/attorney/${a.slug}`].date;
  if (!countyDates[a.source_county] || d > countyDates[a.source_county]) countyDates[a.source_county] = d;
}

// Counties: hash of their attorney list, dated by their newest attorney change
const countySrc = fs.readFileSync(path.join(ROOT, "src/lib/attorneys.ts"), "utf8");
const countyBlock = countySrc.match(/COUNTY_SLUGS[^{]*{([^}]*)}/)[1];
for (const [, slug, name] of countyBlock.matchAll(/["']?([\w-]+)["']?\s*:\s*["']([^"']+)["']/g)) {
  const members = attorneys.filter((a) => a.source_county === name).map((a) => next[`/attorney/${a.slug}`].hash).sort();
  const pageFile = "src/app/county/[slug]/page.tsx";
  const h = hash(members.join() + hash(fs.readFileSync(path.join(ROOT, pageFile), "utf8")));
  const seed = [countyDates[name], fileDate(pageFile)].filter(Boolean).sort().pop();
  record(`/county/${slug}`, h, seed);
}

// Blog posts
for (const f of fs.readdirSync(BLOG).filter((f) => f.endsWith(".md"))) {
  const rel = `src/content/blog/${f}`;
  record(`/blog/${f.replace(/\.md$/, "")}`, hash(fs.readFileSync(path.join(ROOT, rel), "utf8")), fileDate(rel));
}

// Static routes: every src/app/**/page.tsx without a [dynamic] segment
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!e.name.startsWith("[") && e.name !== "api" && !e.name.startsWith("_")) walk(full); continue; }
    if (e.name !== "page.tsx") continue;
    const rel = path.relative(ROOT, full);
    const route = "/" + path.relative(APP, dir).split(path.sep).filter(Boolean).join("/");
    record(route === "/" ? "/" : route, hash(fs.readFileSync(full, "utf8")), fileDate(rel));
  }
})(APP);

// Homepage reflects the newest change anywhere on the site
const newest = Object.entries(next).filter(([k]) => k !== "/").map(([, v]) => v.date).sort().pop();
if (next["/"] && newest > next["/"].date) next["/"] = { ...next["/"], date: newest };

const removed = Object.keys(prev).filter((k) => !next[k]).length;
fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(next).sort()), null, 2) + "\n");
console.log(`content-dates: ${Object.keys(next).length} URLs | ${added} new | ${changed} changed | ${removed} removed`);
