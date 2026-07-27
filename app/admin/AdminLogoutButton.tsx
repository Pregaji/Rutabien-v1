"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function AdminLogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      style={{ border: "none", padding: 0, background: "transparent", color: "var(--rb-on-teal-muted)", fontSize: 13 }}
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
      }}
    >
      Log out
    </Button>
  );
}
