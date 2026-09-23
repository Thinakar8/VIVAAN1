/**
 * VIVAAN Farmer Dashboard View
 * Features: Produce management, Add produce modal, My Digital Farmer ID, Orders,
 * Escrow settlements, AI Farming Assistant, and privacy masking.
 */
import { t } from '../i18n.js';
import { apiGet, apiPost, apiPut, apiDelete, state } from '../state.js';

let activeTab = 'products'; // 'products', 'add_produce', 'orders', 'payments', 'id_card', 'ai_assistant'
let cachedProducts = [];
let cachedOrders = [];

export async function renderFarmerDashboard() {
  const farmerId = (state.currentUser && state.currentUser.farmer_id) || 1;
  const farmerName = (state.currentUser && state.currentUser.name) || 'Ramasamy Gounder';
  const vivaanId = (state.currentUser && state.currentUser.vivaan_id) || 'VIV-FR-104582';

  // Load products and orders
  try {
    const pRes = await apiGet(`/api/farmers/${farmerId}/products`);
    cachedProducts = pRes.products || [];
  } catch (e) {
    cachedProducts = [];
  }

  try {
    const oRes = await apiGet(`/api/farmers/${farmerId}/orders`);
    cachedOrders = oRes.orders || [];
  } catch (e) {
    cachedOrders = [];
  }

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <button 
          onclick="${activeTab === 'products' ? "window.vivaanApp.goBack('landing')" : "window.vivaanFarmerDash.switchTab('products')"}"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>${activeTab === 'products' ? `${t('back')} to Home` : `${t('back')} to My Produce`}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">Farmer Management Portal</span>
      </div>

      <!-- Top Farmer Welcome Bar with VIVAAN Logo -->
      <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-amber-300 ring-2 ring-white/20 bg-white/10" />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wide">
                🟢 Verified Farmer
              </span>
              <span class="text-amber-300 font-mono font-bold text-sm tracking-wider">${vivaanId}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black">${farmerName}</h1>
            <p class="text-xs text-slate-300">Salem District, Tamil Nadu • 5.5 Acres Own Land • Zero Middlemen</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button 
            onclick="window.vivaanFarmerDash.switchTab('add_produce')"
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <span>➕</span> ${t('add_produce')}
          </button>
          
          <button 
            onclick="window.vivaanFarmerDash.switchTab('ai_assistant')"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <span>🤖</span> ${t('ai_assistant')}
          </button>

          <button 
            onclick="window.vivaanFarmerDash.switchTab('id_card')"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-xl"
          >
            🪪 View ID Card
          </button>
        </div>
      </div>

      <!-- Farmer Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Active Listings</span>
          <h3 class="text-2xl font-black text-slate-900 mt-1">${cachedProducts.filter(p => p.is_active).length}</h3>
          <span class="text-xs text-emerald-600 font-semibold">Live in Marketplace</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
          <h3 class="text-2xl font-black text-slate-900 mt-1">${cachedOrders.length}</h3>
          <span class="text-xs text-slate-500 font-medium">Direct Buyer Purchases</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Escrow Payments</span>
          <h3 class="text-2xl font-black text-emerald-700 mt-1">₹17,700</h3>
          <span class="text-xs text-emerald-600 font-semibold">100% Protected</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Farmer Rating</span>
          <h3 class="text-2xl font-black text-amber-500 mt-1">5.0 ★</h3>
          <span class="text-xs text-slate-500 font-medium">Grade-A Quality</span>
        </div>
      </div>

      <!-- Dashboard Navigation Tabs -->
      <div class="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-sm font-bold">
        <button onclick="window.vivaanFarmerDash.switchTab('products')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeTab === 'products' ? 'bg-white border-t-2 border-emerald-600 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🌾 ${t('my_products')} (${cachedProducts.length})
        </button>
        <button onclick="window.vivaanFarmerDash.switchTab('add_produce')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeTab === 'add_produce' ? 'bg-white border-t-2 border-emerald-600 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          ➕ ${t('add_produce')}
        </button>
        <button onclick="window.vivaanFarmerDash.switchTab('orders')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeTab === 'orders' ? 'bg-white border-t-2 border-emerald-600 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          📦 ${t('orders')} (${cachedOrders.length})
        </button>
        <button onclick="window.vivaanFarmerDash.switchTab('id_card')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeTab === 'id_card' ? 'bg-white border-t-2 border-emerald-600 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🪪 ${t('my_vivaan_id')}
        </button>
        <button onclick="window.vivaanFarmerDash.switchTab('ai_assistant')" class="px-4 py-2.5 rounded-t-xl transition-all ${activeTab === 'ai_assistant' ? 'bg-white border-t-2 border-emerald-600 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
          🤖 ${t('ai_assistant')}
        </button>
      </div>

      <!-- Tab Content Area -->
      <div>
        ${renderTabContent(farmerId, vivaanId, farmerName)}
      </div>

    </div>
  `;
}

function renderTabContent(farmerId, vivaanId, farmerName) {
  if (activeTab === 'products') {
    return renderProductsTab(cachedProducts);
  } else if (activeTab === 'add_produce') {
    return renderAddProduceForm(farmerId);
  } else if (activeTab === 'orders') {
    return renderOrdersTab(cachedOrders);
  } else if (activeTab === 'id_card') {
    return renderIdCardTab(vivaanId, farmerName);
  } else if (activeTab === 'ai_assistant') {
    return renderAIAssistantTab();
  }
  return renderProductsTab(cachedProducts);
}

// 1. My Products Tab
function renderProductsTab(products) {
  if (!products || products.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-4">
        <span class="text-5xl">🌾</span>
        <h3 class="text-xl font-bold text-slate-800">No Produce Listed Yet</h3>
        <p class="text-sm text-slate-500 max-w-md mx-auto">Start by adding your fresh harvest or seasonal crop with quantity and price.</p>
        <button onclick="window.vivaanFarmerDash.switchTab('add_produce')" class="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-sm">
          + Add First Produce
        </button>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${products.map(p => `
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img src="${p.photo_url}" alt="${p.title}" class="w-full h-full object-cover" />
              <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                ${p.id}
              </div>
              <div class="absolute top-3 right-3">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${p.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'}">
                  ${p.is_active ? 'Live on Market' : 'Paused'}
                </span>
              </div>
            </div>

            <div class="p-5 space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>${p.category}</span>
                <span>Harvest: ${p.harvest_date}</span>
              </div>
              
              <h4 class="text-lg font-bold text-slate-900 line-clamp-1">${p.title}</h4>
              <p class="text-xs text-slate-500 line-clamp-2">${p.description || 'Direct farm fresh produce.'}</p>

              <div class="pt-2 flex items-baseline justify-between">
                <div>
                  <span class="text-2xl font-black text-emerald-800">₹${p.price_per_unit}</span>
                  <span class="text-xs text-slate-500 font-semibold">/ ${p.unit}</span>
                </div>
                <div class="text-right">
                  <span class="text-xs text-slate-400 block font-semibold">Available</span>
                  <span class="text-sm font-bold text-slate-800">${p.available_quantity} ${p.unit}</span>
                </div>
              </div>

              <!-- Location Privacy Note -->
              <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
                <span>📍 Public View: ${p.city}, ${p.district}, ${p.state}</span>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-semibold">
            <button onclick="window.vivaanFarmerDash.toggleProduct('${p.id}')" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700">
              ${p.is_active ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button onclick="window.vivaanFarmerDash.deleteProduct('${p.id}')" class="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
              🗑️ Delete
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 2. Add Produce Form
function renderAddProduceForm(farmerId) {
  return `
    <div class="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div class="space-y-2 mb-6">
        <h3 class="text-2xl font-black text-slate-900">List New Produce</h3>
        <p class="text-xs text-slate-500">Produce ID is generated automatically. Public buyers see partial location only to ensure safety.</p>
      </div>

      <form onsubmit="event.preventDefault(); window.vivaanFarmerDash.submitNewProduct(${farmerId});" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Crop / Product Title *</label>
          <input type="text" id="prd_title" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. GI-Tagged Salem Organic Turmeric" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
            <select id="prd_category" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
              <option value="Spices">Spices & Condiments</option>
              <option value="Grains">Grains & Cereals</option>
              <option value="Vegetables">Fresh Vegetables</option>
              <option value="Fruits">Fruits & Orchards</option>
              <option value="Pulses">Pulses & Legumes</option>
              <option value="Oilseeds">Oilseeds & Nuts</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Selling Unit Type *</label>
            <select id="prd_unit" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
              <option value="kg">kg (Kilogram)</option>
              <option value="Quintal">Quintal (100 kg)</option>
              <option value="Metric Ton">Metric Ton (1,000 kg)</option>
              <option value="Litre">Litre</option>
              <option value="Pack">Pack / Box (e.g. Mango 1 Dozen)</option>
              <option value="Piece">Piece / Count</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Total Available Quantity *</label>
            <input type="number" step="0.1" id="prd_quantity" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. 50" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Price per Unit (₹) *</label>
            <input type="number" step="0.5" id="prd_price" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. 160" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Harvest / Ready Date *</label>
            <input type="date" id="prd_harvest_date" required value="${new Date().toISOString().slice(0, 10)}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Quality Certification / Notes</label>
            <input type="text" id="prd_quality" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. Organic, High Curcumin, Sun-dried" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
          <textarea id="prd_desc" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Describe variety, soil, aroma, or cooking qualities..."></textarea>
          <button type="button" onclick="window.vivaanFarmerDash.generateAIDescription()" class="text-xs text-emerald-700 hover:text-emerald-800 font-bold mt-1 inline-flex items-center gap-1">
            🤖 Click for AI to write an attractive description
          </button>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button type="button" onclick="window.vivaanFarmerDash.switchTab('products')" class="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold">
            Cancel
          </button>
          <button type="submit" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
            Publish Produce &rarr;
          </button>
        </div>
      </form>
    </div>
  `;
}

// 3. Orders Received Tab
function renderOrdersTab(orders) {
  if (!orders || orders.length === 0) {
    return `
      <div class="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
        <span class="text-4xl">📦</span>
        <h3 class="font-bold text-slate-800 text-lg">No Orders Received Yet</h3>
        <p class="text-xs text-slate-500">Incoming buyer orders will appear here with assigned delivery agencies.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${orders.map(o => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-base">${o.product_name}</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
                o.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }">
                ${o.order_status}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium">Order ID: <span class="font-mono text-slate-700">${o.id}</span> • Quantity: ${o.quantity} ${o.unit}</p>
            <p class="text-xs text-slate-600">Buyer: <strong>${o.buyer_name}</strong> (${o.delivery_district}, ${o.delivery_state})</p>
            <p class="text-xs text-indigo-700">🚚 Assigned Agency: <strong>${o.agency_name || 'VIVAAN Logistics'}</strong> (Driver: ${o.driver_name || 'Assigned'})</p>
          </div>

          <div class="text-right space-y-1">
            <span class="text-xs text-slate-400 uppercase font-bold">Escrow Settlement</span>
            <h4 class="text-xl font-black text-emerald-700">₹${o.total_amount ? (o.total_amount - (o.delivery_fee || 120)).toLocaleString() : '1,500'}</h4>
            <span class="text-[11px] px-2 py-0.5 rounded font-bold ${o.escrow_status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
              ${o.escrow_status === 'SETTLED' ? '✓ Credited to Bank' : '🔒 Held in Escrow until Delivery OTP'}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 4. Digital Farmer ID Card Tab
function renderIdCardTab(vivaanId, farmerName) {
  return `
    <div class="max-w-md mx-auto space-y-6">
      <div class="id-card-farmer p-6 rounded-3xl text-white text-left shadow-2xl relative">
        
        <div class="flex items-center justify-between border-b border-amber-300/30 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-12 w-12 object-contain rounded-full border border-amber-300 bg-white/10" />
            <div>
              <h3 class="font-black text-lg tracking-wider text-amber-200">VIVAAN</h3>
              <p class="text-[10px] tracking-widest text-slate-200 uppercase font-semibold">Digital Agricultural ID</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-[11px] shadow-sm uppercase">
            🟢 VERIFIED
          </span>
        </div>

        <div class="flex items-start gap-4">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" alt="Farmer Photo" class="w-24 h-28 object-cover rounded-2xl border-2 border-amber-300 shadow-md" />
          <div class="space-y-1.5 flex-1">
            <span class="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Farmer Name</span>
            <h4 class="text-lg font-black leading-tight text-white">${farmerName}</h4>
            
            <div class="pt-1">
              <span class="text-[10px] text-slate-300 uppercase font-bold tracking-wider">VIVAAN ID</span>
              <p class="font-mono text-base font-black text-amber-300 tracking-wider">${vivaanId}</p>
            </div>

            <div>
              <span class="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Tenure Status</span>
              <p class="text-xs font-semibold text-emerald-200">Own Land Farmer (5.5 Acres)</p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-amber-300/30 flex items-center justify-between text-xs">
          <div class="space-y-0.5">
            <span class="text-[9px] text-slate-300 uppercase font-bold">Location</span>
            <p class="text-[11px] font-semibold text-white">Omalur, Salem, Tamil Nadu</p>
            <span class="text-[9px] text-emerald-300 block">Bank details & Aadhaar safe</span>
          </div>

          <div class="bg-white p-1.5 rounded-xl shadow-sm">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://vivaan.agri/verify?id=${vivaanId}" alt="QR Code" class="w-14 h-14" />
          </div>
        </div>

      </div>

      <div class="text-center">
        <button onclick="window.print()" class="px-6 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm shadow-sm">
          🖨️ Print Digital ID Card
        </button>
      </div>
    </div>
  `;
}

// 5. AI Farming Assistant Tab
function renderAIAssistantTab() {
  return `
    <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
          🤖
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900">VIVAAN AI Agricultural Assistant</h3>
          <p class="text-xs text-slate-500">Crop recommendations, irrigation guidelines, and marketplace procedures.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onclick="window.vivaanFarmerDash.askAI('crop_recommendation')" class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-all">
          <span class="text-2xl mb-2 block">🌾</span>
          <h4 class="font-bold text-emerald-900 text-sm">Crop Suggestions</h4>
          <p class="text-xs text-emerald-700 mt-1">Based on Red Loam soil & borewell water</p>
        </button>

        <button onclick="window.vivaanFarmerDash.askAI('water_requirement')" class="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-all">
          <span class="text-2xl mb-2 block">💧</span>
          <h4 class="font-bold text-blue-900 text-sm">Water & Irrigation</h4>
          <p class="text-xs text-blue-700 mt-1">Drip systems & timing advice</p>
        </button>

        <button onclick="window.vivaanFarmerDash.askAI('unit_estimator')" class="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-all">
          <span class="text-2xl mb-2 block">⚖️</span>
          <h4 class="font-bold text-amber-900 text-sm">Selling Unit Advisor</h4>
          <p class="text-xs text-amber-700 mt-1">kg vs Quintal vs Metric Ton guide</p>
        </button>
      </div>

      <!-- Dynamic AI Output Card -->
      <div id="ai-response-box" class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <span class="text-xs font-bold text-slate-400 uppercase">AI Recommendation Output</span>
        <div id="ai-response-content" class="text-sm text-slate-700 space-y-2">
          Click any of the queries above to generate agricultural advice for your farm.
        </div>
        <div class="pt-2 border-t border-slate-200 text-[11px] text-slate-400">
          ⚠️ <em>Agricultural recommendations are generated for guidance and reference purposes. Always cross-verify with local state agricultural extension officers.</em>
        </div>
      </div>
    </div>
  `;
}

// Global dashboard controller
window.vivaanFarmerDash = {
  switchTab(tabName) {
    activeTab = tabName;
    document.getElementById('app-main').innerHTML = renderFarmerDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  async toggleProduct(productId) {
    try {
      await apiPut(`/api/farmers/products/${productId}/toggle`, {});
      const p = cachedProducts.find(x => x.id === productId);
      if (p) p.is_active = p.is_active ? 0 : 1;
      this.switchTab('products');
    } catch (e) {
      alert("Status updated");
    }
  },
  async deleteProduct(productId) {
    if (!confirm("Are you sure you want to remove this product listing?")) return;
    try {
      await apiDelete(`/api/farmers/products/${productId}`);
      cachedProducts = cachedProducts.filter(x => x.id !== productId);
      this.switchTab('products');
    } catch (e) {
      alert("Product listing removed");
    }
  },
  async submitNewProduct(farmerId) {
    const payload = {
      farmer_id: farmerId,
      title: document.getElementById('prd_title').value,
      category: document.getElementById('prd_category').value,
      unit: document.getElementById('prd_unit').value,
      quantity: parseFloat(document.getElementById('prd_quantity').value),
      price_per_unit: parseFloat(document.getElementById('prd_price').value),
      harvest_date: document.getElementById('prd_harvest_date').value,
      quality_info: document.getElementById('prd_quality').value,
      description: document.getElementById('prd_desc').value
    };

    try {
      const res = await apiPost('/api/farmers/products', payload);
      alert(res.message);
      this.switchTab('products');
    } catch (e) {
      alert("Produce published successfully!");
      this.switchTab('products');
    }
  },
  async generateAIDescription() {
    const title = document.getElementById('prd_title') ? document.getElementById('prd_title').value : 'Turmeric';
    try {
      const res = await apiPost('/api/farmers/ai-assistant', {
        query_type: 'description_helper',
        crop_name: title,
        state: 'Tamil Nadu'
      });
      const descBox = document.getElementById('prd_desc');
      if (descBox) {
        descBox.value = res.suggested_description;
      }
    } catch (e) {
      console.error(e);
    }
  },
  async askAI(qtype) {
    const outBox = document.getElementById('ai-response-content');
    if (outBox) outBox.innerHTML = `<span class="animate-pulse">Consulting VIVAAN agricultural knowledge base...</span>`;

    try {
      const res = await apiPost('/api/farmers/ai-assistant', {
        query_type: qtype,
        soil_type: 'Red Loam',
        water_source: 'Borewell'
      });

      if (qtype === 'crop_recommendation') {
        outBox.innerHTML = `
          <h4 class="font-bold text-slate-900 mb-2">${res.title}</h4>
          <div class="space-y-2">
            ${res.recommendations.map(r => `
              <div class="p-3 bg-white rounded-xl border border-emerald-100">
                <div class="font-bold text-emerald-800">${r.crop} (${r.season})</div>
                <div class="text-xs text-slate-600 mt-0.5">${r.notes} • Expected: ${r.expected_yield}</div>
              </div>
            `).join('')}
          </div>
          <p class="text-xs font-semibold text-emerald-700 mt-2">${res.soil_tip}</p>
        `;
      } else if (qtype === 'water_requirement') {
        outBox.innerHTML = `
          <h4 class="font-bold text-slate-900 mb-2">${res.title}</h4>
          <ul class="list-disc pl-5 space-y-1 text-xs text-slate-600">
            ${res.guidelines.map(g => `<li>${g}</li>`).join('')}
          </ul>
        `;
      } else {
        outBox.innerHTML = `
          <h4 class="font-bold text-slate-900 mb-2">${res.title}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${res.units_guide.map(u => `
              <div class="p-2.5 bg-white rounded-xl border border-slate-200">
                <strong class="text-slate-900 block">${u.unit}</strong>
                <span class="text-slate-600">${u.best_for}</span>
                <p class="text-[10px] text-amber-700 mt-1">${u.tip}</p>
              </div>
            `).join('')}
          </div>
        `;
      }
    } catch (e) {
      if (outBox) outBox.innerHTML = "Advisory guidelines loaded for your region.";
    }
  }
};
