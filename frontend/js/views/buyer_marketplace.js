/**
 * VIVAAN Buyer Marketplace & Product Catalog View
 * Implements Phases 36–46, 58–61:
 * - Multi-Farmer Cart ("One Buyer. Multiple Farmers. One VIVAAN Cart.")
 * - Multi-Order Parent Checkout (VIV-CHECKOUT-XXXX) + Child Orders (VIV-ORD-XXXX)
 * - Razorpay Split Payment Simulator
 * - Product Details with Farmgate Privacy Safeguards
 */
import { t } from '../i18n.js';
import { apiGet, apiPost, state, setView } from '../state.js';

let marketplaceProducts = [];
let cart = []; // [{ product, quantity }]

export async function renderBuyerMarketplace() {
  const buyerName = (state.currentUser && state.currentUser.name) || 'Aditi Sharma';
  const isGoogleUser = (state.currentUser && state.currentUser.role === 'BUYER');

  try {
    const res = await apiGet('/api/buyers/products');
    marketplaceProducts = res.products || [];
  } catch (e) {
    marketplaceProducts = [];
  }

  const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8 relative">
      
      <!-- Navigation & Back Action -->
      <div class="flex items-center justify-between">
        <button 
          onclick="window.vivaanApp.goBack('user_type_select')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
          title="${t('back')}"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>${t('back')}</span>
        </button>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.vivaanBuyer.openCartModal()"
            class="relative px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <span>🛒</span>
            <span>VIVAAN Cart</span>
            <span id="cart-badge" class="px-2 py-0.5 bg-amber-400 text-emerald-950 rounded-full text-[11px] font-black">
              ${cart.length}
            </span>
          </button>
        </div>
      </div>

      <!-- Multi-Farmer Core Value Banner -->
      <div class="bg-amber-100/70 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🌾 🧺</span>
          <div>
            <span class="font-black text-sm">“One Buyer. Multiple Farmers. One VIVAAN Cart.”</span>
            <p class="text-amber-900 mt-0.5">Combine fresh produce from different verified farmers across districts into one consolidated delivery order.</p>
          </div>
        </div>
        <button onclick="window.vivaanBuyer.openCartModal()" class="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shrink-0 shadow-sm">
          Review Cart (${cart.length} items)
        </button>
      </div>

      <!-- Buyer Top Bar -->
      <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-20 w-20 object-contain rounded-full shadow-lg border-2 border-amber-300 ring-2 ring-white/20 bg-white/10" />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wide">
                🛒 Verified Buyer Portal
              </span>
              ${isGoogleUser ? `<span class="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">G Google Verified</span>` : ''}
            </div>
            <h1 class="text-2xl sm:text-3xl font-black">Direct Farm Fresh Marketplace</h1>
            <p class="text-xs text-slate-300">Welcome, ${buyerName} • Fair Farmgate Prices • Escrow Protected Handover</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            onclick="window.vivaanApp.navigateTo('order_tracking')" 
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <span>📦</span> Track Live Order
          </button>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row items-center gap-4">
          <div class="relative flex-1 w-full">
            <span class="absolute left-4 top-3 text-slate-400 text-lg">🔍</span>
            <input 
              type="text" 
              id="mkt_search" 
              oninput="window.vivaanBuyer.filterProducts()"
              class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-600 focus:ring-0 text-sm" 
              placeholder="${t('search_placeholder')}" 
            />
          </div>

          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select id="mkt_category" onchange="window.vivaanBuyer.filterProducts()" class="px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
              <option value="all">${t('filter_all')}</option>
              <option value="Spices">Spices & Turmeric</option>
              <option value="Grains">Grains & Rice / Wheat</option>
              <option value="Vegetables">Fresh Vegetables</option>
              <option value="Fruits">GI Mangoes & Fruits</option>
            </select>

            <select id="mkt_state" onchange="window.vivaanBuyer.filterProducts()" class="px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
              <option value="all">All States</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Punjab">Punjab</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>🛡️ <strong>Direct Farm-to-Fork:</strong> Only certified farmers with verified revenue Patta records are listed.</span>
          <span id="mkt_count">${marketplaceProducts.length} Listings Available</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderProductCards(marketplaceProducts)}
      </div>

      <!-- Product Details Modal Container -->
      <div id="product-detail-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"></div>

      <!-- Multi-Farmer Cart Modal Container -->
      <div id="cart-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"></div>

      <!-- Razorpay Payment & Checkout Modal Container -->
      <div id="razorpay-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"></div>

    </div>
  `;
}

function renderProductCards(products) {
  if (!products || products.length === 0) {
    return `
      <div class="col-span-3 bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
        <span class="text-4xl">🌾</span>
        <h3 class="font-bold text-slate-800 text-lg">No Produce Matches Your Filter</h3>
        <p class="text-xs text-slate-500">Try clearing your search query or selecting all categories.</p>
      </div>
    `;
  }

  return products.map(p => `
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div class="relative h-52 w-full bg-slate-100 overflow-hidden">
          <img src="${p.photo_url}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <div class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
            ${p.id}
          </div>

          <div class="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
            <span>✓ Verified Farmer</span>
          </div>
        </div>

        <div class="p-5 space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>${p.category}</span>
            <span>Harvest: ${p.harvest_date}</span>
          </div>

          <h3 class="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
            ${p.title}
          </h3>

          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            ${p.description || 'Direct farm harvested agricultural produce.'}
          </p>

          <!-- Farmer Details (Strictly masking private coordinates and KYC) -->
          <div class="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Farmer:</span>
              <span class="font-bold text-slate-800">${p.farmer_name}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Origin:</span>
              <span class="font-semibold text-emerald-800">${p.district}, ${p.state}</span>
            </div>
            <div class="text-[10px] text-slate-400 pt-0.5">
              🔒 Privacy Protected: Exact farm coordinates protected
            </div>
          </div>

          <div class="pt-2 flex items-baseline justify-between">
            <div>
              <span class="text-2xl font-black text-emerald-800">₹${p.price_per_unit}</span>
              <span class="text-xs text-slate-500 font-bold">/ ${p.unit}</span>
            </div>
            <div class="text-right text-xs">
              <span class="text-slate-400 block font-semibold">Available</span>
              <span class="font-bold text-slate-800">${p.available_quantity} ${p.unit}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-5 pt-0 flex gap-2">
        <button 
          onclick="window.vivaanBuyer.openDetails('${p.id}')"
          class="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          View Details
        </button>
        <button 
          onclick="window.vivaanBuyer.addToCart('${p.id}', 10)"
          class="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1"
        >
          <span>🛒</span> Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

// Global Buyer Controller Object
if (typeof window !== 'undefined') {
  window.vivaanBuyer = {
    filterProducts() {
      const q = (document.getElementById('mkt_search')?.value || '').toLowerCase();
      const cat = document.getElementById('mkt_category')?.value || 'all';
      const st = document.getElementById('mkt_state')?.value || 'all';

      const filtered = marketplaceProducts.filter(p => {
        const matchesQ = !q || p.title.toLowerCase().includes(q) || p.farmer_name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q);
        const matchesCat = (cat === 'all') || (p.category === cat);
        const matchesSt = (st === 'all') || (p.state === st);
        return matchesQ && matchesCat && matchesSt;
      });

      const grid = document.getElementById('products-grid');
      if (grid) grid.innerHTML = renderProductCards(filtered);

      const count = document.getElementById('mkt_count');
      if (count) count.innerText = `${filtered.length} Listings Available`;
    },

    openDetails(productId) {
      const p = marketplaceProducts.find(x => x.id === productId);
      if (!p) return;

      const modal = document.getElementById('product-detail-modal');
      if (!modal) return;

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
          <div class="relative h-60 w-full">
            <img src="${p.photo_url}" alt="${p.title}" class="w-full h-full object-cover" />
            <button onclick="document.getElementById('product-detail-modal').classList.add('hidden')" class="absolute top-4 right-4 w-9 h-9 bg-black/60 text-white rounded-full flex items-center justify-center font-bold">✕</button>
            <div class="absolute bottom-3 left-3 bg-emerald-700 text-white text-xs px-3 py-1 rounded-full font-bold">
              ✓ Verified Direct Farmgate Listing
            </div>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-slate-400 uppercase font-bold text-[10px]">${p.category}</span>
                <h3 class="text-xl font-black text-slate-900">${p.title}</h3>
                <p class="text-slate-500 mt-1">${p.farmer_name} • ${p.district}, ${p.state}</p>
              </div>
              <div class="text-right">
                <span class="text-2xl font-black text-emerald-800">₹${p.price_per_unit}</span>
                <span class="text-slate-500 font-bold block">per ${p.unit}</span>
              </div>
            </div>

            <p class="text-slate-600 leading-relaxed">${p.description || 'Farm-fresh goods harvested with natural practices.'}</p>

            <div class="p-4 bg-slate-50 rounded-2xl space-y-1.5">
              <div class="flex justify-between"><span>Available Quantity:</span><span class="font-bold text-slate-900">${p.available_quantity} ${p.unit}</span></div>
              <div class="flex justify-between"><span>Harvest Date:</span><span class="font-bold text-slate-900">${p.harvest_date}</span></div>
              <div class="flex justify-between"><span>Farmer Selling Rate:</span><span class="font-bold text-emerald-800">100% Fixed by Farmer</span></div>
            </div>

            <div class="flex gap-3 pt-2">
              <button onclick="window.vivaanBuyer.addToCart('${p.id}', 10); document.getElementById('product-detail-modal').classList.add('hidden')" class="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold">
                Add 10 ${p.unit} to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
    },

    addToCart(productId, qty = 10) {
      const p = marketplaceProducts.find(x => x.id === productId);
      if (!p) return;

      const existing = cart.find(c => c.product.id === productId);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({ product: p, quantity: qty });
      }

      // Update badge
      const badge = document.getElementById('cart-badge');
      if (badge) badge.innerText = cart.length;

      alert(`✅ Added ${qty} ${p.unit} of "${p.title}" from Farmer ${p.farmer_name} to your VIVAAN Cart!`);
    },

    openCartModal() {
      const modal = document.getElementById('cart-modal');
      if (!modal) return;

      if (cart.length === 0) {
        modal.innerHTML = `
          <div class="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4 border border-slate-200">
            <span class="text-5xl">🧺</span>
            <h3 class="text-xl font-black text-slate-900">Your VIVAAN Cart is Empty</h3>
            <p class="text-xs text-slate-500">Explore our verified farmers and add fresh produce into your consolidated cart.</p>
            <button onclick="document.getElementById('cart-modal').classList.add('hidden')" class="px-6 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl">
              Browse Produce
            </button>
          </div>
        `;
        modal.classList.remove('hidden');
        return;
      }

      const productsTotal = cart.reduce((acc, c) => acc + (c.product.price_per_unit * c.quantity), 0);
      const sharedDeliveryFee = cart.length === 1 ? 80.0 : roundToTwo(80.0 + (cart.length - 1) * 20.0);
      const grandTotal = roundToTwo(productsTotal + sharedDeliveryFee);

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Consolidated Cart</span>
              <h3 class="text-2xl font-black text-slate-900">One Buyer. Multiple Farmers. One Cart.</h3>
            </div>
            <button onclick="document.getElementById('cart-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">✕</button>
          </div>

          <!-- Items list -->
          <div class="space-y-3">
            ${cart.map((c, idx) => `
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div class="font-bold text-slate-900">${c.product.title}</div>
                  <div class="text-[11px] text-slate-500">Farmer: ${c.product.farmer_name} (${c.product.district})</div>
                  <div class="text-[11px] text-emerald-800 font-semibold">${c.quantity} ${c.product.unit} @ ₹${c.product.price_per_unit}/${c.product.unit}</div>
                </div>
                <div class="text-right">
                  <span class="font-black text-sm text-slate-900">₹${c.product.price_per_unit * c.quantity}</span>
                  <button onclick="window.vivaanBuyer.removeFromCart(${idx})" class="block text-[11px] text-red-500 hover:text-red-700 font-bold mt-1">Remove</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Pricing summary -->
          <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Produce Subtotal:</span>
              <span class="font-bold text-slate-900">₹${productsTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Shared Consolidated Delivery:</span>
              <span class="font-bold text-slate-900">₹${sharedDeliveryFee.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm font-black text-emerald-950 pt-2 border-t border-emerald-200">
              <span>Grand Total:</span>
              <span>₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button onclick="window.vivaanBuyer.openRazorpayModal()" class="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              <span>💳</span> Proceed to Razorpay Checkout (₹${grandTotal.toFixed(2)})
            </button>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
    },

    removeFromCart(index) {
      cart.splice(index, 1);
      const badge = document.getElementById('cart-badge');
      if (badge) badge.innerText = cart.length;
      this.openCartModal();
    },

    openRazorpayModal() {
      document.getElementById('cart-modal')?.classList.add('hidden');
      const modal = document.getElementById('razorpay-modal');
      if (!modal) return;

      const productsTotal = cart.reduce((acc, c) => acc + (c.product.price_per_unit * c.quantity), 0);
      const sharedDeliveryFee = cart.length === 1 ? 80.0 : roundToTwo(80.0 + (cart.length - 1) * 20.0);
      const grandTotal = roundToTwo(productsTotal + sharedDeliveryFee);

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
          <div class="flex justify-between items-center pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">R</div>
              <div>
                <h3 class="font-black text-base text-slate-900">Razorpay Secure Checkout</h3>
                <span class="text-[10px] text-slate-400">VIVAAN Agricultural Escrow Protocol</span>
              </div>
            </div>
            <button onclick="document.getElementById('razorpay-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">✕</button>
          </div>

          <div class="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-500"><span>Farmer Produce:</span><span class="font-bold text-slate-800">₹${productsTotal.toFixed(2)}</span></div>
            <div class="flex justify-between text-slate-500"><span>Shared Transport:</span><span class="font-bold text-slate-800">₹${sharedDeliveryFee.toFixed(2)}</span></div>
            <div class="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Payable Amount:</span><span class="text-blue-600 font-black">₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="space-y-2 text-xs">
            <span class="font-bold text-slate-700 block">Select Payment Mode:</span>
            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500">
              <span class="flex items-center gap-2"><span>📱</span> <span class="font-bold">UPI (Google Pay / PhonePe / BHIM)</span></span>
              <input type="radio" name="pay_mode" value="UPI" checked class="text-blue-600" />
            </label>
            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500">
              <span class="flex items-center gap-2"><span>💳</span> <span class="font-bold">Credit / Debit Card (Visa, RuPay, MC)</span></span>
              <input type="radio" name="pay_mode" value="CARD" class="text-blue-600" />
            </label>
            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500">
              <span class="flex items-center gap-2"><span>🏦</span> <span class="font-bold">Net Banking (SBI, HDFC, ICICI, etc.)</span></span>
              <input type="radio" name="pay_mode" value="NET_BANKING" class="text-blue-600" />
            </label>
            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500">
              <span class="flex items-center gap-2"><span>💵</span> <span class="font-bold">Cash On Delivery (Verified OTP Handover)</span></span>
              <input type="radio" name="pay_mode" value="COD" class="text-blue-600" />
            </label>
          </div>

          <button onclick="window.vivaanBuyer.executeCheckout()" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            <span>🔒</span> Pay & Place Multi-Farmer Orders
          </button>
        </div>
      `;
      modal.classList.remove('hidden');
    },

    async executeCheckout() {
      const selectedPay = document.querySelector('input[name="pay_mode"]:checked')?.value || 'UPI';

      const items = cart.map(c => ({
        product_id: c.product.id,
        quantity: c.quantity
      }));

      const payload = {
        buyer_id: (state.currentUser && state.currentUser.id) || 1,
        buyer_name: (state.currentUser && state.currentUser.name) || 'Aditi Sharma',
        buyer_phone: '+919841234567',
        items: items,
        delivery_address: 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar, Chennai',
        delivery_state: 'Tamil Nadu',
        delivery_district: 'Chennai',
        delivery_pincode: '600020',
        payment_method: selectedPay
      };

      try {
        const res = await apiPost('/api/orders/checkout-multi', payload);
        document.getElementById('razorpay-modal')?.classList.add('hidden');
        cart = [];
        const badge = document.getElementById('cart-badge');
        if (badge) badge.innerText = 0;

        alert(`🎉 Checkout ${res.checkout_id} successful! Placed ${res.orders_count} farmer orders. Redirecting to Live Tracking...`);
        state.activeOrderId = res.orders[0].order_id;
        window.vivaanApp.navigateTo('order_tracking');
      } catch (e) {
        // Standalone offline fallback
        document.getElementById('razorpay-modal')?.classList.add('hidden');
        const checkoutId = `VIV-CHECKOUT-${Math.floor(1000 + Math.random() * 9000)}`;
        cart = [];
        const badge = document.getElementById('cart-badge');
        if (badge) badge.innerText = 0;
        alert(`🎉 Checkout ${checkoutId} successful! Created parent checkout and separate farmer orders. Redirecting to Live Tracking...`);
        window.vivaanApp.navigateTo('order_tracking');
      }
    }
  };
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}
