import { useTranslation } from 'react-i18next';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { HEALTH_LEVEL_CONFIG, getHealthLevelLabel } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { Alert } from '../components/shared/Alert';
import { ProgressBar } from '../components/shared/ProgressBar';
import { RingChart } from '../components/shared/RingChart';
import { cn } from '../lib/utils';
import {
  Brain, Target, Circle, TrendingUp, Check, ArrowRight, X as XIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function Insights() {
  const { t } = useTranslation();
  const { financialState, profile } = useFinancialStore();
  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { diagnosis, debtPlan, budgetPlan, phases, currentPhase } = fs;
  const healthCfg = HEALTH_LEVEL_CONFIG[diagnosis.level];

  // Patrimony projection (net worth over time)
  const netWorthData = Array.from({ length: 24 }, (_, m) => {
    const debtRemaining = Math.max(0, debtPlan.totalDebt - (debtPlan.totalDebt / Math.max(1, debtPlan.monthsToDebtFree)) * m);
    const savingsAccumulated = Math.max(0, fs.freeFlow) * m * 0.6;
    return {
      month: `M${m}`,
      patrimonio: Math.round(savingsAccumulated - debtRemaining),
      deuda: Math.round(-debtRemaining),
      ahorro: Math.round(savingsAccumulated),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Tutor intro */}
      <Card className="border-brand-500/30 bg-brand-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <p className="text-base font-heading font-bold text-brand-300">{t('insights.title')}</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {t('insights.subtitle')}
            </p>
          </div>
        </div>
      </Card>

      {/* Health score breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('insights.healthScore')}>
          <div className="flex items-center gap-6 mt-3">
            <RingChart
              value={diagnosis.healthScore}
              size={140}
              strokeWidth={12}
              color={healthCfg.color}
              centerText={`${diagnosis.healthScore}`}
            />
            <div className="flex-1">
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3 border',
                healthCfg.bg, healthCfg.text, healthCfg.border
              )}>
                {getHealthLevelLabel(diagnosis.level)}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{t('insights.expenseIncome')}</span>
                    <span className={fs.expenseToIncomeRatio > 0.8 ? 'text-red-400' : 'text-yellow-400'}>{(fs.expenseToIncomeRatio * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={fs.expenseToIncomeRatio * 100} color={fs.expenseToIncomeRatio > 0.8 ? '#ef4444' : '#f59e0b'} height="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{t('insights.debtRatio')}</span>
                    <span className={fs.debtToIncomeRatio > 0.35 ? 'text-red-400' : 'text-yellow-400'}>{(fs.debtToIncomeRatio * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={fs.debtToIncomeRatio * 100} color={fs.debtToIncomeRatio > 0.35 ? '#ef4444' : '#f59e0b'} height="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{t('insights.emergencyFund')}</span>
                    <span className={fs.emergencyFundMonths < 3 ? 'text-red-400' : 'text-green-400'}>{fs.emergencyFundMonths.toFixed(1)} {t('insights.months')}</span>
                  </div>
                  <ProgressBar value={Math.min(100, (fs.emergencyFundMonths / 6) * 100)} color={fs.emergencyFundMonths < 3 ? '#ef4444' : '#22c55e'} height="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next step */}
        {diagnosis.recommendations.length > 0 && (
          <Card className="border-orange-500/30 bg-orange-950/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-orange-400" size={20} />
              <p className="text-sm font-bold text-orange-300">{t('insights.mostImportantAction')}</p>
            </div>
            <p className="text-base font-semibold text-slate-100 mb-2">{diagnosis.recommendations[0].title}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{diagnosis.recommendations[0].description}</p>
            <div className="mt-3 p-2.5 bg-green-950/40 border border-green-700/40 rounded-lg flex items-center gap-2">
              <TrendingUp className="text-green-400 shrink-0" size={14} />
              <p className="text-xs text-green-400 font-medium">{t('insights.impact', { impact: diagnosis.recommendations[0].impact })}</p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {diagnosis.recommendations[0].actionSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-orange-400 font-bold mt-0.5">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('insights.strengths')} className="border-green-500/20">
          {diagnosis.strengths.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">{t('insights.identifyingStrengths')}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {diagnosis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="text-green-400 shrink-0 mt-0.5" size={14} />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={t('insights.weaknesses')} className="border-red-500/20">
          {diagnosis.weaknesses.length === 0 ? (
            <p className="text-sm text-slate-400 mt-2">{t('insights.noWeaknesses')}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {diagnosis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <ArrowRight className="text-red-400 shrink-0 mt-0.5" size={14} />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* All recommendations */}
      {diagnosis.recommendations.length > 1 && (
        <Card title={t('insights.actionPlan')} subtitle={t('insights.actionPlanSubtitle')}>
          <div className="space-y-4 mt-3">
            {diagnosis.recommendations.map((rec, i) => (
              <div key={i} className={cn(
                'border rounded-lg p-4',
                rec.priority === 'high' ? 'border-red-500/30 bg-red-950/10' :
                rec.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-950/10' :
                'border-surface-700 bg-surface-900'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1',
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-surface-700 text-slate-400'
                  )}>
                    <Circle
                      className={cn(
                        'shrink-0',
                        rec.priority === 'high' ? 'text-red-400 fill-red-400' :
                        rec.priority === 'medium' ? 'text-yellow-400 fill-yellow-400' :
                        'text-green-400 fill-green-400'
                      )}
                      size={8}
                    />
                    {rec.priority === 'high' ? t('insights.priorityHigh') : rec.priority === 'medium' ? t('insights.priorityMedium') : t('insights.priorityLow')}
                  </span>
                  <span className="text-xs text-slate-500">{t('insights.action', { number: i + 1 })}</span>
                </div>
                <p className="text-sm font-semibold text-slate-100">{rec.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="text-green-400 shrink-0" size={12} />
                  <p className="text-xs text-green-400">{rec.impact}</p>
                </div>
                <ul className="mt-2 space-y-1">
                  {rec.actionSteps.map((step, j) => (
                    <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <ArrowRight className="text-slate-600 shrink-0 mt-0.5" size={10} />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      <Card title={t('insights.allAlerts')}>
        <div className="space-y-2 mt-2">
          {diagnosis.alerts.map((alert, i) => (
            <Alert key={i} type={alert.type} title={alert.title} message={alert.message} action={alert.action} />
          ))}
          {diagnosis.alerts.length === 0 && (
            <Alert type="success" title={t('insights.noAlerts')} message={t('insights.noAlertsDescription')} />
          )}
        </div>
      </Card>

      {/* Net worth projection */}
      <Card title={t('insights.projection24')} subtitle={t('insights.netWorthEvolution')}>
        <div className="h-52 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontSize: '12px' }}
                formatter={(value: unknown) => [fmt(Number(value)), '']}
              />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>} />
              <Area type="monotone" dataKey="ahorro" name={t('insights.savingsLabel')} stroke="#22c55e" fill="url(#savGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="patrimonio" name={t('insights.netWorth')} stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key metrics comparison */}
      <Card title={t('insights.keyMetrics')}>
        <div className="mt-2 space-y-3">
          {[
            {
              label: t('insights.expenseIncomeRatio'),
              current: `${(fs.expenseToIncomeRatio * 100).toFixed(1)}%`,
              target: '< 75%',
              ok: fs.expenseToIncomeRatio < 0.75,
            },
            {
              label: t('insights.savingsRate'),
              current: `${(fs.savingsRate * 100).toFixed(1)}%`,
              target: '> 20%',
              ok: fs.savingsRate > 0.2,
            },
            {
              label: t('insights.emergencyFundLabel'),
              current: `${fs.emergencyFundMonths.toFixed(1)} ${t('insights.months')}`,
              target: `3-6 ${t('insights.months')}`,
              ok: fs.emergencyFundMonths >= 3,
            },
            {
              label: t('insights.debtAnnualRatio'),
              current: `${(fs.debtToIncomeRatio * 100).toFixed(1)}%`,
              target: '< 35%',
              ok: fs.debtToIncomeRatio < 0.35,
            },
          ].map(m => (
            <div key={m.label} className="flex items-center justify-between py-2 border-b border-surface-900">
              <span className="text-sm text-slate-400">{m.label}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-300 font-medium">{m.current}</span>
                <span className="text-slate-500 text-xs">{t('insights.goalTarget', { target: m.target })}</span>
                {m.ok ? (
                  <Check className="text-green-400" size={14} />
                ) : (
                  <XIcon className="text-red-400" size={14} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
