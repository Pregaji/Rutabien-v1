"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text, TextInput } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--rb-text)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: "var(--radius-xl)", padding: "36px 32px" }}>
        <Heading as="h2" size="sm" style={{ fontSize: 17 }}>
          Rutabien Admin
        </Heading>
        <Text size={13.5} muted style={{ margin: "0 0 26px" }}>
          Internal access only.
        </Text>
        {error && (
          <Text size={13} weight={500} color="var(--rb-orange)" style={{ marginBottom: 12 }}>
            {error}
          </Text>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Text size={12} weight={600} color="var(--rb-text-secondary)" style={{ marginBottom: 6 }}>
              Email
            </Text>
            <TextInput type="email" value={email} onChange={setEmail} placeholder="you@rutabien.com" style={{ padding: "12px 14px", fontSize: 14 }} />
          </div>
          <div>
            <Text size={12} weight={600} color="var(--rb-text-secondary)" style={{ marginBottom: 6 }}>
              Password
            </Text>
            <TextInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ padding: "12px 14px", fontSize: 14 }}
            />
          </div>
          <Button
            variant="secondary"
            fullWidth
            disabled={submitting || !email || !password}
            onClick={submit}
            style={{ background: "var(--rb-text)", color: "#fff", border: "none", marginTop: 10, padding: 13, fontSize: 14 }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <Button variant="ghost" fullWidth href="/" style={{ border: "none", color: "var(--rb-text-muted)", fontSize: 13 }}>
            Back to site
          </Button>
        </div>
      </div>
    </div>
  );
}
