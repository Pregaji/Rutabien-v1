import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminUsersTable from "./AdminUsersTable";
import AdminLogoutButton from "./AdminLogoutButton";
import { Heading } from "@/components/ui";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div style={{ minHeight: "100vh", background: "var(--rb-table-header-bg)" }}>
      <div style={{ background: "var(--rb-text)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>Rutabien Admin</span>
          <AdminLogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 40px 80px" }}>
        <Heading size="md" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 24 }}>
          Students
        </Heading>
        <AdminUsersTable />
      </div>
    </div>
  );
}
