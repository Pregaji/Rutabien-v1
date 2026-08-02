type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A document + an open padlock + a checkmark - for the paywall header.
// Design by Claude Design, 2026-08-02 (v2 - light background).
export function UnlockScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="270" y="235" width="120" height="90" rx="8" fill="#D9CFBB" transform="rotate(-5 330 280)" />
        <rect x="280" y="222" width="120" height="90" rx="8" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="296" y1="244" x2="365" y2="244" stroke="#1A1F24" strokeWidth="4" />
        <line x1="296" y1="260" x2="352" y2="260" stroke="#1A1F24" strokeWidth="4" />
        <line x1="296" y1="276" x2="360" y2="276" stroke="#1A1F24" strokeWidth="4" />
      </g>

      <g transform="translate(415,255)">
        <rect x="0" y="30" width="66" height="52" rx="9" fill="#D4562E" />
        <path d="M10 30 v-18 a23 23 0 0 1 46 -7" fill="none" stroke="#1A1F24" strokeWidth="8" strokeLinecap="round" />
        <circle cx="33" cy="54" r="7" fill="#1A1F24" />
        <rect x="30" y="56" width="6" height="14" fill="#1A1F24" />
      </g>

      <g stroke="#D4562E" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M245 340 l14 15 26 -30" />
      </g>
      <circle cx="270" cy="335" r="40" fill="none" stroke="#B84420" strokeWidth="2.5" opacity="0.45" />

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M480 210 l14 14 M494 210 l-14 14" />
      </g>
      <circle cx="500" cy="330" r="6" fill="#D4562E" />
      <path d="M195 220 l14 4 -4 14" fill="none" stroke="#1A1F24" strokeWidth="4" opacity="0.5" />
      <circle cx="215" cy="330" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
