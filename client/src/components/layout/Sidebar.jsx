import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  FileCheck,
  Package,
  Award,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  UserPlus,
  KeyRound,
  History,
  ArrowLeft
} from 'lucide-react';

export default function Sidebar({ className = '' }) {
  const { activeRole, activeView, setActiveView } = useApp();

  if (!activeRole) return null;

  const roleMenus = {
    farmer: [
      { id: 'farmer_dashboard', label: 'Farmer Dashboard', icon: LayoutDashboard },
      { id: 'farmer_produce', label: 'My Produce Listings', icon: Sprout },
      { id: 'farmer_add_produce', label: 'Add New Produce', icon: PlusCircle },
      { id: 'farmer_land_kyc', label: 'Land Patta & KYC', icon: FileCheck },
      { id: 'farmer_orders', label: 'Incoming Orders', icon: Package },
      { id: 'farmer_id_card', label: 'Digital Farmer ID', icon: Award }
    ],
    buyer: [
      { id: 'buyer_marketplace', label: 'Agri Marketplace', icon: ShoppingBag },
      { id: 'buyer_cart', label: 'Cart & Checkout', icon: ShoppingCart },
      { id: 'buyer_orders', label: 'My Orders History', icon: Package }
    ],
    agency: [
      { id: 'agency_dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
      { id: 'agency_drivers', label: 'Fleet Drivers Roster', icon: Users },
      { id: 'agency_onboard_driver', label: 'Onboard New Driver', icon: UserPlus },
      { id: 'agency_shipments', label: 'Rural Dispatches', icon: Truck }
    ],
    driver: [
      { id: 'driver_dashboard', label: 'Driver Portal', icon: LayoutDashboard },
      { id: 'driver_active_trip', label: 'Active Trip Route', icon: Truck },
      { id: 'driver_handover', label: 'Doorstep OTP Handover', icon: KeyRound },
      { id: 'driver_history', label: 'Completed Trips', icon: History }
    ]
  };

  const menu = roleMenus[activeRole.id] || [];

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 select-none ${className}`}>
      <div className="space-y-6">
        
        {/* Role Identity Chip */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
            Current Portal
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-0.5">{activeRole.title}</h4>
          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">VIVAAN Verified</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Switch Role / Exit to Role Select */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setActiveView('role_select')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Role / Home</span>
        </button>
      </div>
    </aside>
  );
}
