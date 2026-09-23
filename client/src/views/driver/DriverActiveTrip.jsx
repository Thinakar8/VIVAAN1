import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, MapPin, Phone, ArrowLeft, KeyRound, CheckCircle2, Navigation } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function DriverActiveTrip() {
  const { setActiveView, activeOrderId, setActiveOrderId, addToast, realtimeDbService } = useApp();
  const [activeOrder, setActiveOrder] = useState(null);
  const [telemetry, setTelemetry] = useState(null);

  const orderId = activeOrderId || 'VIV-ORD-88120';

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${orderId}/track`)
      .then(r => r.json())
      .then(d => { if (d.success) setActiveOrder(d.order); })
      .catch(() => {});

    fetch(`http://localhost:5000/api/orders/${orderId}/live-tracking?role=DRIVER`)
      .then(r => r.json())
      .then(d => { if (d.success) setTelemetry(d); })
      .catch(() => {});
  }, [orderId]);

  const handleConfirmPickup = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/confirm-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      if (d.success) {
        await realtimeDbService.confirmPickupTracking(orderId);
        addToast('Pickup Confirmed', 'Cargo onboard! Route to buyer is now active.');
        setActiveOrder(prev => ({ ...prev, tracking_phase: 'TO_BUYER', order_status: 'PICKED_UP' }));
      }
    } catch (e) {
      addToast('Error', 'Failed to confirm pickup', 'error');
    }
  };

  const isToFarmer = (activeOrder?.tracking_phase || telemetry?.tracking_phase) === 'TO_FARMER';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('driver_dashboard')} label="Back to Driver Portal" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Active Delivery Itinerary</h1>
            <p className="text-xs text-slate-500">Transit route from farmgate to buyer doorstep</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Navigation}
          onClick={() => {
            setActiveOrderId(orderId);
            setActiveView('order_tracking');
          }}
        >
          Live Telemetry View
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Stops and Actions */}
        <div className="md:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                  {activeOrder?.id || orderId}
                </span>
                <span className="text-xs font-black text-slate-900">{activeOrder?.product_name || 'Salem Organic Turmeric'}</span>
              </div>
              <Badge variant={activeOrder?.order_status === 'DELIVERED' ? 'delivered' : 'in_transit'} size="sm">
                {activeOrder?.order_status || 'IN_TRANSIT'}
              </Badge>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Leg 1: Farmgate Pickup */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isToFarmer ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md">
                    Stop 1: Farmgate Collection
                  </span>
                  <span className="text-xs font-bold text-emerald-900">{activeOrder?.quantity || 10} kg Cargo</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-black text-slate-900 text-sm">{activeOrder?.farmer_name || 'Ramasamy Gounder'}</div>
                  <p className="text-slate-600">{activeOrder?.farmer_village || 'Omalur'}, Salem District</p>
                  <div className="text-slate-500 font-mono text-[11px]">+91 98421 04582</div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="tel:+919842104582"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Farmer
                  </a>

                  {isToFarmer && (
                    <Button
                      id="confirm-pickup-itinerary-btn"
                      variant="accent"
                      size="sm"
                      icon={Truck}
                      onClick={handleConfirmPickup}
                    >
                      Confirm Pickup
                    </Button>
                  )}
                </div>
              </div>

              {/* Leg 2: Doorstep Dropoff */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                !isToFarmer ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/30' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-200 px-2 py-0.5 rounded-md">
                    Stop 2: Buyer Handover
                  </span>
                  <span className="text-xs font-bold text-sky-900">Requires 4-Digit OTP</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-black text-slate-900 text-sm">{activeOrder?.buyer_name || 'Aditi Sharma'}</div>
                  <p className="text-slate-600">{activeOrder?.delivery_address || 'Flat 4B, Greenview Apts, Adyar, Chennai'}</p>
                  <div className="text-slate-500 font-mono text-[11px]">+91 98412 34567</div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="tel:+919841234567"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-800 text-white rounded-xl text-xs font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Buyer
                  </a>

                  {!isToFarmer && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={KeyRound}
                      onClick={() => {
                        setActiveOrderId(orderId);
                        setActiveView('driver_handover');
                      }}
                    >
                      Doorstep OTP
                    </Button>
                  )}
                </div>
              </div>

              {/* Action to proceed to OTP handover */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={KeyRound}
                  onClick={() => {
                    setActiveOrderId(orderId);
                    setActiveView('driver_handover');
                  }}
                >
                  Proceed to Doorstep OTP Handover
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Mini Interactive Map */}
        <div className="md:col-span-6">
          <Card className="overflow-hidden p-2">
            <div className="h-[460px]">
              <TrackingMap
                pickupPoint={{
                  lat: activeOrder?.pickup_lat || 11.7401,
                  lng: activeOrder?.pickup_lng || 78.0406,
                  farmerName: activeOrder?.farmer_name || 'Ramasamy Gounder',
                  village: activeOrder?.farmer_village || 'Omalur'
                }}
                deliveryPoint={{
                  lat: activeOrder?.delivery_lat || 13.0012,
                  lng: activeOrder?.delivery_lng || 80.2565,
                  address: activeOrder?.delivery_address || 'Adyar, Chennai'
                }}
                driver={{
                  name: 'Murugan K',
                  vehicle_no: 'TN-30-AZ-8120',
                  lat: 11.6643,
                  lng: 78.1460,
                  speed_kmh: 40
                }}
                phase={isToFarmer ? 'TO_FARMER' : 'TO_BUYER'}
                liveTrackingActive={activeOrder?.order_status !== 'DELIVERED'}
                isDelivered={activeOrder?.order_status === 'DELIVERED'}
                className="h-full"
              />
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
