interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animate?: boolean;
}

export function ProgressBar({
  value,
  color = '#3b82f6',
  height = 'h-2',
  showLabel = false,
  label,
  className = '',
  animate = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showLabel && <span className="text-xs text-gray-400">{clamped.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full ${animate ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
