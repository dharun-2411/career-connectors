import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 focus:ring-indigo-500',
    accent: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-purple-600/30 focus:ring-purple-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-sm hover:border-slate-300 focus:ring-indigo-500',
    outline: 'bg-transparent hover:bg-indigo-50/60 text-indigo-600 border border-indigo-200 hover:border-indigo-400 focus:ring-indigo-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25 focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 focus:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    pill: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-full font-semibold',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

