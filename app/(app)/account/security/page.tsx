"use client";

import { useEffect, useState } from "react";
import { Button, Card, Heading, PageShell, Text, TextInput } from "@/components/ui";

type Status = "loading" | "off" | "setting-up" | "on";

export default function AccountSecurityPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/2fa/status")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setStatus(data.enabled ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, []);

  async function startSetup() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setSecret(data.secret);
      setStatus("setting-up");
    } else {
      setError(data.error ?? "Something went wrong - please try again.");
    }
  }

  async function confirmSetup() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus("on");
      setCode("");
      setMessage("Two-factor authentication is on.");
    } else {
      setError(data.error ?? "Incorrect code.");
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus("off");
      setCode("");
      setMessage("Two-factor authentication is off.");
    } else {
      setError(data.error ?? "Incorrect code.");
    }
  }

  return (
    <PageShell>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Heading size="lg">Account security</Heading>
        <Text style={{ margin: "10px 0 0" }}>
          Add an optional second factor from an authenticator app (Google Authenticator, Authy,
          1Password, etc). This is separate from your email - even if someone gets into your
          inbox, they still can&apos;t sign in without a code from your device.
        </Text>

        {message && (
          <Text size={13.5} color="var(--rb-teal)" style={{ marginTop: 14 }}>
            {message}
          </Text>
        )}

        {status === "loading" && (
          <Text muted style={{ marginTop: 20 }}>
            Loading…
          </Text>
        )}

        {status === "off" && (
          <Card style={{ marginTop: 20, padding: 24 }}>
            <Text weight={600} style={{ marginBottom: 6 }}>
              Two-factor authentication is off
            </Text>
            <Text size={13.5} muted style={{ marginBottom: 16 }}>
              Optional - turn it on any time.
            </Text>
            <Button variant="primary" disabled={busy} onClick={startSetup}>
              {busy ? "Starting…" : "Turn on two-factor authentication"}
            </Button>
          </Card>
        )}

        {status === "setting-up" && qrCodeDataUrl && (
          <Card style={{ marginTop: 20, padding: 24 }}>
            <Text weight={600} style={{ marginBottom: 10 }}>
              Scan this with your authenticator app
            </Text>
            {/* eslint-disable-next-line @next/next/no-img-element -- a locally-generated data: URI, not a remote image */}
            <img src={qrCodeDataUrl} alt="Two-factor authentication QR code" width={200} height={200} />
            {secret && (
              <Text size={12.5} muted style={{ marginTop: 10, wordBreak: "break-all" }}>
                Can&apos;t scan? Enter this key manually: {secret}
              </Text>
            )}
            <Text size={13.5} style={{ marginTop: 16, marginBottom: 8 }}>
              Then enter the 6-digit code it shows to confirm:
            </Text>
            <TextInput
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
            />
            {error && (
              <Text size={13.5} color="var(--rb-orange)" style={{ marginTop: 10 }}>
                {error}
              </Text>
            )}
            <div style={{ marginTop: 16 }}>
              <Button variant="primary" disabled={busy || code.length !== 6} onClick={confirmSetup}>
                {busy ? "Confirming…" : "Confirm and turn on"}
              </Button>
            </div>
          </Card>
        )}

        {status === "on" && (
          <Card style={{ marginTop: 20, padding: 24 }}>
            <Text weight={600} style={{ marginBottom: 6 }}>
              Two-factor authentication is on
            </Text>
            <Text size={13.5} muted style={{ marginBottom: 16 }}>
              Enter a current code from your authenticator app to turn it off.
            </Text>
            <TextInput
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
            />
            {error && (
              <Text size={13.5} color="var(--rb-orange)" style={{ marginTop: 10 }}>
                {error}
              </Text>
            )}
            <div style={{ marginTop: 16 }}>
              <Button variant="secondary" disabled={busy || code.length !== 6} onClick={disable}>
                {busy ? "Turning off…" : "Turn off two-factor authentication"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
