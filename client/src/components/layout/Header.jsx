import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, ShieldCheck, ChevronDown, User, ArrowLeft, ShoppingBag } from 'lucide-react';
import Badge from '../ui/Badge';

export default function Header({ onBack = null, showBackButton = false, title = null }) {
  const {
    currentLang,
    LANGUAGES,
    setShowLangModal,
    user,
    activeRole,
    setActiveView,
    activeView,
    cart
  } = useApp();

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: VIVAAN Brand Logo & Name (and optional Back Button) */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {showBackButton && (
              <button
                type="button"
                onClick={onBack || (() => setActiveView('role_select'))}
                className="p-1.5 sm:p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-900" />
              </button>
            )}

            <div
              onClick={() => setActiveView('welcome')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="relative shrink-0">
                <img
                  src="/vivaan-logo.jpg"
                  alt="VIVAAN"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl object-cover shrink-0 shadow-md border-2 border-amber-300 ring-2 ring-emerald-600/20 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-800 text-white p-0.5 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-2.5 h-2.5 text-amber-300" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
                    VIVAAN
                  </span>
                  <span className="hidden md:inline-flex">
                    <Badge variant="district" size="sm">
                      FARMER2BUYER
                    </Badge>
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 hidden lg:block">
                  Direct Farmer-to-Buyer Digital Marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Center (Desktop only): Active Portal Context or Title */}
          {title ? (
            <div className="hidden md:block text-center">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{title}</span>
            </div>
          ) : activeRole ? (
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Role:</span>
              <span className="font-black text-emerald-900">{activeRole.title}</span>
            </div>
          ) : null}

          {/* Upper-Right Area: LANGUAGE SELECTOR (MUST REMAIN VISIBLE AT ALL TIMES) + Role Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Cart Icon if Buyer */}
            {activeRole?.id === 'buyer' && (
              <button
                type="button"
                onClick={() => setActiveView('buyer_cart')}
                className="relative p-2 sm:p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all cursor-pointer shadow-xs shrink-0"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-900" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Selector in the UPPER-RIGHT Area */}
            <button
              id="lang-modal-btn"
              type="button"
              onClick={() => setShowLangModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer group shrink-0"
              title="Select Language (14 Indian Languages)"
            >
              <span className="text-sm sm:text-base">{currentLangObj.flag}</span>
              <span className="font-mono">{currentLangObj.native}</span>
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 group-hover:rotate-45 transition-transform" />
            </button>

            {/* Switch Role Button */}
            {activeRole && (
              <button
                id="switch-role-btn"
                type="button"
                onClick={() => setActiveView('role_select')}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <span className="hidden sm:inline">Switch Role</span>
                <span className="sm:hidden">Role</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
