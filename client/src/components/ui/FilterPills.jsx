import React from 'react';

export default function FilterPills({
  categories = [],
  activeCategory,
  onSelect,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 max-w-full ${className}`}>
      {categories.map((cat) => {
        const isSelected = activeCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
