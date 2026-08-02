"use client";

import { useState } from "react";
import HomeLink from "../HomeLink";
import { Button, Heading, PageShell, Text, TextInput } from "@/components/ui";
import { AccessEntryScene } from "@/components/illustrations/AccessEntryScene";
import { CheckInboxScene } from "@/components/illustrations/CheckInboxScene";

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    await fetch("/api/auth/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <PageShell style={{ textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        {sent ? (
          <>
            <CheckInboxScene width={220} height={157} className="rb-empty-illustration" />
            <Heading style={{ marginTop: 8 }}>Check your inbox</Heading>
            <Text style={{ marginTop: 14 }}>
              We&apos;ve sent a link to {email}. It&apos;ll take you straight to your roadmap - no
              password needed.
            </Text>
            <Button variant="secondary" size="lg" fullWidth href="/" style={{ marginTop: 24 }}>
              Back to homepage
            </Button>
          </>
        ) : (
          <>
            <AccessEntryScene width={220} height={157} className="rb-empty-illustration" />
            <Heading style={{ marginTop: 8 }}>Access your roadmap</Heading>
            <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <TextInput type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
              <Button variant="secondary" size="lg" fullWidth disabled={!email} onClick={submit}>
                Send my access link
              </Button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
