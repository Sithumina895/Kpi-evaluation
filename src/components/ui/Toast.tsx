import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { message: string; title?: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      message,
      title,
      type = 'info',
      duration = 4000,
    }: {
      message: string;
      title?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastItem = { id, title, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = 'Success') => toast({ message, title, type: 'success' }),
    [toast]
  );
  const error = useCallback(
    (message: string, title = 'Error') => toast({ message, title, type: 'error' }),
    [toast]
  );
  const info = useCallback(
    (message: string, title = 'Information') => toast({ message, title, type: 'info' }),
    [toast]
  );
  const warning = useCallback(
    (message: string, title = 'Notice') => toast({ message, title, type: 'warning' }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />,
            info: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
          };

          const borders = {
            success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900',
            error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900',
            info: 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900',
            warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900',
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200 ${
                borders[t.type || 'info']
              }`}
            >
              {icons[t.type || 'info']}
              <div className="flex-1 text-sm">
                {t.title && (
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {t.title}
                  </h4>
                )}
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
