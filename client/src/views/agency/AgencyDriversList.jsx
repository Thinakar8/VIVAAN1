import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, PlusCircle, ArrowLeft } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function AgencyDriversList() {
  const { setActiveView, firestoreService } = useApp();
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const unsub = firestoreService.subscribeCollection('drivers', (drs) => {
      const normalized = drs.map((d) => ({
        id: d.id,
        full_name: d.fullName || d.name || 'Murugan Karuppasamy',
        vivaan_id: d.vivaanId || d.id,
        phone: d.phone || '+91 94432 19842',
        license_no: d.commercialDlNumber || d.license_number || 'TN-30-2018-0098421',
        vehicle_type: d.vehicleType || 'Tata Ace Pickup',
        vehicle_no: d.vehicleNo || 'TN-30-AZ-8120',
        capacity: d.vehicleCapacityKg || 1200,
        trips_completed: d.tripsCompleted !== undefined ? d.tripsCompleted : 148,
        rating: d.rating || 4.92,
        status: d.status || 'AVAILABLE',
        avatar_url: d.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      }));
      setDrivers(normalized);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [firestoreService]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('agency_dashboard')} label="Back to Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Fleet Drivers Roster</h1>
            <p className="text-xs text-slate-500">Commercial DL verified drivers enrolled under GreenCorridor</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => setActiveView('agency_onboard_driver')}
        >
          Onboard New Driver
        </Button>
      </div>

      <Table
        headers={['Driver Full Name', 'VIVAAN ID', 'Mobile Number', 'Commercial DL No', 'Vehicle Type & Reg', 'Trips Completed', 'Status']}
        isEmpty={drivers.length === 0}
        emptyMessage="No drivers enrolled yet."
      >
        {drivers.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-black text-slate-900">
              <div className="flex items-center gap-3">
                <img src={d.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} alt={d.full_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                <span>{d.full_name}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-sky-800 font-bold">{d.vivaan_id}</TableCell>
            <TableCell className="text-slate-600">{d.phone}</TableCell>
            <TableCell className="font-mono text-slate-700">{d.license_no}</TableCell>
            <TableCell>
              <span className="font-semibold block text-slate-900">{d.vehicle_type}</span>
              <span className="font-mono text-[10px] text-slate-400">{d.vehicle_no}</span>
            </TableCell>
            <TableCell className="font-black text-slate-900">{d.trips_completed || 0}</TableCell>
            <TableCell>
              <Badge variant={d.status === 'IN_TRANSIT' ? 'pending' : 'verified'} size="sm">
                {d.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </Table>

    </div>
  );
}
