type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A passport with a route drawn across it and a checkmark badge - "your
// roadmap is ready." Design by Claude Design, 2026-08-02.
export function RoadmapReadyScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="255" y="230" width="150" height="110" rx="10" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <path d="M255 260 q75 -25 150 0" fill="none" stroke="#D9CFBB" strokeWidth="3" />
        <path d="M255 300 q75 25 150 0" fill="none" stroke="#D9CFBB" strokeWidth="3" />

        <g fill="#D4562E">
          <circle cx="280" cy="255" r="6" />
          <circle cx="315" cy="270" r="6" />
          <circle cx="350" cy="262" r="6" />
          <circle cx="385" cy="278" r="6" />
        </g>
        <path d="M280 255 Q315 240 350 262 Q368 274 385 278" stroke="#D4562E" strokeWidth="2.5" strokeDasharray="2 8" fill="none" opacity="0.6" />
      </g>

      <g transform="translate(385,278)">
        <path d="M0 -34 a20 20 0 0 1 20 20 c0 14 -20 34 -20 34 s-20 -20 -20 -34 a20 20 0 0 1 20 -20z" fill="#D4562E" />
        <circle cx="0" cy="-14" r="8" fill="#F5F2EC" />
      </g>

      <g transform="translate(255,230)">
        <circle r="26" fill="#1A1F24" />
        <path d="M-10 0 l7 8 15 -17" fill="none" stroke="#F5F2EC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M470 210 l14 14 M484 210 l-14 14" />
      </g>
      <circle cx="490" cy="330" r="6" fill="#D4562E" opacity="0.7" />
      <path d="M195 220 l14 4 -4 14" fill="none" stroke="#1A1F24" strokeWidth="4" opacity="0.5" />
      <circle cx="215" cy="340" r="28" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
