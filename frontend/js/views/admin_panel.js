/**
 * VIVAAN Admin Control Panel (Phases 51, 52, 53, 54, 55, 56)
 * - Multi-source Farmer Verification (Patta, Survey, Landowner Consent, Bank)
 * - Agency 3-Tier Classification (Green/Orange/Blue)
 * - Active Tracking Split View (Left: Order List, Right: Interactive Live Map)
 * - Route Optimization & Serviceability Inspector
 * - Escrow Supervision & Audit Trail
 */
import { t } from '../i18n.js';
import { apiGet, apiPut, apiPost } from '../state.js';

let adminTab = 'overview';
let adminStats = null;
let adminFarmers = [];
let adminAgencies = [];
let adminOrders = [];
let adminLogs = [];
let activeDeliveries = [];
let selectedTrackingOrder = null;
let adminTrackingMap = null;

export async function renderAdminPanel() {
  try {
    const sRes = await apiGet('/api/admin/stats');
    adminStats = sRes.stats;
  } catch (e) {
    adminStats = { verified_farmers: 5, verified_agencies: 3, active_drivers: 2, total_orders: 3, total_trade_volume: 22900, settled_to_farmers: 16200 };
  }

  try {
    const fRes = await apiGet('/api/admin/farmers');
    adminFarmers = fRes.farmers || [];
  } catch (e) {
    adminFarmers = [];
  }

  try {
    const aRes = await apiGet('/api/admin/agencies');
    adminAgencies = aRes.agencies || [];
  } catch (e) {
    adminAgencies = [];
  }

  try {
    const oRes = await apiGet('/api/admin/orders');
    adminOrders = oRes.orders || [];
  } catch (e) {
    adminOrders = [];
  }

  try {
    const lRes = await apiGet('/api/admin/audit-logs');
    adminLogs = lRes.logs || [];
  } catch (e) {
    adminLogs = [];
  }

  try {
    const dRes = await apiGet('/api/admin/active-deliveries');
    activeDeliveries = dRes.active_deliveries || [];
    if (!selectedTrackingOrder && activeDeliveries.length > 0) {
      selectedTrackingOrder = activeDeliveries[0];
    } else if (selectedTrackingOrder) {
      const match = activeDeliveries.find(o => o.order_id === selectedTrackingOrder.order_id);
      selectedTrackingOrder = match || (activeDeliveries.length > 0 ? activeDeliveries[0] : null);
    }
  } catch (e) {
    activeDeliveries = [];
  }

  if (adminTab === 'tracking') {
    setTimeout(() => initAdminMap(), 150);
  }

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('landing')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
          title="${t('back')}"
        >
          <span class="text-sm font-black text-purple-700">&larr;</span>
          <span>${t('back')}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">VIVAAN Agricultural Administration Cockpit</span>
      </div>

      <!-- Admin Header with VIVAAN Logo -->
      <div class="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-purple-500/20">
        <div class="flex items-center gap-5">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-purple-400 ring-2 ring-white/20 bg-white/10" />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500 text-purple-950 font-black text-xs uppercase tracking-wide">
                🛡️ Platform Administrator
              </span>
              <span class="text-amber-300 font-mono font-bold text-xs">VIV-ADM-ROOT</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black">VIVAAN Admin Cockpit</h1>
            <p class="text-xs text-slate-300">Agricultural Authentication, Live Fleet Telemetry & Escrow Financial Supervision</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live System Telemetry
          </span>
        </div>
      </div>

      <!-- KPI Stats Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Verified Farmers</span>
          <h3 class="text-2xl font-black text-emerald-800 mt-1">${adminStats.verified_farmers}</h3>
          <span class="text-xs text-emerald-600 font-semibold">100% Patta Certified</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Verified Agencies</span>
          <h3 class="text-2xl font-black text-amber-700 mt-1">${adminStats.verified_agencies}</h3>
          <span class="text-xs text-slate-500 font-medium">Local/Dist/State Tiers</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Active Tracking</span>
          <h3 class="text-2xl font-black text-indigo-700 mt-1">${activeDeliveries.length}</h3>
          <span class="text-xs text-indigo-600 font-bold">In-Transit Drivers</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
          <h3 class="text-2xl font-black text-slate-900 mt-1">${adminStats.total_orders}</h3>
          <span class="text-xs text-slate-500 font-medium">Direct Trades</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Trade</span>
          <h3 class="text-2xl font-black text-purple-800 mt-1">₹${adminStats.total_trade_volume.toLocaleString()}</h3>
          <span class="text-xs text-emerald-600 font-semibold">Escrow Backed</span>
        </div>
      </div>

      <!-- Navigation Tabs (Phase 51) -->
      <div class="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-sm font-bold">
        <button onclick="window.vivaanAdmin.switchTab('overview')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'overview' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          📊 Platform Overview
        </button>
        <button onclick="window.vivaanAdmin.switchTab('tracking')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'tracking' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-indigo-600 hover:text-indigo-900'}">
          📡 Active Live Tracking (${activeDeliveries.length})
        </button>
        <button onclick="window.vivaanAdmin.switchTab('farmers')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'farmers' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🌾 Farmer Verifications (${adminFarmers.length})
        </button>
        <button onclick="window.vivaanAdmin.switchTab('agencies')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'agencies' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🚚 Agency Tiers & Fleets (${adminAgencies.length})
        </button>
        <button onclick="window.vivaanAdmin.switchTab('orders')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'orders' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          📦 Orders & Escrow (${adminOrders.length})
        </button>
        <button onclick="window.vivaanAdmin.switchTab('routing')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'routing' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🗺️ Route Optimization Engine
        </button>
        <button onclick="window.vivaanAdmin.switchTab('audit')" class="px-4 py-2.5 rounded-t-xl transition-all ${adminTab === 'audit' ? 'bg-white border-t-2 border-purple-600 text-purple-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🔒 Security & Audit Logs (${adminLogs.length})
        </button>
      </div>

      <!-- Content Area -->
      <div>
        ${renderAdminTabContent()}
      </div>

    </div>
  `;
}

function renderAdminTabContent() {
  if (adminTab === 'tracking') return renderAdminTrackingTab();
  if (adminTab === 'farmers') return renderAdminFarmersTab(adminFarmers);
  if (adminTab === 'agencies') return renderAdminAgenciesTab(adminAgencies);
  if (adminTab === 'orders') return renderAdminOrdersTab(adminOrders);
  if (adminTab === 'routing') return renderAdminRoutingTab();
  if (adminTab === 'audit') return renderAdminAuditTab(adminLogs);
  return renderAdminOverviewTab();
}

function renderAdminOverviewTab() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
          <span>🛡️</span> Multi-Source Verification Status
        </h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          VIVAAN enforces multi-source authentication instead of relying on a single document. Farmers are cross-referenced across Government ID, Revenue Patta records, Survey Numbers, and Digital Landowner OTP consent.
        </p>

        <div class="space-y-2 text-xs">
          <div class="p-3 bg-emerald-50 rounded-xl flex justify-between items-center text-emerald-900">
            <span>Own-Land Farmers (Patta Certified)</span>
            <strong class="font-mono">3 Active</strong>
          </div>
          <div class="p-3 bg-amber-50 rounded-xl flex justify-between items-center text-amber-900">
            <span>Leased Farmers (Agreement Verified)</span>
            <strong class="font-mono">1 Active</strong>
          </div>
          <div class="p-3 bg-blue-50 rounded-xl flex justify-between items-center text-blue-900">
            <span>Leased Farmers (Landowner OTP Consent)</span>
            <strong class="font-mono">1 Active</strong>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
          <span>💰</span> Escrow Financial Protection
        </h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          Buyer payments remain securely held in escrow until physical handover occurs and the driver submits the buyer's secret 4-digit Delivery OTP.
        </p>

        <div class="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 space-y-1">
          <div class="flex justify-between font-bold">
            <span>Settled to Farmers SBI / PNB accounts:</span>
            <span>₹16,200</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Escrow currently held pending OTP verification:</span>
            <span>₹5,150</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminTrackingTab() {
  if (activeDeliveries.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <span class="text-4xl">📡</span>
        <h3 class="font-bold text-slate-800 text-lg">No Active Deliveries at this moment</h3>
        <p class="text-xs text-slate-500">Orders appear here when drivers accept routes. Orders are automatically removed upon OTP delivery completion.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT SIDE: Order ID List (Phase 55) -->
      <div class="lg:col-span-4 space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>📦</span> Active Deliveries (${activeDeliveries.length})
          </h3>
          <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
            Auto-Removed on OTP
          </span>
        </div>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          ${activeDeliveries.map(d => {
            const isSelected = selectedTrackingOrder && selectedTrackingOrder.order_id === d.order_id;
            return `
              <div 
                onclick="window.vivaanAdmin.selectTrackingOrder('${d.order_id}')"
                class="p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-purple-50/80 border-purple-500 shadow-md ring-2 ring-purple-500/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                }"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-mono text-xs font-black ${isSelected ? 'text-purple-900' : 'text-slate-800'}">${d.order_id}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    d.order_status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${d.order_status.replace('_', ' ')}
                  </span>
                </div>

                <h4 class="font-bold text-slate-900 text-xs">${d.product_name} (${d.quantity} ${d.unit})</h4>

                <div class="mt-2 text-[11px] text-slate-600 space-y-0.5">
                  <div class="flex items-center justify-between">
                    <span>Driver: <strong>${d.driver_name || 'Assigned'}</strong></span>
                    <span class="font-mono font-bold text-slate-500">${d.driver_id}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Agency: <strong class="text-amber-800">${d.agency_name}</strong></span>
                    <span class="text-indigo-700 font-bold">${d.tracking_phase}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- RIGHT SIDE: Live Leaflet Map (Phase 55) -->
      <div class="lg:col-span-8 space-y-3">
        ${selectedTrackingOrder ? `
          <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-black text-sm text-purple-900">${selectedTrackingOrder.order_id}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                    Stage: ${selectedTrackingOrder.tracking_phase}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  Driver: <strong>${selectedTrackingOrder.driver_name}</strong> (${selectedTrackingOrder.driver_id}) • Agency: <strong>${selectedTrackingOrder.agency_name}</strong>
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  GPS: ${selectedTrackingOrder.driver_lat.toFixed(4)}, ${selectedTrackingOrder.driver_lng.toFixed(4)}
                </span>
                <button 
                  onclick="window.vivaanAdmin.simulateStep('${selectedTrackingOrder.order_id}')"
                  class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm"
                >
                  ⚡ Simulate Advance
                </button>
              </div>
            </div>

            <div id="admin-live-map" class="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"></div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-0.5">
                <strong class="text-emerald-950">🌾 Farmgate Pickup:</strong>
                <p class="text-slate-700">${selectedTrackingOrder.farmer_name} (Salem District)</p>
              </div>
              <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-0.5">
                <strong class="text-blue-950">🎯 Delivery Destination:</strong>
                <p class="text-slate-700">${selectedTrackingOrder.buyer_name} (${selectedTrackingOrder.delivery_address})</p>
              </div>
            </div>

          </div>
        ` : ''}
      </div>

    </div>
  `;
}

function initAdminMap() {
  const mapEl = document.getElementById('admin-live-map');
  if (!mapEl || typeof L === 'undefined' || !selectedTrackingOrder) return;

  if (adminTrackingMap) {
    adminTrackingMap.remove();
    adminTrackingMap = null;
  }

  const driverCoords = [selectedTrackingOrder.driver_lat || 12.6500, selectedTrackingOrder.driver_lng || 79.6000];
  const pickupCoords = [selectedTrackingOrder.pickup_lat || 11.6643, selectedTrackingOrder.pickup_lng || 78.1460];
  const deliveryCoords = [selectedTrackingOrder.delivery_lat || 13.0012, selectedTrackingOrder.delivery_lng || 80.2565];

  adminTrackingMap = L.map('admin-live-map').setView(driverCoords, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(adminTrackingMap);

  const truckIcon = L.divIcon({
    html: '<div style="background:#7c3aed; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚚</div>',
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

  L.marker(pickupCoords, { icon: farmIcon }).addTo(adminTrackingMap).bindPopup(`<b>Pickup: ${selectedTrackingOrder.farmer_name}</b>`);
  L.marker(deliveryCoords, { icon: buyerIcon }).addTo(adminTrackingMap).bindPopup(`<b>Destination: ${selectedTrackingOrder.buyer_name}</b>`);
  L.marker(driverCoords, { icon: truckIcon }).addTo(adminTrackingMap).bindPopup(`<b>Driver: ${selectedTrackingOrder.driver_name}</b><br>Stage: ${selectedTrackingOrder.tracking_phase}`).openPopup();

  const routePolyline = L.polyline([pickupCoords, driverCoords, deliveryCoords], {
    color: '#7c3aed',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 8'
  }).addTo(adminTrackingMap);

  adminTrackingMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
}

function renderAdminFarmersTab(farmers) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-base">Farmer Applications & Land Ledger Verification</h3>
          <p class="text-xs text-slate-500">Review Patta numbers, survey numbers, and landowner consent status.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th class="p-4">Farmer ID</th>
              <th class="p-4">Name & Phone</th>
              <th class="p-4">Type</th>
              <th class="p-4">Land & Patta</th>
              <th class="p-4">Consent Status</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${farmers.map(f => `
              <tr class="hover:bg-slate-50/50">
                <td class="p-4 font-mono font-bold text-emerald-800">${f.vivaan_id}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-900">${f.full_name}</div>
                  <div class="text-slate-400">${f.primary_phone}</div>
                </td>
                <td class="p-4 font-semibold text-slate-700">${f.farmer_type.replace(/_/g, ' ')}</td>
                <td class="p-4">
                  <div class="font-semibold text-slate-800">${f.village}, ${f.district}</div>
                  <div class="text-[11px] text-slate-500">Survey ${f.survey_no} • Patta ${f.patta_no} (${f.land_extent})</div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    f.consent_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }">
                    ${f.consent_status}
                  </span>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    f.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">
                    🟢 ${f.status}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button 
                    onclick="window.vivaanAdmin.toggleFarmerStatus(${f.id}, '${f.status === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED'}')"
                    class="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                  >
                    ${f.status === 'VERIFIED' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminAgenciesTab(agencies) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-100">
        <h3 class="font-bold text-slate-900 text-base">Delivery Agency Classification & Serviceability</h3>
        <p class="text-xs text-slate-500">Assign Local (Green), District (Orange), or State (Blue) level based on verified fleet & operational capability.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th class="p-4">Agency ID</th>
              <th class="p-4">Brand & Legal Name</th>
              <th class="p-4">GSTIN / Tax ID</th>
              <th class="p-4">Service Type</th>
              <th class="p-4">Assigned Tier</th>
              <th class="p-4 text-right">Re-Classify Tier</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${agencies.map(a => `
              <tr class="hover:bg-slate-50/50">
                <td class="p-4 font-mono font-bold text-amber-800">${a.vivaan_id}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-900">${a.brand_name}</div>
                  <div class="text-slate-400">${a.legal_name}</div>
                </td>
                <td class="p-4 font-mono text-slate-700">${a.tax_id}</td>
                <td class="p-4 font-semibold text-slate-800">${a.service_type}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    a.tier === 'STATE_BLUE' ? 'bg-blue-100 text-blue-900' : a.tier === 'DISTRICT_ORANGE' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }">
                    ${a.tier.replace('_', ' ')}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <select 
                    onchange="window.vivaanAdmin.classifyAgency(${a.id}, this.value)"
                    class="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="LOCAL_GREEN" ${a.tier === 'LOCAL_GREEN' ? 'selected' : ''}>Local Green Tier</option>
                    <option value="DISTRICT_ORANGE" ${a.tier === 'DISTRICT_ORANGE' ? 'selected' : ''}>District Orange Tier</option>
                    <option value="STATE_BLUE" ${a.tier === 'STATE_BLUE' ? 'selected' : ''}>State Blue Tier</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminOrdersTab(orders) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-100">
        <h3 class="font-bold text-slate-900 text-base">Order Oversight & Escrow Release Triggers</h3>
        <p class="text-xs text-slate-500">Monitor active consignments, delivery OTP states, and farmer settlements.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th class="p-4">Order ID</th>
              <th class="p-4">Product & Qty</th>
              <th class="p-4">Farmer & Buyer</th>
              <th class="p-4">Carrier / Driver</th>
              <th class="p-4">OTP PIN</th>
              <th class="p-4">Escrow Status</th>
              <th class="p-4 text-right">Admin Override</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${orders.map(o => `
              <tr class="hover:bg-slate-50/50">
                <td class="p-4 font-mono font-bold text-slate-900">${o.id}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-900">${o.product_name}</div>
                  <div class="text-slate-500">${o.quantity} ${o.unit} • ₹${o.total_amount}</div>
                </td>
                <td class="p-4">
                  <div class="font-semibold text-emerald-800">🌾 ${o.farmer_name}</div>
                  <div class="text-slate-500">🛒 ${o.buyer_name} (${o.delivery_district})</div>
                </td>
                <td class="p-4">
                  <div class="font-semibold text-slate-800">${o.driver_name || 'Murugan K'}</div>
                  <div class="text-slate-400 text-[11px]">${o.agency_name}</div>
                </td>
                <td class="p-4">
                  <span class="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                    ${o.delivery_otp}
                  </span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded-full font-bold text-[11px] ${
                    o.escrow_status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }">
                    ${o.escrow_status}
                  </span>
                </td>
                <td class="p-4 text-right">
                  ${o.escrow_status !== 'SETTLED' ? `
                    <button 
                      onclick="window.vivaanAdmin.manualReleaseEscrow('${o.id}')"
                      class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Release Escrow
                    </button>
                  ` : `
                    <span class="text-xs font-semibold text-emerald-600">Settled ✓</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminRoutingTab() {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-xl font-black text-slate-900">Route Optimization & Serviceability Inspector</h3>
        <p class="text-xs text-slate-500">Calculate Level 1 (Single Order) & Level 2 (Multi-Order TSP) sequences with pickup-before-delivery precedence.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
          <h4 class="font-black text-slate-900 text-sm">Intelligent Serviceability Matrix Check</h4>
          <div class="space-y-2">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Pickup Location</label>
              <input type="text" id="route_pickup" value="Salem, Tamil Nadu" class="w-full px-3 py-2 border rounded-xl bg-white" />
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Delivery Location</label>
              <input type="text" id="route_delivery" value="Adyar, Chennai, Tamil Nadu" class="w-full px-3 py-2 border rounded-xl bg-white" />
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Consignment Weight (kg)</label>
              <input type="number" id="route_weight" value="250" class="w-full px-3 py-2 border rounded-xl bg-white" />
            </div>
          </div>
          <button 
            onclick="window.vivaanAdmin.testServiceability()"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
          >
            Check Serviceability Eligibility
          </button>
          <div id="serviceability-result" class="p-3 bg-white rounded-xl border border-slate-200 hidden"></div>
        </div>

        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
          <h4 class="font-black text-slate-900 text-sm">Multi-Order Sequence Optimizer (TSP Precedence)</h4>
          <p class="text-slate-500">Computes optimal stop sequence for driver starting at Salem Hub across active orders:</p>
          <div class="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200">
            <div>• VIV-ORD-88120 (Salem Farm &rarr; Chennai)</div>
            <div>• VIV-ORD-88121 (Salem Farm &rarr; Chennai)</div>
          </div>
          <button 
            onclick="window.vivaanAdmin.testOptimization()"
            class="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl"
          >
            Run Route Optimization Algorithm
          </button>
          <div id="optimization-result" class="p-3 bg-white rounded-xl border border-slate-200 hidden space-y-1.5"></div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminAuditTab(logs) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-100">
        <h3 class="font-bold text-slate-900 text-base">Immutable Security & Verification Audit Trail</h3>
        <p class="text-xs text-slate-500">Complete records of farmer approvals, agency tier assignments, and OTP delivery proof.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th class="p-4">Timestamp</th>
              <th class="p-4">Role</th>
              <th class="p-4">Action</th>
              <th class="p-4">Target</th>
              <th class="p-4">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${logs.map(l => `
              <tr class="hover:bg-slate-50/50 font-mono text-[11px]">
                <td class="p-4 text-slate-400">${l.timestamp ? l.timestamp.replace('T', ' ').slice(0, 19) : ''}</td>
                <td class="p-4 font-bold text-purple-900">${l.role}</td>
                <td class="p-4 font-bold text-slate-800">${l.action}</td>
                <td class="p-4 text-slate-600">${l.target}</td>
                <td class="p-4 text-slate-500 font-sans text-xs">${l.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.vivaanAdmin = {
  switchTab(tab) {
    adminTab = tab;
    window.vivaanApp.navigateTo('admin_panel');
  },

  selectTrackingOrder(orderId) {
    const found = activeDeliveries.find(d => d.order_id === orderId);
    if (found) {
      selectedTrackingOrder = found;
      window.vivaanApp.navigateTo('admin_panel');
    }
  },

  async simulateStep(orderId) {
    try {
      const res = await apiPost('/api/orders/simulate-step', { order_id: orderId, action: 'ADVANCE' });
      alert(res.message);
      window.vivaanApp.navigateTo('admin_panel');
    } catch (e) {
      alert('Simulate error: ' + e.message);
    }
  },

  async toggleFarmerStatus(id, newStatus) {
    try {
      const res = await apiPut(`/api/admin/farmers/${id}/status`, { status: newStatus });
      alert(res.message);
      window.vivaanApp.navigateTo('admin_panel');
    } catch (e) {
      alert(e.message);
    }
  },

  async classifyAgency(id, tier) {
    try {
      const res = await apiPut(`/api/admin/agencies/${id}/classify`, { tier });
      alert(`Agency tier updated to ${res.tier}`);
      window.vivaanApp.navigateTo('admin_panel');
    } catch (e) {
      alert(e.message);
    }
  },

  async manualReleaseEscrow(orderId) {
    if (!confirm(`Are you sure you want to release escrow payout for order ${orderId}?`)) return;
    try {
      const res = await apiPost(`/api/admin/orders/${orderId}/release-escrow`, {});
      alert(res.message);
      window.vivaanApp.navigateTo('admin_panel');
    } catch (e) {
      alert(e.message);
    }
  },

  async testServiceability() {
    const resBox = document.getElementById('serviceability-result');
    resBox.classList.remove('hidden');
    resBox.innerHTML = '<span class="text-slate-500">Checking serviceability matrix...</span>';
    try {
      const res = await apiPost('/api/routing/check-serviceability', {
        pickup_district: 'Salem',
        pickup_state: 'Tamil Nadu',
        delivery_district: 'Chennai',
        delivery_state: 'Tamil Nadu',
        weight_kg: parseFloat(document.getElementById('route_weight').value) || 250
      });
      resBox.innerHTML = `
        <div class="space-y-1">
          <span class="font-bold text-emerald-800">✓ Serviceable Corridor (${res.corridor_type})</span>
          <p class="text-slate-600">Required Level: <strong>${res.required_level}</strong> (Tier: ${res.tier_color})</p>
          <p class="text-slate-500">Matching Verified Agencies: <strong>${res.eligible_agencies_count}</strong></p>
        </div>
      `;
    } catch (e) {
      resBox.innerHTML = `<span class="text-red-600">Error: ${e.message}</span>`;
    }
  },

  async testOptimization() {
    const resBox = document.getElementById('optimization-result');
    resBox.classList.remove('hidden');
    resBox.innerHTML = '<span class="text-slate-500">Running TSP precedence optimization...</span>';
    try {
      const res = await apiPost('/api/routing/optimize', {
        driver_lat: 11.6643,
        driver_lng: 78.1460,
        order_ids: ['VIV-ORD-88120', 'VIV-ORD-88121']
      });
      resBox.innerHTML = `
        <div class="space-y-1">
          <span class="font-bold text-purple-900">${res.optimization_level} Result:</span>
          <p class="text-slate-700">Total Distance: <strong>${res.total_distance_km} km</strong> • Travel Time: <strong>${res.estimated_travel_time}</strong></p>
          <div class="space-y-1 pt-1 text-[10px]">
            ${res.stops.map(s => `
              <div class="p-1.5 bg-slate-100 rounded flex justify-between">
                <span><strong>Stop ${s.stop_number} (${s.type}):</strong> ${s.label}</span>
                <span class="font-mono text-slate-500">+${s.distance_from_prev_km} km</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      resBox.innerHTML = `<span class="text-red-600">Error: ${e.message}</span>`;
    }
  }
};
