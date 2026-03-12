import { useState } from 'react';
import type { Debt } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { DEBT_TYPE_LABELS } from '../../utils/constants';
import { nanoid } from '../shared/nanoid';

interface DebtsStepProps {
  debts: Debt[];
  setDebts: (v: Debt[]) => void;
  currency: string;
  onBack: () => void;
  onNext: () => void;
}

export function DebtsStep({ debts, setDebts, currency, onBack, onNext }: DebtsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [noDebts, setNoDebts] = useState(false);
  const [form, setForm] = useState<Partial<Debt>>({
    name: '',
    type: 'personal_loan',
    currentBalance: 0,
    monthlyPayment: 0,
    interestRate: 0,
    dueDay: 15,
  });

  const addDebt = () => {
    if (!form.name || !form.currentBalance || form.currentBalance <= 0) return;
    const debt: Debt = {
      id: nanoid(),
      name: form.name!,
      type: form.type!,
      currentBalance: form.currentBalance!,
      monthlyPayment: form.monthlyPayment!,
      interestRate: form.interestRate! / 100, // convert from % to decimal
      dueDay: form.dueDay!,
      ...(form.type === 'credit_card' && { creditLimit: form.creditLimit, minimumPayment: form.minimumPayment }),
      ...(form.remainingPayments && { remainingPayments: form.remainingPayments }),
    };
    setDebts([...debts, debt]);
    setForm({ name: '', type: 'personal_loan', currentBalance: 0, monthlyPayment: 0, interestRate: 0, dueDay: 15 });
    setShowForm(false);
  };

  const removeDebt = (id: string) => setDebts(debts.filter(d => d.id !== id));

  const totalDebt = debts.reduce((s, d) => s + d.currentBalance, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">¿Tienes deudas?</h2>
        <p className="text-sm text-gray-500">Préstamos, tarjetas de crédito, compras financiadas</p>
      </div>

      <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700">
        <input
          type="checkbox"
          checked={noDebts}
          onChange={e => { setNoDebts(e.target.checked); if (e.target.checked) setDebts([]); }}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600"
        />
        <span className="text-sm text-gray-300">No tengo deudas actualmente 🎉</span>
      </label>

      {!noDebts && (
        <>
          {debts.length > 0 && (
            <div className="space-y-2">
              {debts.map(debt => (
                <div key={debt.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
                  <div className="text-base">
                    {debt.type === 'credit_card' ? '💳' : debt.type === 'personal_loan' ? '🏦' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{debt.name}</p>
                    <p className="text-xs text-gray-500">
                      Saldo: {debt.currentBalance.toLocaleString('es-CO')} {currency} · Cuota: {debt.monthlyPayment.toLocaleString('es-CO')} · Tasa: {(debt.interestRate * 100).toFixed(1)}%/mes
                    </p>
                  </div>
                  <button onClick={() => removeDebt(debt.id)} className="text-red-400 hover:text-red-300 text-xs p-1">✕</button>
                </div>
              ))}
              <div className="bg-gray-900/50 rounded-xl px-4 py-2 flex justify-between">
                <span className="text-sm text-gray-400">Total deuda / cuota mensual</span>
                <span className="text-sm font-bold text-red-400">
                  {totalDebt.toLocaleString('es-CO')} / {totalMonthly.toLocaleString('es-CO')} {currency}
                </span>
              </div>
            </div>
          )}

          {showForm ? (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-200">Nueva deuda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: TC Bancolombia, Crédito Libre"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo de deuda</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as Debt['type'] }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(DEBT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CurrencyInput
                  label="Saldo actual"
                  value={form.currentBalance ?? 0}
                  onChange={v => setForm(f => ({ ...f, currentBalance: v }))}
                  currency={currency}
                  required
                />
                <CurrencyInput
                  label="Cuota mensual"
                  value={form.monthlyPayment ?? 0}
                  onChange={v => setForm(f => ({ ...f, monthlyPayment: v }))}
                  currency={currency}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Tasa de interés (%/mes)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.interestRate === 0 ? '' : form.interestRate}
                    onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="Ej: 2.2"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Tasa mensual. Ej: 2.2 = 2.2%/mes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Día de pago</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.dueDay}
                    onChange={e => setForm(f => ({ ...f, dueDay: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {form.type === 'credit_card' && (
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyInput
                    label="Cupo total TC"
                    value={form.creditLimit ?? 0}
                    onChange={v => setForm(f => ({ ...f, creditLimit: v }))}
                    currency={currency}
                  />
                  <CurrencyInput
                    label="Pago mínimo extracto"
                    value={form.minimumPayment ?? 0}
                    onChange={v => setForm(f => ({ ...f, minimumPayment: v }))}
                    currency={currency}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={addDebt} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  Agregar deuda
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
              + Agregar deuda
            </button>
          )}
        </>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button onClick={onBack} className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl py-3 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
