import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home, Car, Plane, BookOpen, Laptop, Heart, Baby, Palmtree,
  Dumbbell, GraduationCap, PiggyBank, Building2, Target,
  ArrowRight, Shuffle, Clock, X, Plus, type LucideIcon,
} from 'lucide-react';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import { cn } from '../lib/utils';
import type { Goal } from '../store/types';

const GOAL_ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: Home, label: 'Home' },
  { icon: Car, label: 'Car' },
  { icon: Plane, label: 'Travel' },
  { icon: BookOpen, label: 'Education' },
  { icon: Laptop, label: 'Tech' },
  { icon: Heart, label: 'Wedding' },
  { icon: Baby, label: 'Baby' },
  { icon: Palmtree, label: 'Vacation' },
  { icon: Dumbbell, label: 'Fitness' },
  { icon: GraduationCap, label: 'Degree' },
  { icon: PiggyBank, label: 'Savings' },
  { icon: Building2, label: 'Property' },
  { icon: Target, label: 'Goal' },
];

function GoalIcon({ iconName, className, size = 20 }: { iconName: string; className?: string; size?: number }) {
  const found = GOAL_ICONS.find(g => g.label === iconName);
  const Icon = found?.icon ?? Target;
  return <Icon className={className} size={size} />;
}

export function Goals() {
  const { t } = useTranslation();
  const { financialState, profile, goals, addGoal, removeGoal, updateGoal, goalMode, setGoalMode } = useFinancialStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Partial<Goal>>({
    name: '', icon: 'Goal', targetAmount: 0, currentSaved: 0,
    priority: goals.length + 1, category: 'purchase', isFlexible: true,
  });

  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { goalPlan } = fs;

  const addGoalHandler = () => {
    if (!form.name || !form.targetAmount) return;
    addGoal({ ...form, id: nanoid(), priority: goals.length + 1 } as Goal);
    setForm({ name: '', icon: 'Goal', targetAmount: 0, currentSaved: 0, priority: goals.length + 2, category: 'purchase', isFlexible: true });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center">
          <p className="text-lg font-bold text-purple-400 font-heading">{goalPlan.goals.length}</p>
          <p className="text-xs text-slate-500 mt-1">{t('goals.activeGoals')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-emerald-400 font-heading">{fmt(goalPlan.totalMonthlySaving)}</p>
          <p className="text-xs text-slate-500 mt-1">{t('goals.monthlySavings')}</p>
        </Card>
        <Card className="text-center lg:col-span-1 col-span-2">
          <p className="text-base font-bold text-brand-400 font-heading">{goalPlan.startDate}</p>
          <p className="text-xs text-slate-500 mt-1">{t('goals.savingsStart')}</p>
        </Card>
      </div>

      {/* Mode selector */}
      <Card title={t('goals.savingsMode')}>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(['sequential', 'parallel'] as const).map(m => (
            <button
              key={m}
              onClick={() => setGoalMode(m)}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                goalMode === m ? 'border-purple-500 bg-purple-950/30' : 'border-surface-700 bg-surface-900 hover:border-surface-600'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {m === 'sequential' ? <ArrowRight size={18} className="text-purple-400" /> : <Shuffle size={18} className="text-purple-400" />}
                <span className="text-sm font-semibold text-slate-200">{m === 'sequential' ? t('goals.sequential') : t('goals.parallel')}</span>
                {goalMode === m && <span className="text-xs text-purple-400 ml-auto">{t('common.active')}</span>}
              </div>
              <p className="text-xs text-slate-500">
                {m === 'sequential' ? t('goals.sequentialDescription') : t('goals.parallelDescription')}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Goals list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 font-heading">{t('goals.yourGoals')}</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} />
            {t('goals.addGoal')}
          </button>
        </div>

        {goalPlan.goals.length === 0 ? (
          <Card className="text-center py-8">
            <Target className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-sm font-semibold text-slate-200">{t('goals.noGoals')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('goals.noGoalsDescription')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              {t('goals.addFirstGoal')}
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {goalPlan.goals.map((goal, i) => (
              <Card key={goal.id} className={cn(goal.status === 'saving' && 'border-purple-500/40')}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      goal.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      goal.status === 'saving' ? 'bg-purple-500/20 text-purple-400' : 'bg-surface-800 text-slate-500'
                    )}>
                      <GoalIcon iconName={goal.icon} size={20} />
                    </div>
                    <span className="text-xs text-slate-600">#{goal.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">{goal.name}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        goal.status === 'saving' ? 'bg-purple-500/20 text-purple-400' :
                        goal.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-surface-800 text-slate-500'
                      )}>
                        {goal.status === 'saving' ? t('goals.saving') : goal.status === 'completed' ? t('common.completed') : t('goals.waiting')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                      <span>{t('goals.target', { amount: fmt(goal.targetAmount) })}</span>
                      {goal.currentSaved > 0 && <span>{t('goals.saved', { amount: fmt(goal.currentSaved) })}</span>}
                      <span>{t('goals.remaining', { amount: fmt(goal.remaining) })}</span>
                      {goal.monthlySaving > 0 && <span>{t('goals.perMonth', { amount: fmt(goal.monthlySaving) })}</span>}
                    </div>

                    <div className="mt-2">
                      <ProgressBar
                        value={goal.progressPercent}
                        color={goal.status === 'saving' ? '#a855f7' : goal.status === 'completed' ? '#22c55e' : '#64748b'}
                        height="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-600">{goal.progressPercent.toFixed(0)}% {t('goals.percentComplete')}</span>
                      <span className={goal.status === 'saving' ? 'text-purple-400' : 'text-slate-500'}>
                        {goal.status === 'waiting' ? t('goals.startsAt', { date: goalPlan.startDate }) : t('goals.readyAt', { date: goal.estimatedDate })}
                        {goal.monthsNeeded > 0 && goal.status === 'saving' && ` ${t('goals.monthsNeeded', { count: goal.monthsNeeded })}`}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => removeGoal(goal.id)} className="text-red-400 hover:text-red-300 p-1 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Context note */}
      {fs.debtPlan.monthsToDebtFree > 0 && (
        <Card className="border-amber-500/30 bg-amber-950/10">
          <div className="flex items-start gap-2">
            <Clock size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">{t('goals.waitingGoals')}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t('goals.waitingDescription', { startDate: goalPlan.startDate, debtFreeDate: fs.debtPlan.debtFreeDate })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('goals.newGoalTitle')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('goals.icon')}</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setForm(f => ({ ...f, icon: label }))}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    form.icon === label
                      ? 'bg-purple-600 border-2 border-purple-400 text-white'
                      : 'bg-surface-800 border border-surface-700 hover:border-surface-600 text-slate-400'
                  )}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('goals.goalName')}</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('goals.goalNamePlaceholder')}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-purple-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label={t('goals.totalCost')} value={form.targetAmount ?? 0} onChange={v => setForm(f => ({ ...f, targetAmount: v }))} currency={currency} required />
            <CurrencyInput label={t('goals.alreadySaved')} value={form.currentSaved ?? 0} onChange={v => setForm(f => ({ ...f, currentSaved: v }))} currency={currency} />
          </div>
          <button onClick={addGoalHandler} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-600/20">
            {t('goals.addGoal')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
