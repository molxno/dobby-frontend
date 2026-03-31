import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinancialStore, scopedBiweeklyKey } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/shared/CategoryIcon';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { cn } from '../lib/utils';
import { Home, CreditCard, PiggyBank, Shield, PartyPopper, Pin, Check, type LucideIcon } from 'lucide-react';
import type { BiweeklyPayment, ExpenseCategory } from '../store/types';

const TYPE_COLORS: Record<BiweeklyPayment['type'], string> = {
  expense: '#3b82f6',
  debt: '#ef4444',
  savings: '#22c55e',
  buffer: '#6b7280',
};

const TYPE_ICONS: Record<BiweeklyPayment['type'], LucideIcon> = {
  expense: Home,
  debt: CreditCard,
  savings: PiggyBank,
  buffer: Shield,
};

export function BiweeklyPlan() {
  const { t } = useTranslation();
  const { financialState, profile, transactions, toggleBiweeklyCheck } = useFinancialStore();
  const [activePeriod, setActivePeriod] = useState<1 | 2>(1);

  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { biweeklyPlan } = fs;

  const period = biweeklyPlan.periods.find(p => p.period === activePeriod)!;

  // Derive checked state only from current month's biweekly transactions.
  // Computed inline (not memoized with []) so it stays correct across month boundaries.
  const currentMonthSuffix = `:${new Date().toISOString().slice(0, 7)}`;
  const checkedKeys = useMemo(() => new Set(
    transactions
      .filter(t => t.biweeklyKey?.endsWith(currentMonthSuffix))
      .map(t => t.biweeklyKey)
  ), [transactions, currentMonthSuffix]);
  const completedCount = period.payments.filter(p => checkedKeys.has(scopedBiweeklyKey(p.key))).length;
  const progressPct = period.payments.length > 0 ? (completedCount / period.payments.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-base font-bold text-green-400">{fmt(biweeklyPlan.totalMonthlyIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">{t('biweekly.monthlyIncome')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-base font-bold text-blue-400">{fmt(biweeklyPlan.totalMonthlyExpenses)}</p>
          <p className="text-xs text-slate-500 mt-1">{t('biweekly.totalExpenses')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-base font-bold text-brand-500">{fmt(biweeklyPlan.monthlySavings)}</p>
          <p className="text-xs text-slate-500 mt-1">{t('biweekly.monthlySavings')}</p>
        </Card>
      </div>

      {/* Period selector */}
      <div className="flex rounded-lg overflow-hidden bg-surface-900">
        {biweeklyPlan.periods.map(p => (
          <button
            key={p.period}
            onClick={() => setActivePeriod(p.period)}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activePeriod === p.period
                ? 'bg-brand-600 text-white'
                : 'bg-surface-900 text-slate-400 hover:bg-surface-800'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Period details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period summary */}
        <Card title={period.label} className="lg:col-span-1">
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('biweekly.periodIncome')}</span>
              <span className="text-green-400 font-medium">{fmt(period.income)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('biweekly.payments')}</span>
              <span className="text-red-400 font-medium">{fmt(period.totalPayments)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('biweekly.savings')}</span>
              <span className="text-brand-500 font-medium">{fmt(period.savingsAllocation)}</span>
            </div>
            <div className="border-t border-surface-700 pt-2 flex justify-between text-sm">
              <span className="text-slate-300 font-medium">{t('biweekly.remaining')}</span>
              <span className={cn('font-bold', period.remaining >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {fmt(period.remaining)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 pt-3 border-t border-surface-700">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{t('biweekly.tasksCompleted')}</span>
              <span className="text-slate-300">{completedCount}/{period.payments.length}</span>
            </div>
            <ProgressBar value={progressPct} color="#22c55e" height="h-2" />
          </div>
        </Card>

        {/* Checklist */}
        <Card title={t('biweekly.checklist')} className="lg:col-span-2">
          <div className="space-y-2 mt-3">
            {period.payments.map((payment) => {
              const isChecked = checkedKeys.has(scopedBiweeklyKey(payment.key));
              const TypeIcon = TYPE_ICONS[payment.type];

              return (
                <div
                  key={payment.key}
                  role="checkbox"
                  aria-checked={isChecked}
                  aria-label={`${payment.name} - ${fmt(payment.amount)}`}
                  tabIndex={0}
                  onClick={() => toggleBiweeklyCheck(payment)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleBiweeklyCheck(payment);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-lg cursor-pointer transition-all',
                    isChecked
                      ? 'bg-emerald-950/20'
                      : 'bg-surface-800/50 hover:bg-surface-800'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                    isChecked ? 'bg-green-600 border-green-600' : 'border-slate-600'
                  )}>
                    {isChecked && <Check className="text-white" size={12} />}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-surface-800">
                    {payment.category ? (
                      <CategoryIcon category={payment.category as ExpenseCategory} className="text-slate-300" size={16} />
                    ) : (
                      <TypeIcon className="text-slate-300" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', isChecked ? 'line-through text-slate-500' : 'text-slate-200')}>
                      {payment.name}
                    </p>
                    {payment.dueDay && (
                      <p className="text-xs text-slate-500">{t('biweekly.dueDay', { day: payment.dueDay })}</p>
                    )}
                  </div>
                  <span
                    className="text-sm font-semibold shrink-0"
                    style={{ color: TYPE_COLORS[payment.type] }}
                  >
                    {fmt(payment.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {completedCount === period.payments.length && period.payments.length > 0 && (
            <div className="mt-4 p-3 bg-green-950/30 border border-green-700/40 rounded-lg text-center flex items-center justify-center gap-2">
              <PartyPopper className="text-green-400" size={16} />
              <div>
                <p className="text-sm font-semibold text-green-400">{t('biweekly.periodCompleted')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('biweekly.allTasksDone')}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Phase context */}
      {fs.currentPhase && (
        <Card className="border-brand-500/20 bg-brand-500/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
              <Pin className="text-brand-400" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-400">{t('biweekly.currentPhase', { phase: fs.currentPhase.name })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t('biweekly.phaseObjective', { objective: fs.currentPhase.objectives[0] })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
