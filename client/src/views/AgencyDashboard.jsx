import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Users,
  ShieldCheck,
  Plus,
  Route,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AgencyDashboard() {
  const { user, addToast } = useApp();
  const [agency, setAgency] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  // New Driver Form
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [vehicleType, setVehicleType] = useState('Tata Ace Pickup');
  const [vehicleNo, setVehicleNo] = useState('');

  const agencyId = user?.agency_id || 1;

  const loadAgencyData = async () => {
    try {
      const res = await fetch(`/api/agencies/${agencyId}`);
      const data = await res.json();
      if (data.success) {
        setAgency(data.agency);
        setDrivers(data.drivers || []);
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Agency load error:', err);
    }
  };

  useEffect(() => {
    loadAgencyData();
  }, [agencyId]);

  const handleEnrollDriver = async (e) => {
    e.preventDefault();
    if (!driverName || !driverPhone) {
      addToast('Missing Details', 'Driver name and phone are required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id: agencyId,
          full_name: driverName,
          phone: driverPhone,
          license_no: driverLicense || 'TN-30-2026-99120',
          vehicle_type: vehicleType,
          vehicle_no: vehicleNo || 'TN-30-AZ-9988',
          max_weight_kg: 1200,
          home_district: 'Salem'
        })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Driver Enrolled', `Driver ${driverName} assigned VIVAAN ID: ${data.driver.vivaan_id}`);
        setShowAddDriverModal(false);
        setDriverName('');
        setDriverPhone('');
        setDriverLicense('');
        setVehicleNo('');
        loadAgencyData();
      }
    } catch (err) {
      addToast('Error', 'Failed to enroll driver', 'error');
    }
  };

  const handleOptimizeRoute = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/routing/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_lat: 11.6643,
          driver_lng: 78.1460,
          order_ids: orders.map(o => o.id)
        })
      });
      const data = await res.json();
      if (data.success) {
        setOptimizedRoute(data);
        addToast('Route Optimized', `Sequence computed with ${data.estimated_fuel_saved_percent}% estimated fuel savings!`);
      }
    } catch (err) {
      addToast('Error', 'Route optimization failed', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Agency Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-3xl">
            🚚
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-400 text-sky-950 font-black text-xs uppercase tracking-wider">
                {agency?.tier === 'STATE_BLUE' ? 'State Corridor Fleet' : 'District Logistics'}
              </span>
              <span className="text-amber-300 font-mono font-bold text-sm tracking-wider">
                {agency?.vivaan_id || 'VIV-AG-104582'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{agency?.brand_name || 'GreenCorridor Agro Logistics'}</h1>
            <p className="text-xs text-slate-300">
              {agency?.corp_office || 'Chennai & Salem Hubs'} • Verified Rural Carrier
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddDriverModal(true)}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Driver</span>
          </button>

          <button
            onClick={handleOptimizeRoute}
            disabled={optimizing}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Route className="w-4 h-4 text-amber-300" />
            <span>{optimizing ? 'Calculating TSP...' : 'Optimize Multi-Stop Route'}</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet Drivers</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{drivers.length}</h3>
          <span className="text-xs text-sky-600 font-semibold">● Verified Commercial DL</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Shipments</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{orders.length}</h3>
          <span className="text-xs text-slate-500 font-medium">In Transit / Scheduled</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload Capacity</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{agency?.max_weight_kg || 18000} kg</h3>
          <span className="text-xs text-emerald-600 font-semibold">Cold-Chain Equipped</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carrier Quality</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">4.9 ★</h3>
          <span className="text-xs text-slate-500 font-medium">99.4% On-Time Delivery</span>
        </div>
      </div>

      {/* Route Optimization Result Box */}
      {optimizedRoute && (
        <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-black">
                Intelligent TSP Multi-Stop Route Sequencing
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-emerald-800 px-3 py-1 rounded-full text-emerald-200 font-bold">
                Total: {optimizedRoute.total_distance_km} km
              </span>
              <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-black">
                Fuel Saved: {optimizedRoute.estimated_fuel_saved_percent}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optimizedRoute.stops.map((stop) => (
              <div key={stop.stop_number} className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-300 font-bold">Stop #{stop.stop_number}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    stop.type === 'PICKUP' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {stop.type}
                  </span>
                </div>
                <div className="font-bold text-white text-sm">{stop.label}</div>
                <div className="text-slate-300 text-[11px]">Leg Distance: {stop.distance_km} km</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drivers Roster */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Assigned Driver Fleet</h3>
          <button
            onClick={() => setShowAddDriverModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {drivers.map((driver) => (
            <div key={driver.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                  alt={driver.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-300 ring-2 ring-sky-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{driver.full_name}</h4>
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-bold">
                      {driver.vivaan_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {driver.vehicle_type} ({driver.vehicle_no}) • Phone: {driver.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    driver.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    ● {driver.status}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    {driver.trips_completed} trips completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-lg font-black">Onboard Carrier Driver</h3>
              <button onClick={() => setShowAddDriverModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollDriver} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Driver Full Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Jaswinder Singh"
                  className="w-full p-3 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 98145 67890"
                    className="w-full p-3 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commercial DL No</label>
                  <input
                    type="text"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    placeholder="DL-TN-2026-0091"
                    className="w-full p-3 rounded-xl border border-slate-200 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  >
                    <option value="Tata Ace Pickup">Tata Ace Pickup</option>
                    <option value="Ashok Leyland Dost">Ashok Leyland Dost</option>
                    <option value="Refrigerated Van">Refrigerated Van</option>
                    <option value="Heavy Freight Truck">Heavy Freight Truck</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Reg No</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="TN-30-AZ-1122"
                    className="w-full p-3 rounded-xl border border-slate-200 uppercase"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl"
                >
                  Verify DL & Enroll Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
