import type { Goal, GoalPlan, GoalWithPlan } from '../store/types';
import { addMonths, formatMonthYear } from '../utils/formatters';

export function runGoalPlanner(
  goals: Goal[],
  monthlyBudgetForGoals: number,
  debtFreeMonths: number,
  startDate = new Date(),
  mode: 'sequential' | 'parallel' = 'sequential'
): GoalPlan {
  if (goals.length === 0 || monthlyBudgetForGoals <= 0) {
    return {
      mode,
      goals: [],
      totalMonthlySaving: 0,
      startDate: formatMonthYear(addMonths(startDate, debtFreeMonths)),
    };
  }

  const goalStartDate = addMonths(startDate, debtFreeMonths);
  const sorted = [...goals]
    .filter(g => g.category !== 'emergency_fund')
    .sort((a, b) => a.priority - b.priority);

  const result: GoalWithPlan[] = [];

  if (mode === 'sequential') {
    let cumulativeMonths = 0;
    for (let i = 0; i < sorted.length; i++) {
      const g = sorted[i];
      const remaining = Math.max(0, g.targetAmount - g.currentSaved);
      const monthsNeeded = remaining > 0 ? Math.ceil(remaining / monthlyBudgetForGoals) : 0;
      const estimatedDate = addMonths(goalStartDate, cumulativeMonths + monthsNeeded);
      const progressPercent = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 100;

      result.push({
        ...g,
        status: i === 0 && debtFreeMonths === 0 ? 'saving' : (debtFreeMonths > 0 || i > 0 ? 'waiting' : 'saving'),
        monthlySaving: i === 0 && debtFreeMonths === 0 ? monthlyBudgetForGoals : 0,
        estimatedDate: formatMonthYear(estimatedDate),
        monthsNeeded,
        progressPercent,
        remaining,
      });

      cumulativeMonths += monthsNeeded;
    }
  } else {
    // Parallel mode: divide budget among all active goals
    const perGoal = monthlyBudgetForGoals / sorted.length;
    for (const g of sorted) {
      const remaining = Math.max(0, g.targetAmount - g.currentSaved);
      const monthsNeeded = remaining > 0 && perGoal > 0 ? Math.ceil(remaining / perGoal) : 0;
      const estimatedDate = addMonths(goalStartDate, monthsNeeded);
      const progressPercent = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 100;

      result.push({
        ...g,
        status: debtFreeMonths > 0 ? 'waiting' : 'saving',
        monthlySaving: debtFreeMonths > 0 ? 0 : perGoal,
        estimatedDate: formatMonthYear(estimatedDate),
        monthsNeeded,
        progressPercent,
        remaining,
      });
    }
  }

  return {
    mode,
    goals: result,
    totalMonthlySaving: debtFreeMonths > 0 ? 0 : monthlyBudgetForGoals,
    startDate: formatMonthYear(goalStartDate),
  };
}
