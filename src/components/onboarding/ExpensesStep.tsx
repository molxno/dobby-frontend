import { useState } from 'react';
import type { Expense, ExpenseCategory } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../utils/constants';
import { nanoid } from '../shared/nanoid';

const SUGGESTED_EXPENSES: Partial<Expense>[] = [
  { name: 'Arriendo/Hipoteca', category: 'housing', isFixed: true, isEssential: true },
  { name: 'Servicios (agua, luz, gas)', category: 'utilities', isFixed: true, isEssential: true },
  { name: 'Mercado/Alimentación', category: 'food', isFixed: false, isEssential: true },
  { name: 'Transporte', category: 'transport', isFixed: false, isEssential: true },
  { name: 'Salud/Médico', category: 'health', isFixed: false, isEssential: true },
  { name: 'Internet/Celular', category: 'subscriptions', isFixed: true, isEssential: true },
];

interface ExpensesStepProps {
  expenses: Expense[];
  setExpenses: (v: Expense[]) => void;
  currency: string;
  onBack: () => void;
  onNext: () => void;
}

export function ExpensesStep({ expenses, setExpenses, currency, onBack, onNext }: ExpensesStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({
    name: '',
    amount: 0,
    category: 'other',
    isFixed: true,
    isEssential: true,
    paymentMethod: 'debit',
  });

  const addExpense = () => {
    if (!form.name || !form.amount || form.amount <= 0) return;
    setExpenses([...expenses, { ...form, id: nanoid() } as Expense]);
    setForm({ name: '', amount: 0, category: 'other', isFixed: true, isEssential: true, paymentMethod: 'debit' });
    setShowForm(false);
  };

  const addSuggested = (suggested: Partial<Expense>) => {
    if (expenses.some(e => e.name === suggested.name)) return;
    setExpenses([...expenses, {
      ...suggested,
      id: nanoid(),
      amount: 0,
      paymentMethod: 'debit',
    } as Expense]);
  };

  const updateAmount = (id: string, amount: number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, amount } : e));
  };

  const removeExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));

  const categories = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">¿Cuáles son tus gastos fijos?</h2>
        <p className="text-sm text-gray-500">Agrega todos tus gastos mensuales recurrentes</p>
      </div>

      {/* Suggested */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Gastos comunes — click para agregar</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_EXPENSES.map(s => {
            const alreadyAdded = expenses.some(e => e.name === s.name);
            return (
              <button
                key={s.name}
                onClick={() => addSuggested(s)}
                disabled={alreadyAdded}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  alreadyAdded
                    ? 'bg-green-900/30 border-green-700/50 text-green-400 cursor-default'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400'
                }`}
              >
                {CATEGORY_ICONS[s.category as ExpenseCategory]} {s.name}
                {alreadyAdded && ' ✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
              <span className="text-base">{CATEGORY_ICONS[exp.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{exp.name}</p>
                <p className="text-xs text-gray-500">{exp.isEssential ? 'Esencial' : 'No esencial'} · {exp.isFixed ? 'Fijo' : 'Variable'}</p>
              </div>
              <div className="w-32 shrink-0">
                <CurrencyInput
                  value={exp.amount}
                  onChange={v => updateAmount(exp.id, v)}
                  currency={currency}
                  placeholder="Monto"
                />
              </div>
              <button onClick={() => removeExpense(exp.id)} className="text-red-400 hover:text-red-300 text-xs p-1">✕</button>
            </div>
          ))}
          <div className="bg-gray-900/50 rounded-xl px-4 py-2 flex justify-between">
            <span className="text-sm text-gray-400">Total mensual</span>
            <span className="text-sm font-bold text-gray-100">
              {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('es-CO')} {currency}
            </span>
          </div>
        </div>
      )}

      {/* Add custom expense */}
      {showForm ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Gasto personalizado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Gym, Netflix..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <CurrencyInput
              label="Monto mensual"
              value={form.amount ?? 0}
              onChange={v => setForm(f => ({ ...f, amount: v }))}
              currency={currency}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Método de pago</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as Expense['paymentMethod'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="debit">Débito</option>
                <option value="cash">Efectivo</option>
                <option value="credit_card">Tarjeta crédito</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFixed} onChange={e => setForm(f => ({ ...f, isFixed: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600" />
              <span className="text-sm text-gray-300">Fijo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEssential} onChange={e => setForm(f => ({ ...f, isEssential: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600" />
              <span className="text-sm text-gray-300">Esencial</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addExpense} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Agregar
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl py-3 text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          + Agregar gasto personalizado
        </button>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button onClick={onBack} className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl py-3 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={onNext}
          disabled={expenses.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium py-3 rounded-xl transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
