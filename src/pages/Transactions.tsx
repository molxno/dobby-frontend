import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryLabel, CATEGORY_COLORS } from '../utils/constants';
import { CategoryIcon } from '../components/shared/CategoryIcon';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import { cn } from '../lib/utils';
import { FileText, X, Plus } from 'lucide-react';
import type { Transaction, ExpenseCategory } from '../store/types';

const CATEGORY_KEYS: ExpenseCategory[] = [
  'housing', 'utilities', 'food', 'transport', 'health', 'family',
  'education', 'entertainment', 'subscriptions', 'personal', 'debt',
  'savings', 'insurance', 'other',
];

export function Transactions() {
  const { t } = useTranslation();
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
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="text-center">
          <p className="text-xl font-bold text-green-400 font-heading">{fmt(totalIncome)}</p>
          <p className="text-xs text-slate-500 mt-1.5">{t('transactions.income')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xl font-bold text-red-400 font-heading">{fmt(totalExpense)}</p>
          <p className="text-xs text-slate-500 mt-1.5">{t('transactions.expenses')}</p>
        </Card>
        <Card className="text-center">
          <p className={cn('text-xl font-bold font-heading', totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {fmt(totalIncome - totalExpense)}
          </p>
          <p className="text-xs text-slate-500 mt-1.5">{t('transactions.balance')}</p>
        </Card>
      </div>

      {/* Filters + Add */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            >
              <option value="all">{t('transactions.allTypes')}</option>
              <option value="income">{t('transactions.typeIncome')}</option>
              <option value="expense">{t('transactions.typeExpense')}</option>
              <option value="debt_payment">{t('transactions.typeDebtPayment')}</option>
              <option value="savings">{t('transactions.typeSavings')}</option>
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            >
              <option value="all">{t('transactions.allCategories')}</option>
              {CATEGORY_KEYS.map(k => (
                <option key={k} value={k}>{getCategoryLabel(k)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-3 px-5 rounded-xl transition-colors shadow-lg shadow-brand-600/20 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {t('transactions.record')}
          </button>
        </div>
      </Card>

      {/* Transaction list */}
      <Card title={t('transactions.transactionCount', { count: filtered.length })}>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-lg bg-surface-800 flex items-center justify-center mx-auto mb-3">
              <FileText className="text-slate-500" size={24} />
            </div>
            <p className="text-sm text-slate-400">{t('transactions.noTransactions')}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-brand-600/20 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              {t('transactions.recordFirst')}
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-1.5">
            {filtered.map(tx => {
              const isIncome = tx.type === 'income';
              const color = CATEGORY_COLORS[tx.category] ?? '#64748b';

              return (
                <div key={tx.id} className="flex items-center gap-4 py-3.5 px-3 border border-surface-800/40 hover:bg-surface-800/40 rounded-xl transition-colors">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <CategoryIcon category={tx.category} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-medium">{tx.description}</p>
                    <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{getCategoryLabel(tx.category)}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date, locale)}</span>
                      {tx.isRecurring && <span className="text-brand-400">{t('transactions.recurring')}</span>}
                    </div>
                  </div>
                  <span className={cn('text-sm font-bold shrink-0', isIncome ? 'text-green-400' : 'text-red-400')}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => removeTransaction(tx.id)}
                    className="text-slate-600 hover:text-red-400 p-1.5 shrink-0 transition-colors rounded-lg hover:bg-red-950/20"
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('transactions.recordTitle')}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('transactions.type')}</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as Transaction['type'] }))}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              >
                <option value="expense">{t('transactions.typeExpense')}</option>
                <option value="income">{t('transactions.typeIncome')}</option>
                <option value="debt_payment">{t('transactions.typeDebtPayment')}</option>
                <option value="savings">{t('transactions.typeSavings')}</option>
                <option value="transfer">{t('transactions.typeTransfer', { defaultValue: 'Transfer' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('transactions.date')}</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              />
            </div>
          </div>

          <CurrencyInput
            label={t('transactions.amount')}
            value={form.amount ?? 0}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
            currency={currency}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('transactions.description')}</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t('transactions.descriptionPlaceholder')}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('transactions.category')}</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              >
                {CATEGORY_KEYS.map(k => (
                  <option key={k} value={k}>{getCategoryLabel(k)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('transactions.paymentMethod')}</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              >
                <option value="debit">{t('transactions.debit')}</option>
                <option value="cash">{t('transactions.cash')}</option>
                <option value="credit_card">{t('transactions.creditCard')}</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
              className="w-4 h-4 rounded border-surface-700 bg-surface-800 text-brand-600" />
            <span className="text-sm text-slate-300">{t('transactions.recurringTransaction')}</span>
          </label>

          <button onClick={addTx} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20">
            {t('transactions.recordTransaction')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
