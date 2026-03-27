import { useState } from 'react';
import type { Income } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { nanoid } from '../shared/nanoid';
import { Plus, ArrowRight } from 'lucide-react';

interface IncomeStepProps {
  currency: string;
  setCurrency: (v: string) => void;
  incomes: Income[];
  setIncomes: (v: Income[]) => void;
  onNext: () => void;
}

const CURRENCIES = [
  { code: 'COP', label: 'Peso colombiano (COP)' },
  { code: 'MXN', label: 'Peso mexicano (MXN)' },
  { code: 'USD', label: 'Dólar americano (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'ARS', label: 'Peso argentino (ARS)' },
  { code: 'CLP', label: 'Peso chileno (CLP)' },
  { code: 'PEN', label: 'Sol peruano (PEN)' },
];

export function IncomeStep({ currency, setCurrency, incomes, setIncomes, onNext }: IncomeStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Income>>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    payDays: [1],
    isNet: true,
  });
  const [error, setError] = useState('');

  const addIncome = () => {
    if (!form.name || !form.amount || form.amount <= 0) {
      setError('Completa nombre y monto');
      return;
    }
    setIncomes([...incomes, { ...form, id: nanoid() } as Income]);
    setForm({ name: '', amount: 0, frequency: 'monthly', payDays: [1], isNet: true });
    setShowForm(false);
    setError('');
  };

  const removeIncome = (id: string) => setIncomes(incomes.filter(i => i.id !== id));

  const canNext = incomes.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100 mb-1">¿Cuánto ganas?</h2>
        <p className="text-sm text-slate-500">Configura tu moneda y tus fuentes de ingreso</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Moneda</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Incomes list */}
      {incomes.length > 0 && (
        <div className="space-y-2">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-surface-900 border border-surface-800 rounded-2xl p-3">
              <div>
                <p className="text-sm font-medium text-slate-200">{inc.name}</p>
                <p className="text-xs text-slate-500">
                  {inc.amount.toLocaleString('es-CO')} {currency}/mes · {inc.frequency === 'biweekly' ? 'Quincenal' : inc.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                </p>
              </div>
              <button onClick={() => removeIncome(inc.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded">Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {/* Add income form */}
      {showForm ? (
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold font-heading text-slate-200">Nueva fuente de ingreso</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Salario, Freelance"
                className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              />
            </div>
            <CurrencyInput
              label="Monto mensual"
              value={form.amount ?? 0}
              onChange={v => setForm(f => ({ ...f, amount: v }))}
              currency={currency}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Frecuencia de pago</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Income['frequency'] }))}
                className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              >
                <option value="monthly">Mensual</option>
                <option value="biweekly">Quincenal (días 1 y 15)</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Días de pago</label>
              <input
                type="text"
                value={form.payDays?.join(', ')}
                onChange={e => setForm(f => ({ ...f, payDays: e.target.value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n)) }))}
                placeholder="Ej: 1, 15"
                className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNet}
              onChange={e => setForm(f => ({ ...f, isNet: e.target.checked }))}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-600 accent-brand-600"
            />
            <span className="text-sm text-slate-300">Este monto ya tiene descuentos aplicados (neto)</span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={addIncome}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-brand-600/20"
            >
              Agregar ingreso
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-xl py-3 text-sm text-slate-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar fuente de ingreso
        </button>
      )}

      <div className="pt-6 border-t border-surface-800/40">
        <button
          onClick={onNext}
          disabled={!canNext}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-surface-800 disabled:text-slate-600 disabled:opacity-50 disabled:shadow-none text-white text-sm font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
        {!canNext && <p className="text-xs text-slate-600 text-center mt-2">Agrega al menos un ingreso para continuar</p>}
      </div>
    </div>
  );
}
