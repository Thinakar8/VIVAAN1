/**
 * VIVAAN Delivery Agency Dashboard View (Phases 16 - 24, 56)
 * - Fleet management, Serviceability Matrix, Driver Applications & Approvals
 * - Phase 56: Agency Active Tracking (Split Screen: Left Order List, Right Live Map)
 * - 3-Tier ID Card View (Local Green / District Orange / State Blue)
 */
import { t } from '../i18n.js';
import { apiGet, apiPost, apiPut, state } from '../state.js';

let activeAgencyTab = 'tracking'; // 'tracking', 'orders', 'drivers', 'add_driver', 'id_card'
let cachedAgencyDrivers = [];
let cachedAgencyOrders = [];
let cachedActiveDeliveries = [];
let selectedAgencyOrder = null;
let agencyTrackingMap = null;

export async function renderAgencyDashboard() {
  const agencyId = (state.currentUser && state.currentUser.agency_id) || 1;
  const brandName = (state.currentUser && state.currentUser.name) || 'GreenCorridor Logistics';
  const vivaanId = (state.currentUser && state.currentUser.vivaan_id) || 'VIV-AG-104582';
  const tier = (state.currentUser && state.currentUser.tier) || 'STATE_BLUE';

  try {
    const dRes = await apiGet(`/api/agencies/${agencyId}/drivers`);
    cachedAgencyDrivers = dRes.drivers || [];
  } catch (e) {
    cachedAgencyDrivers = [];
  }

  try {
    const oRes = await apiGet(`/api/agencies/${agencyId}/orders`);
    cachedAgencyOrders = oRes.orders || [];
  } catch (e) {
    cachedAgencyOrders = [];
  }

  try {
    const tRes = await apiGet(`/api/agencies/${agencyId}/active-deliveries`);
    cachedActiveDeliveries = tRes.active_deliveries || [];
    if (!selectedAgencyOrder && cachedActiveDeliveries.length > 0) {
      selectedAgencyOrder = cachedActiveDeliveries[0];
    } else if (selectedAgencyOrder) {
      const match = cachedActiveDeliveries.find(o => o.order_id === selectedAgencyOrder.order_id);
      selectedAgencyOrder = match || (cachedActiveDeliveries.length > 0 ? cachedActiveDeliveries[0] : null);
    }
  } catch (e) {
    cachedActiveDeliveries = [];
  }

  if (activeAgencyTab === 'tracking') {
    setTimeout(() => initAgencyMap(), 150);
  }

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button 
            onclick="window.vivaanApp.goBack('user_type_select')"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
            title="${t('back')}"
          >
            <span class="text-sm font-black text-amber-700">&larr;</span>
            <span>${t('back')}</span>
          </button>
          ${activeAgencyTab !== 'overview' ? `
            <button 
              onclick="window.vivaanAgencyDash.switchTab('overview')"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <span>&larr; Logistics Overview</span>
            </button>
          ` : ''}
        </div>
        <span class="text-xs text-slate-400 font-semibold">Delivery Agency Cockpit</span>
      </div>

      <!-- Top Agency Header with VIVAAN Logo -->
      <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-500/20">
        <div class="flex items-center gap-5">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-amber-300 ring-2 ring-white/20 bg-white/10" />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                tier === 'STATE_BLUE' ? 'bg-blue-400 text-blue-950' : tier === 'DISTRICT_ORANGE' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
              }">
                ${tier.replace('_', ' ')} AGENCY
              </span>
              <span class="text-amber-300 font-mono font-bold text-sm tracking-wider">${vivaanId}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black">${brandName}</h1>
            <p class="text-xs text-slate-300">Verified Agro-Corridor Carrier • 30 Commercial Vehicles • 3 Hubs</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button 
            onclick="window.vivaanAgencyDash.switchTab('add_driver')"
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <span>👨✈️</span> Enroll New Driver
          </button>
          
          <button 
            onclick="window.vivaanAgencyDash.switchTab('id_card')"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-xl"
          >
            🪪 View Agency Tier ID
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Active Live Deliveries</span>
          <h3 class="text-2xl font-black text-amber-800 mt-1">${cachedActiveDeliveries.length}</h3>
          <span class="text-xs text-amber-600 font-semibold">Live GPS Telemetry</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Enrolled Drivers</span>
          <h3 class="text-2xl font-black text-slate-900 mt-1">${cachedAgencyDrivers.length}</h3>
          <span class="text-xs text-emerald-600 font-semibold">Verified Licenses</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">All Time Orders</span>
          <h3 class="text-2xl font-black text-slate-900 mt-1">${cachedAgencyOrders.length}</h3>
          <span class="text-xs text-slate-500 font-medium">Corridor Dispatches</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Service Level</span>
          <h3 class="text-xl font-black text-blue-600 mt-1">State Level</h3>
          <span class="text-xs text-slate-500 font-medium">3 States Coverage</span>
        </div>
      </div>

      <!-- Tabs Navigation (Phase 24 & 56) -->
      <div class="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-sm font-bold">
        <button onclick="window.vivaanAgencyDash.switchTab('tracking')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeAgencyTab === 'tracking' ? 'bg-white border-t-2 border-amber-600 text-amber-900 shadow-sm' : 'text-amber-700 hover:text-amber-900'}">
          📡 Active Live Tracking (${cachedActiveDeliveries.length})
        </button>
        <button onclick="window.vivaanAgencyDash.switchTab('orders')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeAgencyTab === 'orders' ? 'bg-white border-t-2 border-amber-600 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🚚 All Assigned Orders (${cachedAgencyOrders.length})
        </button>
        <button onclick="window.vivaanAgencyDash.switchTab('drivers')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeAgencyTab === 'drivers' ? 'bg-white border-t-2 border-amber-600 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          👨✈️ Enrolled Drivers (${cachedAgencyDrivers.length})
        </button>
        <button onclick="window.vivaanAgencyDash.switchTab('add_driver')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeAgencyTab === 'add_driver' ? 'bg-white border-t-2 border-amber-600 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          ➕ Enroll Driver
        </button>
        <button onclick="window.vivaanAgencyDash.switchTab('id_card')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeAgencyTab === 'id_card' ? 'bg-white border-t-2 border-amber-600 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🪪 Agency Tier ID Card
        </button>
      </div>

      <!-- Content Area -->
      <div>
        ${renderAgencyTabContent(agencyId, vivaanId, brandName, tier)}
      </div>

    </div>
  `;
}

function renderAgencyTabContent(agencyId, vivaanId, brandName, tier) {
  if (activeAgencyTab === 'tracking') {
    return renderAgencyActiveTrackingTab();
  } else if (activeAgencyTab === 'orders') {
    return renderAgencyOrdersTab(cachedAgencyOrders);
  } else if (activeAgencyTab === 'drivers') {
    return renderAgencyDriversTab(cachedAgencyDrivers);
  } else if (activeAgencyTab === 'add_driver') {
    return renderAddDriverForm(agencyId);
  } else if (activeAgencyTab === 'id_card') {
    return renderAgencyIdCardTab(vivaanId, brandName, tier);
  }
  return renderAgencyActiveTrackingTab();
}

// 1. PHASE 56: AGENCY ACTIVE TRACKING (Split View)
function renderAgencyActiveTrackingTab() {
  if (cachedActiveDeliveries.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <span class="text-4xl">📡</span>
        <h3 class="font-bold text-slate-800 text-lg">No Active Shipments En Route</h3>
        <p class="text-xs text-slate-500">Orders appear here when drivers accept shipments. Once OTP delivery finishes, orders are automatically removed.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT SIDE: Agency Active Order List (Phase 56) -->
      <div class="lg:col-span-4 space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>📦</span> Agency Active Shipments (${cachedActiveDeliveries.length})
          </h3>
          <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase">
            Private To Agency
          </span>
        </div>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          ${cachedActiveDeliveries.map(d => {
            const isSelected = selectedAgencyOrder && selectedAgencyOrder.order_id === d.order_id;
            return `
              <div 
                onclick="window.vivaanAgencyDash.selectTrackingOrder('${d.order_id}')"
                class="p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                }"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-mono text-xs font-black ${isSelected ? 'text-amber-900' : 'text-slate-800'}">${d.order_id}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    d.order_status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${d.order_status.replace('_', ' ')}
                  </span>
                </div>

                <h4 class="font-bold text-slate-900 text-xs">${d.product_name} (${d.quantity} ${d.unit})</h4>

                <div class="mt-2 text-[11px] text-slate-600 space-y-0.5">
                  <div class="flex items-center justify-between">
                    <span>Driver: <strong>${d.driver_name}</strong></span>
                    <span class="font-mono font-bold text-indigo-700">${d.driver_id}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Stage: <strong>${d.tracking_phase}</strong></span>
                    <span>Dest: <strong>${d.delivery_district}</strong></span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- RIGHT SIDE: Live Leaflet Map for Agency Drivers (Phase 56) -->
      <div class="lg:col-span-8 space-y-3">
        ${selectedAgencyOrder ? `
          <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-black text-sm text-amber-900">${selectedAgencyOrder.order_id}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    Stage: ${selectedAgencyOrder.tracking_phase}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  Driver: <strong>${selectedAgencyOrder.driver_name}</strong> (${selectedAgencyOrder.driver_id}) • Cargo: <strong>${selectedAgencyOrder.product_name}</strong>
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  GPS: ${selectedAgencyOrder.driver_lat.toFixed(4)}, ${selectedAgencyOrder.driver_lng.toFixed(4)}
                </span>
                <button 
                  onclick="window.vivaanAgencyDash.simulateStep('${selectedAgencyOrder.order_id}')"
                  class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm"
                >
                  ⚡ Simulate Advance
                </button>
              </div>
            </div>

            <!-- Leaflet Map Mount -->
            <div id="agency-live-map" class="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"></div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-0.5">
                <strong class="text-emerald-950">🌾 Farmgate Pickup:</strong>
                <p class="text-slate-700">${selectedAgencyOrder.farmer_name} (Salem)</p>
              </div>
              <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-0.5">
                <strong class="text-blue-950">🎯 Delivery Destination:</strong>
                <p class="text-slate-700">${selectedAgencyOrder.buyer_name} (${selectedAgencyOrder.delivery_address})</p>
              </div>
            </div>

          </div>
        ` : ''}
      </div>

    </div>
  `;
}

function initAgencyMap() {
  const mapEl = document.getElementById('agency-live-map');
  if (!mapEl || typeof L === 'undefined' || !selectedAgencyOrder) return;

  if (mapEl._leaflet_id) {
    mapEl._leaflet_id = null;
  }

  if (agencyTrackingMap) {
    try { agencyTrackingMap.remove(); } catch (e) {}
    agencyTrackingMap = null;
  }

  const driverCoords = [selectedAgencyOrder.driver_lat || 12.6500, selectedAgencyOrder.driver_lng || 79.6000];
  const pickupCoords = [selectedAgencyOrder.pickup_lat || 11.6643, selectedAgencyOrder.pickup_lng || 78.1460];
  const deliveryCoords = [selectedAgencyOrder.delivery_lat || 13.0012, selectedAgencyOrder.delivery_lng || 80.2565];

  agencyTrackingMap = L.map('agency-live-map').setView(driverCoords, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(agencyTrackingMap);

  setTimeout(() => {
    if (agencyTrackingMap) agencyTrackingMap.invalidateSize();
  }, 100);

  const truckIcon = L.divIcon({
    html: '<div style="background:#d97706; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚚</div>',
    className: '',
    iconSize: [36, 36]
  });

  const farmIcon = L.divIcon({
    html: '<div style="background:#2d6a4f; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3)">🌾</div>',
    className: '',
    iconSize: [32, 32]
  });

  const buyerIcon = L.divIcon({
    html: '<div style="background:#1e3a8a; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3)">🛒</div>',
    className: '',
    iconSize: [32, 32]
  });

  L.marker(pickupCoords, { icon: farmIcon }).addTo(agencyTrackingMap).bindPopup(`<b>Pickup: ${selectedAgencyOrder.farmer_name}</b>`);
  L.marker(deliveryCoords, { icon: buyerIcon }).addTo(agencyTrackingMap).bindPopup(`<b>Destination: ${selectedAgencyOrder.buyer_name}</b>`);
  L.marker(driverCoords, { icon: truckIcon }).addTo(agencyTrackingMap).bindPopup(`<b>Driver: ${selectedAgencyOrder.driver_name}</b><br>Stage: ${selectedAgencyOrder.tracking_phase}`).openPopup();

  const routePolyline = L.polyline([pickupCoords, driverCoords, deliveryCoords], {
    color: '#d97706',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 8'
  }).addTo(agencyTrackingMap);

  agencyTrackingMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
}

// 2. All Assigned Orders Tab
function renderAgencyOrdersTab(orders) {
  if (!orders || orders.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
        <span class="text-4xl">🚚</span>
        <h3 class="font-bold text-slate-800 text-lg">No Active Shipments Assigned</h3>
        <p class="text-xs text-slate-500">Orders automatically match according to your verified serviceability zone.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${orders.map(o => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-700">${o.id}</span>
              <span class="font-bold text-slate-900">${o.product_name} (${o.quantity} ${o.unit})</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
                o.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }">
                ${o.order_status}
              </span>
            </div>
            
            <p class="text-xs text-slate-600">
              📍 <strong>Pickup:</strong> Farm in Salem &rarr; 🎯 <strong>Destination:</strong> ${o.delivery_address} (${o.delivery_district})
            </p>
            <p class="text-xs text-slate-500">
              Driver: <strong>${o.driver_name || 'Murugan K'}</strong> (${o.driver_id || 'VIV-DR-104582'}) • Scheduled: ${o.preferred_time || 'Morning'}
            </p>
          </div>

          <div class="text-right space-y-2">
            <div>
              <span class="text-xs text-slate-400 uppercase font-bold">Delivery Fee</span>
              <h4 class="text-lg font-black text-amber-700">₹${o.delivery_fee || 150}</h4>
            </div>

            <button 
              onclick="window.vivaanAgencyDash.selectTrackingOrder('${o.id}'); window.vivaanAgencyDash.switchTab('tracking');" 
              class="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              📡 Track Driver Live
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 3. Drivers Tab
function renderAgencyDriversTab(drivers) {
  if (!drivers || drivers.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
        <span class="text-4xl">👨✈️</span>
        <h3 class="font-bold text-slate-800 text-lg">No Drivers Enrolled Yet</h3>
        <p class="text-xs text-slate-500">Add commercial drivers with verified driving licenses.</p>
        <button onclick="window.vivaanAgencyDash.switchTab('add_driver')" class="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs">
          + Enroll Driver
        </button>
      </div>
    `;
  }

  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th class="p-4">Driver ID</th>
              <th class="p-4">Full Name & Phone</th>
              <th class="p-4">License & Class</th>
              <th class="p-4">Vehicle & Cap</th>
              <th class="p-4">Operating Area</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${drivers.map(d => `
              <tr class="hover:bg-slate-50/50">
                <td class="p-4 font-mono font-bold text-indigo-700">${d.driver_id}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-900">${d.full_name}</div>
                  <div class="text-slate-400">${d.phone}</div>
                </td>
                <td class="p-4">
                  <div class="font-mono font-semibold text-slate-800">${d.license_no}</div>
                  <div class="text-[11px] text-slate-500">Class: ${d.license_class} (${d.experience_years} yrs exp)</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">${d.vehicle_type} (${d.vehicle_no || 'TN-30'})</div>
                  <div class="text-[11px] text-slate-500">Max Cap: ${d.max_weight_kg || 1000} kg</div>
                </td>
                <td class="p-4">
                  <div class="font-semibold text-slate-700">${d.home_district}, ${d.home_state}</div>
                  <div class="text-[11px] text-slate-400">Shift: ${d.shift}</div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 4. Enroll Driver Form (Phase 25)
function renderAddDriverForm(agencyId) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm space-y-6">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-xl font-black text-slate-900">Enroll Commercial Rural Driver</h3>
        <p class="text-xs text-slate-500">Upon approval, a unique VIVAAN Driver ID (VIV-DR-XXXXXX) will be generated.</p>
      </div>

      <form onsubmit="event.preventDefault(); window.vivaanAgencyDash.submitDriverForm(${agencyId});" class="space-y-5 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input type="text" id="drv_name" required class="w-full px-3.5 py-2.5 border rounded-xl" placeholder="e.g. Senthil Kumar" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Mobile Phone Number</label>
            <input type="tel" id="drv_phone" required class="w-full px-3.5 py-2.5 border rounded-xl" placeholder="+91 9842100000" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Driving License Number</label>
            <input type="text" id="drv_license" required class="w-full px-3.5 py-2.5 border rounded-xl font-mono uppercase" placeholder="TN-27-2018..." />
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">License Class</label>
            <select id="drv_class" class="w-full px-3.5 py-2.5 border rounded-xl bg-white font-bold">
              <option value="LMV">LMV (Light Motor Vehicle)</option>
              <option value="HGV">HGV (Heavy Goods Vehicle)</option>
              <option value="2-Wheeler">2-Wheeler (Local Courier)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Experience (Years)</label>
            <input type="number" id="drv_exp" value="5" class="w-full px-3.5 py-2.5 border rounded-xl" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Vehicle Type</label>
            <select id="drv_veh_type" class="w-full px-3.5 py-2.5 border rounded-xl bg-white font-bold">
              <option value="Pickup">Pickup (e.g. Bolero Maxi Truck / Tata Ace)</option>
              <option value="Truck">Truck (7.5T / 12T Commercial)</option>
              <option value="Van">Refrigerated Van</option>
              <option value="Bike">Bike (Rural Delivery)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Vehicle Registration Number</label>
            <input type="text" id="drv_veh_no" class="w-full px-3.5 py-2.5 border rounded-xl font-mono uppercase" placeholder="TN-30-BC-4890" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Home State</label>
            <input type="text" id="drv_state" value="Tamil Nadu" class="w-full px-3.5 py-2.5 border rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Home District & Operating Hub</label>
            <input type="text" id="drv_district" value="Salem" class="w-full px-3.5 py-2.5 border rounded-xl" />
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="window.vivaanAgencyDash.switchTab('drivers')" class="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md">
            Verify & Generate Driver ID
          </button>
        </div>
      </form>
    </div>
  `;
}

// 5. Agency Tier ID Card (Phase 23)
function renderAgencyIdCardTab(vivaanId, brandName, tier) {
  const isBlue = tier === 'STATE_BLUE';
  const isOrange = tier === 'DISTRICT_ORANGE';

  const cardGradient = isBlue 
    ? 'from-blue-950 via-slate-900 to-blue-900 border-blue-400' 
    : isOrange 
    ? 'from-amber-950 via-slate-900 to-amber-900 border-amber-400' 
    : 'from-emerald-950 via-slate-900 to-emerald-900 border-emerald-400';

  return `
    <div class="max-w-xl mx-auto py-4">
      <div class="bg-gradient-to-br ${cardGradient} border-2 text-white rounded-3xl p-7 shadow-2xl space-y-6 relative overflow-hidden">
        
        <!-- Header with Logo -->
        <div class="flex items-center justify-between border-b border-white/15 pb-4">
          <div class="flex items-center gap-3">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-14 w-14 object-contain rounded-full border border-amber-300 ring-2 ring-white/20 bg-white/10" />
            <div>
              <h3 class="text-lg font-black tracking-wider text-amber-200 font-serif">VIVAAN</h3>
              <p class="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Agricultural Logistics Partner</p>
            </div>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              isBlue ? 'bg-blue-400 text-blue-950' : isOrange ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
            }">
              ${tier.replace('_', ' ')}
            </span>
          </div>
        </div>

        <!-- Meta Details -->
        <div class="space-y-4 text-xs">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Brand Carrier</span>
            <h4 class="text-2xl font-black text-white mt-0.5">${brandName}</h4>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">VIVAAN Agency ID</span>
              <p class="font-mono font-black text-base text-amber-300 mt-0.5">${vivaanId}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Coverage Classification</span>
              <p class="font-bold text-white mt-0.5">${tier === 'STATE_BLUE' ? 'State Level (Multi-state corridor)' : 'District Level'}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Verified Fleet</span>
              <p class="font-semibold text-slate-200 mt-0.5">30 Commercial Vehicles</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Transit Standards</span>
              <p class="font-semibold text-slate-200 mt-0.5">Farmgate Cold & Ambient Chain</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-400">
          <span>Digital QR Verification: Validated</span>
          <span class="font-mono">Tamper-Proof Digital Ledger</span>
        </div>

      </div>
    </div>
  `;
}

window.vivaanAgencyDash = {
  switchTab(tab) {
    activeAgencyTab = tab;
    window.vivaanApp.navigateTo('agency_dashboard');
  },

  selectTrackingOrder(orderId) {
    const found = cachedActiveDeliveries.find(d => d.order_id === orderId);
    if (found) {
      selectedAgencyOrder = found;
      window.vivaanApp.navigateTo('agency_dashboard');
    }
  },

  async simulateStep(orderId) {
    try {
      const res = await apiPost('/api/orders/simulate-step', { order_id: orderId, action: 'ADVANCE' });
      alert(res.message);
      window.vivaanApp.navigateTo('agency_dashboard');
    } catch (e) {
      alert("Simulate error: " + e.message);
    }
  },

  async submitDriverForm(agencyId) {
    const name = document.getElementById('drv_name').value.trim();
    const phone = document.getElementById('drv_phone').value.trim();
    const license = document.getElementById('drv_license').value.trim();
    const lClass = document.getElementById('drv_class').value;
    const exp = parseInt(document.getElementById('drv_exp').value) || 3;
    const vType = document.getElementById('drv_veh_type').value;
    const vNo = document.getElementById('drv_veh_no').value.trim();
    const stateVal = document.getElementById('drv_state').value.trim();
    const districtVal = document.getElementById('drv_district').value.trim();

    try {
      const res = await apiPost('/api/agencies/apply-driver', {
        agency_id: agencyId,
        full_name: name,
        phone: phone,
        address: `${districtVal}, ${stateVal}`,
        license_no: license,
        license_class: lClass,
        experience_years: exp,
        vehicle_type: vType,
        vehicle_no: vNo,
        home_state: stateVal,
        home_district: districtVal
      });

      alert(res.message);
      window.vivaanAgencyDash.switchTab('drivers');
    } catch (e) {
      alert("❌ " + e.message);
    }
  }
};
