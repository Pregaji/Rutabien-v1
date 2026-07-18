"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
      }}
      style={{ background: "none", border: "none", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-muted)", cursor: "pointer" }}
    >
      Log out
    </button>
  );
}
