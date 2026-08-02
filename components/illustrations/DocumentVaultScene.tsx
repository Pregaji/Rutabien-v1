type SceneProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

// A folder holding two documents, with a padlock - "your documents,
// organized and secured." Design by Claude Design, 2026-08-02.
export function DocumentVaultScene({ width = "100%", height = "100%", className }: SceneProps) {
  return (
    <svg viewBox="0 0 700 500" width={width} height={height} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="700" height="500" fill="#F5F2EC" />
      <ellipse cx="350" cy="270" rx="150" ry="120" fill="#1A1F24" opacity="0.05" />
      <ellipse cx="350" cy="270" rx="95" ry="80" fill="#1A1F24" opacity="0.06" />

      <g>
        <path d="M240 250 h70 l14 18 h136 v92 h-220z" fill="#D9CFBB" />
        <path d="M240 250 v-8 a8 8 0 0 1 8 -8 h190 a8 8 0 0 1 8 8 v8" fill="none" stroke="#B8ADA0" strokeWidth="3" />

        <rect x="275" y="205" width="70" height="55" rx="5" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="286" y1="222" x2="333" y2="222" stroke="#1A1F24" strokeWidth="4" />
        <line x1="286" y1="236" x2="322" y2="236" stroke="#1A1F24" strokeWidth="4" />
        <rect x="355" y="212" width="70" height="55" rx="5" fill="#F5F2EC" stroke="#1A1F24" strokeWidth="3" />
        <line x1="366" y1="230" x2="410" y2="230" stroke="#1A1F24" strokeWidth="4" />
        <line x1="366" y1="244" x2="400" y2="244" stroke="#1A1F24" strokeWidth="4" />
      </g>

      <g transform="translate(455,240)">
        <rect x="-16" y="4" width="32" height="26" rx="5" fill="#D4562E" />
        <path d="M-10 4 v-10 a10 10 0 0 1 20 0 v10" fill="none" stroke="#1A1F24" strokeWidth="5" strokeLinecap="round" />
        <circle cy="16" r="3.5" fill="#1A1F24" />
      </g>

      <g stroke="#1A1F24" strokeWidth="5" strokeLinecap="round">
        <path d="M225 205 l14 14 M239 205 l-14 14" />
      </g>
      <circle cx="220" cy="345" r="6" fill="#D4562E" opacity="0.7" />
      <circle cx="480" cy="335" r="26" fill="none" stroke="#D4562E" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" />
    </svg>
  );
}
