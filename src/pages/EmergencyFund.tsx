import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { cn } from '../lib/utils';
import {
  AlertCircle, AlertTriangle, CircleDot, CheckCircle2, Trophy,
  Target, Lightbulb, ArrowRight, CheckCheck,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const LEVEL_CONFIG = {
  none: { label: 'No fund', color: '#ef4444', Icon: AlertCircle },
  partial: { label: 'Partial (<1 month)', color: '#f97316', Icon: AlertTriangle },
  '1month': { label: '1 month covered', color: '#f59e0b', Icon: CircleDot },
  '3months': { label: '3 months covered', color: '#22c55e', Icon: CheckCircle2 },
  '6months': { label: '6 months covered', color: '#3b82f6', Icon: Trophy },
};

export function EmergencyFund() {
  const { financialState, profile, currentFund, setCurrentFund } = useFinancialStore();
  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { emergencyPlan } = fs;

  const levelCfg = LEVEL_CONFIG[emergencyPlan.level];
  const LevelIcon = levelCfg.Icon;
  const progress3 = emergencyPlan.target3months > 0
    ? Math.min(100, (emergencyPlan.currentFund / emergencyPlan.target3months) * 100)
    : 0;
  const progress6 = emergencyPlan.target6months > 0
    ? Math.min(100, (emergencyPlan.currentFund / emergencyPlan.target6months) * 100)
    : 0;

  const chartData = emergencyPlan.projection.map(row => ({
    date: new Date(row.date).toLocaleDateString(locale, { month: 'short', year: '2-digit' }),
    balance: Math.round(row.balance),
    meses: parseFloat(row.monthsCovered.toFixed(1)),
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Current level badge */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${levelCfg.color}20` }}
            >
              <LevelIcon style={{ color: levelCfg.color }} size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Current status</p>
              <p className="text-lg font-heading font-bold" style={{ color: levelCfg.color }}>{levelCfg.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-100">{fmt(emergencyPlan.currentFund)}</p>
            <p className="text-xs text-slate-500">{emergencyPlan.currentMonthsCovered.toFixed(1)} months covered</p>
          </div>
        </div>
      </Card>

      {/* Update current fund */}
      <Card title="Update Fund">
        <div className="flex gap-3 items-end mt-2">
          <CurrencyInput
            value={currentFund}
            onChange={setCurrentFund}
            currency={currency}
            label="Current emergency fund amount"
            className="flex-1"
          />
        </div>
      </Card>

      {/* Progress toward targets */}
      <Card title="Progress Toward Goals">
        <div className="space-y-5 mt-3">
          {/* 3 months */}
          <div>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target className="text-green-400" size={14} />
                <span className="text-sm font-medium text-slate-200">3-month goal</span>
                <span className="text-xs text-slate-500 ml-1">(minimum recommended)</span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span className="font-medium text-slate-200">{fmt(emergencyPlan.currentFund)}</span>
                <span className="text-slate-500"> / {fmt(emergencyPlan.target3months)}</span>
              </div>
            </div>
            <ProgressBar value={progress3} color="#22c55e" height="h-3" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-500">{progress3.toFixed(0)}% completed</span>
              {emergencyPlan.monthsTo3 > 0 ? (
                <span className="text-green-400">
                  In {emergencyPlan.monthsTo3} months ({formatDate(emergencyPlan.dateFor3months, locale)})
                </span>
              ) : (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCheck size={12} /> Completed
                </span>
              )}
            </div>
          </div>

          {/* 6 months */}
          <div>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Trophy className="text-blue-400" size={14} />
                <span className="text-sm font-medium text-slate-200">6-month goal</span>
                <span className="text-xs text-slate-500 ml-1">(ideal target)</span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span className="font-medium text-slate-200">{fmt(emergencyPlan.currentFund)}</span>
                <span className="text-slate-500"> / {fmt(emergencyPlan.target6months)}</span>
              </div>
            </div>
            <ProgressBar value={progress6} color="#3b82f6" height="h-3" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-500">{progress6.toFixed(0)}% completed</span>
              {emergencyPlan.monthsTo6 > 0 && emergencyPlan.monthsTo6 < 999 ? (
                <span className="text-blue-400">
                  In {emergencyPlan.monthsTo6} months ({formatDate(emergencyPlan.dateFor6months, locale)})
                </span>
              ) : emergencyPlan.monthsTo6 === 0 ? (
                <span className="text-blue-400 flex items-center gap-1">
                  <CheckCheck size={12} /> Completed
                </span>
              ) : (
                <span className="text-slate-500">Requires increased savings</span>
              )}
            </div>
          </div>
        </div>

        {/* Monthly saving info */}
        <div className="mt-4 p-3 bg-surface-900/60 rounded-lg flex justify-between">
          <span className="text-xs text-slate-400">Monthly savings allocated to fund</span>
          <span className="text-xs font-semibold text-green-400">{fmt(emergencyPlan.monthlySaving)}/mo</span>
        </div>
      </Card>

      {/* What this covers */}
      <Card title="What does your fund cover?" subtitle="Essential monthly expenses">
        <div className="mt-3 text-center">
          {/* Thermometer-style display */}
          <div className="relative mx-auto w-20 h-48 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700"
              style={{
                height: `${Math.min(100, progress6)}%`,
                backgroundColor: levelCfg.color,
                opacity: 0.8,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{emergencyPlan.currentMonthsCovered.toFixed(1)}m</span>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Essential expenses/mo</span>
              <span className="text-slate-200">{fmt(emergencyPlan.essentialExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span>3-month goal</span>
              <span className="text-green-400">{fmt(emergencyPlan.target3months)}</span>
            </div>
            <div className="flex justify-between">
              <span>6-month goal</span>
              <span className="text-blue-400">{fmt(emergencyPlan.target6months)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Projection chart */}
      <Card title="24-Month Projection">
        <div className="h-52 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontSize: '12px' }}
                formatter={(value: unknown) => [fmt(Number(value)), 'Fund']}
              />
              {emergencyPlan.target3months > 0 && (
                <ReferenceLine y={emergencyPlan.target3months} stroke="#22c55e" strokeDasharray="4 4"
                  label={{ value: '3m', fill: '#22c55e', fontSize: 10 }} />
              )}
              {emergencyPlan.target6months > 0 && (
                <ReferenceLine y={emergencyPlan.target6months} stroke="#3b82f6" strokeDasharray="4 4"
                  label={{ value: '6m', fill: '#3b82f6', fontSize: 10 }} />
              )}
              <Area type="monotone" dataKey="balance" name="Fund" stroke="#22c55e" fill="url(#fundGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="border-brand-500/20 bg-brand-500/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
            <Lightbulb className="text-brand-400" size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-400">Where to keep your fund?</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <ArrowRight className="text-slate-500 shrink-0 mt-0.5" size={12} />
                High-yield savings account (separate from daily spending)
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="text-slate-500 shrink-0 mt-0.5" size={12} />
                A separate account from your everyday use — hard to spend impulsively
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="text-slate-500 shrink-0 mt-0.5" size={12} />
                Not in stocks or high-risk investments — it must be readily available
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="text-slate-500 shrink-0 mt-0.5" size={12} />
                Keep at least 1 month always, even while paying off debt
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
