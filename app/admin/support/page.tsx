import { redirect } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { db } from "@/db";
import { users, supportMessages } from "@/db/schema";
import { Heading, Text } from "@/components/ui";
import AdminLogoutButton from "../AdminLogoutButton";
import AdminSupportReplyBox from "./AdminSupportReplyBox";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminSupportInboxPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  // Threads with at least one message the FAQ responder couldn't answer -
  // see needsHumanReply on supportMessages / lib/supportFaq.ts.
  const pendingRows = await db
    .selectDistinct({ userId: supportMessages.userId })
    .from(supportMessages)
    .where(eq(supportMessages.needsHumanReply, true));

  const pendingUserIds = pendingRows.map((r) => r.userId);

  const threads = await Promise.all(
    pendingUserIds.map(async (userId) => {
      const [student] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const messages = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.userId, userId))
        .orderBy(asc(supportMessages.createdAt));
      return { userId, student, messages: messages.slice(-10) };
    })
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--rb-table-header-bg)" }}>
      <div style={{ background: "var(--rb-text)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>Rutabien Admin</span>
          <AdminLogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 40px 80px" }}>
        <Link href="/admin" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-secondary)" }}>
          ‹ All students
        </Link>
        <Heading size="md" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 24, marginTop: 10 }}>
          Support inbox {threads.length > 0 && `(${threads.length} awaiting reply)`}
        </Heading>
        <Text size={13.5} muted style={{ marginTop: 6 }}>
          Messages that didn&apos;t match the FAQ responder or the legal-escalation trigger - these need an actual reply.
        </Text>

        {threads.length === 0 ? (
          <Text size={13.5} muted style={{ marginTop: 24 }}>
            Nothing waiting on a reply.
          </Text>
        ) : (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {threads.map(({ userId, student, messages }) => (
              <div key={userId} style={{ background: "#fff", border: "1px solid var(--rb-border)", borderRadius: "var(--radius-md)", padding: "16px 18px" }}>
                <Text size={14} weight={600} color="var(--rb-text)">
                  {student ? [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email : "Unknown student"}
                </Text>
                {student && (
                  <Text size={12} muted style={{ marginTop: 2 }}>
                    {student.email}
                  </Text>
                )}

                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.from === "user" ? "flex-start" : "flex-end",
                        maxWidth: "85%",
                        background: m.from === "user" ? "var(--rb-table-header-bg)" : "rgba(20,24,26,.06)",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 12px",
                      }}
                    >
                      <Text size={13} color="var(--rb-text)">
                        {m.text}
                      </Text>
                      <Text size={10.5} muted style={{ marginTop: 2 }}>
                        {m.from === "user" ? "Student" : "Team"} · {formatDate(m.createdAt)}
                      </Text>
                    </div>
                  ))}
                </div>

                <AdminSupportReplyBox userId={userId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
