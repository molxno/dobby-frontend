import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DobbyLogo } from '../../components/shared/DobbyLogo';

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.passwordMinError'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex mb-5">
            <DobbyLogo size={56} showWordmark />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-heading mt-2">{t('auth.newPassword')}</h1>
          <p className="text-sm text-slate-400 mt-1.5">{t('auth.enterNewPassword')}</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 rounded-xl p-8">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600/20 border border-green-500/40 rounded-lg">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100 font-heading">{t('auth.passwordUpdated')}</h2>
              <p className="text-sm text-slate-400">
                {t('auth.passwordUpdatedDesc')}
              </p>
              <button
                onClick={() => navigate('/', { replace: true })}
                className="inline-block mt-2 text-sm text-brand-400 hover:text-brand-300 font-medium"
              >
                {t('auth.goToDashboard')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-950/50 border border-red-500/40 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.newPasswordPlaceholder')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.minChars')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-surface-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.repeatPassword')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
              >
                {loading ? t('auth.updating') : t('auth.updatePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
