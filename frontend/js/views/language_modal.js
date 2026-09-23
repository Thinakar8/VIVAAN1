/**
 * VIVAAN Initial Language Selection Screen & Modal
 */
import { LANGUAGES, setLanguage, getLanguage, t } from '../i18n.js';
import { setView } from '../state.js';

export function renderLanguageScreen() {
  const currentLang = getLanguage();

  return `
    <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div class="w-full max-w-3xl mb-3 flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('landing')" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>${t('back')}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">VIVAAN • Multilingual Gateway</span>
      </div>
      <div class="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        
        <!-- Header with VIVAAN Logo -->
        <div class="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 sm:p-8 text-white text-center">
          <div class="flex justify-center mb-4">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-24 w-24 object-contain rounded-full shadow-lg border-2 border-amber-300 ring-2 ring-white/30" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-black mb-2">VIVAAN</h1>
          <p class="text-amber-200 text-sm font-semibold tracking-wide uppercase">Direct Farmer-to-Buyer Digital Marketplace</p>
        </div>

        <!-- Language Selector Body -->
        <div class="p-6 sm:p-10 space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold text-slate-900">${t('choose_lang')}</h2>
            <p class="text-slate-500 text-sm">${t('select_lang_sub')}</p>
          </div>

          <!-- 14 Languages Grid (English + 13 Indian Languages) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            ${LANGUAGES.map(lang => {
              const isSelected = lang.code === currentLang;
              return `
                <button
                  onclick="window.vivaanApp.selectLanguage('${lang.code}')"
                  class="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center group ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm' 
                      : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50 text-slate-700'
                  }"
                >
                  <span class="text-2xl mb-1">${lang.flag}</span>
                  <span class="text-base font-bold">${lang.native}</span>
                  <span class="text-xs text-slate-500 font-medium">${lang.name}</span>
                  ${isSelected ? `<span class="mt-2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">Selected</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Proceed / Back Buttons -->
          <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button
              onclick="window.vivaanApp.goBack('landing')"
              class="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>&larr;</span>
              <span>${t('back')}</span>
            </button>
            <button
              onclick="window.vivaanApp.confirmInitialLanguage()"
              class="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
            >
              <span>${t('continue_btn')}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}
