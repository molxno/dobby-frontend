import { useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';

export function Settings() {
  const {
    profile, setProfile, incomes, expenses, debts, goals,
    setOnboardingCompleted, debtStrategy, setDebtStrategy,
    goalMode, setGoalMode,
  } = useFinancialStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [localProfile, setLocalProfile] = useState({ ...profile });

  const saveProfile = () => {
    setProfile(localProfile);
    alert('Perfil guardado correctamente');
  };

  const handleReset = () => {
    localStorage.removeItem('tutor-financiero-store');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card title="Perfil" subtitle="Tu información básica">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
            <input
              type="text"
              value={localProfile.name}
              onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">País</label>
            <input
              type="text"
              value={localProfile.country}
              onChange={e => setLocalProfile(p => ({ ...p, country: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Moneda</label>
            <select
              value={localProfile.currency}
              onChange={e => setLocalProfile(p => ({ ...p, currency: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="COP">COP - Peso colombiano</option>
              <option value="MXN">MXN - Peso mexicano</option>
              <option value="USD">USD - Dólar americano</option>
              <option value="EUR">EUR - Euro</option>
              <option value="ARS">ARS - Peso argentino</option>
              <option value="CLP">CLP - Peso chileno</option>
              <option value="PEN">PEN - Sol peruano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Locale</label>
            <select
              value={localProfile.locale}
              onChange={e => setLocalProfile(p => ({ ...p, locale: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="es-CO">es-CO (Colombia)</option>
              <option value="es-MX">es-MX (México)</option>
              <option value="en-US">en-US (EEUU)</option>
              <option value="es-AR">es-AR (Argentina)</option>
              <option value="es-CL">es-CL (Chile)</option>
            </select>
          </div>
        </div>
        <button
          onClick={saveProfile}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          Guardar perfil
        </button>
      </Card>

      {/* Strategy settings */}
      <Card title="Estrategias de Pago">
        <div className="space-y-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estrategia de Deuda</label>
            <div className="grid grid-cols-2 gap-2">
              {(['avalanche', 'snowball'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setDebtStrategy(s)}
                  className={`p-3 rounded-xl border text-left transition-all text-sm ${
                    debtStrategy === s ? 'border-blue-500 bg-blue-950/30 text-blue-400' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {s === 'avalanche' ? '⛰️ Avalanche' : '❄️ Snowball'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Modo de Ahorro para Metas</label>
            <div className="grid grid-cols-2 gap-2">
              {(['sequential', 'parallel'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setGoalMode(m)}
                  className={`p-3 rounded-xl border text-left transition-all text-sm ${
                    goalMode === m ? 'border-purple-500 bg-purple-950/30 text-purple-400' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {m === 'sequential' ? '➡️ Secuencial' : '🔀 Paralelo'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data summary */}
      <Card title="Resumen de Datos">
        <div className="mt-2 space-y-2">
          {[
            { label: 'Fuentes de ingreso', value: incomes.length },
            { label: 'Gastos registrados', value: expenses.length },
            { label: 'Deudas activas', value: debts.length },
            { label: 'Metas financieras', value: goals.length },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-gray-800 text-sm">
              <span className="text-gray-400">{item.label}</span>
              <span className="text-gray-200 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <h3 className="text-sm font-semibold text-red-400 mb-3">Zona de Peligro</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Re-hacer onboarding</p>
              <p className="text-xs text-gray-500">Edita tus datos iniciales manteniendo historial</p>
            </div>
            <button
              onClick={() => setOnboardingCompleted(false)}
              className="text-xs bg-yellow-600/20 border border-yellow-500/40 text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-600/30 transition-colors"
            >
              Re-hacer
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Resetear toda la app</p>
              <p className="text-xs text-gray-500">Borra todos los datos permanentemente</p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-xs bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Resetear
            </button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Confirmar Reset" size="sm">
        <div className="text-center space-y-4">
          <p className="text-3xl">⚠️</p>
          <p className="text-sm text-gray-300">¿Seguro que quieres borrar todos los datos? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2.5 rounded-xl transition-colors">
              Cancelar
            </button>
            <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
              Sí, borrar todo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
