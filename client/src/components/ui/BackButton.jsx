import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label = 'Back', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 text-xs font-black shadow-xs transition-all transform hover:-translate-x-0.5 cursor-pointer ${className}`}
      title="Go Back"
    >
      <ArrowLeft className="w-4 h-4 text-emerald-800" />
      <span>{label}</span>
    </button>
  );
}
