const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SCRIPTS = path.join(__dirname);

function run(cmd, label) {
  console.log(`\n🔄 ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT });
    console.log(`✅ ${label} complete`);
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message);
    process.exit(1);
  }
}

// Check for GSC export
const gscFile = process.argv[2];
if (!gscFile) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ILLINOIS PROBATE — BLOG PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage: node scripts/run-pipeline.js <path-to-Queries.csv>

Steps this runs:
  1. Find keyword gaps from your GSC data
  2. Generate blog posts for new opportunities
  3. Commit and push to Vercel

To get your GSC CSV:
  1. Go to Google Search Console
  2. Search Results → 3 months → Export → CSV
  3. Unzip and pass the Queries.csv path here

Example:
  node scripts/run-pipeline.js /tmp/queries.csv
`);
  process.exit(0);
}

// Extract Queries.csv if zip passed
let csvPath = gscFile;
if (gscFile.endsWith('.zip')) {
  console.log('📦 Extracting zip...');
  execSync(`unzip -p "${gscFile}" Queries.csv > /tmp/queries.csv`);
  csvPath = '/tmp/queries.csv';
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ILLINOIS PROBATE — BLOG PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Step 1: Find keyword gaps
run(`node scripts/find-keyword-gaps.js ${csvPath}`, 'Step 1: Finding keyword gaps');

// Step 2: Generate blog posts
run(`node scripts/generate-blog-posts.js`, 'Step 2: Generating blog posts');

// Step 3: Git push
run(`git add . && git commit -m "Blog pipeline: add new posts" && git push`, 'Step 3: Pushing to Vercel');

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ PIPELINE COMPLETE
  Check Vercel in 2-3 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

