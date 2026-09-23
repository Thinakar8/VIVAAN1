/**
 * VIVAAN Order Tracking & Live Telemetry View
 * Implements Phases 64–81, 87, 91:
 * - Two-Column Layout: Left Side Active Order List; Right Side Interactive Map
 * - Strict Privacy: Buyer CANNOT track before driver Collects from farmer
 * - Phase 71: Buyer must explicitly click "Track Live Delivery" after collection
 * - Phase 77-80: OTP Handover immediately terminates live tracking for that order
 * - Phase 62: Settlement workflow initiated ~5-10 minutes post-delivery
 */
import { t } from '../i18n.js';
import { apiGet, apiPost, state } from '../state.js';

let currentOrderData = null;
let liveTrackingData = null;
let buyerMap = null;
let buyerHasClickedTrack = false;
let activeTrackingList = [];

export async function renderOrderTracking() {
  const orderId = state.activeOrderId || 'VIV-ORD-88120';

  try {
    const res = await apiGet(`/api/orders/${orderId}/track`);
    currentOrderData = res.order;
  } catch (e) {
    currentOrderData = {
      id: orderId,
      product_name: 'Salem Pure Organic Turmeric (Haldi)',
      quantity: 10,
      unit: 'kg',
      farmer_name: 'Ramasamy Gounder',
      farmer_village: 'Omalur',
      delivery_address: 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar, Chennai',
      delivery_district: 'Chennai',
      delivery_state: 'Tamil Nadu',
      agency_name: 'GreenCorridor Agro Logistics',
      driver_name: 'Murugan K',
      driver_id: 'VIV-DR-104582',
      delivery_otp: '4819',
      order_status: 'PICKED_UP',
      tracking_phase: 'TO_BUYER',
      tracking_active: 1,
      payment_method: 'UPI',
      total_amount: 1750,
      escrow_status: 'HELD_IN_ESCROW'
    };
  }

  try {
    const trackRes = await apiGet(`/api/orders/${orderId}/live-tracking?role=BUYER`);
    liveTrackingData = trackRes;
  } catch (e) {
    liveTrackingData = {
      live_tracking_allowed: (currentOrderData.order_status === 'PICKED_UP'),
      message: e.message
    };
  }

  try {
    const listRes = await apiGet('/api/orders/active-tracking/list');
    activeTrackingList = listRes.active_orders || [];
  } catch (e) {
    activeTrackingList = [
      { id: 'VIV-ORD-88120', buyer_name: 'Aditi Sharma', product_name: 'Salem Turmeric', order_status: 'PICKED_UP', driver_name: 'Murugan K' },
      { id: 'VIV-ORD-88121', buyer_name: 'Kavitha Raman', product_name: 'Ponni Rice', order_status: 'ACCEPTED', driver_name: 'Murugan K' }
    ];
  }

  const isDelivered = (currentOrderData.order_status === 'DELIVERED');
  const canLiveTrack = (liveTrackingData && liveTrackingData.live_tracking_allowed);

  // Initialize map ONLY if buyer has explicitly clicked Track Live Delivery
  if (canLiveTrack && buyerHasClickedTrack && !isDelivered) {
    setTimeout(() => initBuyerMap(), 150);
  }

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Top Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('buyer_marketplace')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
          title="${t('back')}"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>${t('back')}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">VIVAAN Telemetry & Escrow Handover</span>
      </div>

      <!-- Top Order Bar with VIVAAN Logo -->
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-600/20">
        <div class="flex items-center gap-4">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-16 w-16 object-contain rounded-full border-2 border-amber-300 ring-2 ring-white/20 bg-white/10 shadow-md" />
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                isDelivered ? 'bg-emerald-400 text-emerald-950' : 
                canLiveTrack ? 'bg-blue-400 text-blue-950' : 'bg-amber-400 text-amber-950'
              }">
                ${currentOrderData.order_status.replace('_', ' ')}
              </span>
              <span class="font-mono text-amber-300 font-bold text-xs">${currentOrderData.id}</span>
            </div>
            <h2 class="text-2xl font-black">${currentOrderData.product_name}</h2>
            <p class="text-xs text-slate-300">Direct from Farmer: ${currentOrderData.farmer_name} • ${currentOrderData.quantity} ${currentOrderData.unit}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select 
            onchange="window.vivaanOrderTrack.switchOrder(this.value)"
            class="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl outline-none"
          >
            <option value="VIV-ORD-88120" class="text-slate-900" ${currentOrderData.id === 'VIV-ORD-88120' ? 'selected' : ''}>Order VIV-ORD-88120 (Picked Up)</option>
            <option value="VIV-ORD-88121" class="text-slate-900" ${currentOrderData.id === 'VIV-ORD-88121' ? 'selected' : ''}>Order VIV-ORD-88121 (Accepted / To Farmer)</option>
            <option value="VIV-ORD-77401" class="text-slate-900" ${currentOrderData.id === 'VIV-ORD-77401' ? 'selected' : ''}>Order VIV-ORD-77401 (Delivered)</option>
          </select>

          <button 
            onclick="window.vivaanApp.navigateTo('demo_showcase')" 
            class="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
          >
            ⚡ Demos Hub
          </button>
        </div>
      </div>

      <!-- Secret Delivery OTP Highlight Box -->
      ${!isDelivered ? `
        <div class="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-xl text-center space-y-3 relative overflow-hidden border-2 border-amber-300/40">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🔐</span> Physical Handover Verification Code
          </div>
          <h3 class="text-xs sm:text-sm font-semibold uppercase tracking-widest text-amber-100">${t('secret_otp_label')}</h3>
          <div class="inline-block bg-white text-amber-950 px-8 py-2 rounded-2xl shadow-lg border-2 border-amber-200">
            <span class="font-mono font-black text-4xl sm:text-5xl tracking-[0.3em]">${currentOrderData.delivery_otp}</span>
          </div>
          <p class="max-w-xl mx-auto text-xs text-amber-100 leading-relaxed font-medium">
            Share this 4-digit code with the delivery driver ONLY upon physical inspection of produce at your doorstep. Handover cannot be completed without this OTP.
          </p>
        </div>
      ` : ''}

      <!-- TWO-COLUMN ACTIVE TRACKING LAYOUT (Phases 67, 68, 87) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- LEFT COLUMN: Active Order Number List -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Active Tracking List
            </h3>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ${activeTrackingList.length} Active
            </span>
          </div>
          <p class="text-[11px] text-slate-500">Delivered orders are automatically purged from this active telemetry feed.</p>
          
          <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
            ${activeTrackingList.map(o => `
              <div 
                onclick="window.vivaanOrderTrack.switchOrder('${o.id}')"
                class="p-3 rounded-2xl border transition-all cursor-pointer ${
                  o.id === currentOrderData.id 
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }"
              >
                <div class="flex justify-between items-center text-xs">
                  <span class="font-mono font-bold text-slate-900">${o.id}</span>
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    o.order_status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }">${o.order_status.replace('_', ' ')}</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-1 truncate">${o.product_name} • ${o.buyer_name}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Driver: ${o.driver_name || 'Assigned'}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT COLUMN: Interactive Telemetry & Leaflet Map Display -->
        <div class="lg:col-span-2">
          
          ${isDelivered ? `
            <!-- DELIVERED STATE: Live Tracking Terminated Immediately (Phases 78-80) -->
            <div class="bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm text-center space-y-5">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                ✓
              </div>
              <div class="space-y-1">
                <h3 class="text-2xl font-black text-emerald-950">✅ Order Delivered Successfully</h3>
                <p class="text-xs text-slate-500 font-medium">Delivery confirmed by OTP verification. Live GPS tracking has ended.</p>
              </div>

              <!-- Phase 62: Settlement Workflow Status Box (~5-10 Min Target) -->
              <div class="p-5 bg-gradient-to-br from-emerald-50 to-amber-50/50 rounded-2xl border border-emerald-300 max-w-md mx-auto text-xs text-left space-y-2">
                <div class="flex justify-between items-center font-bold text-emerald-950 border-b border-emerald-200 pb-2">
                  <span>💳 Escrow Settlement Status</span>
                  <span class="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">Initiating (~5–10 min window)</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Farmer Payout (95% Farmgate):</span>
                  <strong class="text-emerald-900">₹${(currentOrderData.total_amount * 0.95).toFixed(2)}</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Driver Transport Earning:</span>
                  <strong class="text-slate-800">₹84.00 (70% of delivery)</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Carrier Agency Earning:</span>
                  <strong class="text-slate-800">₹36.00 (30% of delivery)</strong>
                </div>
              </div>

              <button 
                onclick="window.vivaanOrderTrack.openFeedback('${currentOrderData.id}', ${currentOrderData.farmer_id || 1}, ${currentOrderData.agency_id || 1})"
                class="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all"
              >
                ★ Rate Farmer & Delivery Partner
              </button>
            </div>

          ` : canLiveTrack ? `
            
            ${!buyerHasClickedTrack ? `
              <!-- PHASE 71: INTENTIONAL CLICK-TO-TRACK BUTTON (Map remains hidden until clicked!) -->
              <div class="bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-3xl">
                  🚚
                </div>
                <div class="space-y-1">
                  <h3 class="text-xl font-black text-slate-900">Your order has been collected from the farmer!</h3>
                  <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Driver <strong class="text-slate-800">${currentOrderData.driver_name || 'Murugan K'}</strong> has picked up your produce and is now on the highway to your destination.
                  </p>
                </div>
                <button 
                  onclick="window.vivaanOrderTrack.revealLiveMap()" 
                  class="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                  <span>📍</span> Track Live Delivery
                </button>
              </div>

            ` : `
              <!-- AFTER BUYER CLICKS TRACK LIVE DELIVERY: Active Map Displays -->
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Live Delivery Tracking</span>
                    </h3>
                    <p class="text-xs text-slate-500">
                      Assigned Driver: <strong class="text-slate-900">${currentOrderData.driver_name || 'Murugan K'}</strong> (${currentOrderData.agency_name})
                    </p>
                  </div>
                  <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wide">
                    En Route to You
                  </span>
                </div>

                <!-- Map Container -->
                <div id="buyer-tracking-map" class="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"></div>

                <div class="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div class="space-y-0.5">
                    <span class="font-bold text-blue-900">📍 Destination: ${currentOrderData.delivery_address}</span>
                    <p class="text-blue-700 font-medium">Preferred Slot: ${currentOrderData.preferred_time || 'Morning'}</p>
                  </div>
                  <button 
                    onclick="window.vivaanOrderTrack.refreshTracking()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <span>🔄</span> Refresh GPS
                  </button>
                </div>
              </div>
            `}

          ` : `
            <!-- PHASE 69: BEFORE COLLECT - Buyer CANNOT Track Live Driver! -->
            <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 text-center">
              <div class="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl">
                ⏳
              </div>
              <div class="space-y-1">
                <h3 class="text-lg font-black text-slate-900">“Your order is being collected from the farmer.”</h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  “Live driver tracking will become available after the parcel is collected.”
                </p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs text-slate-600 space-y-1 text-left">
                <div class="flex justify-between"><span>Farmer:</span><strong class="text-slate-900">${currentOrderData.farmer_name}</strong></div>
                <div class="flex justify-between"><span>Carrier:</span><strong class="text-slate-900">${currentOrderData.agency_name}</strong></div>
                <div class="flex justify-between"><span>Telemetry Safeguard:</span><strong class="text-emerald-700">Farm Coordinates Guarded</strong></div>
              </div>
            </div>
          `}

        </div>
      </div>

      <!-- Feedback Modal Container -->
      <div id="feedback-modal-box" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"></div>

    </div>
  `;
}

function initBuyerMap() {
  const mapEl = document.getElementById('buyer-tracking-map');
  if (!mapEl || typeof L === 'undefined' || !liveTrackingData) return;

  if (buyerMap) {
    buyerMap.remove();
    buyerMap = null;
  }

  const driverCoords = [liveTrackingData.driver_lat || 12.6500, liveTrackingData.driver_lng || 79.6000];
  const destCoords = [liveTrackingData.destination_lat || 13.0012, liveTrackingData.destination_lng || 80.2565];

  buyerMap = L.map('buyer-tracking-map').setView([12.8, 79.9], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(buyerMap);

  const truckIcon = L.divIcon({
    html: '<div style="background:#d97706; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚚</div>',
    className: '',
    iconSize: [36, 36]
  });

  const buyerIcon = L.divIcon({
    html: '<div style="background:#1e3a8a; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3)">🛒</div>',
    className: '',
    iconSize: [32, 32]
  });

  L.marker(destCoords, { icon: buyerIcon })
    .addTo(buyerMap)
    .bindPopup('<b>Your Delivery Address</b><br>' + (liveTrackingData.destination_address || 'Adyar, Chennai'));

  L.marker(driverCoords, { icon: truckIcon })
    .addTo(buyerMap)
    .bindPopup('<b>Live Driver: ' + (liveTrackingData.driver_name || 'Murugan K') + '</b><br>Speed: 45 km/h')
    .openPopup();

  const routePolyline = L.polyline([
    [11.6643, 78.1460],
    driverCoords,
    destCoords
  ], {
    color: '#2563eb',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 8'
  }).addTo(buyerMap);

  buyerMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
}

window.vivaanOrderTrack = {
  revealLiveMap() {
    buyerHasClickedTrack = true;
    window.vivaanApp.navigateTo('order_tracking');
  },

  switchOrder(orderId) {
    state.activeOrderId = orderId;
    buyerHasClickedTrack = false;
    window.vivaanApp.navigateTo('order_tracking');
  },

  async refreshTracking() {
    window.vivaanApp.navigateTo('order_tracking');
  },

  openFeedback(orderId, farmerId, agencyId) {
    const modal = document.getElementById('feedback-modal-box');
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button onclick="document.getElementById('feedback-modal-box').classList.add('hidden')" class="absolute top-5 right-5 text-slate-400 hover:text-slate-800 text-2xl font-bold">&times;</button>
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-xl font-black text-slate-900">Rate Your Experience</h3>
          <p class="text-xs text-slate-500">Your feedback ensures high standards for verified farmers and delivery carriers.</p>
        </div>
        <form onsubmit="event.preventDefault(); window.vivaanOrderTrack.submitFeedback('${orderId}', ${farmerId}, ${agencyId});" class="space-y-4 text-xs">
          <div class="space-y-1.5">
            <label class="block font-bold text-slate-700 uppercase">Rate Farmer & Produce Quality</label>
            <select id="fb_farmer_rating" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold bg-white">
              <option value="5">★★★★★ (5/5) - Outstanding Fresh Quality</option>
              <option value="4">★★★★☆ (4/5) - Very Good</option>
              <option value="3">★★★☆☆ (3/5) - Satisfactory</option>
            </select>
            <textarea id="fb_farmer_comment" rows="2" class="w-full px-4 py-2 rounded-xl border border-slate-300" placeholder="Comments on harvest freshness, packaging..."></textarea>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-slate-100">
            <label class="block font-bold text-slate-700 uppercase">Rate Delivery Carrier & Handover</label>
            <select id="fb_agency_rating" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold bg-white">
              <option value="5">★★★★★ (5/5) - Prompt & Courteous Delivery</option>
              <option value="4">★★★★☆ (4/5) - Good</option>
              <option value="3">★★★☆☆ (3/5) - Average</option>
            </select>
            <textarea id="fb_agency_comment" rows="2" class="w-full px-4 py-2 rounded-xl border border-slate-300" placeholder="Comments on driver professionalism, speed..."></textarea>
          </div>
          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onclick="document.getElementById('feedback-modal-box').classList.add('hidden')" class="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
            <button type="submit" class="px-6 py-2.5 bg-emerald-700 text-white font-black rounded-xl shadow-md">Submit Review</button>
          </div>
        </form>
      </div>
    `;
  },

  async submitFeedback(orderId, farmerId, agencyId) {
    const fRating = parseInt(document.getElementById('fb_farmer_rating').value);
    const fComment = document.getElementById('fb_farmer_comment').value.trim();
    const aRating = parseInt(document.getElementById('fb_agency_rating').value);
    const aComment = document.getElementById('fb_agency_comment').value.trim();

    try {
      const res = await apiPost('/api/orders/reviews', {
        order_id: orderId,
        buyer_name: (state.currentUser && state.currentUser.name) || 'Aditi Sharma',
        farmer_id: farmerId,
        farmer_rating: fRating,
        product_quality_rating: fRating,
        listing_accuracy_rating: fRating,
        farmer_review: fComment,
        agency_id: agencyId,
        agency_rating: aRating,
        delivery_timeliness_rating: aRating,
        professionalism_rating: aRating,
        agency_review: aComment
      });
      alert(res.message);
      document.getElementById('feedback-modal-box').classList.add('hidden');
    } catch (e) {
      alert("❌ " + e.message);
    }
  }
};
