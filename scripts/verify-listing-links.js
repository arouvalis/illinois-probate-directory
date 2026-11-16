#!/usr/bin/env node
// Writes data/verify-listing-links.csv: one "Verify your listing" link per
// attorney, for a campaign email or mail merge.
//   node scripts/verify-listing-links.js          -> links end in ?src=email
//   node scripts/verify-listing-links.js postcard -> links end in ?src=postcard
// The src label shows up in GA4 on verify_listing_start and verify_listing_confirmed.
const fs = require("fs");
const path = require("path");

const src = process.argv[2] || "email";
if (!/^[A-Za-z0-9_-]{1,40}$/.test(src)) {
  console.error("The label may only use letters, digits, dash and underscore (max 40).");
  process.exit(1);
}
const ROOT = path.join(__dirname, "..");
const attorneys = JSON.parse(fs.readFileSync(path.join(ROOT, "data/attorneys.json"), "utf8"));
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const rows = [["name", "city", "county", "phone", "website", "verify_link"].join(",")];
for (const a of [...attorneys].sort((x, y) => (x.name ?? "").localeCompare(y.name ?? ""))) {
  const link = `https://www.illinoisprobatedirectory.com/verify-listing/${a.slug}?src=${src.toLowerCase()}`;
  rows.push([a.name, a.city, a.source_county, a.phone, a.website, link].map(cell).join(","));
}
const out = path.join(ROOT, "data/verify-listing-links.csv");
fs.writeFileSync(out, rows.join("\n") + "\n");
console.log(`Wrote ${attorneys.length} links to data/verify-listing-links.csv (src=${src.toLowerCase()})`);
