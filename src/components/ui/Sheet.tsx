import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  title?: string;
  description?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  children,
  side = 'right',
  title,
  description,
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

  const sideClasses = {
    left: 'left-0 slide-in-from-left',
    right: 'right-0 slide-in-from-right',
  }[side];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col ${sideClasses}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </div>
    </div>
  );
};
