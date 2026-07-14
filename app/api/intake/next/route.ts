import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getNextStep, deriveCaseType, type IntakeAnswers } from "@/lib/intakeTree";

const answersSchema: z.ZodType<IntakeAnswers> = z.object({
  euEeaCitizen: z.boolean().optional(),
  applicantType: z.enum(["new", "returning"]).optional(),
  currentPermitType: z.string().optional(),
  currentPermitExpiry: z.string().optional(),
  nationality: z.string().optional(),
  hasAcceptanceLetter: z.boolean().optional(),
  familyMembersAccompanying: z.boolean().optional(),
  familyMembers: z.array(z.object({ relationship: z.string() })).optional(),
  plansPartTimeWork: z.boolean().optional(),
  hasHousingArranged: z.boolean().optional(),
  arrivalDate: z.string().optional(),
  email: z.string().optional(),
});

// Given the answers collected so far, returns the next step in the decision
// tree. Stateless — the caller (UI or otherwise) owns the answers object and
// resubmits it whole each time, so this has no server-side session state.
export async function POST(req: NextRequest) {
  const parsed = answersSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const step = getNextStep(parsed.data);
  const caseType = deriveCaseType(parsed.data);

  return NextResponse.json({ step, caseType });
}
