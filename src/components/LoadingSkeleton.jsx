import { AlertTriangle, Loader2 } from 'lucide-react';

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-4 aspect-square animate-pulse rounded-xl bg-slate-200" />
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mb-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[45dvh] flex-col items-center justify-center gap-3 px-4 py-12 text-slate-600">
      <Loader2 className="h-8 w-8 animate-spin text-[#0F4C5C]" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
