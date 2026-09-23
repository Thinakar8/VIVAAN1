import React from 'react';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="text-xs font-bold text-slate-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full py-2.5 px-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/30 transition-all ${className}`}
        {...props}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}
