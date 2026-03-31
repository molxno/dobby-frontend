import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useFinancialStore } from '../../store/useFinancialStore';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { financialState, profile } = useFinancialStore();
  const { user, signOut } = useAuth();

  const pageTitle = t(`header.pageTitles.${location.pathname}`, { defaultValue: 'Dobby' });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      console.error('Logout error:', error);
      window.alert(t('header.logoutError'));
    }
  };

  return (
    <header className="flex items-center justify-between h-17 px-6 lg:px-8 border-b border-surface-800/60 bg-surface-950/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-surface-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base font-semibold text-slate-100 font-heading">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        {financialState && (
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-surface-900/60 rounded-lg border border-surface-800/40">
            <span className="text-xs text-slate-500">{t('header.freeFlow')}</span>
            <span className={cn('text-sm font-semibold font-heading', financialState.freeFlow >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {formatCurrency(financialState.freeFlow, profile.currency, profile.locale)}
            </span>
          </div>
        )}

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors',
              'hover:bg-surface-800 border border-transparent',
              menuOpen && 'bg-surface-800 border-surface-700'
            )}
            aria-label={profile.name ? t('header.openUserMenu', { name: profile.name }) : t('header.openUserMenuDefault')}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-400">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="hidden sm:block text-sm text-slate-300 font-medium max-w-30 truncate">
              {profile.name || user?.email?.split('@')[0] || ''}
            </span>
            <ChevronDown size={14} className={cn('text-slate-500 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-900 rounded-xl shadow-xl shadow-black/40 py-2 z-50 border border-surface-800/60">
              {/* User info */}
              <div className="px-4 py-3.5 border-b border-surface-800">
                <p className="text-sm font-medium text-slate-100 truncate">{profile.name || t('common.noName')}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/configuracion'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-800 hover:text-slate-100 transition-colors text-left"
                >
                  <Settings size={16} className="text-slate-500" />
                  {t('header.settings')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut size={16} />
                  {t('header.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
