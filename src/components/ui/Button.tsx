import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none whitespace-nowrap shrink-0 rounded-lg';

    const variants = {
      primary:
        'bg-[#1F3A6E] text-white hover:bg-[#162a50] focus-visible:ring-[#1F3A6E] shadow-sm active:scale-[0.98]',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:ring-slate-400',
      outline:
        'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm active:scale-[0.98]',
      teal:
        'bg-[#1A9BB0] text-white hover:bg-[#158294] focus-visible:ring-[#1A9BB0] shadow-sm active:scale-[0.98]',
      orange:
        'bg-[#E8821E] text-white hover:bg-[#c96e16] focus-visible:ring-[#E8821E] shadow-sm active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-9',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
