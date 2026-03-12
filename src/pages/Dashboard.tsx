import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { HEALTH_LEVEL_CONFIG, CATEGORY_LABELS } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { RingChart } from '../components/shared/RingChart';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Alert } from '../components/shared/Alert';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import type { ExpenseCategory } from '../store/types';

export function Dashboard() {
  const { financialState, profile, transactions } = useFinancialStore();
  const fs = financialState;

  if (!fs) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando datos financieros...</p>
      </div>
    );
  }

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const healthCfg = HEALTH_LEVEL_CONFIG[fs.diagnosis.level];

  // Pie data for income distribution
  const pieData = fs.budgetPlan.phaseAllocations
    .filter(a => a.amount > 0)
    .map(a => ({ name: a.label, value: Math.round(a.amount), color: a.color }));

  // Mock trend data (last 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    return {
      month: month.toLocaleDateString(locale, { month: 'short' }),
      ingresos: fs.totalMonthlyIncome * (0.95 + Math.random() * 0.1),
      gastos: fs.totalMonthlyExpenses * (0.92 + Math.random() * 0.12),
    };
  });

  const quickStats = [
    {
      label: 'Ingreso Mensual',
      value: fmt(fs.totalMonthlyIncome),
      icon: '💵',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Gastos Fijos',
      value: fmt(fs.totalMonthlyExpenses),
      icon: '🏠',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Deudas/mes',
      value: fmt(fs.totalDebtPayments),
      icon: '💳',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Flujo Libre',
      value: fmt(fs.freeFlow),
      icon: '🌊',
      color: fs.freeFlow >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: fs.freeFlow >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map(stat => (
          <Card key={stat.label} className="text-center">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-xl mx-auto mb-2`}>
              {stat.icon}
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Health score + indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health score */}
        <Card className="lg:col-span-1 text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <RingChart
              value={fs.diagnosis.healthScore}
              size={160}
              strokeWidth={14}
              color={healthCfg.color}
              centerText={`${fs.diagnosis.healthScore}`}
            />
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${healthCfg.bg} ${healthCfg.text} border ${healthCfg.border}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {healthCfg.label}
              </div>
              <p className="text-xs text-gray-500 mt-2">Salud Financiera Global</p>
            </div>
          </div>

          {/* Mini indicators */}
          <div className="mt-2 space-y-3 pt-3 border-t border-gray-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Gasto/Ingreso</span>
                <span className={fs.expenseToIncomeRatio > 0.8 ? 'text-red-400' : fs.expenseToIncomeRatio > 0.65 ? 'text-yellow-400' : 'text-green-400'}>
                  {(fs.expenseToIncomeRatio * 100).toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={fs.expenseToIncomeRatio * 100}
                color={fs.expenseToIncomeRatio > 0.8 ? '#ef4444' : fs.expenseToIncomeRatio > 0.65 ? '#f59e0b' : '#22c55e'}
                height="h-1.5"
              />
            </div>
            {fs.creditUtilization !== undefined && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Utilización TC</span>
                  <span className={fs.creditUtilization > 0.5 ? 'text-red-400' : fs.creditUtilization > 0.3 ? 'text-yellow-400' : 'text-green-400'}>
                    {(fs.creditUtilization * 100).toFixed(0)}%
                  </span>
                </div>
                <ProgressBar
                  value={fs.creditUtilization * 100}
                  color={fs.creditUtilization > 0.5 ? '#ef4444' : fs.creditUtilization > 0.3 ? '#f59e0b' : '#22c55e'}
                  height="h-1.5"
                />
              </div>
            )}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Fondo emergencia</span>
                <span className={fs.emergencyFundMonths < 1 ? 'text-red-400' : fs.emergencyFundMonths < 3 ? 'text-yellow-400' : 'text-green-400'}>
                  {fs.emergencyFundMonths.toFixed(1)} meses
                </span>
              </div>
              <ProgressBar
                value={Math.min(100, (fs.emergencyFundMonths / 6) * 100)}
                color={fs.emergencyFundMonths < 1 ? '#ef4444' : fs.emergencyFundMonths < 3 ? '#f59e0b' : '#22c55e'}
                height="h-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Phase roadmap */}
        <Card className="lg:col-span-2" title="Hoja de Ruta Financiera" subtitle="Tu camino paso a paso a la libertad financiera">
          <div className="space-y-2 mt-1">
            {fs.phases.map((phase, i) => (
              <div
                key={phase.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                  phase.status === 'active' ? 'bg-gray-800 border border-gray-700' : 'opacity-60'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                      phase.status === 'completed'
                        ? 'bg-green-600 border-green-600 text-white'
                        : phase.status === 'active'
                        ? 'border-current text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}
                    style={phase.status === 'active' ? { backgroundColor: phase.color, borderColor: phase.color } : {}}
                  >
                    {phase.status === 'completed' ? '✓' : phase.number}
                  </div>
                  {i < fs.phases.length - 1 && <div className="w-0.5 h-3 bg-gray-800 mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-200">{phase.name}</p>
                    {phase.status === 'active' && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: phase.color }}>
                        ACTIVA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{phase.startMonth} → {phase.endMonth} ({phase.durationMonths} meses)</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Next step + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximo paso */}
        {fs.diagnosis.recommendations.length > 0 && (
          <Card className="border-blue-500/30 bg-blue-950/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">🎯</div>
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Próximo paso prioritario</p>
                <p className="text-sm font-semibold text-gray-100 mb-1">{fs.diagnosis.recommendations[0].title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{fs.diagnosis.recommendations[0].description}</p>
                <p className="text-xs text-green-400 mt-2 font-medium">📈 {fs.diagnosis.recommendations[0].impact}</p>
                <ul className="mt-2 space-y-1">
                  {fs.diagnosis.recommendations[0].actionSteps.slice(0, 2).map((step, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts */}
        <Card title="Alertas Activas">
          <div className="space-y-2 mt-1">
            {fs.diagnosis.alerts.slice(0, 3).map((alert, i) => (
              <Alert key={i} type={alert.type} title={alert.title} message={alert.message} action={alert.action} />
            ))}
            {fs.diagnosis.alerts.length === 0 && (
              <Alert type="success" title="Todo en orden" message="No tienes alertas activas. ¡Excelente manejo financiero!" />
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend chart */}
        <Card title="Tendencia Mensual" subtitle="Ingresos vs Gastos">
          <div className="h-48 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Allocation pie */}
        <Card title="Distribución del Ingreso" subtitle="Plan de la fase actual">
          <div className="h-48 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Debts summary */}
      {fs.debtPlan.debts.length > 0 && (
        <Card title="Resumen de Deudas" subtitle={`Estrategia ${fs.debtPlan.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'} activa`}>
          <div className="space-y-3 mt-2">
            {fs.debtPlan.debts.map(debt => {
              const progress = debt.currentBalance > 0 && debt.originalAmount
                ? ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100
                : 0;
              return (
                <div key={debt.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300 flex items-center gap-2">
                      {debt.order === 1 && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">PRIORIDAD</span>}
                      {debt.name}
                    </span>
                    <div className="text-right">
                      <span className="text-gray-400 text-xs">{fmt(debt.currentBalance)}</span>
                      <span className="text-gray-600 text-xs"> · libre {debt.payoffDate}</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={progress}
                    color={debt.order === 1 ? '#ef4444' : '#3b82f6'}
                    height="h-1.5"
                  />
                </div>
              );
            })}
            <div className="bg-gray-900/60 rounded-xl p-3 flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">Ahorras en intereses con el plan</span>
              <span className="text-sm font-bold text-green-400">{fmt(fs.debtPlan.interestSaved)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
