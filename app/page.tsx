import Link from "next/link";
import { PRICING_TIERS } from "@/lib/pricing";

const TRUST_POINTS = ["No AI-generated guidance", "Human-reviewed content", "Full price shown upfront"];

const FEATURES = [
  {
    icon: "🧭",
    iconBg: "rgba(27,58,62,.07)",
    iconColor: "var(--rb-teal)",
    title: "Understand your visa path",
    body: "See exactly which visa route applies to your nationality, program and dates.",
  },
  {
    icon: "📄",
    iconBg: "rgba(27,58,62,.07)",
    iconColor: "var(--rb-teal)",
    title: "Track your documents",
    body: "Every form and file you need, checked off as you gather them.",
  },
  {
    icon: "⚖️",
    iconBg: "rgba(212,86,46,.1)",
    iconColor: "var(--rb-orange)",
    title: "Talk to a lawyer when needed",
    body: "Book a vetted immigration lawyer only for the steps that truly call for it.",
  },
];

function RouteIllustration() {
  return (
    <div
      className="rb-hero-illustration-panel"
      style={{
        position: "relative",
        borderRadius: 28,
        background: "linear-gradient(135deg, var(--rb-teal) 0%, #234b50 100%)",
        padding: "40px 28px",
        overflow: "hidden",
        boxShadow: "0 30px 60px -30px rgba(27,58,62,.5)",
      }}
    >
      <div className="rb-hero-illustration" style={{ position: "relative", height: 260 }}>
        <svg
          width="100%"
          height="260"
          viewBox="0 0 380 260"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M30 220 C 110 220 80 150 170 150 C 260 150 235 70 340 46"
            stroke="rgba(245,242,236,.4)"
            strokeWidth="2.5"
            strokeDasharray="7 8"
            fill="none"
          />
        </svg>
        <span style={{ position: "absolute", left: 14, top: 204, width: 34, height: 34, borderRadius: 999, background: "#F5F2EC", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 15, boxShadow: "0 6px 16px -6px rgba(0,0,0,.35)" }}>
          1
        </span>
        <span style={{ position: "absolute", left: 150, top: 132, width: 34, height: 34, borderRadius: 999, background: "#F5F2EC", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 15, boxShadow: "0 6px 16px -6px rgba(0,0,0,.35)" }}>
          2
        </span>
        <span style={{ position: "absolute", left: 316, top: 14, width: 34, height: 34, borderRadius: 999, background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 8px 20px -8px rgba(212,86,46,.7)" }}>
          📍
        </span>
      </div>
      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13.5, color: "#B8CFCC", margin: "12px 0 0", textAlign: "center" }}>
        From application to arrival — every step in order.
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--font-figtree)", color: "var(--rb-text)" }}>
      {/* Hero — warm white with a soft teal glow for depth, not a flat block.
          Navy-teal and terracotta are both real accents here, not background fills. */}
      <div style={{ position: "relative", background: "linear-gradient(180deg, var(--rb-bg) 0%, #fff 100%)", overflow: "hidden" }}>
        <div
          aria-hidden
          className="rb-hero-blob"
          style={{
            position: "absolute",
            top: -180,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(27,58,62,.10) 0%, rgba(27,58,62,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          className="rb-hero-blob"
          style={{
            position: "absolute",
            bottom: -220,
            left: -160,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,86,46,.08) 0%, rgba(212,86,46,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="rb-container" style={{ position: "relative", maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ font: "600 22px var(--font-spectral)", color: "var(--rb-teal)" }}>Rutabien</span>
            </div>
            <Link
              href="/intake"
              style={{
                background: "var(--rb-teal)",
                border: "1.5px solid var(--rb-teal)",
                color: "#F5F2EC",
                borderRadius: 10,
                padding: "11px 20px",
                fontFamily: "var(--font-figtree)",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Get my roadmap
            </Link>
          </div>

          <div className="rb-hero-row" style={{ display: "flex", alignItems: "center", gap: 64, padding: "36px 0 76px" }}>
            <div style={{ flex: "1 1 480px", maxWidth: 560 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-figtree)",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1px",
                  color: "var(--rb-orange)",
                  background: "rgba(212,86,46,.08)",
                  border: "1px solid rgba(212,86,46,.2)",
                  borderRadius: 999,
                  padding: "7px 16px",
                }}
              >
                You&apos;ve got this
              </span>
              <h1 className="rb-hero-title" style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, lineHeight: "1.08", color: "var(--rb-text)", margin: "20px 0 0", letterSpacing: "-1px" }}>
                Every step, mapped.
              </h1>
              <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 18, lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: "22px 0 0", maxWidth: 460 }}>
                Rutabien turns Spain&apos;s visa and paperwork maze into a clear, personal
                roadmap — built for international students moving to Barcelona.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 22 }}>
                <span style={{ color: "var(--rb-orange)", fontSize: 13 }}>★★★★★</span>
                <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13.5, color: "var(--rb-text-muted)" }}>
                  Built with immigration lawyers practicing in Barcelona
                </span>
              </div>
              <div className="rb-hero-ctas" style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 34 }}>
                <Link
                  href="/intake"
                  style={{
                    background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                    color: "#fff",
                    borderRadius: 14,
                    padding: "17px 26px",
                    fontFamily: "var(--font-figtree)",
                    fontWeight: 600,
                    fontSize: 17,
                    boxShadow: "0 16px 34px -14px rgba(212,86,46,.55)",
                  }}
                >
                  Get my roadmap →
                </Link>
                <Link
                  href="/roadmap"
                  style={{
                    color: "var(--rb-teal)",
                    background: "transparent",
                    border: "1.5px solid var(--rb-border)",
                    borderRadius: 14,
                    fontFamily: "var(--font-figtree)",
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "15px 22px",
                  }}
                >
                  See a sample roadmap
                </Link>
              </div>
              <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 14, color: "var(--rb-text-muted)", margin: "20px 0 0" }}>
                Free roadmap, no card required · about 2 minutes
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 18 }}>
                {TRUST_POINTS.map((t) => (
                  <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 12.5, color: "var(--rb-text-muted)" }}>
                    <span style={{ width: 15, height: 15, flex: "none", borderRadius: 999, background: "rgba(27,58,62,.1)", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                      ✓
                    </span>
                    {t}
                  </span>
                ))}
              </div>
              <Link href="/access" style={{ display: "block", color: "var(--rb-teal)", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, marginTop: 14 }}>
                Already started? Access your roadmap →
              </Link>
              <Link href="/translation" style={{ display: "block", color: "var(--rb-teal)", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, marginTop: 8 }}>
                Just need a translation? →
              </Link>
            </div>

            <div style={{ flex: "1 1 380px", maxWidth: 420, width: "100%" }}>
              <RouteIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rb-container" style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 48px", background: "var(--rb-bg)" }}>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", color: "var(--rb-orange)", margin: "0 0 30px", textAlign: "center" }}>
          How it works
        </p>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                flex: "1 1 280px",
                maxWidth: 320,
                background: "#fff",
                borderRadius: 20,
                padding: "32px 28px",
                boxShadow: "0 18px 40px -26px rgba(27,58,62,.2)",
              }}
            >
              <span style={{ width: 44, height: 44, borderRadius: 12, background: f.iconBg, color: f.iconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
                {f.icon}
              </span>
              <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)", margin: "20px 0 8px" }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 15, lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: 0 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing — shown here, not just buried at the end of the paywall funnel.
          Pulls from lib/pricing.ts so this can never drift from the real price. */}
      <div className="rb-container" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px 76px", background: "#fff" }}>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", color: "var(--rb-orange)", margin: "0 0 12px", textAlign: "center" }}>
          Pricing
        </p>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 15, color: "var(--rb-text-secondary)", margin: "0 0 30px", textAlign: "center" }}>
          One-time payment, full price shown now — never a surprise at checkout.
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px", maxWidth: 320, background: "#fff", border: "1.5px solid var(--rb-border)", borderRadius: 20, padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 19, color: "var(--rb-text)", margin: 0 }}>
              {PRICING_TIERS.essential.name}
            </h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
              <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 32, color: "var(--rb-text)" }}>
                €{PRICING_TIERS.essential.priceEur}
              </span>
              <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-text-muted)" }}>one-time</span>
            </div>
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14, lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
              {PRICING_TIERS.essential.includes.join(" · ")}
            </p>
          </div>
          <div
            style={{
              flex: "1 1 280px",
              maxWidth: 320,
              background: "linear-gradient(160deg, var(--rb-teal) 0%, #234b50 100%)",
              borderRadius: 20,
              padding: "28px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -12,
                left: 24,
                background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                color: "#fff",
                padding: "4px 11px",
                borderRadius: 999,
                fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 10.5,
                letterSpacing: ".3px",
              }}
            >
              Most popular
            </span>
            <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 19, color: "#F5F2EC", margin: 0 }}>
              {PRICING_TIERS.complete.name}
            </h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
              <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 32, color: "#F5F2EC" }}>
                €{PRICING_TIERS.complete.priceEur}
              </span>
              <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "#B8CFCC" }}>valid 12 months</span>
            </div>
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14, lineHeight: "1.6", color: "#DCE7E5", margin: "14px 0 0" }}>
              {PRICING_TIERS.complete.includes.join(" · ")}
            </p>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/paywall" style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 14, color: "var(--rb-teal)" }}>
            See full plan details →
          </Link>
        </p>
      </div>

      {/* CTA banner — soft elevated card instead of a dark full-bleed block */}
      <div style={{ background: "var(--rb-bg)", padding: "0 48px 76px" }}>
        <div
          className="rb-container"
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid var(--rb-border)",
            borderRadius: 24,
            padding: "56px 48px",
            boxShadow: "0 24px 56px -32px rgba(27,58,62,.25)",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 52,
              height: 52,
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--rb-teal) 0%, #234b50 100%)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              margin: "0 auto 20px",
            }}
          >
            🧭
          </span>
          <p style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 30, lineHeight: "1.4", color: "var(--rb-teal)", letterSpacing: "-.3px" }}>
            See your personalized roadmap in minutes. Talk to a lawyer only when you actually
            need one.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "36px 48px", background: "#fff" }}>
        <div className="rb-container" style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 15, color: "var(--rb-text-secondary)" }}>
              Rutabien · Every step, mapped.
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "#B0A188" }}>Admin</span>
        </div>
      </div>
    </div>
  );
}
