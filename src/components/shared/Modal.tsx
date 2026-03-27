import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full', sizeClass, 'bg-surface-900 rounded-xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto')}>
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-base font-semibold text-slate-100 font-heading">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-2 -mr-2 rounded-lg hover:bg-surface-800"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
