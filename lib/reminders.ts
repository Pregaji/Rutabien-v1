import { and, eq, isNotNull, isNull, lt, ne } from "drizzle-orm";
import { db } from "@/db";
import { users, documents, roadmapProgress } from "@/db/schema";
import {
  sendStalledProgressEmail,
  sendUnlockReminderEmail,
  sendDocumentExpiringEmail,
} from "@/lib/email";

// Cadence discipline (MVP_Draft.md section 8): tied to real deadlines and
// data changes, not an arbitrary drip schedule. Each reminder type has its
// own dedup guard so a single run of this function never double-sends.
const STALLED_AFTER_DAYS = 14;
const UNLOCK_REMINDER_AFTER_DAYS = 3;
const EXPIRY_WARNING_WINDOW_DAYS = 14;

function accessUrl() {
  return `${process.env.APP_URL}/access`;
}

async function markReminderSent(userId: string, key: string, existing: Record<string, string>) {
  await db
    .update(users)
    .set({ remindersSent: { ...existing, [key]: new Date().toISOString() } })
    .where(eq(users.id, userId));
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export async function runUnlockReminders(): Promise<number> {
  const candidates = await db.select().from(users).where(eq(users.paymentStatus, "unpaid"));
  let sent = 0;

  for (const user of candidates) {
    const remindersSent = (user.remindersSent as Record<string, string>) ?? {};
    if (remindersSent.unlock) continue;
    if (daysSince(user.createdAt) < UNLOCK_REMINDER_AFTER_DAYS) continue;

    const [hasRoadmap] = await db
      .select({ id: roadmapProgress.id })
      .from(roadmapProgress)
      .where(eq(roadmapProgress.userId, user.id))
      .limit(1);
    if (!hasRoadmap) continue;

    await sendUnlockReminderEmail({ to: user.email, accessUrl: accessUrl() });
    await markReminderSent(user.id, "unlock", remindersSent);
    sent++;
  }

  return sent;
}

export async function runStalledProgressReminders(): Promise<number> {
  const allUsers = await db.select().from(users);
  let sent = 0;

  for (const user of allUsers) {
    const remindersSent = (user.remindersSent as Record<string, string>) ?? {};
    if (remindersSent.stalled) continue;

    const steps = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.userId, user.id));
    if (steps.length === 0) continue;

    const allDone = steps.every((s) => s.status === "done");
    if (allDone) continue;

    const mostRecentUpdate = steps.reduce(
      (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
      steps[0].updatedAt
    );
    if (daysSince(mostRecentUpdate) < STALLED_AFTER_DAYS) continue;

    await sendStalledProgressEmail({ to: user.email, accessUrl: accessUrl() });
    await markReminderSent(user.id, "stalled", remindersSent);
    sent++;
  }

  return sent;
}

export async function runDocumentExpiryReminders(): Promise<number> {
  const cutoff = new Date(Date.now() + EXPIRY_WARNING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await db
    .select({ document: documents, user: users })
    .from(documents)
    .innerJoin(users, eq(documents.userId, users.id))
    .where(
      and(
        isNotNull(documents.validityExpiryDate),
        isNull(documents.expiryReminderSentAt),
        ne(documents.status, "needed"),
        lt(documents.validityExpiryDate, cutoff)
      )
    );

  let sent = 0;
  for (const { document, user } of candidates) {
    await sendDocumentExpiringEmail({
      to: user.email,
      documentName: document.name,
      accessUrl: accessUrl(),
    });
    await db
      .update(documents)
      .set({ expiryReminderSentAt: new Date() })
      .where(eq(documents.id, document.id));
    sent++;
  }

  return sent;
}

export async function runAllReminders() {
  const [unlock, stalled, expiring] = await Promise.all([
    runUnlockReminders(),
    runStalledProgressReminders(),
    runDocumentExpiryReminders(),
  ]);
  return { unlock, stalled, expiring };
}
