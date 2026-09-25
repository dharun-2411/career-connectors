import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    cyan: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

