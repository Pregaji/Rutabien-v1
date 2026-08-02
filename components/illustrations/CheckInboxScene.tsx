type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// An envelope with a checkmark badge and a paper airplane in flight -
// "check your inbox." Design by Claude Design, 2026-08-02.
export function CheckInboxScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <rect x="255" y="245" width="150" height="105" rx="10" fill="#D9CFBB" />
        <path d="M255 245 l75 60 75 -60" fill="none" stroke="#B8ADA0" strokeWidth="3" />

        <g transform="translate(330,268)">
          <path d="M0 -16 a10 10 0 0 1 10 10 c0 7 -10 17 -10 17 s-10 -10 -10 -17 a10 10 0 0 1 10 -10z" fill="#D4562E" />
          <circle cx="0" cy="-6" r="4" fill="#F5F2EC" />
        </g>
      </g>

      <g transform="translate(400,240)">
        <circle r="24" fill="#1A1F24" />
        <path d="M-9 0 l6 7 14 -15" fill="none" stroke="#F5F2EC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g transform="translate(470,320) rotate(-18)">
        <path d="M0 0 L34 -8 L6 6 L2 18 Z" fill="#D4562E" />
        <path d="M6 6 L34 -8 L14 4 Z" fill="#B84420" />
      </g>
      <path d="M430 300 q20 10 30 20" stroke="#D4562E" strokeWidth="2.5" strokeDasharray="2 7" fill="none" opacity="0.55" />

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 210 l14 14 M239 210 l-14 14" />
      </g>
      <circle cx="220" cy="340" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="500" cy="230" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
