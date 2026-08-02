"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Heading, PageShell, Text, TextInput } from "@/components/ui";
import HomeLink from "../HomeLink";

export default function VerifyTwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <VerifyTwoFactorInner />
    </Suspense>
  );
}

function VerifyTwoFactorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/verify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (res.ok) {
      router.push(searchParams.get("redirect") || "/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong - please try again.");
    }
  }

  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Heading size="lg">Enter your code</Heading>
        <Text style={{ marginTop: 14 }}>
          Open your authenticator app and enter the current 6-digit code for Rutabien.
        </Text>
        <div style={{ marginTop: "var(--space-6)" }}>
          <TextInput
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
          />
        </div>
        {error && (
          <Text size={13.5} color="var(--rb-orange)" style={{ marginTop: 10 }}>
            {error}
          </Text>
        )}
        <div style={{ marginTop: "var(--space-5)" }}>
          <Button variant="primary" size="lg" fullWidth disabled={busy || code.length !== 6} onClick={submit}>
            {busy ? "Verifying…" : "Verify and continue"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
