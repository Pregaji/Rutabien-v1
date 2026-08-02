type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A suitcase - the general "you're on your way" scene. Used for empty
// states and the Bienvenido welcome banner. Design by Claude Design,
// 2026-08-02 (v2 - light background, no dark sky band).
export function TravelScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="270" y="240" width="160" height="120" rx="16" fill="#D4562E" />
        <rect x="270" y="240" width="160" height="30" rx="14" fill="#B84420" />
        <rect x="322" y="216" width="56" height="32" rx="10" fill="none" stroke="#B84420" strokeWidth="10" />
        <rect x="270" y="296" width="160" height="10" fill="#B84420" opacity="0.6" />
        <rect x="330" y="270" width="40" height="10" rx="4" fill="#F5F2EC" opacity="0.85" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 205 l16 16 M241 205 l-16 16" />
        <path d="M485 340 l16 16 M501 340 l-16 16" />
      </g>
      <circle cx="215" cy="330" r="6" fill="#D4562E" />
      <circle cx="490" cy="220" r="5" fill="#1A1F24" opacity="0.5" />
      <path d="M170 250 l14 4 -4 14" fill="none" stroke="#1A1F24" strokeWidth="4" opacity="0.5" />

      <circle cx="520" cy="300" r="34" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.55" />

      <g fill="#D4562E" opacity="0.7">
        <circle cx="255" cy="410" r="5" />
        <circle cx="290" cy="418" r="5" />
        <circle cx="325" cy="412" r="5" />
      </g>
    </svg>
  );
}
