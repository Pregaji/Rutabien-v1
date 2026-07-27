"use client";

import { useEffect, useState } from "react";
import { Button, Chip, Text } from "@/components/ui";
import type { ChipTone } from "@/components/ui/Chip";

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
  createdAt: string;
};

const PAYMENT_TONE: Record<AdminUserRow["payment"], ChipTone> = {
  complete: "orange",
  essential: "teal",
  unpaid: "neutral",
};

const PAYMENT_OPTIONS: Array<AdminUserRow["payment"] | "All"> = ["All", "complete", "essential", "unpaid"];

function filterPillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--rb-border)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 12.5,
    background: active ? "var(--rb-text)" : "#fff",
    color: active ? "#fff" : "var(--rb-text-secondary)",
    cursor: "pointer",
  };
}

export default function AdminUsersTable() {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [filterCase, setFilterCase] = useState("All");
  const [filterPayment, setFilterPayment] = useState<AdminUserRow["payment"] | "All">("All");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRows(data.users))
      .catch(() => setRows([]));
  }, []);

  if (!rows) {
    return (
      <Text muted style={{ marginTop: 20 }}>
        Loading…
      </Text>
    );
  }

  const flaggedCount = rows.filter((r) => r.flagged).length;
  const caseTypeOptions = ["All", ...Array.from(new Set(rows.map((r) => r.caseType).filter((c): c is string => !!c)))];

  let visible = rows;
  if (filterFlagged) visible = visible.filter((r) => r.flagged);
  if (filterCase !== "All") visible = visible.filter((r) => r.caseType === filterCase);
  if (filterPayment !== "All") visible = visible.filter((r) => r.payment === filterPayment);
  visible = [...visible].sort((a, b) =>
    sortNewestFirst ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <div>
      <Text size={14} style={{ margin: "6px 0 0" }}>
        {flaggedCount} flagged for legal review
      </Text>
      <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {caseTypeOptions.map((c) => (
            <button key={c} onClick={() => setFilterCase(c)} style={filterPillStyle(filterCase === c)}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PAYMENT_OPTIONS.map((p) => (
            <button key={p} onClick={() => setFilterPayment(p)} style={filterPillStyle(filterPayment === p)}>
              {p}
            </button>
          ))}
        </div>
        <Button
          variant={filterFlagged ? "primary" : "outline"}
          size="md"
          style={{
            padding: "8px 14px",
            fontSize: 12.5,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--rb-border)",
            color: filterFlagged ? "#fff" : "var(--rb-text-secondary)",
            boxShadow: "none",
          }}
          onClick={() => setFilterFlagged((f) => !f)}
        >
          {filterFlagged ? "Showing flagged only" : "Show flagged only"}
        </Button>
        <button
          onClick={() => setSortNewestFirst((s) => !s)}
          style={{ marginLeft: "auto", background: "#fff", border: "1px solid var(--rb-border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--rb-text-secondary)", cursor: "pointer" }}
        >
          Joined: {sortNewestFirst ? "Newest" : "Oldest"}
        </button>
      </div>

      <div style={{ marginTop: 22, background: "#fff", border: "1px solid var(--rb-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.3fr 1fr 1fr 1.2fr .9fr",
            padding: "12px 20px",
            background: "var(--rb-table-header-bg)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 11.5,
            letterSpacing: ".3px",
            textTransform: "uppercase",
            color: "var(--rb-text-muted)",
          }}
        >
          <span>Name</span>
          <span>Case type</span>
          <span>Progress</span>
          <span>Payment</span>
          <span>Docs outstanding</span>
          <span>Flag</span>
        </div>
        {visible.map((u) => (
          <div
            key={u.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.3fr 1fr 1fr 1.2fr .9fr",
              padding: "14px 20px",
              borderTop: "1px solid var(--rb-table-row-border)",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-text)" }}>{u.name}</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13.5, color: "var(--rb-text-secondary)" }}>{u.caseType ?? "-"}</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--rb-text-dense)" }}>{u.progress}%</span>
            <Chip tone={PAYMENT_TONE[u.payment]} style={{ width: "fit-content" }}>
              {u.payment}
            </Chip>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--rb-text-dense)" }}>{u.docsOutstanding}</span>
            {u.flagged && (
              <Chip tone="orange" style={{ width: "fit-content" }}>
                Flagged
              </Chip>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <Text muted style={{ padding: 20 }}>
            No students yet.
          </Text>
        )}
      </div>
    </div>
  );
}
