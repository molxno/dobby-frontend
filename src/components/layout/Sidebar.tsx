import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Wallet, CreditCard, Target, CalendarCheck,
  ShieldCheck, Receipt, Brain, Settings, X,
} from 'lucide-react';
import { useFinancialStore } from '../../store/useFinancialStore';
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
  const { financialState, profile } = useFinancialStore();
  const healthScore = financialState?.diagnosis.healthScore ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 65) return '#6366f1';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
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
        <ul className="space-y-0.5">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={mobile ? onClose : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all',
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

      {/* Settings */}
      <div className="px-3 py-5 border-t border-surface-800/60">
        <NavLink
          to="/configuracion"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all',
              isActive ? 'bg-brand-600/15 text-brand-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/60'
            )
          }
        >
          <Settings size={18} className="shrink-0" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
}
