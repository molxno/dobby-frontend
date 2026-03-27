import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = '', onClick, title, subtitle, action, noPadding }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-900 rounded-xl',
        !noPadding && 'p-6',
        onClick && 'cursor-pointer hover:bg-surface-850 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {(title || action) && (
        <div className={cn('flex items-center justify-between', noPadding ? 'px-6 pt-6 pb-4' : 'mb-5')}>
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200 font-heading">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
