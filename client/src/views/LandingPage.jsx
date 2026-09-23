import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ShieldCheck,
  Truck,
  Users,
  Sprout,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  const { t, setActiveView, switchRole, mandiTicker } = useApp();

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white py-16 sm:py-24 rounded-b-[2.5rem] shadow-2xl">
        {/* Background glow & accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Platform Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/60 shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                  National Agri-Commerce Platform
                </span>
                <span className="text-xs text-slate-300">| Direct Agri Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Empowering <span className="text-emerald-400 underline decoration-amber-400/80 decoration-4 underline-offset-8">Farmers</span>, Direct to <span className="text-amber-300">Consumers</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed">
                VIVAAN dismantles exploitative intermediary cartels by connecting farmers and FPOs directly with households and wholesale buyers—powered by automated escrow payments, live GPS logistics, and AI crop intelligence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => setActiveView('marketplace')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('farmer_reg')}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm backdrop-blur-xs flex items-center gap-2 transition-all"
                >
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span>Register as Farmer</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-amber-300">0%</div>
                  <div className="text-[11px] text-slate-300">Middleman Cut</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">+38%</div>
                  <div className="text-[11px] text-slate-300">Farmer Realization</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-sky-300">100%</div>
                  <div className="text-[11px] text-slate-300">Escrow Protected</div>
                </div>
              </div>

            </div>

            {/* Hero Interactive Branding & Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* VIVAAN Official Logo Card */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src="/vivaan-logo.jpg"
                      alt="VIVAAN"
                      className="h-20 w-20 rounded-2xl object-cover shadow-xl border-2 border-amber-300 ring-4 ring-emerald-500/30"
                    />
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
                        Official Platform
                      </span>
                      <h3 className="text-2xl font-black text-white">VIVAAN</h3>
                      <p className="text-xs text-slate-300">Digital Agricultural Ecosystem</p>
                    </div>
                  </div>

                  {/* Real-time Ticker Box */}
                  <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Today's Mandi vs VIVAAN Ticker
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="font-semibold text-slate-200">Salem Turmeric</span>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">₹160/kg</span>
                          <span className="text-[10px] text-slate-400 block">Mandi: ₹108 | Retail: ₹240</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="font-semibold text-slate-200">Small Onions</span>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">₹45/kg</span>
                          <span className="text-[10px] text-slate-400 block">Mandi: ₹28 | Retail: ₹75</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick role jump */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { switchRole('FARMER'); setActiveView('farmer_dash'); }}
                      className="p-3 bg-emerald-800/80 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sprout className="w-4 h-4 text-emerald-300" />
                      <span>Farmer Portal</span>
                    </button>
                    <button
                      onClick={() => { switchRole('DRIVER'); setActiveView('driver_portal'); }}
                      className="p-3 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-black text-slate-950 text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Driver Portal</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mandi Price Marquee / Highlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
            <Scale className="w-5 h-5 text-emerald-700" />
            <span>Middleman Spread Transparency:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              🌾 Turmeric: Farmer gets <b className="text-emerald-700">₹160</b> (vs ₹108 Mandi)
            </span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              🧅 Shallots: Farmer gets <b className="text-emerald-700">₹45</b> (vs ₹28 Mandi)
            </span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              🌾 Sharbati Wheat: Farmer gets <b className="text-emerald-700">₹2,850/Q</b> (vs ₹2,150 Mandi)
            </span>
          </div>
        </div>
      </div>

      {/* The 5 Core Users - Interactive Portals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            Unified Ecosystem
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            Designed for Every Stakeholder in Agriculture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tailored digital interfaces with vernacular language access and role-specific workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Farmer */}
          <div
            onClick={() => { switchRole('FARMER'); setActiveView('farmer_dash'); }}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold group-hover:scale-110 transition-transform">
                🌾
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800">1. Farmer</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  List harvest batches, verify land Patta, view Escrow settlements, and consult AI Crop Doctor.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-emerald-700 flex items-center justify-between">
              <span>Open Dashboard</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 2. Consumer / Buyer */}
          <div
            onClick={() => { switchRole('BUYER'); setActiveView('marketplace'); }}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold group-hover:scale-110 transition-transform">
                🛒
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800">2. Consumer / Buyer</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Browse fresh produce directly from farmgate, multi-farmer cart, Razorpay payment, and track deliveries.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-amber-700 flex items-center justify-between">
              <span>Shop Produce</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 3. Delivery Agency */}
          <div
            onClick={() => { switchRole('AGENCY'); setActiveView('agency_dash'); }}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-sky-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-800 font-bold group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-800">3. Delivery Agency</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage fleets, assign drivers, optimize multi-stop pickup routes, and monitor fleet earnings.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-sky-700 flex items-center justify-between">
              <span>Agency Fleet</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 4. Driver */}
          <div
            onClick={() => { switchRole('DRIVER'); setActiveView('driver_portal'); }}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold group-hover:scale-110 transition-transform">
                📱
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-800">4. Driver</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mobile PWA interface: accept trips, turn-by-turn farmgate navigation, and 4-digit OTP handover.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-purple-700 flex items-center justify-between">
              <span>Driver PWA</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 5. VIVAAN Admin */}
          <div
            onClick={() => { switchRole('ADMIN'); setActiveView('admin_console'); }}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-slate-800 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-slate-800">5. Admin</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Platform KPI monitoring, land verification audits, escrow payouts audit, and dispute resolution.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-slate-800 flex items-center justify-between">
              <span>Admin Console</span>
              <span>&rarr;</span>
            </div>
          </div>

        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                Core Problem Solved
              </span>
              <h2 className="text-3xl font-black text-slate-950">
                Traditional Agricultural Supply Chain vs VIVAAN
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Broken Middleman Model */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-800">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-rose-950">Multiple Intermediaries (Broken)</h3>
                    <p className="text-xs text-rose-700">Exploitative multi-tier mandi chain</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-rose-900">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-black">✕</span>
                    <span><b>3 to 6 Intermediaries:</b> Village aggregator &rarr; APMC Dalal &rarr; Wholesaler &rarr; Distributor &rarr; Retailer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-black">✕</span>
                    <span><b>Severe Farmer Underpayment:</b> Farmers receive only 20–35% of the final consumer retail price.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-black">✕</span>
                    <span><b>30%+ Post-Harvest Spoilage:</b> Inefficient multi-hop transit without route optimization.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-black">✕</span>
                    <span><b>Uncertain Payouts:</b> Delayed credit payments and arbitrary mandi weighbridge deductions.</span>
                  </li>
                </ul>
              </div>

              {/* VIVAAN Direct Digital Model */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-950">VIVAAN Direct Marketplace (Solved)</h3>
                    <p className="text-xs text-emerald-700">Digital farmgate-to-buyer ecosystem</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-emerald-900">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Zero Middlemen:</b> Direct connection from verified Farmer/FPO to Buyer with certified logistics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>+38% Higher Realization:</b> Transparent farmgate price benchmarked against live APMC mandi data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Intelligent TSP Routing:</b> Reduced rural transit time with multi-order consolidation and live GPS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Guaranteed Escrow Settlement:</b> Automated instant payout via Razorpay upon 4-digit OTP handover.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
