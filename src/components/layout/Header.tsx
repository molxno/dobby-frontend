import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFinancialStore } from '../../store/useFinancialStore';
import { formatCurrency } from '../../utils/formatters';

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
  const { financialState, profile } = useFinancialStore();
  const title = PAGE_TITLES[location.pathname] ?? 'Tutor Financiero';

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {financialState && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-gray-500">Flujo libre:</span>
            <span className={`font-semibold ${financialState.freeFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(financialState.freeFlow, profile.currency, profile.locale)}
            </span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm">
          {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
        </div>
      </div>
    </header>
  );
}
