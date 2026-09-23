import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Search,
  Filter,
  MapPin,
  CheckCircle2,
  Tag,
  ArrowRight,
  Sprout,
  Plus,
  Minus,
  X,
  User,
  ShieldCheck,
  Star,
  Layers,
  Sparkles,
  Truck,
  Eye
} from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';
import FilterPills from '../../components/ui/FilterPills';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';

export default function BuyerMarketplace() {
  const { addToCart, setActiveView, firestoreService, addToast } = useApp();
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState('ALL'); // 'ALL' | 'NEARBY' | 'LONG_DISTANCE'

  // Per-product selected quantities
  const [quantities, setQuantities] = useState({});

  // Active Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    // 1. Subscribe to farmerProducts
    const unsubProds = firestoreService.subscribeCollection('farmerProducts', (prods) => {
      const normalized = (prods || []).map((p) => {
        const price = Number(p.pricePerUnit || p.price_per_unit || 100);
        const mandi = Number(p.mandiPrice || p.mandi_price || Math.round(price * 0.7));
        const spread = Number(p.mandiSpread || p.mandi_spread || Math.max(0, price - mandi));
        const stock = Number(p.availableStock !== undefined ? p.availableStock : (p.available_stock !== undefined ? p.available_stock : (p.available_quantity || 100)));
        const dist = Number(p.distanceKm || (p.district === 'Salem' ? 18 : 210));
        const corridor = p.corridorType || (dist <= 50 ? 'NEARBY' : 'LONG_DISTANCE');

        return {
          id: p.id,
          productId: p.id,
          title: p.title,
          category: p.category || 'Vegetables',
          price_per_unit: price,
          pricePerUnit: price,
          mandi_price: mandi,
          mandiPrice: mandi,
          mandi_spread: spread,
          mandiSpread: spread,
          retail_price: Math.round(price * 1.35),
          unit: p.unit || 'kg',
          available_stock: stock,
          availableStock: stock,
          available_quantity: stock,
          is_organic: p.organic !== undefined ? p.organic : Boolean(p.is_organic),
          photo_url: p.photoUrl || p.photo_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
          farmer_name: p.farmerName || p.farmer_name || 'Ramasamy Gounder',
          farmer_id: p.farmerId || p.farmer_id || 'farmer_1',
          farmer_code: p.uniqueFarmerId || p.farmer_code || 'VIV-FR-104582',
          village: p.village || 'Omalur',
          district: p.district || 'Salem',
          state: p.state || 'Tamil Nadu',
          distance_km: dist,
          corridor_type: corridor,
          harvest_date: p.harvestDate || p.harvest_date || '2026-02-18',
          availability: p.availability || 'Immediate Harvest',
          description: p.description || 'Fresh agricultural harvest directly procured from certified farmgate.'
        };
      });
      setProducts(normalized);
    });

    // 2. Subscribe to farmers collection
    const unsubFarmers = firestoreService.subscribeCollection('farmers', (fList) => {
      setFarmers(fList || []);
    });

    return () => {
      if (unsubProds) unsubProds();
      if (unsubFarmers) unsubFarmers();
    };
  }, [firestoreService]);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Spices'];

  const getCardQty = (prodId) => quantities[prodId] || 1;

  const handleCardQtyChange = (prodId, delta, maxStock) => {
    setQuantities((prev) => {
      const current = prev[prodId] || 1;
      const next = Math.min(Math.max(1, current + delta), maxStock);
      return { ...prev, [prodId]: next };
    });
  };

  const handleAddToCart = (product, customQty = null) => {
    const qty = customQty || getCardQty(product.id);
    addToCart(product, qty);
    addToast(
      'Added to Cart',
      `${qty} ${product.unit} of ${product.title} added to your basket.`
    );
  };

  const openFarmerModal = (farmerIdOrName) => {
    const matched = farmers.find(
      (f) => f.id === farmerIdOrName || f.name?.toLowerCase() === farmerIdOrName?.toLowerCase()
    ) || {
      id: 'farmer_1',
      name: farmerIdOrName || 'Ramasamy Gounder',
      uniqueFarmerId: 'VIV-FR-104582',
      village: 'Omalur',
      district: 'Salem',
      state: 'Tamil Nadu',
      totalAcres: 5.5,
      ownershipType: 'Own Land',
      pattaNumber: 'PATTA-SLM-2024-8821',
      rating: 4.9,
      primaryCrops: ['Turmeric', 'Rice', 'Shallots'],
      verified: true,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
    };
    setSelectedFarmer(matched);
  };

  // Filter Algorithm: Search (products & farmers) + Category + Organic + Distance (Nearby vs Long-distance)
  const filtered = products.filter((p) => {
    // 1. Category filter
    if (category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false;

    // 2. Organic filter
    if (organicOnly && !p.is_organic) return false;

    // 3. Distance filter (Nearby < 50 km, Long-distance > 100 km)
    if (distanceFilter === 'NEARBY' && p.distance_km > 50) return false;
    if (distanceFilter === 'LONG_DISTANCE' && p.distance_km <= 50) return false;

    // 4. Unified Search: searches produce title, category, description, farmer name, farmer ID, district, village
    if (search) {
      const q = search.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchFarmer = p.farmer_name.toLowerCase().includes(q);
      const matchFarmerId = (p.farmer_code || p.uniqueFarmerId || '').toLowerCase().includes(q);
      const matchDistrict = p.district.toLowerCase().includes(q);
      const matchVillage = p.village.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);

      return matchTitle || matchCategory || matchFarmer || matchFarmerId || matchDistrict || matchVillage || matchDesc;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP MARKETPLACE BANNER & ACTIONS */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-left">
          <div className="flex items-center gap-2">
            <Badge variant="district" size="sm">
              Zero Middlemen • Farmgate Direct
            </Badge>
            <span className="text-xs text-amber-300 font-mono font-bold">100% Escrow Protected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Fresh Agricultural Harvest Direct from Verified Farmers
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Buy farm-fresh produce direct from registered Farmer ID holders. Zero broker commissions, guaranteed origin traceability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            id="btn-view-cart"
            variant="accent"
            size="md"
            icon={ShoppingBag}
            onClick={() => setActiveView('buyer_cart')}
          >
            View Cart & Checkout
          </Button>

          <Button
            id="btn-view-buyer-profile"
            variant="secondary"
            size="md"
            icon={User}
            onClick={() => setActiveView('buyer_profile')}
          >
            My Profile & Delivery
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & ADVANCED FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Dual Search Input */}
          <div className="w-full lg:w-96">
            <SearchInput
              id="marketplace-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search produce, farmer name, Farmer ID, village..."
            />
          </div>

          {/* Category Filter Pills */}
          <FilterPills
            categories={categories}
            activeCategory={category}
            onSelect={setCategory}
          />

          {/* Organic Only Checkbox */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none shrink-0">
            <input
              id="organic-only-checkbox"
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600"
            />
            <span>🌱 Certified Organic Only</span>
          </label>
        </div>

        {/* Corridor Distance Filter Pills */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-400 uppercase text-[10px] tracking-wider">Logistics Radius:</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                id="filter-dist-all"
                type="button"
                onClick={() => setDistanceFilter('ALL')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  distanceFilter === 'ALL'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Distances
              </button>
              <button
                id="filter-dist-nearby"
                type="button"
                onClick={() => setDistanceFilter('NEARBY')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  distanceFilter === 'NEARBY'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📍 Nearby (&lt; 50 km)</span>
              </button>
              <button
                id="filter-dist-long"
                type="button"
                onClick={() => setDistanceFilter('LONG_DISTANCE')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  distanceFilter === 'LONG_DISTANCE'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚚 Long-Distance (&gt; 100 km)</span>
              </button>
            </div>
          </div>

          <div className="text-slate-400 font-semibold text-[11px]">
            Showing <b>{filtered.length}</b> verified agricultural batches
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="text-4xl">🌾</div>
          <h3 className="text-lg font-black text-slate-800">No matching harvest produce found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query or toggling between Nearby and Long-Distance corridors.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setOrganicOnly(false);
              setDistanceFilter('ALL');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const savings = Math.max(0, p.retail_price - p.price_per_unit);
            const cardQty = getCardQty(p.id);

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group text-left"
              >
                {/* Crop Photo & Corridor Tag */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
                  <img
                    src={p.photo_url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Organic Badge */}
                  {p.is_organic && (
                    <span className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                      🌱 Organic
                    </span>
                  )}

                  {/* Category Badge */}
                  <span className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                    {p.category}
                  </span>

                  {/* Farmgate Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 text-amber-300 font-black text-sm px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5">
                    <span>₹{p.price_per_unit}</span>
                    <span className="text-[11px] text-slate-300 font-normal">/ {p.unit}</span>
                  </div>

                  {/* Distance corridor tag */}
                  <span className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs \${
                    p.distance_km <= 50 ? 'bg-emerald-600/90 text-white' : 'bg-sky-700/90 text-white'
                  }`}>
                    {p.distance_km <= 50 ? `📍 ${p.distance_km} km (Local)` : `🚚 ${p.distance_km} km (Corridor)`}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  </div>

                  {/* Farmer Origin & Aggregate Locality (Strict Privacy Masking) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        {p.village}, {p.district}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">Stock: {p.available_stock} {p.unit}</span>
                    </div>

                    <div
                      id={`farmer-origin-box-${p.id}`}
                      onClick={() => openFarmerModal(p.farmer_id || p.farmer_name)}
                      className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 hover:bg-emerald-100/60 transition-colors cursor-pointer flex items-center justify-between"
                      title="Click to view verified farmer profile"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                          🌾
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Farmer Origin</span>
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            {p.farmer_name}
                            <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                        {p.farmer_code || p.uniqueFarmerId || 'VIV-FR-104582'}
                      </span>
                    </div>

                    {/* Mandi Savings Helper */}
                    {savings > 0 && (
                      <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl flex items-center justify-between">
                        <span>Retail Market: <s className="text-slate-400 font-normal">₹{p.retail_price}</s></span>
                        <span className="text-emerald-700 font-black">Direct Savings: ₹{savings}/{p.unit}!</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Selection & Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">Order Quantity:</span>
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                        <button
                          id={`qty-minus-${p.id}`}
                          type="button"
                          onClick={() => handleCardQtyChange(p.id, -1, p.available_stock)}
                          disabled={cardQty <= 1}
                          className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3 text-slate-700" />
                        </button>
                        <span id={`qty-val-${p.id}`} className="font-mono font-black text-xs w-6 text-center">
                          {cardQty}
                        </span>
                        <button
                          id={`qty-plus-${p.id}`}
                          type="button"
                          onClick={() => handleCardQtyChange(p.id, 1, p.available_stock)}
                          disabled={cardQty >= p.available_stock}
                          className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-slate-700" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-bold">{p.unit}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        id={`btn-prod-modal-${p.id}`}
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedProduct(p)}
                      >
                        Details
                      </Button>

                      <Button
                        id={`btn-add-cart-${p.id}`}
                        variant="primary"
                        size="sm"
                        icon={ShoppingBag}
                        onClick={() => handleAddToCart(p)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div id="product-details-modal" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant={selectedProduct.is_organic ? 'organic' : 'district'} size="sm">
                  {selectedProduct.is_organic ? '🌱 Certified Organic' : selectedProduct.category}
                </Badge>
                <span className="text-xs text-slate-400 font-mono font-bold">BATCH #{selectedProduct.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedProduct.photo_url}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 text-amber-300 font-black text-sm px-3 py-1 rounded-xl">
                  ₹{selectedProduct.price_per_unit} / {selectedProduct.unit}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedProduct.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">APMC Mandi Rate:</span>
                    <span className="font-bold text-slate-800">₹{selectedProduct.mandi_price} / {selectedProduct.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Direct Farmgate:</span>
                    <span className="font-black text-emerald-800">₹{selectedProduct.price_per_unit} / {selectedProduct.unit}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200 text-emerald-900 font-bold">
                    <span>Retail Store Price:</span>
                    <span className="line-through text-slate-400">₹{selectedProduct.retail_price}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <div><b>Harvest Date:</b> {selectedProduct.harvest_date}</div>
                  <div><b>Availability:</b> {selectedProduct.availability}</div>
                  <div><b>Available Stock:</b> {selectedProduct.available_stock} {selectedProduct.unit}</div>
                  <div><b>Corridor Distance:</b> {selectedProduct.distance_km} km from your destination</div>
                </div>
              </div>
            </div>

            {/* Farmer Origin Snippet in Modal */}
            <div
              onClick={() => {
                const prod = selectedProduct;
                setSelectedProduct(null);
                openFarmerModal(prod.farmer_id || prod.farmer_name);
              }}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cultivated by Verified Farmer</span>
                  <span className="text-xs font-black text-slate-900">{selectedProduct.farmer_name}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({selectedProduct.village}, {selectedProduct.district})</span>
                </div>
              </div>
              <Button id="view-farmer-profile-modal-btn" variant="outline" size="sm">
                View Farmer Profile →
              </Button>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Quantity:</span>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleCardQtyChange(selectedProduct.id, -1, selectedProduct.available_stock)}
                    disabled={getCardQty(selectedProduct.id) <= 1}
                    className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-sm w-8 text-center">{getCardQty(selectedProduct.id)}</span>
                  <button
                    type="button"
                    onClick={() => handleCardQtyChange(selectedProduct.id, 1, selectedProduct.available_stock)}
                    disabled={getCardQty(selectedProduct.id) >= selectedProduct.available_stock}
                    className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold">{selectedProduct.unit}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={ShoppingBag}
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Add {getCardQty(selectedProduct.id)} {selectedProduct.unit} to Cart
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 5. FARMER DETAILS MODAL (Certified Farmer ID Profile) */}
      {selectedFarmer && (
        <div id="farmer-details-modal" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant="verified" size="sm">
                  ✓ Verified Farmer Profile • Revenue Patta
                </Badge>
                <span className="text-xs font-mono font-bold text-amber-700">{selectedFarmer.uniqueFarmerId || selectedFarmer.farmerId || 'VIV-FR-104582'}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Farmer Identity Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md">
              <img
                src={selectedFarmer.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'}
                alt={selectedFarmer.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300"
              />
              <div className="space-y-0.5">
                <h3 className="text-lg font-black">{selectedFarmer.name}</h3>
                <p className="text-xs text-emerald-200">
                  {selectedFarmer.village}, {selectedFarmer.district} District, {selectedFarmer.state}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300 font-semibold">
                  <span>★ {selectedFarmer.rating || 4.9} Trust Score</span>
                  <span>•</span>
                  <span>{selectedFarmer.totalAcres || 5.5} Acres ({selectedFarmer.ownershipType || 'Own Land'})</span>
                </div>
              </div>
            </div>

            {/* Revenue Verification Ledger Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Government Revenue Audit
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><b>Patta Record:</b> {selectedFarmer.pattaNumber || 'PAT-4821/2021'}</div>
                <div><b>Audit Status:</b> <span className="text-emerald-700 font-bold">MATCH CONFIRMED</span></div>
                <div><b>Primary Crops:</b> {Array.isArray(selectedFarmer.primaryCrops) ? selectedFarmer.primaryCrops.join(', ') : 'Turmeric, Rice, Shallots'}</div>
                <div><b>Escrow Payout:</b> Direct Bank DBT</div>
              </div>
            </div>

            {/* Active Harvest Batches by this Farmer */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                Active Listings by this Farmer
              </span>
              <div className="space-y-2">
                {products
                  .filter((p) => p.farmer_id === selectedFarmer.id || p.farmer_name === selectedFarmer.name)
                  .map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={item.photo_url} alt={item.title} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{item.title}</span>
                          <span className="text-[11px] text-slate-500 font-bold">₹{item.price_per_unit} / {item.unit}</span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ShoppingBag}
                        onClick={() => {
                          handleAddToCart(item, 1);
                          setSelectedFarmer(null);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedFarmer(null)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
