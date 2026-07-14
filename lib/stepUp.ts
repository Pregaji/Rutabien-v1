import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { stepUpVerifications } from "@/db/schema";

// How long a redeemed step-up code covers subsequent actions of the same
// purpose within the same session, so a user isn't asked for a fresh code
// on every single click while actively working through their documents.
const STEP_UP_VALID_WINDOW_MINUTES = 5;

// Used by document view/download routes to enforce the step-up requirement
// from CLAUDE.md — a fresh one-time code before accessing an uploaded
// document, even within an already-active session.
export async function hasRecentStepUp(
  sessionId: string,
  purpose = "document_access"
): Promise<boolean> {
  const cutoff = new Date(Date.now() - STEP_UP_VALID_WINDOW_MINUTES * 60 * 1000);

  const [verification] = await db
    .select()
    .from(stepUpVerifications)
    .where(
      and(
        eq(stepUpVerifications.sessionId, sessionId),
        eq(stepUpVerifications.purpose, purpose),
        isNotNull(stepUpVerifications.usedAt),
        gt(stepUpVerifications.usedAt, cutoff)
      )
    )
    .orderBy(desc(stepUpVerifications.usedAt))
    .limit(1);

  return !!verification;
}
