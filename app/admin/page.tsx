import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminUsersTable from "./AdminUsersTable";
import AdminLogoutButton from "./AdminLogoutButton";
import HomeLink from "../HomeLink";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 40px 80px" }}>
      <HomeLink />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "var(--font-figtree)", fontWeight: 700, fontSize: 24, color: "var(--rb-text)", margin: 0 }}>
          Students
        </h1>
        <AdminLogoutButton />
      </div>
      <AdminUsersTable />
    </div>
  );
}
