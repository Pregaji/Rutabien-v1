import Link from "next/link";
import HomeLink from "../../HomeLink";

export default function CheckoutCancelledPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "28px", color: "var(--rb-text)", margin: 0 }}>
          Checkout cancelled
        </h2>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
          No charge was made. You can pick up where you left off any time.
        </p>
        <Link
          href="/paywall"
          style={{ display: "block", marginTop: 22, background: "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)", color: "#fff", borderRadius: 15, padding: 16, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px" }}
        >
          Back to plans
        </Link>
      </div>
    </div>
  );
}
