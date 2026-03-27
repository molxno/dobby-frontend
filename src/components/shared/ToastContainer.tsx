import { useEffect, useState, useCallback, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
}

type Listener = (toasts: Toast[]) => void;

// Simple event-based toast store (no context needed)
let toasts: Toast[] = [];
let listeners: Listener[] = [];
let nextId = 0;

function emit() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = String(++nextId);
  toasts = [...toasts, { ...toast, id }];
  emit();
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function useToasts() {
  const [state, setState] = useState<Toast[]>(() => [...toasts]);
  useEffect(() => {
    setState([...toasts]);
    listeners.push(setState);
    return () => {
      listeners = listeners.filter(l => l !== setState);
    };
  }, []);
  return state;
}

const TYPE_CONFIG = {
  error: { bg: 'bg-red-950/90', border: 'border-red-500/40', title: 'text-red-400', Icon: AlertCircle },
  warning: { bg: 'bg-amber-950/90', border: 'border-amber-500/40', title: 'text-amber-400', Icon: AlertTriangle },
  success: { bg: 'bg-emerald-950/90', border: 'border-emerald-500/40', title: 'text-emerald-400', Icon: CheckCircle2 },
  info: { bg: 'bg-brand-950/90', border: 'border-brand-500/40', title: 'text-brand-400', Icon: Info },
};

export function ToastContainer() {
  const items = useToasts();

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  useEffect(() => {
    for (const toast of items) {
      if (!dismissTimers.current.has(toast.id)) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
          dismissTimers.current.delete(toast.id);
        }, 8000);
        dismissTimers.current.set(toast.id, timer);
      }
    }
    const currentIds = new Set(items.map(t => t.id));
    for (const [id, timer] of dismissTimers.current) {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        dismissTimers.current.delete(id);
      }
    }

    return () => {
      for (const timer of dismissTimers.current.values()) {
        clearTimeout(timer);
      }
      dismissTimers.current.clear();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {items.map(toast => {
        const cfg = TYPE_CONFIG[toast.type];
        const { Icon } = cfg;
        return (
          <div
            key={toast.id}
            className={`${cfg.bg} ${cfg.border} border rounded-xl p-3 shadow-lg backdrop-blur-sm pointer-events-auto animate-slide-in`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`${cfg.title} mt-0.5 shrink-0`} size={16} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cfg.title}`}>{toast.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
                className="text-slate-600 hover:text-slate-400 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
