import type { Income, Expense, Debt, Goal, Diagnosis, DiagnosisAlert, Recommendation } from '../store/types';

export function runFinancialDiagnosis(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  goals: Goal[],
  currentFund: number
): Diagnosis {
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
      title: 'Ratio gastos/ingresos crítico',
      message: `Tus gastos representan el ${(expenseRatio * 100).toFixed(1)}% de tus ingresos. El máximo recomendado es 80%.`,
      action: 'Revisa gastos no esenciales en la sección de Presupuesto',
    });
  } else if (expenseRatio > 0.75) {
    alerts.push({
      type: 'warning',
      title: 'Gastos elevados',
      message: `Gastas el ${(expenseRatio * 100).toFixed(1)}% de tus ingresos. Intenta bajar por debajo del 75%.`,
      action: 'Identifica qué categorías puedes reducir',
    });
  }

  if (fundMonths < 1) {
    alerts.push({
      type: 'danger',
      title: 'Sin fondo de emergencia',
      message: fundMonths < 0.1
        ? 'No tienes fondo de emergencia. Un imprevisto puede afectar tus finanzas gravemente.'
        : `Solo tienes ${fundMonths.toFixed(1)} meses de gastos como fondo de emergencia.`,
      action: 'Construye un fondo de emergencia de al menos 3 meses',
    });
  } else if (fundMonths < 3) {
    alerts.push({
      type: 'warning',
      title: 'Fondo de emergencia insuficiente',
      message: `Tienes ${fundMonths.toFixed(1)} meses cubiertos. Se recomiendan 3-6 meses.`,
    });
  }

  if (creditUtilization > 0.5) {
    alerts.push({
      type: creditUtilization > 0.8 ? 'danger' : 'warning',
      title: `Utilización de TC: ${(creditUtilization * 100).toFixed(0)}%`,
      message: `Estás usando el ${(creditUtilization * 100).toFixed(0)}% del cupo de tus tarjetas de crédito. Esto afecta tu historial crediticio.`,
      action: 'Prioriza pagar el saldo de tus tarjetas',
    });
  }

  const highInterestDebts = debts.filter(d => d.interestRate > 0.015);
  if (highInterestDebts.length > 0) {
    const maxRate = Math.max(...highInterestDebts.map(d => d.interestRate));
    const monthlyInterest = highInterestDebts.reduce((s, d) => s + d.currentBalance * d.interestRate, 0);
    alerts.push({
      type: 'danger',
      title: `Deuda de alto costo detectada`,
      message: `Tienes ${highInterestDebts.length} deuda(s) con tasas superiores al 1.5%/mes. Te cuestan $${Math.round(monthlyInterest).toLocaleString('es-CO')}/mes en intereses.`,
      action: 'Activa el plan de pago agresivo para eliminarlas primero',
    });
  }

  if (freeFlow < 0) {
    alerts.push({
      type: 'danger',
      title: 'Flujo negativo',
      message: `Tus gastos y deudas superan tus ingresos en $${Math.abs(Math.round(freeFlow)).toLocaleString('es-CO')}/mes.`,
      action: 'Necesitas reducir gastos o aumentar ingresos urgentemente',
    });
  }

  if (savingsRate > 0.15 && debts.length === 0) {
    alerts.push({
      type: 'success',
      title: '¡Excelente tasa de ahorro!',
      message: `Estás ahorrando el ${(savingsRate * 100).toFixed(1)}% de tus ingresos. Considera invertir el excedente.`,
    });
  }

  // Strengths
  const strengths: string[] = [];
  if (expenseRatio < 0.65) strengths.push('Controlas bien tus gastos — estás por debajo del 65% del ingreso');
  if (fundMonths >= 3) strengths.push(`Tienes ${fundMonths.toFixed(1)} meses de fondo de emergencia`);
  if (savingsRate > 0.1) strengths.push(`Estás ahorrando el ${(savingsRate * 100).toFixed(1)}% de tus ingresos`);
  if (debts.length === 0) strengths.push('No tienes deudas — tienes total libertad financiera en gastos');
  if (creditUtilization < 0.3 && creditCards.length > 0) strengths.push('Utilizas menos del 30% del cupo de tus tarjetas');
  if (freeFlow > totalIncome * 0.2) strengths.push('Tienes un flujo libre saludable para construir patrimonio');

  // Weaknesses
  const weaknesses: string[] = [];
  if (expenseRatio > 0.75) weaknesses.push(`Ratio gasto/ingreso de ${(expenseRatio * 100).toFixed(1)}% — 5+ puntos sobre el máximo`);
  if (fundMonths < 3) weaknesses.push(`Fondo de emergencia: solo ${fundMonths.toFixed(1)} de 3 meses recomendados`);
  if (highInterestDebts.length > 0) weaknesses.push(`${highInterestDebts.length} deuda(s) de alto costo activas`);
  if (creditUtilization > 0.3) weaknesses.push(`Utilización de TC al ${(creditUtilization * 100).toFixed(0)}%`);
  if (freeFlow < totalIncome * 0.05) weaknesses.push('Poco flujo libre para imprevistos y metas');

  // Recommendations
  const recommendations: Recommendation[] = [];

  if (highInterestDebts.length > 0) {
    const topDebt = highInterestDebts.sort((a, b) => b.interestRate - a.interestRate)[0];
    const monthlyInterest = topDebt.currentBalance * topDebt.interestRate;
    recommendations.push({
      priority: 'high',
      title: `Elimina "${topDebt.name}" primero`,
      description: `Esta deuda tiene una tasa del ${(topDebt.interestRate * 100).toFixed(1)}%/mes y te cuesta $${Math.round(monthlyInterest).toLocaleString('es-CO')}/mes solo en intereses.`,
      impact: `Pagándola en ${Math.ceil(topDebt.currentBalance / (freeFlow > 0 ? freeFlow : topDebt.monthlyPayment))} meses ahorras $${Math.round(topDebt.currentBalance * topDebt.interestRate * 6).toLocaleString('es-CO')} en intereses`,
      actionSteps: [
        'Activa el plan avalanche en la sección de Deudas',
        `Destina todo tu flujo libre ($${Math.round(freeFlow > 0 ? freeFlow : 0).toLocaleString('es-CO')}) a esta deuda`,
        'Suspende temporalmente otros ahorros hasta liquidarla',
      ],
    });
  }

  if (fundMonths < 3) {
    const monthlyToFund = essentialExpenses * 3 - currentFund;
    const monthsNeeded = freeFlow > 0 ? Math.ceil(monthlyToFund / (freeFlow * 0.4)) : 12;
    recommendations.push({
      priority: highInterestDebts.length > 0 ? 'medium' : 'high',
      title: 'Construye tu fondo de emergencia',
      description: `Necesitas $${Math.round(essentialExpenses * 3 - currentFund).toLocaleString('es-CO')} más para tener 3 meses cubiertos.`,
      impact: `En ${monthsNeeded} meses tendrás 3 meses de respaldo financiero`,
      actionSteps: [
        'Abre una cuenta de ahorros dedicada solo al fondo de emergencia',
        `Transfiere automáticamente $${Math.round((freeFlow > 0 ? freeFlow : 0) * 0.4).toLocaleString('es-CO')}/mes`,
        'No toques este dinero salvo emergencias reales',
      ],
    });
  }

  const nonEssentialFixed = expenses.filter(e => e.isFixed && !e.isEssential);
  if (nonEssentialFixed.length > 0) {
    const totalNE = nonEssentialFixed.reduce((s, e) => s + e.amount, 0);
    if (totalNE > totalIncome * 0.05) {
      recommendations.push({
        priority: 'medium',
        title: 'Revisa gastos fijos no esenciales',
        description: `Tienes $${Math.round(totalNE).toLocaleString('es-CO')}/mes en gastos fijos no esenciales (gimnasio, suscripciones, etc.).`,
        impact: `Reducir un 30% libera $${Math.round(totalNE * 0.3).toLocaleString('es-CO')}/mes para objetivos prioritarios`,
        actionSteps: nonEssentialFixed.slice(0, 3).map(e => `Evalúa si puedes reducir o eliminar: ${e.name} ($${Math.round(e.amount).toLocaleString('es-CO')}/mes)`),
      });
    }
  }

  return { healthScore: score, level, alerts, strengths, weaknesses, recommendations };
}
