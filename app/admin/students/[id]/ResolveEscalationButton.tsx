"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function ResolveEscalationButton({ escalationId }: { escalationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve() {
    setBusy(true);
    const res = await fetch(`/api/admin/escalations/${escalationId}`, { method: "PATCH" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button
      variant="outline"
      style={{ padding: "7px 14px", fontSize: 12.5, borderRadius: "var(--radius-sm)" }}
      disabled={busy}
      onClick={resolve}
    >
      {busy ? "Resolving…" : "Mark resolved"}
    </Button>
  );
}
