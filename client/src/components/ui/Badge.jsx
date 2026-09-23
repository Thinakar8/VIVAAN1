import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    verified: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    pending: 'bg-amber-100 text-amber-900 border-amber-300',
    in_transit: 'bg-purple-100 text-purple-900 border-purple-300',
    delivered: 'bg-teal-100 text-teal-900 border-teal-300',
    organic: 'bg-emerald-800 text-white border-emerald-700',
    state: 'bg-sky-100 text-sky-950 border-sky-300',
    district: 'bg-amber-100 text-amber-950 border-amber-300',
    local: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    danger: 'bg-rose-100 text-rose-900 border-rose-300'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs font-black'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wide rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
