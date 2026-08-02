type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// Scales of justice with a confirmation badge - "talk to a lawyer." Design
// by Claude Design, 2026-08-02.
export function LegalPartnerScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g transform="translate(350,260)">
        <line x1="0" y1="-55" x2="0" y2="45" stroke="#1A1F24" strokeWidth="7" strokeLinecap="round" />
        <line x1="-70" y1="-35" x2="70" y2="-35" stroke="#1A1F24" strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="-55" r="7" fill="#D4562E" />

        <path d="M-70 -35 q0 26 26 26 q26 0 26 -26z" fill="none" stroke="#1A1F24" strokeWidth="5" />
        <path d="M70 -35 q0 26 -26 26 q-26 0 -26 -26z" fill="none" stroke="#1A1F24" strokeWidth="5" />

        <path d="M-22 45 h44 l-8 22 h-28z" fill="#1A1F24" />
      </g>

      <g transform="translate(430,225)">
        <circle r="24" fill="#D4562E" />
        <path d="M-9 -2 l6 7 14 -15" fill="none" stroke="#F5F2EC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 220 l14 14 M239 220 l-14 14" />
      </g>
      <circle cx="220" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="480" cy="340" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
