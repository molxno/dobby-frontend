import type { Income, Expense, Debt, Phase, BudgetPlan, BudgetCategory, BudgetAllocation } from '../store/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/constants';
import type { ExpenseCategory } from '../store/types';

export function runBudgetOptimizer(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  currentPhase: Phase | null
): BudgetPlan {
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const freeFlow = totalIncome - totalExpenses - totalDebtPayments;
  const savingsRate = totalIncome > 0 ? Math.max(0, freeFlow) / totalIncome : 0;

  // Group expenses by category
  const categoryMap = new Map<string, number>();
  for (const exp of expenses) {
    categoryMap.set(exp.category, (categoryMap.get(exp.category) ?? 0) + exp.amount);
  }
  if (totalDebtPayments > 0) {
    categoryMap.set('debt', (categoryMap.get('debt') ?? 0) + totalDebtPayments);
  }

  const categories: BudgetCategory[] = Array.from(categoryMap.entries())
    .map(([cat, spent]) => {
      const category = cat as ExpenseCategory;
      const budgeted = cat === 'debt' ? totalDebtPayments : spent * 1.0;
      return {
        category,
        label: CATEGORY_LABELS[category] ?? cat,
        budgeted,
        spent,
        percentage: totalIncome > 0 ? spent / totalIncome : 0,
        color: CATEGORY_COLORS[category] ?? '#6b7280',
        isOverBudget: spent > budgeted * 1.05,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  // Phase allocations from current phase
  const phaseAllocations: BudgetAllocation[] = currentPhase?.monthlyBudget ?? [
    { category: 'essential', label: 'Gastos esenciales', amount: totalExpenses, percentage: totalExpenses / (totalIncome || 1), color: '#3b82f6' },
    { category: 'debt', label: 'Deudas', amount: totalDebtPayments, percentage: totalDebtPayments / (totalIncome || 1), color: '#ef4444' },
    { category: 'savings', label: 'Ahorro/metas', amount: Math.max(0, freeFlow * 0.8), percentage: (Math.max(0, freeFlow * 0.8)) / (totalIncome || 1), color: '#22c55e' },
    { category: 'buffer', label: 'Colchón', amount: Math.max(0, freeFlow * 0.2), percentage: (Math.max(0, freeFlow * 0.2)) / (totalIncome || 1), color: '#6b7280' },
  ];

  // Recommendations
  const recommendations: string[] = [];
  const highCategories = categories.filter(c => c.percentage > 0.15 && c.category !== 'housing' && c.category !== 'debt');
  for (const cat of highCategories.slice(0, 3)) {
    const saving = cat.spent * 0.2;
    recommendations.push(
      `Reducir ${cat.label} un 20% libera $${Math.round(saving).toLocaleString('es-CO')}/mes para metas prioritarias`
    );
  }
  if (freeFlow < 0) {
    recommendations.push('URGENTE: Tus gastos superan tus ingresos. Elimina gastos no esenciales inmediatamente.');
  } else if (freeFlow < totalIncome * 0.1) {
    recommendations.push('Tu flujo libre es muy bajo. Busca reducir al menos 2-3 categorías no esenciales.');
  }

  return {
    totalIncome,
    totalExpenses,
    totalDebtPayments,
    freeFlow,
    categories,
    phaseAllocations,
    savingsRate,
    recommendations,
  };
}
