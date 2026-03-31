import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Wallet, CreditCard, Target, CalendarCheck,
  ShieldCheck, Receipt, Brain, Settings, X, LogOut, MoreHorizontal,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { DobbyLogo } from '../shared/DobbyLogo';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/presupuesto', icon: Wallet, labelKey: 'nav.budget' },
  { path: '/deudas', icon: CreditCard, labelKey: 'nav.debts' },
  { path: '/metas', icon: Target, labelKey: 'nav.goals' },
  { path: '/quincenal', icon: CalendarCheck, labelKey: 'nav.biweekly' },
  { path: '/emergencia', icon: ShieldCheck, labelKey: 'nav.emergency' },
  { path: '/transacciones', icon: Receipt, labelKey: 'nav.transactions' },
  { path: '/insights', icon: Brain, labelKey: 'nav.insights' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { financialState, profile } = useFinancialStore();
  const { user, signOut } = useAuth();
  const healthScore = financialState?.diagnosis.healthScore ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 65) return '#6366f1';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const handleNavigate = (path: string) => {
    if (mobile) onClose?.();
    navigate(path);
  };

  const handleSignOut = async () => {
    if (mobile) onClose?.();
    await signOut();
  };

  return (
    <aside className="flex flex-col h-full w-72 bg-surface-950 border-r border-surface-800/60">
      {/* Logo */}
      <div className="flex items-center gap-3.5 px-6 py-7">
        <div className="shrink-0">
          <DobbyLogo size={40} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-100 font-heading leading-tight">Dobby</h1>
          <p className="text-xs text-slate-500 truncate">
            {profile.name ? profile.name : 'Free Your Finances'}
          </p>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-surface-800 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Health Score */}
      {financialState && (
        <div className="px-5 pb-5">
          <div className="bg-surface-900 rounded-xl p-4 border border-surface-800/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{t('nav.financialHealth')}</span>
              <span className="text-sm font-bold font-heading" style={{ color: getScoreColor(healthScore) }}>
                {healthScore}<span className="text-xs font-normal text-slate-500">/100</span>
              </span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${healthScore}%`, backgroundColor: getScoreColor(healthScore) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Phase */}
      {financialState?.currentPhase && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-surface-900/60 rounded-lg border border-surface-800/40">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: financialState.currentPhase.color }} />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">{t('nav.currentPhase')}</p>
              <span className="text-xs font-medium text-slate-300 leading-tight truncate block">{financialState.currentPhase.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 mb-3 h-px bg-surface-800/60" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={mobile ? onClose : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all',
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/60'
                  )
                }
              >
                <item.icon size={18} className="shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile + settings dropdown */}
      <div className="px-3 pt-3 pb-4 border-t border-surface-800/60 mt-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm hover:bg-surface-800/60 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-400 shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-300 truncate leading-tight">
                  {profile.name || user?.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <MoreHorizontal size={16} className="text-slate-500 group-hover:text-slate-400 shrink-0 transition-colors" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              align="start"
              sideOffset={8}
              className="w-60 bg-surface-900 rounded-xl shadow-xl shadow-black/50 border border-surface-800/60 py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-surface-800 mb-1">
                <p className="text-xs font-medium text-slate-100 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <DropdownMenu.Item
                onSelect={() => handleNavigate('/configuracion')}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-800 hover:text-slate-100 cursor-pointer transition-colors outline-none mx-1 rounded-lg"
              >
                <Settings size={15} className="text-slate-500 shrink-0" />
                {t('nav.settings')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1.5 h-px bg-surface-800 mx-2" />
              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 cursor-pointer transition-colors outline-none mx-1 rounded-lg"
              >
                <LogOut size={15} className="shrink-0" />
                {t('header.logout')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}
