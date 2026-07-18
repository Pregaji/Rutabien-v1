import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, documents } from "@/db/schema";
import { deleteObject } from "@/lib/storage";
import { sendRetentionWarningEmail } from "@/lib/email";

// Section 6 of MVP_Draft.md flags this as its own compliance gap: "retained
// while your account is active; after [X years] of inactivity, you'll be
// notified before anything is removed." The actual X is a policy decision
// for Ida/legal, not an engineering one — these are placeholder defaults so
// the mechanism exists and is provably safe (warn, then wait, then delete),
// not a claim that 24 months is the final agreed number.
const WARN_AFTER_INACTIVE_DAYS = 24 * 30; // ~24 months
const DELETE_AFTER_WARNING_DAYS = 30; // grace period stated in the warning email

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export async function runRetentionWarnings(): Promise<number> {
  const candidates = await db
    .select()
    .from(users)
    .where(isNull(users.retentionWarnedAt));

  let warned = 0;
  for (const user of candidates) {
    if (daysSince(user.lastActiveAt) < WARN_AFTER_INACTIVE_DAYS) continue;

    const [hasFile] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.userId, user.id), isNotNull(documents.fileRef)))
      .limit(1);
    if (!hasFile) continue;

    await sendRetentionWarningEmail({
      to: user.email,
      graceDays: DELETE_AFTER_WARNING_DAYS,
      accessUrl: `${process.env.APP_URL}/access`,
    });
    await db.update(users).set({ retentionWarnedAt: new Date() }).where(eq(users.id, user.id));
    warned++;
  }
  return warned;
}

export async function runRetentionDeletions(): Promise<number> {
  const candidates = await db
    .select()
    .from(users)
    .where(isNotNull(users.retentionWarnedAt));

  let deleted = 0;
  for (const user of candidates) {
    if (!user.retentionWarnedAt) continue;
    if (daysSince(user.retentionWarnedAt) < DELETE_AFTER_WARNING_DAYS) continue;
    // If they came back, verify/route already clears retentionWarnedAt —
    // still active users never reach this branch.

    const files = await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, user.id), isNotNull(documents.fileRef)));

    for (const doc of files) {
      if (doc.fileRef) await deleteObject(doc.fileRef);
      await db
        .update(documents)
        .set({ fileRef: null, status: "needed", uploadedAt: null, updatedAt: new Date() })
        .where(eq(documents.id, doc.id));
      deleted++;
    }
  }
  return deleted;
}

export async function runRetentionCheck() {
  const warned = await runRetentionWarnings();
  const deleted = await runRetentionDeletions();
  return { warned, deletedFiles: deleted };
}
