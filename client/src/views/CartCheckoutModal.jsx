import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

export default function CartCheckoutModal() {
  const { cart, removeFromCart, addToCart, clearCart, user, addToast, setActiveView, setActiveOrderId } = useApp();

  const [deliveryAddress, setDeliveryAddress] = useState('Flat 4B, Greenview Apartments, 2nd Avenue, Adyar');
  const [deliveryDistrict, setDeliveryDistrict] = useState('Chennai');
  const [deliveryState, setDeliveryState] = useState('Tamil Nadu');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const produceSubtotal = cart.reduce((sum, item) => sum + (item.price_per_unit * item.quantity), 0);
  const logisticsFee = cart.length > 0 ? 120 : 0;
  const platformFee = Math.round(produceSubtotal * 0.015);
  const grandTotal = produceSubtotal + logisticsFee + platformFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // Step 1: Create payment intent
      const pRes = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: grandTotal })
      });
      const pData = await pRes.json();

      // Step 2: Create multi-farmer order in VIVAAN system
      const oRes = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user?.id || 10,
          buyer_name: user?.name || 'Aditi Sharma',
          buyer_phone: user?.phone || '+919841234567',
          items: cart,
          delivery_address: deliveryAddress,
          delivery_district: deliveryDistrict,
          delivery_state: deliveryState,
          payment_method: paymentMethod,
          payment_id: pData.razorpay_order_id || `pay_${Date.now()}`
        })
      });
      const oData = await oRes.json();

      if (oData.success) {
        addToast('Payment Successful & Escrow Secured', `Order ${oData.order.id} placed! Funds are held safely in VIVAAN Escrow.`);
        clearCart();
        setActiveOrderId(oData.order.id);
        setActiveView('tracking');
      } else {
        addToast('Error', oData.error || 'Failed to place order', 'error');
      }
    } catch (err) {
      addToast('Error', 'Network error placing order.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          🛒
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore the fresh farmgate marketplace and support verified farmers directly.
        </p>
        <button
          onClick={() => setActiveView('marketplace')}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-2xl shadow-md"
        >
          Browse Fresh Produce
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Direct Farmer Cart & Checkout</h1>
          <p className="text-xs text-slate-500">Multi-Farmer order consolidation with Escrow security</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items & Address */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Produce List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Selected Produce ({cart.length} items)
            </h3>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product_id} className="py-4 flex items-center justify-between gap-4">
                  <img
                    src={item.photo_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150'}
                    alt={item.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Farmer: <b className="text-emerald-800">{item.farmer_name}</b> ({item.village})
                    </p>
                    <div className="text-xs font-bold text-slate-900">
                      ₹{item.price_per_unit} / {item.unit}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => addToCart(item, -1)}
                      disabled={item.quantity <= 1}
                      className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="p-1 rounded-lg hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      ₹{item.price_per_unit * item.quantity}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-rose-500 hover:text-rose-700 p-1 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Delivery Destination
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">District</label>
                  <input
                    type="text"
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">State</label>
                  <input
                    type="text"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Serviceability Corridor Badge */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-950">Logistics Corridor: Intra-State Rural Transit</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Serviceable (24h)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Escrow Guarantee */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Payment & Settlement
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Produce Value:</span>
                <span className="font-bold text-slate-900">₹{produceSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Logistics & Rural Transit:</span>
                <span className="font-bold text-slate-900">₹{logisticsFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>VIVAAN Platform & Escrow Fee (1.5%):</span>
                <span className="font-bold text-slate-900">₹{platformFee}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-base text-emerald-800">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚡ UPI / QR (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  💳 Debit / Credit Card
                </button>
              </div>
            </div>

            {/* Escrow Guarantee Callout */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-1 text-amber-950">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>VIVAAN Smart Escrow Protection</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your payment is held in escrow and disbursed to the farmer & delivery driver <b>ONLY after</b> you provide your 4-digit OTP at doorstep.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>{isProcessing ? 'Securing Escrow Payment...' : `Pay ₹${grandTotal} via Razorpay`}</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
