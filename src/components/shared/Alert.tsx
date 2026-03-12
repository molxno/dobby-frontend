import React from 'react';

type AlertType = 'danger' | 'warning' | 'info' | 'success';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  action?: string;
  onDismiss?: () => void;
}

const CONFIG: Record<AlertType, { bg: string; border: string; title: string; icon: string }> = {
  danger: { bg: 'bg-red-950/50', border: 'border-red-500/40', title: 'text-red-400', icon: '🚨' },
  warning: { bg: 'bg-yellow-950/50', border: 'border-yellow-500/40', title: 'text-yellow-400', icon: '⚠️' },
  info: { bg: 'bg-blue-950/50', border: 'border-blue-500/40', title: 'text-blue-400', icon: 'ℹ️' },
  success: { bg: 'bg-green-950/50', border: 'border-green-500/40', title: 'text-green-400', icon: '✅' },
};

export function Alert({ type, title, message, action, onDismiss }: AlertProps) {
  const cfg = CONFIG[type];
  return (
    <div className={`${cfg.bg} ${cfg.border} border rounded-lg p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-base mt-0.5">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${cfg.title}`}>{title}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{message}</p>
            {action && <p className="text-xs text-gray-500 mt-1 italic">→ {action}</p>}
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-gray-600 hover:text-gray-400 text-xs mt-0.5 shrink-0">✕</button>
        )}
      </div>
    </div>
  );
}
