import Link from "next/link";
import HomeLink from "../../HomeLink";

export default function CheckoutSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "28px", color: "var(--rb-text)", margin: 0 }}>
          Payment confirmed
        </h2>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
          Check your email for a fresh access link to your unlocked roadmap.
        </p>
        <Link
          href="/access"
          style={{ display: "block", marginTop: 22, background: "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)", color: "#fff", borderRadius: 15, padding: 16, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px" }}
        >
          Access my roadmap
        </Link>
      </div>
    </div>
  );
}
