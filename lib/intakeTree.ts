// The intake decision tree — MVP_Draft.md section 1, "The tree:".
// Every answer determines the next question; a gate is a fork, not a filter
// applied afterward. This file is the single source of truth for that
// branching logic so UI, API, and roadmap generation all walk the same tree.

export const STEP_IDS = [
  "EU_EEA_CITIZEN",
  "APPLICANT_TYPE",
  "RENEWAL_PERMIT_TYPE",
  "RENEWAL_PERMIT_EXPIRY",
  "NATIONALITY",
  "ACCEPTANCE_LETTER",
  "FAMILY_MEMBERS",
  "PART_TIME_WORK",
  "HOUSING",
  "ARRIVAL_DATE",
  "EMAIL",
  "COMPLETE",
] as const;

export type StepId = (typeof STEP_IDS)[number];

export type CaseType =
  | "eu_registration" // gate 1: EU/EEA citizen -> short registration-guidance flow, not a visa questionnaire
  | "renewal" // gate 2: returning/already-in-Spain -> renewal path, skips all pre-arrival questions
  | "pre_acceptance" // gate 4: no acceptance letter yet -> pre-acceptance guidance, not visa-specific questions
  | "new_student_visa"; // full path

export interface FamilyMember {
  relationship: string;
}

export interface IntakeAnswers {
  euEeaCitizen?: boolean;
  applicantType?: "new" | "returning";

  // Returning-applicant branch (gate 2 "Returning") — skips everything below.
  currentPermitType?: string;
  currentPermitExpiry?: string; // ISO date

  // New-applicant path.
  nationality?: string;
  hasAcceptanceLetter?: boolean;
  familyMembersAccompanying?: boolean;
  familyMembers?: FamilyMember[];
  plansPartTimeWork?: boolean;
  hasHousingArranged?: boolean;
  arrivalDate?: string; // ISO date

  email?: string;
}

// Given everything answered so far, what's the next step in the tree?
// Pure function — no I/O — so it can be shared by the /api/intake/next
// endpoint and by validation in /api/intake/submit.
export function getNextStep(answers: IntakeAnswers): StepId {
  if (answers.euEeaCitizen === undefined) return "EU_EEA_CITIZEN";
  if (answers.euEeaCitizen === true) {
    // Gate 1: EU/EEA branches immediately to a short registration-guidance
    // flow, separate from the visa questionnaire entirely.
    return answers.email === undefined ? "EMAIL" : "COMPLETE";
  }

  if (answers.applicantType === undefined) return "APPLICANT_TYPE";
  if (answers.applicantType === "returning") {
    // Gate 2: returning skips all pre-arrival/embassy questions.
    if (answers.currentPermitType === undefined) return "RENEWAL_PERMIT_TYPE";
    if (answers.currentPermitExpiry === undefined) return "RENEWAL_PERMIT_EXPIRY";
    return answers.email === undefined ? "EMAIL" : "COMPLETE";
  }

  if (answers.nationality === undefined) return "NATIONALITY";

  if (answers.hasAcceptanceLetter === undefined) return "ACCEPTANCE_LETTER";
  if (answers.hasAcceptanceLetter === false) {
    // Gate 4: no acceptance letter -> pre-acceptance guidance, not
    // visa-specific questions that don't apply yet.
    return answers.email === undefined ? "EMAIL" : "COMPLETE";
  }

  if (answers.familyMembersAccompanying === undefined) return "FAMILY_MEMBERS";
  if (answers.plansPartTimeWork === undefined) return "PART_TIME_WORK";
  if (answers.hasHousingArranged === undefined) return "HOUSING";
  if (answers.arrivalDate === undefined) return "ARRIVAL_DATE";
  if (answers.email === undefined) return "EMAIL";
  return "COMPLETE";
}

export function isComplete(answers: IntakeAnswers): boolean {
  return getNextStep(answers) === "COMPLETE";
}

export function deriveCaseType(answers: IntakeAnswers): CaseType {
  if (answers.euEeaCitizen === true) return "eu_registration";
  if (answers.applicantType === "returning") return "renewal";
  if (answers.hasAcceptanceLetter === false) return "pre_acceptance";
  return "new_student_visa";
}
