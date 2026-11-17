// Search title and description for each article, keyed by file name.
// Titles are shown as written (no site name is added), so keep them under
// 60 characters. The heading on the page itself is not affected.
// An article with no entry here falls back to its main heading (plus the
// site name) and the start of its first paragraph.
export const BLOG_META: Record<string, { title: string; description?: string }> = {
  "do-i-need-a-probate-attorney-in-illinois": {
    title: "Do I Need a Probate Attorney in Illinois?",
  },
  "how-much-does-a-probate-attorney-cost-in-illinois": {
    title: "What Does a Probate Attorney Cost in Illinois?",
    description:
      "Hourly, flat-fee and percentage billing explained, what Illinois courts consider reasonable, typical filing costs, and questions to ask before you hire.",
  },
  "lake-county-il-probate": {
    title: "Lake County, IL Probate: Court, Steps and Timeline",
    description:
      "Where to file in Waukegan, what the 19th Judicial Circuit expects, how long Lake County probate takes, and when a small estate affidavit is enough.",
  },
  "small-estate-affidavit-illinois": {
    title: "Small Estate Affidavit in Illinois: Limit and How It Works",
  },
  "what-assets-go-through-probate-in-illinois": {
    title: "What Goes Through Probate in Illinois, and What Doesn't",
    description:
      "Houses, bank accounts, joint property, beneficiary accounts and trusts: which assets need probate in Illinois and which pass outside it.",
  },
};
