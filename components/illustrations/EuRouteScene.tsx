type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A passport with an EU stamp - for the EU/EEA registration path. Design
// by Claude Design, 2026-08-02 (v2 - light background).
export function EuRouteScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="270" y="205" width="150" height="110" rx="12" fill="#24484D" />
        <rect x="284" y="219" width="122" height="82" rx="7" fill="none" stroke="#F5F2EC" strokeWidth="2" opacity="0.5" />
        <g fill="#D4562E">
          <circle cx="345" cy="260" r="4" />
          <circle cx="360" cy="248" r="4" />
          <circle cx="378" cy="248" r="4" />
          <circle cx="392" cy="260" r="4" />
          <circle cx="378" cy="273" r="4" />
          <circle cx="360" cy="273" r="4" />
        </g>
      </g>

      <g transform="rotate(-16 460 300)">
        <circle cx="460" cy="300" r="48" fill="none" stroke="#B84420" strokeWidth="6" opacity="0.85" />
        <circle cx="460" cy="300" r="35" fill="none" stroke="#B84420" strokeWidth="3" opacity="0.55" />
        <line x1="432" y1="300" x2="488" y2="300" stroke="#B84420" strokeWidth="4" opacity="0.6" />
      </g>

      <g fill="#D4562E">
        <circle cx="250" cy="365" r="7" />
        <circle cx="330" cy="365" r="7" />
      </g>
      <line x1="250" y1="365" x2="330" y2="365" stroke="#D4562E" strokeWidth="3" strokeDasharray="3 9" />

      <g fill="#1A1F24" opacity="0.65">
        <path d="M170 335 V300 L177 288 L184 300 V335Z" />
        <path d="M190 335 V292 L198 278 L206 292 V335Z" />
        <rect x="163" y="325" width="50" height="10" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M485 200 l14 14 M499 200 l-14 14" />
      </g>
      <circle cx="220" cy="230" r="6" fill="#D4562E" opacity="0.7" />
    </svg>
  );
}
