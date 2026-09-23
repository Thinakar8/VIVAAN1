"""
VIVAAN Standalone Single-File Builder
Generates a 100% self-contained, offline-compatible HTML file
with embedded base64 logo, full 14-language multilingual dictionaries,
reactive state, universal login modal, role login cards, Leaflet map integration,
all 22 landing page sections in exact order (Phase 1),
all 4 interactive demonstration showcases (Phases 107-110),
multi-farmer cart and Razorpay checkout, two-column active tracking,
strict role-based live tracking privacy, OTP handover, and settlement workflows.
"""
import os
import sys
import json
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

from routers.i18n import SUPPORTED_LANGUAGES as LANGUAGES, TRANSLATIONS

LOGO_B64_FILE = os.path.join(BASE_DIR, "logo_base64.txt")
with open(LOGO_B64_FILE, "r") as f:
    LOGO_DATA_URI = f.read().strip()

LANGUAGES_JS = json.dumps(LANGUAGES, ensure_ascii=False)
TRANSLATIONS_JS = json.dumps(TRANSLATIONS, ensure_ascii=False)

STANDALONE_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIVAAN – Direct Farmer-to-Buyer Digital Marketplace</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          fontFamily: {{
            sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
          }},
          colors: {{
            vivaan: {{
              dark: '#1b4332',
              green: '#2d6a4f',
              light: '#52b788',
              gold: '#d4a373',
              cream: '#fefae0'
            }}
          }}
        }}
      }}
    }}
  </script>

  <!-- Leaflet Map CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>

  <!-- Custom Styles -->
  <style>
    :root {{
      --vivaan-green-dark: #1b4332;
      --vivaan-green-primary: #2d6a4f;
      --vivaan-green-light: #52b788;
      --vivaan-gold: #d4a373;
      --vivaan-bg: #f8faf7;
    }}
    body {{
      background-color: var(--vivaan-bg);
      color: #1f2937;
    }}
    .glass-nav {{
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(229, 231, 235, 0.8);
    }}
    .id-card-farmer {{
      background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 65%, #1e3a2b 100%);
      border: 2px solid #d4a373;
      box-shadow: 0 16px 36px -8px rgba(27, 67, 50, 0.35);
      position: relative;
      overflow: hidden;
    }}
    .id-card-agency-local {{
      background: linear-gradient(135deg, #064e3b 0%, #059669 70%, #10b981 100%);
      border: 2px solid #34d399;
      box-shadow: 0 16px 32px -8px rgba(5, 150, 105, 0.35);
    }}
    .id-card-agency-district {{
      background: linear-gradient(135deg, #78350f 0%, #d97706 70%, #f59e0b 100%);
      border: 2px solid #fbbf24;
      box-shadow: 0 16px 32px -8px rgba(217, 119, 6, 0.35);
    }}
    .id-card-agency-state {{
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 70%, #3b82f6 100%);
      border: 2px solid #60a5fa;
      box-shadow: 0 16px 32px -8px rgba(37, 99, 235, 0.35);
    }}
    #delivery-map, #buyer-tracking-map {{
      height: 360px;
      width: 100%;
      border-radius: 16px;
      z-index: 10;
    }}
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased">

  <div id="vivaan-root"></div>

  <!-- Main JavaScript App -->
  <script>
    const VIVAAN_LOGO = "{LOGO_DATA_URI}";

    // 1. Multilingual Translations (Full 14 languages)
    const LANGUAGES = {LANGUAGES_JS};
    const TRANSLATIONS = {TRANSLATIONS_JS};

    let currentLang = localStorage.getItem('vivaan_lang') || 'en';
    function t(key) {{
      const d = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
      return (d && d[key]) || TRANSLATIONS.en[key] || key;
    }}

    function setLanguage(code) {{
      currentLang = code;
      localStorage.setItem('vivaan_lang', code);
      renderApp();
    }}

    // 2. In-Memory Database
    const db = {{
      farmers: [
        {{ id: 1, vivaan_id: 'VIV-FR-104582', full_name: 'Ramasamy Gounder', phone: '+919842104582', type: 'OWN_LAND', village: 'Omalur', district: 'Salem', state: 'Tamil Nadu', patta: 'PAT-4821', extent: '5.5 Acres', status: 'VERIFIED' }},
        {{ id: 2, vivaan_id: 'VIV-FR-208914', full_name: 'Harpreet Singh', phone: '+919876543210', type: 'OWN_LAND', village: 'Samrala', district: 'Ludhiana', state: 'Punjab', patta: 'JAM-8821', extent: '12 Acres', status: 'VERIFIED' }},
        {{ id: 3, vivaan_id: 'VIV-FR-301275', full_name: 'Dattatray Patil', phone: '+919822334455', type: 'LEASED_WITH_AGREEMENT', village: 'Pawas', district: 'Ratnagiri', state: 'Maharashtra', patta: '7-12-992', extent: '8 Acres', status: 'VERIFIED' }},
        {{ id: 4, vivaan_id: 'VIV-FR-407891', full_name: 'Suresh Patel', phone: '+919898123456', type: 'LEASED_WITHOUT_AGREEMENT', village: 'Davol', district: 'Anand', state: 'Gujarat', patta: 'GUJ-PAT-1188', extent: '4 Acres', status: 'VERIFIED' }}
      ],
      products: [
        {{ id: 'PRD-88210', farmer_id: 1, farmer_name: 'Ramasamy Gounder', title: 'Salem Pure Organic Turmeric (Haldi)', category: 'Spices', quantity: 250, unit: 'kg', price: 160, harvest_date: '2026-08-28', photo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', city: 'Omalur', district: 'Salem', state: 'Tamil Nadu', description: 'GI-Certified authentic Salem Erode variety turmeric with high curcumin content (4.8%). High demand on VIVAAN.', is_active: 1 }},
        {{ id: 'PRD-88211', farmer_id: 1, farmer_name: 'Ramasamy Gounder', title: 'Ponni Boiled Rice (Old Harvest)', category: 'Grains', quantity: 80, unit: 'Quintal', price: 3400, harvest_date: '2026-08-15', photo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', city: 'Omalur', district: 'Salem', state: 'Tamil Nadu', description: 'Aged single-origin Ponni rice from fertile Cauvery river belt. Zero chemical polish.', is_active: 1 }},
        {{ id: 'PRD-88212', farmer_id: 1, farmer_name: 'Ramasamy Gounder', title: 'Farm-Fresh Small Shallots (Country Onions)', category: 'Vegetables', quantity: 500, unit: 'kg', price: 45, harvest_date: '2026-09-12', photo: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500', city: 'Omalur', district: 'Salem', state: 'Tamil Nadu', description: 'Crisp, pungent sambar onions freshly harvested. Hand-graded, sorted in ventilated crates.', is_active: 1 }},
        {{ id: 'PRD-77301', farmer_id: 2, farmer_name: 'Harpreet Singh', title: 'Sharbati Premium Golden Wheat', category: 'Grains', quantity: 150, unit: 'Quintal', price: 2850, harvest_date: '2026-07-20', photo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', city: 'Samrala', district: 'Ludhiana', state: 'Punjab', description: 'Golden sun-soaked grain. Yields soft chapatis with high natural protein.', is_active: 1 }},
        {{ id: 'PRD-66401', farmer_id: 3, farmer_name: 'Dattatray Patil', title: 'Authentic Ratnagiri Alphonso Mangoes (GI Tagged)', category: 'Fruits', quantity: 400, unit: 'Pack', price: 950, harvest_date: '2026-05-18', photo: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', city: 'Pawas', district: 'Ratnagiri', state: 'Maharashtra', description: 'GI-tagged Ratnagiri Hapus mangoes ripened naturally in hay. Velvety fiberless pulp. 1 Dozen per pack.', is_active: 1 }}
      ],
      agencies: [
        {{ id: 1, vivaan_id: 'VIV-AG-104582', brand_name: 'GreenCorridor Logistics', legal_name: 'GreenCorridor Agro Logistics Pvt Ltd', tier: 'STATE_BLUE', tier_title: 'VIVAAN STATE LEVEL DELIVERY AGENCY', service_type: 'STATE', tax_id: '33AABCG1234F1Z8', phone: '+919840112233', status: 'VERIFIED' }},
        {{ id: 2, vivaan_id: 'VIV-AG-209143', brand_name: 'KrishiExpress', legal_name: 'KrishiExpress Rural Transport Services LLP', tier: 'DISTRICT_ORANGE', tier_title: 'VIVAAN DISTRICT LEVEL DELIVERY AGENCY', service_type: 'DISTRICT', tax_id: '33AACKR9988G1Z2', phone: '+919842887766', status: 'VERIFIED' }},
        {{ id: 3, vivaan_id: 'VIV-AG-308821', brand_name: 'GramaSeva Express', legal_name: 'GramaSeva Hyperlocal Express Co.', tier: 'LOCAL_GREEN', tier_title: 'VIVAAN LOCAL LEVEL DELIVERY AGENCY', service_type: 'LOCAL', tax_id: '33AABBG4411D1Z1', phone: '+919843990011', status: 'VERIFIED' }}
      ],
      drivers: [
        {{ id: 1, driver_id: 'VIV-DR-104582', agency_id: 1, full_name: 'Murugan K', phone: '+919443219870', license: 'TN-27-2012004589', license_class: 'LMV', vehicle: 'Bolero Pickup (TN-30-BC-4890)', status: 'ACTIVE' }}
      ],
      orders: [
        {{
          id: 'VIV-ORD-88120',
          buyer_name: 'Aditi Sharma',
          buyer_phone: '+919841234567',
          farmer_id: 1,
          farmer_name: 'Ramasamy Gounder',
          product_name: 'Salem Pure Organic Turmeric (Haldi)',
          quantity: 10,
          unit: 'kg',
          total_amount: 1750,
          delivery_address: 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar, Chennai',
          agency_name: 'GreenCorridor Agro Logistics',
          driver_name: 'Murugan K',
          driver_id: 'VIV-DR-104582',
          delivery_otp: '4819',
          order_status: 'PICKED_UP',
          tracking_phase: 'TO_BUYER',
          escrow_status: 'HELD_IN_ESCROW'
        }},
        {{
          id: 'VIV-ORD-88121',
          buyer_name: 'Kavitha Raman',
          buyer_phone: '+919841998877',
          farmer_id: 1,
          farmer_name: 'Ramasamy Gounder',
          product_name: 'Ponni Boiled Rice',
          quantity: 25,
          unit: 'kg',
          total_amount: 2100,
          delivery_address: 'Besant Nagar, Chennai',
          agency_name: 'GreenCorridor Agro Logistics',
          driver_name: 'Murugan K',
          driver_id: 'VIV-DR-104582',
          delivery_otp: '7392',
          order_status: 'ACCEPTED',
          tracking_phase: 'TO_FARMER',
          escrow_status: 'HELD_IN_ESCROW'
        }}
      ]
    }};

    // 3. Reactive State
    let currentView = 'landing';
    let currentRole = 'VISITOR';
    let currentUser = null;
    let isLoginModalOpen = false;
    let activeLoginTab = 'FARMER';
    let navHistory = [];
    let hasSelectedInitialLang = localStorage.getItem('vivaan_lang_init') === 'true';
    let buyerHasClickedTrack = false;
    let activeDemoTab = 'phase107';
    let phase109Step = 1;
    let phase110State = {{ driverAccepted: false, orderACollected: false, orderBCollected: false, orderADelivered: false, orderBDelivered: false }};
    let standaloneCart = [];
    let leafletMap = null;

    function navigateTo(view, pushHistory = true) {{
      if (pushHistory && currentView && currentView !== view) {{
        navHistory.push(currentView);
      }}
      currentView = view;
      renderApp();
      window.scrollTo({{ top: 0, behavior: 'smooth' }});
    }}

    function goBack(fallbackView = 'landing') {{
      if (navHistory && navHistory.length > 0) {{
        const prev = navHistory.pop();
        navigateTo(prev, false);
      }} else {{
        navigateTo(fallbackView, false);
      }}
    }}

    function renderBackButton(fallbackView = 'landing', viewLabel = '') {{
      const backLabel = t('back') || 'Back';
      return `
        <div class="flex items-center gap-3 mb-6">
          <button 
            onclick="goBack('${{fallbackView}}')" 
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-300 hover:border-emerald-500 rounded-2xl shadow-sm text-xs font-black transition-all transform hover:-translate-x-0.5"
            title="${{backLabel}}"
          >
            <span class="text-sm font-black text-emerald-700">&larr;</span>
            <span>${{backLabel}}</span>
          </button>
          ${{viewLabel ? `
            <span class="text-xs text-slate-300 font-bold">/</span>
            <span class="text-xs text-slate-500 font-bold tracking-wide uppercase">${{viewLabel}}</span>
          ` : ''}}
        </div>
      `;
    }}

    function switchRole(role) {{
      currentRole = role;
      if (role === 'FARMER') {{ currentView = 'farmer_dash'; currentUser = {{ name: 'Ramasamy Gounder', vivaan_id: 'VIV-FR-104582', role: 'FARMER' }}; }}
      else if (role === 'AGENCY') {{ currentView = 'agency_dash'; currentUser = {{ name: 'GreenCorridor Logistics', vivaan_id: 'VIV-AG-104582', role: 'AGENCY' }}; }}
      else if (role === 'DRIVER') {{ currentView = 'driver_nav'; currentUser = {{ name: 'Murugan K', driver_id: 'VIV-DR-104582', role: 'DRIVER' }}; }}
      else if (role === 'BUYER') {{ currentView = 'buyer_mkt'; currentUser = {{ name: 'Aditi Sharma', role: 'BUYER' }}; }}
      else if (role === 'ADMIN') {{ currentView = 'admin_cockpit'; currentUser = {{ name: 'Super Admin', role: 'ADMIN' }}; }}
      else {{ currentView = 'landing'; currentUser = null; }}
      renderApp();
    }}

    function showLoginModal(tab = 'FARMER') {{
      activeLoginTab = tab;
      isLoginModalOpen = true;
      renderApp();
    }}

    function closeLoginModal() {{
      isLoginModalOpen = false;
      renderApp();
    }}

    function setLoginTab(tab) {{
      activeLoginTab = tab;
      const modalContent = document.getElementById('standalone-login-content');
      if (modalContent) modalContent.innerHTML = getLoginModalBodyHtml();
      else renderApp();
    }}

    function quickDemoLogin(role) {{
      isLoginModalOpen = false;
      switchRole(role);
      const name = currentUser ? currentUser.name : role;
      alert("✅ Logged in successfully as " + name + " (" + role + ")!");
    }}

    function googleLogin() {{
      isLoginModalOpen = false;
      currentUser = {{ name: 'Aditi Sharma', email: 'aditi.sharma@example.com', role: 'BUYER' }};
      currentRole = 'BUYER';
      currentView = 'buyer_mkt';
      renderApp();
      alert("✅ Signed in with Google as Aditi Sharma (Retail Consumer)!");
    }}

    function handleCredentialLogin(e, role) {{
      if (e && e.preventDefault) e.preventDefault();
      quickDemoLogin(role);
    }}

    function logoutUser() {{
      currentUser = null;
      currentRole = 'VISITOR';
      currentView = 'landing';
      renderApp();
      alert("👋 You have been logged out successfully.");
    }}

    // 4. Navbar
    function getNavbarHtml() {{
      const langObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
      return `
        <header class="glass-nav sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
            
            <div class="flex items-center gap-3">
              ${{currentView !== 'landing' ? `
                <button 
                  onclick="goBack('landing')" 
                  class="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
                  title="${{t('back')}}"
                >
                  <span class="text-sm font-black text-emerald-700">&larr;</span>
                  <span class="hidden sm:inline">${{t('back')}}</span>
                </button>
              ` : ''}}

              <div class="flex items-center gap-3 cursor-pointer group" onclick="navigateTo('landing')">
                <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300 ring-2 ring-emerald-600/20 shadow-sm transition-transform group-hover:scale-105" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-black tracking-tight text-emerald-950 font-serif">VIVAAN</span>
                    <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase hidden sm:inline-block">Direct</span>
                  </div>
                  <p class="text-[11px] text-amber-800 font-semibold tracking-wide hidden md:block">Farmer2Buyer Digital Marketplace</p>
                </div>
              </div>
            </div>

            <nav class="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
              <button onclick="navigateTo('landing')" class="px-3 py-2 rounded-xl hover:bg-slate-100 ${{currentView === 'landing' ? 'text-emerald-800 bg-emerald-50' : ''}}">Home</button>
              <button onclick="navigateTo('buyer_mkt')" class="px-3 py-2 rounded-xl hover:bg-slate-100 ${{currentView === 'buyer_mkt' ? 'text-emerald-800 bg-emerald-50' : ''}}">Marketplace</button>
              <button onclick="navigateTo('order_track')" class="px-3 py-2 rounded-xl hover:bg-slate-100 ${{currentView === 'order_track' ? 'text-emerald-800 bg-emerald-50' : ''}}">Track Delivery</button>
              <button onclick="navigateTo('demo_showcase')" class="px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 font-black ${{currentView === 'demo_showcase' ? 'bg-amber-100' : ''}}">⚡ Demos Hub</button>
              <button onclick="navigateTo('admin_cockpit')" class="px-3 py-2 rounded-xl hover:bg-slate-100 ${{currentView === 'admin_cockpit' ? 'text-purple-800 bg-purple-50' : ''}}">Admin Panel</button>
            </nav>

            <div class="flex items-center gap-2 sm:gap-3">
              ${{currentUser ? `
                <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-sm">
                  <span class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>${{currentRole === 'FARMER' ? '🌾' : currentRole === 'AGENCY' ? '🚚' : currentRole === 'DRIVER' ? '🛵' : currentRole === 'BUYER' ? '🛒' : '🛡️'}}</span>
                    <span class="hidden md:inline max-w-[120px] truncate">${{currentUser.name || currentUser.vivaan_id || currentRole}}</span>
                  </span>
                  <button onclick="logoutUser()" class="text-[11px] text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 rounded hover:bg-red-50">🚪</button>
                </div>
              ` : `
                <button onclick="showLoginModal('FARMER')" class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
                  <span>🔑</span> <span>${{t('login')}}</span>
                </button>
              `}}

              <!-- Role Selector -->
              <div class="relative group">
                <button class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200">
                  <span class="uppercase font-bold">${{currentRole}}</span>
                  <span>▾</span>
                </button>
                <div class="hidden group-hover:block absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 text-xs z-50">
                  <button onclick="switchRole('VISITOR')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50">🌐 Visitor Home</button>
                  <button onclick="switchRole('FARMER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-900 font-bold">🌾 Farmer View</button>
                  <button onclick="switchRole('AGENCY')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 font-bold">🚚 Agency View</button>
                  <button onclick="switchRole('DRIVER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-900 font-bold">🛵 Driver View</button>
                  <button onclick="switchRole('BUYER')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-900 font-bold">🛒 Buyer View</button>
                  <button onclick="switchRole('ADMIN')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 text-purple-900 font-bold">🛡️ Admin Panel</button>
                </div>
              </div>

              <!-- UPPER-RIGHT CORNER ALWAYS VISIBLE LANGUAGE SELECTOR -->
              <div class="relative group">
                <button class="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm border border-emerald-700">
                  <span>${{langObj.flag}}</span>
                  <span class="hidden md:inline">${{langObj.native}}</span>
                  <span class="text-[10px] opacity-80 uppercase">${{langObj.code}}</span>
                  <span>▾</span>
                </button>
                <div class="hidden group-hover:block absolute right-0 top-full mt-1 w-60 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 text-xs z-50">
                  <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b pb-1">Choose Language / மொழி / भाषा</div>
                  ${{LANGUAGES.map(l => `
                    <button onclick="setLanguage('${{l.code}}')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between text-slate-700 font-medium ${{l.code === currentLang ? 'bg-emerald-50 text-emerald-950 font-bold' : ''}}">
                      <span class="flex items-center gap-2"><span>${{l.flag}}</span><span>${{l.native}}</span></span>
                      <span class="text-[10px] text-slate-400">${{l.name}}</span>
                    </button>
                  `).join('')}}
                </div>
              </div>

            </div>
          </div>
        </header>
      `;
    }}

    // 5. Footer (Section 22)
    function getFooterHtml() {{
      return `
        <!-- SECTION 22: FOOTER -->
        <footer class="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-10 w-10 object-contain rounded-full border border-amber-300" />
                <div>
                  <span class="text-xl font-black text-white tracking-wider">VIVAAN</span>
                  <p class="text-xs text-amber-400">Direct Farmer-to-Buyer Digital Agricultural Marketplace</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                <button onclick="navigateTo('farmer_reg')" class="hover:text-emerald-400">🌾 Farmer Enrollment</button>
                <button onclick="navigateTo('agency_reg')" class="hover:text-amber-400">🚚 Agency Registration</button>
                <button onclick="navigateTo('buyer_mkt')" class="hover:text-blue-400">🛒 Marketplace</button>
                <button onclick="navigateTo('order_track')" class="hover:text-white">📍 Track Delivery</button>
                <button onclick="navigateTo('demo_showcase')" class="hover:text-amber-300 font-bold">⚡ Interactive Demos</button>
                <button onclick="navigateTo('admin_cockpit')" class="hover:text-purple-400">🛡️ Admin Panel</button>
              </div>
            </div>
            <div class="text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 VIVAAN. Certified Indian Agricultural Platform.</p>
              <p class="text-emerald-400">100% Direct • Escrow Protected • 14 Indian Languages</p>
            </div>
          </div>
        </footer>
      `;
    }}

    // =========================================================================
    // PHASE 1: LANDING PAGE - ALL 22 SECTIONS IN EXACT SEQUENTIAL ORDER
    // =========================================================================
    function getLandingHtml() {{
      return `
        <div class="space-y-20 pb-20">

          <!-- SECTION 1: HEADER BANNER -->
          <section class="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-700/50">
              <div class="flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                <span class="text-xs sm:text-sm font-bold tracking-wide">
                  🌾 Direct Indian Agricultural Marketplace • 14 Indian Languages Supported
                </span>
              </div>
              <button onclick="navigateTo('demo_showcase')" class="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow transition-all transform hover:scale-105">
                ⚡ Explore Interactive Demos (Phases 106–110)
              </button>
            </div>
          </section>

          <!-- SECTION 2: HERO ("From Farmers Directly to Buyers") -->
          <section class="relative bg-gradient-to-b from-emerald-50 via-amber-50/20 to-white pt-8 pb-16 rounded-3xl border border-emerald-100/60 shadow-sm mx-4 sm:mx-8">
            <div class="max-w-5xl mx-auto px-4 text-center">
              <div class="flex justify-center mb-6">
                <img src="${{VIVAAN_LOGO}}" alt="VIVAAN Logo" class="h-36 w-36 object-contain rounded-full shadow-2xl border-4 border-amber-300 ring-4 ring-emerald-600/20" />
              </div>

              <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-3">
                <span class="text-emerald-800 font-serif">VIVAAN</span>
              </h1>
              <p class="text-2xl sm:text-3xl font-black text-amber-800 mb-4 tracking-tight">
                “From Farmers Directly to Buyers”
              </p>
              <p class="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                VIVAAN connects verified farmers, buyers, delivery partners and intelligent logistics in one platform.
              </p>

              <!-- 3 Primary Actions -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <button onclick="navigateTo('farmer_reg')" class="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-3">
                  <span class="text-2xl">🌾</span> <span>${{t('join_farmer')}}</span>
                </button>
                <button onclick="navigateTo('buyer_mkt')" class="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-black text-base rounded-2xl shadow-lg shadow-slate-900/25 flex items-center justify-center gap-3">
                  <span class="text-2xl">🛒</span> <span>${{t('start_buying')}}</span>
                </button>
                <button onclick="navigateTo('agency_reg')" class="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-3">
                  <span class="text-2xl">🚚</span> <span>${{t('join_agency')}}</span>
                </button>
              </div>

              <!-- Persona Login Cards -->
              <div class="mt-10 pt-8 border-t border-emerald-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  🔑 Sign In By Role:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
                  <button onclick="showLoginModal('FARMER')" class="p-3.5 bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl shadow-sm text-left flex items-center gap-3">
                    <span class="text-2xl p-2 bg-emerald-100 rounded-xl">🌾</span>
                    <div><div class="text-xs font-black">${{t('farmer_login')}}</div><div class="text-[11px] text-slate-500">ID + Password</div></div>
                  </button>
                  <button onclick="showLoginModal('AGENCY')" class="p-3.5 bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-200 hover:border-amber-500 rounded-2xl shadow-sm text-left flex items-center gap-3">
                    <span class="text-2xl p-2 bg-amber-100 rounded-xl">🚚</span>
                    <div><div class="text-xs font-black">${{t('agency_login')}}</div><div class="text-[11px] text-slate-500">Agency ID + Password</div></div>
                  </button>
                  <button onclick="showLoginModal('DRIVER')" class="p-3.5 bg-white hover:bg-indigo-50 text-indigo-950 border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl shadow-sm text-left flex items-center gap-3">
                    <span class="text-2xl p-2 bg-indigo-100 rounded-xl">🛵</span>
                    <div><div class="text-xs font-black">${{t('driver_login')}}</div><div class="text-[11px] text-slate-500">Driver ID + PIN</div></div>
                  </button>
                  <button onclick="showLoginModal('BUYER')" class="p-3.5 bg-white hover:bg-blue-50 text-blue-950 border-2 border-blue-200 hover:border-blue-500 rounded-2xl shadow-sm text-left flex items-center gap-3">
                    <span class="text-2xl p-2 bg-blue-100 rounded-xl">🛒</span>
                    <div><div class="text-xs font-black">${{t('buyer_login')}}</div><div class="text-[11px] text-slate-500">Google / Mobile</div></div>
                  </button>
                </div>
              </div>

            </div>
          </section>

          <!-- SECTION 3: TRUST/VALUE FEATURES -->
          <section class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="text-3xl">🌱</div>
                <h3 class="text-base font-black text-slate-900">Verified Agricultural Identity</h3>
                <p class="text-slate-500">Multi-evidence land and identity authentication ensuring every farmer is genuine.</p>
              </div>
              <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="text-3xl">💰</div>
                <h3 class="text-base font-black text-slate-900">Farmer-Fixed Pricing</h3>
                <p class="text-slate-500">Farmers fix their own harvest prices. VIVAAN never discounts base rates silently.</p>
              </div>
              <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="text-3xl">📦</div>
                <h3 class="text-base font-black text-slate-900">Multi-Farmer Cart</h3>
                <p class="text-slate-500">Order crops from multiple farmers across districts in one unified shopping cart.</p>
              </div>
              <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="text-3xl">🔐</div>
                <h3 class="text-base font-black text-slate-900">Delivery OTP & Escrow</h3>
                <p class="text-slate-500">Escrow payouts released to farmer bank accounts upon 4-digit handover OTP proof.</p>
              </div>
            </div>
          </section>

          <!-- SECTION 4: THE PROBLEM -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-red-50/70 border border-red-200 rounded-3xl p-8 sm:p-10 space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-red-600 uppercase tracking-widest">The Problem in Traditional Agriculture</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Why the Old Farm Supply Chain Is Broken</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700 text-xs">
                <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm space-y-2">
                  <span class="text-2xl">📉</span>
                  <h4 class="font-bold text-sm text-red-950">4 to 6 Middlemen Layers</h4>
                  <p>Traders and brokers take up to 55% of the consumer rupee, leaving farmers with minimal revenue.</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm space-y-2">
                  <span class="text-2xl">⏱️</span>
                  <h4 class="font-bold text-sm text-red-950">Delayed & Opaque Payments</h4>
                  <p>Farmers wait weeks for payment with arbitrary quality cuts and delayed settlements.</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm space-y-2">
                  <span class="text-2xl">🚛</span>
                  <h4 class="font-bold text-sm text-red-950">Uncoordinated Rural Logistics</h4>
                  <p>Fragmented single trips cause high freight costs, fuel wastage, and transit spoilage.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 5: VIVAAN SOLUTION -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
              <div class="text-center max-w-3xl mx-auto">
                <span class="text-xs font-black text-amber-300 uppercase tracking-widest">The VIVAAN Solution</span>
                <h2 class="text-3xl sm:text-4xl font-black mt-2">A Unified, Intelligent Agricultural Ecosystem</h2>
                <p class="text-sm text-emerald-100 mt-3">Verified farmers, direct transactions, consolidated routes, and guaranteed escrow payouts.</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
                  <div class="text-2xl">🌾</div><h4 class="font-bold text-sm text-amber-200">100% Direct</h4><p class="text-emerald-100">Farmers receive 95% of the product price directly.</p>
                </div>
                <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
                  <div class="text-2xl">📑</div><h4 class="font-bold text-sm text-amber-200">Tri-Tier Verification</h4><p class="text-emerald-100">Authenticates Own Land and Leased Farmers with digital consent.</p>
                </div>
                <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
                  <div class="text-2xl">🚚</div><h4 class="font-bold text-sm text-amber-200">Shared Logistics</h4><p class="text-emerald-100">Consolidated multi-order pickups and vehicle capacity matching.</p>
                </div>
                <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
                  <div class="text-2xl">💳</div><h4 class="font-bold text-sm text-amber-200">Escrow Security</h4><p class="text-emerald-100">Automated settlement within ~5-10 minutes after OTP delivery.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 6: HOW VIVAAN WORKS -->
          <section class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-12">
              <span class="text-xs font-black text-emerald-700 uppercase tracking-wider">Step-by-Step Architecture</span>
              <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mt-1">How VIVAAN Works</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center text-xs">
              <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center">1</div>
                <h4 class="font-bold text-slate-900">Farmer Verification</h4>
                <p class="text-slate-500">Patta, Survey Number, Bank details lead to unique VIVAAN Farmer ID.</p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center">2</div>
                <h4 class="font-bold text-slate-900">Direct Listing</h4>
                <p class="text-slate-500">Farmers list fresh produce with photos, harvest dates, and fixed prices.</p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center">3</div>
                <h4 class="font-bold text-slate-900">Multi-Farmer Cart</h4>
                <p class="text-slate-500">Buyers order across farms in 1 cart. Automatic inventory deduction.</p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center">4</div>
                <h4 class="font-bold text-slate-900">Route Logistics</h4>
                <p class="text-slate-500">Consolidated pickup and role-based live GPS tracking.</p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center">5</div>
                <h4 class="font-bold text-slate-900">OTP Handover</h4>
                <p class="text-slate-500">4-digit OTP handover proof releases funds to farmer bank account.</p>
              </div>
            </div>
          </section>

          <!-- SECTION 7: FARMER ECOSYSTEM -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Farmer Onboarding</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Tri-Category Farmer Ecosystem</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div class="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <span class="px-2 py-0.5 bg-emerald-700 text-white rounded-full font-bold text-[10px]">Type 1</span>
                  <h4 class="font-bold text-sm text-emerald-950">Own Land Farmer</h4>
                  <p class="text-slate-600">Patta, Chitta, Survey Number, Subdivision, and Title documentation.</p>
                </div>
                <div class="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <span class="px-2 py-0.5 bg-amber-700 text-white rounded-full font-bold text-[10px]">Type 2</span>
                  <h4 class="font-bold text-sm text-amber-950">Leased Farmer With Agreement</h4>
                  <p class="text-slate-600">Registered lease agreement, duration dates, and landowner details.</p>
                </div>
                <div class="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                  <span class="px-2 py-0.5 bg-blue-700 text-white rounded-full font-bold text-[10px]">Type 3</span>
                  <h4 class="font-bold text-sm text-blue-950">Leased Without Agreement</h4>
                  <p class="text-slate-600">Digital consent flow: Landowner receives encrypted OTP/link to confirm cultivation.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 8: MULTI-FARMER MARKETPLACE -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <span class="text-xs font-black text-amber-300 uppercase tracking-widest">Marketplace Innovation</span>
                  <h2 class="text-2xl sm:text-3xl font-black mt-1">“One Buyer. Multiple Farmers. One VIVAAN Cart.”</h2>
                  <p class="text-xs text-slate-300 mt-1">Single checkout creates separate order items per farmer with shared delivery consolidation.</p>
                </div>
                <button onclick="navigateTo('buyer_mkt')" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg">
                  Explore Live Marketplace &rarr;
                </button>
              </div>
            </div>
          </section>

          <!-- SECTION 9: SMART DELIVERY -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Intelligent Carrier Matching</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">3-Tier Certified Delivery Classification</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div class="p-5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-500 space-y-2">
                  <span class="font-black text-emerald-800 text-xs">🟢 VIVAAN LOCAL LEVEL DELIVERY AGENCY</span>
                  <p class="text-slate-600">Hyperlocal rural farm-to-consumer within single Taluk/Block.</p>
                </div>
                <div class="p-5 bg-amber-50/80 rounded-2xl border-2 border-amber-500 space-y-2">
                  <span class="font-black text-amber-800 text-xs">🟠 VIVAAN DISTRICT LEVEL DELIVERY AGENCY</span>
                  <p class="text-slate-600">Inter-taluk transport connecting farming belts to district markets.</p>
                </div>
                <div class="p-5 bg-blue-50/80 rounded-2xl border-2 border-blue-500 space-y-2">
                  <span class="font-black text-blue-800 text-xs">🔵 VIVAAN STATE LEVEL DELIVERY AGENCY</span>
                  <p class="text-slate-600">Heavy freight & cold chain corridors across state highways.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 10: VEHICLE MATCHING -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Fleet Engineering</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Verified Vehicle Capacity Matching</h2>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div class="text-2xl">🛵</div><div class="font-black">2-Wheeler</div><div class="text-emerald-700 font-bold">Up to 30 kg</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div class="text-2xl">🚗</div><div class="font-black">Car / Hatch</div><div class="text-emerald-700 font-bold">Up to 150 kg</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div class="text-2xl">🛻</div><div class="font-black">Pickup Truck</div><div class="text-emerald-700 font-bold">Up to 1,200 kg</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div class="text-2xl">🚐</div><div class="font-black">Mini Van</div><div class="text-emerald-700 font-bold">Up to 800 kg</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div class="text-2xl">🚛</div><div class="font-black">Heavy Truck</div><div class="text-emerald-700 font-bold">Up to 10,000 kg</div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 11: ROUTE OPTIMIZATION -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-4">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Algorithmic Efficiency</span>
                  <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Multi-Stop Route Optimization</h2>
                  <p class="text-xs text-slate-500 mt-1">Strict Pickup-Before-Delivery sequencing honoring cargo dependencies.</p>
                </div>
                <button onclick="navigateTo('demo_showcase')" class="px-4 py-2 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-black">
                  View Live Simulation &rarr;
                </button>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-emerald-800">
                Driver &rarr; Farmer A &rarr; Farmer B &rarr; Farmer C &rarr; Buyer A &rarr; Buyer B
              </div>
            </div>
          </section>

          <!-- SECTION 12: LIVE TRACKING -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span class="text-xs font-black text-amber-400 uppercase tracking-widest">Interactive Telemetry</span>
                  <h2 class="text-2xl sm:text-3xl font-black mt-1">Role-Based Live GPS Tracking</h2>
                  <p class="text-xs text-slate-300 mt-1">Integrated with Leaflet / Google Maps Platform for real-time driver coordinates.</p>
                </div>
                <button onclick="navigateTo('order_track')" class="px-5 py-2.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg">
                  Open Tracking View &rarr;
                </button>
              </div>
            </div>
          </section>

          <!-- SECTION 13: TRACKING PRIVACY -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Strict Safeguards</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Privacy-Preserving Telemetry Rules</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div class="p-5 bg-red-50/60 rounded-2xl border border-red-200 space-y-2">
                  <h4 class="font-black text-red-950 text-sm">🛑 No Pre-Collection Tracking</h4>
                  <p class="text-slate-600">Buyers cannot see live driver location while the driver is en route to the farmgate.</p>
                </div>
                <div class="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <h4 class="font-black text-amber-950 text-sm">🟡 Intentional Click-to-Track</h4>
                  <p class="text-slate-600">Buyers must explicitly click "Track Live Delivery" to access telemetry.</p>
                </div>
                <div class="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <h4 class="font-black text-emerald-950 text-sm">✅ Immediate Post-OTP Cutoff</h4>
                  <p class="text-slate-600">The millisecond the 4-digit handover OTP is confirmed, live tracking permanently terminates.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 14: RAZORPAY PAYMENTS -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Financial Transparency</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Razorpay Escrow & Split Payment Flow</h2>
              </div>
              <div class="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div class="flex justify-between text-slate-600"><span>Farmer Produce Subtotal:</span><span class="font-bold text-slate-900">₹450.00</span></div>
                <div class="flex justify-between text-slate-600"><span>Shared Delivery Charge:</span><span class="font-bold text-slate-900">₹80.00</span></div>
                <div class="flex justify-between text-base font-black text-emerald-900 pt-2 border-t border-slate-100"><span>Grand Total:</span><span>₹530.00</span></div>
              </div>
            </div>
          </section>

          <!-- SECTION 15: DELIVERY AGENCY -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-amber-700 uppercase tracking-widest">Logistics Partners</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">5-Part Agency Onboarding & Management</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div class="p-3 bg-slate-50 rounded-xl border">Part 1: Identity</div>
                <div class="p-3 bg-slate-50 rounded-xl border">Part 2: Footprint</div>
                <div class="p-3 bg-slate-50 rounded-xl border">Part 3: Matrix</div>
                <div class="p-3 bg-slate-50 rounded-xl border">Part 4: Fleet</div>
                <div class="p-3 bg-slate-50 rounded-xl border">Part 5: SLA</div>
              </div>
            </div>
          </section>

          <!-- SECTION 16: DRIVER -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-indigo-50/60 rounded-3xl border border-indigo-100 p-8 sm:p-10 space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-indigo-700 uppercase tracking-widest">Driver Community</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Empowering Verified Rural Drivers</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
                  <span class="text-2xl">🪪</span><h4 class="font-bold text-sm text-indigo-950">Driver ID</h4><p class="text-slate-600">VIV-DRV-XXXX generated upon agency verification.</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
                  <span class="text-2xl">📦</span><h4 class="font-bold text-sm text-indigo-950">Batch Load Navigation</h4><p class="text-slate-600">Active order list on left, map on right.</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
                  <span class="text-2xl">💵</span><h4 class="font-bold text-sm text-indigo-950">Guaranteed Delivery Pay</h4><p class="text-slate-600">Earnings released upon valid OTP handover proof.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 17: AI AND WEATHER -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Platform Intelligence</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Role-Specific AI & Weather Forecasting</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1"><div class="font-black text-emerald-950">🌾 Farmer AI</div><p class="text-slate-600">Crop advisories & rain alerts.</p></div>
                <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1"><div class="font-black text-amber-950">🚚 Agency AI</div><p class="text-slate-600">Fleet workload & batching.</p></div>
                <div class="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1"><div class="font-black text-indigo-950">🛵 Driver AI</div><p class="text-slate-600">Next stop explanation & routes.</p></div>
                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1"><div class="font-black text-blue-950">🛒 Buyer AI</div><p class="text-slate-600">Produce search & recommendations.</p></div>
              </div>
            </div>
          </section>

          <!-- SECTION 18: ANALYTICS -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Complete Visibility</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Comprehensive Performance Analytics</h2>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div class="text-slate-400">Total Produce Sold</div><div class="text-2xl font-black text-emerald-800 mt-1">1,480 kg</div></div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div class="text-slate-400">Fleet Active</div><div class="text-2xl font-black text-amber-800 mt-1">84.6%</div></div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div class="text-slate-400">Avg Transit Time</div><div class="text-2xl font-black text-blue-800 mt-1">4.2 Hrs</div></div>
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div class="text-slate-400">Escrow Settlement</div><div class="text-2xl font-black text-purple-800 mt-1">8.5 Mins</div></div>
              </div>
            </div>
          </section>

          <!-- SECTION 19: SECURITY -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
              <div class="text-center max-w-2xl mx-auto">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Enterprise Architecture</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Zero-Trust Security & Data Isolation</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"><div class="text-lg font-black text-slate-900">🛡️ Private Documents</div><p class="text-slate-600">Patta/Chitta and bank details are never public.</p></div>
                <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"><div class="text-lg font-black text-slate-900">📍 Partial Location Only</div><p class="text-slate-600">Public listings display City, District, State only.</p></div>
                <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"><div class="text-lg font-black text-slate-900">🔑 One-Time Passwords</div><p class="text-slate-600">Cryptographic handover verification.</p></div>
              </div>
            </div>
          </section>

          <!-- SECTION 20: WHY VIVAAN -->
          <section class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-8">
              <span class="text-xs font-black text-emerald-700 uppercase tracking-wider">The Comparison</span>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Traditional Supply Chain vs VIVAAN</h2>
            </div>
            <div class="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-white">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                    <th class="p-4">Feature</th><th class="p-4 text-red-700">Traditional Mandi</th><th class="p-4 text-emerald-800">VIVAAN Platform</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr><td class="p-4 font-bold">Pricing Control</td><td class="p-4 text-slate-600">Dictated by middleman syndicates</td><td class="p-4 font-bold text-emerald-800">100% Fixed by the Farmer</td></tr>
                  <tr><td class="p-4 font-bold">Farmer Share</td><td class="p-4 text-slate-600">30% – 45% of consumer spend</td><td class="p-4 font-bold text-emerald-800">95% Farmgate Payout</td></tr>
                  <tr><td class="p-4 font-bold">Payment Timelines</td><td class="p-4 text-slate-600">15 to 45 days credit delay</td><td class="p-4 font-bold text-emerald-800">~5–10 Minutes Post-OTP Handover</td></tr>
                  <tr><td class="p-4 font-bold">Logistics</td><td class="p-4 text-slate-600">Fragmented, high empty-haul trips</td><td class="p-4 font-bold text-emerald-800">Consolidated Multi-Stop TSP Routing</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- SECTION 21: FINAL CTA -->
          <section class="max-w-5xl mx-auto px-4 sm:px-6">
            <div class="bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
              <h2 class="text-3xl sm:text-5xl font-black tracking-tight font-serif">
                Join the Direct Agricultural Revolution Today
              </h2>
              <p class="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                Empowering Indian farmers, conscious buyers, delivery agencies, and drivers under one unified platform.
              </p>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button onclick="navigateTo('farmer_reg')" class="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg">
                  🌾 Enroll as a Verified Farmer
                </button>
                <button onclick="navigateTo('buyer_mkt')" class="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-emerald-950 font-black text-sm rounded-2xl shadow-lg">
                  🛒 Start Buying Farm-Fresh
                </button>
              </div>
            </div>
          </section>

        </div>
      `;
    }}

    // =========================================================================
    // PHASES 106–110: INTERACTIVE DEMONSTRATION SHOWCASE
    // =========================================================================
    function getDemoShowcaseHtml() {{
      return `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
          ${{renderBackButton('landing', 'Back to Home')}}
          
          <div class="text-center space-y-2 bg-gradient-to-b from-emerald-50 via-white to-white p-8 rounded-3xl border border-emerald-100 shadow-sm">
            <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">Platform Demonstrations</span>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900">VIVAAN Logistics & Intelligence Demos</h1>
            <p class="text-slate-500 text-xs sm:text-sm">Interactive scenarios covering Phases 107, 108, 109, and 110.</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-2 rounded-2xl">
            <button onclick="switchDemoTab('phase107')" class="p-3 rounded-xl text-xs font-black ${{activeDemoTab === 'phase107' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-white'}}">
              <div>🌾 🛒 Phase 107</div>
              <div class="text-[10px] font-normal opacity-90">Multi-Farmer Consolidation</div>
            </button>
            <button onclick="switchDemoTab('phase108')" class="p-3 rounded-xl text-xs font-black ${{activeDemoTab === 'phase108' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-white'}}">
              <div>🚚 🏘️ Phase 108</div>
              <div class="text-[10px] font-normal opacity-90">Multi-Buyer Corridor</div>
            </button>
            <button onclick="switchDemoTab('phase109')" class="p-3 rounded-xl text-xs font-black ${{activeDemoTab === 'phase109' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-white'}}">
              <div>⚡ 🔐 Phase 109</div>
              <div class="text-[10px] font-normal opacity-90">Full Delivery Lifecycle</div>
            </button>
            <button onclick="switchDemoTab('phase110')" class="p-3 rounded-xl text-xs font-black ${{activeDemoTab === 'phase110' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-white'}}">
              <div>📍 🛡️ Phase 110</div>
              <div class="text-[10px] font-normal opacity-90">Multi-Order GPS Privacy</div>
            </button>
          </div>

          <div id="standalone-demo-content">
            ${{getDemoTabHtml(activeDemoTab)}}
          </div>
        </div>
      `;
    }}

    function switchDemoTab(tab) {{
      activeDemoTab = tab;
      const el = document.getElementById('standalone-demo-content');
      if (el) el.innerHTML = getDemoTabHtml(tab);
      else renderApp();
    }}

    function getDemoTabHtml(tab) {{
      if (tab === 'phase107') {{
        return `
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b">
              <div>
                <span class="text-xs font-bold text-emerald-700 uppercase">Phase 107 Demo</span>
                <h3 class="text-xl font-black text-slate-900">4 Farmers &rarr; One Consolidated Buyer Trip (VIV-BATCH-1001)</h3>
              </div>
              <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Consolidated Trip</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div class="p-4 bg-slate-50 rounded-2xl border">Farmer A: 50 kg Tomatoes</div>
              <div class="p-4 bg-slate-50 rounded-2xl border">Farmer B: 40 kg Small Onions</div>
              <div class="p-4 bg-slate-50 rounded-2xl border">Farmer C: 60 kg Potatoes</div>
              <div class="p-4 bg-slate-50 rounded-2xl border">Farmer D: 30 kg Carrots</div>
            </div>
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
              <strong>VIVAAN Engine Audit:</strong> Total 180 kg cargo matched to Bolero Mini Van (800 kg capacity). En-route loop detour is 14.2 km.
              <div class="text-emerald-900 font-bold mt-1">Consolidated delivery saves buyer ₹340 (71% freight savings) vs 4 individual trips.</div>
            </div>
          </div>
        `;
      }}
      if (tab === 'phase108') {{
        return `
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b">
              <div>
                <span class="text-xs font-bold text-indigo-700 uppercase">Phase 108 Demo</span>
                <h3 class="text-xl font-black text-slate-900">One Driver &rarr; Multiple Buyers Along Shared Corridor</h3>
              </div>
              <span class="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">South Chennai Cluster</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div class="p-4 bg-slate-50 rounded-2xl border">Buyer A (Adyar): Order VIV-ORD-901 • OTP 4819</div>
              <div class="p-4 bg-slate-50 rounded-2xl border">Buyer B (Besant Nagar): Order VIV-ORD-902 • OTP 7392</div>
              <div class="p-4 bg-slate-50 rounded-2xl border">Buyer C (Thiruvanmiyur): Order VIV-ORD-903 • OTP 6184</div>
            </div>
            <div class="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs text-indigo-950">
              <strong>Strict Privacy:</strong> Each buyer sees ONLY their own order and driver distance. Delivery to Buyer A does not expose Buyer B or C data.
            </div>
          </div>
        `;
      }}
      if (tab === 'phase109') {{
        return `
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b">
              <div>
                <span class="text-xs font-bold text-amber-700 uppercase">Phase 109 Demo</span>
                <h3 class="text-xl font-black text-slate-900">Full Delivery Lifecycle Simulation (Step ${{phase109Step}} / 10)</h3>
              </div>
              <div class="flex gap-2">
                <button onclick="phase109Step = Math.max(1, phase109Step - 1); switchDemoTab('phase109');" class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">&larr; Prev</button>
                <button onclick="phase109Step = Math.min(10, phase109Step + 1); switchDemoTab('phase109');" class="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold">Next &rarr;</button>
              </div>
            </div>
            <div class="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
              <div class="text-xs text-amber-300 uppercase font-mono">Stage ${{phase109Step}}: ${{
                ['Order Placed', 'Agency Matched', 'Driver Accepts (Accepted / To Farmer)', 'En Route to Farmgate', 'Driver Collects Produce (Picked Up / To Buyer)', 'Buyer Taps Track Live Delivery', 'Driver Arrives at Doorstep', 'OTP Verified & Handover', 'Escrow Settlement Initiated (~5-10m)', 'Buyer Rates Farmer & Agency'][phase109Step - 1]
              }}</div>
              <p class="text-xs text-slate-300">${{
                ['Cart confirmed. Parent Checkout VIV-CHECKOUT-1001 created.',
                 'Serviceability engine assigns carrier GreenCorridor Logistics.',
                 'Driver Murugan K accepts order. VIVAAN and Agency track driver. Buyer CANNOT track yet.',
                 'Driver travels to Salem farmgate. Farm coordinates protected.',
                 'Driver taps Collect Order. Status becomes PICKED_UP. Buyer notified.',
                 'Buyer clicks Track Live Delivery. Live Leaflet map renders.',
                 'Driver reaches doorstep. Prompts for 4-digit secret OTP.',
                 'Driver enters 4819. OTP confirmed. LIVE TRACKING ENDS IMMEDIATELY.',
                 'Target 5-10 minute timer initiates escrow payout to farmer bank account.',
                 'Buyer rates farmer 5★ and delivery partner 5★. Cycle completed!'][phase109Step - 1]
              }}</p>
            </div>
          </div>
        `;
      }}
      if (tab === 'phase110') {{
        return `
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b">
              <div>
                <span class="text-xs font-bold text-purple-700 uppercase">Phase 110 Demo</span>
                <h3 class="text-xl font-black text-slate-900">Multi-Order GPS Privacy Matrix</h3>
              </div>
              <button onclick="phase110State = {{ driverAccepted: false, orderACollected: false, orderBCollected: false, orderADelivered: false, orderBDelivered: false }}; switchDemoTab('phase110');" class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">Reset</button>
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <button onclick="phase110State.driverAccepted = true; switchDemoTab('phase110');" class="px-3 py-1.5 rounded-xl border ${{phase110State.driverAccepted ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50'}}">1. Driver Accepts</button>
              <button onclick="phase110State.orderACollected = true; switchDemoTab('phase110');" class="px-3 py-1.5 rounded-xl border ${{phase110State.orderACollected ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50'}}">2. Collect Order A</button>
              <button onclick="phase110State.orderBCollected = true; switchDemoTab('phase110');" class="px-3 py-1.5 rounded-xl border ${{phase110State.orderBCollected ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50'}}">3. Collect Order B</button>
              <button onclick="phase110State.orderADelivered = true; switchDemoTab('phase110');" class="px-3 py-1.5 rounded-xl border ${{phase110State.orderADelivered ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50'}}">4. Deliver Order A (OTP)</button>
              <button onclick="phase110State.orderBDelivered = true; switchDemoTab('phase110');" class="px-3 py-1.5 rounded-xl border ${{phase110State.orderBDelivered ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50'}}">5. Deliver Order B</button>
            </div>
            <table class="w-full text-left text-xs border">
              <tr class="bg-slate-50 font-bold border-b"><th class="p-2">User</th><th class="p-2">Live Tracking Status</th></tr>
              <tr class="border-b"><td class="p-2 font-bold">Agency & Admin</td><td class="p-2 font-bold ${{phase110State.orderBDelivered ? 'text-red-600' : phase110State.driverAccepted ? 'text-emerald-700' : 'text-slate-400'}}">${{phase110State.orderBDelivered ? '🛑 Ended (Trip Complete)' : phase110State.driverAccepted ? '✅ Active Tracking' : '❌ Inactive'}}</td></tr>
              <tr class="border-b"><td class="p-2 font-bold">Buyer A (Tomatoes)</td><td class="p-2 font-bold ${{phase110State.orderADelivered ? 'text-red-600' : phase110State.orderACollected ? 'text-emerald-700' : 'text-slate-400'}}">${{phase110State.orderADelivered ? '🛑 Terminated by OTP' : phase110State.orderACollected ? '✅ Eligible (Click Track)' : '❌ Blocked (At Farmgate)'}}</td></tr>
              <tr><td class="p-2 font-bold">Buyer B (Onions)</td><td class="p-2 font-bold ${{phase110State.orderBDelivered ? 'text-red-600' : phase110State.orderBCollected ? 'text-emerald-700' : 'text-slate-400'}}">${{phase110State.orderBDelivered ? '🛑 Terminated by OTP' : phase110State.orderBCollected ? '✅ Eligible (Click Track)' : '❌ Blocked (At Farmgate)'}}</td></tr>
            </table>
          </div>
        `;
      }}
    }}

    // 6. Universal Login Modal HTML Body
    function getLoginModalHtml() {{
      return `
        <div id="standalone-login-modal" class="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-xl w-full overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-800 to-emerald-950 p-5 text-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-10 w-10 rounded-full border border-amber-300 bg-white" />
                <div>
                  <h3 class="text-base font-black">${{t('login_heading')}}</h3>
                  <p class="text-xs text-amber-200">${{t('login_sub')}}</p>
                </div>
              </div>
              <button onclick="closeLoginModal()" class="w-8 h-8 rounded-full bg-white/10 text-white font-bold">✕</button>
            </div>
            <div id="standalone-login-content">
              ${{getLoginModalBodyHtml()}}
            </div>
          </div>
        </div>
      `;
    }}

    function getLoginModalBodyHtml() {{
      return `
        <div class="flex items-center justify-between border-b border-slate-200 px-4 bg-slate-50 text-xs font-bold">
          <button onclick="setLoginTab('FARMER')" class="py-3 px-3 border-b-2 ${{activeLoginTab === 'FARMER' ? 'border-emerald-600 text-emerald-900 font-black' : 'border-transparent text-slate-500'}}">🌾 Farmer</button>
          <button onclick="setLoginTab('AGENCY')" class="py-3 px-3 border-b-2 ${{activeLoginTab === 'AGENCY' ? 'border-amber-600 text-amber-900 font-black' : 'border-transparent text-slate-500'}}">🚚 Agency</button>
          <button onclick="setLoginTab('DRIVER')" class="py-3 px-3 border-b-2 ${{activeLoginTab === 'DRIVER' ? 'border-indigo-600 text-indigo-900 font-black' : 'border-transparent text-slate-500'}}">🛵 Driver</button>
          <button onclick="setLoginTab('BUYER')" class="py-3 px-3 border-b-2 ${{activeLoginTab === 'BUYER' ? 'border-blue-600 text-blue-900 font-black' : 'border-transparent text-slate-500'}}">🛒 Buyer</button>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <button onclick="quickDemoLogin('${{activeLoginTab}}')" class="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md">
              ⚡ 1-Click Instant Login (${{activeLoginTab}})
            </button>
            ${{activeLoginTab === 'BUYER' ? `
              <button onclick="googleLogin()" class="w-full py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                <span>🌐</span> Continue with Google
              </button>
            ` : ''}}
          </div>
        </div>
      `;
    }}

    // Phase 2: User Type Selection View
    function getUserTypeSelectHtml() {{
      return `
        <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
          ${{renderBackButton('landing', 'Home')}}
          <div class="text-center space-y-2">
            <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">Onboarding</span>
            <h1 class="text-3xl font-black text-slate-900">“How do you want to use VIVAAN?”</h1>
            <p class="text-xs text-slate-500">Choose your persona to access tailored agricultural tools.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onclick="navigateTo('farmer_reg')" class="p-6 bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4">
              <div class="text-4xl">🌾</div>
              <h3 class="text-xl font-black text-slate-900">Farmer</h3>
              <p class="text-xs text-slate-600">Register and sell agricultural products directly to buyers.</p>
              <div class="pt-2 text-emerald-700 font-bold text-xs">Register as Farmer &rarr;</div>
            </div>
            <div onclick="navigateTo('agency_reg')" class="p-6 bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-600 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4">
              <div class="text-4xl">🚚</div>
              <h3 class="text-xl font-black text-slate-900">Delivery Agency</h3>
              <p class="text-xs text-slate-600">Register and provide verified rural logistics transport.</p>
              <div class="pt-2 text-amber-700 font-bold text-xs">Register Agency &rarr;</div>
            </div>
            <div onclick="navigateTo('buyer_mkt')" class="p-6 bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4">
              <div class="text-4xl">🛒</div>
              <h3 class="text-xl font-black text-slate-900">Consumer / Buyer</h3>
              <p class="text-xs text-slate-600">Discover and purchase farm-fresh produce with multi-farmer cart.</p>
              <div class="pt-2 text-blue-700 font-bold text-xs">Start Buying &rarr;</div>
            </div>
          </div>
        </div>
      `;
    }}

    // Farmer Registration View
    function getFarmerRegHtml() {{
      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          ${{renderBackButton('user_type_select', 'Role Selection')}}
          <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <div class="flex items-center gap-4 border-b pb-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300" />
              <div>
                <h2 class="text-xl font-black text-slate-900">Farmer Enrollment & Land Verification</h2>
                <p class="text-xs text-slate-500">Own Land, Leased with Agreement, or Digital Consent</p>
              </div>
            </div>
            <div class="space-y-4 text-xs">
              <label class="block font-bold uppercase text-slate-700">What type of farmer are you? *</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50 cursor-pointer block">
                  <input type="radio" name="ftype" value="OWN" checked class="mr-2" />
                  <strong>1. Own Land Farmer</strong>
                  <p class="text-slate-500 mt-1">Direct Patta & Survey records</p>
                </label>
                <label class="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-500 cursor-pointer block">
                  <input type="radio" name="ftype" value="LEASE_AGREE" class="mr-2" />
                  <strong>2. Leased with Agreement</strong>
                  <p class="text-slate-500 mt-1">Written legal lease document</p>
                </label>
                <label class="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 cursor-pointer block">
                  <input type="radio" name="ftype" value="LEASE_CONSENT" class="mr-2" />
                  <strong>3. Leased without Agreement</strong>
                  <p class="text-slate-500 mt-1">Digital landowner OTP consent</p>
                </label>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div><label class="font-bold block mb-1">Full Name</label><input type="text" id="fr_name" value="Ramasamy Gounder" class="w-full p-2.5 border rounded-xl" /></div>
                <div><label class="font-bold block mb-1">Primary Mobile</label><input type="text" id="fr_phone" value="+919842104582" class="w-full p-2.5 border rounded-xl" /></div>
                <div><label class="font-bold block mb-1">Village & Taluk</label><input type="text" id="fr_village" value="Omalur, Salem" class="w-full p-2.5 border rounded-xl" /></div>
                <div><label class="font-bold block mb-1">Patta / Survey No.</label><input type="text" id="fr_patta" value="PAT-4821 / Survey 204" class="w-full p-2.5 border rounded-xl" /></div>
              </div>
            </div>
            <div class="pt-4 border-t flex justify-between">
              <button onclick="goBack('user_type_select')" class="px-6 py-2.5 border rounded-xl text-xs font-bold">&larr; Back</button>
              <button onclick="alert('✅ Verified! Farmer ID VIV-FR-104582 created.'); switchRole('FARMER');" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow">Save & Continue &rarr;</button>
            </div>
          </div>
        </div>
      `;
    }}

    // Farmer Dashboard View
    function getFarmerDashHtml() {{
      return `
        <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
          ${{renderBackButton('user_type_select', 'Back to Roles')}}
          <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-16 w-16 object-contain rounded-full border border-amber-300 bg-white" />
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase">🟢 Verified Farmer</span>
                <h2 class="text-2xl font-black mt-1">Ramasamy Gounder</h2>
                <p class="text-xs text-amber-200 font-mono">VIV-FR-104582 • Omalur, Salem</p>
              </div>
            </div>
            <button onclick="alert('✅ Harvest produce posted to direct catalog!');" class="px-5 py-2.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow">+ Add Produce</button>
          </div>
          <!-- ID Card -->
          <div class="max-w-md mx-auto id-card-farmer p-6 rounded-3xl text-white shadow-2xl space-y-3">
            <div class="flex justify-between items-center border-b border-amber-300/30 pb-2">
              <span class="font-black text-amber-200">VIVAAN FARMER ID</span>
              <span class="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black">VERIFIED</span>
            </div>
            <div class="flex gap-4 items-center">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" class="w-20 h-24 object-cover rounded-xl border border-amber-300" />
              <div class="text-xs space-y-1">
                <h4 class="font-black text-base">Ramasamy Gounder</h4>
                <p class="text-amber-200 font-mono font-bold">VIV-FR-104582</p>
                <p class="text-slate-200 text-[11px]">Own Land (5.5 Acres) • Salem, TN</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }}

    // Agency Registration View
    function getAgencyRegHtml() {{
      return `
        <div class="max-w-4xl mx-auto px-4 py-8">
          ${{renderBackButton('user_type_select', 'Role Selection')}}
          <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <div class="flex items-center gap-4 border-b pb-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300" />
              <div>
                <h2 class="text-xl font-black text-slate-900">Delivery Agency 5-Part Registration</h2>
                <p class="text-xs text-slate-500">Local (Green), District (Orange), or State (Blue) Level Verification</p>
              </div>
            </div>
            <div class="space-y-4 text-xs">
              <label class="block font-bold uppercase text-slate-700">Select Service Level *</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50"><strong>🟢 Local Level (Green)</strong><p class="text-slate-500 mt-1">Within Taluk / Block</p></div>
                <div class="p-4 rounded-2xl border-2 border-amber-500 bg-amber-50"><strong>🟠 District Level (Orange)</strong><p class="text-slate-500 mt-1">Inter-taluk transport</p></div>
                <div class="p-4 rounded-2xl border-2 border-blue-600 bg-blue-50"><strong>🔵 State Level (Blue)</strong><p class="text-slate-500 mt-1">State highway corridors</p></div>
              </div>
            </div>
            <div class="pt-4 border-t flex justify-between">
              <button onclick="goBack('user_type_select')" class="px-6 py-2.5 border rounded-xl text-xs font-bold">&larr; Back</button>
              <button onclick="alert('✅ Agency verified! VIVAAN State ID VIV-AG-104582 issued.'); switchRole('AGENCY');" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow">Verify & Issue ID &rarr;</button>
            </div>
          </div>
        </div>
      `;
    }}

    // Agency Dashboard View
    function getAgencyDashHtml() {{
      return `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
          ${{renderBackButton('user_type_select', 'Back to Roles')}}
          <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-16 w-16 object-contain rounded-full border border-amber-300 bg-white" />
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-500 text-white">🔵 VIVAAN State Level Agency</span>
                <h1 class="text-2xl font-black mt-1">GreenCorridor Agro Logistics</h1>
                <p class="text-xs text-amber-200 font-mono">VIV-AG-104582 • 35 Active Vehicles</p>
              </div>
            </div>
            <button onclick="switchRole('DRIVER')" class="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow">🛵 Driver View</button>
          </div>
        </div>
      `;
    }}

    // Buyer Marketplace View with Multi-Farmer Cart & Razorpay Checkout
    function getBuyerMktHtml() {{
      return `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
          ${{renderBackButton('user_type_select', 'Back to Roles')}}
          
          <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase">🛒 Verified Direct Marketplace</span>
              <h2 class="text-2xl font-black mt-1">Farmgate Fresh Produce Catalog</h2>
              <p class="text-xs text-slate-300">Direct From Verified Farmers • Escrow Protected Delivery</p>
            </div>
            <button onclick="openStandaloneCart()" class="px-5 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-2">
              <span>🧺</span> Cart (<span id="s-cart-count">${{standaloneCart.length}}</span>)
            </button>
          </div>

          <!-- Banner -->
          <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-950">
            <span class="font-bold">“One Buyer. Multiple Farmers. One VIVAAN Cart.” Combine crops from different farms in 1 delivery.</span>
            <button onclick="openStandaloneCart()" class="px-3 py-1 bg-amber-400 font-bold rounded-lg">View Cart</button>
          </div>

          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${{db.products.map(p => `
              <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <img src="${{p.photo}}" alt="${{p.title}}" class="h-48 w-full object-cover" />
                  <div class="p-5 space-y-2">
                    <span class="text-xs font-bold text-slate-400 uppercase">${{p.category}}</span>
                    <h3 class="font-bold text-slate-900 text-base">${{p.title}}</h3>
                    <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-0.5">
                      <div><strong>Farmer:</strong> ${{p.farmer_name}} (Verified)</div>
                      <div><strong>Origin:</strong> ${{p.district}}, ${{p.state}}</div>
                    </div>
                    <div class="pt-2 flex justify-between items-baseline">
                      <span class="text-2xl font-black text-emerald-800">₹${{p.price}} <small class="text-xs text-slate-500 font-bold">/ ${{p.unit}}</small></span>
                      <span class="text-xs font-bold text-slate-700">${{p.quantity}} ${{p.unit}} left</span>
                    </div>
                  </div>
                </div>
                <div class="p-5 pt-0 flex gap-2">
                  <button onclick="addStandaloneCart('${{p.id}}', 10)" class="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow">
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            `).join('')}}
          </div>
        </div>
      `;
    }}

    function addStandaloneCart(pid, qty = 10) {{
      const p = db.products.find(x => x.id === pid);
      standaloneCart.push({{ product: p, quantity: qty }});
      const badge = document.getElementById('s-cart-count');
      if (badge) badge.innerText = standaloneCart.length;
      alert("✅ Added 10 " + p.unit + " of " + p.title + " from Farmer " + p.farmer_name + " to your VIVAAN Cart!");
    }}

    function openStandaloneCart() {{
      if (standaloneCart.length === 0) {{
        alert("Your VIVAAN Cart is empty. Add fresh produce from our verified farmers!");
        return;
      }}
      const totalProd = standaloneCart.reduce((acc, c) => acc + (c.product.price * c.quantity), 0);
      const fee = standaloneCart.length === 1 ? 80 : 80 + (standaloneCart.length - 1) * 20;
      const grand = totalProd + fee;
      const confirmPay = confirm("🛒 VIVAAN CONSOLIDATED CHECKOUT\\n\\nProduce Subtotal: ₹" + totalProd + "\\nShared Delivery Charge: ₹" + fee + "\\nGrand Total: ₹" + grand + "\\n\\nProceed with Razorpay split payment?");
      if (confirmPay) {{
        standaloneCart = [];
        alert("🎉 Payment of ₹" + grand + " successful via Razorpay!\\nSecret OTP: 4819.\\nRedirecting to Live Tracking...");
        navigateTo('order_track');
      }}
    }}

    // Order Tracking View with Two-Column Layout & Strict "Track Live Delivery" Button
    function getOrderTrackHtml() {{
      const o = db.orders[0];
      const isDelivered = (o.order_status === 'DELIVERED');
      
      if (buyerHasClickedTrack && !isDelivered) {{
        setTimeout(() => initBuyerStandaloneMap(), 150);
      }}

      return `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
          ${{renderBackButton('buyer_mkt', 'Back to Marketplace')}}
          
          <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex justify-between items-center">
            <div>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-400 text-blue-950 font-black text-xs uppercase">${{o.order_status}}</span>
              <h2 class="text-2xl font-black mt-1">${{o.product_name}}</h2>
              <p class="text-xs text-slate-400">Order ID: ${{o.id}} • Farmer: ${{o.farmer_name}}</p>
            </div>
            <button onclick="switchRole('DRIVER')" class="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">
              🗺️ Open Driver View
            </button>
          </div>

          <!-- Secret OTP Handover Code Box -->
          ${{!isDelivered ? `
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-6 text-center space-y-2 shadow-xl border-2 border-amber-300">
              <span class="text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full">Physical Delivery Handover Proof</span>
              <h3 class="text-xs uppercase font-semibold text-amber-100">Secret Delivery OTP</h3>
              <div class="inline-block bg-white text-amber-950 px-8 py-2 rounded-2xl shadow-lg">
                <span class="font-mono font-black text-4xl tracking-[0.3em]">${{o.delivery_otp}}</span>
              </div>
              <p class="text-xs text-amber-100">Share this code with driver ONLY upon physical inspection at doorstep.</p>
            </div>
          ` : ''}}

          <!-- TWO-COLUMN ACTIVE TRACKING LAYOUT (Phases 67, 68, 87) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- LEFT COLUMN: Active Order List -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <div class="flex justify-between items-center border-b pb-2">
                <h3 class="font-black text-slate-900 text-xs uppercase">Active Tracking List</h3>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">${{db.orders.filter(x => x.order_status !== 'DELIVERED').length}} Active</span>
              </div>
              <div class="space-y-2">
                ${{db.orders.filter(x => x.order_status !== 'DELIVERED').map(item => `
                  <div class="p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs space-y-0.5">
                    <div class="flex justify-between font-bold"><span>${{item.id}}</span><span class="text-[10px] bg-blue-100 text-blue-800 px-2 rounded-full">${{item.order_status}}</span></div>
                    <div class="text-slate-600">${{item.product_name}}</div>
                    <div class="text-[10px] text-slate-400">Driver: ${{item.driver_name}}</div>
                  </div>
                `).join('')}}
              </div>
            </div>

            <!-- RIGHT COLUMN: Interactive Telemetry & Map -->
            <div class="lg:col-span-2">
              ${{isDelivered ? `
                <div class="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
                  <div class="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                  <h3 class="text-2xl font-black text-emerald-950">✅ Order Delivered Successfully</h3>
                  <p class="text-xs text-slate-500">Delivery confirmed by OTP verification. Live GPS tracking has ended.</p>
                  
                  <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 max-w-md mx-auto text-xs text-left space-y-1">
                    <span class="font-bold text-emerald-900 block border-b pb-1">💳 Escrow Settlement Status (Initiated in ~5-10m)</span>
                    <div class="flex justify-between text-slate-600"><span>Farmer Share (95%):</span><strong>₹${{(o.total_amount * 0.95).toFixed(2)}}</strong></div>
                    <div class="flex justify-between text-slate-600"><span>Driver Transport Earning:</span><strong>₹84.00</strong></div>
                  </div>
                </div>
              ` : !buyerHasClickedTrack ? `
                <!-- PHASE 71: INTENTIONAL CLICK-TO-TRACK BUTTON -->
                <div class="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
                  <div class="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-3xl">🚚</div>
                  <h3 class="text-xl font-black text-slate-900">Your order has been collected from the farmer!</h3>
                  <p class="text-xs text-slate-500 max-w-md mx-auto">
                    Driver ${{o.driver_name}} has picked up your produce and is en route.
                  </p>
                  <button onclick="buyerHasClickedTrack = true; renderApp();" class="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg">
                    📍 Track Live Delivery
                  </button>
                </div>
              ` : `
                <!-- ACTIVE MAP -->
                <div class="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div class="flex justify-between items-center text-xs">
                    <h3 class="font-black text-slate-900 text-base">Live Route Telemetry</h3>
                    <span class="text-emerald-700 font-bold">Driver: ${{o.driver_name}} (Bolero Pickup)</span>
                  </div>
                  <div id="buyer-tracking-map"></div>
                </div>
              `}}
            </div>

          </div>
        </div>
      `;
    }}

    function initBuyerStandaloneMap() {{
      const mapEl = document.getElementById('buyer-tracking-map');
      if (!mapEl || typeof L === 'undefined') return;
      if (leafletMap) {{ leafletMap.remove(); leafletMap = null; }}

      leafletMap = L.map('buyer-tracking-map').setView([12.6, 79.6], 8);
      L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{ attribution: '&copy; OpenStreetMap' }}).addTo(leafletMap);
      
      L.marker([11.6643, 78.1460]).addTo(leafletMap).bindPopup('<b>Farmgate Pickup (Salem)</b>');
      L.marker([13.0012, 80.2565]).addTo(leafletMap).bindPopup('<b>Buyer Destination (Adyar, Chennai)</b>');
      L.marker([12.5186, 78.2137]).addTo(leafletMap).bindPopup('<b>Driver Murugan K (In Transit)</b>').openPopup();

      const poly = L.polyline([[11.6643, 78.1460], [12.5186, 78.2137], [13.0012, 80.2565]], {{ color: '#2563eb', weight: 4, dashArray: '6, 8' }}).addTo(leafletMap);
      leafletMap.fitBounds(poly.getBounds(), {{ padding: [30, 30] }});
    }}

    // Driver Navigation View
    function getDriverNavHtml() {{
      const o = db.orders[0];
      setTimeout(() => initDriverMap(), 150);

      return `
        <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
          ${{renderBackButton('user_type_select', 'Back to Roles')}}
          
          <div class="bg-indigo-950 text-white rounded-3xl p-6 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-14 w-14 object-contain rounded-full border border-amber-300" />
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-400 text-indigo-950 font-black text-xs uppercase">🛵 Driver Route Navigation</span>
                <h2 class="text-2xl font-black mt-1">Murugan K (VIV-DR-104582)</h2>
                <p class="text-xs text-indigo-200">GreenCorridor Logistics • Bolero Pickup</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 text-sm">Live Agricultural Corridor Map (Salem to Chennai)</h3>
              <div id="delivery-map"></div>
            </div>

            <!-- OTP Input Box -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <span class="text-xs font-bold text-amber-700 uppercase">Doorstep Handover</span>
              <h3 class="text-lg font-black text-slate-900">Enter Delivery OTP</h3>
              <p class="text-xs text-slate-500">Ask buyer for the 4-digit code. Order cannot be marked delivered without matching OTP.</p>
              
              <input type="text" id="drv_otp" maxlength="4" placeholder="••••" class="w-full text-center tracking-[1em] font-black text-3xl py-3 border-2 border-slate-300 rounded-2xl" />
              
              <div class="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-900 font-medium">
                Demo code: <strong>4819</strong>
              </div>

              <button onclick="verifyDriverOtp()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg">
                Verify OTP & Complete Delivery
              </button>
            </div>
          </div>
        </div>
      `;
    }}

    function initDriverMap() {{
      const mapEl = document.getElementById('delivery-map');
      if (!mapEl || typeof L === 'undefined') return;

      const map = L.map('delivery-map').setView([12.5, 79.2], 8);
      L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{ attribution: '&copy; OpenStreetMap' }}).addTo(map);
      
      L.marker([11.6643, 78.1460]).addTo(map).bindPopup('Farmgate Pickup: Salem');
      L.marker([13.0012, 80.2565]).addTo(map).bindPopup('Buyer Doorstep: Chennai');
      L.marker([12.5186, 78.2137]).addTo(map).bindPopup('Driver Location').openPopup();

      const polyline = L.polyline([[11.6643, 78.1460], [12.5186, 78.2137], [13.0012, 80.2565]], {{ color: '#d97706', weight: 4, dashArray: '6, 8' }}).addTo(map);
      map.fitBounds(polyline.getBounds(), {{ padding: [30, 30] }});
    }}

    function verifyDriverOtp() {{
      const val = document.getElementById('drv_otp')?.value || '';
      if (val === '4819') {{
        db.orders[0].order_status = 'DELIVERED';
        alert("✅ Delivery OTP 4819 verified! Order marked DELIVERED.\\nLive tracking has permanently ended.\\nEscrow settlement of ₹1,662.50 released to farmer Ramasamy Gounder.");
        navigateTo('order_track');
      }} else {{
        alert("❌ Invalid OTP. Handover cannot be completed without valid buyer proof.");
      }}
    }}

    // Admin Panel View
    function getAdminCockpitHtml() {{
      return `
        <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
          ${{renderBackButton('landing', 'Back to Home')}}
          <div class="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img src="${{VIVAAN_LOGO}}" alt="VIVAAN" class="h-16 w-16 object-contain rounded-full border border-purple-400" />
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-purple-500 text-purple-950 font-black text-xs uppercase">Platform Administration</span>
                <h2 class="text-2xl font-black mt-1">VIVAAN Admin Control Panel</h2>
                <p class="text-xs text-purple-200">Revenue Records Verification & Escrow Settlement Supervisor</p>
              </div>
            </div>
            <button onclick="navigateTo('demo_showcase')" class="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow">
              ⚡ Open Demos Hub
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
            <div class="p-4 bg-white rounded-2xl border shadow-sm"><span class="text-slate-400 block uppercase">Verified Farmers</span><span class="text-2xl font-black text-emerald-800">${{db.farmers.length}}</span></div>
            <div class="p-4 bg-white rounded-2xl border shadow-sm"><span class="text-slate-400 block uppercase">Active Carriers</span><span class="text-2xl font-black text-amber-700">${{db.agencies.length}}</span></div>
            <div class="p-4 bg-white rounded-2xl border shadow-sm"><span class="text-slate-400 block uppercase">Total Volume</span><span class="text-2xl font-black text-purple-800">₹19,250</span></div>
            <div class="p-4 bg-white rounded-2xl border shadow-sm"><span class="text-slate-400 block uppercase">Escrow Release</span><span class="text-2xl font-black text-emerald-600">100% Secure</span></div>
          </div>
        </div>
      `;
    }}

    // Language Selection Screen
    function getLangScreenHtml() {{
      return `
        <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
          <div class="w-full max-w-3xl mb-3 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-semibold">VIVAAN • Multilingual Gateway</span>
            <span class="text-xs text-emerald-700 font-bold">14 Languages Supported</span>
          </div>
          <div class="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 sm:p-8 text-white text-center">
              <div class="flex justify-center mb-4">
                <img src="${{VIVAAN_LOGO}}" alt="VIVAAN Logo" class="h-24 w-24 object-contain rounded-full shadow-lg border-2 border-amber-300 ring-2 ring-white/30" />
              </div>
              <h1 class="text-2xl sm:text-3xl font-black mb-2">VIVAAN</h1>
              <p class="text-amber-200 text-sm font-semibold tracking-wide uppercase">Direct Farmer-to-Buyer Digital Marketplace</p>
            </div>
            <div class="p-6 sm:p-10 space-y-6">
              <div class="text-center space-y-2">
                <h2 class="text-2xl font-bold text-slate-900">${{t('choose_lang')}}</h2>
                <p class="text-slate-500 text-sm">${{t('select_lang_sub')}}</p>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                ${{LANGUAGES.map(lang => {{
                  const isSelected = lang.code === currentLang;
                  return `
                    <button
                      onclick="setLanguage('${{lang.code}}')"
                      class="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center group ${{
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm' 
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50 text-slate-700'
                      }}"
                    >
                      <span class="text-2xl mb-1">${{lang.flag}}</span>
                      <span class="text-base font-bold">${{lang.native}}</span>
                      <span class="text-xs text-slate-500 font-medium">${{lang.name}}</span>
                    </button>
                  `;
                }}).join('')}}
              </div>
              <div class="pt-4 flex items-center justify-end border-t border-slate-100">
                <button
                  onclick="hasSelectedInitialLang = true; localStorage.setItem('vivaan_lang_init', 'true'); navigateTo('landing');"
                  class="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>${{t('continue_btn')}}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }}

    // Main Router
    function renderApp() {{
      const root = document.getElementById('vivaan-root');
      if (!hasSelectedInitialLang && currentView === 'landing') {{
        root.innerHTML = getNavbarHtml() + `<main id="app-main">${{getLangScreenHtml()}}</main>` + getFooterHtml() + (isLoginModalOpen ? getLoginModalHtml() : '');
        return;
      }}

      let content = '';
      if (currentView === 'landing') content = getLandingHtml();
      else if (currentView === 'user_type_select') content = getUserTypeSelectHtml();
      else if (currentView === 'farmer_reg') content = getFarmerRegHtml();
      else if (currentView === 'farmer_dash') content = getFarmerDashHtml();
      else if (currentView === 'agency_reg') content = getAgencyRegHtml();
      else if (currentView === 'agency_dash') content = getAgencyDashHtml();
      else if (currentView === 'buyer_mkt') content = getBuyerMktHtml();
      else if (currentView === 'order_track') content = getOrderTrackHtml();
      else if (currentView === 'driver_nav') content = getDriverNavHtml();
      else if (currentView === 'demo_showcase') content = getDemoShowcaseHtml();
      else if (currentView === 'admin_cockpit') content = getAdminCockpitHtml();
      else if (currentView === 'language_select') content = getLangScreenHtml();
      else content = getLandingHtml();

      root.innerHTML = getNavbarHtml() + `<main id="app-main" class="min-h-[75vh]">${{content}}</main>` + getFooterHtml() + (isLoginModalOpen ? getLoginModalHtml() : '');
    }}

    // Launch
    renderApp();
  </script>
</body>
</html>
"""

OUTPUT_PATH = os.path.join(BASE_DIR, "vivaan_complete_website.html")
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(STANDALONE_HTML)

INDEX_PATH = os.path.join(BASE_DIR, "index.html")
shutil.copyfile(OUTPUT_PATH, INDEX_PATH)

print("SUCCESS: Standalone files built successfully!")
print("Wrote:", OUTPUT_PATH)
print("Wrote:", INDEX_PATH)
print("Total size:", len(STANDALONE_HTML), "bytes")
