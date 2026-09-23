import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';

export default function LanguageSelectionScreen() {
  const { currentLang, setCurrentLang, LANGUAGES, setActiveView, t, addToast } = useApp();

  const handleSelectLanguage = (code, name, native) => {
    setCurrentLang(code);
    addToast('Language Selected', `${name} (${native}) activated.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onClick={() => setActiveView('welcome')} label="Back to Welcome" />
        <span className="text-xs font-bold text-slate-400">Step 1 of 2: Language Selection</span>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-900 mb-1">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Choose Your Language / भाषा चुनें
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          VIVAAN supports 14 Indian languages so farmers, buyers, agencies, and drivers can interact in their native tongue.
        </p>
      </div>

      {/* 14 Indian Languages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {LANGUAGES.map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code, lang.name, lang.native)}
              className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 select-none ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{lang.flag}</span>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                )}
              </div>
              <div>
                <div className="text-base font-black text-slate-900 leading-tight">
                  {lang.native}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {lang.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-medium">
          Selected: <b className="text-emerald-900">{LANGUAGES.find(l => l.code === currentLang)?.name} ({LANGUAGES.find(l => l.code === currentLang)?.native})</b>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => setActiveView('role_select')}
          icon={ArrowRight}
          className="w-full sm:w-auto"
        >
          Continue to Role Selection
        </Button>
      </div>

    </div>
  );
}
