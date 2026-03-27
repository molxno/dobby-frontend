import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/shared/CategoryIcon';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Alert } from '../components/shared/Alert';
import {
  Target, AlertTriangle, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import type { ExpenseCategory } from '../store/types';

export function Budget() {
  const { financialState, profile } = useFinancialStore();
  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { budgetPlan } = fs;

  const chartData = budgetPlan.categories.map(c => ({
    name: c.label.length > 14 ? c.label.slice(0, 14) + '...' : c.label,
    Monto: Math.round(c.spent),
    color: c.color,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-lg font-bold text-green-400">{fmt(budgetPlan.totalIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">Ingreso Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-brand-400">{fmt(budgetPlan.totalExpenses)}</p>
          <p className="text-xs text-slate-500 mt-1">Gastos Fijos</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-red-400">{fmt(budgetPlan.totalDebtPayments)}</p>
          <p className="text-xs text-slate-500 mt-1">Deudas/mes</p>
        </Card>
        <Card className={`text-center border-${budgetPlan.freeFlow >= 0 ? 'green' : 'red'}-500/30`}>
          <p className={`text-lg font-bold ${budgetPlan.freeFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(budgetPlan.freeFlow)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Flujo Libre</p>
        </Card>
      </div>

      {/* Phase budget allocation */}
      {fs.currentPhase && (
        <Card title={`Presupuesto Fase: ${fs.currentPhase.name}`} subtitle="Distribución óptima del ingreso">
          <div className="space-y-3 mt-2">
            {budgetPlan.phaseAllocations.map(alloc => (
              <div key={alloc.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{alloc.label}</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-medium">{fmt(alloc.amount)}</span>
                    <span className="text-slate-500 text-xs ml-2">{(alloc.percentage * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={alloc.percentage * 100}
                  color={alloc.color}
                  height="h-2"
                />
              </div>
            ))}
          </div>

          {/* Savings rate */}
          <div className="mt-4 p-3 bg-surface-950/60 rounded-lg flex items-center justify-between">
            <span className="text-sm text-slate-400">Tasa de ahorro</span>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${budgetPlan.savingsRate > 0.2 ? 'text-green-400' : budgetPlan.savingsRate > 0.1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(budgetPlan.savingsRate * 100).toFixed(1)}%
              {budgetPlan.savingsRate > 0.2
                ? <Target size={14} />
                : budgetPlan.savingsRate > 0.1
                ? <AlertTriangle size={14} />
                : <AlertCircle size={14} />
              }
            </span>
          </div>
        </Card>
      )}

      {/* Category breakdown */}
      <Card title="Gastos por Categoría" subtitle="Comparación presupuestado vs real">
        <div className="space-y-3 mt-2">
          {budgetPlan.categories.map(cat => (
            <div key={cat.category} className="group">
              <div className="flex items-center gap-3 mb-1.5">
                <CategoryIcon category={cat.category as ExpenseCategory} className="text-slate-400" size={16} />
                <span className="text-sm text-slate-300 flex-1">{cat.label}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-200">{fmt(cat.spent)}</span>
                  <span className="text-xs text-slate-500 ml-1">({(cat.percentage * 100).toFixed(1)}%)</span>
                </div>
              </div>
              <ProgressBar
                value={cat.percentage * 100}
                color={cat.color}
                height="h-1.5"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Bar chart */}
      <Card title="Visualización de Gastos">
        <div className="h-56 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontSize: '12px' }}
                formatter={(value: unknown) => [fmt(Number(value)), '']}
              />
              <Bar dataKey="Monto" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recommendations */}
      {budgetPlan.recommendations.length > 0 && (
        <Card title="Recomendaciones de Optimización">
          <div className="space-y-2 mt-2">
            {budgetPlan.recommendations.map((rec, i) => (
              <Alert key={i} type="info" title={`Sugerencia ${i + 1}`} message={rec} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
