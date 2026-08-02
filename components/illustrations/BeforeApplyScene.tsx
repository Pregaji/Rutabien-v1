type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// An envelope with a pin/pen and a waiting clock - the pre-acceptance
// "we'll be in touch" screen. Design by Claude Design, 2026-08-02.
export function BeforeApplyScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="265" y="240" width="150" height="100" rx="10" fill="#D9CFBB" stroke="#B8ADA0" strokeWidth="2" />
        <path d="M265 240 l75 58 75 -58" fill="none" stroke="#B8ADA0" strokeWidth="2" />
      </g>

      <g transform="translate(340,268)">
        <rect x="-4" y="-16" width="8" height="32" rx="3" fill="#D4562E" transform="rotate(35)" />
        <path d="M11 12 l6 8 -10 -2z" fill="#B84420" transform="rotate(35)" />
      </g>

      <g transform="translate(430,300)">
        <circle r="28" fill="none" stroke="#1A1F24" strokeWidth="6" />
        <line x1="0" y1="0" x2="0" y2="-16" stroke="#1A1F24" strokeWidth="5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="12" y2="8" stroke="#1A1F24" strokeWidth="5" strokeLinecap="round" />
        <circle r="4" fill="#1A1F24" />
      </g>

      <g fill="#D4562E">
        <circle cx="470" cy="255" r="5" opacity="0.7" />
        <circle cx="490" cy="240" r="4" opacity="0.5" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 220 l14 14 M239 220 l-14 14" />
      </g>
      <circle cx="220" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="240" cy="330" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
