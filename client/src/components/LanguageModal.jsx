import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, Globe } from 'lucide-react';

export default function LanguageModal() {
  const {
    currentLang,
    setCurrentLang,
    LANGUAGES,
    showLangModal,
    setShowLangModal,
    t,
    addToast
  } = useApp();

  if (!showLangModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20">
              <Globe className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">{t('choose_lang')}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Support for 14 Indian Languages across all portals
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLangModal(false)}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code);
                  addToast('Language Updated', `Interface language changed to ${lang.name} (${lang.native})`);
                  setShowLangModal(false);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{lang.flag}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-950 leading-tight">
                    {lang.native}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {lang.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>🌾 VIVAAN Multilingual Indian Agritech Engine</span>
          <button
            onClick={() => setShowLangModal(false)}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
          >
            {t('continue_btn')}
          </button>
        </div>

      </div>
    </div>
  );
}
