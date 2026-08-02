type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A document with an hourglass and a warning badge - "this document may no
// longer be valid." Design by Claude Design, 2026-08-02.
export function DocumentExpiringScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="290" y="220" width="120" height="150" rx="8" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="306" y1="244" x2="365" y2="244" stroke="#1A1F24" strokeWidth="4" />
        <line x1="306" y1="260" x2="350" y2="260" stroke="#1A1F24" strokeWidth="4" />
        <line x1="306" y1="276" x2="360" y2="276" stroke="#1A1F24" strokeWidth="4" />
      </g>

      <g transform="translate(420,300)">
        <path d="M-16 -22 h32 v6 l-14 16 14 16 v6 h-32 v-6 l14 -16 -14 -16z" fill="none" stroke="#1A1F24" strokeWidth="5" strokeLinejoin="round" />
        <path d="M-11 -16 h22 l-11 13z" fill="#D4562E" />
        <path d="M-6 18 h12 v-6 l-6 -6 -6 6z" fill="#D4562E" />
      </g>

      <g transform="translate(300,220)">
        <circle r="20" fill="#D4562E" />
        <line x1="0" y1="-8" x2="0" y2="2" stroke="#F5F2EC" strokeWidth="5" strokeLinecap="round" />
        <circle cx="0" cy="9" r="2.4" fill="#F5F2EC" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 235 l14 14 M239 235 l-14 14" />
      </g>
      <circle cx="220" cy="350" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="480" cy="360" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
