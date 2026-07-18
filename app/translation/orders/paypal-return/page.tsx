"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HomeLink from "../../../HomeLink";

export default function TranslationPaypalReturnPage() {
  return (
    <Suspense fallback={null}>
      <TranslationPaypalReturnInner />
    </Suspense>
  );
}

function TranslationPaypalReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"capturing" | "done" | "error">("capturing");

  useEffect(() => {
    const paypalOrderId = params.get("token");
    const orderId = params.get("orderId");
    if (!paypalOrderId || !orderId) {
      const t = setTimeout(() => setStatus("error"), 0);
      return () => clearTimeout(t);
    }
    fetch("/api/checkout/translation/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paypalOrderId }),
    })
      .then((res) => setStatus(res.ok ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [params]);

  useEffect(() => {
    if (status === "done") {
      const t = setTimeout(() => router.push("/translation/orders"), 1500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
      <HomeLink />
      <div>
        {status === "capturing" && (
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "15px", color: "var(--rb-text-muted)" }}>Confirming your payment…</p>
        )}
        {status === "done" && (
          <p style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "18px", color: "var(--rb-text)" }}>
            Payment confirmed — taking you to your order…
          </p>
        )}
        {status === "error" && (
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "15px", color: "var(--rb-orange)" }}>
            Something went wrong confirming your payment. Please contact support.
          </p>
        )}
      </div>
    </div>
  );
}
