import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--rb-teal)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px",
          color: "#D9E6E4",
          letterSpacing: ".5px",
          marginBottom: 18,
        }}
      >
        Rutabien · Every step, mapped.
      </span>
      <h1
        style={{
          fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "44px", lineHeight: "1.2",
          color: "#F5F2EC",
          letterSpacing: "-.5px",
          margin: 0,
          maxWidth: 640,
        }}
      >
        Moving to Barcelona to study? We&apos;ll map every step.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "18px", lineHeight: "1.6",
          color: "#D9E6E4",
          margin: "22px 0 0",
          maxWidth: 460,
        }}
      >
        Rutabien turns Spain&apos;s visa and paperwork maze into a clear, personal
        roadmap — built for international students moving to Barcelona.
      </p>
      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <Link
          href="/intake"
          style={{
            background: "var(--rb-orange)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "17px 26px",
            fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "17px",
            boxShadow: "0 16px 34px -14px rgba(0,0,0,.55)",
          }}
        >
          Get my roadmap →
        </Link>
      </div>
      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "14px", color: "#9FC0BC", margin: "20px 0 0" }}>
        Free roadmap, no card required · about 2 minutes
      </p>
      <Link
        href="/access"
        style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px", color: "#D9E6E4", marginTop: 14 }}
      >
        Already started? Access your roadmap →
      </Link>
    </div>
  );
}
