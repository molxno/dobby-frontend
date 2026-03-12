import React from 'react';

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
      className={`bg-gray-900 border border-gray-800 rounded-xl ${noPadding ? '' : 'p-5'} ${onClick ? 'cursor-pointer hover:border-gray-700 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-5 pt-5 pb-3' : 'mb-4'}`}>
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-200">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
