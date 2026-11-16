'use strict';
// Words the pipeline recognises in a search query. A query that contains any
// word NOT in this list, and not a town or county in the directory, is turned
// away, because an unknown word in a probate search is usually a person's or a
// firm's name. Add ordinary words here when a good topic is turned away.

const WORDS = `
a an and are as at be been before being between both but by can could did do does doing done for from get gets getting
had has have having how i if in into is it its just many may me more most much must my near need needed needs no not now of off
on once one only or other our out over own same should so some such than that the their them then there these they
this those through to too under until up us very was we were what when where which while who whom whose why will with
within without would you your vs versus about after again all also any because during each either every few still two
il ill illinois state county counties city town local area me

probate probated probating estate estates will wills trust trusts trustee trustees living revocable irrevocable testamentary
executor executors executrix administrator administrators administration independent supervised representative personal
heir heirs heirship beneficiary beneficiaries inherit inherits inherited inheriting inheritance intestate intestacy testate
deceased decedent death dies died die dead dying passed away spouse surviving survivor widow widower husband wife
child children kids minor minors parent parents mother father mom dad sibling siblings brother sister family relatives kin next
affidavit affidavits small letters office testamentary bond surety oath petition petitions notice notices publication
claim claims creditor creditors debt debts bills owe owed owes pay paid paying payment payments
asset assets account accounts bank joint tenancy tenants common survivorship payable transfer transfers transferring tod pod
vehicle vehicles car cars title titles stock stocks retirement ira insurance life policy pension benefits
tax taxes estate inheritance income return returns federal exemption threshold
court courts courthouse clerk clerks judge hearing hearings filing file filed files fee fees case cases records docket
process steps step procedure procedures stages works work working guide explained overview basics checklist
timeline time long take takes taking months years weeks days deadline deadlines period duration length
cost costs price prices much expensive cheap afford affordable free
attorney attorneys lawyer lawyers law legal counsel firm firms office offices help advice services service
need needed necessary required require requirements rules rule laws statute act
duties duty responsibilities responsibility role roles job compensation paid powers authority rights right
contest contesting contested challenge challenging dispute disputes disputed invalid valid validity undue influence
guardian guardianship guardianships conservator power poa healthcare directive
house houses home homes property properties real land sell selling sale sold buy buyer buyers vacant mortgage
open opening opened start starting begin close closing closed final accounting inventory distribution distribute distributing
avoid avoiding skip skipping simplified summary formal informal ancillary
lost missing original copy copies find finding locate certificate certificates certified
form forms document documents paperwork sample template
does mean meaning definition define difference different between types type kinds
happens happen happening next first last
dying died without no with
planning plan plans instrument instruments handle handles handling become becoming choose choosing name naming appoint appointed remove removing resign change changing update
whether able allowed can cannot
year old age
`;

// Split on whitespace; phrases are not needed here, only single words.
const VOCABULARY = new Set(WORDS.split(/\s+/).filter(Boolean));

module.exports = { VOCABULARY };
