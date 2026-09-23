/**
 * VIVAAN Main Application Shell & Router
 */
import { LANGUAGES, getLanguage, setLanguage, t } from './i18n.js';
import { state, subscribe, setView, switchDemoRole, goBack, apiPost } from './state.js';

// Global Back Button generator helper
export function renderBackButton(fallbackView = 'landing', viewLabel = '') {
  const backLabel = t('back') || 'Back';
  return `
    <div class="flex items-center gap-3 mb-6">
      <button 
        onclick="window.vivaanApp.goBack('${fallbackView}')" 
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-300 hover:border-emerald-500 rounded-2xl shadow-sm text-xs font-black transition-all transform hover:-translate-x-0.5 active:translate-x-0 group"
        title="${backLabel}"
      >
        <span class="text-sm font-black text-emerald-700 group-hover:-translate-x-0.5 transition-transform">&larr;</span>
        <span>${backLabel}</span>
      </button>
      ${viewLabel ? `
        <span class="text-xs text-slate-300 font-bold">/</span>
        <span class="text-xs text-slate-500 font-bold tracking-wide uppercase">${viewLabel}</span>
      ` : ''}
    </div>
  `;
}

// Import Views
import { renderLanding } from './views/landing.js';
import { renderLanguageScreen } from './views/language_modal.js';
import { renderUserTypeSelect } from './views/user_type_select.js';
import { renderFarmerRegister } from './views/farmer_register.js';
import { renderFarmerDashboard } from './views/farmer_dashboard.js';
import { renderAgencyRegister } from './views/agency_register.js';
import { renderAgencyDashboard } from './views/agency_dashboard.js';
import { renderDriverView } from './views/driver_view.js';
import { renderBuyerMarketplace } from './views/buyer_marketplace.js';
import { renderOrderTracking } from './views/order_tracking.js';
import { renderAdminPanel } from './views/admin_panel.js';
import { renderDemoShowcase } from './views/demo_showcase.js';
import { renderLoginModal, setActiveLoginTab } from './views/login_modal.js';

let isLoginModalOpen = false;

function renderNavbar() {
  const currentLangCode = getLanguage();
  const currentLangObj = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];
  const role = state.currentRole;

  return `
    <header class="glass-nav sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        <!-- Left: Back Button (if not on landing) & VIVAAN Logo & Name -->
        <div class="flex items-center gap-3">
          ${state.currentView !== 'landing' ? `
            <button 
              onclick="window.vivaanApp.goBack('landing')" 
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5 active:translate-x-0"
              title="${t('back') || 'Back'}"
            >
              <span class="text-sm font-black text-emerald-700">&larr;</span>
              <span class="hidden sm:inline">${t('back') || 'Back'}</span>
            </button>
          ` : ''}

          <div class="flex items-center gap-3 cursor-pointer group" onclick="window.vivaanApp.navigateTo('landing')">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300 ring-2 ring-emerald-600/20 shadow-sm transition-transform group-hover:scale-105" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-black tracking-tight text-emerald-950 font-serif">VIVAAN</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase hidden sm:inline-block">
                  Direct
                </span>
              </div>
              <p class="text-[11px] text-amber-800 font-semibold tracking-wide hidden md:block">Farmer2Buyer Digital Marketplace</p>
            </div>
          </div>
        </div>

        <!-- Center: Quick Nav Links -->
        <nav class="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
          <button onclick="window.vivaanApp.navigateTo('landing')" class="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors ${state.currentView === 'landing' ? 'text-emerald-800 bg-emerald-50' : ''}">
            ${t('home')}
          </button>
          <button onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors ${state.currentView === 'buyer_marketplace' ? 'text-emerald-800 bg-emerald-50' : ''}">
            ${t('marketplace')}
          </button>
          <button onclick="window.vivaanApp.navigateTo('order_tracking')" class="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors ${state.currentView === 'order_tracking' ? 'text-emerald-800 bg-emerald-50' : ''}">
            ${t('delivery_tracking')}
          </button>
          <button onclick="window.vivaanApp.navigateTo('admin_panel')" class="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors ${state.currentView === 'admin_panel' ? 'text-purple-800 bg-purple-50' : ''}">
            ${t('admin_panel')}
          </button>
          <button onclick="window.vivaanApp.navigateTo('demo_showcase')" class="px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 font-black transition-colors ${state.currentView === 'demo_showcase' ? 'bg-amber-100 text-amber-900' : ''}">
            ⚡ Demos
          </button>
        </nav>

        <!-- Right: Login Button, Role Switcher & Language Selector -->
        <div class="flex items-center gap-2 sm:gap-3">
          
          <!-- Dedicated Login Button / Authenticated Profile -->
          ${state.currentUser ? `
            <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-sm">
              <span class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>${state.currentRole === 'FARMER' ? '🌾' : state.currentRole === 'AGENCY' ? '🚚' : state.currentRole === 'DRIVER' ? '🛵' : state.currentRole === 'BUYER' ? '🛒' : '🛡️'}</span>
                <span class="hidden md:inline max-w-[120px] truncate">${state.currentUser.name || state.currentUser.vivaan_id || state.currentRole}</span>
              </span>
              <button 
                onclick="window.vivaanApp.logout()" 
                class="text-[11px] text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                title="${t('logout')}"
              >
                <span>🚪</span>
                <span class="hidden sm:inline">${t('logout')}</span>
              </button>
            </div>
          ` : `
            <button 
              onclick="window.vivaanApp.showLoginModal('FARMER')" 
              class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/25 transition-all transform hover:scale-105"
              title="${t('login')}"
            >
              <span>🔑</span>
              <span>${t('login')}</span>
            </button>
          `}

          <!-- Role Switcher Dropdown (Demo Persona) -->
          <div class="relative group">
            <button class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200">
              <span class="w-2 h-2 rounded-full ${
                role === 'FARMER' ? 'bg-emerald-500' : role === 'AGENCY' ? 'bg-amber-500' : role === 'DRIVER' ? 'bg-indigo-500' : role === 'BUYER' ? 'bg-blue-500' : role === 'ADMIN' ? 'bg-purple-500' : 'bg-slate-400'
              }"></span>
              <span class="hidden sm:inline">Role:</span>
              <span class="uppercase">${role}</span>
              <span>▾</span>
            </button>

            <!-- Dropdown Menu -->
            <div class="hidden group-hover:block absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 text-xs z-50">
              <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Switch Persona View</div>
              <button onclick="window.vivaanApp.switchRole('VISITOR')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium">
                <span>🌐</span> Visitor Landing
              </button>
              <button onclick="window.vivaanApp.switchRole('FARMER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-900 flex items-center gap-2 font-bold">
                <span>🌾</span> Verified Farmer
              </button>
              <button onclick="window.vivaanApp.switchRole('AGENCY')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 flex items-center gap-2 font-bold">
                <span>🚚</span> Delivery Agency
              </button>
              <button onclick="window.vivaanApp.switchRole('DRIVER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-900 flex items-center gap-2 font-bold">
                <span>🛵</span> Delivery Driver
              </button>
              <button onclick="window.vivaanApp.switchRole('BUYER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-900 flex items-center gap-2 font-bold">
                <span>🛒</span> Consumer / Buyer
              </button>
              <button onclick="window.vivaanApp.switchRole('ADMIN')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 text-purple-900 flex items-center gap-2 font-bold">
                <span>🛡️</span> Admin Panel
              </button>
            </div>
          </div>

          <!-- ALWAYS VISIBLE LANGUAGE SELECTOR IN UPPER-RIGHT CORNER -->
          <div class="relative group">
            <button 
              id="lang-dropdown-btn"
              class="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm border border-emerald-700"
              title="Change Language anytime"
            >
              <span>${currentLangObj.flag}</span>
              <span class="hidden md:inline">${currentLangObj.native}</span>
              <span class="text-[10px] opacity-80 uppercase">${currentLangObj.code}</span>
              <span class="text-[10px]">▾</span>
            </button>

            <!-- Language Dropdown Menu (14 Languages) -->
            <div class="hidden group-hover:block absolute right-0 top-full mt-1 w-60 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 text-xs z-50">
              <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b pb-1">
                Choose Language / மொழி / भाषा
              </div>
              <div class="grid grid-cols-1 gap-0.5">
                ${LANGUAGES.map(l => `
                  <button 
                    onclick="window.vivaanApp.selectLanguage('${l.code}')" 
                    class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between text-slate-700 hover:text-emerald-900 font-medium ${
                      l.code === currentLangCode ? 'bg-emerald-50 text-emerald-950 font-bold' : ''
                    }"
                  >
                    <span class="flex items-center gap-2">
                      <span>${l.flag}</span>
                      <span>${l.native}</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-normal">${l.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div class="space-y-4 md:col-span-2">
            <div class="flex items-center gap-3">
              <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300" />
              <div>
                <span class="text-2xl font-black tracking-tight text-white font-serif">VIVAAN</span>
                <p class="text-xs text-amber-300 font-semibold">Direct Farmer-to-Buyer Digital Agricultural Marketplace</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering genuine Indian farmers with verified land records, fair market pricing, certified rural logistics carriers, and escrow-backed delivery security.
            </p>
            <div class="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span>🌾 100% Direct</span> • <span>🚚 Verified Carriers</span> • <span>🔒 Zero Exploitative Middlemen</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-white uppercase tracking-wider text-xs">Marketplace Portals</h4>
            <ul class="space-y-2 text-slate-400">
              <li><a href="javascript:void(0)" onclick="window.vivaanApp.navigateTo('farmer_register')" class="hover:text-emerald-400">Farmer Registration</a></li>
              <li><a href="javascript:void(0)" onclick="window.vivaanApp.navigateTo('agency_register')" class="hover:text-amber-400">Delivery Agency 5-Part Enrollment</a></li>
              <li><a href="javascript:void(0)" onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="hover:text-blue-400">Browse Direct Produce</a></li>
              <li><a href="javascript:void(0)" onclick="window.vivaanApp.navigateTo('order_tracking')" class="hover:text-white">Track Delivery & OTP</a></li>
              <li><a href="javascript:void(0)" onclick="window.vivaanApp.navigateTo('admin_panel')" class="hover:text-purple-400">VIVAAN Admin Panel</a></li>
            </ul>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-white uppercase tracking-wider text-xs">Trust & Standards</h4>
            <p class="text-slate-400 text-xs">Farmer Helpline: 1800-VIVAAN-AGRI</p>
            <p class="text-slate-400 text-xs">All 14 Indian languages supported with instant switching.</p>
            <div class="pt-2">
              <span class="text-[10px] text-slate-500 uppercase block font-bold">Privacy Architecture</span>
              <p class="text-[11px] text-slate-400 mt-0.5">Sensitive KYC, Aadhaar and bank details are strictly encrypted.</p>
            </div>
          </div>

        </div>

        <div class="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 VIVAAN Marketplace. All rights reserved.</p>
          <p class="text-emerald-400 font-medium">Built for Indian Farmers, Buyers, Delivery Agencies & Drivers</p>
        </div>
      </div>
    </footer>
  `;
}

async function renderApp() {
  const root = document.getElementById('vivaan-root');
  if (!root) return;

  // If user has not selected language yet on first visit, show the initial language screen
  if (!state.hasSelectedLanguageInitially && state.currentView === 'landing') {
    root.innerHTML = `
      <div id="app-navbar">${renderNavbar()}</div>
      <main id="app-main">${renderLanguageScreen()}</main>
      ${renderFooter()}
    `;
    return;
  }

  let viewHtml = '';
  switch (state.currentView) {
    case 'landing':
      viewHtml = renderLanding();
      break;
    case 'language_select':
      viewHtml = renderLanguageScreen();
      break;
    case 'user_type_select':
      viewHtml = renderUserTypeSelect();
      break;
    case 'farmer_register':
      viewHtml = renderFarmerRegister();
      break;
    case 'farmer_dashboard':
      viewHtml = await renderFarmerDashboard();
      break;
    case 'agency_register':
      viewHtml = renderAgencyRegister();
      break;
    case 'agency_dashboard':
      viewHtml = await renderAgencyDashboard();
      break;
    case 'driver_view':
      viewHtml = await renderDriverView();
      break;
    case 'buyer_marketplace':
      viewHtml = await renderBuyerMarketplace();
      break;
    case 'order_tracking':
      viewHtml = await renderOrderTracking();
      break;
    case 'admin_panel':
      viewHtml = await renderAdminPanel();
      break;
    case 'demo_showcase':
      viewHtml = renderDemoShowcase();
      break;
    default:
      viewHtml = renderLanding();
  }

  root.innerHTML = `
    <div id="app-navbar">${renderNavbar()}</div>
    <main id="app-main" class="min-h-[75vh]">${viewHtml}</main>
    ${renderFooter()}
    ${isLoginModalOpen ? renderLoginModal() : ''}
  `;

  // Safely trigger post-render hooks for maps and interactive widgets
  triggerPostRender(state.currentView);
}

function triggerPostRender(view) {
  setTimeout(() => {
    if (view === 'driver_view' && window.vivaanDriver && window.vivaanDriver.initMap) {
      window.vivaanDriver.initMap();
    } else if (view === 'order_tracking' && window.vivaanOrderTrack && window.vivaanOrderTrack.initMap) {
      window.vivaanOrderTrack.initMap();
    } else if (view === 'agency_dashboard' && window.vivaanAgencyDash && window.vivaanAgencyDash.initMap) {
      window.vivaanAgencyDash.initMap();
    } else if (view === 'admin_panel' && window.vivaanAdmin && window.vivaanAdmin.initMap) {
      window.vivaanAdmin.initMap();
    }
  }, 60);
}

// Global App controller on window
window.vivaanApp = {
  navigateTo(viewName) {
    setView(viewName);
  },
  goBack(fallbackView = 'landing') {
    goBack(fallbackView);
  },
  renderBackButton(fallbackView, viewLabel) {
    return renderBackButton(fallbackView, viewLabel);
  },
  selectLanguage(langCode) {
    setLanguage(langCode);
    renderApp();
  },
  confirmInitialLanguage() {
    state.hasSelectedLanguageInitially = true;
    localStorage.setItem('vivaan_lang_selected', 'true');
    setView('user_type_select');
  },
  showLanguageModal() {
    setView('language_select');
  },
  async switchRole(role) {
    await switchDemoRole(role);
  },
  showLoginModal(tab = 'FARMER') {
    isLoginModalOpen = true;
    setActiveLoginTab(tab);
    renderApp();
  },
  closeLoginModal() {
    isLoginModalOpen = false;
    renderApp();
  },
  setLoginTab(tab) {
    setActiveLoginTab(tab);
  },
  async handleCredentialLogin(event, role) {
    if (event && event.preventDefault) event.preventDefault();
    const identInput = document.getElementById(`login-${role.toLowerCase()}-ident`);
    const pwdInput = document.getElementById(`login-${role.toLowerCase()}-pwd`);
    const identifier = identInput ? identInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value.trim() : '';

    try {
      const res = await apiPost('/api/auth/login', { identifier, password });
      if (res.success) {
        state.currentUser = res.user;
        state.currentRole = res.user.role;
        isLoginModalOpen = false;
        if (res.user.role === 'FARMER') setView('farmer_dashboard');
        else if (res.user.role === 'AGENCY') setView('agency_dashboard');
        else if (res.user.role === 'DRIVER') setView('driver_view');
        else if (res.user.role === 'BUYER') setView('buyer_marketplace');
        else if (res.user.role === 'ADMIN') setView('admin_panel');
        renderApp();
      }
    } catch (err) {
      // Offline / demo fallback
      window.vivaanApp.quickDemoLogin(role);
    }
  },
  async quickDemoLogin(role) {
    isLoginModalOpen = false;
    await switchDemoRole(role);
  },
  async googleLogin() {
    isLoginModalOpen = false;
    try {
      const res = await apiPost('/api/auth/google', {
        name: 'Aditi Sharma',
        email: 'aditi.sharma@example.com',
        phone: '+919841234567',
        state: 'Tamil Nadu',
        district: 'Chennai',
        city_village: 'Adyar'
      });
      if (res.success) {
        state.currentUser = res.user;
        state.currentRole = 'BUYER';
        setView('buyer_marketplace');
      }
    } catch (err) {
      await switchDemoRole('BUYER');
    }
  },
  logout() {
    state.currentUser = null;
    state.currentRole = 'VISITOR';
    setView('landing');
  }
};

// Re-render when state or language updates
subscribe(() => renderApp());
window.addEventListener('vivaan-language-changed', () => renderApp());

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});
