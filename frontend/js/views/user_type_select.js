/**
 * VIVAAN User Type Selection View
 */
import { t } from '../i18n.js';

export function renderUserTypeSelect() {
  return `
    <div class="min-h-[75vh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-8">
      
      <!-- Back Button -->
      ${window.vivaanApp ? window.vivaanApp.renderBackButton('landing', 'Home') : `
        <div class="mb-4">
          <button onclick="window.vivaanApp.goBack('landing')" class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold shadow-sm">
            <span>&larr;</span> <span>${t('back')}</span>
          </button>
        </div>
      `}

      <div class="w-full space-y-8">
        
        <!-- Header -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Step 2 of 2: Persona Selection
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-slate-900">${t('user_type_heading')}</h1>
          <p class="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">${t('user_type_sub')}</p>
        </div>

        <!-- 3 Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Option 1: Farmer -->
          <div 
            onclick="window.vivaanApp.navigateTo('farmer_register')"
            class="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
          >
            <div class="space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🌾
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  ${t('role_farmer')}
                </h3>
                <span class="inline-block px-2.5 py-0.5 mt-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                  Sell Produce Directly
                </span>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">
                ${t('role_farmer_desc')} Verified digital ID, no commissions to agents, direct bank payouts.
              </p>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-bold text-sm">
              <span>Register as Farmer</span>
              <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          <!-- Option 2: Delivery Agency -->
          <div 
            onclick="window.vivaanApp.navigateTo('agency_register')"
            class="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-amber-600 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
          >
            <div class="space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  ${t('role_agency')}
                </h3>
                <span class="inline-block px-2.5 py-0.5 mt-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                  Logistics & Transport
                </span>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">
                ${t('role_agency_desc')} Local, District & State level certification with automated route orders.
              </p>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-amber-700 font-bold text-sm">
              <span>Register Agency</span>
              <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          <!-- Option 3: Buyer -->
          <div 
            onclick="window.vivaanApp.navigateTo('buyer_marketplace')"
            class="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
          >
            <div class="space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🛒
              </div>
              <div>
                <h3 class="text-2xl font-bold text-slate-900 group-hover:text-black transition-colors">
                  ${t('role_buyer')}
                </h3>
                <span class="inline-block px-2.5 py-0.5 mt-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                  Households, Mandis & Dining
                </span>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">
                ${t('role_buyer_desc')} Authentic origin, verified harvest dates, and transparent farmgate pricing.
              </p>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-900 font-bold text-sm">
              <span>Explore Marketplace</span>
              <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

        </div>

        <!-- Back to Home -->
        <div class="text-center pt-4">
          <button onclick="window.vivaanApp.navigateTo('landing')" class="text-slate-500 hover:text-slate-800 text-sm font-semibold inline-flex items-center gap-1">
            &larr; Return to Home Overview
          </button>
        </div>

      </div>
    </div>
  `;
}
