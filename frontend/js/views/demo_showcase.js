/**
 * VIVAAN Interactive Demonstration Suite (Phases 106 - 110)
 * -----------------------------------------------------------------
 * 1. Phase 107 Demo: Multi-Order Consolidation (4 Farmers -> 1 Buyer)
 * 2. Phase 108 Demo: Multi-Buyer Route Consolidation (1 Driver -> 3 Buyers)
 * 3. Phase 109 Demo: Full Delivery Lifecycle (10 Step-by-Step interactive stages)
 * 4. Phase 110 Demo: Complete Multi-Order Tracking (Progressive privacy & OTP completion)
 */

export function renderDemoShowcase(activeTab = 'phase107') {
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Top Navigation / Back Button -->
      <div class="flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('landing')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>Back to Home</span>
        </button>

        <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Interactive Live Demos (Phases 106–110)
        </div>
      </div>

      <!-- Header -->
      <div class="text-center space-y-3 bg-gradient-to-b from-emerald-50 via-white to-white p-8 rounded-3xl border border-emerald-100 shadow-sm">
        <div class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          VIVAAN Intelligence & Logistics Engine
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Platform Feature Demonstrations
        </h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Experience the live algorithmic consolidation, role-based GPS privacy, multi-order checkout, and delivery OTP handover workflows in real time.
        </p>
      </div>

      <!-- Demo Tabs Navigation -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-2 rounded-2xl">
        <button 
          onclick="window.vivaanDemo.switchTab('phase107')" 
          id="demo-tab-btn-phase107"
          class="p-3 rounded-xl text-xs font-black text-center transition-all ${
            activeTab === 'phase107' 
              ? 'bg-emerald-700 text-white shadow-md' 
              : 'text-slate-700 hover:bg-white'
          }"
        >
          <div class="text-base mb-1">🌾 🛒</div>
          <div>Phase 107 Demo</div>
          <div class="text-[10px] font-normal opacity-90">Multi-Farmer Consolidation</div>
        </button>

        <button 
          onclick="window.vivaanDemo.switchTab('phase108')" 
          id="demo-tab-btn-phase108"
          class="p-3 rounded-xl text-xs font-black text-center transition-all ${
            activeTab === 'phase108' 
              ? 'bg-emerald-700 text-white shadow-md' 
              : 'text-slate-700 hover:bg-white'
          }"
        >
          <div class="text-base mb-1">🚚 🏘️</div>
          <div>Phase 108 Demo</div>
          <div class="text-[10px] font-normal opacity-90">Multi-Buyer Corridor</div>
        </button>

        <button 
          onclick="window.vivaanDemo.switchTab('phase109')" 
          id="demo-tab-btn-phase109"
          class="p-3 rounded-xl text-xs font-black text-center transition-all ${
            activeTab === 'phase109' 
              ? 'bg-emerald-700 text-white shadow-md' 
              : 'text-slate-700 hover:bg-white'
          }"
        >
          <div class="text-base mb-1">⚡ 🔐</div>
          <div>Phase 109 Demo</div>
          <div class="text-[10px] font-normal opacity-90">Full Delivery Lifecycle</div>
        </button>

        <button 
          onclick="window.vivaanDemo.switchTab('phase110')" 
          id="demo-tab-btn-phase110"
          class="p-3 rounded-xl text-xs font-black text-center transition-all ${
            activeTab === 'phase110' 
              ? 'bg-emerald-700 text-white shadow-md' 
              : 'text-slate-700 hover:bg-white'
          }"
        >
          <div class="text-base mb-1">📍 🛡️</div>
          <div>Phase 110 Demo</div>
          <div class="text-[10px] font-normal opacity-90">Multi-Order GPS Privacy</div>
        </button>
      </div>

      <!-- Active Tab Container -->
      <div id="demo-content-container">
        ${getDemoTabContent(activeTab)}
      </div>

    </div>
  `;
}

function getDemoTabContent(tab) {
  switch (tab) {
    case 'phase107':
      return renderPhase107Demo();
    case 'phase108':
      return renderPhase108Demo();
    case 'phase109':
      return renderPhase109Demo();
    case 'phase110':
      return renderPhase110Demo();
    default:
      return renderPhase107Demo();
  }
}

function renderPhase107Demo() {
  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-emerald-700 uppercase tracking-wide">Phase 107 Scenario Demo</span>
          <h2 class="text-2xl font-black text-slate-900">4 Farmers → One Consolidated Buyer Trip</h2>
          <p class="text-xs text-slate-500">Evaluating: Distance, Farm Locations, Load Weight, Vehicle Capacity & Detour.</p>
        </div>
        <div class="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-black">
          Engine Decision: Consolidated Delivery Trip (VIV-BATCH-1001)
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
          <div class="text-xs font-bold text-emerald-900 mb-1">Farmer A (Omalur, Salem)</div>
          <div class="text-sm font-black text-slate-900">🍅 Organic Tomatoes</div>
          <div class="text-xs text-slate-600">50 kg • ₹1,250</div>
        </div>
        <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
          <div class="text-xs font-bold text-emerald-900 mb-1">Farmer B (Mecheri, Salem)</div>
          <div class="text-sm font-black text-slate-900">🧅 Small Sambar Onions</div>
          <div class="text-xs text-slate-600">40 kg • ₹1,800</div>
        </div>
        <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
          <div class="text-xs font-bold text-emerald-900 mb-1">Farmer C (Yercaud Foothills)</div>
          <div class="text-sm font-black text-slate-900">🥔 Hill Potatoes</div>
          <div class="text-xs text-slate-600">60 kg • ₹1,500</div>
        </div>
        <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
          <div class="text-xs font-bold text-emerald-900 mb-1">Farmer D (Dharmapuri Border)</div>
          <div class="text-sm font-black text-slate-900">🥕 Fresh Orange Carrots</div>
          <div class="text-xs text-slate-600">30 kg • ₹1,050</div>
        </div>
      </div>

      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <h4 class="text-xs font-black text-slate-500 uppercase tracking-wider">VIVAAN Intelligent Capacity & Routing Audit</h4>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500">Total Weight</div>
            <div class="text-lg font-black text-emerald-700">180 kg</div>
            <div class="text-[10px] text-emerald-600">Well within limit</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500">Matched Vehicle</div>
            <div class="text-lg font-black text-slate-800">Mini Van (Bolero)</div>
            <div class="text-[10px] text-slate-500">800 kg Max Capacity</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500">Capacity Used</div>
            <div class="text-lg font-black text-blue-700">22.5%</div>
            <div class="text-[10px] text-blue-600">620 kg Remaining</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div class="text-xs text-slate-500">Detour Overhead</div>
            <div class="text-lg font-black text-purple-700">14.2 km</div>
            <div class="text-[10px] text-purple-600">Optimal En-Route Loop</div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-black text-slate-500 uppercase tracking-wider">Optimized Sequence (Driver → Farmer A → B → C → D → Buyer)</h4>
        
        <div class="relative pl-6 space-y-4 border-l-2 border-emerald-500">
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-700">Stop 1 • Driver Dispatch: Salem Logistics Hub</div>
            <div class="text-[11px] text-slate-400">Driver Murugan K (Bolero TN-30-BC-4890) accepts batch trip.</div>
          </div>
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-700">Stop 2 • Farmgate Pickup 1: Farmer A (Omalur)</div>
            <div class="text-[11px] text-slate-400">Loads 50 kg Tomatoes • Departure +15 min</div>
          </div>
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-700">Stop 3 • Farmgate Pickup 2: Farmer B (Mecheri)</div>
            <div class="text-[11px] text-slate-400">Loads 40 kg Small Onions • Departure +35 min</div>
          </div>
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-700">Stop 4 • Farmgate Pickup 3: Farmer C (Yercaud)</div>
            <div class="text-[11px] text-slate-400">Loads 60 kg Potatoes • Departure +55 min</div>
          </div>
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-700">Stop 5 • Farmgate Pickup 4: Farmer D (Dharmapuri)</div>
            <div class="text-[11px] text-slate-400">Loads 30 kg Carrots • All 4 crops collected! Total cargo 180 kg.</div>
          </div>
          <div class="relative">
            <span class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></span>
            <div class="text-xs font-bold text-slate-900">Stop 6 • Buyer Doorstep: Aditi Sharma (Adyar, Chennai)</div>
            <div class="text-[11px] text-emerald-700 font-bold">Single delivery handover! One buyer receives 4 fresh crops from 4 farmers in 1 arrival.</div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span class="font-black text-amber-900">Economic Efficiency:</span>
          <p class="text-amber-800">4 individual drivers would cost ₹480 in transport. Consolidated VIVAAN batch costs only ₹140 (₹80 base + ₹20x3).</p>
        </div>
        <div class="text-right">
          <div class="text-slate-500">Buyer Saved:</div>
          <div class="text-base font-black text-emerald-700">₹340 (71% Logistics Savings)</div>
        </div>
      </div>

    </div>
  `;
}

function renderPhase108Demo() {
  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-indigo-700 uppercase tracking-wide">Phase 108 Scenario Demo</span>
          <h2 class="text-2xl font-black text-slate-900">One Driver → Multiple Buyers Along Shared Corridor</h2>
          <p class="text-xs text-slate-500">Checking: Neighborhood Proximity, Independent OTPs, Independent Tracking Privacy.</p>
        </div>
        <div class="px-4 py-2 bg-indigo-50 border border-indigo-300 text-indigo-950 rounded-2xl text-xs font-black">
          Neighborhood Cluster: South Chennai Corridor
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">Buyer A</span>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">VIV-ORD-901</span>
          </div>
          <div class="text-sm font-black text-slate-900">Aditi Sharma (Adyar)</div>
          <div class="text-xs text-slate-600">Salem Turmeric (10 kg) • OTP: 4819</div>
          <div class="text-[11px] text-emerald-600 font-semibold">📍 Destination Stop 1</div>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">Buyer B</span>
            <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">VIV-ORD-902</span>
          </div>
          <div class="text-sm font-black text-slate-900">Kavitha Raman (Besant Nagar)</div>
          <div class="text-xs text-slate-600">Ponni Rice (25 kg) • OTP: 7392</div>
          <div class="text-[11px] text-amber-600 font-semibold">📍 Destination Stop 2 (1.8 km detour)</div>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">Buyer C</span>
            <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">VIV-ORD-903</span>
          </div>
          <div class="text-sm font-black text-slate-900">Manoj Kumar (Thiruvanmiyur)</div>
          <div class="text-xs text-slate-600">Alphonso Mangoes (2 Dozen) • OTP: 6184</div>
          <div class="text-[11px] text-blue-600 font-semibold">📍 Destination Stop 3 (2.1 km detour)</div>
        </div>
      </div>

      <div class="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-3">
        <h4 class="text-xs font-black text-indigo-900 uppercase tracking-wider">Independent Privacy Safeguards</h4>
        <ul class="text-xs text-indigo-950 space-y-1.5 list-disc pl-4 leading-relaxed">
          <li><strong>Zero Cross-Tracking:</strong> Buyer A can ONLY track Murugan K while Order A is being delivered to Adyar. Buyer A cannot see Buyer B or C's orders.</li>
          <li><strong>Individual OTP Proof:</strong> Murugan must enter <code>4819</code> for Buyer A, <code>7392</code> for Buyer B, and <code>6184</code> for Buyer C. No shared codes.</li>
          <li><strong>Instant Tracking Expiration:</strong> The moment Buyer A provides OTP <code>4819</code>, Buyer A's live tracking ends immediately. Live location is removed from their screen.</li>
        </ul>
      </div>

    </div>
  `;
}

let phase109CurrentStep = 1;

function renderPhase109Demo() {
  const steps = [
    { num: 1, title: "Buyer Places Order", desc: "Cart confirmed with 2 farmers. Parent Checkout VIV-CHECKOUT-1001 & Child Orders generated.", badge: "ORDER_PLACED" },
    { num: 2, title: "Agency Matches Driver", desc: "Serviceability engine assigns State-Level Carrier & Driver Murugan K (Bolero Pickup).", badge: "ASSIGNED" },
    { num: 3, title: "Driver Accepts Order", desc: "Driver taps 'Accept Order'. VIVAAN & Agency can track. Buyer CANNOT track yet.", badge: "ACCEPTED" },
    { num: 4, title: "En Route to Farmgate", desc: "Driver navigates Salem highway to Ramasamy Gounder's farm.", badge: "TO_FARMER" },
    { num: 5, title: "Driver Collects Parcel", desc: "Driver taps 'Collect Order'. Status updates to PICKED_UP. Buyer notified.", badge: "PICKED_UP" },
    { num: 6, title: "Buyer Taps Track", desc: "Buyer clicks 'Track Live Delivery'. Live map activates for Buyer Aditi Sharma.", badge: "TO_BUYER" },
    { num: 7, title: "Doorstep Arrival", desc: "Driver reaches Chennai doorstep. Prompts buyer for 4-digit Delivery OTP.", badge: "OUT_FOR_DELIVERY" },
    { num: 8, title: "OTP Handover Verified", desc: "Driver enters OTP 4819. System validates. LIVE TRACKING ENDS IMMEDIATELY.", badge: "DELIVERED" },
    { num: 9, title: "Automated Settlement", desc: "5-10 min timer triggers escrow payout: 95% to Farmer, Driver & Agency split transport fee.", badge: "SETTLED" },
    { num: 10, title: "Buyer Ratings & Feedback", desc: "Buyer rates Farmer produce quality (5★) and Agency timeliness (5★).", badge: "COMPLETED" }
  ];

  const current = steps[phase109CurrentStep - 1];

  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-amber-700 uppercase tracking-wide">Phase 109 Complete Lifecycle Simulation</span>
          <h2 class="text-2xl font-black text-slate-900">Step-by-Step Delivery Simulation</h2>
          <p class="text-xs text-slate-500">Interactive 10-stage execution from order placement to escrow settlement.</p>
        </div>
        <div class="flex items-center gap-2">
          <button 
            onclick="window.vivaanDemo.stepPhase109(-1)" 
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black disabled:opacity-40"
            ${phase109CurrentStep <= 1 ? 'disabled' : ''}
          >
            &larr; Prev
          </button>
          <span class="text-xs font-black text-slate-700">Step ${phase109CurrentStep} of 10</span>
          <button 
            onclick="window.vivaanDemo.stepPhase109(1)" 
            class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black disabled:opacity-40"
            ${phase109CurrentStep >= 10 ? 'disabled' : ''}
          >
            Next &rarr;
          </button>
          <button 
            onclick="window.vivaanDemo.resetPhase109()" 
            class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="grid grid-cols-5 md:grid-cols-10 gap-1.5">
        ${steps.map(s => `
          <div 
            onclick="window.vivaanDemo.goToPhase109Step(${s.num})" 
            class="cursor-pointer text-center p-2 rounded-xl transition-all ${
              s.num === phase109CurrentStep 
                ? 'bg-emerald-700 text-white shadow-md font-black scale-105' 
                : s.num < phase109CurrentStep 
                  ? 'bg-emerald-100 text-emerald-900 font-bold' 
                  : 'bg-slate-100 text-slate-400'
            }"
          >
            <div class="text-xs font-bold">${s.num}</div>
            <div class="text-[9px] truncate hidden md:block">${s.badge}</div>
          </div>
        `).join('')}
      </div>

      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
            Current Stage: ${current.badge}
          </span>
          <span class="text-xs text-amber-200 font-mono">Stage ${phase109CurrentStep} / 10</span>
        </div>

        <h3 class="text-2xl sm:text-3xl font-black">${current.title}</h3>
        <p class="text-slate-300 text-sm max-w-2xl leading-relaxed">${current.desc}</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div class="p-3 bg-white/5 rounded-xl">
            <span class="text-slate-400">VIVAAN / Agency:</span>
            <div class="font-bold text-white mt-0.5">
              ${phase109CurrentStep >= 3 && phase109CurrentStep <= 7 ? '✅ Live GPS Tracking Active' : phase109CurrentStep >= 8 ? '🛑 Tracking Ended' : '⏳ Pending Acceptance'}
            </div>
          </div>
          <div class="p-3 bg-white/5 rounded-xl">
            <span class="text-slate-400">Buyer Live Map:</span>
            <div class="font-bold text-white mt-0.5">
              ${phase109CurrentStep === 6 || phase109CurrentStep === 7 ? '✅ Active on Screen' : phase109CurrentStep === 5 ? '🟡 Button Click Required' : phase109CurrentStep >= 8 ? '🛑 Terminated by OTP' : '❌ Blocked (Before Collect)'}
            </div>
          </div>
          <div class="p-3 bg-white/5 rounded-xl">
            <span class="text-slate-400">Escrow Settlement:</span>
            <div class="font-bold text-white mt-0.5">
              ${phase109CurrentStep >= 9 ? '💸 Settled to Bank Accounts' : phase109CurrentStep >= 8 ? '⏳ Initiating (5-10m)' : '🔒 Locked in Escrow'}
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

let phase110State = {
  driverAccepted: false,
  orderACollected: false,
  orderBCollected: false,
  orderADelivered: false,
  orderBDelivered: false
};

function renderPhase110Demo() {
  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-purple-700 uppercase tracking-wide">Phase 110 Scenario Demo</span>
          <h2 class="text-2xl font-black text-slate-900">Multi-Order GPS Privacy Matrix (Driver has Orders A, B, C)</h2>
          <p class="text-xs text-slate-500">Simulating real-time tracking permissions as driver progresses through stops.</p>
        </div>
        <button 
          onclick="window.vivaanDemo.resetPhase110()" 
          class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
        >
          Reset Simulation
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <span class="text-xs font-black text-slate-500 mr-2">Driver Actions:</span>
        <button 
          onclick="window.vivaanDemo.triggerPhase110('ACCEPT')"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            phase110State.driverAccepted ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
          }"
        >
          1. Driver Accepts Trip
        </button>
        <button 
          onclick="window.vivaanDemo.triggerPhase110('COLLECT_A')"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            phase110State.orderACollected ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
          }"
          ${!phase110State.driverAccepted ? 'disabled opacity-50' : ''}
        >
          2. Collect Order A (Tomato)
        </button>
        <button 
          onclick="window.vivaanDemo.triggerPhase110('COLLECT_B')"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            phase110State.orderBCollected ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
          }"
          ${!phase110State.orderACollected ? 'disabled opacity-50' : ''}
        >
          3. Collect Order B (Onion)
        </button>
        <button 
          onclick="window.vivaanDemo.triggerPhase110('DELIVER_A')"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            phase110State.orderADelivered ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
          }"
          ${!phase110State.orderACollected ? 'disabled opacity-50' : ''}
        >
          4. Deliver Order A (Enter OTP)
        </button>
        <button 
          onclick="window.vivaanDemo.triggerPhase110('DELIVER_B')"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            phase110State.orderBDelivered ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
          }"
          ${!phase110State.orderBCollected ? 'disabled opacity-50' : ''}
        >
          5. Deliver Final Order (Batch Ends)
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
              <th class="p-3">Participant</th>
              <th class="p-3">Associated Order</th>
              <th class="p-3">Status</th>
              <th class="p-3">Live Tracking Permission</th>
              <th class="p-3">Displayed Message</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="bg-white">
              <td class="p-3 font-bold text-slate-900">VIVAAN & Agency</td>
              <td class="p-3 text-slate-500">Entire Batch</td>
              <td class="p-3 font-mono">${phase110State.orderBDelivered ? 'COMPLETED' : phase110State.driverAccepted ? 'ACTIVE_TRIP' : 'PENDING'}</td>
              <td class="p-3 font-bold ${phase110State.orderBDelivered ? 'text-red-600' : phase110State.driverAccepted ? 'text-emerald-700' : 'text-slate-400'}">
                ${phase110State.orderBDelivered ? '🛑 Terminated (Batch Done)' : phase110State.driverAccepted ? '✅ Authorized Tracking' : '❌ Inactive'}
              </td>
              <td class="p-3 text-slate-600">Full vehicle route overview.</td>
            </tr>

            <tr class="bg-emerald-50/30">
              <td class="p-3 font-bold text-slate-900">Buyer A (Aditi)</td>
              <td class="p-3 text-emerald-800 font-semibold">Order A (Tomatoes)</td>
              <td class="p-3 font-mono">${phase110State.orderADelivered ? 'DELIVERED' : phase110State.orderACollected ? 'PICKED_UP' : phase110State.driverAccepted ? 'ACCEPTED' : 'PLACED'}</td>
              <td class="p-3 font-bold ${phase110State.orderADelivered ? 'text-red-600' : phase110State.orderACollected ? 'text-emerald-700' : 'text-slate-400'}">
                ${phase110State.orderADelivered ? '🛑 Ended (OTP Confirmed)' : phase110State.orderACollected ? '✅ Eligible (Click Track)' : '❌ Blocked (At Farm)'}
              </td>
              <td class="p-3 text-slate-600">
                ${phase110State.orderADelivered ? 'Order Delivered. Live tracking ended.' : phase110State.orderACollected ? 'Produce picked up! Tap Track Live Delivery.' : 'Parcel being collected from farmer.'}
              </td>
            </tr>

            <tr class="bg-amber-50/30">
              <td class="p-3 font-bold text-slate-900">Buyer B (Kavitha)</td>
              <td class="p-3 text-amber-800 font-semibold">Order B (Onions)</td>
              <td class="p-3 font-mono">${phase110State.orderBDelivered ? 'DELIVERED' : phase110State.orderBCollected ? 'PICKED_UP' : phase110State.driverAccepted ? 'ACCEPTED' : 'PLACED'}</td>
              <td class="p-3 font-bold ${phase110State.orderBDelivered ? 'text-red-600' : phase110State.orderBCollected ? 'text-emerald-700' : 'text-slate-400'}">
                ${phase110State.orderBDelivered ? '🛑 Ended (OTP Confirmed)' : phase110State.orderBCollected ? '✅ Eligible (Click Track)' : '❌ Blocked (Awaiting Collect)'}
              </td>
              <td class="p-3 text-slate-600">
                ${phase110State.orderBDelivered ? 'Order Delivered. Live tracking ended.' : phase110State.orderBCollected ? 'Produce picked up! Tap Track Live Delivery.' : 'Parcel being collected from farmer.'}
              </td>
            </tr>

            <tr class="bg-blue-50/30">
              <td class="p-3 font-bold text-slate-900">Buyer C (Manoj)</td>
              <td class="p-3 text-blue-800 font-semibold">Order C (Potatoes)</td>
              <td class="p-3 font-mono">ACCEPTED</td>
              <td class="p-3 font-bold text-slate-400">❌ Blocked (Not Yet Picked Up)</td>
              <td class="p-3 text-slate-600">Parcel being collected from farmer. Live tracking not available.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.vivaanDemo = {
    activeTab: 'phase107',
    switchTab(tab) {
      this.activeTab = tab;
      const c = document.getElementById('demo-content-container');
      if (c) c.innerHTML = getDemoTabContent(tab);

      ['phase107', 'phase108', 'phase109', 'phase110'].forEach(t => {
        const btn = document.getElementById(`demo-tab-btn-${t}`);
        if (btn) {
          if (t === tab) {
            btn.className = 'p-3 rounded-xl text-xs font-black text-center transition-all bg-emerald-700 text-white shadow-md';
          } else {
            btn.className = 'p-3 rounded-xl text-xs font-black text-center transition-all text-slate-700 hover:bg-white';
          }
        }
      });
    },

    stepPhase109(dir) {
      phase109CurrentStep = Math.max(1, Math.min(10, phase109CurrentStep + dir));
      this.switchTab('phase109');
    },

    goToPhase109Step(step) {
      phase109CurrentStep = step;
      this.switchTab('phase109');
    },

    resetPhase109() {
      phase109CurrentStep = 1;
      this.switchTab('phase109');
    },

    triggerPhase110(action) {
      if (action === 'ACCEPT') {
        phase110State.driverAccepted = true;
      } else if (action === 'COLLECT_A') {
        phase110State.orderACollected = true;
      } else if (action === 'COLLECT_B') {
        phase110State.orderBCollected = true;
      } else if (action === 'DELIVER_A') {
        phase110State.orderADelivered = true;
      } else if (action === 'DELIVER_B') {
        phase110State.orderBDelivered = true;
      }
      this.switchTab('phase110');
    },

    resetPhase110() {
      phase110State = {
        driverAccepted: false,
        orderACollected: false,
        orderBCollected: false,
        orderADelivered: false,
        orderBDelivered: false
      };
      this.switchTab('phase110');
    }
  };
}
