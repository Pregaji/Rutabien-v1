"use client";

import { useEffect, useState } from "react";
import HomeLink from "../../HomeLink";

type Order = {
  id: string;
  files: Array<{ key: string; name: string }>;
  postalDelivery: boolean;
  totalEur: number;
  status: "pending" | "paid" | "in_progress" | "delivered";
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Awaiting documents/payment",
  paid: "Paid — in queue",
  in_progress: "Translation in progress",
  delivered: "Delivered",
};

export default function TranslationOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/translation/orders")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(order: Order, file: File) {
    setError(null);
    setBusyId(order.id);
    const res = await fetch(`/api/translation/orders/${order.id}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }),
    });
    if (!res.ok) {
      setError("Could not start upload.");
      setBusyId(null);
      return;
    }
    const { uploadUrl } = await res.json();
    await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    setBusyId(null);
    load();
  }

  async function payWithStripe(order: Order) {
    setBusyId(order.id);
    const res = await fetch("/api/checkout/translation/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError("Could not start checkout.");
      setBusyId(null);
    }
  }

  async function payWithPaypal(order: Order) {
    setBusyId(order.id);
    const res = await fetch("/api/checkout/translation/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    if (res.ok && data.approveUrl) {
      window.location.href = data.approveUrl;
    } else {
      setError("Could not start PayPal checkout.");
      setBusyId(null);
    }
  }

  if (!orders) {
    return <Centered><Muted>Loading your orders…</Muted></Centered>;
  }
  if (orders.length === 0) {
    return <Centered><Muted>No translation orders yet.</Muted></Centered>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "44px 24px 96px" }}>
      <HomeLink />
      <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 30, color: "var(--rb-text)", margin: 0 }}>
        Your translation order{orders.length > 1 ? "s" : ""}
      </h1>

      {error && (
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-orange)", marginTop: 14 }}>{error}</p>
      )}

      {orders.map((order) => (
        <div key={order.id} style={{ background: "#fff", border: "1px solid rgba(34,48,60,.08)", borderRadius: 16, padding: 22, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 15, color: "var(--rb-text)" }}>
              {STATUS_LABEL[order.status]}
            </span>
            <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)" }}>€{order.totalEur}</span>
          </div>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13, color: "var(--rb-text-muted)", margin: "6px 0 0" }}>
            {order.postalDelivery ? "Includes postal delivery. " : ""}This is the full price — nothing changes at checkout.
          </p>

          <div style={{ marginTop: 16 }}>
            {order.files.map((f) => (
              <div key={f.key} style={{ fontFamily: "var(--font-figtree)", fontSize: 13.5, color: "var(--rb-text-secondary)", padding: "6px 0" }}>
                📄 {f.name}
              </div>
            ))}
            {order.status === "pending" && (
              <label style={{ display: "inline-block", marginTop: 8, padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 12.5, color: "var(--rb-text)", cursor: "pointer" }}>
                {busyId === order.id ? "Uploading…" : "+ Add document"}
                <input
                  type="file"
                  style={{ display: "none" }}
                  disabled={busyId === order.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(order, file);
                  }}
                />
              </label>
            )}
          </div>

          {order.status === "pending" && (
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => payWithPaypal(order)} disabled={busyId === order.id} style={payBtn}>
                PayPal
              </button>
              <button onClick={() => payWithStripe(order)} disabled={busyId === order.id} style={payBtn}>
                Credit / debit card
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const payBtn: React.CSSProperties = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-figtree)",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--rb-text)",
  cursor: "pointer",
};

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <HomeLink />
      {children}
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text-muted)" }}>{children}</p>;
}
