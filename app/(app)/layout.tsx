"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Map,
  FileText,
  Languages,
  Sprout,
  Scale,
  MessageCircle,
  User,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import HelpWidget from "./HelpWidget";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/documents", label: "Documents" },
  { href: "/translation/orders", label: "Translation" },
  { href: "/bienvenido", label: "Bienvenido" },
  { href: "/lawyer", label: "Talk to a lawyer" },
];

// Desktop sidebar - a distinct, explicitly-specified item set (adds
// Support, renames the legal-referral link to "Talk to Ida"). The mobile
// drawer above is left untouched per instruction.
const DESKTOP_NAV_LINKS = [
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/translation/orders", label: "Translation", icon: Languages },
  { href: "/bienvenido", label: "Bienvenido", icon: Sprout },
  { href: "/lawyer", label: "Talk to Ida", icon: Scale },
  { href: "/live-support", label: "Support", icon: MessageCircle },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        className="rb-app-sidebar-desktop"
        style={{
          width: sidebarCollapsed ? 68 : 224,
          flexShrink: 0,
          flexDirection: "column",
          background: "#fff",
          borderRight: "1px solid rgba(34,48,60,.08)",
          position: "sticky",
          top: 0,
          height: "100vh",
          transition: "width .15s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            padding: sidebarCollapsed ? "18px 0" : "18px 16px",
            borderBottom: "1px solid rgba(34,48,60,.08)",
          }}
        >
          {!sidebarCollapsed && (
            <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--rb-teal)" }}>
              Rutabien
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "inline-flex",
              color: "var(--rb-text-muted)",
            }}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} strokeWidth={2} /> : <ChevronsLeft size={16} strokeWidth={2} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {DESKTOP_NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                title={sidebarCollapsed ? l.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: sidebarCollapsed ? 0 : 10,
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 13,
                  color: active ? "#fff" : "var(--rb-text-secondary)",
                  background: active ? "var(--rb-teal)" : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && l.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 8, borderTop: "1px solid rgba(34,48,60,.08)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Link
            href="/account/security"
            title={sidebarCollapsed ? "Account" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: sidebarCollapsed ? 0 : 10,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--rb-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            <User size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && "Account"}
          </Link>
          <button
            onClick={logout}
            title={sidebarCollapsed ? "Sign out" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: sidebarCollapsed ? 0 : 10,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--rb-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="rb-app-topbar-mobile" style={{ borderBottom: "1px solid rgba(34,48,60,.08)", background: "#fff" }}>
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--rb-teal)" }}>
              Rutabien
            </Link>

            <button
              className="rb-app-nav-mobile-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              style={{
                background: "none",
                border: "1.5px solid var(--rb-border)",
                borderRadius: "var(--radius-sm)",
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                color: "var(--rb-teal)",
                cursor: "pointer",
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <nav
              className="rb-app-nav-mobile-panel"
              style={{ borderTop: "1px solid rgba(34,48,60,.08)", padding: "8px 24px 16px", display: "flex", flexDirection: "column", gap: 2 }}
            >
              {NAV_LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: "12px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: active ? "#fff" : "var(--rb-text-secondary)",
                      background: active ? "var(--rb-teal)" : "transparent",
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Link
                href="/account/security"
                onClick={() => setMenuOpen(false)}
                style={{ padding: "12px 10px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--rb-text-muted)" }}
              >
                Account security
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{ textAlign: "left", padding: "12px 10px", background: "none", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--rb-text-muted)", cursor: "pointer" }}
              >
                Log out
              </button>
            </nav>
          )}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
        <HelpWidget />
      </div>
    </div>
  );
}
