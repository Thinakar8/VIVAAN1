import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon = null,
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98 cursor-pointer rounded-2xl';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5 font-black',
  };

  const variantStyles = {
    primary: 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-md shadow-emerald-900/10 hover:shadow-lg',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
    accent: 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20 font-black',
    outline: 'bg-transparent hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    sky: 'bg-sky-700 hover:bg-sky-800 text-white shadow-md'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
