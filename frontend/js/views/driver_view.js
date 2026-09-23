/**
 * VIVAAN Driver Delivery View (Phases 34, 35, 36, 39, 44, 45, 46, 47, 65)
 * - Left-side Assigned Orders List
 * - Dynamic Action Buttons: "Accept Order" -> "Collect Order" -> "Enter Delivery OTP"
 * - Dynamic Map Routing (Driver -> Farmer, then Driver -> Buyer)
 * - Strict Handover OTP Verification (terminates tracking for everyone)
 * - Hackathon Demo Mode: "Demo / Simulated GPS"
 */
import { t } from '../i18n.js';
import { apiGet, apiPost, state } from '../state.js';

let driverOrders = [];
let activeOrder = null;
let leafletMap = null;
let currentDriverMarker = null;
let routePolyline = null;

export async function renderDriverView() {
  const driverId = (state.currentUser && state.currentUser.driver_id) || 'VIV-DR-104582';
  const driverName = (state.currentUser && state.currentUser.name) || 'Murugan K';

  try {
    const res = await apiGet(`/api/drivers/${driverId}/deliveries`);
    driverOrders = res.deliveries || [];
    if (!activeOrder && driverOrders.length > 0) {
      activeOrder = driverOrders[0];
    } else if (activeOrder) {
      const match = driverOrders.find(o => o.id === activeOrder.id);
      if (match) activeOrder = match;
    }
  } catch (e) {
    driverOrders = [];
  }

  setTimeout(() => initMap(), 150);

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('user_type_select')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
          title="${t('back')}"
        >
          <span class="text-sm font-black text-indigo-700">&larr;</span>
          <span>${t('back')}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">Driver Logistics & Live Navigation</span>
      </div>

      <!-- Top Driver Header with VIVAAN Logo -->
      <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 border border-indigo-500/20">
        <div class="flex items-center gap-4">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-16 w-16 object-contain rounded-full border-2 border-amber-300 ring-2 ring-white/20 bg-white/10 shadow-md" />
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white font-black text-[11px] uppercase tracking-wide">
                🛵 Certified Rural Driver
              </span>
              <span class="text-amber-300 font-mono font-bold text-xs">${driverId}</span>
            </div>
            <h2 class="text-2xl font-black">${driverName}</h2>
            <p class="text-xs text-indigo-200">GreenCorridor Agro Logistics • Pickup TN-30-BC-4890 • Commercial LMV</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="px-3.5 py-2 bg-white/10 rounded-2xl border border-white/20 text-xs font-semibold flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Duty: <strong class="text-emerald-300">Active Duty (GPS Active)</strong></span>
          </div>

          <button 
            onclick="window.vivaanDriver.triggerDemoSimulation()" 
            class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
            title="Simulate driving and delivery progression for demonstration"
          >
            <span>⚡</span> Demo GPS Auto-Run
          </button>
        </div>
      </div>

      ${driverOrders.length === 0 ? `
        <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span class="text-4xl">🛵</span>
          <h3 class="font-bold text-slate-800 text-lg">No Active Shipments Assigned</h3>
          <p class="text-xs text-slate-500">When your agency assigns new farmgate pickup orders, they will appear here.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT SIDE: Assigned Orders List (Phase 34) -->
          <div class="lg:col-span-4 space-y-3">
            <div class="flex items-center justify-between px-1">
              <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>📦</span> Assigned Orders (${driverOrders.length})
              </h3>
              <span class="text-[11px] font-bold text-slate-400 uppercase">Select to Navigate</span>
            </div>

            <div class="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              ${driverOrders.map(ord => {
                const isSelected = activeOrder && activeOrder.id === ord.id;
                const statusBadgeClass = 
                  ord.order_status === 'DELIVERED' ? 'bg-slate-100 text-slate-600' :
                  ord.order_status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                  ord.order_status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

                return `
                  <div 
                    onclick="window.vivaanDriver.selectOrder('${ord.id}')"
                    class="p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                    }"
                  >
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="font-mono text-xs font-black ${isSelected ? 'text-indigo-900' : 'text-slate-800'}">${ord.id}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass}">
                        ${ord.order_status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 class="font-bold text-slate-900 text-xs line-clamp-1">${ord.product_name}</h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">${ord.quantity} ${ord.unit} • ₹${ord.total_amount}</p>

                    <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span>🌾 ${ord.farmer_name}</span>
                      <span>🎯 ${ord.delivery_district}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- CENTER: Interactive Map & Live Navigation (Phases 36, 44, 45) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Live GPS Navigation</span>
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    Phase: <strong class="text-indigo-950 font-bold">${activeOrder.tracking_phase || 'TO_FARMER'}</strong>
                  </p>
                </div>

                <!-- Sandbox Telemetry Label -->
                <div class="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span>📡</span> Demo / Simulated GPS
                </div>
              </div>

              <!-- Leaflet Map Mount Container -->
              <div id="delivery-map" class="h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"></div>

              <!-- Dynamic Waypoint Route Banner -->
              <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="text-slate-500">Current Destination:</span>
                  <span class="text-indigo-900">
                    ${activeOrder.tracking_phase === 'TO_BUYER' 
                      ? `🎯 Buyer: ${activeOrder.buyer_name} (${activeOrder.delivery_district})` 
                      : `🌾 Farmer: ${activeOrder.farmer_name} (${activeOrder.farm_village || 'Farmgate'}, Salem)`
                    }
                  </span>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vehicle Telemetry:</span>
                  <span class="font-mono text-emerald-700 font-bold">Speed: 45 km/h • GPS Sync: Live</span>
                </div>
              </div>

              <!-- Quick Demo Step Controller -->
              <div class="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onclick="window.vivaanDriver.stepDemo()"
                  class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5"
                >
                  <span>⏩</span> Step Movement
                </button>
                <button 
                  onclick="window.vivaanDriver.resetOrderState('${activeOrder.id}')"
                  class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <span>🔄</span> Reset Order
                </button>
              </div>

            </div>
          </div>

          <!-- RIGHT SIDE: Order Action Box & Handover OTP Workflow (Phases 35, 39, 46) -->
          <div class="lg:col-span-3 space-y-4">
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              
              <div class="border-b border-slate-100 pb-3">
                <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Driver Operational Action</span>
                <h3 class="text-lg font-black text-slate-900 mt-0.5">Delivery Pipeline</h3>
              </div>

              ${renderDriverActionBox(activeOrder)}

              <!-- Order Summary Meta -->
              <div class="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                <div class="flex justify-between">
                  <span>Order ID:</span>
                  <span class="font-mono font-bold text-slate-800">${activeOrder.id}</span>
                </div>
                <div class="flex justify-between">
                  <span>Produce:</span>
                  <span class="font-bold text-slate-800">${activeOrder.product_name}</span>
                </div>
                <div class="flex justify-between">
                  <span>Cargo Weight:</span>
                  <span class="font-bold text-slate-800">${activeOrder.quantity} ${activeOrder.unit}</span>
                </div>
                <div class="flex justify-between">
                  <span>Delivery Address:</span>
                  <span class="font-semibold text-slate-800 text-right line-clamp-1">${activeOrder.delivery_address}</span>
                </div>
                <div class="flex justify-between">
                  <span>Recipient Phone:</span>
                  <span class="font-bold text-indigo-700">${activeOrder.buyer_phone}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      `}

    </div>
  `;
}

function renderDriverActionBox(order) {
  const status = order.order_status;

  if (status === 'DELIVERED') {
    return `
      <div class="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-center space-y-2">
        <span class="text-3xl">✅</span>
        <h4 class="font-black text-emerald-950 text-base">Delivered & Verified</h4>
        <p class="text-xs text-emerald-800 leading-relaxed font-medium">
          Delivery confirmed with OTP ${order.delivery_otp}. Live GPS tracking has automatically terminated for all parties. Escrow payout released.
        </p>
      </div>
    `;
  }

  if (status === 'ORDER_PLACED' || status === 'ASSIGNED') {
    return `
      <div class="space-y-4">
        <div class="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Step 1: Accept Order</strong>
          <p class="mt-1">Accepting assigns route coordinates to the farmer pickup point. Location sharing begins for VIVAAN and Agency.</p>
        </div>

        <button 
          onclick="window.vivaanDriver.acceptOrder('${order.id}')"
          class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
        >
          <span>✅</span> Accept Order
        </button>
      </div>
    `;
  }

  if (status === 'ACCEPTED' || order.tracking_phase === 'TO_FARMER') {
    return `
      <div class="space-y-4">
        <div class="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs text-indigo-950 leading-relaxed">
          <strong class="text-indigo-900">Step 2: Collect at Farmgate</strong>
          <p class="mt-1">Drive to farmer's location in ${order.farm_village || 'Omalur'}. Inspect produce before physical handover.</p>
          <p class="mt-2 font-bold text-amber-800 text-[11px]">Notice: Buyer tracking activates ONLY after pickup!</p>
        </div>

        <button 
          onclick="window.vivaanDriver.collectOrder('${order.id}')"
          class="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
        >
          <span>📦</span> Collect Order
        </button>
      </div>
    `;
  }

  // Status is PICKED_UP or TO_BUYER -> En route to Buyer & Enter Delivery OTP
  return `
    <div class="space-y-4">
      <div class="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 leading-relaxed">
        <strong class="text-blue-900">Step 3: Doorstep Handover & OTP</strong>
        <p class="mt-1">En route to buyer in ${order.delivery_district}. Ask recipient for the 4-digit Delivery OTP shown in their app.</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase mb-2 text-center">4-Digit Buyer Delivery OTP</label>
        <input 
          type="text" 
          id="driver_otp_input" 
          maxlength="4" 
          class="w-full text-center tracking-[0.8em] font-black text-3xl py-3 border-2 border-indigo-300 rounded-2xl focus:border-indigo-600 focus:ring-0 bg-slate-50" 
          placeholder="••••" 
        />
      </div>

      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
        <strong>💡 Sandbox Testing Tip:</strong>
        <p>Active secret OTP for this order: <span class="font-mono font-black text-sm text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">${order.delivery_otp}</span></p>
      </div>

      <button 
        onclick="window.vivaanDriver.submitOtp('${order.id}')"
        class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
      >
        <span>🔐</span> Verify & Confirm Handover
      </button>
    </div>
  `;
}

function initMap() {
  const mapEl = document.getElementById('delivery-map');
  if (!mapEl || typeof L === 'undefined' || !activeOrder) return;

  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const pickupCoords = [activeOrder.pickup_lat || 11.6643, activeOrder.pickup_lng || 78.1460];
  const deliveryCoords = [activeOrder.delivery_lat || 13.0012, activeOrder.delivery_lng || 80.2565];
  const driverCoords = [activeOrder.driver_lat || 11.7500, activeOrder.driver_lng || 78.1000];

  leafletMap = L.map('delivery-map').setView([12.35, 79.2], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);

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

  const truckIcon = L.divIcon({
    html: '<div style="background:#d97706; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚚</div>',
    className: '',
    iconSize: [36, 36]
  });

  // Markers
  L.marker(pickupCoords, { icon: farmIcon })
    .addTo(leafletMap)
    .bindPopup(`<b>Farmgate Pickup</b><br>${activeOrder.farmer_name}`);

  L.marker(deliveryCoords, { icon: buyerIcon })
    .addTo(leafletMap)
    .bindPopup(`<b>Buyer Destination</b><br>${activeOrder.buyer_name}`);

  currentDriverMarker = L.marker(driverCoords, { icon: truckIcon })
    .addTo(leafletMap)
    .bindPopup(`<b>Assigned Driver: ${activeOrder.driver_name || 'Murugan K'}</b><br>Stage: ${activeOrder.tracking_phase || 'TO_FARMER'}`)
    .openPopup();

  // Route Polyline
  const polylineCoords = [
    pickupCoords,
    [12.1211, 78.1582],
    [12.5186, 78.2137],
    driverCoords,
    [12.9165, 79.1325],
    [12.8342, 79.7036],
    deliveryCoords
  ];

  routePolyline = L.polyline(polylineCoords, {
    color: activeOrder.tracking_phase === 'TO_BUYER' ? '#2563eb' : '#059669',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 8'
  }).addTo(leafletMap);

  leafletMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
}

// Global Driver controller functions
window.vivaanDriver = {
  selectOrder(orderId) {
    const found = driverOrders.find(o => o.id === orderId);
    if (found) {
      activeOrder = found;
      document.getElementById('app-main').innerHTML = '';
      renderDriverView().then(html => {
        document.getElementById('app-main').innerHTML = html;
      });
    }
  },

  async acceptOrder(orderId) {
    try {
      const res = await apiPost('/api/drivers/accept-order', {
        order_id: orderId,
        driver_id: (state.currentUser && state.currentUser.driver_id) || 'VIV-DR-104582',
        driver_name: (state.currentUser && state.currentUser.name) || 'Murugan K'
      });
      alert(res.message);
      if (activeOrder && activeOrder.id === orderId) {
        activeOrder.order_status = 'ACCEPTED';
        activeOrder.tracking_phase = 'TO_FARMER';
      }
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert("❌ " + e.message);
    }
  },

  async collectOrder(orderId) {
    try {
      const res = await apiPost('/api/drivers/collect-order', {
        order_id: orderId,
        driver_id: (state.currentUser && state.currentUser.driver_id) || 'VIV-DR-104582'
      });
      alert(res.message);
      if (activeOrder && activeOrder.id === orderId) {
        activeOrder.order_status = 'PICKED_UP';
        activeOrder.tracking_phase = 'TO_BUYER';
      }
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert("❌ " + e.message);
    }
  },

  async submitOtp(orderId) {
    const entered = document.getElementById('driver_otp_input').value.trim();
    if (!entered || entered.length !== 4) {
      alert("Please enter the 4-digit code provided by the buyer.");
      return;
    }

    try {
      const res = await apiPost('/api/drivers/verify-delivery-otp', {
        order_id: orderId,
        entered_otp: entered,
        driver_id: (state.currentUser && state.currentUser.driver_id) || 'VIV-DR-104582'
      });
      alert(res.message);
      if (activeOrder && activeOrder.id === orderId) {
        activeOrder.order_status = 'DELIVERED';
        activeOrder.tracking_active = 0;
        activeOrder.tracking_phase = 'ENDED';
      }
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert("❌ " + e.message);
    }
  },

  async stepDemo() {
    if (!activeOrder) return;
    try {
      const res = await apiPost('/api/orders/simulate-step', {
        order_id: activeOrder.id,
        action: 'ADVANCE'
      });
      alert(res.message);
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert("Demo step: " + e.message);
    }
  },

  async triggerDemoSimulation() {
    if (!activeOrder) return;
    try {
      const res = await apiPost('/api/orders/simulate-step', {
        order_id: activeOrder.id,
        action: 'AUTO'
      });
      alert("⚡ " + res.message);
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert("Demo auto-run: " + e.message);
    }
  },

  async resetOrderState(orderId) {
    try {
      await apiPost('/api/orders/simulate-step', {
        order_id: orderId,
        action: 'ACCEPT'
      });
      alert("Order reset to ACCEPTED / TO_FARMER for re-testing.");
      window.vivaanApp.navigateTo('driver_view');
    } catch (e) {
      alert(e.message);
    }
  }
};
