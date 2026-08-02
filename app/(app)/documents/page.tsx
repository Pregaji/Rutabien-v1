"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button, Card, Chip, Heading, PageShell, Text, TextInput } from "@/components/ui";
import { DocumentVaultScene } from "@/components/illustrations/DocumentVaultScene";

type Doc = {
  id: string;
  requirementId: string | null;
  familyMemberId: string | null;
  name: string;
  status: "needed" | "uploaded" | "verified";
  fileRef: string | null;
  validityExpiryDate: string | null;
  translationRequired: boolean;
  notarizationRequired: boolean;
  translationOrderId: string | null;
};

type FamilyMemberRow = {
  id: string;
  name: string;
  relationship: string;
};

type DocsData = {
  paymentStatus: "unpaid" | "essential" | "complete";
  documents: Doc[];
  familyMembers: FamilyMemberRow[];
};

type Step = {
  id: string;
  stepKey: string;
  stepLabel: string;
  phase: string | null;
  position: number;
};

const STATUS_LABEL: Record<Doc["status"], string> = {
  verified: "Verified",
  uploaded: "Uploaded",
  needed: "Needed",
};

export default function DocumentsPage() {
  const [data, setData] = useState<DocsData | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type StepUpTarget =
    | { kind: "doc"; id: string }
    | { kind: "folder"; folderKey: string | null; folderLabel: string };
  const [stepUpFor, setStepUpFor] = useState<StepUpTarget | null>(null);
  const [code, setCode] = useState("");
  const [stepUpSent, setStepUpSent] = useState(false);
  const [stepUpBusy, setStepUpBusy] = useState(false);
  const [attaching, setAttaching] = useState<string | null>(null);
  const [zipping, setZipping] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelationship, setNewMemberRelationship] = useState<"spouse" | "child">("child");
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch("/api/roadmap").then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(([docsRes, roadmapRes]) => {
        setData(docsRes);
        setSteps(roadmapRes.steps ?? []);
      })
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
      setError("Upload failed - please try again.");
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

  async function attachForTranslation(doc: Doc) {
    setError(null);
    setAttaching(doc.id);
    const res = await fetch(`/api/documents/${doc.id}/attach-translation`, { method: "POST" });
    setAttaching(null);
    if (res.ok) {
      const { order } = await res.json();
      setData((d) =>
        d ? { ...d, documents: d.documents.map((doc2) => (doc2.id === doc.id ? { ...doc2, translationOrderId: order.id } : doc2)) } : d
      );
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not attach for translation.");
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
      setStepUpFor({ kind: "doc", id: doc.id });
      setStepUpSent(false);
      setCode("");
      return;
    }
    setError("Could not open document.");
  }

  async function attemptFolderDownload(folderKey: string | null, folderLabel: string) {
    setError(null);
    setZipping(folderKey ?? "self");
    const res = await fetch("/api/documents/download-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyMemberId: folderKey }),
    });
    setZipping(null);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderLabel}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "Step-up verification required") {
        setStepUpFor({ kind: "folder", folderKey, folderLabel });
        setStepUpSent(false);
        setCode("");
        return;
      }
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "Could not download folder.");
  }

  async function addFamilyMember() {
    setMemberBusy(true);
    setMemberError(null);
    const res = await fetch("/api/family-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMemberName, relationship: newMemberRelationship }),
    });
    const body = await res.json().catch(() => ({}));
    setMemberBusy(false);
    if (res.ok) {
      setNewMemberName("");
      setAddingMember(false);
      // Re-fetch rather than splice in the response - the new member's
      // generated documents (createFamilyMemberDocuments) live in a
      // separate response shape than what this endpoint returns.
      const [docsRes, roadmapRes] = await Promise.all([
        fetch("/api/documents").then((r) => (r.ok ? r.json() : Promise.reject())),
        fetch("/api/roadmap").then((r) => (r.ok ? r.json() : Promise.reject())),
      ]);
      setData(docsRes);
      setSteps(roadmapRes.steps ?? []);
    } else {
      setMemberError(body.error ?? "Could not add family member.");
    }
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
      const target = stepUpFor;
      setStepUpFor(null);
      if (target.kind === "doc") {
        const doc = data?.documents.find((d) => d.id === target.id);
        if (doc) await attemptDownload(doc);
      } else {
        await attemptFolderDownload(target.folderKey, target.folderLabel);
      }
    } else {
      setError("Incorrect or expired code.");
    }
    setStepUpBusy(false);
  }

  if (loading) {
    return (
      <PageShell>
        <Text muted weight={500} size={15}>
          Loading your documents…
        </Text>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <div>
          <Text muted weight={500} size={15}>
            You need to access your roadmap first.
          </Text>
          <Link href="/access" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-teal)" }}>
            Access your roadmap
          </Link>
        </div>
      </PageShell>
    );
  }

  if (data.paymentStatus !== "complete") {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <div style={{ maxWidth: 440 }}>
          <Heading size="lg">Document Vault is a Complete plan feature</Heading>
          <Text style={{ margin: "12px 0 22px" }}>
            Secure storage for your originals and translations, folder-organized, one file at a
            time.
          </Text>
          <Button variant="primary" href="/paywall">
            See plans - from €39
          </Button>
        </div>
      </PageShell>
    );
  }

  const orderedSteps = [...steps].sort((a, b) => a.position - b.position);
  const hasSpouse = data.familyMembers.some((m) => m.relationship === "spouse");

  // One folder for the user's own documents (familyMemberId null), plus
  // one per named family member - see db/schema.ts familyMembers comment
  // for why documents are grouped by person, not just by document type.
  const folders: { key: string; label: string; relationship: string | null; docs: Doc[] }[] = [
    {
      key: "self",
      label: "My documents",
      relationship: null,
      docs: data.documents.filter((d) => !d.familyMemberId),
    },
    ...data.familyMembers.map((m) => ({
      key: m.id,
      label: m.name,
      relationship: m.relationship,
      docs: data.documents.filter((d) => d.familyMemberId === m.id),
    })),
  ];

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 820, margin: "0 auto", padding: "44px 48px 96px" }}>
      <Heading size="xl">Documents</Heading>
      <Text size={13.5} muted style={{ margin: "10px 0 0" }}>
        Encrypted at rest. Each file is stored and downloaded individually - never merged.
        Viewing or downloading requires a fresh verification code.
      </Text>
      <Text size={12} muted style={{ margin: "8px 0 0" }}>
        Retained while your account is active. After an extended period of inactivity,
        you&apos;ll get a warning email before anything is removed.
      </Text>
      <Text size={12} muted style={{ lineHeight: 1.5, margin: "8px 0 0" }}>
        Requirements based on officially published sources - not a guarantee of approval. Confirm
        current requirements with the consulate before submitting.
      </Text>

      {error && (
        <Text size={13} weight={500} color="var(--rb-orange)" style={{ marginTop: 16 }}>
          {error}
        </Text>
      )}

      <div style={{ marginTop: 30 }}>
        {folders.map((folder) => {
          if (folder.docs.length === 0) return null;
          const docsByStepKey = new Map<string, Doc[]>();
          for (const doc of folder.docs) {
            const key = doc.requirementId ?? "unassigned";
            if (!docsByStepKey.has(key)) docsByStepKey.set(key, []);
            docsByStepKey.get(key)!.push(doc);
          }
          return (
            <div key={folder.key} style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 8, borderBottom: "1.5px solid var(--rb-border)", flexWrap: "wrap" }}>
                <Heading as="h2" size="md" style={{ fontSize: 19 }}>
                  {folder.label}
                </Heading>
                {folder.relationship && (
                  <Chip tone="neutral" style={{ padding: "3px 9px", fontSize: 10.5, textTransform: "capitalize" }}>
                    {folder.relationship}
                  </Chip>
                )}
                {folder.docs.some((d) => d.fileRef) && (
                  <Button
                    variant="ghost"
                    style={{ ...smallBtnStyle, border: "none", marginLeft: "auto" }}
                    disabled={zipping === (folder.key === "self" ? "self" : folder.key)}
                    onClick={() => attemptFolderDownload(folder.key === "self" ? null : folder.key, folder.label)}
                  >
                    {zipping === (folder.key === "self" ? "self" : folder.key) ? "Zipping…" : "Download all (zip)"}
                  </Button>
                )}
              </div>
              {orderedSteps.map((step) => {
                const docs = docsByStepKey.get(step.stepKey) ?? [];
                if (docs.length === 0) return null;
                return (
                  <div key={step.id} style={{ marginBottom: 28 }}>
                    <Heading as="h3" size="sm" style={{ fontSize: 17 }}>
                      {step.stepLabel}
                    </Heading>
                    {docs.map((doc) => (
                <Card key={doc.id} style={{ padding: "16px 20px", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--rb-text)" }}>{doc.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <Chip tone="neutral" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                        {STATUS_LABEL[doc.status]}
                      </Chip>
                      {doc.translationRequired && (
                        <Chip tone="orange" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                          Translation required
                        </Chip>
                      )}
                      {doc.validityExpiryDate && (
                        <Chip tone="orange" style={{ padding: "3px 9px", fontSize: 10.5 }}>
                          Time-sensitive
                        </Chip>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {doc.fileRef && (
                      <>
                        <Button variant="outline" style={smallBtnStyle} onClick={() => attemptDownload(doc)}>
                          View / Download
                        </Button>
                        <Button variant="outline" style={{ ...smallBtnStyle, color: "var(--rb-orange)" }} onClick={() => handleDelete(doc)}>
                          Remove
                        </Button>
                        {doc.translationRequired &&
                          (doc.translationOrderId ? (
                            <Chip tone="teal" style={{ padding: "6px 12px" }}>
                              Attached for translation
                            </Chip>
                          ) : (
                            <Button
                              variant="ghost"
                              style={{ ...smallBtnStyle, border: "none", color: "var(--rb-orange)" }}
                              disabled={attaching === doc.id}
                              onClick={() => attachForTranslation(doc)}
                            >
                              {attaching === doc.id ? "Attaching…" : "Send it for translation"}
                            </Button>
                          ))}
                      </>
                    )}
                    {!doc.fileRef && (
                      <label style={{ ...smallBtnStyle, border: "1.5px dashed var(--rb-dashed-border)", background: "var(--rb-sidebar)", color: "var(--rb-teal)", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <Upload size={13} strokeWidth={1.75} />
                        Choose file or drop here
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
                </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}

        {addingMember ? (
          <Card style={{ padding: "18px 20px", marginTop: 4, marginBottom: 28 }}>
            <Heading as="h3" size="sm" style={{ fontSize: 15, marginBottom: 12 }}>
              Add a family member
            </Heading>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <TextInput
                value={newMemberName}
                onChange={setNewMemberName}
                placeholder="Name"
                style={{ maxWidth: 220 }}
              />
              <select
                value={newMemberRelationship}
                onChange={(e) => setNewMemberRelationship(e.target.value as "spouse" | "child")}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--rb-text)" }}
              >
                <option value="child">Child</option>
                {/* Only one spouse allowed - see the same check server-side
                    in /api/family-members. Any number of children. */}
                {!hasSpouse && <option value="spouse">Spouse</option>}
              </select>
              <Button
                variant="primary"
                style={smallBtnStyle}
                disabled={memberBusy || !newMemberName.trim()}
                onClick={addFamilyMember}
              >
                {memberBusy ? "Adding…" : "Add"}
              </Button>
              <Button
                variant="ghost"
                style={{ ...smallBtnStyle, border: "none", color: "var(--rb-text-muted)" }}
                onClick={() => {
                  setAddingMember(false);
                  setMemberError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            {memberError && (
              <Text size={13} color="var(--rb-orange)" style={{ marginTop: 10 }}>
                {memberError}
              </Text>
            )}
          </Card>
        ) : (
          <Button variant="outline" style={{ ...smallBtnStyle, marginBottom: 28 }} onClick={() => setAddingMember(true)}>
            + Add a family member
          </Button>
        )}

        {data.documents.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <DocumentVaultScene width={220} height={157} className="rb-empty-illustration" />
            <Text muted weight={500} size={15} style={{ marginTop: 8 }}>
              No documents in your roadmap yet.
            </Text>
          </div>
        )}
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
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 28, maxWidth: 380, width: "100%" }}>
            <Heading as="h3" size="md">
              Verify it&apos;s you
            </Heading>
            <Text size={13.5} style={{ margin: "10px 0 18px" }}>
              For document access, we need a fresh code even though you&apos;re signed in.
            </Text>
            {!stepUpSent ? (
              <Button variant="secondary" fullWidth disabled={stepUpBusy} onClick={requestStepUpCode}>
                {stepUpBusy ? "Sending…" : "Send verification code"}
              </Button>
            ) : (
              <>
                <TextInput
                  value={code}
                  onChange={setCode}
                  placeholder="6-digit code"
                  style={{ marginBottom: 12 }}
                />
                <Button variant="secondary" fullWidth disabled={stepUpBusy || code.length !== 6} onClick={verifyStepUpAndDownload}>
                  {stepUpBusy ? "Verifying…" : "Verify and open"}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              fullWidth
              style={{ border: "none", marginTop: 10, color: "var(--rb-text-muted)", fontSize: 13 }}
              onClick={() => setStepUpFor(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "var(--radius-sm)",
  fontSize: 12.5,
};
