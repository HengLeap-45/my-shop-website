import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormAriaSync } from '../hooks/useFormAriaSync';

export default function LoginPage() {
  useDocumentTitle('Sign In');
  const { signIn, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  useFormAriaSync(formRef);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const destination = location.state?.from || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const profile = await signIn(email, password);
      showToast(`Welcome back, ${profile?.full_name || profile?.email}!`);
      navigate(profile?.role === 'admin' && destination === '/account' ? '/admin' : destination, {
        replace: true,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@velora-demo.com');
      setPassword('DemoPass123!');
    } else {
      setEmail('customer@velora-demo.com');
      setPassword('DemoPass123!');
    }
    setErrorMsg('');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
            Velora Account
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Sign In</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Access your orders, saved addresses, and favorites.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-bold text-slate-800">
              Email Address <span aria-hidden="true">*</span>
            </label>
            <span id="login-email-hint" className="mb-1.5 block text-xs text-slate-500">
              Format: you@example.com
            </span>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              aria-describedby="login-email-hint"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5"
            />
            <div className="velora-error-msg">Enter a valid email address.</div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-bold text-slate-800">
                Password <span aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C5C] hover:underline"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide password
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Show password
                  </>
                )}
              </button>
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="current-password"
              enterKeyHint="done"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5"
            />
            <div className="velora-error-msg">Password must be at least 6 characters.</div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0F4C5C] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0A3642] disabled:opacity-60"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {isDemoMode && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-[#F5F3EE] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Demo Mode Accounts
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Supabase is not configured. Quick-fill a local demo account to test customer or admin
              features:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('customer')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#0F4C5C]" aria-hidden="true" />
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                Demo Admin
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          New to Velora?{' '}
          <Link to="/register" className="font-bold text-[#0F4C5C] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
