import React from 'react';
import { useApp } from '../../context/AppContext';
import { History, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Badge from '../../components/ui/Badge';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function DriverHistory() {
  const { setActiveView } = useApp();

  const completedTrips = [
    {
      id: 'TRIP-88102',
      date: '2026-09-20',
      farmer: 'Ramasamy Gounder (Omalur)',
      cargo: 'Shallots (250 kg)',
      destination: 'Koyambedu, Chennai',
      payout: '₹420',
      status: 'DELIVERED'
    },
    {
      id: 'TRIP-88094',
      date: '2026-09-18',
      farmer: 'Ramasamy Gounder (Omalur)',
      cargo: 'Ponni Rice (10 Quintal)',
      destination: 'RS Puram, Coimbatore',
      payout: '₹650',
      status: 'DELIVERED'
    },
    {
      id: 'TRIP-88062',
      date: '2026-09-15',
      farmer: 'K. Subramani (Erode)',
      cargo: 'Organic Ginger (80 kg)',
      destination: 'Salem Market',
      payout: '₹280',
      status: 'DELIVERED'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => setActiveView('driver_dashboard')} label="Back to Driver Portal" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Completed Trip History</h1>
          <p className="text-xs text-slate-500">Historical delivery logs and verified driver earnings</p>
        </div>
      </div>

      <Table
        headers={['Trip ID', 'Date', 'Farmgate Origin', 'Cargo', 'Destination', 'Driver Payout', 'Status']}
      >
        {completedTrips.map((trip) => (
          <TableRow key={trip.id}>
            <TableCell className="font-mono font-bold text-slate-800">{trip.id}</TableCell>
            <TableCell className="text-slate-500">{trip.date}</TableCell>
            <TableCell className="font-semibold text-slate-900">{trip.farmer}</TableCell>
            <TableCell>{trip.cargo}</TableCell>
            <TableCell className="text-slate-600">{trip.destination}</TableCell>
            <TableCell className="font-black text-emerald-800">{trip.payout}</TableCell>
            <TableCell>
              <Badge variant="delivered" size="sm">
                {trip.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </Table>

    </div>
  );
}
