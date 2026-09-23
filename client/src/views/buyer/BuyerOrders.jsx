import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldCheck,
  Eye,
  MapPin,
  Truck,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Search,
  Star
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function BuyerOrders() {
  const { setActiveView, setActiveOrderId, firestoreService, addToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 3-Way Feedback & Rating State (Farmer, Agency, Driver)
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [farmerRating, setFarmerRating] = useState(5);
  const [farmerReview, setFarmerReview] = useState('');
  const [agencyRating, setAgencyRating] = useState(5);
  const [agencyReview, setAgencyReview] = useState('');
  const [driverRating, setDriverRating] = useState(5);
  const [driverReview, setDriverReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const unsub = firestoreService.subscribeCollection('orders', (ords) => {
      const normalized = ords.map((o) => {
        // Map any legacy status to standard 4 statuses: Pending, Successful, Failed, Refunded
        let pStatus = o.paymentStatus || 'Successful';
        if (pStatus === 'HELD_IN_ESCROW' || pStatus === 'RELEASED_TO_FARMER') pStatus = 'Successful';
        if (pStatus === 'REFUNDED_TO_BUYER') pStatus = 'Refunded';

        return {
          id: o.orderNumber || o.id,
          orderId: o.orderNumber || o.id,
          trackingId: o.trackingId || `TRK-${(o.orderNumber || o.id).replace('VIV-ORD-', 'VIV-')}`,
          productName: o.items?.map(i => `${i.title} (${i.quantity} ${i.unit || 'kg'})`).join(', ') || o.items?.[0]?.title || 'Salem Pure Organic Turmeric (Haldi)',
          quantity: o.items?.[0]?.quantity || 10,
          unit: o.items?.[0]?.unit || 'kg',
          farmerVillage: o.farmerVillage || 'Omalur',
          farmerDistrict: o.farmerDistrict || 'Salem',
          farmerName: o.farmerName || 'Ramasamy Gounder',
          deliveryAddress: typeof o.deliveryAddress === 'string' ? o.deliveryAddress : `${o.deliveryAddress?.street || 'Adyar'}, ${o.deliveryAddress?.district || 'Chennai'}`,
          productAmount: o.productAmount !== undefined ? o.productAmount : (o.produceSubtotal !== undefined ? o.produceSubtotal : (o.totalAmount ? o.totalAmount - (o.logisticsFee !== undefined ? o.logisticsFee : 120) : 1600)),
          deliveryCharge: o.deliveryCharge !== undefined ? o.deliveryCharge : (o.logisticsFee !== undefined ? o.logisticsFee : 120),
          totalAmount: o.totalAmount || 1720,
          paymentStatus: pStatus, // Strictly one of: Pending | Successful | Failed | Refunded
          razorpayPaymentId: o.razorpayPaymentId || o.payment_id || null,
          razorpayOrderId: o.razorpayOrderId || null,
          orderStatus: o.status || 'CONFIRMED',
          createdAt: o.createdAt || new Date().toISOString(),
          items: o.items || []
        };
      });
      setOrders(normalized);
      if (selectedOrder) {
        const found = normalized.find(o => o.orderId === selectedOrder.orderId);
        if (found) setSelectedOrder(found);
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [firestoreService, selectedOrder?.orderId]);

  // Handler for Razorpay Refund Processing
  const handleInitiateRefund = async (orderId) => {
    setIsRefunding(true);
    try {
      await firestoreService.refundPayment(orderId, 'Buyer requested cancellation / refund');
      addToast('Refund Processed', `Payment for #${orderId} marked as Refunded. Reversal initiated via Razorpay.`);
    } catch (err) {
      addToast('Refund Error', err.message || 'Failed to process refund.', 'error');
    } finally {
      setIsRefunding(false);
    }
  };

  // Handler for 3-Way Feedback Submission (Farmer, Delivery Agency, Driver)
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    setSubmittingRating(true);
    try {
      await firestoreService.submitOrderFeedback({
        orderId: ratingModalOrder.orderId,
        farmerRating,
        farmerReview,
        agencyRating,
        agencyReview,
        driverRating,
        driverReview,
        farmerId: ratingModalOrder.farmerId || 'farmer_1',
        driverId: ratingModalOrder.driverId || 'driver_1',
        agencyId: ratingModalOrder.agencyId || 'agency_1'
      });
      addToast('Feedback Submitted', 'Thank you! Your ratings for Farmer, Delivery Agency, and Driver have been recorded.');
      setRatingModalOrder(null);
    } catch (err) {
      addToast('Submission Failed', err.message || 'Could not submit feedback.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Helper to render distinct status badges for the 4 states
  const renderPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            Successful
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            Failed
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-700" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-900 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('buyer_marketplace')} label="Back to Marketplace" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Farmgate Orders</h1>
            <p className="text-xs text-slate-500">Track and view status of your direct produce consignments with Escrow protection</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveView('buyer_marketplace')}
        >
          Shop More Produce
        </Button>
      </div>

      {/* Search by Tracking ID / Order ID / Product Name */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="buyer-orders-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Tracking ID, Order ID, Produce..."
            className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {orders.filter(o => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            return (
              (o.trackingId && o.trackingId.toLowerCase().includes(q)) ||
              (o.orderId && o.orderId.toLowerCase().includes(q)) ||
              (o.productName && o.productName.toLowerCase().includes(q)) ||
              (o.farmerVillage && o.farmerVillage.toLowerCase().includes(q)) ||
              (o.farmerDistrict && o.farmerDistrict.toLowerCase().includes(q))
            );
          }).length} of {orders.length} Consignments
        </span>
      </div>

      {/* Orders Table */}
      <Table
        headers={[
          'Order ID',
          'Tracking ID',
          'Produce Items',
          'Farmer Village',
          'Farmer District',
          'Product Amount',
          'Delivery Charge',
          'Total Amount',
          'Payment Status',
          'Order Status',
          'Actions'
        ]}
        isEmpty={orders.length === 0}
        emptyMessage="No orders found. Explore fresh produce in the marketplace!"
      >
        {orders
          .filter((ord) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            return (
              (ord.trackingId && ord.trackingId.toLowerCase().includes(q)) ||
              (ord.orderId && ord.orderId.toLowerCase().includes(q)) ||
              (ord.productName && ord.productName.toLowerCase().includes(q)) ||
              (ord.farmerVillage && ord.farmerVillage.toLowerCase().includes(q)) ||
              (ord.farmerDistrict && ord.farmerDistrict.toLowerCase().includes(q))
            );
          })
          .map((ord) => (
          <TableRow key={ord.id}>
            <TableCell className="font-mono font-black text-emerald-800 text-xs">
              {ord.orderId}
            </TableCell>
            <TableCell className="font-mono font-bold text-blue-700 text-xs">
              {ord.trackingId}
            </TableCell>
            <TableCell className="font-semibold text-slate-900 text-xs max-w-xs truncate">
              {ord.productName}
            </TableCell>
            <TableCell className="text-slate-600 text-xs font-medium">
              {ord.farmerVillage || 'Omalur'}
            </TableCell>
            <TableCell className="text-slate-600 text-xs font-medium">
              {ord.farmerDistrict || 'Salem'}
            </TableCell>
            <TableCell className="text-slate-700 text-xs font-bold">
              ₹{ord.productAmount}
            </TableCell>
            <TableCell className="text-slate-700 text-xs font-bold">
              ₹{ord.deliveryCharge}
            </TableCell>
            <TableCell className="font-black text-slate-900 text-xs">
              ₹{ord.totalAmount}
            </TableCell>
            <TableCell>
              {renderPaymentStatusBadge(ord.paymentStatus)}
            </TableCell>
            <TableCell>
              <Badge variant={ord.orderStatus === 'DELIVERED' ? 'delivered' : ord.orderStatus === 'CONFIRMED' ? 'confirmed' : ord.orderStatus === 'CANCELLED' ? 'cancelled' : 'pending'} size="sm">
                {ord.orderStatus}
              </Badge>
            </TableCell>
            <TableCell className="space-x-1.5 whitespace-nowrap">
              <Button
                id={`track-live-order-btn-${ord.orderId}`}
                size="xs"
                variant="primary"
                icon={Navigation}
                onClick={() => {
                  setActiveOrderId(ord.orderId);
                  setActiveView('order_tracking');
                }}
              >
                Live GPS
              </Button>
              <Button
                id={`order-details-track-btn-${ord.orderId}`}
                size="xs"
                variant="outline"
                icon={Eye}
                onClick={() => setSelectedOrder(ord)}
              >
                Track & Details
              </Button>
              {ord.orderStatus === 'DELIVERED' && (
                <Button
                  id={`rate-order-btn-${ord.orderId}`}
                  size="xs"
                  variant="secondary"
                  icon={Star}
                  onClick={() => {
                    setRatingModalOrder(ord);
                    setFarmerRating(5);
                    setFarmerReview('');
                    setAgencyRating(5);
                    setAgencyReview('');
                    setDriverRating(5);
                    setDriverReview('');
                  }}
                  className="bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                >
                  Rate
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* Live Consignment & Tracking Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Consignment #${selectedOrder.orderId}`}
        >
          <div className="space-y-4">
            
            {/* Header Status Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold">Order ID:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">{selectedOrder.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold">Tracking ID:</span>
                <span className="font-mono font-black text-blue-700 text-sm">{selectedOrder.trackingId}</span>
              </div>
              {selectedOrder.razorpayPaymentId && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500">Razorpay ID:</span>
                  <span className="font-mono text-slate-700 text-xs font-bold">{selectedOrder.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            {/* Financial & Status Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Product Amount:</span>
                <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.productAmount}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Delivery Charge:</span>
                <span className="font-bold text-slate-900 text-sm">₹{selectedOrder.deliveryCharge}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block text-[11px] font-bold">Total Amount:</span>
                <span className="font-black text-emerald-900 text-base">₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Payment Status:</span>
                <div className="mt-0.5">
                  {renderPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
              </div>
            </div>

            {selectedOrder.paymentStatus === 'Successful' && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Guarantee:</strong> Payment of ₹{selectedOrder.totalAmount} is secured in VIVAAN Escrow and will be released to the farmer only after OTP delivery confirmation.
                </span>
              </div>
            )}

            {selectedOrder.paymentStatus === 'Refunded' && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-2 text-xs text-purple-950">
                <RotateCcw className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Refund Completed:</strong> ₹{selectedOrder.totalAmount} has been reversed via Razorpay to your source payment account.
                </span>
              </div>
            )}

            {selectedOrder.paymentStatus === 'Failed' && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 text-xs text-rose-950">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Payment Failed:</strong> Transaction was not completed. No funds were debited.
                </span>
              </div>
            )}

            {/* Delivery Tracking Journey */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                Live Logistics Progress
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                  <div>
                    <span className="font-bold text-slate-900 block">Order Confirmed & Farm Packaged</span>
                    <span className="text-[11px] text-slate-500">{selectedOrder.farmerVillage}, {selectedOrder.farmerDistrict}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                  <div>
                    <span className="font-bold text-slate-900 block">Logistics Partner Assigned</span>
                    <span className="text-[11px] text-slate-500">Driver Murugan K (TN-24-AZ-8120)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</div>
                  <div>
                    <span className="font-bold text-slate-900 block">In Transit to Destination</span>
                    <span className="text-[11px] text-slate-500">{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Live Telemetry, Refund, and Close */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                id="open-live-telemetry-btn"
                variant="primary"
                size="md"
                fullWidth
                icon={Navigation}
                onClick={() => {
                  setActiveOrderId(selectedOrder.orderId);
                  setSelectedOrder(null);
                  setActiveView('order_tracking');
                }}
              >
                Open Live GPS Telemetry View
              </Button>

              <div className="flex gap-2">
                {selectedOrder.paymentStatus === 'Successful' && selectedOrder.orderStatus !== 'DELIVERED' && (
                  <Button
                    id="initiate-refund-btn"
                    variant="outline"
                    size="sm"
                    disabled={isRefunding}
                    onClick={() => handleInitiateRefund(selectedOrder.orderId)}
                    className="text-purple-700 border-purple-200 hover:bg-purple-50"
                    icon={RotateCcw}
                  >
                    {isRefunding ? 'Processing Refund...' : 'Request Razorpay Refund'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth={selectedOrder.paymentStatus !== 'Successful' || selectedOrder.orderStatus === 'DELIVERED'}
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* 3-Way Feedback Modal: Farmer, Delivery Agency, Driver */}
      {ratingModalOrder && (
        <Modal
          isOpen={true}
          onClose={() => setRatingModalOrder(null)}
          title={`Rate Consignment #${ratingModalOrder.orderId}`}
        >
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <p className="text-xs text-slate-500">
              Provide feedback for the producer, delivery agency, and driver to help improve quality and reliability across the platform.
            </p>

            {/* 1. Farmer Rating */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-950 text-xs">🌾 Farmer: {ratingModalOrder.farmerName || 'Ramasamy Gounder'}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFarmerRating(star)}
                      className={`text-base p-0.5 cursor-pointer transition-colors ${star <= farmerRating ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Farmer feedback (e.g. Freshness, Sorting, Moisture)..."
                value={farmerReview}
                onChange={(e) => setFarmerReview(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-emerald-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* 2. Delivery Agency Rating */}
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-sky-950 text-xs">🏢 Delivery Agency: GreenCorridor Logistics</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setAgencyRating(star)}
                      className={`text-base p-0.5 cursor-pointer transition-colors ${star <= agencyRating ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Agency feedback (e.g. Cold-chain transit, Handling)..."
                value={agencyReview}
                onChange={(e) => setAgencyReview(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-sky-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* 3. Driver Rating */}
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-950 text-xs">🚚 Driver: {ratingModalOrder.driverName || 'Murugan K'}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setDriverRating(star)}
                      className={`text-base p-0.5 cursor-pointer transition-colors ${star <= driverRating ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Driver feedback (e.g. Timeliness, Doorstep OTP handover)..."
                value={driverReview}
                onChange={(e) => setDriverReview(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-purple-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setRatingModalOrder(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submittingRating}>
                {submittingRating ? 'Submitting...' : 'Submit 3-Way Feedback'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

