import { useTranslation } from 'react-i18next';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { HEALTH_LEVEL_CONFIG, getHealthLevelLabel } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { RingChart } from '../components/shared/RingChart';
import { ProgressBar } from '../components/shared/ProgressBar';
import {
  Banknote, Home, CreditCard, Waves, TrendingUp, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function Dashboard() {
  const { t } = useTranslation();
  const { financialState, profile } = useFinancialStore();
  const fs = financialState;

  if (!fs) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">{t('dashboard.loading')}</p>
      </div>
    );
  }

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const healthCfg = HEALTH_LEVEL_CONFIG[fs.diagnosis.level];

  const pieData = fs.budgetPlan.phaseAllocations
    .filter(a => a.amount > 0)
    .map(a => ({ name: a.label, value: Math.round(a.amount), color: a.color }));

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
    { label: t('dashboard.monthlyIncome'), value: fmt(fs.totalMonthlyIncome), icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('dashboard.fixedExpenses'), value: fmt(fs.totalMonthlyExpenses), icon: Home, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: t('dashboard.debtsPerMonth'), value: fmt(fs.totalDebtPayments), icon: CreditCard, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: t('dashboard.freeFlow'), value: fmt(fs.freeFlow), icon: Waves, color: fs.freeFlow >= 0 ? 'text-emerald-400' : 'text-red-400', bg: fs.freeFlow >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(stat => {
          const IconComp = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <IconComp className={stat.color} size={20} />
                </div>
                <div className="min-w-0">
                  <p className={`text-lg font-bold font-heading ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Health score + Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health score — compact */}
        <Card>
          <div className="flex flex-col items-center gap-4 py-4">
            <RingChart
              value={fs.diagnosis.healthScore}
              size={140}
              strokeWidth={12}
              color={healthCfg.color}
              centerText={`${fs.diagnosis.healthScore}`}
            />
            <div className="text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${healthCfg.bg} ${healthCfg.text}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {getHealthLevelLabel(fs.diagnosis.level)}
              </div>
              <p className="text-xs text-slate-500 mt-3">{t('dashboard.financialHealth')}</p>
            </div>
          </div>

          {/* Key ratios */}
          <div className="space-y-4 pt-5 mt-2 border-t border-surface-800/40">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{t('dashboard.expenseIncome')}</span>
                <span className={fs.expenseToIncomeRatio > 0.8 ? 'text-red-400' : fs.expenseToIncomeRatio > 0.65 ? 'text-amber-400' : 'text-emerald-400'}>
                  {(fs.expenseToIncomeRatio * 100).toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={fs.expenseToIncomeRatio * 100} color={fs.expenseToIncomeRatio > 0.8 ? '#ef4444' : fs.expenseToIncomeRatio > 0.65 ? '#f59e0b' : '#22c55e'} height="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{t('dashboard.emergencyFund')}</span>
                <span className={fs.emergencyFundMonths < 1 ? 'text-red-400' : fs.emergencyFundMonths < 3 ? 'text-amber-400' : 'text-emerald-400'}>
                  {fs.emergencyFundMonths.toFixed(1)} {t('dashboard.months')}
                </span>
              </div>
              <ProgressBar value={Math.min(100, (fs.emergencyFundMonths / 6) * 100)} color={fs.emergencyFundMonths < 1 ? '#ef4444' : fs.emergencyFundMonths < 3 ? '#f59e0b' : '#22c55e'} height="h-1.5" />
            </div>
          </div>
        </Card>

        {/* Trend chart */}
        <Card className="lg:col-span-2" title={t('dashboard.monthlyTrend')} subtitle={t('dashboard.incomeVsExpenses')}>
          <div className="h-56 mt-4">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                />
                <Area type="monotone" dataKey="ingresos" name={t('dashboard.income')} stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="gastos" name={t('dashboard.expenses')} stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Current phase + Income distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current phase — compact */}
        {fs.currentPhase && (
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 font-heading">{t('dashboard.currentPhase')}</h3>
                <p className="text-xs text-slate-500 mt-1">{fs.currentPhase.name}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: fs.currentPhase.color }}>
                {fs.currentPhase.number}
              </div>
            </div>

            {/* Phase progress timeline — minimal */}
            <div className="flex items-center gap-2 mb-5">
              {fs.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="flex-1 h-2 rounded-full"
                  style={{
                    backgroundColor: phase.status === 'completed' ? '#22c55e'
                      : phase.status === 'active' ? phase.color
                      : '#1e293b'
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500">
              {fs.currentPhase.startMonth} → {fs.currentPhase.endMonth} · {fs.currentPhase.durationMonths} {t('dashboard.months')}
            </p>

            {/* Quick recommendation */}
            {fs.diagnosis.recommendations.length > 0 && (
              <div className="mt-5 pt-5 border-t border-surface-800/40">
                <div className="flex items-start gap-3">
                  <TrendingUp size={16} className="text-brand-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200">{fs.diagnosis.recommendations[0].title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{fs.diagnosis.recommendations[0].impact}</p>
                  </div>
                </div>
                <Link to="/insights" className="mt-4 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium">
                  {t('dashboard.viewFullPlan')} <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </Card>
        )}

        {/* Allocation pie */}
        <Card title={t('dashboard.incomeDistribution')} subtitle={t('dashboard.currentPhasePlan')}>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
