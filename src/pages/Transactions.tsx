import { useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import type { Transaction, ExpenseCategory } from '../store/types';

export function Transactions() {
  const { transactions, addTransaction, removeTransaction, profile } = useFinancialStore();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense',
    category: 'food',
    description: '',
    paymentMethod: 'debit',
    isRecurring: false,
  });

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const addTx = () => {
    if (!form.amount || form.amount <= 0 || !form.description) return;
    addTransaction({ ...form, id: nanoid() } as Transaction);
    setForm({
      date: new Date().toISOString().split('T')[0],
      amount: 0, type: 'expense', category: 'food',
      description: '', paymentMethod: 'debit', isRecurring: false,
    });
    setShowModal(false);
  };

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-base font-bold text-green-400">{fmt(totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Ingresos</p>
        </Card>
        <Card className="text-center">
          <p className="text-base font-bold text-red-400">{fmt(totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">Gastos</p>
        </Card>
        <Card className="text-center">
          <p className={`text-base font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(totalIncome - totalExpense)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Balance</p>
        </Card>
      </div>

      {/* Filters + Add */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="debt_payment">Pago deuda</option>
              <option value="savings">Ahorro</option>
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Registrar
          </button>
        </div>
      </Card>

      {/* Transaction list */}
      <Card title={`Transacciones (${filtered.length})`}>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">📝</p>
            <p className="text-sm text-gray-400">No hay transacciones registradas</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Registrar primera transacción
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            {filtered.map(tx => {
              const isIncome = tx.type === 'income';
              const icon = CATEGORY_ICONS[tx.category] ?? '📦';
              const color = CATEGORY_COLORS[tx.category] ?? '#6b7280';

              return (
                <div key={tx.id} className="flex items-center gap-3 py-3 px-2 border-b border-gray-900 hover:bg-gray-900/40 rounded-lg">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{tx.description}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{CATEGORY_LABELS[tx.category]}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date, locale)}</span>
                      {tx.isRecurring && <span className="text-blue-400">recurrente</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => removeTransaction(tx.id)}
                    className="text-gray-600 hover:text-red-400 text-xs p-1 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add transaction modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Transacción">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as Transaction['type'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="debt_payment">Pago deuda</option>
                <option value="savings">Ahorro</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <CurrencyInput
            label="Monto"
            value={form.amount ?? 0}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
            currency={currency}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ej: Mercado semana"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
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
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Método de pago</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="debit">Débito</option>
                <option value="cash">Efectivo</option>
                <option value="credit_card">TC</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600" />
            <span className="text-sm text-gray-300">Transacción recurrente</span>
          </label>

          <button onClick={addTx} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            Registrar transacción
          </button>
        </div>
      </Modal>
    </div>
  );
}
