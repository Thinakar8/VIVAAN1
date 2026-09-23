import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/vivaan-logo.jpg"
                alt="VIVAAN"
                className="h-10 w-10 rounded-xl object-cover border border-amber-400 shadow"
              />
              <span className="text-xl font-black text-white tracking-wider">VIVAAN</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Enterprise National Edition
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Empowering Indian farmers by directly connecting them with consumers, bulk institutional buyers, and certified logistics carriers. Eliminating unfair middlemen margins and preserving produce freshness.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Escrow Protected
              </span>
              <span className="flex items-center gap-1">
                <Leaf className="w-4 h-4" /> Farmgate Direct Freshness
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-3">
              Marketplace Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Farmer KYC & Land Patta</span></li>
              <li><span className="hover:text-white cursor-pointer">Buyer Catalog & Orders</span></li>
              <li><span className="hover:text-white cursor-pointer">Logistics Agency Dispatch</span></li>
              <li><span className="hover:text-white cursor-pointer">Driver OTP Delivery</span></li>
              <li><span className="hover:text-white cursor-pointer">AI Agro-Doctor</span></li>
            </ul>
          </div>

          {/* National Initiatives & Standards */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-3">
              Initiatives & Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white flex items-center gap-1">VIVAAN Agrotech Initiative</span></li>
              <li><span className="hover:text-white flex items-center gap-1">e-NAM Interoperability</span></li>
              <li><span className="hover:text-white flex items-center gap-1">Digital Agriculture Mission</span></li>
              <li><span className="hover:text-white flex items-center gap-1">Agricultural Credit Card (ACC) Ready</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <div>
            © 2026 VIVAAN Agricultural Technologies. Official Direct Agricultural Marketplace.
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            Dedicated to the prosperity of our Producers & Farmers 🌾
          </div>
        </div>
      </div>
    </footer>
  );
}
