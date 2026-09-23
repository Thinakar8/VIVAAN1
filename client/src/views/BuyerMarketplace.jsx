import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  MapPin,
  CheckCircle,
  Tag,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function BuyerMarketplace() {
  const { products, addToCart, setActiveView, loadingProducts } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Spices'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (organicOnly && !p.is_organic) {
      return false;
    }
    if (p.price_per_unit > maxPrice) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.farmer_name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Marketplace Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            Zero Middlemen • Farmgate Direct
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">
            Fresh Agricultural Produce Direct from Verified Farmers
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Cut out traders, aggregators, and commission brokers. Better margins for farmers, fresher harvest for you.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-2 shrink-0">
          <div className="text-amber-300 font-bold uppercase tracking-wider">Direct Impact Guarantee</div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>100% Escrow-backed delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Land Patta verified origins</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Intelligent rural logistics tracking</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search produce, farmer, district, or crop..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-emerald-600"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Organic Filter Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded text-emerald-700 h-4 w-4"
              />
              <span>🌱 Organic Certified Only</span>
            </label>
          </div>

        </div>
      </div>

      {/* Product Grid */}
      {loadingProducts ? (
        <div className="text-center py-16 text-slate-500 font-bold text-sm">
          Loading farmgate produce...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="text-4xl">🌾</div>
          <h3 className="text-lg font-black text-slate-900">No produce matching your filters</h3>
          <p className="text-xs text-slate-500">Try clearing your search query or selecting "All" categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const savingsPerUnit = Math.max(0, product.middleman_price - product.price_per_unit);
            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Photo & Badges */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={product.photo_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_organic && (
                    <span className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                      🌱 Organic Certified
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-slate-950/85 text-amber-300 font-black text-base px-3 py-1.5 rounded-xl backdrop-blur-xs">
                      ₹{product.price_per_unit} <span className="text-xs font-normal text-slate-300">/ {product.unit}</span>
                    </span>
                    {savingsPerUnit > 0 && (
                      <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm">
                        Save ₹{savingsPerUnit}/{product.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  </div>

                  {/* Origin & Farmer details */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        {product.village}, {product.district}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Harvest: {product.harvest_date}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Farmer Origin</span>
                        <span className="text-xs font-black text-slate-900">{product.farmer_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                        {product.vivaan_farmer_id}
                      </span>
                    </div>

                    {/* Middleman transparency card */}
                    <div className="text-[11px] p-2 rounded-xl bg-amber-50/80 text-amber-950 font-medium flex items-center justify-between">
                      <span>Retail Price: <s className="text-slate-400 font-normal">₹{product.middleman_price}</s></span>
                      <span className="font-bold text-emerald-700">Direct Farmgate Savings!</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        setActiveView('cart');
                      }}
                      className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-md"
                      title="Buy Now"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
