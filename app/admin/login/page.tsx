"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeLink from "../../HomeLink";

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 380 }}>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 26, color: "var(--rb-text)", margin: 0 }}>
          Admin login
        </h2>
        {error && (
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-orange)", marginTop: 12 }}>{error}</p>
        )}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@rutabien.com"
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontSize: 15 }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontSize: 15 }}
          />
          <button
            onClick={submit}
            disabled={submitting || !email || !password}
            style={{
              background: "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontFamily: "var(--font-figtree)",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
