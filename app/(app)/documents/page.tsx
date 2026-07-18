"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: string;
  name: string;
  status: "needed" | "uploaded" | "verified";
  fileRef: string | null;
  validityExpiryDate: string | null;
  translationRequired: boolean;
  notarizationRequired: boolean;
};

type DocsData = {
  paymentStatus: "unpaid" | "essential" | "complete";
  documents: Doc[];
};

const STATUS_CHIP: Record<Doc["status"], React.CSSProperties> = {
  verified: { background: "rgba(27,58,62,.12)", color: "var(--rb-teal)" },
  uploaded: { background: "rgba(212,86,46,.15)", color: "var(--rb-orange)" },
  needed: { background: "rgba(34,48,60,.07)", color: "#6B7A85" },
};

const STATUS_LABEL: Record<Doc["status"], string> = {
  verified: "Verified",
  uploaded: "Uploaded",
  needed: "Needed",
};

export default function DocumentsPage() {
  const [data, setData] = useState<DocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepUpFor, setStepUpFor] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [stepUpSent, setStepUpSent] = useState(false);
  const [stepUpBusy, setStepUpBusy] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(doc: Doc, file: File) {
    setError(null);
    const res = await fetch(`/api/documents/${doc.id}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type || "application/octet-stream" }),
    });
    if (!res.ok) {
      setError("Could not start upload.");
      return;
    }
    const { uploadUrl } = await res.json();
    const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    if (!putRes.ok) {
      setError("Upload failed — please try again.");
      return;
    }
    setData((d) =>
      d
        ? { ...d, documents: d.documents.map((doc2) => (doc2.id === doc.id ? { ...doc2, status: "uploaded", fileRef: "pending" } : doc2)) }
        : d
    );
  }

  async function handleDelete(doc: Doc) {
    setError(null);
    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    if (res.ok) {
      setData((d) =>
        d
          ? { ...d, documents: d.documents.map((doc2) => (doc2.id === doc.id ? { ...doc2, status: "needed", fileRef: null } : doc2)) }
          : d
      );
    } else {
      setError("Could not remove file.");
    }
  }

  async function attemptDownload(doc: Doc) {
    setError(null);
    const res = await fetch(`/api/documents/${doc.id}/download-url`, { method: "POST" });
    if (res.ok) {
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
      return;
    }
    if (res.status === 403) {
      setStepUpFor(doc.id);
      setStepUpSent(false);
      setCode("");
      return;
    }
    setError("Could not open document.");
  }

  async function requestStepUpCode() {
    setStepUpBusy(true);
    await fetch("/api/auth/step-up/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "document_access" }),
    });
    setStepUpBusy(false);
    setStepUpSent(true);
  }

  async function verifyStepUpAndDownload() {
    if (!stepUpFor) return;
    setStepUpBusy(true);
    const res = await fetch("/api/auth/step-up/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, purpose: "document_access" }),
    });
    if (res.ok) {
      const docId = stepUpFor;
      setStepUpFor(null);
      const doc = data?.documents.find((d) => d.id === docId);
      if (doc) await attemptDownload(doc);
    } else {
      setError("Incorrect or expired code.");
    }
    setStepUpBusy(false);
  }

  if (loading) return <Centered><Muted>Loading your documents…</Muted></Centered>;

  if (!data) {
    return (
      <Centered>
        <div style={{ textAlign: "center" }}>
          <Muted>You need to access your roadmap first.</Muted>
          <Link href="/access" style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 14, color: "var(--rb-teal)" }}>
            Access your roadmap →
          </Link>
        </div>
      </Centered>
    );
  }

  if (data.paymentStatus !== "complete") {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 26, color: "var(--rb-text)", margin: 0 }}>
            Document Vault is a Complete plan feature
          </h2>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14.5, lineHeight: 1.6, color: "var(--rb-text-secondary)", margin: "12px 0 22px" }}>
            Secure storage for your originals and translations, folder-organized, one file at a
            time.
          </p>
          <Link
            href="/paywall"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
              color: "#fff",
              borderRadius: 12,
              padding: "13px 22px",
              fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 14.5,
            }}
          >
            See plans — from €39
          </Link>
        </div>
      </Centered>
    );
  }

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 720, margin: "0 auto", padding: "44px 48px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 34, color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
        Document Vault
      </h1>
      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13.5, color: "var(--rb-text-muted)", margin: "10px 0 0" }}>
        Encrypted at rest. Each file is stored and downloaded individually — never merged.
        Viewing or downloading requires a fresh verification code.
      </p>
      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 12, color: "var(--rb-text-muted)", margin: "8px 0 0" }}>
        Retained while your account is active. After an extended period of inactivity,
        you&apos;ll get a warning email before anything is removed.
      </p>

      {error && (
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-orange)", marginTop: 16 }}>{error}</p>
      )}

      <div style={{ marginTop: 24 }}>
        {data.documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: "#fff",
              border: "1px solid rgba(34,48,60,.08)",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text)" }}>{doc.name}</div>
              <span style={{ ...STATUS_CHIP[doc.status], display: "inline-flex", marginTop: 6, padding: "3px 9px", borderRadius: 999, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 10.5 }}>
                {STATUS_LABEL[doc.status]}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {doc.fileRef && (
                <>
                  <button onClick={() => attemptDownload(doc)} style={btnStyle}>
                    View / Download
                  </button>
                  <button onClick={() => handleDelete(doc)} style={{ ...btnStyle, color: "var(--rb-orange)" }}>
                    Remove
                  </button>
                </>
              )}
              {!doc.fileRef && (
                <label style={{ ...btnStyle, cursor: "pointer" }}>
                  Upload
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(doc, file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
        {data.documents.length === 0 && <Muted>No documents in your roadmap yet.</Muted>}
      </div>

      {stepUpFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,31,36,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)", margin: 0 }}>
              Verify it&apos;s you
            </h3>
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13.5, color: "var(--rb-text-secondary)", margin: "10px 0 18px" }}>
              For document access, we need a fresh code even though you&apos;re signed in.
            </p>
            {!stepUpSent ? (
              <button onClick={requestStepUpCode} disabled={stepUpBusy} style={primaryBtnStyle}>
                {stepUpBusy ? "Sending…" : "Send verification code"}
              </button>
            ) : (
              <>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontSize: 15, marginBottom: 12 }}
                />
                <button onClick={verifyStepUpAndDownload} disabled={stepUpBusy || code.length !== 6} style={primaryBtnStyle}>
                  {stepUpBusy ? "Verifying…" : "Verify and open"}
                </button>
              </>
            )}
            <button
              onClick={() => setStepUpFor(null)}
              style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-muted)", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-figtree)",
  fontWeight: 600,
  fontSize: 12.5,
  color: "var(--rb-text)",
  cursor: "pointer",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: 13,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)",
  color: "#fff",
  fontFamily: "var(--font-figtree)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>{children}</div>;
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text-muted)" }}>{children}</p>;
}
