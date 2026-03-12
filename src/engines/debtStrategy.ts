import type { Debt, DebtPlan, DebtWithPlan, AmortizationRow } from '../store/types';
import { addMonths, formatMonthYear } from '../utils/formatters';

function generateAmortization(
  balance: number,
  monthlyRate: number,
  minPayment: number,
  extraPayment: number,
  startDate: Date
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let currentBalance = balance;
  let month = 0;
  const maxMonths = 600;

  while (currentBalance > 0.01 && month < maxMonths) {
    month++;
    const interest = currentBalance * monthlyRate;
    const totalPayment = Math.min(currentBalance + interest, minPayment + extraPayment);
    const principal = totalPayment - interest;
    currentBalance = Math.max(0, currentBalance - principal);
    const date = addMonths(startDate, month);

    rows.push({
      month,
      date: date.toISOString().split('T')[0],
      payment: totalPayment,
      interest,
      principal,
      balance: currentBalance,
    });
  }

  return rows;
}

function calcInterestMinimumOnly(balance: number, monthlyRate: number, minPayment: number): number {
  let b = balance;
  let totalInterest = 0;
  const maxMonths = 600;
  let month = 0;
  while (b > 0.01 && month < maxMonths) {
    month++;
    const interest = b * monthlyRate;
    totalInterest += interest;
    const payment = Math.min(b + interest, minPayment);
    const principal = payment - interest;
    b = Math.max(0, b - principal);
  }
  return totalInterest;
}

export function runDebtStrategy(
  debts: Debt[],
  freeFlow: number,
  strategy: 'avalanche' | 'snowball',
  startDate = new Date()
): DebtPlan {
  if (debts.length === 0) {
    return {
      strategy,
      debts: [],
      totalDebt: 0,
      totalMonthlyPayment: 0,
      totalInterestWithPlan: 0,
      totalInterestMinimumOnly: 0,
      interestSaved: 0,
      debtFreeDate: formatMonthYear(startDate),
      monthsToDebtFree: 0,
    };
  }

  const extraAvailable = Math.max(0, freeFlow);

  // Sort by strategy
  const sorted = [...debts].sort((a, b) =>
    strategy === 'avalanche'
      ? b.interestRate - a.interestRate
      : a.currentBalance - b.currentBalance
  );

  // Calculate total interest with minimum only (for comparison)
  const totalInterestMinimumOnly = debts.reduce(
    (sum, d) => sum + calcInterestMinimumOnly(d.currentBalance, d.interestRate, d.monthlyPayment),
    0
  );

  // Simulate cascade/snowball/avalanche payment
  // State: track remaining balance per debt
  const state = sorted.map(d => ({ ...d, remainingBalance: d.currentBalance, paid: false }));
  const amortRows: AmortizationRow[][] = state.map(() => []);
  const interestPerDebt: number[] = state.map(() => 0);
  let month = 0;
  const maxMonths = 600;
  let releasedPayment = 0;

  while (state.some(d => !d.paid) && month < maxMonths) {
    month++;
    let availableExtra = extraAvailable + releasedPayment;
    releasedPayment = 0;

    for (let i = 0; i < state.length; i++) {
      const d = state[i];
      if (d.paid) continue;

      const interest = d.remainingBalance * d.interestRate;
      interestPerDebt[i] += interest;

      let payment = d.monthlyPayment;
      // First debt in priority gets the extra
      if (i === state.findIndex(x => !x.paid)) {
        payment = Math.max(payment, d.monthlyPayment + availableExtra);
        availableExtra = 0;
      }

      const totalPayment = Math.min(d.remainingBalance + interest, payment);
      const principal = totalPayment - interest;
      d.remainingBalance = Math.max(0, d.remainingBalance - principal);

      const date = addMonths(startDate, month);
      amortRows[i].push({
        month,
        date: date.toISOString().split('T')[0],
        payment: totalPayment,
        interest,
        principal,
        balance: d.remainingBalance,
      });

      if (d.remainingBalance < 0.01) {
        d.paid = true;
        releasedPayment += d.monthlyPayment; // cascade to next
      }
    }
  }

  const result: DebtWithPlan[] = state.map((d, i) => {
    const rows = amortRows[i];
    const lastRow = rows[rows.length - 1];
    const monthsToPayoff = rows.length;
    const payoffDate = addMonths(startDate, monthsToPayoff);
    const totalInterestWithPlan = interestPerDebt[i];
    const totalInterestMin = calcInterestMinimumOnly(d.currentBalance, d.interestRate, d.monthlyPayment);

    return {
      ...sorted[i],
      order: i + 1,
      extraPayment: i === 0 ? extraAvailable : 0,
      amortization: rows,
      payoffDate: formatMonthYear(payoffDate),
      totalInterest: totalInterestWithPlan,
      monthsToPayoff,
      interestSavedVsMinimum: Math.max(0, totalInterestMin - totalInterestWithPlan),
    };
  });

  const totalInterestWithPlan = interestPerDebt.reduce((s, v) => s + v, 0);
  const maxMonthsToPayoff = Math.max(...result.map(d => d.monthsToPayoff), 0);
  const debtFreeDate = addMonths(startDate, maxMonthsToPayoff);

  return {
    strategy,
    debts: result,
    totalDebt: debts.reduce((s, d) => s + d.currentBalance, 0),
    totalMonthlyPayment: debts.reduce((s, d) => s + d.monthlyPayment, 0) + extraAvailable,
    totalInterestWithPlan,
    totalInterestMinimumOnly,
    interestSaved: Math.max(0, totalInterestMinimumOnly - totalInterestWithPlan),
    debtFreeDate: formatMonthYear(debtFreeDate),
    monthsToDebtFree: maxMonthsToPayoff,
  };
}
