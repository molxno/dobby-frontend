import type { Income, Expense, Debt, Goal, Phase, BudgetAllocation } from '../store/types';
import { addMonths, formatMonthYear } from '../utils/formatters';
import i18n from '../i18n';

function fmt(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

function makeBudget(
  income: number,
  essentialExpenses: number,
  debtPayments: number,
  freeFlow: number,
  alloc: { debts?: number; emergency?: number; goals?: number; leisure?: number; buffer?: number }
): BudgetAllocation[] {
  const t = i18n.t.bind(i18n);
  const allocations: BudgetAllocation[] = [
    { category: 'essential', label: t('phases.essential'), amount: essentialExpenses, percentage: essentialExpenses / income, color: '#3b82f6' },
    { category: 'debt', label: t('phases.debtMin'), amount: debtPayments, percentage: debtPayments / income, color: '#ef4444' },
  ];

  if (alloc.debts && alloc.debts > 0) {
    allocations.push({ category: 'debt_extra', label: t('phases.debtExtra'), amount: freeFlow * alloc.debts, percentage: (freeFlow * alloc.debts) / income, color: '#f97316' });
  }
  if (alloc.emergency && alloc.emergency > 0) {
    allocations.push({ category: 'emergency', label: t('phases.emergencyFund'), amount: freeFlow * alloc.emergency, percentage: (freeFlow * alloc.emergency) / income, color: '#22c55e' });
  }
  if (alloc.goals && alloc.goals > 0) {
    allocations.push({ category: 'goals', label: t('phases.savingsGoals'), amount: freeFlow * alloc.goals, percentage: (freeFlow * alloc.goals) / income, color: '#a855f7' });
  }
  if (alloc.leisure && alloc.leisure > 0) {
    allocations.push({ category: 'leisure', label: t('phases.leisure'), amount: freeFlow * alloc.leisure, percentage: (freeFlow * alloc.leisure) / income, color: '#6366f1' });
  }
  if (alloc.buffer && alloc.buffer > 0) {
    allocations.push({ category: 'buffer', label: t('phases.buffer'), amount: freeFlow * alloc.buffer, percentage: (freeFlow * alloc.buffer) / income, color: '#6b7280' });
  }

  return allocations.filter(a => a.amount > 0);
}

export function generatePhases(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  goals: Goal[],
  currentFund: number,
  debtFreeMonths: number,
  startDate = new Date()
): Phase[] {
  const t = i18n.t.bind(i18n);
  const phases: Phase[] = [];
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const essentialExpenses = expenses.filter(e => e.isEssential).reduce((s, e) => s + e.amount, 0);
  const freeFlow = Math.max(0, totalIncome - totalExpenses - totalDebtPayments);

  const highInterestDebts = debts.filter(d => d.interestRate > 0.015);
  const medInterestDebts = debts.filter(d => d.interestRate >= 0.005 && d.interestRate <= 0.015);
  const target3months = essentialExpenses * 3;

  let cursor = 0;

  // Phase 1: High interest debt elimination
  if (highInterestDebts.length > 0 && debtFreeMonths > 0) {
    const durationMonths = Math.min(debtFreeMonths, 36);
    const start = addMonths(startDate, cursor);
    const end = addMonths(startDate, cursor + durationMonths);
    phases.push({
      id: 'phase-debt-high',
      number: phases.length + 1,
      name: t('phases.eliminateHighCost'),
      description: t('phases.eliminateHighCostDesc', { count: highInterestDebts.length }),
      startMonth: formatMonthYear(start),
      endMonth: formatMonthYear(end),
      durationMonths,
      status: 'active',
      color: '#ef4444',
      objectives: [
        t('phases.objPayMinimum'),
        t('phases.objFreeFlowToDebt'),
        t('phases.objNoNewDebt'),
        t('phases.objSuspendSavings'),
      ],
      monthlyBudget: makeBudget(totalIncome, totalExpenses, totalDebtPayments, freeFlow, { debts: 0.90, buffer: 0.10 }),
    });
    cursor += durationMonths;
  }

  // Phase 2: Medium interest debt (optional)
  if (medInterestDebts.length > 0 && debtFreeMonths > cursor) {
    const remaining = debtFreeMonths - cursor;
    if (remaining > 0) {
      const start = addMonths(startDate, cursor);
      const end = addMonths(startDate, cursor + remaining);
      phases.push({
        id: 'phase-debt-med',
        number: phases.length + 1,
        name: t('phases.liquidateRemaining'),
        description: t('phases.liquidateRemainingDesc'),
        startMonth: formatMonthYear(start),
        endMonth: formatMonthYear(end),
        durationMonths: remaining,
        status: cursor === 0 && highInterestDebts.length === 0 ? 'active' : 'upcoming',
        color: '#f59e0b',
        objectives: [
          t('phases.objLiquidateRemaining'),
          t('phases.objStartEmergency20'),
          t('phases.objMaintainBuffer'),
        ],
        monthlyBudget: makeBudget(totalIncome, totalExpenses, totalDebtPayments, freeFlow, { debts: 0.70, emergency: 0.20, buffer: 0.10 }),
      });
      cursor += remaining;
    }
  }

  // Phase 3: Emergency fund
  if (currentFund < target3months) {
    const monthsToFund = freeFlow > 0 ? Math.ceil((target3months - currentFund) / (freeFlow * 0.5)) : 12;
    const start = addMonths(startDate, cursor);
    const end = addMonths(startDate, cursor + monthsToFund);
    phases.push({
      id: 'phase-emergency',
      number: phases.length + 1,
      name: t('phases.buildEmergency'),
      description: t('phases.buildEmergencyDesc', { amount: fmt(target3months) }),
      startMonth: formatMonthYear(start),
      endMonth: formatMonthYear(end),
      durationMonths: monthsToFund,
      status: cursor === 0 && debts.length === 0 ? 'active' : 'upcoming',
      color: '#22c55e',
      objectives: [
        t('phases.objSave40to50'),
        t('phases.objDontTouch'),
        t('phases.objStartLowPriority'),
      ],
      monthlyBudget: makeBudget(totalIncome, totalExpenses, 0, freeFlow, { emergency: 0.50, goals: 0.25, leisure: 0.15, buffer: 0.10 }),
    });
    cursor += monthsToFund;
  }

  // Phase 4: Goals & Growth
  const totalGoalAmount = goals.filter(g => g.category !== 'emergency_fund').reduce((s, g) => s + Math.max(0, g.targetAmount - g.currentSaved), 0);
  if (totalGoalAmount > 0 && freeFlow > 0) {
    const monthsForGoals = Math.ceil(totalGoalAmount / (freeFlow * 0.45));
    const start = addMonths(startDate, cursor);
    const end = addMonths(startDate, cursor + monthsForGoals);
    phases.push({
      id: 'phase-goals',
      number: phases.length + 1,
      name: t('phases.reachGoals'),
      description: t('phases.reachGoalsDesc', { count: goals.length }),
      startMonth: formatMonthYear(start),
      endMonth: formatMonthYear(end),
      durationMonths: monthsForGoals,
      status: 'upcoming',
      color: '#a855f7',
      objectives: goals.slice(0, 3).map(g => t('phases.objSaveForGoal', { amount: fmt(g.targetAmount - g.currentSaved), name: g.name })),
      monthlyBudget: makeBudget(totalIncome, totalExpenses, 0, freeFlow, { goals: 0.45, emergency: 0.20, leisure: 0.25, buffer: 0.10 }),
    });
    cursor += monthsForGoals;
  }

  // Phase 5: Freedom & Investment
  {
    const start = addMonths(startDate, cursor);
    const end = addMonths(startDate, cursor + 12);
    phases.push({
      id: 'phase-freedom',
      number: phases.length + 1,
      name: t('phases.freedomInvestment'),
      description: t('phases.freedomInvestmentDesc'),
      startMonth: formatMonthYear(start),
      endMonth: `${formatMonthYear(end)}+`,
      durationMonths: 12,
      status: 'upcoming',
      color: '#3b82f6',
      objectives: [
        t('phases.objInvest30to40'),
        t('phases.objComplete6Months'),
        t('phases.objPlanRetirement'),
        t('phases.objSustainableLifestyle'),
      ],
      monthlyBudget: makeBudget(totalIncome, totalExpenses, 0, freeFlow, { goals: 0.35, emergency: 0.15, leisure: 0.40, buffer: 0.10 }),
    });
  }

  // Set correct statuses
  if (phases.length > 0) {
    phases[0].status = 'active';
    for (let i = 1; i < phases.length; i++) {
      phases[i].status = 'upcoming';
    }
  }

  return phases;
}
