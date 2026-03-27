import { useState } from 'react';
import type { Goal } from '../../store/types';
import { CurrencyInput } from '../shared/CurrencyInput';
import { nanoid } from '../shared/nanoid';
import { cn } from '../../lib/utils';
import {
  Home, Car, Plane, BookOpen, Laptop, Heart, Baby, Palmtree,
  Dumbbell, GraduationCap, PiggyBank, Building2, Target,
  ShieldCheck, Plus, X, ArrowLeft, Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const GOAL_ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: Home, label: 'Home' },
  { icon: Car, label: 'Car' },
  { icon: Plane, label: 'Plane' },
  { icon: BookOpen, label: 'BookOpen' },
  { icon: Laptop, label: 'Laptop' },
  { icon: Heart, label: 'Heart' },
  { icon: Baby, label: 'Baby' },
  { icon: Palmtree, label: 'Palmtree' },
  { icon: Dumbbell, label: 'Dumbbell' },
  { icon: GraduationCap, label: 'GraduationCap' },
  { icon: PiggyBank, label: 'PiggyBank' },
  { icon: Building2, label: 'Building2' },
  { icon: Target, label: 'Target' },
];

const GOAL_CATEGORIES: { value: Goal['category']; label: string }[] = [
  { value: 'purchase', label: 'Compra' },
  { value: 'travel', label: 'Viaje' },
  { value: 'education', label: 'Educación' },
  { value: 'housing', label: 'Vivienda' },
  { value: 'investment', label: 'Inversión' },
  { value: 'other', label: 'Otro' },
];

function getGoalIcon(iconLabel: string): LucideIcon {
  const found = GOAL_ICONS.find(g => g.label === iconLabel);
  return found?.icon ?? Target;
}

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
    icon: 'Target',
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
    setForm({ name: '', icon: 'Target', targetAmount: 0, currentSaved: 0, priority: goals.length + 2, category: 'purchase', isFlexible: true });
    setShowForm(false);
  };

  const removeGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id).map((g, i) => ({ ...g, priority: i + 1 }));
    setGoals(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100 mb-1">¿Qué quieres lograr?</h2>
        <p className="text-sm text-slate-500">Define tus metas financieras — la app las prioriza automáticamente</p>
      </div>

      {/* Emergency fund */}
      <div className="bg-green-950/30 border border-green-700/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-300">Fondo de emergencia actual</p>
            <p className="text-xs text-slate-500">¿Cuánto dinero tienes guardado como reserva?</p>
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
          {goals.map((goal, i) => {
            const GoalIcon = getGoalIcon(goal.icon);
            return (
              <div key={goal.id} className="flex items-center gap-3 bg-surface-900 border border-surface-800 rounded-2xl p-3">
                <GoalIcon className="w-5 h-5 text-brand-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{goal.name}</p>
                  <p className="text-xs text-slate-500">
                    Meta: {goal.targetAmount.toLocaleString('es-CO')} {currency}
                    {goal.currentSaved > 0 && ` · Ahorrado: ${goal.currentSaved.toLocaleString('es-CO')}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-600">#{i + 1}</span>
                  <button onClick={() => removeGoal(goal.id)} className="text-red-400 hover:text-red-300 p-1 ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add goal form */}
      {showForm ? (
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold font-heading text-slate-200">Nueva meta</h3>

          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setForm(f => ({ ...f, icon: label }))}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                    form.icon === label
                      ? 'bg-brand-600 border-2 border-brand-400'
                      : 'bg-surface-800 border border-surface-700 hover:border-surface-500'
                  )}
                >
                  <Icon className={cn('w-4 h-4', form.icon === label ? 'text-white' : 'text-slate-400')} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la meta</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Apartamento, Viaje a Europa"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Goal['category'] }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
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
            <button onClick={addGoal} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-brand-600/20">
              Agregar meta
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-xl transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-xl py-3 text-sm text-slate-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar meta
        </button>
      )}

      <div className="flex gap-3 pt-4 border-t border-surface-800">
        <button onClick={onBack} className="px-5 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm rounded-xl py-3 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          onClick={onFinish}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Generar mi plan financiero
        </button>
      </div>
    </div>
  );
}
