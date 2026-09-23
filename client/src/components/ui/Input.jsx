import React from 'react';

export default function Input({
  label,
  helperText,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  icon: Icon = null,
  ...props
}) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="text-xs font-bold text-slate-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600/30 ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${
            error
              ? 'border-rose-400 bg-rose-50/50 text-rose-950 focus:border-rose-600'
              : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-700'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
}
