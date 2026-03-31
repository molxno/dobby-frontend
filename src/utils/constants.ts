import type { ExpenseCategory } from '../store/types';
import i18n from '../i18n';

export function getCategoryLabel(category: ExpenseCategory): string {
  return i18n.t(`categories.${category}`);
}

export function getDebtTypeLabel(type: string): string {
  return i18n.t(`debtTypes.${type}`, { defaultValue: type });
}

export function getHealthLevelLabel(level: string): string {
  return i18n.t(`healthLevels.${level}`, { defaultValue: level });
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#6366f1',
  utilities: '#06b6d4',
  food: '#f59e0b',
  transport: '#8b5cf6',
  health: '#ec4899',
  family: '#f97316',
  education: '#10b981',
  entertainment: '#818cf8',
  subscriptions: '#14b8a6',
  personal: '#84cc16',
  debt: '#ef4444',
  savings: '#22c55e',
  insurance: '#a855f7',
  other: '#64748b',
};

// Lucide icon names for each category
export const CATEGORY_ICON_NAMES: Record<ExpenseCategory, string> = {
  housing: 'Home',
  utilities: 'Zap',
  food: 'UtensilsCrossed',
  transport: 'Car',
  health: 'HeartPulse',
  family: 'Users',
  education: 'BookOpen',
  entertainment: 'Gamepad2',
  subscriptions: 'Smartphone',
  personal: 'User',
  debt: 'CreditCard',
  savings: 'PiggyBank',
  insurance: 'Shield',
  other: 'Package',
};

export const HEALTH_LEVEL_CONFIG = {
  critical: { color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  warning: { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  moderate: { color: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  healthy: { color: '#22c55e', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  excellent: { color: '#6366f1', bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/30' },
} as const;
