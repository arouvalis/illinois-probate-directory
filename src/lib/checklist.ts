// The Illinois Probate Checklist that the checklist form emails to the visitor.
// It is a condensed version of /resources/how-probate-works-illinois, so it
// makes no legal statement that is not already on that page.
import { SMALL_ESTATE_SENTENCE, TIMELINE_SENTENCE } from "./probateFacts";

const SITE = "https://www.illinoisprobatedirectory.com";

export const CHECKLIST_SUBJECT = "Your Illinois Probate Checklist";

export function checklistEmailText(name: string): string {
  return `Hi ${name},

Here is the Illinois Probate Checklist you asked for.

BEFORE YOU START
[ ] Get several certified copies of the death certificate.
[ ] Find the original will, if there is one.
[ ] List what the person owned in their own name: real estate, bank accounts, investments, vehicles, personal property.
[ ] Set aside what passes outside probate: jointly held property with right of survivorship, life insurance and retirement accounts with a named beneficiary, payable-on-death or transfer-on-death accounts, and assets held in a living trust.
[ ] Check whether probate is needed at all. ${SMALL_ESTATE_SENTENCE}

THE PROBATE STEPS
[ ] 1. File a petition with the probate court in the county where the person lived. The will is filed with it.
[ ] 2. The court appoints the executor (or an administrator if there is no will) and issues Letters of Office, the document that gives authority to act for the estate.
[ ] 3. Make an inventory of the estate's assets and their estimated values.
[ ] 4. Notify creditors. A notice is published in a local newspaper for three consecutive weeks, and known creditors are notified directly. Creditors then have six months to file claims.
[ ] 5. Pay valid debts, administration expenses, and any taxes from estate assets.
[ ] 6. File estate tax returns if they apply. An attorney or tax professional can tell you whether they do.
[ ] 7. Distribute what remains to the beneficiaries named in the will, or under Illinois law if there is no will.
[ ] 8. File a final accounting and ask the court to close the estate.

HOW LONG IT TAKES
${TIMELINE_SENTENCE}

IF THE ESTATE INCLUDES A HOUSE
See our guide to selling inherited property in Illinois: ${SITE}/resources/selling-inherited-property-illinois

MORE HELP
Full guide: ${SITE}/resources/how-probate-works-illinois
Court locations by county: ${SITE}/resources/illinois-probate-courts-by-county
Find a probate attorney: ${SITE}/

This checklist is general information, not legal advice. Every estate is different, so talk to an Illinois probate attorney about yours.

Replies to this address are not monitored. To reach us, use the form at ${SITE}/.

Illinois Probate Directory
`;
}
