import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Centralized polite live region for non-intrusive status notifications */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const styles =
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : toast.type === 'info'
                ? 'border-slate-200 bg-white text-slate-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950';

          const Icon =
            toast.type === 'error'
              ? AlertCircle
              : toast.type === 'info'
                ? Info
                : CheckCircle2;

          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${styles}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
