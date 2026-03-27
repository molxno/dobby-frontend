import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  currency?: string;
  className?: string;
  required?: boolean;
  min?: number;
  error?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = '0',
  currency = 'COP',
  className = '',
  required,
  min = 0,
  error,
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);

  const displayValue = focused ? (value === 0 ? '' : String(value)) : (value === 0 ? '' : value.toLocaleString('es-CO'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw === '' ? 0 : parseInt(raw, 10));
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">{currency === 'COP' ? '$' : currency}</span>
        <input
          type={focused ? 'number' : 'text'}
          value={focused ? (value === 0 ? '' : value) : displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          min={min}
          className={cn(
            'w-full bg-surface-800 rounded-lg pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600',
            'ring-1 transition-all',
            error
              ? 'ring-red-500/50 focus:ring-2 focus:ring-red-500/60'
              : 'ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50',
          )}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
