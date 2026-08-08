import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { db } from "@/db";
import { supportMessages } from "@/db/schema";
import AdminUsersTable from "./AdminUsersTable";
import AdminLogoutButton from "./AdminLogoutButton";
import { Heading } from "@/components/ui";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const pendingSupport = await db
    .selectDistinct({ userId: supportMessages.userId })
    .from(supportMessages)
    .where(eq(supportMessages.needsHumanReply, true));

  return (
    <div style={{ minHeight: "100vh", background: "var(--rb-table-header-bg)" }}>
      <div style={{ background: "var(--rb-text)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>Rutabien Admin</span>
          <AdminLogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Heading size="md" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 24 }}>
            Students
          </Heading>
          <Link
            href="/admin/support"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--rb-border)",
              background: "#fff",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--rb-text-secondary)",
            }}
          >
            Support inbox {pendingSupport.length > 0 && `(${pendingSupport.length})`}
          </Link>
        </div>
        <AdminUsersTable />
      </div>
    </div>
  );
}
