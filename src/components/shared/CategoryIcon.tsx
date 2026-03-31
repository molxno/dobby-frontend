import {
  Home, Zap, UtensilsCrossed, Car, HeartPulse, Users, BookOpen,
  Gamepad2, Smartphone, User, CreditCard, PiggyBank, Shield, Package,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategory } from '../../store/types';

const ICON_MAP: Record<ExpenseCategory, LucideIcon> = {
  housing: Home,
  utilities: Zap,
  food: UtensilsCrossed,
  transport: Car,
  health: HeartPulse,
  family: Users,
  education: BookOpen,
  entertainment: Gamepad2,
  subscriptions: Smartphone,
  personal: User,
  debt: CreditCard,
  savings: PiggyBank,
  insurance: Shield,
  other: Package,
};

interface CategoryIconProps {
  category: ExpenseCategory | string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ category, className = '', size = 16 }: CategoryIconProps) {
  const Icon = ICON_MAP[category as ExpenseCategory] ?? Package;
  return <Icon className={className} size={size} />;
}
