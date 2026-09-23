import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  PlusCircle,
  Package,
  FileCheck,
  Award,
  TrendingUp,
  MapPin,
  ArrowRight,
  DollarSign,
  Clock,
  Bot,
  CloudSun,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Sparkles,
  Layers,
  BarChart3,
  Calendar
} from 'lucide-react';
import StatWidget from '../../components/ui/StatWidget';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import aiService from '../../services/aiService';

export default function FarmerDashboard() {
  const { setActiveView, firestoreService } = useApp();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [farmer, setFarmer] = useState({
    name: 'Ramasamy Gounder',
    farmerId: 'VIV-FR-104582',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    pattaNumber: 'PAT-4821/2021',
    extentAcres: '5.5 Acres',
    ownershipType: 'Own Land',
    village: 'Muthampatty',
    district: 'Salem',
    state: 'Tamil Nadu',
    verified: true
  });

  // AI Active Module State
  const [aiActiveTab, setAiActiveTab] = useState('agronomy'); // 'agronomy' | 'financial' | 'demand'
  const [selectedSoil, setSelectedSoil] = useState('Red Loam');
  const [selectedWater, setSelectedWater] = useState('Borewell');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');

  // AI Data States
  const [cropRecs, setCropRecs] = useState(null);
  const [soilAdvisory, setSoilAdvisory] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [salesTrends, setSalesTrends] = useState(null);
  const [earningsAnalysis, setEarningsAnalysis] = useState(null);
  const [pendingAnalysis, setPendingAnalysis] = useState(null);
  const [lossAnalysis, setLossAnalysis] = useState(null);
  const [availabilityForecast, setAvailabilityForecast] = useState(null);

  useEffect(() => {
    // 1. Real-time Firestore subscriptions
    const unsubProducts = firestoreService.subscribeCollection('farmerProducts', (prods) => {
      setProducts(prods || []);
    });

    const unsubOrders = firestoreService.subscribeCollection('orders', (ords) => {
      setOrders(ords || []);
    });

    const unsubFarmer = firestoreService.subscribeCollection('farmers', (farmersList) => {
      if (farmersList && farmersList.length > 0) {
        const active = farmersList.find(f => f.id === 'farmer_1') || farmersList[0];
        setFarmer(prev => ({
          ...prev,
          name: active.name || prev.name,
          farmerId: active.uniqueFarmerId || (active.farmerId?.startsWith('VIV-FR-') ? active.farmerId : 'VIV-FR-104582'),
          photoUrl: active.photoUrl || prev.photoUrl,
          district: active.district || prev.district,
          village: active.village || prev.village,
          extentAcres: active.totalAcres ? `${active.totalAcres} Acres` : prev.extentAcres,
          ownershipType: active.ownershipType || prev.ownershipType,
          pattaNumber: active.pattaNumber || prev.pattaNumber
        }));
      }
    });

    // 2. Fetch AI Services Data
    async function loadAiData() {
      try {
        const [cRecs, sAdv, wAdv, dFore, sTrends, eAnal, pAnal, lAnal, aFore] = await Promise.all([
          aiService.recommendCrops({ soil_type: selectedSoil, water_source: selectedWater, season: selectedSeason, district: 'Salem', land_extent: 5.5 }),
          aiService.getSoilAdvisory({ soil_type: selectedSoil, ph_level: 6.8 }),
          aiService.getAgroWeatherAdvisory({ district: 'Salem', lat: 11.6643, lng: 78.1460 }),
          aiService.getDemandForecast({ commodity: 'Salem Turmeric', target_district: 'Salem' }),
          aiService.getSalesTrends('farmer_1'),
          aiService.getEarningsAnalysis('farmer_1'),
          aiService.getPendingAnalysis('farmer_1'),
          aiService.getLossAnalysis({ crop_category: 'Spices', quantity_kg: 100, transit_distance_km: 320 }),
          aiService.forecastProduceAvailability('farmer_1')
        ]);

        setCropRecs(cRecs);
        setSoilAdvisory(sAdv);
        setWeatherData(wAdv);
        setDemandForecast(dFore);
        setSalesTrends(sTrends);
        setEarningsAnalysis(eAnal);
        setPendingAnalysis(pAnal);
        setLossAnalysis(lAnal);
        setAvailabilityForecast(aFore);
      } catch (err) {
        console.warn('AI initial load notice:', err);
      }
    }

    loadAiData();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubFarmer) unsubFarmer();
    };
  }, [firestoreService, selectedSoil, selectedWater, selectedSeason]);

  // Derived financial & operational metrics
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED');

  const realizedEarnings = deliveredOrders.reduce((sum, o) => sum + (Number(o.produceSubtotal || o.totalAmount) || 0), 48650);
  const pendingEscrow = pendingOrders.reduce((sum, o) => sum + (Number(o.produceSubtotal || o.totalAmount) || 0), 1720);
  const totalUnitsSold = deliveredOrders.reduce((sum, o) => {
    const qty = o.items?.reduce((itemSum, i) => itemSum + (Number(i.quantity) || 0), 0) || 0;
    return sum + qty;
  }, 420);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP WELCOME & PROFILE HEADER */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={farmer.photoUrl}
              alt={farmer.name}
              className="h-20 w-20 rounded-2xl object-cover shadow-lg border-2 border-amber-300 ring-4 ring-white/10"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full ring-2 ring-emerald-950">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm">
                ✓ Verified Farmer
              </Badge>
              <span id="farmer-profile-id" className="text-amber-300 font-mono font-bold text-sm">
                {farmer.farmerId || 'VIV-FR-104582'}
              </span>
            </div>
            <h1 id="farmer-profile-name" className="text-2xl sm:text-3xl font-black">
              {farmer.name}
            </h1>
            <p className="text-xs text-slate-300">
              {farmer.district} District, {farmer.state} • {farmer.extentAcres} ({farmer.ownershipType}) • Patta #{farmer.pattaNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            id="btn-farmer-add-produce"
            variant="accent"
            size="md"
            icon={PlusCircle}
            onClick={() => setActiveView('farmer_add_produce')}
          >
            Add New Produce
          </Button>

          <Button
            id="btn-farmer-view-farmer-card"
            variant="secondary"
            size="md"
            icon={Award}
            onClick={() => setActiveView('farmer_id_card')}
          >
            View Farmer ID Card
          </Button>

          <Button
            id="btn-farmer-manage-kyc"
            variant="outline"
            size="md"
            className="text-white border-white/40 hover:bg-white/10"
            icon={FileCheck}
            onClick={() => setActiveView('farmer_land_kyc')}
          >
            Land Patta KYC
          </Button>
        </div>
      </div>

      {/* 2. CORE FINANCIAL & OPERATIONAL STAT WIDGETS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatWidget
          title="Active Listings"
          value={products.length || 3}
          subtitle="Live on Marketplace"
          icon={Sprout}
          color="emerald"
        />

        <StatWidget
          title="Orders Received"
          value={orders.length || 1}
          subtitle="Buyer Consignments"
          icon={Package}
          color="amber"
        />

        <StatWidget
          title="Total Sales"
          value={`${totalUnitsSold} kg`}
          subtitle="Harvest Dispatched"
          icon={TrendingUp}
          color="sky"
        />

        <StatWidget
          title="Total Earnings"
          value={`₹${realizedEarnings.toLocaleString('en-IN')}`}
          subtitle="Realized in Bank"
          icon={DollarSign}
          color="emerald"
        />

        <StatWidget
          title="Pending Payments"
          value={`₹${pendingEscrow.toLocaleString('en-IN')}`}
          subtitle="Held in Escrow"
          icon={Clock}
          color="amber"
        />

        <StatWidget
          title="Mandi Spread"
          value="+47%"
          subtitle="Above APMC Rates"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* 3. AI ASSISTANT & LOCALIZED WEATHER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI ASSISTANT: Vivaan Farm Advisory AI Copilot with 3 Functional Tabs */}
        <Card className="lg:col-span-2 border-emerald-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    VIVAAN Farm Advisory AI Assistant
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                      ACTIVE ADVISOR
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">ICAR-TNAU calibrated agronomic intelligence & predictive market analytics</p>
                </div>
              </div>

              {/* AI Category Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  id="tab-ai-agronomy"
                  onClick={() => setAiActiveTab('agronomy')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    aiActiveTab === 'agronomy'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌾 Crop & Soil
                </button>
                <button
                  id="tab-ai-financial"
                  onClick={() => setAiActiveTab('financial')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    aiActiveTab === 'financial'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💰 Financial & Loss
                </button>
                <button
                  id="tab-ai-demand"
                  onClick={() => setAiActiveTab('demand')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    aiActiveTab === 'demand'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📈 Demand Forecast
                </button>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-4">
            
            {/* SUB-PANEL 1: CROP & SOIL-BASED SUGGESTIONS */}
            {aiActiveTab === 'agronomy' && (
              <div id="panel-ai-agronomy" className="space-y-4 animate-in fade-in duration-200">
                
                {/* Soil & Season Selectors */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Soil Type</label>
                    <select
                      id="ai-soil-select"
                      value={selectedSoil}
                      onChange={(e) => setSelectedSoil(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="Red Loam">Red Loam (Salem/Erode)</option>
                      <option value="Black Cotton">Black Cotton (Coimbatore)</option>
                      <option value="Alluvial Soil">Alluvial Soil (Thanjavur)</option>
                      <option value="Laterite Clay">Laterite Clay (Western Ghats)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Water Source</label>
                    <select
                      value={selectedWater}
                      onChange={(e) => setSelectedWater(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="Borewell">Borewell (Drip)</option>
                      <option value="Canal">Canal Irrigation</option>
                      <option value="Rainfed">Rainfed Monsoon</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Cropping Season</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                      <option value="Zaid">Zaid (Summer)</option>
                    </select>
                  </div>
                </div>

                {/* Recommended Crops Cards */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Top AI Recommended Crops ({selectedSoil} • {selectedSeason})
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cropRecs?.recommended_crops?.map((c, i) => (
                      <div key={i} className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {c.suitability_score}% Match
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.duration_days} Days</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-1">{c.crop}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{c.reason}</p>
                        </div>
                        <div className="pt-2 mt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Est. Net Profit:</span>
                          <span className="font-black text-emerald-900">{c.projected_net_profit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soil Chemistry & Fertilizer Regimen */}
                {soilAdvisory && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        Soil Chemistry Advisory (pH {soilAdvisory.soil_profile?.ph_level} • {soilAdvisory.soil_profile?.soil_type})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ICAR Extension Guidelines</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <b className="text-emerald-950 block">Bio-Inoculants:</b>
                        <span className="text-slate-600">{soilAdvisory.fertilizer_protocol?.nitrogen_fixation}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <b className="text-emerald-950 block">Potash & Organic Regimen:</b>
                        <span className="text-slate-600">{soilAdvisory.fertilizer_protocol?.potash_recommendation}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SUB-PANEL 2: FINANCIAL & LOSS ANALYSIS */}
            {aiActiveTab === 'financial' && (
              <div id="panel-ai-financial" className="space-y-4 animate-in fade-in duration-200">
                
                {/* Financial Insights Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Middleman Loss Eliminated</span>
                    <span className="text-xl font-black text-emerald-950 block mt-0.5">
                      +₹{earningsAnalysis?.middleman_brokerage_eliminated?.toLocaleString('en-IN') || '11,004'}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">Saved vs APMC Mandi Deductions</span>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">Farmer Price Premium</span>
                    <span className="text-xl font-black text-purple-950 block mt-0.5">
                      {earningsAnalysis?.farmer_premium_percentage || '+26.5% above Mandi'}
                    </span>
                    <span className="text-[11px] text-purple-800 font-medium">Direct farmgate price realization</span>
                  </div>

                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                    <span className="text-[10px] font-bold text-sky-700 uppercase block">Sales Velocity</span>
                    <span className="text-xl font-black text-sky-950 block mt-0.5">+21.4% MoM</span>
                    <span className="text-[11px] text-sky-800 font-medium">Monthly volume growth rate</span>
                  </div>
                </div>

                {/* Pending Amount & Escrow Aging Analysis */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      Pending Amount & Escrow Aging Analysis
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold">
                      Risk Rating: ZERO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {pendingAnalysis?.escrow_release_guarantee}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-white rounded-xl border border-amber-200">
                      <span className="text-slate-400 block font-bold">0 - 24 Hours (In Transit)</span>
                      <span className="font-black text-slate-800 text-sm">₹2,415</span>
                      <span className="text-[10px] text-emerald-600 block">On Schedule</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-amber-200">
                      <span className="text-slate-400 block font-bold">24 - 48 Hours (Out for Delivery)</span>
                      <span className="font-black text-slate-800 text-sm">₹1,035</span>
                      <span className="text-[10px] text-amber-700 block">Awaiting Buyer 4-Digit OTP</span>
                    </div>
                  </div>
                </div>

                {/* Post-Harvest Spoilage & Transit Loss Analysis */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Post-Harvest Spoilage & Cold-Chain Loss Prevention
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">CIPHET Standards</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-bold">Estimated Spoilage Rate</span>
                      <span className="font-black text-rose-700 text-sm">{lossAnalysis?.estimated_loss_percentage || '2.5%'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-bold">Preventive Packaging</span>
                      <span className="font-black text-slate-800 text-xs">{lossAnalysis?.preventive_packaging_protocol || 'Hermetic Bags'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block font-bold">Logistics Recommendation</span>
                      <span className="text-emerald-800 font-semibold text-[10px] block">Crated Transit with Pre-cooling</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-PANEL 3: DEMAND FORECASTING & PREDICTIONS */}
            {aiActiveTab === 'demand' && (
              <div id="panel-ai-demand" className="space-y-4 animate-in fade-in duration-200">
                
                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sky-950 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-700" />
                      60-Day Commodity Demand Forecast (Salem Turmeric)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                      {demandForecast?.forecast_summary?.demand_rating || 'VERY HIGH'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-white rounded-xl border border-sky-200">
                      <span className="text-slate-400 block font-bold">Projected Price Delta</span>
                      <span className="font-black text-emerald-700 text-sm">{demandForecast?.forecast_summary?.projected_price_movement || '+14.2%'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-sky-200">
                      <span className="text-slate-400 block font-bold">Expected Farmgate Range</span>
                      <span className="font-black text-slate-900 text-sm">{demandForecast?.forecast_summary?.projected_farmgate_price_range || '₹165 - ₹182/kg'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-sky-200">
                      <span className="text-slate-400 block font-bold">Active Buyer Intents</span>
                      <span className="font-black text-purple-900 text-sm">{demandForecast?.forecast_summary?.active_buyer_intents || 54} Buyers</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-sky-900 pt-1 font-medium">
                    💡 <b>AI Strategic Advice:</b> {demandForecast?.ai_recommendation || 'Retain 45% of harvest in dry storage for the November wedding surge.'}
                  </p>
                </div>

                {/* Procurement Segment Demand Distribution */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-black text-slate-800 block text-[11px] uppercase tracking-wider">
                    Buyer Segment Interest Breakdown
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Wholesale & Spice Exporters</span>
                      <span className="font-black text-slate-900">55% (Avg 500 kg)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full w-[55%]"></div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span>Supermarkets & Retailers</span>
                      <span className="font-black text-slate-900">30% (Avg 80 kg)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full w-[30%]"></div>
                    </div>
                  </div>
                </div>

                {/* AI Produce Availability & Harvest Maturation Forecasting */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      Produce Availability & Harvest Maturation Pipeline
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-black text-[10px]">
                      {availabilityForecast?.total_projected_volume_kg || 2850} kg Pipeline
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(availabilityForecast?.forecast_horizons || [
                      {
                        window: 'Next 15 Days (Immediate Batch)',
                        crop: 'Salem Pure Turmeric (Grade-A Finger)',
                        status: 'Curing & Sun Drying',
                        estimated_ready_kg: 850,
                        committed_kg: 350,
                        open_marketable_kg: 500,
                        projected_farmgate_value: '₹85,000'
                      },
                      {
                        window: 'Next 30 Days (Mid-Horizon)',
                        crop: 'Country Small Shallots (Co-5)',
                        status: 'Field Maturation & Bulb Hardening',
                        estimated_ready_kg: 1400,
                        committed_kg: 600,
                        open_marketable_kg: 800,
                        projected_farmgate_value: '₹56,000'
                      },
                      {
                        window: 'Next 60 Days (Seasonal Peak)',
                        crop: 'Salem White Garlic & Moringa Pods',
                        status: 'Vegetative Bulking Phase',
                        estimated_ready_kg: 600,
                        committed_kg: 150,
                        open_marketable_kg: 450,
                        projected_farmgate_value: '₹54,000'
                      }
                    ]).map((h, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-[11px]">{h.window}</span>
                          <span className="font-black text-emerald-800 text-[11px]">{h.projected_farmgate_value}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>{h.crop} &bull; <span className="text-slate-500">{h.status}</span></span>
                          <span className="font-bold text-slate-800">Ready: {h.estimated_ready_kg} kg</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Pre-committed: {h.committed_kg} kg</span>
                          <span className="text-emerald-700 font-bold">Open for Pre-Order: {h.open_marketable_kg} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-emerald-900 pt-1 font-medium">
                    🌱 <b>Harvest Timing Advisory:</b> {availabilityForecast?.pre_order_advisory || 'Enable VIVAAN Advance Harvest Pre-Orders for 30-day shallots to lock in peak prices before market arrival surge.'}
                  </p>
                </div>

              </div>
            )}

            {/* AI Model Attribution & Disclaimer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
              <span>Model: AgriBERT v2.4 (ICAR-TNAU Heuristic Fallback)</span>
              <span>Deterministic Simulation Mode</span>
            </div>

          </CardBody>
        </Card>

        {/* WEATHER: Localized Agri-Weather Widget */}
        <Card className="border-sky-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-2xl shadow-sm">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Localized Agro-Weather</h3>
                <p className="text-[11px] text-slate-500">{weatherData?.location || 'Omalur, Salem District'}</p>
              </div>
            </div>
            <Badge variant="verified" size="sm">
              Live Feed
            </Badge>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-slate-900">
                  {Math.round(weatherData?.current_conditions?.temperature_celsius || 29)}°C
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {weatherData?.current_conditions?.condition || 'Partly Sunny • Low Rain Risk'}
                </div>
              </div>
              <div className="text-4xl">⛅</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Humidity</span>
                  <span className="font-black text-slate-800">{weatherData?.current_conditions?.humidity_percent || 62}%</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Wind Speed</span>
                  <span className="font-black text-slate-800">{weatherData?.current_conditions?.wind_speed_kmh || 11.4} km/h</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-[11px] text-sky-950 font-semibold flex items-center gap-2">
              <span className="text-base">🌱</span>
              <span>Spraying window: <b>{weatherData?.spray_window_advisory?.status || 'Favorable'}</b> ({weatherData?.spray_window_advisory?.recommended_window || '06:30 AM - 10:30 AM'}).</span>
            </div>

            {/* 5-Day Outlook */}
            <div className="space-y-1 text-[10px] border-t border-slate-100 pt-2">
              <span className="font-black uppercase text-slate-400 block">5-Day Outlook</span>
              <div className="grid grid-cols-5 gap-1 text-center">
                {weatherData?.five_day_forecast?.map((f, i) => (
                  <div key={i} className="p-1 bg-slate-50 rounded-lg">
                    <span className="block font-bold text-slate-600">{f.day}</span>
                    <span className="block font-black text-slate-900">{f.max_temp}°</span>
                    <span className="text-[9px] text-sky-600">{f.rain_prob}%</span>
                  </div>
                ))}
              </div>
            </div>

          </CardBody>
        </Card>

      </div>

      {/* 4. QUICK ACTION SHORTCUTS (Products, KYC Audit, Orders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover onClick={() => setActiveView('farmer_produce')} className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Manage Produce</h3>
              <p className="text-xs text-slate-500">Edit stock, units & farmgate pricing</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-800" />
        </Card>

        <Card hover onClick={() => setActiveView('farmer_land_kyc')} className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-sky-100 text-sky-900 rounded-2xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Land Patta Audit</h3>
              <p className="text-xs text-slate-500">Verify survey, patta & leased records</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-800" />
        </Card>

        <Card hover onClick={() => setActiveView('farmer_orders')} className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Buyer Orders ({orders.length})</h3>
              <p className="text-xs text-slate-500">Incoming farmgate consignments</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-800" />
        </Card>
      </div>

      {/* 5. ACTIVE HARVEST LISTINGS TABLE WITH AI DEMAND PREDICTIONS */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-base font-black text-slate-900">My Active Harvest Listings</h3>
            <p className="text-xs text-slate-500">Direct farmgate prices visible to all verified buyers with real-time AI demand forecasts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('farmer_produce')}
            >
              View All ({products.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setActiveView('farmer_add_produce')}
            >
              Add Produce
            </Button>
          </div>
        </CardHeader>

        <Table headers={['Produce', 'Category', 'Available Stock', 'Farmgate Price', 'Mandi Spread', 'AI Demand Forecast', 'Status']}>
          {products.map((p, idx) => {
            const stock = p.availableStock !== undefined ? p.availableStock : (p.available_stock !== undefined ? p.available_stock : (p.available_quantity || 100));
            const price = p.pricePerUnit || p.price_per_unit || 100;
            const mandi = p.mandiPrice || p.mandi_price || Math.round(price * 0.7);
            const spread = p.mandiSpread || p.mandi_spread || (price - mandi);
            const isOrganic = p.organic !== undefined ? p.organic : p.is_organic;

            // Granular AI Demand Prediction for each listing
            const isTurmeric = (p.title || '').toLowerCase().includes('turmeric');
            const isOnion = (p.title || '').toLowerCase().includes('onion') || (p.title || '').toLowerCase().includes('shallot');
            const aiBadgeText = isTurmeric ? 'BULLISH (+14%)' : isOnion ? 'EXTREME SURGE (+22%)' : 'STABLE (+8%)';
            const aiBadgeColor = isTurmeric ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : isOnion ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-sky-100 text-sky-900 border-sky-300';

            return (
              <TableRow key={p.id || idx}>
                <TableCell className="font-black text-slate-900">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.photoUrl || p.photo_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                      alt={p.title}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <span className="block font-black text-slate-900">{p.title}</span>
                      {isOrganic && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                          100% Organic
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">{p.category || 'Produce'}</TableCell>
                <TableCell className="font-bold text-slate-800">{stock} {p.unit || 'kg'}</TableCell>
                <TableCell className="font-black text-emerald-900 text-sm">₹{price} / {p.unit || 'kg'}</TableCell>
                <TableCell className="text-xs font-bold text-emerald-700">
                  +₹{spread} vs Mandi
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${aiBadgeColor}`}>
                    {aiBadgeText}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="verified" size="sm">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Card>

    </div>
  );
}
