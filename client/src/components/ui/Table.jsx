import React from 'react';

export default function Table({
  headers = [],
  children,
  emptyMessage = 'No records found.',
  isEmpty = false,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        {headers.length > 0 && (
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-3.5 sm:p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100">
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length || 1} className="p-8 text-center text-slate-400 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-slate-50/80 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`p-3.5 sm:p-4 text-slate-800 ${className}`} {...props}>
      {children}
    </td>
  );
}
