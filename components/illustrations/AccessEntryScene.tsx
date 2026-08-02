type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A key and an envelope - "access your roadmap" via a magic link. Design
// by Claude Design, 2026-08-02.
export function AccessEntryScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g transform="translate(300,270)">
        <circle r="26" fill="none" stroke="#D4562E" strokeWidth="8" />
        <rect x="20" y="-6" width="46" height="12" fill="#D4562E" />
        <rect x="52" y="6" width="8" height="12" fill="#D4562E" />
        <rect x="66" y="6" width="8" height="16" fill="#D4562E" />
      </g>

      <g transform="translate(440,255)">
        <rect x="-32" y="-22" width="64" height="44" rx="6" fill="#D9CFBB" stroke="#B8ADA0" strokeWidth="2" />
        <path d="M-32 -22 l32 26 32 -26" fill="none" stroke="#B8ADA0" strokeWidth="2" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 220 l14 14 M239 220 l-14 14" />
      </g>
      <circle cx="220" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="480" cy="340" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
