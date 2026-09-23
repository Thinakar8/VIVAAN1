/**
 * VIVAAN Universal Login Modal
 * Provides dedicated login authentication flows for:
 * 1. Farmer (Farmer ID / Phone + Password/PIN)
 * 2. Delivery Agency (Agency ID + Password)
 * 3. Driver (Driver ID + PIN)
 * 4. Buyer (Google Authentication & Mobile OTP)
 * 5. Admin (Admin Credentials)
 */
import { t } from '../i18n.js';

let activeLoginTab = 'FARMER'; // 'FARMER' | 'AGENCY' | 'DRIVER' | 'BUYER' | 'ADMIN'

export function setActiveLoginTab(tab) {
  activeLoginTab = tab;
  const container = document.getElementById('vivaan-login-modal-content');
  if (container) {
    container.innerHTML = getLoginModalBodyHtml();
  }
}

export function getLoginModalBodyHtml() {
  return `
    <!-- Persona Selector Tabs -->
    <div class="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 bg-slate-50/80 rounded-t-3xl overflow-x-auto text-xs font-bold">
      <button 
        onclick="window.vivaanApp.setLoginTab('FARMER')"
        class="py-3.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
          activeLoginTab === 'FARMER' 
            ? 'border-emerald-600 text-emerald-900 font-black' 
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <span>🌾</span>
        <span>${t('role_farmer')}</span>
      </button>

      <button 
        onclick="window.vivaanApp.setLoginTab('AGENCY')"
        class="py-3.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
          activeLoginTab === 'AGENCY' 
            ? 'border-amber-600 text-amber-900 font-black' 
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <span>🚚</span>
        <span>${t('role_agency')}</span>
      </button>

      <button 
        onclick="window.vivaanApp.setLoginTab('DRIVER')"
        class="py-3.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
          activeLoginTab === 'DRIVER' 
            ? 'border-indigo-600 text-indigo-900 font-black' 
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <span>🛵</span>
        <span>${t('role_driver')}</span>
      </button>

      <button 
        onclick="window.vivaanApp.setLoginTab('BUYER')"
        class="py-3.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
          activeLoginTab === 'BUYER' 
            ? 'border-blue-600 text-blue-900 font-black' 
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <span>🛒</span>
        <span>${t('role_buyer')}</span>
      </button>

      <button 
        onclick="window.vivaanApp.setLoginTab('ADMIN')"
        class="py-3.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
          activeLoginTab === 'ADMIN' 
            ? 'border-purple-600 text-purple-900 font-black' 
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <span>🛡️</span>
        <span>Admin</span>
      </button>
    </div>

    <div class="p-6 sm:p-8 space-y-5">
      ${renderActiveTabContent()}
    </div>
  `;
}

function renderActiveTabContent() {
  if (activeLoginTab === 'FARMER') {
    return `
      <div class="space-y-4">
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
          <span class="text-2xl">🌾</span>
          <div>
            <h4 class="text-sm font-black text-emerald-950">${t('farmer_login')}</h4>
            <p class="text-xs text-emerald-800 mt-0.5">Log in using your assigned 12-digit VIVAAN Farmer ID or registered mobile.</p>
          </div>
        </div>

        <form onsubmit="window.vivaanApp.handleCredentialLogin(event, 'FARMER')" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">${t('enter_id')}</label>
            <input 
              id="login-farmer-ident"
              type="text" 
              required 
              placeholder="e.g. VIV-FR-104582 or +919842104582"
              value="VIV-FR-104582"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">${t('enter_password')}</label>
            <input 
              id="login-farmer-pwd"
              type="password" 
              required 
              placeholder="••••••••"
              value="farmer123"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            class="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md shadow-emerald-700/20 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>🌾</span>
            <span>${t('sign_in_btn')} (${t('role_farmer')})</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <button 
            onclick="window.vivaanApp.quickDemoLogin('FARMER')"
            class="w-full py-2.5 bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>1-Click Demo: Ramasamy Gounder (VIV-FR-104582)</span>
          </button>

          <div class="text-center mt-2">
            <p class="text-xs text-slate-500">
              New farmer without VIVAAN ID?
              <button onclick="window.vivaanApp.closeLoginModal(); window.vivaanApp.navigateTo('farmer_register')" class="text-emerald-700 font-bold underline hover:text-emerald-900 ml-1">
                ${t('join_farmer')} &rarr;
              </button>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  if (activeLoginTab === 'AGENCY') {
    return `
      <div class="space-y-4">
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <span class="text-2xl">🚚</span>
          <div>
            <h4 class="text-sm font-black text-amber-950">${t('agency_login')}</h4>
            <p class="text-xs text-amber-800 mt-0.5">Log in to manage delivery fleet, service radius, and consolidation hubs.</p>
          </div>
        </div>

        <form onsubmit="window.vivaanApp.handleCredentialLogin(event, 'AGENCY')" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Agency VIVAAN ID / GSTIN / Phone</label>
            <input 
              id="login-agency-ident"
              type="text" 
              required 
              placeholder="e.g. VIV-AG-104582 or +919840112233"
              value="VIV-AG-104582"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">${t('enter_password')}</label>
            <input 
              id="login-agency-pwd"
              type="password" 
              required 
              placeholder="••••••••"
              value="agency123"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            class="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md shadow-amber-600/20 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>🚚</span>
            <span>${t('sign_in_btn')} (${t('role_agency')})</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <button 
            onclick="window.vivaanApp.quickDemoLogin('AGENCY')"
            class="w-full py-2.5 bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>1-Click Demo: GreenCorridor Logistics (VIV-AG-104582)</span>
          </button>

          <div class="text-center mt-2">
            <p class="text-xs text-slate-500">
              Want to partner as a delivery agency?
              <button onclick="window.vivaanApp.closeLoginModal(); window.vivaanApp.navigateTo('agency_register')" class="text-amber-700 font-bold underline hover:text-amber-900 ml-1">
                ${t('join_agency')} &rarr;
              </button>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  if (activeLoginTab === 'DRIVER') {
    return `
      <div class="space-y-4">
        <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
          <span class="text-2xl">🛵</span>
          <div>
            <h4 class="text-sm font-black text-indigo-950">${t('driver_login')}</h4>
            <p class="text-xs text-indigo-800 mt-0.5">Access live route navigation, multi-farmer pickup stops, and OTP handover verification.</p>
          </div>
        </div>

        <form onsubmit="window.vivaanApp.handleCredentialLogin(event, 'DRIVER')" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Driver ID / Mobile</label>
            <input 
              id="login-driver-ident"
              type="text" 
              required 
              placeholder="e.g. VIV-DR-104582 or +919443219870"
              value="VIV-DR-104582"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">PIN / Password</label>
            <input 
              id="login-driver-pwd"
              type="password" 
              required 
              placeholder="••••••••"
              value="driver123"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>🛵</span>
            <span>${t('sign_in_btn')} (${t('role_driver')})</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-100">
          <button 
            onclick="window.vivaanApp.quickDemoLogin('DRIVER')"
            class="w-full py-2.5 bg-indigo-100/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>1-Click Demo: Murugan K (Bolero Pickup - VIV-DR-104582)</span>
          </button>
        </div>
      </div>
    `;
  }

  if (activeLoginTab === 'BUYER') {
    return `
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
          <span class="text-2xl">🛒</span>
          <div>
            <h4 class="text-sm font-black text-blue-950">${t('buyer_login')}</h4>
            <p class="text-xs text-blue-800 mt-0.5">Log in as a Household Consumer, Retailer, Wholesaler, or Restaurant buyer.</p>
          </div>
        </div>

        <!-- Google Sign-In (Official Styling) -->
        <div>
          <button 
            onclick="window.vivaanApp.googleLogin()"
            type="button"
            class="w-full py-3.5 px-4 border border-slate-300 rounded-2xl flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all hover:border-slate-400 group"
          >
            <svg class="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span class="text-sm text-slate-800">${t('google_signin')}</span>
          </button>
        </div>

        <div class="flex items-center my-3">
          <div class="flex-1 border-t border-slate-200"></div>
          <span class="px-3 text-[11px] font-bold text-slate-400 uppercase">or Mobile OTP</span>
          <div class="flex-1 border-t border-slate-200"></div>
        </div>

        <form onsubmit="window.vivaanApp.handleCredentialLogin(event, 'BUYER')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
            <input 
              id="login-buyer-ident"
              type="text" 
              required 
              placeholder="+91 98412 34567"
              value="+919841234567"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            class="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-md shadow-slate-900/20 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>📱</span>
            <span>Get OTP & Sign In</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-100">
          <button 
            onclick="window.vivaanApp.quickDemoLogin('BUYER')"
            class="w-full py-2.5 bg-blue-100/70 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>1-Click Demo: Aditi Sharma (Adyar, Chennai)</span>
          </button>
        </div>
      </div>
    `;
  }

  // ADMIN
  return `
    <div class="space-y-4">
      <div class="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-start gap-3">
        <span class="text-2xl">🛡️</span>
        <div>
          <h4 class="text-sm font-black text-purple-950">${t('admin_login')}</h4>
          <p class="text-xs text-purple-800 mt-0.5">State Land Records Verifier, Agency Tiering, & Escrow Ledger Management.</p>
        </div>
      </div>

      <form onsubmit="window.vivaanApp.handleCredentialLogin(event, 'ADMIN')" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
          <input 
            id="login-admin-ident"
            type="email" 
            required 
            placeholder="admin@vivaan.agri"
            value="admin@vivaan.agri"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">${t('enter_password')}</label>
          <input 
            id="login-admin-pwd"
            type="password" 
            required 
            placeholder="••••••••"
            value="admin123"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
        </div>

        <button 
          type="submit"
          class="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl shadow-md shadow-purple-700/20 text-sm flex items-center justify-center gap-2 transition-all"
        >
          <span>🛡️</span>
          <span>Sign In to Admin Cockpit</span>
        </button>
      </form>

      <div class="pt-2 border-t border-slate-100">
        <button 
          onclick="window.vivaanApp.quickDemoLogin('ADMIN')"
          class="w-full py-2.5 bg-purple-100/70 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>1-Click Demo: Super Admin</span>
        </button>
      </div>
    </div>
  `;
}

export function renderLoginModal() {
  return `
    <div id="vivaan-login-modal" class="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div class="bg-white rounded-3xl shadow-2xl border border-emerald-100/80 max-w-xl w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        <!-- Modal Top Banner -->
        <div class="bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 p-5 sm:p-6 text-white relative flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-12 w-12 rounded-full border border-amber-300 object-contain shadow-md bg-white" />
            <div>
              <h3 class="text-lg font-black tracking-tight flex items-center gap-2">
                <span>${t('login_heading')}</span>
                <span class="text-[10px] bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full font-bold uppercase">Secure</span>
              </h3>
              <p class="text-xs text-amber-200 font-medium">${t('login_sub')}</p>
            </div>
          </div>

          <button 
            onclick="window.vivaanApp.closeLoginModal()" 
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div id="vivaan-login-modal-content">
          ${getLoginModalBodyHtml()}
        </div>

      </div>
    </div>
  `;
}
