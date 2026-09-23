import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function DriverHandover() {
  const { setActiveView, activeOrderId, addToast, firestoreService, realtimeDbService } = useApp();

  const [activeOrder, setActiveOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadActive() {
      const ords = await firestoreService.getOrders('driver', 'driver_1');
      const found = ords.find(o => o.orderNumber === activeOrderId || o.id === activeOrderId);
      if (found) {
        setActiveOrder(found);
      } else {
        const inTransit = ords.find(o => o.status === 'IN_TRANSIT' || o.status === 'PICKED_UP' || o.status === 'ACCEPTED') || ords[0];
        setActiveOrder(inTransit);
      }
    }
    loadActive();
  }, [firestoreService, activeOrderId]);

  const handleKeypadPress = (val) => {
    if (otpInput.length < 4) {
      setOtpInput(prev => prev + val);
    }
  };

  const handleClear = () => setOtpInput('');
  const handleBackspace = () => setOtpInput(prev => prev.slice(0, -1));

  const handleSubmitHandover = async (e) => {
    e.preventDefault();
    if (otpInput.length !== 4) {
      addToast('Invalid Code', 'Please input the full 4-digit OTP provided by the buyer.', 'error');
      return;
    }

    const targetOrderId = activeOrder?.id || 'order_88120';
    const targetOrderNumber = activeOrder?.orderNumber || activeOrderId || 'VIV-ORD-88120';
    setIsSubmitting(true);
    try {
      // 1. Verify OTP with backend API
      const res = await fetch(`/api/orders/${targetOrderNumber}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entered_otp: otpInput,
          driver_id: 'VIV-DR-104582'
        })
      });
      const data = await res.json();

      if (!data.success) {
        addToast('Verification Failed', data.error || 'Incorrect OTP code. Please re-check with buyer.', 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Update Firestore Order status to DELIVERED
      await firestoreService.updateOrderStatus(targetOrderId, 'DELIVERED');

      // 3. Release Escrow payment in Firestore
      await firestoreService.releaseEscrowPayment(targetOrderId);

      // 4. Teardown live tracking in Realtime Database (removes driver live location)
      await realtimeDbService.stopLiveTracking(targetOrderId);
      await realtimeDbService.stopLiveTracking(targetOrderNumber);

      addToast('Delivery Complete!', 'Handover verified! Escrow payment released to farmer account. Live tracking terminated.');
      setActiveView('driver_dashboard');
    } catch (err) {
      addToast('Error', err.message || 'Failed to submit handover', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => setActiveView('driver_dashboard')} label="Back to Driver Portal" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doorstep OTP Handover</h1>
          <p className="text-xs text-slate-500">Collect 4-digit OTP from recipient to complete delivery</p>
        </div>
      </div>

      {/* Step 1: Farmgate Collection Confirmation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase text-slate-400">Step 1: Farmgate Pickup</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              ✓ Cargo Collected
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-4 text-xs text-slate-600">
          Farmgate produce was checked and loaded onto vehicle.
        </CardBody>
      </Card>

      {/* Step 2: Doorstep OTP Handover Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Step 2: Buyer Handover Verification</h3>
              <p className="text-[11px] text-slate-500">Ask buyer for the code shown on their order screen</p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmitHandover} className="space-y-6">
            
            {/* OTP Display Slots */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-14 h-16 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-3xl font-mono font-black text-slate-900 shadow-inner"
                >
                  {otpInput[i] || '•'}
                </div>
              ))}
            </div>

            {/* Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  id={`otp-key-${n}`}
                  type="button"
                  onClick={() => handleKeypadPress(String(n))}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg transition-all cursor-pointer select-none active:scale-95"
                >
                  {n}
                </button>
              ))}
              <button
                id="otp-key-clear"
                type="button"
                onClick={handleClear}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold text-xs cursor-pointer select-none"
              >
                Clear
              </button>
              <button
                id="otp-key-0"
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer select-none"
              >
                ⌫
              </button>
            </div>

            {/* Demo Hint */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 font-semibold text-center">
              💡 Buyer OTP code for consignment <span className="font-mono font-bold">{activeOrder?.orderNumber || 'VIV-ORD-88120'}</span> is: <b className="font-mono text-emerald-800 text-sm" id="handover-otp-hint">{activeOrder?.otpCode || '4819'}</b>
            </div>

            {/* Proper Form Submit Button */}
            <Button
              id="handover-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon={CheckCircle2}
            >
              {isSubmitting ? 'Verifying OTP...' : 'Submit Delivery Confirmation'}
            </Button>

          </form>
        </CardBody>
      </Card>

    </div>
  );
}
