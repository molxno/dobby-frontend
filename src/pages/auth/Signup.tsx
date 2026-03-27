import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Signup() {
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
      setError('La contraseña debe tener al menos 6 caracteres.');
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
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600/20 border border-green-500/40 rounded-2xl">
              <Mail size={24} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-heading">Revisa tu email</h2>
            <p className="text-sm text-slate-400">
              Enviamos un enlace de confirmación a <span className="text-slate-200 font-medium">{email}</span>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link
              to="/auth/login"
              className="inline-block mt-2 text-sm text-brand-400 hover:text-brand-300 font-medium"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-heading">Create Your Account</h1>
          <p className="text-sm text-slate-400 mt-1">Start taking control of your finances</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-600/20"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
