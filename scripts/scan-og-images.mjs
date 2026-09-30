import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/attorneys.json", "utf8"));

// Read the existing blocklist so already-blocked images are not re-reported
const src = fs.readFileSync("src/lib/listing-image.ts", "utf8");
const block = src.match(/BAD_IMAGE_HOSTS\s*=\s*\[([\s\S]*?)\]/);
const blocked = block
  ? [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase())
  : [];
const isBlocked = (u) => blocked.some((h) => u.toLowerCase().includes(h));

const UA =
  "Mozilla/5.0 (compatible; IllinoisProbateDirectory/1.0; +https://illinoisprobatedirectory.com)";

// Unique websites, remembering which attorneys use each one
const sites = new Map();
for (const a of data) {
  if (typeof a.website !== "string" || a.website === "") continue;
  let key;
  try {
    key = new URL(a.website).href;
  } catch {
    continue;
  }
  if (sites.has(key) === false) sites.set(key, []);
  sites.get(key).push(a.name);
}
const list = [...sites.keys()];
console.log(`Scanning ${list.length} unique websites...`);

async function getOg(website) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(website, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    });
    if (res.ok === false) return { image: null, error: "HTTP " + res.status };
    const html = (await res.text()).slice(0, 300000);
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (m === null || m[1] === undefined) return { image: null, error: null };
    const raw = m[1].trim();
    const base = res.url || website;
    const image = raw.startsWith("http") ? raw : new URL(raw, base).href;
    return { image, error: null };
  } catch (e) {
    const why = e.name === "AbortError" ? "timeout" : (e.cause && e.cause.code) || e.message;
    return { image: null, error: String(why) };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
let next = 0;
let done = 0;
async function worker() {
  while (next < list.length) {
    const idx = next++;
    const website = list[idx];
    const r = await getOg(website);
    results.push({
      website,
      host: new URL(website).hostname.replace(/^www\./, ""),
      names: sites.get(website),
      image: r.image,
      error: r.error,
    });
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${list.length}`);
  }
}
await Promise.all(Array.from({ length: 10 }, worker));

fs.writeFileSync("scan-og-output.json", JSON.stringify(results, null, 2));

// Group by image URL
const byImage = new Map();
for (const r of results) {
  if (r.image === null) continue;
  if (byImage.has(r.image) === false) byImage.set(r.image, []);
  byImage.get(r.image).push(r);
}

const withImage = results.filter((r) => r.image !== null).length;
const errored = results.filter((r) => r.error !== null).length;
const alreadyBlocked = results.filter((r) => r.image !== null && isBlocked(r.image)).length;

console.log("\n=== SUMMARY ===");
console.log(`Sites scanned:        ${results.length}`);
console.log(`With og:image:        ${withImage}`);
console.log(`No og:image:          ${results.length - withImage - errored}`);
console.log(`Fetch errors:         ${errored}`);
console.log(`Already blocked:      ${alreadyBlocked}`);

const keyword = /default|placeholder|opengraph-image|og-default|sample|stock|no-image/i;
const flagged = [];
for (const [image, rs] of byImage) {
  if (isBlocked(image)) continue;
  const hosts = new Set(rs.map((r) => r.host));
  const reasons = [];
  if (hosts.size >= 2) reasons.push(`shared by ${hosts.size} sites`);
  if (keyword.test(new URL(image).pathname)) reasons.push("filename looks like a default");
  if (reasons.length > 0) flagged.push({ image, hosts: hosts.size, reasons, rs });
}
flagged.sort((a, b) => b.hosts - a.hosts);

console.log(`\n=== NOT YET BLOCKED, LIKELY PLATFORM DEFAULTS (${flagged.length}) ===`);
for (const f of flagged) {
  console.log(`\n[${f.hosts} sites] ${f.image}`);
  console.log(`  why: ${f.reasons.join("; ")}`);
  console.log(`  e.g.: ${f.rs.slice(0, 3).map((r) => r.names[0]).join(" | ")}`);
}
console.log("\nFull results saved to scan-og-output.json");
