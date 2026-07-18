"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/bienvenido", label: "Bienvenido" },
  { href: "/live-support", label: "Live support" },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid rgba(34,48,60,.08)", background: "#fff" }}>
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Link href="/" style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 18, color: "var(--rb-teal)" }}>
            Rutabien
          </Link>
          <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontFamily: "var(--font-figtree)",
                    fontWeight: 600,
                    fontSize: 13,
                    color: active ? "#fff" : "var(--rb-text-secondary)",
                    background: active ? "var(--rb-teal)" : "transparent",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-figtree)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--rb-text-muted)",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
