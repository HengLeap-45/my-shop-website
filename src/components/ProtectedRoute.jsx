import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from './LoadingSkeleton';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSpinner label="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Admin Access Required</h1>
        <p className="mb-6 text-slate-600">
          Your account does not have administrator privileges. Sign in with an administrator account
          to manage products, orders, and customers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to Storefront
          </Link>
          <Link
            to="/login"
            className="rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3642]"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
}
