"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import HelpWidget from "./HelpWidget";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/translation/orders", label: "Translation" },
  { href: "/bienvenido", label: "Bienvenido" },
  { href: "/lawyer", label: "Talk to a lawyer" },
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
          <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--rb-teal)" }}>
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
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-body)",
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
          <Button
            variant="ghost"
            style={{ border: "none", padding: 0, color: "var(--rb-text-muted)", fontSize: 13 }}
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      <HelpWidget />
    </div>
  );
}
