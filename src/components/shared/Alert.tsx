import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type AlertType = 'danger' | 'warning' | 'info' | 'success';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  action?: string;
  onDismiss?: () => void;
}

const CONFIG: Record<AlertType, { bg: string; title: string; icon: LucideIcon }> = {
  danger: { bg: 'bg-red-950/40', title: 'text-red-400', icon: AlertCircle },
  warning: { bg: 'bg-amber-950/40', title: 'text-amber-400', icon: AlertTriangle },
  info: { bg: 'bg-brand-950/40', title: 'text-brand-400', icon: Info },
  success: { bg: 'bg-emerald-950/40', title: 'text-emerald-400', icon: CheckCircle2 },
};

export function Alert({ type, title, message, action, onDismiss }: AlertProps) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  return (
    <div className={cn(cfg.bg, 'rounded-lg p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={cn(cfg.title, 'mt-0.5 shrink-0')} size={16} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold', cfg.title)}>{title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>
            {action && <p className="text-xs text-slate-500 mt-1.5 italic">{action}</p>}
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-slate-600 hover:text-slate-400 shrink-0">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
