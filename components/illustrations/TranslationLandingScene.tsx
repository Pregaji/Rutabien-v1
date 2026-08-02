type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// Two documents swapping places (original -> translated) - the standalone
// translation landing page. Design by Claude Design, 2026-08-02.
export function TranslationLandingScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="255" y="225" width="110" height="140" rx="8" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="270" y1="248" x2="335" y2="248" stroke="#1A1F24" strokeWidth="4" />
        <line x1="270" y1="264" x2="320" y2="264" stroke="#1A1F24" strokeWidth="4" />
        <line x1="270" y1="280" x2="330" y2="280" stroke="#1A1F24" strokeWidth="4" />
        <line x1="270" y1="296" x2="310" y2="296" stroke="#1A1F24" strokeWidth="4" />
      </g>

      <g transform="translate(60,-10)">
        <rect x="255" y="225" width="110" height="140" rx="8" fill="#D4562E" opacity="0.92" />
        <line x1="270" y1="248" x2="335" y2="248" stroke="#F5F2EC" strokeWidth="4" />
        <line x1="270" y1="264" x2="320" y2="264" stroke="#F5F2EC" strokeWidth="4" />
        <line x1="270" y1="280" x2="330" y2="280" stroke="#F5F2EC" strokeWidth="4" />
        <line x1="270" y1="296" x2="310" y2="296" stroke="#F5F2EC" strokeWidth="4" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M368 265 h30 M390 258 l8 7 -8 7" />
        <path d="M398 305 h-30 M376 298 l-8 7 8 7" />
      </g>

      <circle cx="230" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="490" cy="230" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
