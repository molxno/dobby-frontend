import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuth } from '../../contexts/AuthContext';
import { IncomeStep } from './IncomeStep';
import { ExpensesStep } from './ExpensesStep';
import { DebtsStep } from './DebtsStep';
import { GoalsStep } from './GoalsStep';
import { Wallet, Home, CreditCard, Target, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Income, Expense, Debt, Goal } from '../../store/types';
import { DobbyLogo } from '../shared/DobbyLogo';

export function OnboardingWizard() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { setIncomes, setExpenses, setDebts, setGoals, setCurrentFund, setOnboardingCompleted, setProfile, profile } = useFinancialStore();
  const { user } = useAuth();

  const userName = profile.name || user?.user_metadata?.name || '';
  const [currency, setCurrency] = useState('COP');
  const [incomes, setLocalIncomes] = useState<Income[]>([]);
  const [expenses, setLocalExpenses] = useState<Expense[]>([]);
  const [debts, setLocalDebts] = useState<Debt[]>([]);
  const [goals, setLocalGoals] = useState<Goal[]>([]);
  const [currentFundLocal, setCurrentFundLocal] = useState(0);

  const STEPS = [
    { number: 1, title: t('onboarding.steps.income'), icon: Wallet, description: t('onboarding.steps.incomeDesc') },
    { number: 2, title: t('onboarding.steps.expenses'), icon: Home, description: t('onboarding.steps.expensesDesc') },
    { number: 3, title: t('onboarding.steps.debts'), icon: CreditCard, description: t('onboarding.steps.debtsDesc') },
    { number: 4, title: t('onboarding.steps.goals'), icon: Target, description: t('onboarding.steps.goalsDesc') },
  ];

  const currentStepData = STEPS[step - 1];

  const handleFinish = () => {
    setProfile({ name: userName, country: 'Colombia', currency, locale: currency === 'COP' ? 'es-CO' : 'en-US' });
    setIncomes(incomes);
    setExpenses(expenses);
    setDebts(debts);
    setGoals(goals);
    setCurrentFund(currentFundLocal);
    setOnboardingCompleted(true);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-surface-800/60 px-6 lg:px-10 py-5 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3.5">
          <DobbyLogo size={38} />
          <div>
            <h1 className="text-base font-bold font-heading text-slate-100 leading-tight">Dobby</h1>
            <p className="text-xs text-slate-500">Free Your Finances</p>
          </div>
          {userName && (
            <div className="ml-auto text-sm text-slate-400">
              {t('onboarding.welcome', { name: userName })}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-surface-800/60 px-8 py-10 bg-surface-950">
          {/* Step list */}
          <div className="space-y-2 mb-10">
            {STEPS.map((s) => {
              const StepIcon = s.icon;
              const isCompleted = s.number < step;
              const isActive = s.number === step;
              return (
                <div
                  key={s.number}
                  className={cn(
                    'flex items-center gap-4 p-3.5 rounded-xl transition-all',
                    isActive ? 'bg-brand-600/10 border border-brand-500/20' : 'border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all',
                    isCompleted ? 'bg-green-600 border-green-600 text-white'
                      : isActive ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface-900 border-surface-700 text-slate-600'
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium leading-tight',
                      isActive ? 'text-brand-400' : isCompleted ? 'text-green-400' : 'text-slate-600'
                    )}>{s.title}</p>
                    {isActive && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>{t('onboarding.progress')}</span>
              <span>{step - 1}/{STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-8 lg:px-10 lg:py-10">

            {/* Mobile step indicator */}
            <div className="flex items-center justify-between mb-8 lg:hidden relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-800 z-0" />
              {STEPS.map((s) => {
                const StepIcon = s.icon;
                return (
                  <div key={s.number} className="flex flex-col items-center gap-2 z-10">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      s.number < step ? 'bg-green-600 border-green-600 text-white'
                        : s.number === step ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-surface-900 border-surface-700 text-slate-500'
                    )}>
                      {s.number < step ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <p className={cn(
                      'text-xs font-medium hidden sm:block',
                      s.number === step ? 'text-brand-400' : s.number < step ? 'text-green-400' : 'text-slate-600'
                    )}>{s.title}</p>
                  </div>
                );
              })}
            </div>

            {/* Step heading (mobile) */}
            <div className="mb-6 lg:hidden">
              <h2 className="text-lg font-bold text-slate-100 font-heading">{currentStepData.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{currentStepData.description}</p>
            </div>

            {/* Step content */}
            <div>
              {step === 1 && (
                <IncomeStep
                  currency={currency}
                  setCurrency={setCurrency}
                  incomes={incomes}
                  setIncomes={setLocalIncomes}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <ExpensesStep
                  expenses={expenses}
                  setExpenses={setLocalExpenses}
                  currency={currency}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <DebtsStep
                  debts={debts}
                  setDebts={setLocalDebts}
                  currency={currency}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              )}
              {step === 4 && (
                <GoalsStep
                  goals={goals}
                  setGoals={setLocalGoals}
                  currentFund={currentFundLocal}
                  setCurrentFund={setCurrentFundLocal}
                  currency={currency}
                  onBack={() => setStep(3)}
                  onFinish={handleFinish}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
