"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function AdminSupportReplyBox({ userId }: { userId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await fetch(`/api/admin/support/${userId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setBusy(false);
    if (res.ok) {
      setText("");
      router.refresh();
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Reply to this student…"
        style={{ flex: 1, padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-body)", fontSize: 13.5 }}
      />
      <Button
        variant="outline"
        style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: "var(--radius-sm)" }}
        disabled={busy || !text.trim()}
        onClick={send}
      >
        {busy ? "Sending…" : "Reply"}
      </Button>
    </div>
  );
}
