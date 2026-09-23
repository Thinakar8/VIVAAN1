import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, ArrowLeft, Package } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Badge from '../../components/ui/Badge';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function AgencyShipments() {
  const { setActiveView, firestoreService } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = firestoreService.subscribeCollection('orders', (ords) => {
      const normalized = ords.map((o) => ({
        id: o.orderNumber || o.id,
        product_name: o.items?.[0]?.title || 'Salem Pure Organic Turmeric (Haldi)',
        quantity: o.items?.[0]?.quantity || 10,
        unit: o.items?.[0]?.unit || 'kg',
        farmer_village: o.farmerVillage || 'Omalur',
        delivery_address: typeof o.deliveryAddress === 'string' ? o.deliveryAddress : `${o.deliveryAddress?.street || 'Adyar'}, ${o.deliveryAddress?.district || 'Chennai'}`,
        driver_name: o.driverName || 'Murugan K',
        logistics_fee: o.logisticsFee || 120,
        order_status: o.status || 'CONFIRMED'
      }));
      setOrders(normalized);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [firestoreService]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => setActiveView('agency_dashboard')} label="Back to Dashboard" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rural Freight Shipments</h1>
          <p className="text-xs text-slate-500">Scheduled farmgate collections and inter-district transport</p>
        </div>
      </div>

      <Table
        headers={['Shipment ID', 'Produce Cargo', 'Farmgate Origin', 'Destination Address', 'Assigned Carrier Driver', 'Logistics Payout', 'Status']}
        isEmpty={orders.length === 0}
        emptyMessage="No shipments dispatched yet."
      >
        {orders.map((ord) => (
          <TableRow key={ord.id}>
            <TableCell className="font-mono font-bold text-sky-800">{ord.id}</TableCell>
            <TableCell className="font-black text-slate-900">{ord.product_name} ({ord.quantity} {ord.unit})</TableCell>
            <TableCell className="text-slate-600">{ord.farmer_village}, Salem</TableCell>
            <TableCell className="text-slate-600">{ord.delivery_address}</TableCell>
            <TableCell className="font-bold text-slate-800">{ord.driver_name || 'Murugan K'}</TableCell>
            <TableCell className="font-black text-emerald-800">₹{ord.logistics_fee || 120}</TableCell>
            <TableCell>
              <Badge variant={ord.order_status === 'DELIVERED' ? 'delivered' : 'in_transit'} size="sm">
                {ord.order_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </Table>

    </div>
  );
}
