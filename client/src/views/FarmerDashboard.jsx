import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Plus,
  ShieldCheck,
  CreditCard,
  CloudSun,
  Bot,
  FileCheck,
  Award,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user, t, addToast, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState('products');
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Vegetables');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [newPrice, setNewPrice] = useState('');
  const [newHarvestDate, setNewHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newIsOrganic, setNewIsOrganic] = useState(true);

  // AI Query Form
  const [aiSoil, setAiSoil] = useState('Red Loam');
  const [aiSeason, setAiSeason] = useState('Kharif');
  const [aiWater, setAiWater] = useState('Borewell');

  const farmerId = user?.farmer_id || 1;

  const loadData = async () => {
    try {
      const pRes = await fetch(`/api/farmers/${farmerId}/products`);
      const pData = await pRes.json();
      if (pData.success) setFarmerProducts(pData.products || []);

      const oRes = await fetch(`/api/farmers/${farmerId}/orders`);
      const oData = await oRes.json();
      if (oData.success) setFarmerOrders(oData.orders || []);

      const wRes = await fetch(`/api/weather?district=Salem`);
      const wData = await wRes.json();
      if (wData.success) setWeatherData(wData);
    } catch (err) {
      console.warn('Backend load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmerId]);

  const handleAddProduce = async (e) => {
    e.preventDefault();
    if (!newTitle || !newQty || !newPrice) {
      addToast('Missing Info', 'Please fill title, quantity, and price.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId,
          title: newTitle,
          category: newCategory,
          quantity: newQty,
          unit: newUnit,
          price_per_unit: newPrice,
          harvest_date: newHarvestDate,
          photo_url: newPhotoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
          is_organic: newIsOrganic
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Produce Listed', `${newTitle} is now live in the marketplace!`);
        setShowAddModal(false);
        setNewTitle('');
        setNewQty('');
        setNewPrice('');
        loadData();
      }
    } catch (err) {
      addToast('Error', 'Failed to publish produce listing', 'error');
    }
  };

  const handleConsultAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/crop-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_type: aiSoil,
          season: aiSeason,
          water_source: aiWater,
          state: 'Tamil Nadu'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiAdvice(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src="/vivaan-logo.jpg"
            alt="VIVAAN"
            className="h-20 w-20 rounded-2xl object-cover shadow-lg border-2 border-amber-300 ring-4 ring-white/10"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wider">
                🟢 Verified Farmer
              </span>
              <span className="text-amber-300 font-mono font-bold text-sm tracking-wider">
                {user?.vivaan_id || 'VIV-FR-104582'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{user?.name || 'Ramasamy Gounder'}</h1>
            <p className="text-xs text-slate-300">
              Salem District, Tamil Nadu • 5.5 Acres Own Land • Patta Verified
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>List New Produce</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ai_doctor')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>AI Crop Doctor</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{farmerProducts.length}</h3>
          <span className="text-xs text-emerald-600 font-bold">● Live in Marketplace</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Orders</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{farmerOrders.length}</h3>
          <span className="text-xs text-slate-500 font-medium">Consumer Purchases</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrow Wallet</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹1,600</h3>
          <span className="text-xs text-amber-600 font-semibold">🔒 Protected by Escrow</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mandi Spread</span>
          <h3 className="text-2xl font-black text-sky-700 mt-1">+47%</h3>
          <span className="text-xs text-slate-500 font-medium">vs Middleman Rates</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" /> My Produce Listings ({farmerProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('id_card')}
          className={`pb-3 px-4 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'id_card'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Digital Farmer ID Card
        </button>

        <button
          onClick={() => setActiveTab('land_kyc')}
          className={`pb-3 px-4 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'land_kyc'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Land Patta & Records
        </button>

        <button
          onClick={() => setActiveTab('ai_doctor')}
          className={`pb-3 px-4 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'ai_doctor'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Crop Advisory & Weather
        </button>
      </div>

      {/* Tab 1: Produce Listings */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Your Harvest Catalog</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Produce
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img src={p.photo_url} alt={p.title} className="w-full h-full object-cover" />
                  {p.is_organic && (
                    <span className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                      🌱 Organic Certified
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-300 font-black text-sm px-3 py-1 rounded-xl backdrop-blur-xs">
                    ₹{p.price_per_unit} / {p.unit}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {p.category}
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-snug">{p.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Available Stock:</span>
                      <b className="text-slate-900">{p.available_quantity} {p.unit}</b>
                    </div>
                    <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-xl text-emerald-900 font-bold">
                      <span>Mandi Difference:</span>
                      <span className="text-emerald-700">₹{p.price_per_unit - p.mandi_price} higher/unit</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Digital Farmer ID Card */}
      {activeTab === 'id_card' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl border-2 border-amber-300 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <img src="/vivaan-logo.jpg" alt="VIVAAN" className="h-12 w-12 rounded-xl object-cover border border-amber-300 shadow" />
                <div>
                  <h3 className="text-lg font-black tracking-wider">VIVAAN DIGITAL FARMER ID</h3>
                  <p className="text-[10px] text-amber-300 font-mono">GOVERNMENT VERIFIED AGRITECH ID</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Farmer Identity Body */}
            <div className="grid grid-cols-3 gap-6 py-6 items-center">
              <div className="col-span-1 flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
                  alt="Farmer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-white/20"
                />
                <span className="text-[10px] font-mono text-amber-300 mt-2">VIV-FR-104582</span>
              </div>

              <div className="col-span-2 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Farmer Full Name</span>
                  <div className="text-base font-black text-white">{user?.name || 'Ramasamy Gounder'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Primary Phone</span>
                  <div className="font-mono text-slate-200">+91 98421 04582</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Land & Patta Record</span>
                  <div className="font-semibold text-emerald-300">PAT-4821/2021 (5.5 Acres)</div>
                  <div className="text-[11px] text-slate-300">Omalur Taluk, Salem District, TN</div>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <div className="border-t border-white/20 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Aadhaar KYC: XXXX-XXXX-4821</span>
              <span>Issued by: VIVAAN National Network</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md"
            >
              🖨️ Print Digital Farmer ID
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Land Patta & Verification */}
      {activeTab === 'land_kyc' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Land Registry & Ownership Audit</h3>
                <p className="text-xs text-slate-500">Cross-verified against State Revenue Land Records Ledger</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-300">
              ✓ Verified & Audit-Approved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Land Tenure Classification</span>
              <p className="text-base font-black text-slate-900">Own Agricultural Land</p>
              <span className="text-[11px] text-emerald-700 font-semibold">100% Direct Title Holder</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Patta / Chitta Reference</span>
              <p className="text-base font-black text-slate-900 font-mono">PAT-4821/2021</p>
              <span className="text-[11px] text-slate-500">Chitta No: CHT-9912</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Survey & Subdivision</span>
              <p className="text-base font-black text-slate-900 font-mono">Survey 142 / Sub-div 2B</p>
              <span className="text-[11px] text-slate-500">Omalur Taluk, Salem</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Cultivated Extent</span>
              <p className="text-base font-black text-slate-900">5.5 Acres</p>
              <span className="text-[11px] text-slate-500">Nanjai (Wetland / Irrigated)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Soil Classification</span>
              <p className="text-base font-black text-slate-900">Red Loam</p>
              <span className="text-[11px] text-emerald-700">Ideal for Curcumin Turmeric</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase">Irrigation Source</span>
              <p className="text-base font-black text-slate-900">Borewell + Solar Pump</p>
              <span className="text-[11px] text-slate-500">Drip Network Installed</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Crop Advisory & Weather */}
      {activeTab === 'ai_doctor' && (
        <div className="space-y-6">
          {/* Weather Alert Widget */}
          {weatherData && (
            <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CloudSun className="w-8 h-8 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-sky-300 tracking-wider">
                    {weatherData.location} • Realtime Agro-Weather
                  </div>
                  <h3 className="text-2xl font-black mt-0.5">
                    {weatherData.temperature_celsius}°C • {weatherData.condition}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{weatherData.agro_advisory}</p>
                </div>
              </div>
              <div className="text-right text-xs space-y-1 font-mono shrink-0">
                <div>Humidity: <b className="text-sky-300">{weatherData.humidity_percent}%</b></div>
                <div>Rainfall Prob: <b className="text-sky-300">{weatherData.rainfall_probability}%</b></div>
                <div>Wind Speed: <b className="text-sky-300">{weatherData.wind_speed_kmh} km/h</b></div>
              </div>
            </div>
          )}

          {/* AI Crop Doctor Interactive Console */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">AI Agro-Doctor & Crop Recommendation</h3>
                <p className="text-xs text-slate-500">
                  Powered by Gemini AI and National Agricultural Research Datasets
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Soil Type</label>
                <select
                  value={aiSoil}
                  onChange={(e) => setAiSoil(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-emerald-600"
                >
                  <option value="Red Loam">Red Loam Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Laterite Clay">Laterite Clay</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cropping Season</label>
                <select
                  value={aiSeason}
                  onChange={(e) => setAiSeason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-emerald-600"
                >
                  <option value="Kharif">Kharif (Monsoon)</option>
                  <option value="Rabi">Rabi (Winter)</option>
                  <option value="Zaid">Zaid (Summer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Water Source</label>
                <select
                  value={aiWater}
                  onChange={(e) => setAiWater(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-emerald-600"
                >
                  <option value="Borewell">Borewell / Solar</option>
                  <option value="Canal">Canal Irrigation</option>
                  <option value="Rainfed">Rainfed / Dryland</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConsultAi}
              disabled={aiLoading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{aiLoading ? 'Analyzing Soil & Market Demand...' : 'Generate AI Crop & Profit Recommendation'}</span>
            </button>

            {/* AI Advice Output */}
            {aiAdvice && (
              <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                <div className="text-xs text-emerald-950 leading-relaxed font-semibold">
                  {aiAdvice.ai_analysis}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aiAdvice.recommended_crops.map((c, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1 text-xs">
                      <span className="font-bold text-emerald-800 text-sm block">{c.crop}</span>
                      <div className="text-slate-600">Est. Profit: <b className="text-emerald-700">{c.profit_per_acre}</b></div>
                      <div className="text-slate-500">Duration: {c.duration}</div>
                      <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        {c.demand_trend}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-700 space-y-1 border-t border-emerald-200 pt-3">
                  <div><b>💧 Irrigation:</b> {aiAdvice.irrigation_schedule}</div>
                  <div><b>🌱 Nutrition:</b> {aiAdvice.fertilizer_plan}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-lg font-black">List Fresh Harvest Produce</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduce} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Crop Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Salem Organic Pure Turmeric (Haldi)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={newHarvestDate}
                    onChange={(e) => setNewHarvestDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="250"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price / Unit (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="160"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Produce Photo URL</label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="organic"
                  checked={newIsOrganic}
                  onChange={(e) => setNewIsOrganic(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600"
                />
                <label htmlFor="organic" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Certified Organic Produce (Grown without synthetic pesticides)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
