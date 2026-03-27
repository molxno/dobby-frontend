import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, CreditCard, Target, CalendarCheck,
  ShieldCheck, Receipt, Brain, Settings, X, Sparkles,
} from 'lucide-react';
import { useFinancialStore } from '../../store/useFinancialStore';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/presupuesto', icon: Wallet, label: 'Presupuesto' },
  { path: '/deudas', icon: CreditCard, label: 'Deudas' },
  { path: '/metas', icon: Target, label: 'Metas' },
  { path: '/quincenal', icon: CalendarCheck, label: 'Plan Quincenal' },
  { path: '/emergencia', icon: ShieldCheck, label: 'Emergencia' },
  { path: '/transacciones', icon: Receipt, label: 'Transacciones' },
  { path: '/insights', icon: Brain, label: 'Insights' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
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
    <aside className={cn(
      'flex flex-col h-full bg-surface-950 border-r border-surface-800',
      mobile ? 'w-72' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-800">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
          <Sparkles className="text-white" size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-heading">Dobby</h1>
          <p className="text-xs text-slate-500">{profile.name || 'Free Your Finances'}</p>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Health Score */}
      {financialState && (
        <div className="px-4 py-3 border-b border-surface-800">
          <div className="bg-surface-900 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Salud Financiera</span>
              <span className="text-sm font-bold font-heading" style={{ color: getScoreColor(healthScore) }}>
                {healthScore}/100
              </span>
            </div>
            <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
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
        <div className="px-4 py-3 border-b border-surface-800">
          <p className="text-xs text-slate-500 mb-1">Fase actual</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: financialState.currentPhase.color }} />
            <span className="text-xs font-medium text-slate-300 leading-tight">{financialState.currentPhase.name}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={mobile ? onClose : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/50'
                  )
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-3 py-3 border-t border-surface-800">
        <NavLink
          to="/configuracion"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              isActive ? 'bg-brand-600/15 text-brand-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/50'
            )
          }
        >
          <Settings size={18} />
          <span>Configuración</span>
        </NavLink>
      </div>
    </aside>
  );
}
