import { useState, useEffect } from 'react';
import {
  Mountain, Snowflake, ArrowRight, Shuffle, AlertTriangle,
  LogOut, RotateCcw, Trash2, UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFinancialStore } from '../store/useFinancialStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/shared/Card';
import { Modal } from '../components/shared/Modal';
import { cn } from '../lib/utils';

export function Settings() {
  const {
    profile, setProfile, incomes, expenses, debts, goals,
    setOnboardingCompleted, debtStrategy, setDebtStrategy,
    goalMode, setGoalMode,
  } = useFinancialStore();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    setLocalProfile({ ...profile });
  }, [profile]);

  const saveProfile = () => {
    setProfile(localProfile);
    alert(t('settings.profileSaved'));
  };

  const handleReset = () => {
    localStorage.removeItem('tutor-financiero-store');
    window.location.reload();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
      setLogoutError(t('settings.logoutError'));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) {
        setDeleteError(error.message);
        return;
      }
      await signOut();
    } catch (err) {
      console.error('Account deletion failed:', err);
      setDeleteError(t('settings.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Account */}
      <Card title={t('settings.account')} subtitle={t('settings.activeSession')}>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(profile.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{profile.name || t('common.noName')}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs bg-surface-800 hover:bg-surface-700 text-slate-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <LogOut size={14} />
            {loggingOut ? t('settings.loggingOut') : t('settings.logout')}
          </button>
        </div>
        {logoutError && (
          <p className="text-sm text-red-400 mt-2">{logoutError}</p>
        )}
      </Card>

      {/* Profile */}
      <Card title={t('settings.profile')} subtitle={t('settings.basicInfo')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('settings.name')}</label>
            <input
              type="text"
              value={localProfile.name}
              onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('settings.country')}</label>
            <input
              type="text"
              value={localProfile.country}
              onChange={e => setLocalProfile(p => ({ ...p, country: e.target.value }))}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('settings.currency')}</label>
            <select
              value={localProfile.currency}
              onChange={e => setLocalProfile(p => ({ ...p, currency: e.target.value }))}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            >
              <option value="COP">{t('settings.currencies.COP')}</option>
              <option value="MXN">{t('settings.currencies.MXN')}</option>
              <option value="USD">{t('settings.currencies.USD')}</option>
              <option value="EUR">{t('settings.currencies.EUR')}</option>
              <option value="ARS">{t('settings.currencies.ARS')}</option>
              <option value="CLP">{t('settings.currencies.CLP')}</option>
              <option value="PEN">{t('settings.currencies.PEN')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('settings.locale')}</label>
            <select
              value={localProfile.locale}
              onChange={e => setLocalProfile(p => ({ ...p, locale: e.target.value }))}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
            >
              <option value="es-CO">{t('settings.locales.es-CO')}</option>
              <option value="es-MX">{t('settings.locales.es-MX')}</option>
              <option value="en-US">{t('settings.locales.en-US')}</option>
              <option value="es-AR">{t('settings.locales.es-AR')}</option>
              <option value="es-CL">{t('settings.locales.es-CL')}</option>
            </select>
          </div>
        </div>
        <button
          onClick={saveProfile}
          className="mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
        >
          {t('settings.saveProfile')}
        </button>
      </Card>

      {/* Language selector */}
      <Card title={t('settings.language')} subtitle={t('settings.languageDesc')}>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {(['es', 'en'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => {
                i18n.changeLanguage(lang);
                const newLocale = lang === 'en' ? 'en-US' : 'es-CO';
                setLocalProfile(p => ({ ...p, locale: newLocale }));
                setProfile({ ...localProfile, locale: newLocale });
              }}
              className={cn(
                'p-3 rounded-lg border text-left transition-all text-sm',
                i18n.language === lang
                  ? 'border-brand-500 bg-brand-900/30 text-brand-400'
                  : 'border-surface-700 bg-surface-900 text-slate-400 hover:border-surface-600'
              )}
            >
              {t(`settings.languages.${lang}`)}
            </button>
          ))}
        </div>
      </Card>

      {/* Strategy settings */}
      <Card title={t('settings.strategies')}>
        <div className="space-y-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('settings.debtStrategy')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['avalanche', 'snowball'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setDebtStrategy(s)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all text-sm flex items-center gap-2',
                    debtStrategy === s
                      ? 'border-brand-500 bg-brand-950/30 text-brand-400'
                      : 'border-surface-700 bg-surface-900 text-slate-400 hover:border-surface-600'
                  )}
                >
                  {s === 'avalanche' ? <Mountain size={16} /> : <Snowflake size={16} />}
                  {s === 'avalanche' ? 'Avalanche' : 'Snowball'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('settings.savingsGoalMode')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['sequential', 'parallel'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setGoalMode(m)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all text-sm flex items-center gap-2',
                    goalMode === m
                      ? 'border-purple-500 bg-purple-950/30 text-purple-400'
                      : 'border-surface-700 bg-surface-900 text-slate-400 hover:border-surface-600'
                  )}
                >
                  {m === 'sequential' ? <ArrowRight size={16} /> : <Shuffle size={16} />}
                  {m === 'sequential' ? t('settings.sequential') : t('settings.parallel')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data summary */}
      <Card title={t('settings.dataSummary')}>
        <div className="mt-2 space-y-2">
          {[
            { label: t('settings.incomeSources'), value: incomes.length },
            { label: t('settings.registeredExpenses'), value: expenses.length },
            { label: t('settings.activeDebts'), value: debts.length },
            { label: t('settings.financialGoals'), value: goals.length },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-surface-800 text-sm">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-200 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <h3 className="text-sm font-semibold text-red-400 mb-3 font-heading">{t('settings.dangerZone')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">{t('settings.redoOnboarding')}</p>
              <p className="text-xs text-slate-500">{t('settings.redoOnboardingDesc')}</p>
            </div>
            <button
              onClick={() => setOnboardingCompleted(false)}
              className="text-xs bg-amber-600/20 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-600/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              {t('settings.redo')}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">{t('settings.resetLocal')}</p>
              <p className="text-xs text-slate-500">{t('settings.resetLocalDesc')}</p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-xs bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              {t('settings.reset')}
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-red-500/20">
            <div>
              <p className="text-sm text-slate-300">{t('settings.deleteAccount')}</p>
              <p className="text-xs text-slate-500">{t('settings.deleteAccountDesc')}</p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(''); }}
              className="text-xs bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-1.5"
            >
              <UserX size={12} />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={t('settings.confirmReset')} size="sm">
        <div className="text-center space-y-4">
          <AlertTriangle className="mx-auto text-amber-400" size={40} />
          <p className="text-sm text-slate-300">{t('settings.resetWarning')}</p>
          <div className="flex gap-3">
            <button onClick={() => setShowResetModal(false)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm py-2.5 rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
            <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              {t('settings.clearCache')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={t('settings.deleteAccount')} size="sm">
        <div className="space-y-4">
          <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400 font-medium">{t('settings.permanentAction')}</p>
            <p className="text-xs text-red-400/70 mt-1">
              {t('settings.deleteWarning')}
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              {t('settings.typeToConfirm', { word: t('settings.confirmWord') })}
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={t('settings.confirmWord')}
              className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-red-500/50 transition-all"
            />
          </div>

          {deleteError && (
            <p className="text-sm text-red-400">{deleteError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm py-2.5 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== t('settings.confirmWord') || deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {deleting ? t('settings.deleting') : t('settings.deleteAccount')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
