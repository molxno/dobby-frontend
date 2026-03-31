import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DobbyLogo } from '../../components/shared/DobbyLogo';
import { useAuth } from '../../contexts/AuthContext';

const features = [
  { icon: TrendingUp, label: 'Smart budget planning' },
  { icon: ShieldCheck, label: 'Emergency fund tracking' },
  { icon: Target, label: 'Goal-based financial roadmap' },
];

export function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? t('auth.invalidCredentials')
        : error.message);
    }
    setLoading(false);
  };

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
            Take control of your money.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Dobby gives you a clear, personalized roadmap to get out of debt, build your emergency fund, and reach your financial goals.
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
            <h1 className="text-2xl font-bold text-slate-100 font-heading sr-only">Dobby</h1>
            <p className="text-sm text-slate-400 mt-1">{t('auth.slogan')}</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-slate-100 font-heading">{t('auth.login')}</h2>
            <p className="text-sm text-slate-400 mt-1.5">{t('auth.slogan')}</p>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">{t('auth.password')}</label>
                  <Link to="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-surface-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 ring-1 ring-surface-700/50 focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-brand-600/20 mt-1"
              >
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              {t('auth.signUpFree')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
