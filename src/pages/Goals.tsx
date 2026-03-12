import { useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/shared/Card';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Modal } from '../components/shared/Modal';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { nanoid } from '../components/shared/nanoid';
import type { Goal } from '../store/types';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '📚', '💻', '💍', '👶', '🏖️', '🏋️', '🎓', '💰', '🏦', '🎯'];

export function Goals() {
  const { financialState, profile, goals, addGoal, removeGoal, updateGoal, goalMode, setGoalMode } = useFinancialStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Partial<Goal>>({
    name: '', icon: '🎯', targetAmount: 0, currentSaved: 0,
    priority: goals.length + 1, category: 'purchase', isFlexible: true,
  });

  const fs = financialState;
  if (!fs) return null;

  const { currency, locale } = profile;
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const { goalPlan } = fs;

  const addGoalHandler = () => {
    if (!form.name || !form.targetAmount) return;
    addGoal({ ...form, id: nanoid(), priority: goals.length + 1 } as Goal);
    setForm({ name: '', icon: '🎯', targetAmount: 0, currentSaved: 0, priority: goals.length + 2, category: 'purchase', isFlexible: true });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-lg font-bold text-purple-400">{goalPlan.goals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Metas Activas</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold text-green-400">{fmt(goalPlan.totalMonthlySaving)}</p>
          <p className="text-xs text-gray-500 mt-1">Ahorro Mensual</p>
        </Card>
        <Card className="text-center lg:col-span-1 col-span-2">
          <p className="text-base font-bold text-blue-400">{goalPlan.startDate}</p>
          <p className="text-xs text-gray-500 mt-1">Inicio del ahorro</p>
        </Card>
      </div>

      {/* Mode selector */}
      <Card title="Modo de Ahorro">
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(['sequential', 'parallel'] as const).map(m => (
            <button
              key={m}
              onClick={() => setGoalMode(m)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                goalMode === m ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{m === 'sequential' ? '➡️' : '🔀'}</span>
                <span className="text-sm font-semibold text-gray-200">{m === 'sequential' ? 'Secuencial' : 'Paralelo'}</span>
                {goalMode === m && <span className="text-xs text-purple-400 ml-auto">ACTIVO</span>}
              </div>
              <p className="text-xs text-gray-500">
                {m === 'sequential'
                  ? 'Ahorra para una meta a la vez en orden de prioridad. Más rápido por meta.'
                  : 'Ahorra para todas las metas al mismo tiempo. Avanza en todas simultáneamente.'}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Goals list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-200">Tus Metas</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Agregar meta
          </button>
        </div>

        {goalPlan.goals.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm font-semibold text-gray-200">Sin metas definidas</p>
            <p className="text-xs text-gray-500 mt-1">Agrega tus primeras metas financieras</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Agregar primera meta
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {goalPlan.goals.map((goal, i) => (
              <Card key={goal.id} className={`${goal.status === 'saving' ? 'border-purple-500/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      goal.status === 'completed' ? 'bg-green-500/20' :
                      goal.status === 'saving' ? 'bg-purple-500/20' : 'bg-gray-800'
                    }`}>
                      {goal.icon}
                    </div>
                    <span className="text-xs text-gray-600">#{goal.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200">{goal.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.status === 'saving' ? 'bg-purple-500/20 text-purple-400' :
                        goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {goal.status === 'saving' ? 'Ahorrando' : goal.status === 'completed' ? 'Completada' : 'En espera'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span>Meta: <span className="text-gray-300">{fmt(goal.targetAmount)}</span></span>
                      {goal.currentSaved > 0 && <span>Ahorrado: <span className="text-green-400">{fmt(goal.currentSaved)}</span></span>}
                      <span>Falta: <span className="text-red-400">{fmt(goal.remaining)}</span></span>
                      {goal.monthlySaving > 0 && <span>Por mes: <span className="text-purple-400">{fmt(goal.monthlySaving)}</span></span>}
                    </div>

                    <div className="mt-2">
                      <ProgressBar
                        value={goal.progressPercent}
                        color={goal.status === 'saving' ? '#a855f7' : goal.status === 'completed' ? '#22c55e' : '#6b7280'}
                        height="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-600">{goal.progressPercent.toFixed(0)}% completado</span>
                      <span className={goal.status === 'saving' ? 'text-purple-400' : 'text-gray-500'}>
                        {goal.status === 'waiting' ? `Inicia: ${goalPlan.startDate}` : `Listo: ${goal.estimatedDate}`}
                        {goal.monthsNeeded > 0 && goal.status === 'saving' && ` (${goal.monthsNeeded} meses)`}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => removeGoal(goal.id)} className="text-red-400 hover:text-red-300 text-xs p-1 shrink-0">✕</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Context note */}
      {fs.debtPlan.monthsToDebtFree > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-950/10">
          <div className="flex items-start gap-2">
            <span className="text-lg">⏳</span>
            <div>
              <p className="text-sm font-medium text-yellow-400">Metas en espera</p>
              <p className="text-xs text-gray-500 mt-1">
                Las metas empiezan a acumularse en <strong className="text-yellow-400">{goalPlan.startDate}</strong> — cuando termines de pagar tus deudas ({fs.debtPlan.debtFreeDate}). Prioriza eliminar las deudas de alto costo primero.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nueva Meta Financiera">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                    form.icon === icon ? 'bg-purple-600 border-2 border-purple-400' : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre de la meta</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Apartamento, Viaje a Europa"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label="Costo total" value={form.targetAmount ?? 0} onChange={v => setForm(f => ({ ...f, targetAmount: v }))} currency={currency} required />
            <CurrencyInput label="Ya tienes ahorrado" value={form.currentSaved ?? 0} onChange={v => setForm(f => ({ ...f, currentSaved: v }))} currency={currency} />
          </div>
          <button onClick={addGoalHandler} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            Agregar meta
          </button>
        </div>
      </Modal>
    </div>
  );
}
