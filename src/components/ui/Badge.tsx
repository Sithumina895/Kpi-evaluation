import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'teal' | 'orange' | 'purple' | 'blue';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const base =
    'inline-flex items-center font-medium rounded-md tracking-tight transition-colors whitespace-nowrap shrink-0 border';

  const variants = {
    default:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    secondary:
      'bg-slate-200/70 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300',
    outline:
      'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    teal:
      'bg-teal-50 text-[#1A9BB0] border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    orange:
      'bg-amber-50 text-[#E8821E] border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    purple:
      'bg-purple-50 text-[#6B3FA0] border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    blue:
      'bg-blue-50 text-[#2F5FAF] border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
};
