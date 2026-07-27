"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HomeLink from "../../../HomeLink";
import { Heading, PageShell, Text } from "@/components/ui";

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
            Payment confirmed - taking you to your order…
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
