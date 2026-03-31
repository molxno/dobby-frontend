interface DobbyLogoProps {
  /** Height of the icon (width scales proportionally) */
  size?: number;
  /** Show "DOBBY" wordmark text below the icon */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Dobby brand logo — SVG recreation of the official logo.
 * Head profile silhouette + bar chart + upward arrow, with optional wordmark.
 */
export function DobbyLogo({ size = 48, showWordmark = false, className = '' }: DobbyLogoProps) {
  const iconH = 200;
  const textH = 60;
  const totalH = showWordmark ? iconH + textH : iconH;

  return (
    <svg
      width={size}
      height={showWordmark ? Math.round(size * (totalH / 200)) : size}
      viewBox={`0 0 200 ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Dobby logo"
    >
      {/* ── Head silhouette (left-facing profile, stroke only) ── */}
      <path
        d="
          M 112 14
          C 148 14 170 40 170 76
          C 170 106 155 126 132 139
          L 132 160
          L 80  160
          L 80  139
          C 58  126  44  106  44  90
          L 36  76
          C 32  68   34  58   42  52
          C 50  40   62  26   82  18
          C 92  14  102  12  112  14
          Z
        "
        stroke="#4f46e5"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Leaf / oval secondary shape (tilted, overlapping upper-right) ── */}
      <ellipse
        cx="126"
        cy="85"
        rx="58"
        ry="28"
        transform="rotate(-32 126 85)"
        stroke="#4f46e5"
        strokeWidth="4.5"
      />

      {/* ── Bar chart — 3 amber bars, increasing height left→right ── */}
      <rect x="88"  y="110" width="13" height="26" rx="3" fill="#F59E0B" />
      <rect x="106" y="94"  width="13" height="42" rx="3" fill="#F59E0B" />
      <rect x="124" y="76"  width="13" height="60" rx="3" fill="#F59E0B" />

      {/* ── Upward trending arrow (lower-left → upper-right) ── */}
      <line
        x1="70" y1="132"
        x2="163" y2="30"
        stroke="#4f46e5"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <path d="M 163 30 L 148 40 L 155 53 Z" fill="#4f46e5" />

      {/* ── Optional wordmark ── */}
      {showWordmark && (
        <text
          x="103"
          y={iconH + 46}
          textAnchor="middle"
          fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
          fontWeight="900"
          fontSize="40"
          fill="#4f46e5"
          letterSpacing="5"
        >
          DOBBY
        </text>
      )}
    </svg>
  );
}
