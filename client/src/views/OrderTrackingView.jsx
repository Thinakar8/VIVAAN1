import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  KeyRound,
  Play,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  Radio,
  Navigation,
  Share2,
  Compass
} from 'lucide-react';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import TrackingMap from '../components/tracking/TrackingMap';

export default function OrderTrackingView() {
  const {
    activeOrderId,
    setActiveView,
    activeRole,
    currentUser,
    addToast,
    realtimeDbService,
    firestoreService
  } = useApp();

  const currentOrderId = activeOrderId || 'VIV-ORD-88120';
  const roleName = (activeRole?.id || currentUser?.role || 'buyer').toUpperCase();

  const [order, setOrder] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcastingGps, setBroadcastingGps] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [buyerGpsShared, setBuyerGpsShared] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const watchIdRef = useRef(null);

  // 1. Fetch Order & Live Telemetry
  const loadOrderAndTelemetry = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/track`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setBuyerGpsShared(Boolean(data.order.buyer_location_shared));
      }

      const tRes = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/live-tracking?role=${roleName}`);
      const tData = await tRes.json();
      if (tData.success) {
        setTelemetry(tData);
      }
    } catch (err) {
      console.warn('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderAndTelemetry();

    // Subscribe to Firebase Realtime Database live stream
    const unsubRtdb = realtimeDbService.subscribeLiveTracking(currentOrderId, roleName, (data) => {
      if (data) {
        setTelemetry(prev => ({
          ...(prev || {}),
          ...data,
          driver: data.status === 'DELIVERED' ? null : (data.driver || {
            name: data.driverName || 'Murugan Karuppasamy',
            vehicle_no: data.vehicleNo || 'TN-30-AZ-8120',
            vehicle: data.vehicleType || 'Tata Ace Pickup',
            lat: data.lat,
            lng: data.lng,
            speed_kmh: data.speedKmh,
            heading: data.heading
          })
        }));
      }
    });

    const interval = setInterval(loadOrderAndTelemetry, 3500);

    return () => {
      clearInterval(interval);
      if (unsubRtdb) unsubRtdb();
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [currentOrderId, roleName]);

  // Back Navigation Handler
  const handleBack = () => {
    if (roleName === 'DRIVER') {
      setActiveView('driver_dashboard');
    } else if (roleName === 'AGENCY') {
      setActiveView('agency_dashboard');
    } else if (roleName === 'FARMER') {
      setActiveView('farmer_orders');
    } else {
      setActiveView('buyer_orders');
    }
  };

  // Driver Action: Accept Order
  const handleDriverAccept = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/accept-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: 'VIV-DR-104582', driver_name: 'Murugan Karuppasamy' })
      });
      const data = await res.json();
      if (data.success) {
        await realtimeDbService.acceptOrderTracking(currentOrderId, {
          id: 'VIV-DR-104582',
          name: 'Murugan Karuppasamy',
          lat: 11.6643,
          lng: 78.1460
        });
        addToast('Order Accepted', 'Route to farmgate pickup loaded.');
        loadOrderAndTelemetry();
      }
    } catch (e) {
      addToast('Error', 'Failed to accept order', 'error');
    }
  };

  // Driver Action: Confirm Farmgate Pickup (COLLECT / PICKED UP)
  const handleDriverPickup = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/confirm-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        await realtimeDbService.confirmPickupTracking(currentOrderId);
        addToast('Produce Picked Up!', 'Cargo onboard. Route to buyer active; buyer live tracking unlocked!');
        loadOrderAndTelemetry();
      }
    } catch (e) {
      addToast('Error', 'Failed to confirm pickup', 'error');
    }
  };

  // Buyer Action: Explicit Geolocation Consent
  const handleShareBuyerGps = () => {
    setBuyerGpsShared(true);
    if (!navigator.geolocation) {
      submitBuyerGps(13.0012, 80.2565);
      return;
    }

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        submitBuyerGps(13.0012, 80.2565);
      }
    }, 400);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          submitBuyerGps(pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          submitBuyerGps(13.0012, 80.2565);
        }
      },
      { enableHighAccuracy: false, timeout: 350 }
    );
  };

  const submitBuyerGps = async (lat, lng) => {
    setBuyerGpsShared(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/share-buyer-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          consent_granted: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setBuyerGpsShared(true);
        await realtimeDbService.grantBuyerLocationConsent(currentOrderId, { lat, lng });
        addToast('GPS Permission Granted', 'Exact delivery coordinates shared securely with assigned driver.');
        loadOrderAndTelemetry();
      }
    } catch (e) {
      addToast('Error', 'Failed to share location', 'error');
    }
  };

  // Driver Action: Broadcast Device GPS
  const handleToggleBroadcastGps = () => {
    if (broadcastingGps) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setBroadcastingGps(false);
      addToast('GPS Broadcast Paused', 'Device GPS stream paused.');
    } else {
      setBroadcastingGps(true);
      addToast('GPS Broadcast Active', 'Streaming high-accuracy browser GPS coordinates.');

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            await pushGpsUpdate(pos.coords.latitude, pos.coords.longitude, pos.coords.speed ? pos.coords.speed * 3.6 : 38, pos.coords.heading || 45);
          },
          (err) => {
            // Simulator fallback
            advanceSimulatedGps();
          },
          { enableHighAccuracy: true }
        );
      } else {
        advanceSimulatedGps();
      }
    }
  };

  const pushGpsUpdate = async (lat, lng, speed = 40, heading = 45) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${currentOrderId}/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, speed, heading, driver_id: 'VIV-DR-104582' })
      });
      await realtimeDbService.updateDriverLocation(currentOrderId, { lat, lng, speedKmh: speed, heading });
      loadOrderAndTelemetry();
    } catch (e) {}
  };

  const advanceSimulatedGps = async () => {
    const nextStep = simStep + 1;
    setSimStep(nextStep);
    const t = Math.min(1, nextStep * 0.25);
    const newLat = 11.7401 + (13.0012 - 11.7401) * t;
    const newLng = 78.0406 + (80.2565 - 78.0406) * t;
    await pushGpsUpdate(newLat, newLng, t === 1 ? 0 : 44, 52);
    addToast('GPS Beacon Updated', `Vehicle moved along transit corridor (${Math.round(t * 100)}% complete)`);
  };

  // OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      addToast('Invalid Code', 'Please enter a 4-digit confirmation OTP.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entered_otp: enteredOtp.trim(),
          driver_id: 'VIV-DR-104582'
        })
      });
      const data = await res.json();
      if (data.success) {
        await realtimeDbService.stopLiveTracking(currentOrderId);
        await firestoreService.updateOrderStatus(currentOrderId, 'DELIVERED');
        await firestoreService.releaseEscrowPayment(currentOrderId);
        addToast('Delivery Confirmed!', 'OTP verified! Escrow released to farmer & driver. Live tracking stopped.');
        loadOrderAndTelemetry();
      } else {
        addToast('Verification Failed', data.error || 'Incorrect OTP code.', 'error');
      }
    } catch (err) {
      addToast('Error', 'OTP verification request failed', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 font-bold space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Connecting to VIVAAN GPS Telemetry Feed...</p>
      </div>
    );
  }

  const isDelivered = order?.order_status === 'DELIVERED' || telemetry?.order_status === 'DELIVERED';
  const isPreCollection = roleName === 'BUYER' && (telemetry?.live_tracking_allowed === false && !isDelivered);
  const phase = order?.tracking_phase || telemetry?.tracking_phase || 'TO_BUYER';
  const liveTrackingActive = !isDelivered && (roleName !== 'BUYER' || !isPreCollection);

  const pickupPoint = telemetry?.pickup_point || {
    lat: order?.pickup_lat || 11.7401,
    lng: order?.pickup_lng || 78.0406,
    farmerName: order?.farmer_name || 'Ramasamy Gounder',
    village: order?.farmer_village || 'Omalur'
  };

  const deliveryPoint = telemetry?.delivery_point || {
    lat: order?.delivery_lat || 13.0012,
    lng: order?.delivery_lng || 80.2565,
    address: order?.delivery_address || 'Flat 4B, Greenview Apts, Adyar, Chennai',
    district: order?.delivery_district || 'Chennai'
  };

  const assignedDriver = telemetry?.driver || (liveTrackingActive ? {
    id: order?.driver_id || 'VIV-DR-104582',
    name: order?.driver_name || 'Murugan Karuppasamy',
    vehicle_no: 'TN-30-AZ-8120',
    lat: order?.current_lat || 11.6643,
    lng: order?.current_lng || 78.1460,
    speed_kmh: 42,
    heading: 45
  } : null);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header with Working Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <BackButton id="tracking-back-btn" onClick={handleBack} label="Back" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">VIVAAN Live Delivery Telemetry</h1>
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md" id="tracking-order-id-badge">
                {order?.id || currentOrderId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Role: <b className="text-slate-800">{roleName}</b> • Tracking ID: <span className="font-mono text-blue-700">{order?.tracking_id || 'TRK-88120'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            id="tracking-overall-status-pill"
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
              isDelivered
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
            {isDelivered ? '✓ DELIVERED & SETTLED' : (order?.order_status || 'IN_TRANSIT')}
          </span>

          <button
            onClick={loadOrderAndTelemetry}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Lifecycle, Status, Privacy, OTP */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* A. PRE-COLLECTION PRIVACY NOTICE (FOR BUYER ONLY) */}
          {isPreCollection && (
            <Card id="buyer-pre-collection-card" className="border-amber-300 bg-amber-50/70 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950">Produce Awaiting Farmgate Collection</h3>
                  <p className="text-xs text-amber-800 mt-1">
                    Carrier <b className="font-bold">{order?.driver_name || 'Murugan K'}</b> has been assigned and is traveling to the farmgate to inspect and collect the harvest produce.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Farmgate Origin:</div>
                <div className="font-black text-slate-900">{pickupPoint?.farmerName}, {pickupPoint?.village}</div>
                <div className="text-amber-900 font-semibold text-[11px]">
                  🔒 Live GPS map tracking unlocks immediately once the driver confirms farmgate pickup.
                </div>
              </div>
            </Card>
          )}

          {/* B. POST-DELIVERY RECORD (TEARDOWN CONFIRMATION) */}
          {isDelivered && (
            <Card id="post-delivery-historical-card" className="border-emerald-300 bg-emerald-50/70 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-200 text-emerald-950 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-950">Delivery Confirmed & Settled</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Verified via 4-Digit OTP. Live driver location tracking has permanently terminated.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Delivered At:</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {order?.delivered_at ? new Date(order.delivered_at).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-900">{deliveryPoint?.address}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Escrow Settlement:</span>
                  <span className="font-bold text-emerald-800">₹{order?.total_amount || 1720} Released</span>
                </div>
              </div>
            </Card>
          )}

          {/* C. Consignment Cargo Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black uppercase text-slate-400">Cargo Details</span>
                <span className="text-xs font-black text-emerald-800">₹{order?.total_amount || 1720}</span>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <h4 className="text-sm font-black text-slate-900">{order?.product_name || 'Salem Pure Organic Turmeric'}</h4>
                <p className="text-xs text-slate-500">{order?.quantity || 10} {order?.unit || 'kg'} • Direct Farmgate Batch</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin Farmgate</span>
                    <span className="font-semibold text-slate-800">{pickupPoint?.farmerName}, {pickupPoint?.village}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Destination</span>
                    <span className="font-semibold text-slate-800">{deliveryPoint?.address}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* D. Assigned Carrier Driver Card (Strict Isolation: NEVER unrelated drivers) */}
          <Card>
            <CardHeader>
              <span className="text-xs font-black uppercase text-slate-400">Assigned Logistics Carrier</span>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                    alt="Driver"
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-300"
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900" id="assigned-driver-name-label">
                      {assignedDriver?.name || order?.driver_name || 'Murugan Karuppasamy'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Vehicle: <b className="font-mono text-slate-800">{assignedDriver?.vehicle_no || 'TN-30-AZ-8120'}</b>
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${order?.driver_phone || '+919443219870'}`}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200"
                  title="Call Carrier Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </CardBody>
          </Card>

          {/* E. BUYER GEOLOCATION PERMISSION CARD (Strict Privacy Rule) */}
          {roleName === 'BUYER' && !isDelivered && (
            <Card id="buyer-privacy-permission-card" className="p-4 border-sky-200 bg-sky-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-sky-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  Buyer Geolocation Privacy
                </span>
                {buyerGpsShared ? (
                  <span id="buyer-gps-consented-badge" className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Exact GPS Shared
                  </span>
                ) : (
                  <span id="buyer-gps-masked-badge" className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    Protected (Masked)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-600">
                {buyerGpsShared
                  ? 'Your exact high-accuracy doorstep GPS is actively assisting the assigned driver for precise delivery navigation.'
                  : 'Your exact GPS coordinates are NOT shared automatically. Click below to grant one-time permission for precise doorstep navigation.'}
              </p>

              {!buyerGpsShared && (
                <Button
                  id="grant-buyer-gps-btn"
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={Share2}
                  onClick={handleShareBuyerGps}
                >
                  Share My Exact Delivery GPS with Driver
                </Button>
              )}
            </Card>
          )}

          {/* F. DOORSTEP OTP CARD */}
          {!isDelivered && (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Doorstep Confirmation OTP</h3>
                    <p className="text-[11px] text-slate-300">Share with driver upon physical receipt of produce</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/15">
                <span className="text-3xl font-mono font-black tracking-widest text-amber-300" id="buyer-doorstep-otp-code">
                  {order?.delivery_otp || telemetry?.delivery_otp || '4819'}
                </span>
                <span className="block text-[10px] text-slate-300 mt-1 uppercase tracking-wider font-semibold">
                  CONFIDENTIAL • RELEASES ESCROW FUNDS TO PRODUCER
                </span>
              </div>

              {/* Driver / Tester quick verification tool */}
              {(roleName === 'DRIVER' || roleName === 'ADMIN') && (
                <form onSubmit={handleVerifyOtp} className="pt-2 flex items-center gap-2">
                  <input
                    id="telemetry-otp-input"
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-36 p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-center text-sm focus:outline-amber-400"
                  />
                  <button
                    id="telemetry-verify-otp-btn"
                    type="submit"
                    disabled={verifyingOtp}
                    className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP & Release'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* G. DRIVER CONTROLS (PHASE ADVANCE & GPS BROADCAST) */}
          {roleName === 'DRIVER' && !isDelivered && (
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase">Driver Trip Controls</h4>
              
              <div className="flex flex-col gap-2">
                {phase === 'TO_FARMER' && (
                  <Button
                    id="driver-confirm-pickup-btn"
                    variant="accent"
                    size="md"
                    icon={Truck}
                    onClick={handleDriverPickup}
                  >
                    COLLECT / PICKED UP (Confirm Farmgate Cargo)
                  </Button>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    id="driver-broadcast-gps-btn"
                    variant={broadcastingGps ? 'secondary' : 'primary'}
                    size="sm"
                    icon={Radio}
                    onClick={handleToggleBroadcastGps}
                  >
                    {broadcastingGps ? 'Broadcasting GPS (Active)' : 'Broadcast Device GPS'}
                  </Button>

                  <Button
                    id="driver-advance-sim-btn"
                    variant="outline"
                    size="sm"
                    onClick={advanceSimulatedGps}
                  >
                    +25% Progress
                  </Button>
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* Right Column: Google Maps / Leaflet Interactive Dual-Engine Map */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-2">
            <TrackingMap
              pickupPoint={pickupPoint}
              deliveryPoint={deliveryPoint}
              driver={assignedDriver}
              phase={phase}
              liveTrackingActive={liveTrackingActive}
              isDelivered={isDelivered}
              className="h-[600px]"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
