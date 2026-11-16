// The facts the site repeats most, worded once. Used by the emailed checklist;
// page copy states the same figures.
// Sources are listed in NOTES.md ("Phase 1 fact sources").

/** Small estate affidavit limit, 755 ILCS 5/25-1 as amended by Public Act 104-0346. */
export const SMALL_ESTATE_LIMIT = "$150,000";
export const SMALL_ESTATE_OLD_LIMIT = "$100,000";
export const SMALL_ESTATE_EFFECTIVE = "August 15, 2025";
export const SMALL_ESTATE_SENTENCE =
  `Illinois lets heirs use a Small Estate Affidavit (755 ILCS 5/25-1) instead of formal probate when the estate has no real estate and its personal property totals ${SMALL_ESTATE_LIMIT} or less, not counting motor vehicles registered with the Illinois Secretary of State. The ${SMALL_ESTATE_LIMIT} limit applies to deaths on or after ${SMALL_ESTATE_EFFECTIVE}; for earlier deaths the limit is ${SMALL_ESTATE_OLD_LIMIT}.`;

/** The single timeline statement used across the site. */
export const TIMELINE_SIMPLE = "9 to 12 months";
export const TIMELINE_COMPLEX = "12 to 24 months or longer";
export const TIMELINE_SENTENCE =
  `A straightforward Illinois estate usually takes about ${TIMELINE_SIMPLE} from opening to closing. It cannot finish much sooner, because creditors get at least six months from the first published notice to file claims (755 ILCS 5/18-3). Contested or complex estates can take ${TIMELINE_COMPLEX}.`;

/** The single answer to "is an attorney required?", used on every page that addresses it. */
export const ATTORNEY_SENTENCE =
  "Illinois law doesn't strictly require an attorney in every case, but courts generally expect executors to be represented, and nearly all estates hire one.";

/** How attorney fees are described. No percentages or dollar figures: they vary too much to state. */
export const ATTORNEY_FEE_SENTENCE =
  "Attorney fees vary: some attorneys bill hourly, some charge a flat fee, and some charge a percentage of the estate. Ask for a written quote before you hire.";
