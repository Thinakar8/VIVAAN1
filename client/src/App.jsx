import React from 'react';
import { useApp } from './context/AppContext';

// Layout Components
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/Footer';
import LanguageModal from './components/LanguageModal';

// Initial Flow Views
import WelcomeScreen from './views/flow/WelcomeScreen';
import LanguageSelectionScreen from './views/flow/LanguageSelectionScreen';
import RoleSelectionScreen from './views/flow/RoleSelectionScreen';

// Farmer Views
import FarmerDashboard from './views/farmer/FarmerDashboard';
import FarmerProduceList from './views/farmer/FarmerProduceList';
import FarmerAddProduce from './views/farmer/FarmerAddProduce';
import FarmerLandKyc from './views/farmer/FarmerLandKyc';
import FarmerOrders from './views/farmer/FarmerOrders';
import FarmerIdCardView from './views/farmer/FarmerIdCardView';

// FPO Views
import FpoDashboard from './views/fpo/FpoDashboard';

// Buyer Views
import BuyerMarketplace from './views/buyer/BuyerMarketplace';
import BuyerCart from './views/buyer/BuyerCart';
import BuyerOrders from './views/buyer/BuyerOrders';
import BuyerProfile from './views/buyer/BuyerProfile';

// Agency Views
import AgencyDashboard from './views/agency/AgencyDashboard';
import AgencyRegister from './views/agency/AgencyRegister';
import AgencyDriversList from './views/agency/AgencyDriversList';
import AgencyOnboardDriver from './views/agency/AgencyOnboardDriver';
import AgencyShipments from './views/agency/AgencyShipments';

// Driver Views
import DriverDashboard from './views/driver/DriverDashboard';
import DriverApplication from './views/driver/DriverApplication';
import DriverActiveTrip from './views/driver/DriverActiveTrip';
import DriverHandover from './views/driver/DriverHandover';
import DriverHistory from './views/driver/DriverHistory';

// Shared Tracking & Admin Views
import OrderTrackingView from './views/OrderTrackingView';
import AdminConsole from './views/AdminConsole';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const { activeView, activeRole, toasts } = useApp();

  const isInitialFlow = ['welcome', 'lang_select', 'role_select'].includes(activeView);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8faf7] text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* Universal Header (VIVAAN Logo + Upper-Right Language Selector) */}
      <Header />

      {/* Role Navigation Bar (Displayed when a role is active) */}
      {!isInitialFlow && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Initial Flow Screens */}
        {activeView === 'welcome' && <WelcomeScreen />}
        {activeView === 'lang_select' && <LanguageSelectionScreen />}
        {activeView === 'role_select' && <RoleSelectionScreen />}

        {/* Farmer Views */}
        {activeView === 'farmer_dashboard' && <FarmerDashboard />}
        {activeView === 'farmer_produce' && <FarmerProduceList />}
        {activeView === 'farmer_add_produce' && <FarmerAddProduce />}
        {activeView === 'farmer_land_kyc' && <FarmerLandKyc />}
        {activeView === 'farmer_orders' && <FarmerOrders />}
        {activeView === 'farmer_id_card' && <FarmerIdCardView />}

        {/* FPO Views */}
        {activeView === 'fpo_dashboard' && <FpoDashboard />}

        {/* Buyer Views */}
        {activeView === 'buyer_marketplace' && <BuyerMarketplace />}
        {activeView === 'buyer_cart' && <BuyerCart />}
        {activeView === 'buyer_orders' && <BuyerOrders />}
        {activeView === 'buyer_profile' && <BuyerProfile />}

        {/* Agency Views */}
        {activeView === 'agency_dashboard' && <AgencyDashboard />}
        {activeView === 'agency_register' && <AgencyRegister />}
        {activeView === 'agency_drivers' && <AgencyDriversList />}
        {activeView === 'agency_onboard_driver' && <AgencyOnboardDriver />}
        {activeView === 'agency_shipments' && <AgencyShipments />}

        {/* Driver Views */}
        {activeView === 'driver_dashboard' && <DriverDashboard />}
        {activeView === 'driver_application' && <DriverApplication />}
        {activeView === 'driver_active_trip' && <DriverActiveTrip />}
        {activeView === 'driver_handover' && <DriverHandover />}
        {activeView === 'driver_history' && <DriverHistory />}

        {/* Real-time Order Telemetry & Admin Views */}
        {activeView === 'order_tracking' && <OrderTrackingView />}
        {activeView === 'admin_console' && <AdminConsole />}

      </main>

      {/* 14 Indian Languages Modal */}
      <LanguageModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transform transition-all animate-in slide-in-from-bottom duration-300 ${
              t.type === 'error'
                ? 'bg-rose-950 text-white border-rose-800'
                : 'bg-slate-950 text-white border-slate-800'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black tracking-wide">{t.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{t.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}
