type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A single empty clipboard/list on a bare desk - for the admin "no
// students yet" table state. Design by Claude Design, 2026-08-02 (v2 -
// light background).
export function AdminEmptyScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="130" ry="105" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="85" ry="70" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="255" y="330" width="190" height="12" rx="4" fill="#1A1F24" />
        <rect x="268" y="342" width="12" height="32" fill="#1A1F24" />
        <rect x="420" y="342" width="12" height="32" fill="#1A1F24" />
      </g>

      <g>
        <rect x="300" y="228" width="100" height="105" rx="8" fill="#D9CFBB" />
        <rect x="326" y="220" width="48" height="14" rx="5" fill="#B8ADA0" />
        <line x1="316" y1="256" x2="384" y2="256" stroke="#B8ADA0" strokeWidth="4" />
        <line x1="316" y1="272" x2="374" y2="272" stroke="#B8ADA0" strokeWidth="4" />
        <line x1="316" y1="288" x2="378" y2="288" stroke="#B8ADA0" strokeWidth="4" />
      </g>

      <circle cx="235" cy="245" r="5" fill="#D4562E" opacity="0.5" />
      <g stroke="#1A1F24" strokeWidth="4" strokeLinecap="round" opacity="0.6">
        <path d="M455 230 l11 11 M466 230 l-11 11" />
      </g>
    </svg>
  );
}
