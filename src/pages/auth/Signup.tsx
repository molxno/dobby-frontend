import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, TrendingUp, ShieldCheck, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { DobbyLogo } from '../../components/shared/DobbyLogo';

export function Signup() {
  const { t } = useTranslation();

  const features = [
    { icon: TrendingUp, label: t('auth.featureSmartBudget') },
    { icon: ShieldCheck, label: t('auth.featureEmergencyFund') },
    { icon: Target, label: t('auth.featureGoalRoadmap') },
  ];
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-surface-900 rounded-2xl p-10 border border-surface-800/60 space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/15 border border-green-500/30 rounded-2xl">
              <Mail size={28} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 font-heading">{t('auth.checkEmail')}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('auth.confirmationSent', { email })}
            </p>
            <Link
              to="/auth/login"
              className="inline-block mt-2 text-sm text-brand-400 hover:text-brand-300 font-medium"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-120 xl:w-130 shrink-0 bg-surface-900 border-r border-surface-800/60 px-12 py-14">
        <div>
          <div className="flex items-center gap-3 mb-14">
            <DobbyLogo size={48} />
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-heading leading-tight">Dobby</h1>
              <p className="text-xs text-slate-500">Free Your Finances</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-100 font-heading leading-tight mb-4">
            {t('auth.signupHeadline')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            {t('auth.signupSubtext')}
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-600/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Dobby. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex mb-3">
              <DobbyLogo size={56} showWordmark />
            </div>
            <p className="text-sm text-slate-400 mt-1">{t('auth.startControlling')}</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-slate-100 font-heading">{t('auth.createAccount')}</h2>
            <p className="text-sm text-slate-400 mt-1.5">{t('auth.startControlling')}</p>
          </div>

          {/* Form card */}
          <div className="bg-surface-900 rounded-2xl p-8 border border-surface-800/60">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3.5">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.minChars')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-brand-600/20 mt-1"
              >
                {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
