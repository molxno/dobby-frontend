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
        'bg-surface-900 border border-surface-800 rounded-2xl',
        !noPadding && 'p-5',
        onClick && 'cursor-pointer hover:border-surface-700 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {(title || action) && (
        <div className={cn('flex items-center justify-between', noPadding ? 'px-5 pt-5 pb-3' : 'mb-4')}>
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200 font-heading">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
