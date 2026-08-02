import { describe, expect, it } from "vitest";
import {
  computePath,
  deriveCaseType,
  deriveUserFields,
  estimateTotalPath,
  getNextStep,
  isComplete,
  type IntakeAnswers,
} from "./intakeTree";

describe("getNextStep - branch correctness", () => {
  it("starts at EU_EEA_CITIZEN with no answers", () => {
    expect(getNextStep({})).toBe("EU_EEA_CITIZEN");
  });

  it("EU/EEA citizens skip straight to EMAIL, bypassing the entire visa questionnaire", () => {
    expect(getNextStep({ euEeaCitizen: true })).toBe("EMAIL");
    expect(getNextStep({ euEeaCitizen: true, email: "a@b.com" })).toBe("COMPLETE");
    // Even with other fields set, the EU branch must not be pulled back
    // into the visa questionnaire - this is the exact "wrong branch shows
    // an incorrect roadmap" risk.
    expect(getNextStep({ euEeaCitizen: true, nationality: "France" })).toBe("EMAIL");
  });

  it("non-EU goes to APPLICANT_TYPE next", () => {
    expect(getNextStep({ euEeaCitizen: false })).toBe("APPLICANT_TYPE");
  });

  it("returning applicants go through the renewal branch, skipping nationality/acceptance/family/etc.", () => {
    const base: IntakeAnswers = { euEeaCitizen: false, applicantType: "returning" };
    expect(getNextStep(base)).toBe("RENEWAL_PERMIT_TYPE");
    expect(getNextStep({ ...base, currentPermitType: "student" })).toBe("RENEWAL_PERMIT_EXPIRY");
    expect(getNextStep({ ...base, currentPermitType: "student", currentPermitExpiry: "2027-01-01" })).toBe(
      "EMAIL"
    );
    expect(
      getNextStep({
        ...base,
        currentPermitType: "student",
        currentPermitExpiry: "2027-01-01",
        email: "a@b.com",
      })
    ).toBe("COMPLETE");
  });

  it("new applicants proceed to NATIONALITY, never touching renewal fields", () => {
    expect(getNextStep({ euEeaCitizen: false, applicantType: "new" })).toBe("NATIONALITY");
  });

  it("no acceptance letter routes to pre-acceptance guidance (EMAIL), skipping family/work/housing", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: false,
    };
    expect(getNextStep(base)).toBe("EMAIL");
  });

  it("has acceptance letter continues into FAMILY_MEMBERS", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
    };
    expect(getNextStep(base)).toBe("FAMILY_MEMBERS");
  });

  it("family members accompanying=true requires FAMILY_DETAILS before continuing", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      familyMembersAccompanying: true,
    };
    expect(getNextStep(base)).toBe("FAMILY_DETAILS");
    expect(getNextStep({ ...base, spouseIncluded: false })).toBe("PART_TIME_WORK");
  });

  it("family members accompanying=false skips FAMILY_DETAILS entirely", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      familyMembersAccompanying: false,
    };
    expect(getNextStep(base)).toBe("PART_TIME_WORK");
  });

  it("housingStatus=still_looking requires HOUSING_GUIDANCE before ARRIVAL_DATE", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      familyMembersAccompanying: false,
      plansPartTimeWork: false,
      housingStatus: "still_looking",
    };
    expect(getNextStep(base)).toBe("HOUSING_GUIDANCE");
    expect(getNextStep({ ...base, sawHousingGuidance: true })).toBe("ARRIVAL_DATE");
  });

  it("housingStatus=signed/temporary skips HOUSING_GUIDANCE entirely", () => {
    const base: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      familyMembersAccompanying: false,
      plansPartTimeWork: false,
      housingStatus: "signed",
    };
    expect(getNextStep(base)).toBe("ARRIVAL_DATE");
  });

  it("full happy path reaches COMPLETE only once every field is set", () => {
    const complete: IntakeAnswers = {
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      familyMembersAccompanying: false,
      plansPartTimeWork: false,
      housingStatus: "signed",
      arrivalDate: "2027-01-01",
      email: "a@b.com",
    };
    expect(getNextStep(complete)).toBe("COMPLETE");
    expect(isComplete(complete)).toBe(true);
  });
});

describe("computePath - the step rail shown to the user", () => {
  it("always ends at the current unanswered step", () => {
    const answers: IntakeAnswers = { euEeaCitizen: false, applicantType: "new" };
    const path = computePath(answers);
    expect(path[path.length - 1]).toBe("NATIONALITY");
  });

  it("never includes steps beyond what's actually been answered (no guessing ahead)", () => {
    const path = computePath({ euEeaCitizen: false });
    expect(path).toEqual(["EU_EEA_CITIZEN", "APPLICANT_TYPE"]);
  });

  it("reflects the renewal branch, not the full questionnaire, once applicantType=returning is known", () => {
    const path = computePath({ euEeaCitizen: false, applicantType: "returning" });
    expect(path).toEqual(["EU_EEA_CITIZEN", "APPLICANT_TYPE", "RENEWAL_PERMIT_TYPE"]);
    expect(path).not.toContain("NATIONALITY");
  });
});

describe("estimateTotalPath - regression coverage for the '4/4 always shows complete' bug", () => {
  it("with no answers, estimates the full long-branch questionnaire (11 steps)", () => {
    const path = estimateTotalPath({}).filter((s) => s !== "COMPLETE");
    expect(path.length).toBe(11);
  });

  it("never loops/stalls on a single step (would previously happen when an assumption was missing)", () => {
    const path = estimateTotalPath({});
    // one entry per distinct step, no duplicate consecutive entries piling up
    const counts = new Map<string, number>();
    for (const s of path) counts.set(s, (counts.get(s) ?? 0) + 1);
    for (const [step, count] of counts) {
      expect(count, `step ${step} appeared ${count} times`).toBe(1);
    }
  });

  it("shrinks correctly once a shorter real branch is confirmed (EU/EEA)", () => {
    const path = estimateTotalPath({ euEeaCitizen: true }).filter((s) => s !== "COMPLETE");
    expect(path).toEqual(["EMAIL"]);
  });

  it("shrinks correctly for the renewal branch", () => {
    const path = estimateTotalPath({ euEeaCitizen: false, applicantType: "returning" }).filter(
      (s) => s !== "COMPLETE"
    );
    expect(path).toEqual(["RENEWAL_PERMIT_TYPE", "RENEWAL_PERMIT_EXPIRY", "EMAIL"]);
  });

  it("combined with steps-already-passed, produces a stable grand total as the user answers forward", () => {
    // This is the exact fix verified live in the browser: 1/11 -> 2/11 ->
    // 3/11 -> 4/11, not a shrinking denominator.
    const totalAt = (answers: IntakeAnswers, currentIndex: number) =>
      currentIndex + estimateTotalPath(answers).filter((s) => s !== "COMPLETE").length;

    const step1Total = totalAt({}, 0);
    const step2Total = totalAt({ euEeaCitizen: false }, 1);
    const step3Total = totalAt({ euEeaCitizen: false, applicantType: "new" }, 2);
    const step4Total = totalAt(
      { euEeaCitizen: false, applicantType: "new", nationality: "Nigeria" },
      3
    );

    expect(step1Total).toBe(11);
    expect(step2Total).toBe(11);
    expect(step3Total).toBe(11);
    expect(step4Total).toBe(11);
  });
});

describe("deriveCaseType", () => {
  it("EU/EEA citizens are eu_registration regardless of other fields", () => {
    expect(deriveCaseType({ euEeaCitizen: true })).toBe("eu_registration");
  });

  it("returning applicants are renewal", () => {
    expect(deriveCaseType({ euEeaCitizen: false, applicantType: "returning" })).toBe("renewal");
  });

  it("no acceptance letter is pre_acceptance", () => {
    expect(
      deriveCaseType({ euEeaCitizen: false, applicantType: "new", hasAcceptanceLetter: false })
    ).toBe("pre_acceptance");
  });

  it("everything else is the full new_student_visa path", () => {
    expect(
      deriveCaseType({ euEeaCitizen: false, applicantType: "new", hasAcceptanceLetter: true })
    ).toBe("new_student_visa");
  });
});

describe("deriveUserFields - the mapping intake answers -> Users table columns", () => {
  it("computes IPREM-relevant family members from spouseIncluded/childCount", () => {
    const fields = deriveUserFields({
      euEeaCitizen: false,
      applicantType: "new",
      nationality: "Nigeria",
      hasAcceptanceLetter: true,
      spouseIncluded: true,
      childCount: 2,
    });
    expect(fields.intakeAnswers.familyMembers).toEqual([
      { relationship: "spouse" },
      { relationship: "child" },
      { relationship: "child" },
    ]);
  });

  it("defaults studentStatus to 'new' for branches with no meaningful new/returning answer", () => {
    const fields = deriveUserFields({ euEeaCitizen: true });
    expect(fields.studentStatus).toBe("new");
  });

  it("maps euStatus correctly", () => {
    expect(deriveUserFields({ euEeaCitizen: true }).euStatus).toBe("eu_eea");
    expect(deriveUserFields({ euEeaCitizen: false }).euStatus).toBe("non_eu");
  });
});
