"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  from: "user" | "team";
  text: string;
};

const GREETING: Message = {
  id: "greeting",
  from: "team",
  text: "Hi! We're here before and after your arrival — ask us anything about navigating the platform, your documents, or settling in. For case-specific legal questions, we'll route you to Rutabien's legal partner.",
};

const SUGGESTIONS = ["Where's my roadmap link?", "How do I upload a document?", "What does \"Locked\" mean?"];

export default function LiveSupportPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/support/message")
      .then((res) => {
        if (!res.ok) {
          setAuthed(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.messages?.length) setMessages([GREETING, ...data.messages]);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setMessages((m) => [...m, { id: `local-${Date.now()}`, from: "user", text }]);
    setDraft("");

    const res = await fetch("/api/support/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const { reply } = await res.json();
      setMessages((m) => [...m, reply]);
    }
    setSending(false);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text-secondary)" }}>
          You need to access your roadmap first.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "44px 24px 24px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 28, color: "var(--rb-text)", margin: 0 }}>
        Live support
      </h1>
      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13, color: "var(--rb-text-muted)", margin: "8px 0 20px" }}>
        Platform and navigation help. Case-specific questions route to Rutabien&apos;s legal partner.
      </p>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 16 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.from === "user" ? "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)" : "#fff",
              color: m.from === "user" ? "#fff" : "var(--rb-text)",
              border: m.from === "user" ? "none" : "1px solid rgba(34,48,60,.08)",
              borderRadius: 16,
              padding: "12px 16px",
              fontFamily: "var(--font-figtree)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1.5px solid var(--rb-border)",
              background: "#fff",
              fontFamily: "var(--font-figtree)",
              fontWeight: 600,
              fontSize: 12.5,
              color: "var(--rb-teal)",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(draft)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: "14px 16px", borderRadius: 14, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontSize: 14 }}
        />
        <button
          onClick={() => send(draft)}
          disabled={sending || !draft.trim()}
          style={{
            padding: "0 20px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
            color: "#fff",
            fontFamily: "var(--font-figtree)",
            fontWeight: 600,
            fontSize: 14,
            cursor: sending ? "default" : "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
