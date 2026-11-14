// Choices shown on the lead forms. Safe to import from client components.
export const REAL_ESTATE_OPTIONS = ["Yes", "No", "Not Sure"] as const;

export const PROBATE_STAGE_OPTIONS = [
  "Haven't started",
  "Just getting started",
  "Probate case is open",
  "Nearly finished",
  "Not sure",
] as const;

export const TIMELINE_OPTIONS = [
  "As soon as possible",
  "Within 3 months",
  "3 to 12 months",
  "More than a year",
  "Not sure",
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Executor or administrator",
  "Heir or beneficiary",
  "Family member helping out",
  "Attorney or other professional",
  "Other",
] as const;

export interface LeadDetails {
  hasRealEstate: string;
  propertyLocation: string;
  probateStage: string;
  timeline: string;
  relationship: string;
}

export const EMPTY_LEAD_DETAILS: LeadDetails = {
  hasRealEstate: "",
  propertyLocation: "",
  probateStage: "",
  timeline: "",
  relationship: "",
};
