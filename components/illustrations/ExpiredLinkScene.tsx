type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A torn ticket + a clock past its time - for the "this link has expired"
// screen. Design by Claude Design, 2026-08-02 (v2 - light background).
export function ExpiredLinkScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g transform="rotate(-4 350 270)">
        <rect x="255" y="225" width="190" height="95" rx="12" fill="#D9CFBB" />
        <line x1="350" y1="225" x2="350" y2="320" stroke="#B8ADA0" strokeWidth="2" strokeDasharray="4 6" />
        <line x1="275" y1="250" x2="330" y2="250" stroke="#B8ADA0" strokeWidth="6" />
        <line x1="275" y1="268" x2="320" y2="268" stroke="#B8ADA0" strokeWidth="6" />
        <line x1="275" y1="286" x2="325" y2="286" stroke="#B8ADA0" strokeWidth="6" />
        <path d="M350 225 l-14 22 14 20 -14 20 14 20 -14 13" fill="none" stroke="#B84420" strokeWidth="3" />
      </g>

      <g transform="translate(400,300)">
        <circle r="30" fill="none" stroke="#1A1F24" strokeWidth="7" />
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#1A1F24" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="0" x2="16" y2="10" stroke="#D4562E" strokeWidth="6" strokeLinecap="round" />
        <circle r="4" fill="#1A1F24" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M240 195 l14 14 M254 195 l-14 14" />
      </g>
      <circle cx="230" cy="345" r="6" fill="#D4562E" />

      <g fill="#D4562E">
        <circle cx="470" cy="230" r="6" opacity="0.85" />
        <circle cx="500" cy="222" r="5" opacity="0.55" />
        <circle cx="528" cy="218" r="4" opacity="0.28" />
        <circle cx="553" cy="220" r="3" opacity="0.1" />
      </g>
      <circle cx="180" cy="290" r="30" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
