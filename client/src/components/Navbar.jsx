import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Globe, User, ShieldCheck, MapPin, Truck, Award, LogOut } from 'lucide-react';

export default function Navbar() {
  const {
    user,
    setUser,
    t,
    currentLang,
    LANGUAGES,
    setShowLangModal,
    activeView,
    setActiveView,
    cart,
    switchRole
  } = useApp();

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* VIVAAN Official Logo & Branding */}
          <div
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src="/vivaan-logo.jpg"
                alt="VIVAAN"
                className="h-13 w-13 rounded-2xl object-cover shadow-md border-2 border-amber-300 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-0.5 rounded-full ring-2 ring-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  VIVAAN
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Direct
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Direct Farmer-to-Buyer Digital Marketplace
              </p>
            </div>
          </div>

          {/* Quick Role Portal Jumpers */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveView('marketplace')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeView === 'marketplace' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🛒 Marketplace
            </button>
            <button
              onClick={() => { switchRole('FARMER'); setActiveView('farmer_dash'); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${user?.role === 'FARMER' && activeView === 'farmer_dash' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🌾 Farmer Portal
            </button>
            <button
              onClick={() => { switchRole('AGENCY'); setActiveView('agency_dash'); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${user?.role === 'AGENCY' && activeView === 'agency_dash' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🚚 Logistics Agency
            </button>
            <button
              onClick={() => { switchRole('DRIVER'); setActiveView('driver_portal'); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${user?.role === 'DRIVER' && activeView === 'driver_portal' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              📱 Driver View
            </button>
            <button
              onClick={() => setActiveView('tracking')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeView === 'tracking' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              📍 Live GPS
            </button>
            <button
              onClick={() => { switchRole('ADMIN'); setActiveView('admin_console'); }}
              className={`px-3 py-1.5 rounded-xl transition-all ${user?.role === 'ADMIN' && activeView === 'admin_console' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ⚙️ Admin
            </button>
          </nav>

          {/* Action buttons: Language, Cart, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* 14 Indian Languages Selector Button */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
              title="Select Language"
            >
              <span className="text-base">{currentLangObj.flag}</span>
              <span className="hidden sm:inline font-mono">{currentLangObj.native}</span>
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveView('cart')}
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all shadow-xs"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-900" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-soft-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Current User Pill / Role Indicator */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-amber-300 ring-2 ring-emerald-500/20"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-black text-slate-900 truncate max-w-[120px]">{user.name}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-xs ${
                      user.role === 'FARMER' ? 'bg-emerald-100 text-emerald-900' :
                      user.role === 'AGENCY' ? 'bg-sky-100 text-sky-900' :
                      user.role === 'DRIVER' ? 'bg-amber-100 text-amber-900' :
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{user.vivaan_id}</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('login')}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
