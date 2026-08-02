type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A signpost with a fading route trail - "you've wandered off the path."
// Design by Claude Design, 2026-08-02.
export function NotFoundScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g fill="#D4562E">
        <circle cx="230" cy="300" r="7" opacity="0.9" />
        <circle cx="275" cy="292" r="6" opacity="0.65" />
        <circle cx="318" cy="298" r="5" opacity="0.4" />
        <circle cx="358" cy="290" r="4" opacity="0.22" />
        <circle cx="395" cy="298" r="3" opacity="0.1" />
      </g>
      <path d="M230 300 Q315 265 395 298" stroke="#D4562E" strokeWidth="2.5" strokeDasharray="2 8" fill="none" opacity="0.4" />

      <g transform="translate(310,230)">
        <line x1="0" y1="-30" x2="0" y2="60" stroke="#1A1F24" strokeWidth="7" strokeLinecap="round" />
        <path d="M0 -30 h55 l-10 14 10 14 h-55z" fill="#D4562E" />
        <path d="M0 -14 h-46 l10 12 -10 12 h46z" fill="#24484D" />
      </g>

      <g fill="#1A1F24" opacity="0.15">
        <circle cx="440" cy="220" r="34" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 220 l14 14 M239 220 l-14 14" />
      </g>
      <circle cx="470" cy="335" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="220" cy="345" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
