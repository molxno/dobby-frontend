import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Debt } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { getDebtTypeLabel } from '../../utils/constants';
import { nanoid } from '../shared/nanoid';
import { CreditCard, Building2, FileText, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface DebtsStepProps {
  debts: Debt[];
  setDebts: (v: Debt[]) => void;
  currency: string;
  onBack: () => void;
  onNext: () => void;
}

const DEBT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  credit_card: CreditCard,
  personal_loan: Building2,
};

const DEBT_TYPE_KEYS = ['personal_loan', 'credit_card', 'mortgage', 'car_loan', 'student_loan', 'financed_purchase', 'other'];

function DebtTypeIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  const Icon = DEBT_TYPE_ICONS[type] || FileText;
  return <Icon className={className} />;
}

export function DebtsStep({ debts, setDebts, currency, onBack, onNext }: DebtsStepProps) {
  const { t } = useTranslation();
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100 mb-1">{t('onboarding.debts.title')}</h2>
        <p className="text-sm text-slate-500">{t('onboarding.debts.subtitle')}</p>
      </div>

      <label className="flex items-center gap-3 p-4 bg-surface-800/60 rounded-lg cursor-pointer hover:bg-surface-800">
        <input
          type="checkbox"
          checked={noDebts}
          onChange={e => { setNoDebts(e.target.checked); if (e.target.checked) setDebts([]); }}
          className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-600 accent-brand-600"
        />
        <span className="text-sm text-slate-300">{t('onboarding.debts.noDebts')}</span>
      </label>

      {!noDebts && (
        <>
          {debts.length > 0 && (
            <div className="space-y-2">
              {debts.map(debt => (
                <div key={debt.id} className="flex items-center gap-3 bg-surface-800/60 rounded-lg p-3">
                  <div className="text-slate-400">
                    <DebtTypeIcon type={debt.type} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{debt.name}</p>
                    <p className="text-xs text-slate-500">
                      {t('onboarding.debts.balance', { amount: `${debt.currentBalance.toLocaleString('es-CO')} ${currency}` })} · {t('onboarding.debts.installment', { amount: debt.monthlyPayment.toLocaleString('es-CO') })} · {t('onboarding.debts.rate', { rate: (debt.interestRate * 100).toFixed(1) })}
                    </p>
                  </div>
                  <button onClick={() => removeDebt(debt.id)} className="text-red-400 hover:text-red-300 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="bg-surface-900/50 rounded-lg px-4 py-2 flex justify-between">
                <span className="text-sm text-slate-400">{t('onboarding.debts.totalDebtAndPayment')}</span>
                <span className="text-sm font-bold text-red-400">
                  {totalDebt.toLocaleString('es-CO')} / {totalMonthly.toLocaleString('es-CO')} {currency}
                </span>
              </div>
            </div>
          )}

          {showForm ? (
            <div className="bg-surface-800/40 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold font-heading text-slate-200">{t('onboarding.debts.newDebt')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.debts.name')}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t('onboarding.debts.namePlaceholder')}
                    className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.debts.debtType')}</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as Debt['type'] }))}
                    className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  >
                    {DEBT_TYPE_KEYS.map(k => <option key={k} value={k}>{getDebtTypeLabel(k)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput
                  label={t('onboarding.debts.currentBalance')}
                  value={form.currentBalance ?? 0}
                  onChange={v => setForm(f => ({ ...f, currentBalance: v }))}
                  currency={currency}
                  required
                />
                <CurrencyInput
                  label={t('onboarding.debts.monthlyInstallment')}
                  value={form.monthlyPayment ?? 0}
                  onChange={v => setForm(f => ({ ...f, monthlyPayment: v }))}
                  currency={currency}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.debts.interestRate')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.interestRate === 0 ? '' : form.interestRate}
                    onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))}
                    placeholder={t('onboarding.debts.interestPlaceholder')}
                    className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                  <p className="text-xs text-slate-600 mt-1">{t('onboarding.debts.interestHint')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.debts.dueDay')}</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.dueDay}
                    onChange={e => setForm(f => ({ ...f, dueDay: parseInt(e.target.value) }))}
                    className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
              </div>

              {form.type === 'credit_card' && (
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput
                    label={t('onboarding.debts.creditLimit')}
                    value={form.creditLimit ?? 0}
                    onChange={v => setForm(f => ({ ...f, creditLimit: v }))}
                    currency={currency}
                  />
                  <CurrencyInput
                    label={t('onboarding.debts.minimumPayment')}
                    value={form.minimumPayment ?? 0}
                    onChange={v => setForm(f => ({ ...f, minimumPayment: v }))}
                    currency={currency}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={addDebt} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-brand-600/20">
                  {t('onboarding.debts.addDebt')}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-lg py-3 text-sm text-slate-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('onboarding.debts.addDebt')}
            </button>
          )}
        </>
      )}

      <div className="flex gap-3 pt-6 border-t border-surface-800/40">
        <button onClick={onBack} className="px-5 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-lg py-3 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
        >
          {t('common.continue')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
