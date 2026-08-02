import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rutabien - Every step, mapped.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#1B3A3E",
          color: "#F5F2EC",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#F0A98C",
            marginBottom: 28,
          }}
        >
          You&apos;ve got this
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>Every step,</div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>mapped.</div>
        <div
          style={{
            fontSize: 30,
            marginTop: 40,
            color: "#DCE7E5",
            maxWidth: 820,
            fontFamily: "sans-serif",
            fontWeight: 400,
          }}
        >
          A clear, personal roadmap for moving to Barcelona.
        </div>
      </div>
    ),
    { ...size }
  );
}
