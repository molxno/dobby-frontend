import { NavLink, useLocation } from 'react-router-dom';
import { useFinancialStore } from '../../store/useFinancialStore';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/presupuesto', icon: '💰', label: 'Presupuesto' },
  { path: '/deudas', icon: '💳', label: 'Deudas' },
  { path: '/metas', icon: '🎯', label: 'Metas' },
  { path: '/quincenal', icon: '📅', label: 'Plan Quincenal' },
  { path: '/emergencia', icon: '🛡️', label: 'Emergencia' },
  { path: '/transacciones', icon: '📝', label: 'Transacciones' },
  { path: '/insights', icon: '🧠', label: 'Insights' },
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
    if (score >= 65) return '#3b82f6';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <aside className={`flex flex-col h-full bg-gray-950 border-r border-gray-800 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-lg">💎</div>
        <div>
          <h1 className="text-sm font-bold text-gray-100">Tutor Financiero</h1>
          <p className="text-xs text-gray-500">{profile.name || 'Mi Cuenta'}</p>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-300 p-1">✕</button>
        )}
      </div>

      {/* Health Score */}
      {financialState && (
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="bg-gray-900 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Salud Financiera</span>
              <span className="text-sm font-bold" style={{ color: getScoreColor(healthScore) }}>
                {healthScore}/100
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Fase actual</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: financialState.currentPhase.color }} />
            <span className="text-xs font-medium text-gray-300 leading-tight">{financialState.currentPhase.name}</span>
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-3 py-3 border-t border-gray-800">
        <NavLink
          to="/configuracion"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`
          }
        >
          <span className="text-base">⚙️</span>
          <span>Configuración</span>
        </NavLink>
      </div>
    </aside>
  );
}
