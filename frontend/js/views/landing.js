/**
 * VIVAAN Landing Page View
 * Implements PHASE 1 – LANDING PAGE with all 22 sections in exact sequential order:
 *  1. Header (Top announcement & brand banner)
 *  2. Hero ("From Farmers Directly to Buyers")
 *  3. Trust/value features
 *  4. Problem (Middlemen inefficiencies & perishability)
 *  5. VIVAAN solution (The 4 core pillars)
 *  6. How VIVAAN works (5-step connected workflow)
 *  7. Farmer ecosystem (Own Land, Leased w/ Agreement, Leased w/out Agreement + Consent)
 *  8. Multi-farmer marketplace ("One Buyer. Multiple Farmers. One VIVAAN Cart.")
 *  9. Smart delivery (Local Green, District Orange, State Blue)
 * 10. Vehicle matching (2-Wheeler, Car, Pickup, Mini Van, Truck)
 * 11. Route optimization (Pickup-before-delivery TSP algorithm)
 * 12. Live tracking (Real-time GPS on Leaflet/Google Maps)
 * 13. Tracking privacy (Time-limited, order-specific, click-to-track, OTP termination)
 * 14. Razorpay payments (Transparent breakdown: Farmer price + Delivery fee)
 * 15. Delivery agency (5-part verification & fleet management)
 * 16. Driver (VIV-DRV ID, vehicle allocation, mobile GPS simulation)
 * 17. AI and weather (Role-specific intelligence & agronomic weather)
 * 18. Analytics (Transparent sales, inventory, vehicle utilization)
 * 19. Security (Role authorization, cryptographic OTP, sensitive document privacy)
 * 20. Why VIVAAN (Traditional supply chain vs VIVAAN platform comparison)
 * 21. Final CTA ("Join the Direct Agricultural Revolution")
 * 22. Footer (Ecosystem links, certifications, and language indicators)
 */
import { t } from '../i18n.js';

export function renderLanding() {
  return `
    <div class="space-y-20 pb-20">

      <!-- ==================================================================== -->
      <!-- SECTION 1: HEADER & TRUST ANNOUNCEMENT -->
      <!-- ==================================================================== -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-700/50">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            <span class="text-xs sm:text-sm font-bold tracking-wide">
              🌾 Direct Indian Agricultural Marketplace • 14 Indian Languages Supported
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <button onclick="window.vivaanApp.navigateTo('demo_showcase')" class="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl shadow transition-all transform hover:scale-105">
              ⚡ Explore Interactive Demos (Phases 106–110)
            </button>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 2: HERO ("From Farmers Directly to Buyers") -->
      <!-- ==================================================================== -->
      <section class="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-amber-50/20 to-white pt-8 pb-16 rounded-3xl border border-emerald-100/60 shadow-sm mx-4 sm:mx-8">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          <div class="flex justify-center mb-6">
            <div class="relative group cursor-pointer" onclick="window.vivaanApp.showLanguageModal()">
              <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-36 w-36 object-contain rounded-full shadow-2xl border-4 border-amber-300 ring-4 ring-emerald-600/20 transition-transform duration-300 group-hover:scale-105 bg-white" />
            </div>
          </div>

          <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-3">
            <span class="text-emerald-800 font-serif">VIVAAN</span>
          </h1>
          <p class="text-2xl sm:text-3xl font-black text-amber-800 mb-4 tracking-tight">
            “From Farmers Directly to Buyers”
          </p>
          <p class="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
            VIVAAN connects verified farmers, buyers, delivery partners, and intelligent logistics in one platform. No middlemen. Direct harvest prices. Consolidated rural transport.
          </p>

          <!-- 3 Primary Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button onclick="window.vivaanApp.navigateTo('farmer_register')" class="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
              <span class="text-2xl">🌾</span>
              <span>Join as Farmer</span>
            </button>

            <button onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-black text-base rounded-2xl shadow-lg shadow-slate-900/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
              <span class="text-2xl">🛒</span>
              <span>Start Buying</span>
            </button>

            <button onclick="window.vivaanApp.navigateTo('agency_register')" class="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
              <span class="text-2xl">🚚</span>
              <span>Register Delivery Agency</span>
            </button>
          </div>

          <!-- Direct Persona Logins -->
          <div class="mt-10 pt-8 border-t border-emerald-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              🔑 Already Registered? Sign In By Persona:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <button onclick="window.vivaanApp.showLoginModal('FARMER')" class="p-3 bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl shadow-sm text-left transition-all flex items-center gap-3">
                <span class="text-2xl p-2 bg-emerald-100 rounded-xl">🌾</span>
                <div>
                  <div class="text-xs font-black">Farmer Login</div>
                  <div class="text-[11px] text-slate-500">Farmer ID + Password</div>
                </div>
              </button>
              <button onclick="window.vivaanApp.showLoginModal('AGENCY')" class="p-3 bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-200 hover:border-amber-500 rounded-2xl shadow-sm text-left transition-all flex items-center gap-3">
                <span class="text-2xl p-2 bg-amber-100 rounded-xl">🚚</span>
                <div>
                  <div class="text-xs font-black">Agency Login</div>
                  <div class="text-[11px] text-slate-500">Agency ID + Password</div>
                </div>
              </button>
              <button onclick="window.vivaanApp.showLoginModal('DRIVER')" class="p-3 bg-white hover:bg-indigo-50 text-indigo-950 border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl shadow-sm text-left transition-all flex items-center gap-3">
                <span class="text-2xl p-2 bg-indigo-100 rounded-xl">🛵</span>
                <div>
                  <div class="text-xs font-black">Driver Login</div>
                  <div class="text-[11px] text-slate-500">Driver ID + PIN</div>
                </div>
              </button>
              <button onclick="window.vivaanApp.showLoginModal('BUYER')" class="p-3 bg-white hover:bg-blue-50 text-blue-950 border-2 border-blue-200 hover:border-blue-500 rounded-2xl shadow-sm text-left transition-all flex items-center gap-3">
                <span class="text-2xl p-2 bg-blue-100 rounded-xl">🛒</span>
                <div>
                  <div class="text-xs font-black">Buyer Sign In</div>
                  <div class="text-[11px] text-slate-500">Continue with Google</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 3: TRUST / VALUE FEATURES -->
      <!-- ==================================================================== -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">🌱</div>
            <h3 class="text-base font-black text-slate-900">Verified Agricultural Identity</h3>
            <p class="text-xs text-slate-600 leading-relaxed">Multi-evidence land and identity authentication ensuring every farmer is genuine.</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">💰</div>
            <h3 class="text-base font-black text-slate-900">Farmer-Fixed Pricing</h3>
            <p class="text-xs text-slate-600 leading-relaxed">Farmers fix their own harvest prices. VIVAAN never silently discounts or alters base rates.</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl">📦</div>
            <h3 class="text-base font-black text-slate-900">Multi-Farmer Cart</h3>
            <p class="text-xs text-slate-600 leading-relaxed">Order diverse crops from multiple farmers across districts in one unified shopping cart.</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl">🔐</div>
            <h3 class="text-base font-black text-slate-900">Delivery OTP & Escrow</h3>
            <p class="text-xs text-slate-600 leading-relaxed">Funds remain protected in escrow until the buyer confirms handover with a secure 4-digit OTP.</p>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 4: THE PROBLEM -->
      <!-- ==================================================================== -->
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
              <p>Traders, brokers, commission agents, and wholesalers capture up to 55% of the consumer price, leaving farmers with minimal margins.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm space-y-2">
              <span class="text-2xl">⏱️</span>
              <h4 class="font-bold text-sm text-red-950">Delayed & Opaque Payments</h4>
              <p>Farmers often wait weeks or months for payments, facing arbitrary deductions for 'grade defects' without evidence.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-red-100 shadow-sm space-y-2">
              <span class="text-2xl">🚛</span>
              <h4 class="font-bold text-sm text-red-950">Uncoordinated Rural Logistics</h4>
              <p>Individual farm trips cause massive fuel wastage, high freight costs, and high spoilage before produce reaches consumers.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 5: THE VIVAAN SOLUTION -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div class="text-center max-w-3xl mx-auto">
            <span class="text-xs font-black text-amber-300 uppercase tracking-widest">The VIVAAN Solution</span>
            <h2 class="text-3xl sm:text-4xl font-black mt-2">A Unified, Intelligent Agricultural Ecosystem</h2>
            <p class="text-sm text-emerald-100 mt-3 leading-relaxed">
              VIVAAN creates a complete, unbroken digital highway connecting verified farmers, buyers, delivery agencies, and drivers in real time.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
              <div class="text-2xl">🌾</div>
              <h4 class="font-bold text-sm text-amber-200">100% Direct Marketplace</h4>
              <p class="text-emerald-100">Buyers buy straight from farmers. Farmers retain 95% of the farmgate product price.</p>
            </div>
            <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
              <div class="text-2xl">📑</div>
              <h4 class="font-bold text-sm text-amber-200">Tri-Tier Verification</h4>
              <p class="text-emerald-100">Authenticates Own Land, Leased with Agreement, and Leased without Agreement with digital landowner consent.</p>
            </div>
            <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
              <div class="text-2xl">🚚</div>
              <h4 class="font-bold text-sm text-amber-200">Consolidated Logistics</h4>
              <p class="text-emerald-100">Intelligent route optimization combines multi-farmer pickups and multi-buyer deliveries.</p>
            </div>
            <div class="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 space-y-2">
              <div class="text-2xl">💳</div>
              <h4 class="font-bold text-sm text-amber-200">Escrow Security</h4>
              <p class="text-emerald-100">Integrated Razorpay payments release payouts to farmer accounts within 5–10 minutes of OTP delivery.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 6: HOW VIVAAN WORKS -->
      <!-- ==================================================================== -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12">
          <span class="text-xs font-black text-emerald-700 uppercase tracking-wider">Step-by-Step Architecture</span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mt-1">How VIVAAN Works</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-2">Every agricultural transaction is verified, transparent, and protected.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center text-sm">1</div>
            <h4 class="font-bold text-slate-900 text-sm">Farmer Verification</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Patta/Chitta, Survey Number, Bank Account, and KYC verification lead to a unique VIVAAN Farmer ID.</p>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center text-sm">2</div>
            <h4 class="font-bold text-slate-900 text-sm">Direct Harvest Posting</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Farmers post real produce photos, available quantities, units, harvest dates, and fixed selling prices.</p>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center text-sm">3</div>
            <h4 class="font-bold text-slate-900 text-sm">Multi-Farmer Cart</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Buyers combine crops from multiple farmers in one cart. Automatic inventory deduction prevents overselling.</p>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center text-sm">4</div>
            <h4 class="font-bold text-slate-900 text-sm">Smart Logistics & GPS</h4>
            <p class="text-xs text-slate-500 leading-relaxed">VIVAAN matches verified carriers, reserves vehicle capacity, and provides role-based live GPS tracking.</p>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center text-sm">5</div>
            <h4 class="font-bold text-slate-900 text-sm">OTP Handover & Payout</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Driver verifies 4-digit OTP. Live tracking ends immediately. Escrow settlement triggers in ~5–10 minutes.</p>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 7: FARMER ECOSYSTEM -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Farmer Onboarding</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Comprehensive Tri-Category Farmer System</h2>
            <p class="text-xs text-slate-500 mt-1">Recognizing India's diverse farming land ownership structures.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <span class="px-2.5 py-1 bg-emerald-700 text-white rounded-full font-bold text-[10px] uppercase">Type 1</span>
              <h4 class="font-bold text-sm text-emerald-950">Own Land Farmer</h4>
              <p class="text-slate-600 leading-relaxed">Authenticated via Patta, Chitta, Village Survey Number, Subdivision Number, and Title Documents.</p>
              <div class="text-[11px] text-emerald-800 font-bold">✓ Direct ownership credentials verified</div>
            </div>
            <div class="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <span class="px-2.5 py-1 bg-amber-700 text-white rounded-full font-bold text-[10px] uppercase">Type 2</span>
              <h4 class="font-bold text-sm text-amber-950">Leased Farmer With Agreement</h4>
              <p class="text-slate-600 leading-relaxed">Registered lease agreement, duration dates, landowner KYC, and cultivation terms signed by both parties.</p>
              <div class="text-[11px] text-amber-800 font-bold">✓ Legal lease record verification</div>
            </div>
            <div class="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
              <span class="px-2.5 py-1 bg-blue-700 text-white rounded-full font-bold text-[10px] uppercase">Type 3</span>
              <h4 class="font-bold text-sm text-blue-950">Leased Without Agreement</h4>
              <p class="text-slate-600 leading-relaxed">Secure digital consent flow: Landowner receives encrypted OTP/link to confirm cultivation rights.</p>
              <div class="text-[11px] text-blue-800 font-bold">✓ Landowner digital timestamp consent</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 8: MULTI-FARMER MARKETPLACE -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <span class="text-xs font-black text-amber-300 uppercase tracking-widest">Marketplace Innovation</span>
              <h2 class="text-2xl sm:text-3xl font-black mt-1">“One Buyer. Multiple Farmers. One VIVAAN Cart.”</h2>
              <p class="text-xs text-slate-300 mt-1">Single checkout creates separate order items per farmer with shared delivery consolidation.</p>
            </div>
            <button onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all transform hover:scale-105">
              Explore Live Marketplace &rarr;
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div class="text-xl">🍅</div>
              <div class="font-bold text-white mt-1">Tomatoes</div>
              <div class="text-[11px] text-slate-400">Farmer A (Salem)</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div class="text-xl">🧅</div>
              <div class="font-bold text-white mt-1">Shallots</div>
              <div class="text-[11px] text-slate-400">Farmer B (Erode)</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div class="text-xl">🥔</div>
              <div class="font-bold text-white mt-1">Potatoes</div>
              <div class="text-[11px] text-slate-400">Farmer C (Yercaud)</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div class="text-xl">🥕</div>
              <div class="font-bold text-white mt-1">Carrots</div>
              <div class="text-[11px] text-slate-400">Farmer D (Dharmapuri)</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 9: SMART DELIVERY -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Intelligent Carrier Matching</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">3-Tier Certified Delivery Classification</h2>
            <p class="text-xs text-slate-500 mt-1">Preventing wrong agency assignments and delivery failures.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-500 space-y-2 text-emerald-950">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span class="font-black uppercase tracking-wider text-[11px]">Green Local Level</span>
              </div>
              <h4 class="font-black text-base">VIVAAN LOCAL LEVEL DELIVERY AGENCY</h4>
              <p class="text-slate-600">Specialized in taluk-to-taluk and intra-district fresh produce transport within a 45 km radius.</p>
            </div>
            <div class="p-5 bg-amber-50/80 rounded-2xl border-2 border-amber-500 space-y-2 text-amber-950">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                <span class="font-black uppercase tracking-wider text-[11px]">Orange District Level</span>
              </div>
              <h4 class="font-black text-base">VIVAAN DISTRICT LEVEL DELIVERY AGENCY</h4>
              <p class="text-slate-600">Cross-district coverage across agricultural hubs, mandi corridors, and regional transit hubs.</p>
            </div>
            <div class="p-5 bg-blue-50/80 rounded-2xl border-2 border-blue-500 space-y-2 text-blue-950">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                <span class="font-black uppercase tracking-wider text-[11px]">Blue State Level</span>
              </div>
              <h4 class="font-black text-base">VIVAAN STATE LEVEL DELIVERY AGENCY</h4>
              <p class="text-slate-600">State-wide and inter-state refrigerated and heavy freight fleet networks linking major metros.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 10: VEHICLE MATCHING -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Fleet Engineering</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Verified Vehicle Capacity Matching</h2>
            <p class="text-xs text-slate-500 mt-1">Automatic matching against verified weight and volume constraints.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div class="text-2xl">🛵</div>
              <div class="font-black text-slate-900">2-Wheeler</div>
              <div class="text-emerald-700 font-bold">Up to 30 kg</div>
              <div class="text-[10px] text-slate-400">Hyperlocal & Herbs</div>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div class="text-2xl">🚗</div>
              <div class="font-black text-slate-900">Car / Hatch</div>
              <div class="text-emerald-700 font-bold">Up to 150 kg</div>
              <div class="text-[10px] text-slate-400">Urban Fresh Crates</div>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div class="text-2xl">🛻</div>
              <div class="font-black text-slate-900">Pickup Truck</div>
              <div class="text-emerald-700 font-bold">Up to 1,200 kg</div>
              <div class="text-[10px] text-slate-400">Farmgate Bulk Bins</div>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div class="text-2xl">🚐</div>
              <div class="font-black text-slate-900">Mini Van</div>
              <div class="text-emerald-700 font-bold">Up to 800 kg</div>
              <div class="text-[10px] text-slate-400">Weatherproof Produce</div>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div class="text-2xl">🚛</div>
              <div class="font-black text-slate-900">Heavy Truck</div>
              <div class="text-emerald-700 font-bold">Up to 10,000 kg</div>
              <div class="text-[10px] text-slate-400">Inter-District Grains</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 11: ROUTE OPTIMIZATION -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Algorithmic Efficiency</span>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Multi-Stop Route Optimization</h2>
              <p class="text-xs text-slate-500 mt-1">Strict Pickup-Before-Delivery sequencing honoring cargo dependencies.</p>
            </div>
            <button onclick="window.vivaanApp.navigateTo('demo_showcase')" class="px-4 py-2 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-black">
              View Live Simulation &rarr;
            </button>
          </div>
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
            <div class="text-emerald-800 font-bold">Driver Dispatch &rarr; Farmgate A &rarr; Farmgate B &rarr; Farmgate C &rarr; Doorstep A &rarr; Doorstep B</div>
            <p class="font-sans text-slate-500 text-[11px]">Considers: Real GPS coords, vehicle weight capacity reservations, road detours, driver shifts, and delivery time windows.</p>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 12: LIVE TRACKING -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span class="text-xs font-black text-amber-400 uppercase tracking-widest">Interactive Telemetry</span>
              <h2 class="text-2xl sm:text-3xl font-black mt-1">Role-Based Live GPS Tracking</h2>
              <p class="text-xs text-slate-300 mt-1">Integrated with Leaflet / Google Maps Platform for real-time driver coordinates.</p>
            </div>
            <button onclick="window.vivaanApp.navigateTo('order_tracking')" class="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg">
              Open Tracking View &rarr;
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div class="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span class="text-amber-300 font-bold">Admin Tracking</span>
              <p class="text-slate-300">Complete active trip visibility across all verified delivery corridors.</p>
            </div>
            <div class="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span class="text-amber-300 font-bold">Agency Tracking</span>
              <p class="text-slate-300">Live monitoring restricted exclusively to the agency's own drivers and vehicles.</p>
            </div>
            <div class="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
              <span class="text-amber-300 font-bold">Buyer Tracking</span>
              <p class="text-slate-300">Available only after produce is collected and after buyer taps 'Track Live Delivery'.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 13: TRACKING PRIVACY -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Strict Safeguards</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Privacy-Preserving Telemetry Rules</h2>
            <p class="text-xs text-slate-500 mt-1">Location data is order-specific, role-specific, and time-limited.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div class="p-5 bg-red-50/60 rounded-2xl border border-red-200 space-y-2">
              <h4 class="font-black text-red-950 text-sm">🛑 No Pre-Collection Tracking</h4>
              <p class="text-slate-600">Buyers cannot see live driver location while the driver is en route to the farmgate. Protects farm coordinates.</p>
            </div>
            <div class="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <h4 class="font-black text-amber-950 text-sm">🟡 Intentional Click-to-Track</h4>
              <p class="text-slate-600">Maps do not load GPS automatically. Buyers must explicitly click "Track Live Delivery" to access telemetry.</p>
            </div>
            <div class="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
              <h4 class="font-black text-emerald-950 text-sm">✅ Immediate Post-OTP Cutoff</h4>
              <p class="text-slate-600">The millisecond the 4-digit handover OTP is confirmed, live tracking permanently terminates for that order.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 14: RAZORPAY PAYMENTS -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Financial Transparency</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Razorpay Escrow & Split Payment Flow</h2>
            <p class="text-xs text-slate-500 mt-1">Transparent breakdown: Farmer Product Amount + Delivery Charge = Grand Total.</p>
          </div>
          <div class="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Farmer Produce Subtotal (4 Crops):</span>
              <span class="font-bold text-slate-900">₹5,600.00</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Consolidated Shared Delivery Charge:</span>
              <span class="font-bold text-slate-900">₹140.00</span>
            </div>
            <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
              <span>Platform Protocol Processing (5%):</span>
              <span class="font-bold text-slate-900">₹280.00</span>
            </div>
            <div class="flex justify-between text-base font-black text-emerald-900 pt-1">
              <span>Grand Total:</span>
              <span>₹6,020.00</span>
            </div>
            <div class="pt-2 text-[11px] text-slate-400 text-center">
              Secured by Razorpay • UPI, Cards, Net Banking, COD Supported
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 15: DELIVERY AGENCY -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-amber-700 uppercase tracking-widest">Logistics Partners</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">5-Part Agency Onboarding & Management</h2>
            <p class="text-xs text-slate-500 mt-1">Corporate identity, geographic footprint, serviceability matrix, fleet capacity, and operational capabilities.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-bold text-slate-900">Part 1</div>
              <div class="text-slate-500 mt-0.5">Corporate Identity</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-bold text-slate-900">Part 2</div>
              <div class="text-slate-500 mt-0.5">Geographic Footprint</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-bold text-slate-900">Part 3</div>
              <div class="text-slate-500 mt-0.5">Serviceability Matrix</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-bold text-slate-900">Part 4</div>
              <div class="text-slate-500 mt-0.5">Fleet Capacity</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-bold text-slate-900">Part 5</div>
              <div class="text-slate-500 mt-0.5">Operational SLA</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 16: DRIVER -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-indigo-50/60 rounded-3xl border border-indigo-100 p-8 sm:p-10 space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-indigo-700 uppercase tracking-widest">Driver Community</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Empowering Verified Rural Drivers</h2>
            <p class="text-xs text-slate-500 mt-1">Driver ID (VIV-DRV-XXXX), vehicle matching, turn-by-turn routes, and OTP verification.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
              <span class="text-2xl">🪪</span>
              <h4 class="font-bold text-sm text-indigo-950">License Verification</h4>
              <p class="text-slate-600">LMV, HGV, and 2-Wheeler verified credentials with background checks.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
              <span class="text-2xl">📦</span>
              <h4 class="font-bold text-sm text-indigo-950">Batch Load Navigation</h4>
              <p class="text-slate-600">Active order list on the left, interactive map route on the right.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
              <span class="text-2xl">💵</span>
              <h4 class="font-bold text-sm text-indigo-950">Guaranteed Delivery Pay</h4>
              <p class="text-slate-600">Direct earning allocation released immediately upon valid OTP entry.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 17: AI AND WEATHER -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Platform Intelligence</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Role-Specific AI & Weather Forecasting</h2>
            <p class="text-xs text-slate-500 mt-1">Targeted guidance tailored for each actor in the ecosystem.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div class="font-black text-emerald-950">🌾 Farmer AI</div>
              <p class="text-slate-600">Crop recommendations based on soil type, water source, and harvest weather advisories.</p>
            </div>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div class="font-black text-amber-950">🚚 Agency AI</div>
              <p class="text-slate-600">Fleet utilization alerts, multi-order batching opportunities, and corridor rain warnings.</p>
            </div>
            <div class="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
              <div class="font-black text-indigo-950">🛵 Driver AI</div>
              <p class="text-slate-600">Next stop explanation, route detour alerts, and transit temperature forecasts.</p>
            </div>
            <div class="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
              <div class="font-black text-blue-950">🛒 Buyer AI</div>
              <p class="text-slate-600">Seasonal produce discovery, multi-farmer cart helper, and delivery window forecasting.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 18: ANALYTICS -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Complete Visibility</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Comprehensive Performance Analytics</h2>
            <p class="text-xs text-slate-500 mt-1">Real-time metrics on sales, inventory turns, vehicle utilization, and transit times.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs text-slate-400">Total Produce Sold</div>
              <div class="text-2xl font-black text-emerald-800 mt-1">1,480 kg</div>
              <div class="text-[10px] text-emerald-600 font-bold">100% Direct Payout</div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs text-slate-400">Fleet Capacity Active</div>
              <div class="text-2xl font-black text-amber-800 mt-1">84.6%</div>
              <div class="text-[10px] text-amber-600 font-bold">Consolidated Loads</div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs text-slate-400">Average Transit Time</div>
              <div class="text-2xl font-black text-blue-800 mt-1">4.2 Hrs</div>
              <div class="text-[10px] text-blue-600 font-bold">Farm to Doorstep</div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs text-slate-400">Escrow Settlement</div>
              <div class="text-2xl font-black text-purple-800 mt-1">8.5 Mins</div>
              <div class="text-[10px] text-purple-600 font-bold">Post-OTP Target</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 19: SECURITY -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-black text-emerald-700 uppercase tracking-widest">Enterprise Architecture</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Zero-Trust Security & Data Isolation</h2>
            <p class="text-xs text-slate-500 mt-1">Role-based access control, cryptographic verification, and private document storage.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="text-lg font-black text-slate-900">🛡️ Private Documents</div>
              <p class="text-slate-600">Patta/Chitta and bank details are strictly restricted to authorized admin reviewers. Never displayed publicly.</p>
            </div>
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="text-lg font-black text-slate-900">📍 Partial Location Only</div>
              <p class="text-slate-600">Public listings show only City, District, and State. Exact field coordinates and home addresses are guarded.</p>
            </div>
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div class="text-lg font-black text-slate-900">🔑 One-Time Passwords</div>
              <p class="text-slate-600">4-digit delivery handover OTPs are validated atomically against Order ID, Buyer, and Assigned Driver.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 20: WHY VIVAAN (COMPARISON TABLE) -->
      <!-- ==================================================================== -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-8">
          <span class="text-xs font-black text-emerald-700 uppercase tracking-wider">The Comparison</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Traditional Supply Chain vs VIVAAN</h2>
        </div>
        <div class="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-white">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                <th class="p-4">Feature</th>
                <th class="p-4 text-red-700">Traditional Mandi / Middlemen</th>
                <th class="p-4 text-emerald-800">VIVAAN Platform</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-4 font-bold text-slate-900">Pricing Control</td>
                <td class="p-4 text-slate-600">Dictated by middleman syndicates</td>
                <td class="p-4 font-bold text-emerald-800">100% Fixed by the Farmer</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-slate-900">Farmer Share of Sale</td>
                <td class="p-4 text-slate-600">30% – 45% of consumer spend</td>
                <td class="p-4 font-bold text-emerald-800">95% Farmgate Payout</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-slate-900">Payment Timelines</td>
                <td class="p-4 text-slate-600">15 to 45 days credit delay</td>
                <td class="p-4 font-bold text-emerald-800">~5–10 Minutes Post-OTP Handover</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-slate-900">Logistics Efficiency</td>
                <td class="p-4 text-slate-600">Fragmented, high empty-haul trips</td>
                <td class="p-4 font-bold text-emerald-800">Consolidated Multi-Stop TSP Routing</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-slate-900">Produce Freshness</td>
                <td class="p-4 text-slate-600">3–5 days in transit mandis</td>
                <td class="p-4 font-bold text-emerald-800">Same-Day / Next-Day Farmgate Direct</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-slate-900">Multi-Farmer Sourcing</td>
                <td class="p-4 text-slate-600">Multiple separate visits or orders</td>
                <td class="p-4 font-bold text-emerald-800">One Buyer. Multiple Farmers. One Cart.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 21: FINAL CTA -->
      <!-- ==================================================================== -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight font-serif">
            Join the Direct Agricultural Revolution Today
          </h2>
          <p class="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Whether you cultivate crops, purchase produce for your household or business, or run a logistics fleet — VIVAAN is built for you.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button onclick="window.vivaanApp.navigateTo('farmer_register')" class="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105">
              🌾 Enroll as a Verified Farmer
            </button>
            <button onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-emerald-950 font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105">
              🛒 Start Buying Farm-Fresh
            </button>
          </div>
        </div>
      </section>

      <!-- ==================================================================== -->
      <!-- SECTION 22: FOOTER (Comprehensive Platform Links & Certifications) -->
      <!-- ==================================================================== -->
      <footer class="bg-slate-900 text-slate-300 py-12 rounded-3xl mx-4 sm:mx-8 border border-slate-800 space-y-8">
        <div class="max-w-7xl mx-auto px-6 space-y-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div class="flex items-center gap-4">
              <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-12 w-12 object-contain rounded-full border border-amber-300 bg-white" />
              <div>
                <span class="text-2xl font-black text-white font-serif">VIVAAN</span>
                <p class="text-xs text-amber-400">Direct Farmer-to-Buyer Digital Agricultural Marketplace</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
              <button onclick="window.vivaanApp.navigateTo('farmer_register')" class="hover:text-emerald-400">🌾 Farmers</button>
              <button onclick="window.vivaanApp.navigateTo('agency_register')" class="hover:text-amber-400">🚚 Agencies</button>
              <button onclick="window.vivaanApp.navigateTo('buyer_marketplace')" class="hover:text-blue-400">🛒 Marketplace</button>
              <button onclick="window.vivaanApp.navigateTo('order_tracking')" class="hover:text-white">📍 Live Tracking</button>
              <button onclick="window.vivaanApp.navigateTo('demo_showcase')" class="hover:text-amber-300 font-black">⚡ Interactive Demos</button>
              <button onclick="window.vivaanApp.switchRole('ADMIN')" class="hover:text-purple-400">🛡️ Admin</button>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 VIVAAN. All Rights Reserved. Indian Agricultural Innovation Initiative.</p>
            <div class="flex items-center gap-2 text-emerald-400 font-semibold">
              <span>🌾 100% Direct</span>
              <span>•</span>
              <span>🔒 Escrow Protected</span>
              <span>•</span>
              <span>🌐 14 Indian Languages</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  `;
}
