type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// Two pricing cards side by side with a euro coin - the paywall header.
// Design by Claude Design, 2026-08-02.
export function PaywallTiersScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="240" y="215" width="90" height="120" rx="10" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="255" y1="240" x2="315" y2="240" stroke="#1A1F24" strokeWidth="4" />
        <line x1="255" y1="256" x2="300" y2="256" stroke="#1A1F24" strokeWidth="4" opacity="0.5" />
        <line x1="255" y1="270" x2="305" y2="270" stroke="#1A1F24" strokeWidth="4" opacity="0.5" />
        <rect x="380" y="205" width="90" height="130" rx="10" fill="#D4562E" />
        <line x1="395" y1="232" x2="455" y2="232" stroke="#F5F2EC" strokeWidth="4" />
        <line x1="395" y1="248" x2="440" y2="248" stroke="#F5F2EC" strokeWidth="4" opacity="0.7" />
        <line x1="395" y1="262" x2="445" y2="262" stroke="#F5F2EC" strokeWidth="4" opacity="0.7" />
        <line x1="395" y1="276" x2="435" y2="276" stroke="#F5F2EC" strokeWidth="4" opacity="0.7" />
      </g>

      <g transform="translate(355,355)">
        <circle r="24" fill="#1A1F24" />
        <text x="0" y="7" textAnchor="middle" fontFamily="Georgia,serif" fontSize="26" fill="#F5F2EC">
          €
        </text>
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 205 l14 14 M239 205 l-14 14" />
      </g>
      <circle cx="220" cy="360" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="500" cy="240" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
