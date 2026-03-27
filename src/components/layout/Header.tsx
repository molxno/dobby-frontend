import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/presupuesto': 'Presupuesto',
  '/deudas': 'Deudas',
  '/metas': 'Metas',
  '/quincenal': 'Plan Quincenal',
  '/emergencia': 'Fondo de Emergencia',
  '/transacciones': 'Transacciones',
  '/insights': 'Insights del Tutor',
  '/configuracion': 'Configuración',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { financialState, profile } = useFinancialStore();
  const { user, signOut } = useAuth();
  const title = PAGE_TITLES[location.pathname] ?? 'Dobby';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.alert('No se pudo cerrar sesión. Intenta de nuevo.');
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-surface-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-semibold text-slate-100 font-heading">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {financialState && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-500">Flujo libre:</span>
            <span className={cn('font-semibold', financialState.freeFlow >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {formatCurrency(financialState.freeFlow, profile.currency, profile.locale)}
            </span>
          </div>
        )}

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors',
              'hover:bg-surface-800 border border-transparent',
              menuOpen && 'bg-surface-800 border-surface-700'
            )}
            aria-label={profile.name ? `Abrir menú de usuario para ${profile.name}` : 'Abrir menú de usuario'}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-400">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <ChevronDown size={14} className={cn('text-slate-500 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-700 rounded-2xl shadow-xl shadow-black/40 py-2 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-surface-800">
                <p className="text-sm font-medium text-slate-100 truncate">{profile.name || 'Sin nombre'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/configuracion'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-800 hover:text-slate-100 transition-colors text-left"
                >
                  <Settings size={16} className="text-slate-500" />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
