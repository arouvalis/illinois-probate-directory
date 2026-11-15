// Structured data (JSON-LD) shared by the listing and guide pages.
import type { Attorney } from "./attorneys";

export const SITE = "https://www.illinoisprobatedirectory.com";

/** One id for the organization, so every page's markup points at the same entity. */
export const ORG_ID = `${SITE}/#organization`;

export interface Faq {
  question: string;
  answer: string;
}

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/**
 * The attorneys shown on a listing page, as an ItemList. Marked "unordered"
 * because the directory does not rank attorneys: the order is alphabetical.
 */
export function attorneyItemList(attorneys: Attorney[], name: string) {
  const sorted = [...attorneys].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "en", { sensitivity: "base" })
  );
  return {
    "@type": "ItemList",
    name,
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: sorted.length,
    itemListElement: sorted.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name ?? a.slug,
      url: `${SITE}/attorney/${a.slug}`,
    })),
  };
}

/** CollectionPage for a county or city listing page, with its ItemList. */
export function listingPageSchema(opts: {
  name: string;
  url: string;
  about: { "@type": "City" | "AdministrativeArea"; name: string };
  attorneys: Attorney[];
  listName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    url: opts.url,
    about: opts.about,
    publisher: { "@id": ORG_ID },
    mainEntity: attorneyItemList(opts.attorneys, opts.listName),
  };
}

/**
 * Question-and-answer pairs from a markdown guide: every "##" or "###" heading
 * that ends in a question mark, with the first paragraph under it as the
 * answer. Long answers are cut at the end of a sentence.
 */
export function extractFaqs(markdown: string, max = 5): Faq[] {
  const faqs: Faq[] = [];
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length && faqs.length < max; i++) {
    const line = lines[i].trim();
    if (!/^#{2,3}\s/.test(line)) continue;
    const question = line.replace(/^#{2,3}\s+/, "").trim();
    if (!question.endsWith("?")) continue;

    let answer = "";
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim();
      if (next.startsWith("#")) break;
      if (next.length > 20 && !/^[-*>|\d]/.test(next.replace(/^\*\*/, ""))) {
        answer = plainText(next);
        // A paragraph that introduces a list ("...:") takes the list items with it.
        if (answer.endsWith(":")) {
          const items: string[] = [];
          for (let k = j + 1; k < lines.length; k++) {
            const item = lines[k].trim();
            if (!item) { if (items.length) break; else continue; }
            if (!/^[-*]\s/.test(item)) break;
            items.push(plainText(item.replace(/^[-*]\s+/, "")).replace(/[.;]$/, ""));
          }
          if (items.length) answer = `${answer} ${items.join("; ")}.`;
        }
        break;
      }
    }
    if (answer) faqs.push({ question, answer: trimToSentence(answer, 400) });
  }
  return faqs;
}

function plainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

function trimToSentence(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
}
