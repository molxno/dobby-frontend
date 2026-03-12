import type { ExpenseCategory } from '../store/types';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Vivienda',
  utilities: 'Servicios',
  food: 'Alimentación',
  transport: 'Transporte',
  health: 'Salud',
  family: 'Familia',
  education: 'Educación',
  entertainment: 'Entretenimiento',
  subscriptions: 'Suscripciones',
  personal: 'Personal',
  debt: 'Deudas',
  savings: 'Ahorro',
  insurance: 'Seguros',
  other: 'Otros',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#3b82f6',
  utilities: '#06b6d4',
  food: '#f59e0b',
  transport: '#8b5cf6',
  health: '#ec4899',
  family: '#f97316',
  education: '#10b981',
  entertainment: '#6366f1',
  subscriptions: '#14b8a6',
  personal: '#84cc16',
  debt: '#ef4444',
  savings: '#22c55e',
  insurance: '#a855f7',
  other: '#6b7280',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  housing: '🏠',
  utilities: '💡',
  food: '🍽️',
  transport: '🚗',
  health: '🏥',
  family: '👨‍👩‍👧',
  education: '📚',
  entertainment: '🎮',
  subscriptions: '📱',
  personal: '👤',
  debt: '💳',
  savings: '💰',
  insurance: '🛡️',
  other: '📦',
};

export const DEBT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Tarjeta de Crédito',
  personal_loan: 'Préstamo Personal',
  mortgage: 'Hipoteca',
  car_loan: 'Préstamo Vehículo',
  financed_purchase: 'Compra Financiada',
  informal: 'Deuda Informal',
  other: 'Otra Deuda',
};

export const HEALTH_LEVEL_CONFIG = {
  critical: { label: 'Crítico', color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  warning: { label: 'En Riesgo', color: '#f59e0b', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  moderate: { label: 'Moderado', color: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  healthy: { label: 'Saludable', color: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  excellent: { label: 'Excelente', color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
} as const;
