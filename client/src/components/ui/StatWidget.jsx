import React from 'react';

export default function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon = null,
  trend = null,
  color = 'emerald',
  className = ''
}) {
  const colorMap = {
    emerald: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    sky: 'text-sky-800 bg-sky-50 border-sky-200',
    purple: 'text-purple-800 bg-purple-50 border-purple-200',
    slate: 'text-slate-800 bg-slate-50 border-slate-200',
  };

  return (
    <div className={`bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>
      {trend && (
        <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
          {trend}
        </div>
      )}
    </div>
  );
}
