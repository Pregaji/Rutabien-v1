"use client";

import { useEffect, useState } from "react";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  nationality: string | null;
  caseType: string | null;
  progress: number;
  payment: "unpaid" | "essential" | "complete";
  docsOutstanding: number;
  flagged: boolean;
};

const PAYMENT_CHIP: Record<AdminUserRow["payment"], React.CSSProperties> = {
  complete: { background: "rgba(212,86,46,.15)", color: "var(--rb-orange)" },
  essential: { background: "rgba(27,58,62,.12)", color: "var(--rb-teal)" },
  unpaid: { background: "rgba(34,48,60,.07)", color: "#6B7A85" },
};

export default function AdminUsersTable() {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRows(data.users))
      .catch(() => setRows([]));
  }, []);

  if (!rows) {
    return <p style={{ fontFamily: "var(--font-figtree)", color: "var(--rb-text-muted)", marginTop: 20 }}>Loading…</p>;
  }

  const flaggedCount = rows.filter((r) => r.flagged).length;
  const visible = filterFlagged ? rows.filter((r) => r.flagged) : rows;

  return (
    <div>
      <p style={{ fontFamily: "var(--font-figtree)", fontSize: 14, color: "var(--rb-text-secondary)", margin: "6px 0 0" }}>
        {flaggedCount} flagged for legal review
      </p>
      <div style={{ marginTop: 18 }}>
        <button
          onClick={() => setFilterFlagged((f) => !f)}
          style={{
            background: filterFlagged ? "var(--rb-orange)" : "#fff",
            color: filterFlagged ? "#fff" : "var(--rb-text-secondary)",
            border: "1px solid var(--rb-border)",
            borderRadius: 8,
            padding: "8px 14px",
            fontFamily: "var(--font-figtree)",
            fontWeight: 600,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          {filterFlagged ? "Showing flagged only" : "Show flagged only"}
        </button>
      </div>

      <div style={{ marginTop: 22, background: "#fff", border: "1px solid #E4DECD", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1fr 1fr 1.2fr .9fr", padding: "12px 20px", background: "#F4F1EC", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 11.5, letterSpacing: ".3px", textTransform: "uppercase", color: "var(--rb-text-muted)" }}>
          <span>Name</span>
          <span>Case type</span>
          <span>Progress</span>
          <span>Payment</span>
          <span>Docs outstanding</span>
          <span>Flag</span>
        </div>
        {visible.map((u) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1fr 1fr 1.2fr .9fr", padding: "14px 20px", borderTop: "1px solid #F0EBDD", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 14, color: "var(--rb-text)" }}>{u.name}</span>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13.5, color: "var(--rb-text-secondary)" }}>{u.caseType ?? "—"}</span>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13.5, color: "#3A4A54" }}>{u.progress}%</span>
            <span style={{ ...PAYMENT_CHIP[u.payment], display: "inline-flex", padding: "4px 11px", borderRadius: 999, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 11, width: "fit-content" }}>
              {u.payment}
            </span>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13.5, color: "#3A4A54" }}>{u.docsOutstanding}</span>
            {u.flagged && (
              <span style={{ background: "rgba(212,86,46,.15)", color: "var(--rb-orange)", padding: "4px 11px", borderRadius: 999, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 11, width: "fit-content" }}>
                Flagged
              </span>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <p style={{ padding: 20, fontFamily: "var(--font-figtree)", color: "var(--rb-text-muted)" }}>No students yet.</p>
        )}
      </div>
    </div>
  );
}
