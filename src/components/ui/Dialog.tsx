import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative z-50 w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col`}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {(title || description) && (
          <div className="mb-4 pr-6 shrink-0">
            {title && (
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};
