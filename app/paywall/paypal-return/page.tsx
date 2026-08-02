"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HomeLink from "../../HomeLink";
import { Heading, PageShell, Text } from "@/components/ui";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

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
      .then((res) => {
        if (res.ok) trackEvent(ANALYTICS_EVENTS.paymentCompleted, { method: "paypal" });
        setStatus(res.ok ? "done" : "error");
      })
      .catch(() => setStatus("error"));
  }, [params]);

  useEffect(() => {
    if (status === "done") {
      const t = setTimeout(() => router.push("/dashboard"), 1500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div>
        {status === "capturing" && (
          <Text weight={500} size={15} muted>
            Confirming your payment…
          </Text>
        )}
        {status === "done" && (
          <Heading as="p" size="sm" style={{ fontSize: 18 }}>
            Payment confirmed - taking you to your roadmap…
          </Heading>
        )}
        {status === "error" && (
          <Text weight={500} size={15} color="var(--rb-orange)">
            Something went wrong confirming your payment. Please contact support.
          </Text>
        )}
      </div>
    </PageShell>
  );
}
