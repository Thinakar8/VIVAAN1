import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { activeRole, activeView, setActiveView } = useApp();

  if (!activeRole) return null;

  // Define tabs for each role
  const roleNavItems = {
    farmer: [
      { id: 'farmer_dashboard', label: '📊 Dashboard', icon: '📊' },
      { id: 'farmer_produce', label: '🌾 My Produce', icon: '🌾' },
      { id: 'farmer_add_produce', label: '➕ Add Produce', icon: '➕' },
      { id: 'farmer_land_kyc', label: '📜 Land Patta KYC', icon: '📜' },
      { id: 'farmer_orders', label: '📦 Orders Received', icon: '📦' },
      { id: 'farmer_id_card', label: '🪪 Digital Farmer ID', icon: '🪪' }
    ],
    buyer: [
      { id: 'buyer_marketplace', label: '🛒 Marketplace', icon: '🛒' },
      { id: 'buyer_cart', label: '🛍️ My Cart & Checkout', icon: '🛍️' },
      { id: 'buyer_orders', label: '📦 Order History', icon: '📦' },
      { id: 'buyer_profile', label: '👤 Buyer Profile', icon: '👤' }
    ],
    agency: [
      { id: 'agency_dashboard', label: '📊 Logistics Overview', icon: '📊' },
      { id: 'agency_register', label: '🏢 Agency KYC & Registration', icon: '🏢' },
      { id: 'agency_drivers', label: '🚚 Fleet Drivers', icon: '🚚' },
      { id: 'agency_onboard_driver', label: '➕ Onboard Driver', icon: '➕' },
      { id: 'agency_shipments', label: '📦 Rural Shipments', icon: '📦' }
    ],
    driver: [
      { id: 'driver_dashboard', label: '📱 Driver Portal', icon: '📱' },
      { id: 'driver_application', label: '📝 Driver Application', icon: '📝' },
      { id: 'driver_active_trip', label: '🚚 Active Trip Details', icon: '🚚' },
      { id: 'driver_handover', label: '🔑 OTP Handover', icon: '🔑' },
      { id: 'driver_history', label: '📜 Trip History', icon: '📜' }
    ]
  };

  const navItems = roleNavItems[activeRole.id] || [];

  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto select-none shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
