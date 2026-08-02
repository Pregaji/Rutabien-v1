// The intake decision tree - MVP_Draft.md section 1, "The tree:".
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
  "FAMILY_DETAILS",
  "PART_TIME_WORK",
  "HOUSING",
  "HOUSING_GUIDANCE",
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

export type HousingStatus = "signed" | "temporary" | "still_looking";

export interface FamilyMember {
  relationship: "spouse" | "child";
}

export interface IntakeAnswers {
  euEeaCitizen?: boolean;
  applicantType?: "new" | "returning";

  // Returning-applicant branch (gate 2 "Returning") - skips everything below.
  currentPermitType?: string;
  currentPermitExpiry?: string; // ISO date

  // New-applicant path.
  nationality?: string;
  hasAcceptanceLetter?: boolean;
  familyMembersAccompanying?: boolean;
  // Real family composition, not just a yes/no - drives the IPREM funds
  // formula (100% + 75% first dependent + 50% each additional, per
  // MVP_Draft.md) and eventually SLF-specific roadmap content.
  spouseIncluded?: boolean;
  childCount?: number;
  familyMembers?: FamilyMember[];

  plansPartTimeWork?: boolean;

  // Real accommodation status, not just yes/no (matches the approved
  // prototype's three options). "still_looking" surfaces general housing
  // guidance - informational only, no referral fee logic per CLAUDE.md
  // ("percentage-based housing referral fee... blocked pending Ida").
  housingStatus?: HousingStatus;
  sawHousingGuidance?: boolean;

  arrivalDate?: string; // ISO date

  email?: string;
}

function familyMembersFrom(answers: IntakeAnswers): FamilyMember[] {
  const members: FamilyMember[] = [];
  if (answers.spouseIncluded) members.push({ relationship: "spouse" });
  for (let i = 0; i < (answers.childCount ?? 0); i++) members.push({ relationship: "child" });
  return members;
}

// Given everything answered so far, what's the next step in the tree?
// Pure function - no I/O - so it can be shared by the /api/intake/next
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
  if (answers.familyMembersAccompanying === true && answers.spouseIncluded === undefined) {
    return "FAMILY_DETAILS";
  }

  if (answers.plansPartTimeWork === undefined) return "PART_TIME_WORK";

  if (answers.housingStatus === undefined) return "HOUSING";
  if (answers.housingStatus === "still_looking" && !answers.sawHousingGuidance) {
    return "HOUSING_GUIDANCE";
  }

  if (answers.arrivalDate === undefined) return "ARRIVAL_DATE";
  if (answers.email === undefined) return "EMAIL";
  return "COMPLETE";
}

export function isComplete(answers: IntakeAnswers): boolean {
  return getNextStep(answers) === "COMPLETE";
}

// Which answer field(s) a step's question fills in - used by computePath to
// know when a visited step has actually been answered vs. is the current
// (unanswered) one.
const STEP_ANSWER_KEYS: Record<StepId, (keyof IntakeAnswers)[]> = {
  EU_EEA_CITIZEN: ["euEeaCitizen"],
  APPLICANT_TYPE: ["applicantType"],
  RENEWAL_PERMIT_TYPE: ["currentPermitType"],
  RENEWAL_PERMIT_EXPIRY: ["currentPermitExpiry"],
  NATIONALITY: ["nationality"],
  ACCEPTANCE_LETTER: ["hasAcceptanceLetter"],
  FAMILY_MEMBERS: ["familyMembersAccompanying"],
  FAMILY_DETAILS: ["spouseIncluded"],
  PART_TIME_WORK: ["plansPartTimeWork"],
  HOUSING: ["housingStatus"],
  HOUSING_GUIDANCE: ["sawHousingGuidance"],
  ARRIVAL_DATE: ["arrivalDate"],
  EMAIL: ["email"],
  COMPLETE: [],
};

// The path actually walked so far for this user's branch of the tree, in
// order, ending at the current (not-yet-answered) step - lets the intake UI
// show a real step rail instead of just "the current question," without
// guessing at branches the user hasn't reached yet.
export function computePath(answers: IntakeAnswers): StepId[] {
  const path: StepId[] = [];
  let partial: IntakeAnswers = {};
  for (let guard = 0; guard < STEP_IDS.length + 1; guard++) {
    const step = getNextStep(partial);
    path.push(step);
    if (step === "COMPLETE") break;
    const keys = STEP_ANSWER_KEYS[step];
    const answered = keys.every((k) => answers[k] !== undefined);
    if (!answered) break;
    partial = { ...partial, ...Object.fromEntries(keys.map((k) => [k, answers[k]])) };
  }
  return path;
}

// For any gate not yet answered, which value keeps the user on the longer
// branch - i.e. the full questionnaire rather than an early exit. Used only
// to estimate a total step count that's as close to true as what's known so
// far allows; it only ever gets more precise (shorter) as real answers
// replace these guesses, never less.
const LONG_BRANCH_ASSUMPTION: Partial<{ [K in keyof IntakeAnswers]: IntakeAnswers[K] }> = {
  euEeaCitizen: false,
  applicantType: "new",
  // Only reached when the user's real answer is "returning" (the
  // simulation itself never guesses this branch) - still needs an
  // assumption or estimateTotalPath throws for every returning applicant.
  currentPermitType: "placeholder",
  currentPermitExpiry: "2099-01-01",
  nationality: "placeholder",
  hasAcceptanceLetter: true,
  familyMembersAccompanying: true,
  spouseIncluded: true,
  plansPartTimeWork: false,
  housingStatus: "still_looking",
  sawHousingGuidance: true,
  arrivalDate: "2099-01-01",
  email: "placeholder@rutabien.com",
};

// Same walk as computePath, but instead of stopping at the first unanswered
// step, keeps going by assuming the longer branch at each gate - gives the
// intake UI a real "X of Y" total that narrows toward the truth as the user
// answers, rather than always reporting the current step as the last one.
export function estimateTotalPath(answers: IntakeAnswers): StepId[] {
  const path: StepId[] = [];
  let sim: IntakeAnswers = { ...answers };
  for (let guard = 0; guard < STEP_IDS.length + 1; guard++) {
    const step = getNextStep(sim);
    path.push(step);
    if (step === "COMPLETE") break;
    const keys = STEP_ANSWER_KEYS[step];
    const unanswered = keys.filter((k) => sim[k] === undefined);
    for (const k of unanswered) {
      if (LONG_BRANCH_ASSUMPTION[k] === undefined) {
        throw new Error(`estimateTotalPath: no LONG_BRANCH_ASSUMPTION for "${k}" (step ${step})`);
      }
    }
    const additions = Object.fromEntries(unanswered.map((k) => [k, LONG_BRANCH_ASSUMPTION[k]]));
    sim = { ...sim, ...additions };
  }
  return path;
}

export function deriveCaseType(answers: IntakeAnswers): CaseType {
  if (answers.euEeaCitizen === true) return "eu_registration";
  if (answers.applicantType === "returning") return "renewal";
  if (answers.hasAcceptanceLetter === false) return "pre_acceptance";
  return "new_student_visa";
}

// Shared by /api/intake/submit and /api/intake/update - the mapping from
// raw intake answers to Users-table columns.
export function deriveUserFields(answers: IntakeAnswers) {
  const caseType = deriveCaseType(answers);
  const euStatus: "eu_eea" | "non_eu" = answers.euEeaCitizen ? "eu_eea" : "non_eu";
  // Schema only models new/returning; eu_registration and pre_acceptance
  // branches don't have a meaningful new/returning answer, default to "new".
  const studentStatus: "new" | "returning" =
    answers.applicantType === "returning" ? "returning" : "new";
  const arrivalDate = answers.arrivalDate ? new Date(answers.arrivalDate) : null;
  const visaExpiryDate = answers.currentPermitExpiry ? new Date(answers.currentPermitExpiry) : null;

  const fullAnswers: IntakeAnswers = {
    ...answers,
    familyMembers: familyMembersFrom(answers),
  };

  return {
    nationality: answers.nationality ?? null,
    euStatus,
    studentStatus,
    caseType,
    arrivalDate,
    visaExpiryDate,
    intakeAnswers: fullAnswers,
  };
}
