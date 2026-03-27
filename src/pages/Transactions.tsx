import { useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/constants';
import { CategoryIcon } from '../components/shared/CategoryIcon';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import { cn } from '../lib/utils';
import { FileText, X, Plus } from 'lucide-react';
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
          <p className="text-xs text-slate-500 mt-1">Income</p>
        </Card>
        <Card className="text-center">
          <p className="text-base font-bold text-red-400">{fmt(totalExpense)}</p>
          <p className="text-xs text-slate-500 mt-1">Expenses</p>
        </Card>
        <Card className="text-center">
          <p className={cn('text-base font-bold', totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {fmt(totalIncome - totalExpense)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Balance</p>
        </Card>
      </div>

      {/* Filters + Add */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
              <option value="debt_payment">Debt payment</option>
              <option value="savings">Savings</option>
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-brand-600/20 inline-flex items-center gap-1.5"
          >
            <Plus size={16} />
            Record
          </button>
        </div>
      </Card>

      {/* Transaction list */}
      <Card title={`Transactions (${filtered.length})`}>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-3">
              <FileText className="text-slate-500" size={24} />
            </div>
            <p className="text-sm text-slate-400">No transactions recorded</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-lg shadow-brand-600/20 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Record first transaction
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            {filtered.map(tx => {
              const isIncome = tx.type === 'income';
              const color = CATEGORY_COLORS[tx.category] ?? '#64748b';

              return (
                <div key={tx.id} className="flex items-center gap-3 py-3 px-2 border-b border-surface-900 hover:bg-surface-900/40 rounded-lg">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <CategoryIcon category={tx.category} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{tx.description}</p>
                    <div className="flex gap-2 text-xs text-slate-500">
                      <span>{CATEGORY_LABELS[tx.category]}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date, locale)}</span>
                      {tx.isRecurring && <span className="text-brand-400">recurring</span>}
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold shrink-0', isIncome ? 'text-green-400' : 'text-red-400')}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => removeTransaction(tx.id)}
                    className="text-slate-600 hover:text-red-400 p-1 shrink-0 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add transaction modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as Transaction['type'] }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="debt_payment">Debt payment</option>
                <option value="savings">Savings</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <CurrencyInput
            label="Amount"
            value={form.amount ?? 0}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
            currency={currency}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Weekly groceries"
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment method</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              >
                <option value="debit">Debit</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit card</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
              className="w-4 h-4 rounded border-surface-700 bg-surface-800 text-brand-600" />
            <span className="text-sm text-slate-300">Recurring transaction</span>
          </label>

          <button onClick={addTx} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-600/20">
            Record transaction
          </button>
        </div>
      </Modal>
    </div>
  );
}
