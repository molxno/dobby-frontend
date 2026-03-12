import { useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { DEBT_TYPE_LABELS } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import type { Debt } from '../store/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function Debts() {
  const { financialState, profile, debts, addDebt, removeDebt, updateDebt, debtStrategy, setDebtStrategy } = useFinancialStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedDebt, setExpandedDebt] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Debt>>({
    name: '', type: 'personal_loan', currentBalance: 0, monthlyPayment: 0, interestRate: 0, dueDay: 15,
  });

  const fs = financialState;
  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);

  const addDebtHandler = () => {
    if (!form.name || !form.currentBalance) return;
    addDebt({ ...form, id: nanoid(), interestRate: (form.interestRate ?? 0) / 100 } as Debt);
    setForm({ name: '', type: 'personal_loan', currentBalance: 0, monthlyPayment: 0, interestRate: 0, dueDay: 15 });
    setShowAddModal(false);
  };

  if (!fs) return null;

  const { debtPlan } = fs;

  // Comparison chart data
  const comparisonData = debtPlan.debts.map(d => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
    'Con plan': Math.round(d.totalInterest),
    'Solo mínimos': Math.round(d.totalInterest + d.interestSavedVsMinimum),
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="text-center">
          <p className="text-lg font-bold text-red-400">{fmt(debtPlan.totalDebt)}</p>
          <p className="text-xs text-gray-500 mt-1">Deuda Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-orange-400">{fmt(debtPlan.totalMonthlyPayment)}</p>
          <p className="text-xs text-gray-500 mt-1">Pago Mensual</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-green-400">{fmt(debtPlan.interestSaved)}</p>
          <p className="text-xs text-gray-500 mt-1">Ahorras en Intereses</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-blue-400">{debtPlan.debtFreeDate}</p>
          <p className="text-xs text-gray-500 mt-1">Libre de Deudas</p>
        </Card>
      </div>

      {/* Strategy selector */}
      <Card title="Estrategia de Pago">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {(['avalanche', 'snowball'] as const).map(s => (
            <button
              key={s}
              onClick={() => setDebtStrategy(s)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                debtStrategy === s
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s === 'avalanche' ? '⛰️' : '❄️'}</span>
                <span className="text-sm font-semibold text-gray-200">{s === 'avalanche' ? 'Avalanche' : 'Snowball'}</span>
                {debtStrategy === s && <span className="text-xs text-blue-400 ml-auto">ACTIVA</span>}
              </div>
              <p className="text-xs text-gray-500">
                {s === 'avalanche'
                  ? 'Paga primero la deuda con mayor tasa de interés. Ahorra más dinero en intereses.'
                  : 'Paga primero la deuda más pequeña. Genera motivación psicológica más rápido.'}
              </p>
              {debtPlan.interestSaved > 0 && s === 'avalanche' && (
                <p className="text-xs text-green-400 mt-1 font-medium">Ahorro: {fmt(debtPlan.interestSaved)}</p>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Debt cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200">Inventario de Deudas</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Agregar deuda
          </button>
        </div>

        {debtPlan.debts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm font-semibold text-gray-200">¡Sin deudas!</p>
            <p className="text-xs text-gray-500 mt-1">Tienes libertad financiera total en gastos.</p>
          </Card>
        ) : (
          debtPlan.debts.map(debt => {
            const isExpanded = expandedDebt === debt.id;
            const progressPct = debt.originalAmount
              ? ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100
              : 0;
            const monthlyInterest = debt.currentBalance * debt.interestRate;

            return (
              <Card key={debt.id} className={debt.order === 1 ? 'border-red-500/40' : ''}>
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedDebt(isExpanded ? null : debt.id)}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    debt.order === 1 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {debt.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200">{debt.name}</span>
                      <span className="text-xs text-gray-600">{DEBT_TYPE_LABELS[debt.type]}</span>
                      {debt.order === 1 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">PRIORIDAD</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span>Saldo: <span className="text-red-400 font-medium">{fmt(debt.currentBalance)}</span></span>
                      <span>Cuota: {fmt(debt.monthlyPayment)}/mes</span>
                      <span>Tasa: {(debt.interestRate * 100).toFixed(1)}%/mes</span>
                      <span className="text-orange-400">Interés: {fmt(monthlyInterest)}/mes</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={progressPct} color={debt.order === 1 ? '#ef4444' : '#3b82f6'} height="h-1.5" />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-600">Libre: {debt.payoffDate}</span>
                      <span className="text-green-400">Ahorras: {fmt(debt.interestSavedVsMinimum)}</span>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-gray-400 text-xs ml-1">
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Amortization table */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-800 overflow-x-auto">
                    <table className="w-full text-xs text-gray-400 min-w-[500px]">
                      <thead>
                        <tr className="text-gray-600 border-b border-gray-800">
                          <th className="pb-2 text-left">Mes</th>
                          <th className="pb-2 text-right">Pago</th>
                          <th className="pb-2 text-right">Interés</th>
                          <th className="pb-2 text-right">Capital</th>
                          <th className="pb-2 text-right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debt.amortization.slice(0, 12).map(row => (
                          <tr key={row.month} className="border-b border-gray-900 hover:bg-gray-900/50">
                            <td className="py-1.5">{row.date.slice(0, 7)}</td>
                            <td className="py-1.5 text-right">{fmt(row.payment)}</td>
                            <td className="py-1.5 text-right text-orange-400">{fmt(row.interest)}</td>
                            <td className="py-1.5 text-right text-blue-400">{fmt(row.principal)}</td>
                            <td className="py-1.5 text-right text-red-400">{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {debt.amortization.length > 12 && (
                      <p className="text-xs text-gray-600 mt-2">+{debt.amortization.length - 12} meses más...</p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Eliminar deuda
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Comparison chart */}
      {comparisonData.length > 0 && (
        <Card title="Plan vs Solo Mínimos" subtitle="Interés total pagado por deuda">
          <div className="h-48 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{v}</span>} />
                <Bar dataKey="Con plan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Solo mínimos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Add debt modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar Deuda">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: TC Bancolombia"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Debt['type'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500">
                {Object.entries(DEBT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CurrencyInput label="Saldo actual" value={form.currentBalance ?? 0} onChange={v => setForm(f => ({ ...f, currentBalance: v }))} currency={currency} required />
            <CurrencyInput label="Cuota mensual" value={form.monthlyPayment ?? 0} onChange={v => setForm(f => ({ ...f, monthlyPayment: v }))} currency={currency} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tasa (%/mes)</label>
              <input type="number" step="0.1" value={form.interestRate === 0 ? '' : form.interestRate}
                onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))}
                placeholder="2.2"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Día de pago</label>
              <input type="number" min={1} max={31} value={form.dueDay}
                onChange={e => setForm(f => ({ ...f, dueDay: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          {form.type === 'credit_card' && (
            <div className="grid grid-cols-2 gap-3">
              <CurrencyInput label="Cupo total" value={form.creditLimit ?? 0} onChange={v => setForm(f => ({ ...f, creditLimit: v }))} currency={currency} />
              <CurrencyInput label="Pago mínimo" value={form.minimumPayment ?? 0} onChange={v => setForm(f => ({ ...f, minimumPayment: v }))} currency={currency} />
            </div>
          )}
          <button onClick={addDebtHandler} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            Agregar deuda
          </button>
        </div>
      </Modal>
    </div>
  );
}
