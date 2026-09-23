import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldCheck, Sprout, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function WelcomeScreen() {
  const { setActiveView } = useApp();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 text-center select-none">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* VIVAAN Official Logo */}
        <div className="relative inline-block mx-auto">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-emerald-600 to-amber-300 shadow-2xl ring-8 ring-emerald-900/10">
            <img
              src="/vivaan-logo.jpg"
              alt="VIVAAN – Direct Farmer-to-Buyer"
              className="w-full h-full object-cover rounded-full shadow-inner bg-white"
            />
          </div>
          <span className="absolute -bottom-2 right-4 bg-emerald-800 text-white p-2 rounded-full ring-4 ring-white shadow-lg">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </span>
        </div>

        {/* Brand Titles */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest">
            Digital Agri-Commerce Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-emerald-950 tracking-tight">
            VIVAAN
          </h1>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-800 max-w-xl mx-auto">
            Direct Farmer-to-Buyer Digital Marketplace
          </p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Eliminating intermediaries to ensure fair earnings for agricultural producers and fresher, lower-cost produce for consumers.
          </p>
        </div>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-emerald-700 font-black text-lg block">0%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Middlemen Cut</span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-amber-600 font-black text-lg block">+38%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Farmer Margin</span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-sky-700 font-black text-lg block">100%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Verified</span>
          </div>
        </div>

        {/* Primary CTA - Steps to Language Selection */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setActiveView('lang_select')}
            icon={ArrowRight}
            className="w-full sm:w-auto px-8"
          >
            Get Started & Select Language
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setActiveView('role_select')}
            className="w-full sm:w-auto"
          >
            Skip to Role Selection
          </Button>
        </div>

      </div>
    </div>
  );
}
