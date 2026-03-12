import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const LEVEL_CONFIG = {
  none: { label: 'Sin fondo', color: '#ef4444', icon: '🚨' },
  partial: { label: 'Parcial (<1 mes)', color: '#f97316', icon: '⚠️' },
  '1month': { label: '1 mes cubierto', color: '#f59e0b', icon: '🟡' },
  '3months': { label: '3 meses cubiertos', color: '#22c55e', icon: '✅' },
  '6months': { label: '6 meses cubiertos', color: '#3b82f6', icon: '🏆' },
};

export function EmergencyFund() {
  const { financialState, profile, currentFund, setCurrentFund } = useFinancialStore();
  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { emergencyPlan } = fs;

  const levelCfg = LEVEL_CONFIG[emergencyPlan.level];
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
    <div className="space-y-6">
      {/* Current level badge */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{levelCfg.icon}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Estado actual</p>
              <p className="text-lg font-bold" style={{ color: levelCfg.color }}>{levelCfg.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-100">{fmt(emergencyPlan.currentFund)}</p>
            <p className="text-xs text-gray-500">{emergencyPlan.currentMonthsCovered.toFixed(1)} meses cubiertos</p>
          </div>
        </div>
      </Card>

      {/* Update current fund */}
      <Card title="Actualizar Fondo">
        <div className="flex gap-3 items-end mt-2">
          <CurrencyInput
            value={currentFund}
            onChange={setCurrentFund}
            currency={currency}
            label="Monto actual del fondo de emergencia"
            className="flex-1"
          />
        </div>
      </Card>

      {/* Progress toward targets */}
      <Card title="Progreso hacia las Metas">
        <div className="space-y-5 mt-3">
          {/* 3 months */}
          <div>
            <div className="flex justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium text-gray-200">🎯 Meta 3 meses</span>
                <span className="text-xs text-gray-500 ml-2">(mínimo recomendado)</span>
              </div>
              <div className="text-right text-xs text-gray-400">
                <span className="font-medium text-gray-200">{fmt(emergencyPlan.currentFund)}</span>
                <span className="text-gray-600"> / {fmt(emergencyPlan.target3months)}</span>
              </div>
            </div>
            <ProgressBar value={progress3} color="#22c55e" height="h-3" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-600">{progress3.toFixed(0)}% completado</span>
              {emergencyPlan.monthsTo3 > 0 ? (
                <span className="text-green-400">
                  En {emergencyPlan.monthsTo3} meses ({formatDate(emergencyPlan.dateFor3months, locale)})
                </span>
              ) : (
                <span className="text-green-400">✅ Completado</span>
              )}
            </div>
          </div>

          {/* 6 months */}
          <div>
            <div className="flex justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium text-gray-200">🏆 Meta 6 meses</span>
                <span className="text-xs text-gray-500 ml-2">(objetivo ideal)</span>
              </div>
              <div className="text-right text-xs text-gray-400">
                <span className="font-medium text-gray-200">{fmt(emergencyPlan.currentFund)}</span>
                <span className="text-gray-600"> / {fmt(emergencyPlan.target6months)}</span>
              </div>
            </div>
            <ProgressBar value={progress6} color="#3b82f6" height="h-3" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-600">{progress6.toFixed(0)}% completado</span>
              {emergencyPlan.monthsTo6 > 0 && emergencyPlan.monthsTo6 < 999 ? (
                <span className="text-blue-400">
                  En {emergencyPlan.monthsTo6} meses ({formatDate(emergencyPlan.dateFor6months, locale)})
                </span>
              ) : emergencyPlan.monthsTo6 === 0 ? (
                <span className="text-blue-400">✅ Completado</span>
              ) : (
                <span className="text-gray-500">Requiere aumentar ahorro</span>
              )}
            </div>
          </div>
        </div>

        {/* Monthly saving info */}
        <div className="mt-4 p-3 bg-gray-900/60 rounded-xl flex justify-between">
          <span className="text-xs text-gray-400">Ahorro mensual asignado al fondo</span>
          <span className="text-xs font-semibold text-green-400">{fmt(emergencyPlan.monthlySaving)}/mes</span>
        </div>
      </Card>

      {/* What this covers */}
      <Card title="¿Qué cubre tu fondo?" subtitle="Gastos esenciales mensuales">
        <div className="mt-3 text-center">
          {/* Thermometer-style display */}
          <div className="relative mx-auto w-20 h-48 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
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
          <div className="mt-3 space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Gastos esenciales/mes</span>
              <span className="text-gray-200">{fmt(emergencyPlan.essentialExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span>Meta 3 meses</span>
              <span className="text-green-400">{fmt(emergencyPlan.target3months)}</span>
            </div>
            <div className="flex justify-between">
              <span>Meta 6 meses</span>
              <span className="text-blue-400">{fmt(emergencyPlan.target6months)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Projection chart */}
      <Card title="Proyección a 24 Meses">
        <div className="h-52 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                interval={3} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: unknown) => [fmt(Number(value)), 'Fondo']}
              />
              {emergencyPlan.target3months > 0 && (
                <ReferenceLine y={emergencyPlan.target3months} stroke="#22c55e" strokeDasharray="4 4"
                  label={{ value: '3m', fill: '#22c55e', fontSize: 10 }} />
              )}
              {emergencyPlan.target6months > 0 && (
                <ReferenceLine y={emergencyPlan.target6months} stroke="#3b82f6" strokeDasharray="4 4"
                  label={{ value: '6m', fill: '#3b82f6', fontSize: 10 }} />
              )}
              <Area type="monotone" dataKey="balance" name="Fondo" stroke="#22c55e" fill="url(#fundGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-500/20 bg-blue-950/10">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-400">¿Dónde guardar el fondo?</p>
            <ul className="mt-2 space-y-1 text-xs text-gray-400">
              <li>→ Cuenta de ahorros de alto rendimiento (CDT, DAVivienda, Bancolombia)</li>
              <li>→ Cuenta separada de la que usas día a día — que no sea fácil de gastar</li>
              <li>→ No en acciones o inversiones de alto riesgo — debe estar disponible</li>
              <li>→ Mantén mínimo 1 mes siempre, aunque estés en modo de pago de deuda</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
