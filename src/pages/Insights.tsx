import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { HEALTH_LEVEL_CONFIG } from '../utils/constants';
import { Card } from '../components/shared/Card';
import { Alert } from '../components/shared/Alert';
import { ProgressBar } from '../components/shared/ProgressBar';
import { RingChart } from '../components/shared/RingChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function Insights() {
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
    <div className="space-y-6">
      {/* Tutor intro */}
      <Card className="border-blue-500/30 bg-blue-950/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">🧠</div>
          <div>
            <p className="text-base font-bold text-blue-300">Análisis del Tutor Financiero</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Basado en tu situación actual, aquí está mi diagnóstico completo y el plan de acción más efectivo para tu caso.
            </p>
          </div>
        </div>
      </Card>

      {/* Health score breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Puntuación de Salud Financiera">
          <div className="flex items-center gap-6 mt-3">
            <RingChart
              value={diagnosis.healthScore}
              size={140}
              strokeWidth={12}
              color={healthCfg.color}
              centerText={`${diagnosis.healthScore}`}
            />
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${healthCfg.bg} ${healthCfg.text} border ${healthCfg.border} mb-3`}>
                {healthCfg.label}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Gasto/Ingreso</span>
                    <span className={fs.expenseToIncomeRatio > 0.8 ? 'text-red-400' : 'text-yellow-400'}>{(fs.expenseToIncomeRatio * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={fs.expenseToIncomeRatio * 100} color={fs.expenseToIncomeRatio > 0.8 ? '#ef4444' : '#f59e0b'} height="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Endeudamiento</span>
                    <span className={fs.debtToIncomeRatio > 0.35 ? 'text-red-400' : 'text-yellow-400'}>{(fs.debtToIncomeRatio * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={fs.debtToIncomeRatio * 100} color={fs.debtToIncomeRatio > 0.35 ? '#ef4444' : '#f59e0b'} height="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Fondo emergencia</span>
                    <span className={fs.emergencyFundMonths < 3 ? 'text-red-400' : 'text-green-400'}>{fs.emergencyFundMonths.toFixed(1)} meses</span>
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
              <span className="text-xl">🎯</span>
              <p className="text-sm font-bold text-orange-300">Acción Más Importante AHORA</p>
            </div>
            <p className="text-base font-semibold text-gray-100 mb-2">{diagnosis.recommendations[0].title}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{diagnosis.recommendations[0].description}</p>
            <div className="mt-3 p-2.5 bg-green-950/40 border border-green-700/40 rounded-lg">
              <p className="text-xs text-green-400 font-medium">📈 Impacto: {diagnosis.recommendations[0].impact}</p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {diagnosis.recommendations[0].actionSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-orange-400 font-bold mt-0.5">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Fortalezas" className="border-green-500/20">
          {diagnosis.strengths.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">Trabajando en identificar fortalezas...</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {diagnosis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Áreas de Mejora" className="border-red-500/20">
          {diagnosis.weaknesses.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">¡Sin debilidades detectadas!</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {diagnosis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-0.5">→</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* All recommendations */}
      {diagnosis.recommendations.length > 1 && (
        <Card title="Plan de Acción Completo" subtitle="Ordenado por prioridad e impacto">
          <div className="space-y-4 mt-3">
            {diagnosis.recommendations.map((rec, i) => (
              <div key={i} className={`border rounded-xl p-4 ${
                rec.priority === 'high' ? 'border-red-500/30 bg-red-950/10' :
                rec.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-950/10' :
                'border-gray-700 bg-gray-900'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {rec.priority === 'high' ? '🔴 Alta' : rec.priority === 'medium' ? '🟡 Media' : '🟢 Baja'} prioridad
                  </span>
                  <span className="text-xs text-gray-600">Acción #{i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-gray-100">{rec.title}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rec.description}</p>
                <p className="text-xs text-green-400 mt-2">📈 {rec.impact}</p>
                <ul className="mt-2 space-y-1">
                  {rec.actionSteps.map((step, j) => (
                    <li key={j} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-gray-600 mt-0.5">→</span>
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
      <Card title="Todas las Alertas">
        <div className="space-y-2 mt-2">
          {diagnosis.alerts.map((alert, i) => (
            <Alert key={i} type={alert.type} title={alert.title} message={alert.message} action={alert.action} />
          ))}
          {diagnosis.alerts.length === 0 && (
            <Alert type="success" title="Sin alertas activas" message="Tu situación financiera está en buen estado." />
          )}
        </div>
      </Card>

      {/* Net worth projection */}
      <Card title="Proyección a 24 Meses" subtitle="Evolución de tu patrimonio neto">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: unknown) => [fmt(Number(value)), '']}
              />
              <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{v}</span>} />
              <Area type="monotone" dataKey="ahorro" name="Ahorros" stroke="#22c55e" fill="url(#savGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="patrimonio" name="Patrimonio Neto" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key metrics comparison */}
      <Card title="Métricas Clave vs Objetivos">
        <div className="mt-2 space-y-3">
          {[
            {
              label: 'Ratio Gasto/Ingreso',
              current: `${(fs.expenseToIncomeRatio * 100).toFixed(1)}%`,
              target: '< 75%',
              ok: fs.expenseToIncomeRatio < 0.75,
            },
            {
              label: 'Tasa de Ahorro',
              current: `${(fs.savingsRate * 100).toFixed(1)}%`,
              target: '> 20%',
              ok: fs.savingsRate > 0.2,
            },
            {
              label: 'Fondo de Emergencia',
              current: `${fs.emergencyFundMonths.toFixed(1)} meses`,
              target: '3-6 meses',
              ok: fs.emergencyFundMonths >= 3,
            },
            {
              label: 'Ratio Deuda/Ingreso Anual',
              current: `${(fs.debtToIncomeRatio * 100).toFixed(1)}%`,
              target: '< 35%',
              ok: fs.debtToIncomeRatio < 0.35,
            },
          ].map(m => (
            <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-900">
              <span className="text-sm text-gray-400">{m.label}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-300 font-medium">{m.current}</span>
                <span className="text-gray-600 text-xs">meta: {m.target}</span>
                <span className={m.ok ? 'text-green-400' : 'text-red-400'}>{m.ok ? '✓' : '✗'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
