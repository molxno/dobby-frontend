import { useState } from 'react';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuth } from '../../contexts/AuthContext';
import { IncomeStep } from './IncomeStep';
import { ExpensesStep } from './ExpensesStep';
import { DebtsStep } from './DebtsStep';
import { GoalsStep } from './GoalsStep';
import { Sparkles, Wallet, Home, CreditCard, Target, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Income, Expense, Debt, Goal } from '../../store/types';

const STEPS = [
  { number: 1, title: 'Ingresos', icon: Wallet, description: 'Cuánto y cuándo recibes dinero' },
  { number: 2, title: 'Gastos', icon: Home, description: 'Tus gastos fijos mensuales' },
  { number: 3, title: 'Deudas', icon: CreditCard, description: 'Lo que debes actualmente' },
  { number: 4, title: 'Metas', icon: Target, description: 'Lo que quieres lograr' },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const { setIncomes, setExpenses, setDebts, setGoals, setCurrentFund, setOnboardingCompleted, setProfile, profile } = useFinancialStore();
  const { user } = useAuth();

  // Name comes from signup (stored in profile via trigger, or from user_metadata)
  const userName = profile.name || user?.user_metadata?.name || '';
  const [currency, setCurrency] = useState('COP');
  const [incomes, setLocalIncomes] = useState<Income[]>([]);
  const [expenses, setLocalExpenses] = useState<Expense[]>([]);
  const [debts, setLocalDebts] = useState<Debt[]>([]);
  const [goals, setLocalGoals] = useState<Goal[]>([]);
  const [currentFundLocal, setCurrentFundLocal] = useState(0);

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
      <div className="border-b border-surface-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-heading text-slate-100">Dobby</h1>
            <p className="text-xs text-slate-500">Free Your Finances</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-800 -z-0" />
          {STEPS.map((s) => {
            const StepIcon = s.icon;
            return (
              <div key={s.number} className="flex flex-col items-center gap-2 z-10">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  s.number < step
                    ? 'bg-green-600 border-green-600 text-white'
                    : s.number === step
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-surface-900 border-surface-700 text-slate-500'
                )}>
                  {s.number < step ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <div className="text-center hidden sm:block">
                  <p className={cn(
                    'text-xs font-medium',
                    s.number === step ? 'text-brand-400' : s.number < step ? 'text-green-400' : 'text-slate-600'
                  )}>{s.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="flex-1">
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
  );
}
