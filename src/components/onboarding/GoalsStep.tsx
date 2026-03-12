import { useState } from 'react';
import type { Goal } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { nanoid } from '../shared/nanoid';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '📚', '💻', '💍', '👶', '🏖️', '🏋️', '🎓', '💰', '🏦'];
const GOAL_CATEGORIES: { value: Goal['category']; label: string }[] = [
  { value: 'purchase', label: 'Compra' },
  { value: 'travel', label: 'Viaje' },
  { value: 'education', label: 'Educación' },
  { value: 'housing', label: 'Vivienda' },
  { value: 'investment', label: 'Inversión' },
  { value: 'other', label: 'Otro' },
];

interface GoalsStepProps {
  goals: Goal[];
  setGoals: (v: Goal[]) => void;
  currentFund: number;
  setCurrentFund: (v: number) => void;
  currency: string;
  onBack: () => void;
  onFinish: () => void;
}

export function GoalsStep({ goals, setGoals, currentFund, setCurrentFund, currency, onBack, onFinish }: GoalsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Goal>>({
    name: '',
    icon: '🎯',
    targetAmount: 0,
    currentSaved: 0,
    priority: goals.length + 1,
    category: 'purchase',
    isFlexible: true,
  });

  const addGoal = () => {
    if (!form.name || !form.targetAmount || form.targetAmount <= 0) return;
    const newGoal: Goal = { ...form, id: nanoid(), priority: goals.length + 1 } as Goal;
    setGoals([...goals, newGoal]);
    setForm({ name: '', icon: '🎯', targetAmount: 0, currentSaved: 0, priority: goals.length + 2, category: 'purchase', isFlexible: true });
    setShowForm(false);
  };

  const removeGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id).map((g, i) => ({ ...g, priority: i + 1 }));
    setGoals(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">¿Qué quieres lograr?</h2>
        <p className="text-sm text-gray-500">Define tus metas financieras — la app las prioriza automáticamente</p>
      </div>

      {/* Emergency fund */}
      <div className="bg-green-950/30 border border-green-700/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛡️</span>
          <div>
            <p className="text-sm font-medium text-green-300">Fondo de emergencia actual</p>
            <p className="text-xs text-gray-500">¿Cuánto dinero tienes guardado como reserva?</p>
          </div>
        </div>
        <CurrencyInput
          value={currentFund}
          onChange={setCurrentFund}
          currency={currency}
          placeholder="0"
        />
      </div>

      {/* Goals list */}
      {goals.length > 0 && (
        <div className="space-y-2">
          {goals.map((goal, i) => (
            <div key={goal.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
              <span className="text-xl">{goal.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">{goal.name}</p>
                <p className="text-xs text-gray-500">
                  Meta: {goal.targetAmount.toLocaleString('es-CO')} {currency}
                  {goal.currentSaved > 0 && ` · Ahorrado: ${goal.currentSaved.toLocaleString('es-CO')}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">#{i + 1}</span>
                <button onClick={() => removeGoal(goal.id)} className="text-red-400 hover:text-red-300 text-xs p-1 ml-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add goal form */}
      {showForm ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">Nueva meta</h3>

          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                    form.icon === icon ? 'bg-blue-600 border-2 border-blue-400' : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre de la meta</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Apartamento, Viaje a Europa"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Goal['category'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              >
                {GOAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CurrencyInput
              label="Costo total"
              value={form.targetAmount ?? 0}
              onChange={v => setForm(f => ({ ...f, targetAmount: v }))}
              currency={currency}
              required
            />
            <CurrencyInput
              label="Ya tienes ahorrado"
              value={form.currentSaved ?? 0}
              onChange={v => setForm(f => ({ ...f, currentSaved: v }))}
              currency={currency}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={addGoal} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Agregar meta
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl py-3 text-sm text-gray-500 hover:text-purple-400 transition-colors"
        >
          + Agregar meta
        </button>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button onClick={onBack} className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl py-3 transition-colors">
          ← Atrás
        </button>
        <button
          onClick={onFinish}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          🚀 Generar mi plan financiero
        </button>
      </div>
    </div>
  );
}
