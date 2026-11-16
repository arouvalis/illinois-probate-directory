# Blog pipeline

Four steps, run in order by `run-pipeline.js`:

| Step | Script | What it does |
| --- | --- | --- |
| 1 | `find-keyword-gaps.js` | Reads a Search Console export and keeps only topics no page already owns. |
| 2 | `generate-blog-posts.js` | Claude Haiku writes a draft for each new topic. Drafts go to `pipeline-output/drafts/`, which the site does not read. |
| 3 | `review-drafts.js` | Claude Sonnet and the script check every legal statement in each draft against `data/legal-facts.json`. Anything not in the file flags the draft. |
| 4 | `publish-drafts.js` | Copies approved drafts into `src/content/blog`, commits and pushes. Flagged drafts stay where they are. |

## Running it

A run is a **dry run unless you add `--publish`**. A dry run does all four steps, keeps its files in `pipeline-output/dry-run/`, writes `report.md` there, and publishes nothing.

```bash
npm install
```

```bash
ANTHROPIC_API_KEY=your-key node scripts/run-pipeline.js path/to/search-console-export.zip
```

Add a topic by hand (it goes through the same checks):

```bash
ANTHROPIC_API_KEY=your-key node scripts/run-pipeline.js export.zip --topic="what does an executor do in illinois"
```

Test the plumbing with canned answers, no API calls and no cost:

```bash
node scripts/run-pipeline.js export.zip --dry-run --mock
```

Run the automated tests (no API calls):

```bash
npm run test:pipeline
```

Publish for real, only after a dry run you are happy with:

```bash
ANTHROPIC_API_KEY=your-key node scripts/run-pipeline.js export.zip --publish
```

`--max=3` sets how many drafts one run may write (3 by default).

## The two files that steer it

- **`data/query-page-map.json`** is the Phase 4 query-to-page map. It lists which page on IPD or CPS owns each topic, and the 23 posts removed in Phase 4b. Update it whenever a page is added, moved or removed.
- **`data/legal-facts.json`** is the list of legal statements a post may make. To allow a new statement, add it with its source once an attorney or an official source has confirmed it.

## What the pipeline will never write

- A post about a named attorney or law firm. Queries are checked against every name in the directory, and a query with any word the script does not recognise is skipped because it may be a name. If a good topic is skipped for an ordinary word, add the word to `scripts/lib/vocabulary.js`.
- A topic an existing page owns, on either site, or one removed in Phase 4b, or any address that redirects.
- A local topic ("probate in [town]"). Those belong to the city and county pages.
- "Best" or "top" lists.

## When a draft is flagged

Open `pipeline-output/reviews/<name>.json`. `reasons` lists each statement that could not be verified. Either edit the draft to remove the statement and run `node scripts/review-drafts.js` again, or confirm the statement, add it to `data/legal-facts.json`, and review again. A draft edited after its review must be reviewed again before it can be published.
