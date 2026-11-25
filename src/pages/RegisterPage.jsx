import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormAriaSync } from '../hooks/useFormAriaSync';
import { validateEmail, validatePassword } from '../utils/validators';

export default function RegisterPage() {
  useDocumentTitle('Create Account');
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  useFormAriaSync(formRef);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const destination = location.state?.from || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }
    const passErr = validatePassword(password, { strict: true });
    if (passErr) {
      setErrorMsg(passErr);
      return;
    }

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp({ fullName, email, password });
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }
      showToast('Account created! Welcome to Velora.');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate-600">
            We sent a verification link to <strong>{email}</strong>. Confirm your email address to
            finish signing in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
            Join Velora
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Create Account</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Save favorite items, manage addresses, and track your orders.
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
            <label htmlFor="reg-name" className="mb-1 block text-sm font-bold text-slate-800">
              Full Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="reg-name"
              name="full-name"
              type="text"
              required
              autoComplete="name"
              enterKeyHint="next"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5"
            />
            <div className="velora-error-msg">Please enter your full name.</div>
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm font-bold text-slate-800">
              Email Address <span aria-hidden="true">*</span>
            </label>
            <span id="reg-email-hint" className="mb-1.5 block text-xs text-slate-500">
              Format: you@example.com
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              aria-describedby="reg-email-hint"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5"
            />
            <div className="velora-error-msg">Enter an email address like you@example.com.</div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="reg-password" className="text-sm font-bold text-slate-800">
                New Password <span aria-hidden="true">*</span>
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
            {/* Rules placed above the input so mobile keyboards / autofill popovers do not cover them */}
            <ul
              id="reg-password-rules"
              className="mb-2 list-inside list-disc text-xs text-slate-500"
            >
              <li>At least 8 characters</li>
              <li>Uppercase, lowercase, number, and special character</li>
            </ul>
            <input
              id="reg-password"
              name="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
              autoComplete="new-password"
              enterKeyHint="done"
              aria-describedby="reg-password-rules"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5"
            />
            <div className="velora-error-msg">
              Password must meet all requirements listed above.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0F4C5C] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0A3642] disabled:opacity-60"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#0F4C5C] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
