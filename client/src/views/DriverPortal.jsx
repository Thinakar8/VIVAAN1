import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  KeyRound,
  Play,
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';

export default function DriverPortal() {
  const { user, addToast } = useApp();
  const [driver, setDriver] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [broadcastingGps, setBroadcastingGps] = useState(true);

  const driverId = user?.driver_id || 'VIV-DR-104582';

  const loadDriverData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/drivers/${driverId}`);
      const data = await res.json();
      if (data.success) {
        setDriver(data.driver);
        setActiveOrder(data.active_order);
      }
    } catch (err) {
      console.warn('Driver load error:', err);
    }
  };

  useEffect(() => {
    loadDriverData();
    const interval = setInterval(loadDriverData, 5000);
    return () => clearInterval(interval);
  }, [driverId]);

  // Keypad click handler
  const handleKeypadPress = (val) => {
    if (otpInput.length < 4) {
      setOtpInput(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setOtpInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOtpInput('');
  };

  // Submit OTP Delivery Handover
  const handleVerifyOtp = async () => {
    if (otpInput.length !== 4) {
      addToast('Incomplete Code', 'Please input full 4-digit OTP from buyer.', 'error');
      return;
    }

    try {
      const orderId = activeOrder?.id || 'VIV-ORD-88120';
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entered_otp: otpInput,
          driver_id: driverId
        })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Delivery Complete & Escrow Released!', data.message);
        setOtpInput('');
        loadDriverData();
      } else {
        addToast('Verification Failed', data.error || 'Incorrect OTP code.', 'error');
      }
    } catch (err) {
      addToast('Error', 'Failed to submit delivery verification', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      
      {/* Driver Identity Card */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
            alt="Driver"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-amber-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-200">
                {driver?.vivaan_id || 'VIV-DR-104582'}
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
                Active Driver
              </span>
            </div>
            <h2 className="text-xl font-black">{driver?.full_name || 'Murugan K'}</h2>
            <p className="text-xs text-amber-100">
              {driver?.vehicle_type} ({driver?.vehicle_no})
            </p>
          </div>
        </div>

        {/* GPS beacon badge */}
        <div className="text-right">
          <button
            onClick={() => setBroadcastingGps(!broadcastingGps)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              broadcastingGps ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{broadcastingGps ? 'GPS Live' : 'GPS Off'}</span>
          </button>
        </div>
      </div>

      {/* Active Trip Card */}
      {activeOrder ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Trip Assignment</span>
              <h3 className="text-base font-black text-slate-900">{activeOrder.id}</h3>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-extrabold uppercase">
              {activeOrder.order_status}
            </span>
          </div>

          {/* Cargo Details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cargo</span>
              <b className="text-slate-900">{activeOrder.product_name}</b>
              <span className="text-slate-500 block">{activeOrder.quantity} {activeOrder.unit}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Payout</span>
              <b className="text-emerald-700 text-sm">₹{activeOrder.logistics_fee || 120}</b>
            </div>
          </div>

          {/* Farmgate & Destination Addresses */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">1. Farmgate Collection</span>
                <b className="text-slate-900">{activeOrder.farmer_name}</b> ({activeOrder.farmer_phone})
                <span className="text-slate-500 block">{activeOrder.farmer_village}, Salem</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-2xl border border-sky-100">
              <MapPin className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-sky-800 font-bold uppercase block">2. Buyer Doorstep Handover</span>
                <b className="text-slate-900">{activeOrder.buyer_name}</b> ({activeOrder.buyer_phone})
                <span className="text-slate-500 block">{activeOrder.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Navigation Trigger */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.delivery_lat || 13.0012},${activeOrder.delivery_lng || 80.2565}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md"
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>Open Google Maps</span>
            </a>

            <a
              href={`tel:${activeOrder.buyer_phone}`}
              className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border border-emerald-200"
            >
              <Phone className="w-4 h-4" />
              <span>Call Buyer</span>
            </a>
          </div>

          {/* OTP Handover Keypad */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                Collect 4-Digit Buyer OTP
              </span>
              <p className="text-[11px] text-slate-500">
                Ask the buyer for the OTP shown on their screen to unlock escrow payment.
              </p>
            </div>

            {/* Display Box */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-2xl font-mono font-black text-slate-900 shadow-inner"
                >
                  {otpInput[idx] || '•'}
                </div>
              ))}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(String(num))}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-base shadow-xs transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold text-xs"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-base"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                ⌫
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Confirm Delivery & Disburse Payouts</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <h3 className="text-lg font-black text-slate-900">All Scheduled Deliveries Completed!</h3>
          <p className="text-xs text-slate-500">
            You are currently IDLE. Stand by for the next farmgate collection assignment from GreenCorridor Logistics.
          </p>
        </div>
      )}

      {/* Driver Daily Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Trips Completed</span>
          <div className="text-xl font-black text-slate-900 mt-1">{driver?.trips_completed || 148}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Driver Rating</span>
          <div className="text-xl font-black text-amber-600 mt-1">{driver?.rating || 4.92} ★</div>
        </div>
      </div>

    </div>
  );
}
