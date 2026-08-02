type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A suitcase set back down + a receipt with a checkmark, nothing broken -
// for "checkout cancelled, no charge was made." Design by Claude Design,
// 2026-08-02 (v2 - light background).
export function CheckoutCancelledScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <ellipse cx="310" cy="345" rx="55" ry="7" fill="#1A1F24" opacity="0.1" />
        <rect x="265" y="290" width="90" height="62" rx="10" fill="#B84420" />
        <rect x="265" y="290" width="90" height="15" rx="8" fill="#D4562E" />
        <rect x="295" y="274" width="30" height="18" rx="6" fill="none" stroke="#B84420" strokeWidth="5" />
      </g>

      <g>
        <rect x="380" y="255" width="140" height="70" rx="10" fill="#D9CFBB" />
        <line x1="435" y1="266" x2="435" y2="314" stroke="#B8ADA0" strokeWidth="2" strokeDasharray="4 5" />
        <line x1="398" y1="278" x2="424" y2="278" stroke="#B8ADA0" strokeWidth="4" />
        <line x1="398" y1="292" x2="424" y2="292" stroke="#B8ADA0" strokeWidth="4" />
        <circle cx="475" cy="290" r="17" fill="none" stroke="#1A1F24" strokeWidth="4" />
        <path d="M468 290 l6 6 11 -12" fill="none" stroke="#1A1F24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <path d="M340 235 q30 -22 58 -6" stroke="#D4562E" strokeWidth="3" fill="none" strokeDasharray="2 8" opacity="0.55" />

      <circle cx="220" cy="250" r="6" fill="#D4562E" opacity="0.6" />
      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M500 220 l14 14 M514 220 l-14 14" />
      </g>
      <circle cx="490" cy="345" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
