interface RingChartProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  centerText?: string;
}

export function RingChart({
  value,
  size = 120,
  strokeWidth = 10,
  color = '#6366f1',
  trackColor = '#1e293b',
  label,
  sublabel,
  centerText,
}: RingChartProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
          />
        </svg>
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-100 font-heading">{centerText}</span>
          </div>
        )}
      </div>
      {label && <p className="text-xs font-medium text-slate-300 text-center">{label}</p>}
      {sublabel && <p className="text-xs text-slate-500 text-center">{sublabel}</p>}
    </div>
  );
}
