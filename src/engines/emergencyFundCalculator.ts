import type { Expense, EmergencyPlan, EmergencyProjectionRow } from '../store/types';
import { addMonths } from '../utils/formatters';

export function runEmergencyFundCalculator(
  expenses: Expense[],
  monthlySaving: number,
  currentFund: number,
  startDate = new Date()
): EmergencyPlan {
  const essentialExpenses = expenses
    .filter(e => e.isEssential)
    .reduce((s, e) => s + e.amount, 0);

  const target3months = essentialExpenses * 3;
  const target6months = essentialExpenses * 6;

  const currentMonthsCovered = essentialExpenses > 0 ? currentFund / essentialExpenses : 0;

  let level: EmergencyPlan['level'];
  if (currentMonthsCovered >= 6) level = '6months';
  else if (currentMonthsCovered >= 3) level = '3months';
  else if (currentMonthsCovered >= 1) level = '1month';
  else if (currentMonthsCovered > 0) level = 'partial';
  else level = 'none';

  const saving = Math.max(0, monthlySaving);
  const monthsTo3 = saving > 0 && currentFund < target3months
    ? Math.ceil((target3months - currentFund) / saving)
    : currentFund >= target3months ? 0 : 999;

  const monthsTo6 = saving > 0 && currentFund < target6months
    ? Math.ceil((target6months - currentFund) / saving)
    : currentFund >= target6months ? 0 : 999;

  const dateFor3months = addMonths(startDate, monthsTo3).toISOString().split('T')[0];
  const dateFor6months = addMonths(startDate, monthsTo6).toISOString().split('T')[0];

  // Build projection for 24 months
  const projection: EmergencyProjectionRow[] = [];
  let balance = currentFund;
  for (let m = 0; m <= 24; m++) {
    const date = addMonths(startDate, m);
    projection.push({
      month: m,
      date: date.toISOString().split('T')[0],
      balance: Math.min(balance, target6months),
      monthsCovered: essentialExpenses > 0 ? balance / essentialExpenses : 0,
    });
    balance = Math.min(balance + saving, target6months);
  }

  return {
    currentFund,
    essentialExpenses,
    target3months,
    target6months,
    currentMonthsCovered,
    level,
    monthlySaving: saving,
    monthsTo3,
    monthsTo6,
    dateFor3months,
    dateFor6months,
    projection,
  };
}
