import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Package,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  Tag,
  User,
  Phone,
  FileText
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

export default function BuyerCart() {
  const { cart, removeFromCart, addToCart, clearCart, setActiveView, addToast, firestoreService } = useApp();

  const [address, setAddress] = useState('Flat 4B, Greenview Apts, Adyar');
  const [district, setDistrict] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [simulatorIntent, setSimulatorIntent] = useState(null);

  // Detailed Checkout Fields (Req 13)
  const [recipientName, setRecipientName] = useState('Aditi Sharma');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [pincode, setPincode] = useState('600020');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [deliveryType, setDeliveryType] = useState('STANDARD'); // 'STANDARD' | 'EXPRESS_COLD_CHAIN'
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('Morning (08:00 AM - 12:00 PM)');
  const [driverNotes, setDriverNotes] = useState('Leave with apartment security if unreachable.');

  useEffect(() => {
    async function loadBuyerProfile() {
      try {
        const p = await firestoreService.getBuyerProfile();
        if (p) {
          setBuyerProfile(p);
          if (p.deliveryAddress) setAddress(p.deliveryAddress);
          if (p.district) setDistrict(p.district);
          if (p.state) setState(p.state);
          if (p.name) setRecipientName(p.name);
          if (p.phone) setRecipientPhone(p.phone);
        }
      } catch (err) {
        console.error('Failed to load buyer profile in cart', err);
      }
    }
    loadBuyerProfile();
  }, [firestoreService]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price_per_unit * item.quantity), 0);
  const baseLogisticsFee = cart.length > 0 ? (deliveryType === 'EXPRESS_COLD_CHAIN' ? 180 : 120) : 0;
  const logisticsFee = baseLogisticsFee;
  const total = Math.max(0, subtotal + logisticsFee - couponDiscount);

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'VIVAAN2026' || code === 'FARMERFIRST') {
      setCouponDiscount(50);
      setCouponApplied(true);
      setCouponError('');
      addToast('Coupon Applied', `Code ${code} applied! ₹50 direct discount.`);
    } else {
      setCouponError('Invalid coupon code. Try "VIVAAN2026" or "FARMERFIRST".');
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  // Finalize order after successful Razorpay verification
  const finalizeOrder = async (rzpOrderId, rzpPaymentId, rzpSignature) => {
    try {
      // 1. Create order in Cloud Firestore with verified Successful status
      const order = await firestoreService.createOrder({
        items: cart,
        produceSubtotal: subtotal,
        productAmount: subtotal,
        logisticsFee,
        deliveryCharge: logisticsFee,
        couponCode: couponApplied ? couponCode.toUpperCase() : null,
        couponDiscount,
        deliveryType,
        preferredDeliveryDate: preferredDate,
        preferredDeliveryTime: preferredTime,
        driverNotes,
        totalAmount: total,
        paymentStatus: 'Successful',
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: rzpSignature,
        recipientName,
        contactPhone: recipientPhone,
        deliveryAddress: {
          street: address,
          district,
          state,
          pincode,
          recipientName,
          contactPhone: recipientPhone
        }
      });

      // 2. Also notify backend API
      try {
        await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_id: 10,
            buyer_name: recipientName || buyerProfile?.name || order.buyerName || 'Aditi Sharma',
            buyer_phone: recipientPhone || buyerProfile?.phone || '+919876543210',
            recipient_name: recipientName,
            contact_phone: recipientPhone,
            pincode,
            coupon_code: couponApplied ? couponCode.toUpperCase() : null,
            coupon_discount: couponDiscount,
            delivery_type: deliveryType,
            preferred_delivery_date: preferredDate,
            preferred_delivery_time: preferredTime,
            driver_notes: driverNotes,
            items: cart,
            delivery_address: address,
            delivery_district: district,
            delivery_state: state,
            payment_method: 'Razorpay UPI / Card',
            payment_id: rzpPaymentId,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPaymentId,
            payment_status: 'Successful',
            order_number: order.orderNumber,
            tracking_id: order.trackingId
          })
        });
      } catch (apiErr) {}

      addToast('Payment Successful', `Razorpay transaction ${rzpPaymentId} verified! ₹${total} secured in VIVAAN Escrow.`);
      clearCart();
      setPaymentError(null);
      setSimulatorIntent(null);
      setOrderConfirmation({
        ...order,
        produceSubtotal: subtotal,
        logisticsFee,
        totalAmount: total,
        paymentStatus: 'Successful',
        razorpayPaymentId: rzpPaymentId
      });
    } catch (err) {
      addToast('Order Finalization Error', err.message || 'Failed to save order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Razorpay Checkout Flow
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;
    if (!address || !district) {
      addToast('Missing Address', 'Please provide a complete delivery address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // Step 1: Initialize Payment Intent on Backend (Strict Security: Secret stays on server!)
      const intentRes = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_inr: total,
          items: cart,
          buyer_name: buyerProfile?.name || 'Aditi Sharma',
          buyer_phone: buyerProfile?.phone || '+919876543210',
          notes: {
            delivery_district: district,
            total_items: cart.length
          }
        })
      });

      const intentData = await intentRes.json();
      if (!intentData.success || !intentData.razorpay_order_id) {
        throw new Error(intentData.error || 'Failed to initialize Razorpay checkout intent.');
      }

      // In test mode / sandbox development with placeholder test credentials:
      if (intentData.key_id.includes('test') || !window.Razorpay) {
        setSimulatorIntent(intentData);
        setIsSubmitting(false);
        return;
      }

      // If standard live Razorpay modal is available in window
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: intentData.key_id, // PUBLIC KEY ONLY!
          amount: intentData.amount,
          currency: intentData.currency || 'INR',
          name: 'VIVAAN Digital Agricultural Marketplace',
          description: `Direct Farmgate Consignment (${cart.length} harvest item${cart.length > 1 ? 's' : ''})`,
          image: '/vivaan-logo.jpg',
          order_id: intentData.razorpay_order_id,
          handler: async function (response) {
            // Server-side signature verification
            try {
              const verifyRes = await fetch('http://localhost:5000/api/payments/verify-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success || !verifyData.verified) {
                throw new Error(verifyData.error || 'Razorpay HMAC signature verification failed');
              }
              await finalizeOrder(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            } catch (verr) {
              setIsSubmitting(false);
              setPaymentError({
                status: 'Failed',
                reason: verr.message || 'Signature verification rejected by backend.'
              });
              addToast('Payment Failed', verr.message, 'error');
            }
          },
          prefill: {
            name: buyerProfile?.name || 'Aditi Sharma',
            email: buyerProfile?.email || 'aditi.sharma@example.com',
            contact: buyerProfile?.phone || '+919876543210'
          },
          theme: {
            color: '#065f46'
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setPaymentError({
                status: 'Failed',
                reason: 'Payment dismissed by buyer or transaction aborted.'
              });
              addToast('Payment Incomplete', 'Razorpay checkout was dismissed.', 'warning');
            }
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } catch (openErr) {
          console.warn('Razorpay open encountered fallback, opening test simulator:', openErr);
          setSimulatorIntent(intentData);
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setPaymentError({
        status: 'Failed',
        reason: err.message || 'Failed to connect to Razorpay payment gateway.'
      });
      addToast('Payment Initialization Failed', err.message, 'error');
    }
  };

  // Test Simulator Handler for Automated Tests & Sandbox Environments
  const handleSimulatorAction = async (action) => {
    if (!simulatorIntent) return;
    setIsSubmitting(true);

    if (action === 'SUCCESS') {
      const mockPaymentId = `pay_rzp_test_${Date.now()}`;
      const mockSignature = `test_sig_${Date.now()}`;

      try {
        const verifyRes = await fetch('http://localhost:5000/api/payments/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: simulatorIntent.razorpay_order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature
          })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success || !verifyData.verified) {
          throw new Error(verifyData.error || 'Verification failed');
        }
        await finalizeOrder(simulatorIntent.razorpay_order_id, mockPaymentId, mockSignature);
      } catch (err) {
        setIsSubmitting(false);
        setPaymentError({ status: 'Failed', reason: err.message });
      }
    } else {
      // Simulate failure
      setIsSubmitting(false);
      setSimulatorIntent(null);
      setPaymentError({
        status: 'Failed',
        reason: 'Payment simulation declined: Card declined or insufficient funds.'
      });
      addToast('Payment Failed', 'Transaction declined by bank.', 'error');
    }
  };

  if (cart.length === 0 && !orderConfirmation) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          🛒
        </div>
        <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore fresh produce in the marketplace to support verified farmers.</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => setActiveView('buyer_marketplace')}
        >
          Browse Produce
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('buyer_marketplace')} label="Back to Marketplace" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Cart & Order Summary</h1>
            <p className="text-xs text-slate-500">Review selected farmgate produce and delivery destination</p>
          </div>
        </div>

        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-rose-600 hover:text-rose-700"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {/* Cart & Checkout Grid */}
      {cart.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Cart Items List */}
          <div className="md:col-span-7 space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-black text-slate-900 uppercase">Items in Cart ({cart.length})</h3>
              </CardHeader>
              <CardBody className="divide-y divide-slate-100 p-4">
                {cart.map((item) => (
                  <div key={item.product_id || item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <img src={item.photo_url || item.photoUrl} alt={item.title} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[11px] text-slate-500 block">Farmer: {item.farmer_name || item.farmerName}</span>
                      <span className="text-xs font-bold text-slate-900">₹{item.price_per_unit || item.pricePerUnit} / {item.unit}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => addToCart(item, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(item, 1)}
                        className="p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id || item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Delivery Form & Order Summary */}
          <div className="md:col-span-5 space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-black text-slate-900 uppercase">Delivery & Place Order</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {/* 1. Recipient Information */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Recipient Contact</span>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Recipient Name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                        placeholder="Full Name"
                      />
                      <Input
                        label="Contact Phone"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        required
                        placeholder="+91..."
                      />
                    </div>
                  </div>

                  {/* 2. Destination Address */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Delivery Destination</span>
                    <Input
                      label="Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="District"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      />
                      <Input
                        label="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                      <Input
                        label="PIN Code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 3. Delivery Type & Schedule */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Logistics & Schedule</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('STANDARD')}
                        className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer transition-all ${
                          deliveryType === 'STANDARD'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span className="block font-black text-[11px]">Standard Farm-Direct</span>
                        <span className="text-[10px] text-slate-500">₹120 &bull; 2-3 Days</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('EXPRESS_COLD_CHAIN')}
                        className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer transition-all ${
                          deliveryType === 'EXPRESS_COLD_CHAIN'
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span className="block font-black text-[11px]">Express Cold-Chain</span>
                        <span className="text-[10px] text-purple-700 font-semibold">₹180 &bull; Same/Next Day</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Date</label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                        >
                          <option>Morning (08:00 AM - 12:00 PM)</option>
                          <option>Afternoon (12:00 PM - 04:00 PM)</option>
                          <option>Evening (04:00 PM - 08:00 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Delivery Notes</label>
                      <input
                        type="text"
                        placeholder="Gate code, landmark, or delivery instructions..."
                        value={driverNotes}
                        onChange={(e) => setDriverNotes(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* 4. Coupon Code */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Promo Coupon</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Coupon (e.g. VIVAAN2026)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 text-xs uppercase font-mono p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      />
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        ✓ ₹50 discount applied!
                      </span>
                    )}
                    {couponError && (
                      <span className="text-[11px] text-rose-600 block">
                        {couponError}
                      </span>
                    )}
                  </div>

                  {/* 5. Cost Breakdown */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Product Amount (Subtotal):</span>
                      <span className="font-bold text-slate-900">₹{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Delivery Charge ({deliveryType === 'EXPRESS_COLD_CHAIN' ? 'Cold-Chain' : 'Standard'}):</span>
                      <span className="font-bold text-slate-900">₹{logisticsFee}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-emerald-700 font-bold">
                        <span>Coupon Discount ({couponCode.toUpperCase()}):</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Amount:</span>
                      <span className="text-emerald-800 font-black text-base">₹{total}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      <strong>Escrow Protected:</strong> Payment is held safely in escrow until you verify delivery with OTP.
                    </p>
                  </div>

                  {/* Payment Failure Error Notice if any */}
                  {paymentError && (
                    <div id="payment-failure-notice" className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1 text-xs text-rose-800">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-rose-900 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Payment Status:
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-200 text-rose-900 font-black" id="cart-payment-failed-badge">
                          {paymentError.status || 'Failed'}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-tight">{paymentError.reason}</p>
                      <p className="text-[10px] text-slate-500">Your items remain in cart. You can retry payment anytime.</p>
                    </div>
                  )}

                  {/* Razorpay Submit Button */}
                  <Button
                    id="order-submit-btn"
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isSubmitting}
                    icon={isSubmitting ? RefreshCw : CreditCard}
                    className={isSubmitting ? 'animate-pulse' : ''}
                  >
                    {isSubmitting ? 'Connecting to Razorpay...' : `Pay ₹${total} via Razorpay`}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>

        </div>
      )}

      {/* Razorpay Test Gateway Simulator Modal (for Automated & Sandbox Testing) */}
      {simulatorIntent && (
        <Modal
          isOpen={true}
          onClose={() => handleSimulatorAction('CANCEL')}
          title="Razorpay Gateway (VIVAAN Test Sandbox)"
        >
          <div className="space-y-4" id="razorpay-simulator-modal">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Razorpay Checkout</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded border border-amber-500/30">TEST MODE</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-slate-300">Total Payable:</span>
                <span className="text-2xl font-black text-emerald-400">₹{simulatorIntent.amount_inr}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Order ID: <span className="font-mono text-slate-200 text-xs">{simulatorIntent.razorpay_order_id}</span></span>
                <span className="font-mono text-slate-400 text-[10px]">{simulatorIntent.currency}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                VIVAAN Security Architecture:
              </p>
              <p className="text-[11px] text-emerald-700 leading-snug">
                Zero card numbers or CVVs stored. Credentials verified on backend via HMAC SHA-256 before confirming Escrow lock.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                id="rzp-simulate-success-btn"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => handleSimulatorAction('SUCCESS')}
                icon={CheckCircle2}
              >
                Authorize & Pay ₹{simulatorIntent.amount_inr} (Simulate Success)
              </Button>

              <Button
                id="rzp-simulate-fail-btn"
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => handleSimulatorAction('FAIL')}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                icon={AlertCircle}
              >
                Simulate Payment Failure / Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmation && (
        <Modal
          isOpen={true}
          onClose={() => {
            setOrderConfirmation(null);
            setActiveView('buyer_orders');
          }}
          title="Consignment Placed Successfully!"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-3xl">🎉</span>
              <h3 className="text-base font-black text-emerald-900">Payment Confirmed with Escrow Lock</h3>
              <p className="text-xs text-emerald-700">Payment processed via Razorpay and secured in VIVAAN Escrow until OTP delivery confirmation.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Order ID:</span>
                <span className="font-mono font-black text-emerald-800 text-sm" id="conf-order-id">{orderConfirmation.orderNumber || orderConfirmation.orderId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Tracking ID:</span>
                <span className="font-mono font-black text-blue-700 text-sm" id="conf-tracking-id">{orderConfirmation.trackingId}</span>
              </div>
              {orderConfirmation.razorpayPaymentId && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Razorpay Payment ID:</span>
                  <span className="font-mono font-black text-slate-700 text-xs" id="conf-payment-id">{orderConfirmation.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Product Amount:</span>
                <span className="font-bold text-slate-900" id="conf-product-amount">₹{orderConfirmation.produceSubtotal || orderConfirmation.productAmount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Delivery Charge:</span>
                <span className="font-bold text-slate-900" id="conf-delivery-charge">₹{orderConfirmation.logisticsFee || orderConfirmation.deliveryCharge}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-900 font-black">Total Amount:</span>
                <span className="font-black text-emerald-800 text-base" id="conf-total-amount">₹{orderConfirmation.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Payment Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[11px]" id="conf-payment-status">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  {orderConfirmation.paymentStatus || 'Successful'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Order Status:</span>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[11px]" id="conf-order-status">
                  {orderConfirmation.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            <Button
              id="view-orders-btn"
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setOrderConfirmation(null);
                setActiveView('buyer_orders');
              }}
              icon={ArrowRight}
            >
              View in My Orders
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
}

