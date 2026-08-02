type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A short route ending at a checkmark, with an EU-stars badge alongside -
// the EU/EEA route's completion state. Design by Claude Design, 2026-08-02.
export function EuEndpointScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g fill="#D4562E">
        <circle cx="270" cy="290" r="7" />
        <circle cx="360" cy="290" r="7" />
      </g>
      <line x1="270" y1="290" x2="360" y2="290" stroke="#D4562E" strokeWidth="3" strokeDasharray="3 9" />

      <g transform="translate(360,290)">
        <path d="M0 -32 a19 19 0 0 1 19 19 c0 13 -19 32 -19 32 s-19 -19 -19 -32 a19 19 0 0 1 19 -19z" fill="#D4562E" />
        <circle cx="0" cy="-13" r="8" fill="#F5F2EC" />
      </g>

      <g transform="translate(270,290)">
        <circle r="24" fill="#1A1F24" />
        <path d="M-9 0 l6 7 14 -15" fill="none" stroke="#F5F2EC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g fill="#24484D" transform="translate(430,235)">
        <circle r="26" fill="#24484D" />
        <g fill="#D4562E">
          <circle cx="0" cy="-13" r="3.2" />
          <circle cx="11" cy="-7" r="3.2" />
          <circle cx="11" cy="7" r="3.2" />
          <circle cx="0" cy="13" r="3.2" />
          <circle cx="-11" cy="7" r="3.2" />
          <circle cx="-11" cy="-7" r="3.2" />
        </g>
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M215 235 l14 14 M229 235 l-14 14" />
      </g>
      <circle cx="230" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="470" cy="335" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
