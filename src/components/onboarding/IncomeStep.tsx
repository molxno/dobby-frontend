import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const CURRENCY_CODES = ['COP', 'MXN', 'USD', 'EUR', 'ARS', 'CLP', 'PEN'];

export function IncomeStep({ currency, setCurrency, incomes, setIncomes, onNext }: IncomeStepProps) {
  const { t } = useTranslation();
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
      setError(t('onboarding.income.validation'));
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
        <h2 className="text-xl font-bold font-heading text-slate-100 mb-1">{t('onboarding.income.title')}</h2>
        <p className="text-sm text-slate-500">{t('onboarding.income.subtitle')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.income.currency')}</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
        >
          {CURRENCY_CODES.map(code => (
            <option key={code} value={code}>{t(`settings.currencies.${code}`)}</option>
          ))}
        </select>
      </div>

      {/* Incomes list */}
      {incomes.length > 0 && (
        <div className="space-y-2">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-surface-800/60 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-slate-200">{inc.name}</p>
                <p className="text-xs text-slate-500">
                  {inc.amount.toLocaleString('es-CO')} {currency}/mes · {inc.frequency === 'biweekly' ? t('onboarding.income.biweekly') : inc.frequency === 'weekly' ? t('onboarding.income.weekly') : t('onboarding.income.monthly')}
                </p>
              </div>
              <button onClick={() => removeIncome(inc.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded">{t('common.delete')}</button>
            </div>
          ))}
        </div>
      )}

      {/* Add income form */}
      {showForm ? (
        <div className="bg-surface-800/40 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold font-heading text-slate-200">{t('onboarding.income.newSource')}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.income.name')} <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('onboarding.income.namePlaceholder')}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              />
            </div>
            <CurrencyInput
              label={t('onboarding.income.monthlyAmount')}
              value={form.amount ?? 0}
              onChange={v => setForm(f => ({ ...f, amount: v }))}
              currency={currency}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.income.payFrequency')}</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Income['frequency'] }))}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
              >
                <option value="monthly">{t('onboarding.income.monthly')}</option>
                <option value="biweekly">{t('onboarding.income.biweekly')}</option>
                <option value="weekly">{t('onboarding.income.weekly')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.income.payDays')}</label>
              <input
                type="text"
                value={form.payDays?.join(', ')}
                onChange={e => setForm(f => ({ ...f, payDays: e.target.value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n)) }))}
                placeholder={t('onboarding.income.payDaysPlaceholder')}
                className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
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
            <span className="text-sm text-slate-300">{t('onboarding.income.netAmount')}</span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={addIncome}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
            >
              {t('onboarding.income.addIncome')}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-lg transition-colors"
            >
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
          {t('onboarding.income.addSource')}
        </button>
      )}

      <div className="pt-6 border-t border-surface-800/40">
        <button
          onClick={onNext}
          disabled={!canNext}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-surface-800 disabled:text-slate-600 disabled:opacity-50 disabled:shadow-none text-white text-sm font-medium py-3.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
        >
          {t('common.continue')}
          <ArrowRight className="w-4 h-4" />
        </button>
        {!canNext && <p className="text-xs text-slate-600 text-center mt-2">{t('onboarding.income.minOneIncome')}</p>}
      </div>
    </div>
  );
}
