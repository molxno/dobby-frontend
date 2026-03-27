import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-heading">Recover Password</h1>
          <p className="text-sm text-slate-400 mt-1">We'll send you a link to reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600/20 border border-green-500/40 rounded-2xl">
                <Mail size={24} className="text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100 font-heading">Link Sent</h2>
              <p className="text-sm text-slate-400">
                If an account exists for <span className="text-slate-200 font-medium">{email}</span>,
                you'll receive a link to reset your password.
              </p>
              <Link
                to="/auth/login"
                className="inline-block mt-2 text-sm text-brand-400 hover:text-brand-300 font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-600/20"
              >
                {loading ? 'Sending...' : 'Send link'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-5">
          <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
