"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Button, Card, Heading, PageShell, Text } from "@/components/ui";
import { TravelScene } from "@/components/illustrations/TravelScene";

type Order = {
  id: string;
  files: Array<{ key: string; name: string }>;
  postalDelivery: boolean;
  totalEur: number;
  status: "pending" | "paid" | "in_progress" | "delivered";
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Awaiting documents/payment",
  paid: "Paid - in queue",
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
    return (
      <PageShell>
        <Text muted weight={500} size={15}>
          Loading your orders…
        </Text>
      </PageShell>
    );
  }
  if (orders.length === 0) {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <div>
          <TravelScene width={220} height={157} className="rb-empty-illustration" />
          <Text muted weight={500} size={15} style={{ marginTop: 8 }}>
            No translation orders yet.
          </Text>
          <Button variant="secondary" style={{ marginTop: 18 }} href="/translation">
            Start a translation
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "44px 24px 96px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Heading size="lg" style={{ fontSize: 30 }}>
          Your translation order{orders.length > 1 ? "s" : ""}
        </Heading>
        <Button variant="outline" style={{ padding: "9px 16px", fontSize: 13 }} href="/translation">
          + New translation
        </Button>
      </div>

      {error && (
        <Text size={13} weight={500} color="var(--rb-orange)" style={{ marginTop: 14 }}>
          {error}
        </Text>
      )}

      {orders.map((order) => (
        <Card key={order.id} style={{ padding: 22, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--rb-text)" }}>
              {STATUS_LABEL[order.status]}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)" }}>€{order.totalEur}</span>
          </div>
          <Text size={13} muted style={{ margin: "6px 0 0" }}>
            {order.postalDelivery ? "Includes postal delivery. " : ""}This is the full price - nothing changes at checkout.
          </Text>

          <div style={{ marginTop: 16 }}>
            {order.files.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--rb-text-secondary)", padding: "6px 0" }}>
                <FileText size={14} strokeWidth={1.75} />
                {f.name}
              </div>
            ))}
            {order.status === "pending" && (
              <label style={{ display: "inline-block", marginTop: 8, padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--rb-text)", cursor: "pointer" }}>
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
              <Button variant="outline" style={payBtnStyle} disabled={busyId === order.id} onClick={() => payWithPaypal(order)}>
                PayPal
              </Button>
              <Button variant="outline" style={payBtnStyle} disabled={busyId === order.id} onClick={() => payWithStripe(order)}>
                Credit / debit card
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

const payBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: 14,
  fontSize: 14,
};
