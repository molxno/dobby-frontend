import type { Income, Expense, Debt, Goal, Diagnosis, DiagnosisAlert, Recommendation } from '../store/types';
import i18n from '../i18n';

function fmt(amount: number, locale = 'es-CO'): string {
  return `$${Math.round(amount).toLocaleString(locale)}`;
}

export function runFinancialDiagnosis(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  goals: Goal[],
  currentFund: number
): Diagnosis {
  const t = i18n.t.bind(i18n);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const totalDebt = debts.reduce((s, d) => s + d.currentBalance, 0);
  const essentialExpenses = expenses.filter(e => e.isEssential).reduce((s, e) => s + e.amount, 0);

  const expenseRatio = totalIncome > 0 ? (totalExpenses + totalDebtPayments) / totalIncome : 1;
  const debtToIncome = totalIncome > 0 ? totalDebt / (totalIncome * 12) : 0;

  const creditCards = debts.filter(d => d.type === 'credit_card' && d.creditLimit);
  const totalCreditUsed = creditCards.reduce((s, d) => s + d.currentBalance, 0);
  const totalCreditLimit = creditCards.reduce((s, d) => s + (d.creditLimit ?? 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? totalCreditUsed / totalCreditLimit : 0;

  const fundMonths = essentialExpenses > 0 ? currentFund / essentialExpenses : 0;
  const freeFlow = totalIncome - totalExpenses - totalDebtPayments;
  const savingsRate = totalIncome > 0 ? Math.max(0, freeFlow) / totalIncome : 0;

  // Health score calculation
  let score = 100;

  // Expense ratio penalty
  if (expenseRatio > 0.95) score -= 35;
  else if (expenseRatio > 0.85) score -= 25;
  else if (expenseRatio > 0.75) score -= 15;
  else if (expenseRatio > 0.65) score -= 8;
  else if (expenseRatio > 0.55) score -= 3;

  // Debt to income penalty
  if (debtToIncome > 0.5) score -= 25;
  else if (debtToIncome > 0.35) score -= 18;
  else if (debtToIncome > 0.2) score -= 10;
  else if (debtToIncome > 0.15) score -= 5;

  // Credit utilization penalty
  if (creditUtilization > 0.8) score -= 20;
  else if (creditUtilization > 0.5) score -= 12;
  else if (creditUtilization > 0.3) score -= 6;

  // Emergency fund penalty
  if (fundMonths < 0.5) score -= 15;
  else if (fundMonths < 1) score -= 10;
  else if (fundMonths < 3) score -= 5;

  // Bonuses
  if (savingsRate > 0.2) score += 5;
  if (fundMonths >= 6) score += 5;
  if (debts.length === 0) score += 5;

  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: Diagnosis['level'];
  if (score >= 80) level = 'excellent';
  else if (score >= 65) level = 'healthy';
  else if (score >= 50) level = 'moderate';
  else if (score >= 30) level = 'warning';
  else level = 'critical';

  // Generate alerts
  const alerts: DiagnosisAlert[] = [];

  if (expenseRatio > 0.85) {
    alerts.push({
      type: 'danger',
      title: t('diagnosis.criticalExpenseRatio'),
      message: t('diagnosis.criticalExpenseMsg', { ratio: (expenseRatio * 100).toFixed(1) }),
      action: t('diagnosis.criticalExpenseAction'),
    });
  } else if (expenseRatio > 0.75) {
    alerts.push({
      type: 'warning',
      title: t('diagnosis.highExpenses'),
      message: t('diagnosis.highExpensesMsg', { ratio: (expenseRatio * 100).toFixed(1) }),
      action: t('diagnosis.highExpensesAction'),
    });
  }

  if (fundMonths < 1) {
    alerts.push({
      type: 'danger',
      title: t('diagnosis.noEmergencyFund'),
      message: fundMonths < 0.1
        ? t('diagnosis.noEmergencyFundMsg')
        : t('diagnosis.lowEmergencyFundMsg', { months: fundMonths.toFixed(1) }),
      action: t('diagnosis.buildEmergencyAction'),
    });
  } else if (fundMonths < 3) {
    alerts.push({
      type: 'warning',
      title: t('diagnosis.insufficientFund'),
      message: t('diagnosis.insufficientFundMsg', { months: fundMonths.toFixed(1) }),
    });
  }

  if (creditUtilization > 0.5) {
    alerts.push({
      type: creditUtilization > 0.8 ? 'danger' : 'warning',
      title: t('diagnosis.creditUtilization', { percent: (creditUtilization * 100).toFixed(0) }),
      message: t('diagnosis.creditUtilizationMsg', { percent: (creditUtilization * 100).toFixed(0) }),
      action: t('diagnosis.creditUtilizationAction'),
    });
  }

  const highInterestDebts = debts.filter(d => d.interestRate > 0.015);
  if (highInterestDebts.length > 0) {
    const monthlyInterest = highInterestDebts.reduce((s, d) => s + d.currentBalance * d.interestRate, 0);
    alerts.push({
      type: 'danger',
      title: t('diagnosis.highCostDebt'),
      message: t('diagnosis.highCostDebtMsg', { count: highInterestDebts.length, amount: fmt(monthlyInterest) }),
      action: t('diagnosis.highCostDebtAction'),
    });
  }

  if (freeFlow < 0) {
    alerts.push({
      type: 'danger',
      title: t('diagnosis.negativeFlow'),
      message: t('diagnosis.negativeFlowMsg', { amount: fmt(Math.abs(freeFlow)) }),
      action: t('diagnosis.negativeFlowAction'),
    });
  }

  if (savingsRate > 0.15 && debts.length === 0) {
    alerts.push({
      type: 'success',
      title: t('diagnosis.excellentSavings'),
      message: t('diagnosis.excellentSavingsMsg', { rate: (savingsRate * 100).toFixed(1) }),
    });
  }

  // Strengths
  const strengths: string[] = [];
  if (expenseRatio < 0.65) strengths.push(t('diagnosis.strengthExpenses'));
  if (fundMonths >= 3) strengths.push(t('diagnosis.strengthFund', { months: fundMonths.toFixed(1) }));
  if (savingsRate > 0.1) strengths.push(t('diagnosis.strengthSavings', { rate: (savingsRate * 100).toFixed(1) }));
  if (debts.length === 0) strengths.push(t('diagnosis.strengthNoDebt'));
  if (creditUtilization < 0.3 && creditCards.length > 0) strengths.push(t('diagnosis.strengthCreditLow'));
  if (freeFlow > totalIncome * 0.2) strengths.push(t('diagnosis.strengthFreeFlow'));

  // Weaknesses
  const weaknesses: string[] = [];
  if (expenseRatio > 0.75) weaknesses.push(t('diagnosis.weakExpenseRatio', { ratio: (expenseRatio * 100).toFixed(1) }));
  if (fundMonths < 3) weaknesses.push(t('diagnosis.weakFund', { months: fundMonths.toFixed(1) }));
  if (highInterestDebts.length > 0) weaknesses.push(t('diagnosis.weakHighCostDebt', { count: highInterestDebts.length }));
  if (creditUtilization > 0.3) weaknesses.push(t('diagnosis.weakCreditUtilization', { percent: (creditUtilization * 100).toFixed(0) }));
  if (freeFlow < totalIncome * 0.05) weaknesses.push(t('diagnosis.weakLowFreeFlow'));

  // Recommendations
  const recommendations: Recommendation[] = [];

  if (highInterestDebts.length > 0) {
    const topDebt = highInterestDebts.sort((a, b) => b.interestRate - a.interestRate)[0];
    const monthlyInterest = topDebt.currentBalance * topDebt.interestRate;
    recommendations.push({
      priority: 'high',
      title: t('diagnosis.recEliminate', { name: topDebt.name }),
      description: t('diagnosis.recEliminateDesc', { rate: (topDebt.interestRate * 100).toFixed(1), interest: fmt(monthlyInterest) }),
      impact: t('diagnosis.recEliminateImpact', {
        months: Math.ceil(topDebt.currentBalance / (freeFlow > 0 ? freeFlow : topDebt.monthlyPayment)),
        savings: fmt(topDebt.currentBalance * topDebt.interestRate * 6),
      }),
      actionSteps: [
        t('diagnosis.recEliminateStep1'),
        t('diagnosis.recEliminateStep2', { freeFlow: fmt(freeFlow > 0 ? freeFlow : 0) }),
        t('diagnosis.recEliminateStep3'),
      ],
    });
  }

  if (fundMonths < 3) {
    const monthlyToFund = essentialExpenses * 3 - currentFund;
    const monthsNeeded = freeFlow > 0 ? Math.ceil(monthlyToFund / (freeFlow * 0.4)) : 12;
    recommendations.push({
      priority: highInterestDebts.length > 0 ? 'medium' : 'high',
      title: t('diagnosis.recBuildFund'),
      description: t('diagnosis.recBuildFundDesc', { amount: fmt(essentialExpenses * 3 - currentFund) }),
      impact: t('diagnosis.recBuildFundImpact', { months: monthsNeeded }),
      actionSteps: [
        t('diagnosis.recBuildFundStep1'),
        t('diagnosis.recBuildFundStep2', { amount: fmt((freeFlow > 0 ? freeFlow : 0) * 0.4) }),
        t('diagnosis.recBuildFundStep3'),
      ],
    });
  }

  const nonEssentialFixed = expenses.filter(e => e.isFixed && !e.isEssential);
  if (nonEssentialFixed.length > 0) {
    const totalNE = nonEssentialFixed.reduce((s, e) => s + e.amount, 0);
    if (totalNE > totalIncome * 0.05) {
      recommendations.push({
        priority: 'medium',
        title: t('diagnosis.recReviewExpenses'),
        description: t('diagnosis.recReviewExpensesDesc', { amount: fmt(totalNE) }),
        impact: t('diagnosis.recReviewExpensesImpact', { amount: fmt(totalNE * 0.3) }),
        actionSteps: nonEssentialFixed.slice(0, 3).map(e => t('diagnosis.recReviewExpenseStep', { name: e.name, amount: fmt(e.amount) })),
      });
    }
  }

  return { healthScore: score, level, alerts, strengths, weaknesses, recommendations };
}
