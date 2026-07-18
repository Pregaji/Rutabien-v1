"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HomeLink from "../../HomeLink";

export default function PaypalReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaypalReturnInner />
    </Suspense>
  );
}

function PaypalReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"capturing" | "done" | "error">("capturing");

  useEffect(() => {
    const orderId = params.get("token");
    const plan = params.get("plan");
    if (!orderId || !plan) {
      const t = setTimeout(() => setStatus("error"), 0);
      return () => clearTimeout(t);
    }
    fetch("/api/checkout/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, plan }),
    })
      .then((res) => setStatus(res.ok ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [params]);

  useEffect(() => {
    if (status === "done") {
      const t = setTimeout(() => router.push("/roadmap"), 1500);
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
            Payment confirmed — taking you to your roadmap…
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
