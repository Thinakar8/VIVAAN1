import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  MapPin,
  KeyRound,
  Award,
  ArrowRight,
  Phone,
  CheckCircle2,
  History,
  ShieldCheck,
  Navigation,
  XCircle,
  TrendingUp,
  Package,
  Layers,
  AlertTriangle,
  Clock,
  Car,
  Bot,
  Sparkles,
  Share2,
  DollarSign
} from 'lucide-react';
import StatWidget from '../../components/ui/StatWidget';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import aiService from '../../services/aiService';

export default function DriverDashboard() {
  const { setActiveView, setActiveOrderId, firestoreService, realtimeDbService, addToast } = useApp();

  const [driver, setDriver] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'accepted' | 'current' | 'completed' | 'ai_copilot'
  const [capableData, setCapableData] = useState({
    driver: null,
    availableOrders: [],
    acceptedOrders: [],
    currentDelivery: null,
    completedOrders: [],
    cancelledOrders: []
  });

  // Driver AI States
  const [routeSuggestions, setRouteSuggestions] = useState(null);
  const [orderSuggestions, setOrderSuggestions] = useState(null);
  const [driverAnalytics, setDriverAnalytics] = useState(null);

  const loadDriverData = async () => {
    try {
      const dr = await firestoreService.getDriver('driver_1');
      setDriver(dr);

      const res = await firestoreService.getCapableOrdersForDriver('driver_1');
      setCapableData(res);

      // Load Driver AI Copilot Data
      const [rSug, oSug, dAnal] = await Promise.all([
        aiService.getDriverRouteSuggestions('VIV-DR-104582'),
        aiService.getDriverOrderSuggestions('VIV-DR-104582'),
        aiService.getDriverAnalytics('VIV-DR-104582')
      ]);
      setRouteSuggestions(rSug);
      setOrderSuggestions(oSug);
      setDriverAnalytics(dAnal);
    } catch (err) {
      console.error('Failed to load driver dashboard data', err);
    }
  };

  useEffect(() => {
    loadDriverData();

    const unsub = firestoreService.subscribeCollection('orders', () => {
      loadDriverData();
    });

    return () => {
      if (unsub) unsub();
    };
  }, [firestoreService]);

  // Actions
  const handleAcceptOrder = async (orderId) => {
    try {
      const orderNumber = orderId.includes('VIV-ORD-') ? orderId : `VIV-ORD-${orderId.replace('order_', '')}`;
      setActiveOrderId(orderNumber);
      try {
        await fetch(`http://localhost:5000/api/orders/${orderNumber}/accept-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driver_id: driver?.vivaanId || 'VIV-DR-104582',
            driver_name: driver?.fullName || driver?.name || 'Murugan Karuppasamy'
          })
        });
      } catch (apiErr) {}

      await realtimeDbService.acceptOrderTracking(orderId, {
        id: driver?.vivaanId || 'VIV-DR-104582',
        name: driver?.fullName || driver?.name || 'Murugan Karuppasamy',
        vehicleNo: driver?.vehicleNo || 'TN-30-AZ-8120'
      });
      await firestoreService.acceptOrderDriver(orderId, driver?.id || 'driver_1');
      addToast('Order Accepted!', 'Consignment assigned to your vehicle. Route to farmgate pickup loaded.');
      await loadDriverData();
      setActiveTab('accepted');
    } catch (err) {
      addToast('Error', err.message || 'Failed to accept order', 'error');
    }
  };

  const handleStartPickup = async (orderId) => {
    try {
      const orderNumber = orderId.includes('VIV-ORD-') ? orderId : `VIV-ORD-${orderId.replace('order_', '')}`;
      try {
        await fetch(`http://localhost:5000/api/orders/${orderNumber}/confirm-pickup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (apiErr) {}

      await realtimeDbService.confirmPickupTracking(orderId);
      await firestoreService.pickupOrderDriver(orderId);
      addToast('Farmgate Pickup Confirmed', 'Cargo loaded. Route to buyer active; buyer live tracking unlocked!');
      await loadDriverData();
      setActiveTab('current');
    } catch (err) {
      addToast('Error', err.message || 'Failed to update pickup', 'error');
    }
  };

  const handleStartTransit = async (orderId) => {
    try {
      await firestoreService.startTransitOrderDriver(orderId);
      addToast('In Transit to Buyer', 'Real-time GPS telemetry streaming to buyer and dispatcher.');
      await loadDriverData();
    } catch (err) {
      addToast('Error', err.message || 'Failed to update transit', 'error');
    }
  };

  const currentOrder = capableData.currentDelivery || capableData.acceptedOrders[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Driver Identity Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
            alt="Driver"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 text-xs font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                {driver?.vivaanId || 'VIV-DR-104582'}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                ★ {driver?.rating || 4.9} Verified Carrier
              </span>
            </div>
            <h1 className="text-xl font-black mt-0.5">{driver?.fullName || driver?.name || 'Murugan Karuppasamy'}</h1>
            <p className="text-xs text-slate-300">
              {driver?.vehicleType || 'Tata Ace Pickup'} • {driver?.vehicleNo || 'TN-30-AZ-8120'} • Salem Corridor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="driver-copilot-quick-btn"
            variant="accent"
            size="sm"
            icon={Bot}
            onClick={() => setActiveTab('ai_copilot')}
          >
            AI Copilot
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Award}
            onClick={() => setActiveView('driver_history')}
            className="text-white border-white/30 hover:bg-white/10"
          >
            History
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatWidget
          title="Available Orders"
          value={capableData.availableOrders.length}
          subtitle="Ready for Pickup"
          icon={Package}
          color="sky"
        />
        <StatWidget
          title="Accepted Trips"
          value={capableData.acceptedOrders.length}
          subtitle="Assigned to Vehicle"
          icon={Truck}
          color="amber"
        />
        <StatWidget
          title="Completed Deliveries"
          value={driverAnalytics?.performance_metrics?.total_deliveries_completed || 48}
          subtitle="All-time Successful"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatWidget
          title="Total Earnings"
          value={`₹${driverAnalytics?.earnings_summary?.total_freight_earned_rs?.toLocaleString('en-IN') || '64,200'}`}
          subtitle="Direct Carrier Payout"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold">
        <button
          id="tab-available-orders"
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'available'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Available Orders ({capableData.availableOrders.length})
        </button>

        <button
          id="tab-accepted-orders"
          onClick={() => setActiveTab('accepted')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accepted'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Accepted Orders ({capableData.acceptedOrders.length})
        </button>

        <button
          id="tab-current-delivery"
          onClick={() => setActiveTab('current')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'current'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Consignment
        </button>

        <button
          id="tab-driver-ai-copilot"
          onClick={() => setActiveTab('ai_copilot')}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ai_copilot'
              ? 'border-purple-800 text-purple-950 font-black'
              : 'border-transparent text-purple-700 hover:text-purple-950'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-700" />
          AI Copilot & Analytics
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="space-y-4">
        
        {/* TAB A: AVAILABLE ORDERS */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            {capableData.availableOrders.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">No unassigned orders in your primary zone</p>
                <p className="text-xs mt-1">Check back soon or explore AI Backhaul suggestions below.</p>
              </Card>
            ) : (
              capableData.availableOrders.map((ord) => (
                <Card key={ord.id} className="p-5 border-slate-200 hover:border-emerald-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-800 text-xs">{ord.orderNumber || ord.id}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded uppercase">
                          {ord.cargoWeightKg || 10} kg • Farmgate Ready
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-base">{ord.items?.[0]?.title || 'Salem Pure Turmeric'}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {ord.farmerVillage || 'Muthampatty'}, Salem ➔ {typeof ord.deliveryAddress === 'string' ? ord.deliveryAddress : ord.deliveryAddress?.district || 'Chennai'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        id={`accept-order-btn-${ord.id}`}
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptOrder(ord.id)}
                      >
                        Accept Delivery
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB B: ACCEPTED ORDERS */}
        {activeTab === 'accepted' && (
          <div className="space-y-3">
            {capableData.acceptedOrders.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">No accepted orders pending pickup</p>
              </Card>
            ) : (
              capableData.acceptedOrders.map((ord) => (
                <Card key={ord.id} className="p-5 border-amber-200 bg-amber-50/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-900 text-xs">{ord.orderNumber || ord.id}</span>
                        <Badge variant="confirmed" size="sm">Awaiting Farmgate Pickup</Badge>
                      </div>
                      <h3 className="font-black text-slate-900 text-base">{ord.items?.[0]?.title}</h3>
                      <p className="text-xs text-slate-600">
                        Farmgate Pickup: <b>{ord.farmerVillage}, Salem</b>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        id="view-route-to-farmer-btn"
                        variant="outline"
                        size="sm"
                        icon={Navigation}
                        onClick={() => {
                          const num = ord.orderNumber || ord.id;
                          setActiveOrderId(num);
                          setActiveView('order_tracking');
                        }}
                      >
                        Route to Farmgate
                      </Button>

                      <Button
                        id="confirm-pickup-btn"
                        variant="accent"
                        size="sm"
                        onClick={() => handleStartPickup(ord.id)}
                      >
                        Confirm Produce Picked Up
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB C: CURRENT ACTIVE DELIVERY */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {currentOrder ? (
              <Card className="p-6 border-emerald-300 bg-gradient-to-br from-emerald-50/40 to-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                      {currentOrder.orderNumber || currentOrder.id}
                    </span>
                    <Badge variant="in_transit" size="sm">Active Cargo Onboard</Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Live Telemetry Active</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{currentOrder.items?.[0]?.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Destination: <b>{typeof currentOrder.deliveryAddress === 'string' ? currentOrder.deliveryAddress : currentOrder.deliveryAddress?.addressLine1 || 'Adyar, Chennai'}</b>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Navigation}
                    onClick={() => {
                      const num = currentOrder.orderNumber || currentOrder.id;
                      setActiveOrderId(num);
                      setActiveView('order_tracking');
                    }}
                  >
                    Open Live GPS Telemetry View
                  </Button>

                  <Button
                    id="driver-goto-handover-btn"
                    variant="secondary"
                    size="md"
                    icon={KeyRound}
                    onClick={() => {
                      const num = currentOrder.orderNumber || currentOrder.id;
                      setActiveOrderId(num);
                      setActiveView('driver_handover');
                    }}
                  >
                    Enter 4-Digit Handover OTP
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-slate-500">
                <p>No active delivery in progress.</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB D: DRIVER AI COPILOT & PERFORMANCE ANALYTICS */}
        {activeTab === 'ai_copilot' && (
          <div id="panel-driver-ai-copilot" className="space-y-5 animate-in fade-in duration-200">
            
            {/* 1. Smart Route Suggestions */}
            <Card className="border-purple-200 bg-purple-50/30">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-100 text-purple-900 rounded-xl">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">AI Green-Corridor Route Suggestion</h3>
                    <p className="text-[11px] text-slate-500">Optimal highway corridors, toll speed, and fuel-efficient guidance</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                  {routeSuggestions?.recommended_route?.green_corridor_efficiency_rating || 'A+ RATING'}
                </span>
              </CardHeader>

              <CardBody className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-black text-slate-900 text-sm block">
                      {routeSuggestions?.recommended_route?.route_name || 'NH-44 to NH-48 Express Freight Highway'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Distance: {routeSuggestions?.recommended_route?.total_distance_km || 334.8} km • Est: {routeSuggestions?.recommended_route?.estimated_duration || '6h 15m'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-black block">
                      {routeSuggestions?.recommended_route?.projected_fuel_savings || '₹680 (12.4% savings)'}
                    </span>
                    <span className="text-[10px] text-slate-400">vs State Highway</span>
                  </div>
                </div>

                {/* Waypoint Hazards / Alerts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {routeSuggestions?.live_hazards_and_waypoints?.map((w, i) => (
                    <div key={i} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">{w.waypoint}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{w.status}</span>
                      </div>
                      <span className="font-mono text-purple-900 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded">
                        {w.speed_advice_kmh} km/h
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* 2. High-Yield Backhaul Order Suggestions */}
            <Card className="border-sky-200">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-100 text-sky-900 rounded-xl">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">High-Yield Backhaul Consignment Suggestions</h3>
                    <p className="text-[11px] text-slate-500">Eliminates empty return running from Chennai back to Salem hub</p>
                  </div>
                </div>
                <Badge variant="verified" size="sm">Return Trip Matches</Badge>
              </CardHeader>

              <CardBody className="space-y-3">
                <div className="space-y-2">
                  {orderSuggestions?.recommendations?.map((item) => (
                    <div key={item.order_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-800">{item.order_id}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded">
                            {item.match_score}% Route Match
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900">{item.client}</h4>
                        <p className="text-[11px] text-slate-600">
                          {item.pickup} ➔ {item.drop} ({item.cargo})
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-emerald-900 text-sm block">{item.freight_earnings}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">{item.net_profit_increase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* 3. Driver Delivery Analytics */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Driver Carrier Performance Analytics</h3>
                    <p className="text-[11px] text-slate-500">Verified telematics metrics and weekly earning projection</p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">On-time Delivery Rate</span>
                    <span className="text-lg font-black text-emerald-950">{driverAnalytics?.performance_metrics?.on_time_delivery_rate_percent || 98.4}%</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Tier 1 Carrier</span>
                  </div>

                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                    <span className="text-[10px] font-bold text-sky-700 block uppercase">Eco-Driving Index</span>
                    <span className="text-lg font-black text-sky-950">{driverAnalytics?.performance_metrics?.eco_driving_index || 92}/100</span>
                    <span className="text-[10px] text-sky-700 font-semibold">+18.2% fuel saved</span>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase">Handover Rating</span>
                    <span className="text-lg font-black text-purple-950">★{driverAnalytics?.performance_metrics?.customer_handover_rating || 4.94}</span>
                    <span className="text-[10px] text-purple-700 font-semibold">Top 2% Drivers</span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase">Projected Weekly DBT</span>
                    <span className="text-lg font-black text-amber-950">₹{driverAnalytics?.earnings_summary?.projected_weekly_earnings_rs?.toLocaleString('en-IN') || '16,500'}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Includes Bonuses</span>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>
        )}

      </div>

    </div>
  );
}
