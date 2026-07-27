import Link from "next/link";
import { Check, Compass, FileText, MapPin, Scale } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaReddit } from "react-icons/fa6";
import { PRICING_TIERS } from "@/lib/pricing";
import { Button, Card, Chip, Heading, Text } from "@/components/ui";

const footerLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  fontSize: 13.5,
  color: "var(--rb-text-secondary)",
};

// Placeholder hrefs ("#") until the real accounts are live - swap each one
// for the actual profile URL once created, don't leave these pointing
// nowhere in production.
const SOCIAL_LINKS = [
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaFacebook, label: "Facebook", href: "#" },
  { icon: FaLinkedin, label: "LinkedIn", href: "#" },
  { icon: FaReddit, label: "Reddit", href: "#" },
];

const checkIcon = (bg: string, color: string) => ({
  width: 18,
  height: 18,
  flex: "none" as const,
  borderRadius: "var(--radius-full)",
  background: bg,
  color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 1,
});

const FEATURES = [
  {
    icon: Compass,
    iconBg: "rgba(27,58,62,.07)",
    iconColor: "var(--rb-teal)",
    title: "Understand your visa path",
    body: "See exactly which visa route applies to your nationality, program and dates.",
  },
  {
    icon: FileText,
    iconBg: "rgba(27,58,62,.07)",
    iconColor: "var(--rb-teal)",
    title: "Track your documents",
    body: "Every form and file you need, checked off as you gather them.",
  },
  {
    icon: Scale,
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
        background: "var(--rb-teal)",
        padding: "40px 28px",
        overflow: "hidden",
      }}
    >
      <div className="rb-hero-illustration" style={{ position: "relative", width: "100%", aspectRatio: "380 / 260" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 380 260"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            className="rb-route-path"
            d="M30 220 C 110 220 80 150 170 150 C 260 150 235 70 340 46"
            stroke="var(--rb-route-line)"
            strokeWidth="2.5"
            strokeDasharray="7 8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="rb-route-stop" style={{ position: "absolute", left: "3.7%", top: "78.5%", width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--rb-on-teal)", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, animationDelay: ".5s" }}>
          1
        </span>
        <span className="rb-route-stop" style={{ position: "absolute", left: "39.5%", top: "50.8%", width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--rb-on-teal)", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, animationDelay: "1.1s" }}>
          2
        </span>
        <span className="rb-route-stop rb-route-pin" style={{ position: "absolute", left: "83.2%", top: "5.4%", width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--rb-orange)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animationDelay: "1.7s" }}>
          <MapPin size={16} strokeWidth={2.25} />
        </span>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--rb-on-teal-faint)", margin: "12px 0 0", textAlign: "center" }}>
        From application to arrival - every step in order.
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      className="rb-snap-scroll"
      style={{
        height: "100vh",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        background: "var(--rb-on-teal)",
        fontFamily: "var(--font-body)",
        color: "var(--rb-text)",
      }}
    >
      {/* Hero - solid dark teal band per the approved prototype. One full
          viewport per section, snapping into place on scroll/touch - each
          top-level section below is wrapped in .rb-snap-section. */}
      <div className="rb-snap-section" style={{ background: "var(--rb-teal)" }}>
        <div className="rb-container" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 0" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: "var(--rb-on-teal)" }}>Rutabien</span>
            <Button
              variant="ghost"
              size="md"
              style={{ background: "transparent", border: "1.5px solid rgba(247,241,232,.4)", color: "var(--rb-on-teal)", padding: "11px 20px", fontSize: 14, borderRadius: "var(--radius-sm)" }}
              href="/intake"
            >
              Get my roadmap
            </Button>
          </div>

          <div className="rb-hero-row" style={{ display: "flex", alignItems: "center", gap: 64, padding: "36px 0 76px" }}>
            <div style={{ flex: "1 1 480px", maxWidth: 560 }}>
              <Text size={13} weight={600} color="var(--rb-on-teal-accent)" style={{ letterSpacing: "2.5px", textTransform: "uppercase", margin: 0 }}>
                You&apos;ve got this
              </Text>
              <Heading as="h1" className="rb-hero-title" color="var(--rb-on-teal)" style={{ fontSize: 56, lineHeight: 1.08, margin: "18px 0 0", letterSpacing: "-1px" }}>
                Every step, mapped.
              </Heading>
              <Text size={18} color="var(--rb-on-teal-soft)" style={{ lineHeight: 1.6, margin: "22px 0 0", maxWidth: 460 }}>
                Rutabien turns Spain&apos;s visa and paperwork maze into a clear, personal
                roadmap - built for international students moving to Barcelona.
              </Text>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 22 }}>
                <span style={{ color: "var(--rb-orange)", fontSize: 13 }}>★★★★★</span>
                <Text size={13.5} weight={500} color="var(--rb-on-teal-faint)">
                  Built with immigration lawyers practicing in Barcelona
                </Text>
              </div>
              <div className="rb-hero-ctas" style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 34 }}>
                <Button variant="primary" size="lg" style={{ padding: "17px 26px", fontSize: 17, boxShadow: "0 16px 34px -14px rgba(0,0,0,.55)" }} href="/intake">
                  Get my roadmap
                </Button>
                <Button variant="ghost" size="lg" style={{ background: "transparent", border: "none", color: "var(--rb-on-teal-accent)", padding: "6px", fontSize: 15 }} href="/sample-roadmap">
                  See a sample roadmap
                </Button>
              </div>
              <Text size={14} weight={500} color="var(--rb-on-teal-faint)" style={{ margin: "20px 0 0" }}>
                Free roadmap, no card required · about 2 minutes
              </Text>
              <Link href="/access" style={{ display: "block", color: "var(--rb-on-teal-soft)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, marginTop: 14 }}>
                Already started? Access your roadmap
              </Link>
              <Link href="/translation" style={{ display: "block", color: "var(--rb-on-teal-soft)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, marginTop: 8 }}>
                Just need a translation?
              </Link>
            </div>

            <div style={{ flex: "1 1 380px", maxWidth: 420, width: "100%" }}>
              <RouteIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="rb-snap-section rb-container" style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 48px" }}>
        <Text size={13} weight={600} color="var(--rb-orange)" style={{ letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 30px", textAlign: "center" }}>
          How it works
        </Text>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
          {FEATURES.map((f) => (
            <Card key={f.title} style={{ flex: "1 1 280px", maxWidth: 320, padding: "32px 28px", boxShadow: "var(--shadow-md)" }}>
              <span style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: f.iconBg, color: f.iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <f.icon size={20} strokeWidth={1.75} />
              </span>
              <Heading as="h3" size="sm" style={{ fontSize: 20, margin: "20px 0 8px" }}>
                {f.title}
              </Heading>
              <Text size={15} style={{ lineHeight: 1.6 }}>
                {f.body}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing - shown here, not just buried at the end of the paywall funnel.
          Pulls from lib/pricing.ts so this can never drift from the real price. */}
      <div id="pricing" className="rb-snap-section rb-container" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px 76px" }}>
        <Text size={13} weight={600} color="var(--rb-orange)" style={{ letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px", textAlign: "center" }}>
          Pricing
        </Text>
        <Text size={15} style={{ margin: "0 0 30px", textAlign: "center" }}>
          One-time payment, full price shown now - never a surprise at checkout.
        </Text>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
          <div style={{ flex: "1 1 300px", maxWidth: 340, background: "#fff", border: "1.5px solid var(--rb-border)", borderRadius: "var(--radius-xl)", padding: "32px" }}>
            <Heading as="h3" size="sm" style={{ fontSize: 20 }}>
              {PRICING_TIERS.essential.name}
            </Heading>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, color: "var(--rb-text)" }}>
                €{PRICING_TIERS.essential.priceEur}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--rb-text-muted)" }}>one-time</span>
            </div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              {PRICING_TIERS.essential.includes.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={checkIcon("rgba(27,58,62,.12)", "var(--rb-teal)")}><Check size={10} strokeWidth={3} /></span>
                  <Text size={14} style={{ lineHeight: 1.5, color: "var(--rb-text-dense)" }}>{f}</Text>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              flex: "1 1 300px",
              maxWidth: 340,
              background: "#fff",
              border: "1.5px solid var(--rb-orange)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              position: "relative",
            }}
          >
            <Chip tone="orange" style={{ position: "absolute", top: -12, left: 28, background: "var(--rb-orange)", color: "#fff", padding: "5px 12px", fontSize: 11 }}>
              Most popular
            </Chip>
            <Heading as="h3" size="sm" style={{ fontSize: 20 }}>
              {PRICING_TIERS.complete.name}
            </Heading>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, color: "var(--rb-text)" }}>
                €{PRICING_TIERS.complete.priceEur}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--rb-text-muted)" }}>valid 12 months</span>
            </div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              {PRICING_TIERS.complete.includes.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={checkIcon("rgba(212,86,46,.12)", "var(--rb-orange)")}><Check size={10} strokeWidth={3} /></span>
                  <Text size={14} style={{ lineHeight: 1.5, color: "var(--rb-text-dense)" }}>{f}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/paywall" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-teal)" }}>
            See full plan details
          </Link>
        </p>
      </div>

      {/* CTA banner - solid dark teal full-bleed, per the approved prototype. */}
      <div className="rb-snap-section" style={{ background: "var(--rb-teal)", padding: "64px 48px" }}>
        <Text
          size={30}
          weight={600}
          color="var(--rb-on-teal)"
          style={{ fontFamily: "var(--font-display)", maxWidth: 720, margin: "0 auto", textAlign: "center", lineHeight: 1.4, letterSpacing: "-.3px" }}
        >
          See your personalized roadmap in minutes. Talk to a lawyer only when you actually
          need one.
        </Text>
      </div>

      {/* Footer - every link goes to a page that actually exists. No
          fabricated social accounts, careers page, or investor relations -
          those aren't real for Rutabien yet. */}
      <div className="rb-snap-section" style={{ padding: "56px 48px 32px", borderTop: "1px solid var(--rb-border)" }}>
        <div className="rb-footer-grid" style={{ maxWidth: 1160, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px", maxWidth: 320 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--rb-teal)" }}>Rutabien</span>
            <Text size={13.5} muted style={{ lineHeight: 1.6, marginTop: 10 }}>
              Every step, mapped - visa and paperwork guidance for international students moving
              to Barcelona.
            </Text>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--rb-border)",
                    color: "var(--rb-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <Text size={12} weight={600} color="var(--rb-text)" style={{ letterSpacing: ".3px", textTransform: "uppercase", marginBottom: 14 }}>
              Get started
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/intake" style={footerLinkStyle}>Get my roadmap</Link>
              <Link href="/access" style={footerLinkStyle}>Access your roadmap</Link>
              <Link href="/sample-roadmap" style={footerLinkStyle}>See a sample roadmap</Link>
              <Link href="/translation" style={footerLinkStyle}>Just need a translation?</Link>
            </div>
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <Text size={12} weight={600} color="var(--rb-text)" style={{ letterSpacing: ".3px", textTransform: "uppercase", marginBottom: 14 }}>
              Product
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="#how-it-works" style={footerLinkStyle}>How it works</a>
              <a href="#pricing" style={footerLinkStyle}>Pricing</a>
              <Link href="/paywall" style={footerLinkStyle}>Plan details</Link>
            </div>
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <Text size={12} weight={600} color="var(--rb-text)" style={{ letterSpacing: ".3px", textTransform: "uppercase", marginBottom: 14 }}>
              Payment
            </Text>
            <Text size={13.5} muted style={{ lineHeight: 1.6 }}>
              Secure one-time checkout via Stripe (card) or PayPal. No subscriptions, no
              auto-renewal.
            </Text>
          </div>
        </div>

        <div
          className="rb-container"
          style={{
            maxWidth: 1160,
            margin: "40px auto 0",
            paddingTop: 20,
            borderTop: "1px solid var(--rb-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <Text size={12.5} muted>
            Rutabien · Every step, mapped.
          </Text>
          <Link href="/admin/login" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12.5, color: "var(--rb-text-faint-link)" }}>
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
