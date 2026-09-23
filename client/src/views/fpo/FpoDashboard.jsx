import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  Sprout,
  Package,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Truck,
  ArrowRight,
  Layers,
  FileCheck,
  Share2,
  Calendar,
  Sparkles
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatWidget from '../../components/ui/StatWidget';

export default function FpoDashboard() {
  const { setActiveView, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'members' | 'dispatches' | 'payouts'

  // FPO Profile Information
  const fpoInfo = {
    name: 'Cauvery Delta Agro Farmers Producer Company Limited',
    regNo: 'FPO-TN-2023-4819',
    cin: 'U01111TN2023PTC158912',
    incorporationDate: '14 Feb 2023',
    hubLocation: 'NH-44 Agri Corridor Hub, Muthampatty, Salem - 636455',
    district: 'Salem & Thanjavur Agro Belt',
    state: 'Tamil Nadu',
    ceo: 'Er. S. Thirunavukkarasu (Managing Director)',
    contact: '+91 94432 77810',
    totalMembers: 142,
    totalAcres: 485,
    coldStorageCapacity: '250 Metric Tonnes'
  };

  // 1. Collective Harvest Inventory (Aggregated from members)
  const [pooledProduce, setPooledProduce] = useState([
    {
      id: 'LOT-TUR-2026-01',
      title: 'Salem Pure Curcuma Turmeric (Co-1 & BSR-2)',
      totalQtyTonnes: 4.8,
      contributingFarmers: 18,
      pricePerKg: 175,
      mandiPricePerKg: 128,
      spreadPercent: '+36.7%',
      harvestDate: '18 Sep 2026',
      availability: 'Ready in Central Cold-Hub',
      qualityGrade: 'A-Grade (Curcumin > 5.2%)',
      status: 'AVAILABLE'
    },
    {
      id: 'LOT-ONN-2026-02',
      title: 'Country Small Shallots (Co-5 Sambar Onions)',
      totalQtyTonnes: 6.2,
      contributingFarmers: 24,
      pricePerKg: 62,
      mandiPricePerKg: 44,
      spreadPercent: '+40.9%',
      harvestDate: '20 Sep 2026',
      availability: 'Sorted & Aerated Jute Sacks',
      qualityGrade: 'Standard 25-30mm Bulbs',
      status: 'AVAILABLE'
    },
    {
      id: 'LOT-PAD-2026-03',
      title: 'Traditional Ponni Boiled Paddy Harvest',
      totalQtyTonnes: 12.5,
      contributingFarmers: 32,
      pricePerKg: 34,
      mandiPricePerKg: 26,
      spreadPercent: '+30.7%',
      harvestDate: '15 Sep 2026',
      availability: 'Moisture Controlled (12% RH)',
      qualityGrade: 'Certified A-Grade Paddy',
      status: 'RESERVED'
    },
    {
      id: 'LOT-GAR-2026-04',
      title: 'Kodaikanal Hill Garlic (GI Tagged Smoked)',
      totalQtyTonnes: 1.4,
      contributingFarmers: 8,
      pricePerKg: 280,
      mandiPricePerKg: 210,
      spreadPercent: '+33.3%',
      harvestDate: '19 Sep 2026',
      availability: 'Cured & Mesh Bundled',
      qualityGrade: 'High Allicin Medical Grade',
      status: 'AVAILABLE'
    }
  ]);

  // 2. Member Farmers Roster
  const memberFarmers = [
    { id: 'VIV-FR-104582', name: 'Ramasamy Gounder', village: 'Muthampatty, Omalur', acres: 5.5, primaryCrop: 'Salem Turmeric', shares: 100, dbtAccount: 'SBI •••• 4891', verified: true },
    { id: 'VIV-FR-108219', name: 'Murugesan Perumal', village: 'Tharamangalam', acres: 4.2, primaryCrop: 'Small Shallots', shares: 80, dbtAccount: 'Canara •••• 1204', verified: true },
    { id: 'VIV-FR-109481', name: 'Chinnasamy V', village: 'Mecheri', acres: 7.0, primaryCrop: 'Ponni Paddy', shares: 120, dbtAccount: 'IOB •••• 9921', verified: true },
    { id: 'VIV-FR-110294', name: 'Annamalai K', village: 'Jalakandapuram', acres: 3.8, primaryCrop: 'Red Banana & Papaya', shares: 60, dbtAccount: 'Indian Bank •••• 7712', verified: true },
    { id: 'VIV-FR-112830', name: 'Palanisamy N', village: 'Omalur West', acres: 6.5, primaryCrop: 'Organic Vegetables', shares: 100, dbtAccount: 'TMB •••• 5541', verified: true }
  ];

  // 3. Bulk Institutional Offtake Contracts
  const bulkDispatches = [
    { id: 'FPO-ORD-9901', buyer: 'Heritage Retail Organics Pvt Ltd', items: 'Salem Turmeric (2,000 kg)', totalAmount: 350000, carrier: 'GreenCorridor Express (Eicher 16T)', status: 'IN_TRANSIT', eta: 'Tomorrow 08:00 AM' },
    { id: 'FPO-ORD-9902', buyer: 'Spices Board Wholesale Consortium', items: 'Hill Garlic (1,000 kg)', totalAmount: 280000, carrier: 'VIVAAN State Logistics', status: 'CONFIRMED', eta: 'Dispatch in 24 Hrs' },
    { id: 'FPO-ORD-9903', buyer: 'Adyar Institutional Kitchen Collective', items: 'Shallots & Vegetables (3,500 kg)', totalAmount: 217000, carrier: 'Mahindra Bolero Maxi-Truck', status: 'DELIVERED', eta: 'Delivered (Escrow Released)' }
  ];

  const handlePoolNewBatch = () => {
    addToast('Aggregate Harvest Batch', 'New collective lot registered into FPO warehouse reserve.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('role_select')} label="Back to Roles" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <span>{fpoInfo.name}</span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">{fpoInfo.regNo}</span>
              <span>• {fpoInfo.district} • Direct Producer Aggregator</span>
            </p>
          </div>
        </div>

        <Badge variant="verified" size="md">
          ✓ Govt Registered FPO
        </Badge>
      </div>

      {/* FPO Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300/60">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              Collective Bargaining Power
            </span>
            <span className="text-xs text-amber-200 font-mono">142 Member Cultivators Pooled</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Direct Farmgate Aggregation & Wholesale Mandi Dispatches
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Eliminating local village commission agents and loan sharks by pooling smallholder harvest into certified commercial tonnage, securing +35% higher prices with direct bank transfers to member farmers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Button
            id="fpo-pool-batch-btn"
            variant="accent"
            size="md"
            icon={PlusCircle}
            onClick={handlePoolNewBatch}
          >
            Pool New Harvest Batch
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Building2}
            onClick={() => addToast('FPO Profile', 'CIN: ' + fpoInfo.cin + ' • Hub: ' + fpoInfo.hubLocation)}
          >
            FPO Bylaws & Registry
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatWidget
          title="Member Farmers"
          value="142"
          subtitle="Verified Farmer IDs"
          icon={Users}
          color="emerald"
        />
        <StatWidget
          title="Land Bank"
          value="485 Acres"
          subtitle="Pooled Cultivation"
          icon={Sprout}
          color="emerald"
        />
        <StatWidget
          title="Pooled Produce"
          value="24.9 MT"
          subtitle="Ready for Offtake"
          icon={Package}
          color="sky"
        />
        <StatWidget
          title="Bulk Contracts"
          value="3 Active"
          subtitle="Institutional Buyers"
          icon={Truck}
          color="amber"
        />
        <StatWidget
          title="Escrow Disbursed"
          value="₹8,47,000"
          subtitle="100% Direct DBT"
          icon={DollarSign}
          color="emerald"
        />
        <StatWidget
          title="Broker Cut Saved"
          value="₹2,18,400"
          subtitle="+34.8% Member Gain"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'inventory', label: '1. Collective Harvest Batches', icon: Package },
          { id: 'members', label: '2. Member Farmers Roster (142)', icon: Users },
          { id: 'dispatches', label: '3. Bulk Institutional Offtake', icon: Truck },
          { id: 'payouts', label: '4. Member DBT Revenue Settlements', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`fpo-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COLLECTIVE HARVEST BATCHES */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-base font-black text-slate-900">Collective Harvest Inventory Ready for Offtake</h3>
              <p className="text-xs text-slate-500">Graded, certified and moisture-tested bulk commodities stored at FPO central hub</p>
            </div>
            <Badge variant="district" size="sm">
              Cold Storage Active
            </Badge>
          </CardHeader>
          <Table
            headers={['Lot ID', 'Commodity Title', 'Total Tonnage', 'Contributing Members', 'FPO Bulk Rate', 'Mandi Comparison', 'Status', 'Actions']}
            isEmpty={pooledProduce.length === 0}
          >
            {pooledProduce.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell className="font-mono font-bold text-emerald-800 text-xs">{lot.id}</TableCell>
                <TableCell>
                  <span className="font-black text-slate-900 text-xs block">{lot.title}</span>
                  <span className="text-[10px] text-slate-500">{lot.qualityGrade} • {lot.availability}</span>
                </TableCell>
                <TableCell className="font-bold text-slate-900 text-xs">{lot.totalQtyTonnes} MT ({lot.totalQtyTonnes * 1000} kg)</TableCell>
                <TableCell className="text-slate-600 text-xs">{lot.contributingFarmers} Farmers</TableCell>
                <TableCell className="font-black text-emerald-800 text-xs">₹{lot.pricePerKg} / kg</TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-slate-500 line-through">₹{lot.mandiPricePerKg}</span>{' '}
                  <span className="text-xs font-black text-emerald-700">{lot.spreadPercent}</span>
                </TableCell>
                <TableCell>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    lot.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {lot.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => addToast('Dispatch Lot', `Initiated bulk dispatch matching for ${lot.id}`)}
                  >
                    Dispatch Lot
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 2: MEMBER FARMERS ROSTER */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-base font-black text-slate-900">Member Farmers Directory (142 Cultivators)</h3>
              <p className="text-xs text-slate-500">Shareholders with government verified Patta land records and direct escrow accounts</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={FileCheck}
              onClick={() => addToast('Registry Exported', '142 Member records synced with State Agri Ministry.')}
            >
              Export KYC Registry
            </Button>
          </CardHeader>
          <Table
            headers={['Farmer ID', 'Member Farmer Name', 'Village / Taluk', 'Land Extent', 'Primary Commodity', 'FPO Shares', 'Direct DBT Account', 'KYC Audit']}
            isEmpty={memberFarmers.length === 0}
          >
            {memberFarmers.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono font-bold text-emerald-800 text-xs">{f.id}</TableCell>
                <TableCell className="font-black text-slate-900 text-xs">{f.name}</TableCell>
                <TableCell className="text-slate-600 text-xs">{f.village}</TableCell>
                <TableCell className="font-semibold text-slate-800 text-xs">{f.acres} Acres</TableCell>
                <TableCell className="font-medium text-slate-700 text-xs">{f.primaryCrop}</TableCell>
                <TableCell className="font-mono text-slate-900 text-xs">{f.shares} Shares</TableCell>
                <TableCell className="font-mono text-slate-600 text-xs">{f.dbtAccount}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                    ✓ Verified Patta
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 3: BULK INSTITUTIONAL DISPATCHES */}
      {activeTab === 'dispatches' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-base font-black text-slate-900">Bulk Institutional Offtake Orders</h3>
              <p className="text-xs text-slate-500">Commercial supply contracts with guaranteed cold-chain delivery corridors</p>
            </div>
            <Badge variant="verified" size="sm">
              Escrow Secured
            </Badge>
          </CardHeader>
          <Table
            headers={['Order ID', 'Institutional Buyer', 'Consignment Details', 'Contract Value', 'Carrier Assigned', 'Status / ETA']}
            isEmpty={bulkDispatches.length === 0}
          >
            {bulkDispatches.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono font-bold text-sky-800 text-xs">{d.id}</TableCell>
                <TableCell className="font-black text-slate-900 text-xs">{d.buyer}</TableCell>
                <TableCell className="text-slate-700 text-xs">{d.items}</TableCell>
                <TableCell className="font-black text-slate-900 text-xs">₹{d.totalAmount.toLocaleString('en-IN')}</TableCell>
                <TableCell className="font-medium text-slate-600 text-xs">{d.carrier}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase block ${
                    d.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {d.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{d.eta}</span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 4: MEMBER DBT REVENUE SETTLEMENTS */}
      {activeTab === 'payouts' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-base font-black text-slate-900">Direct Bank Transfer (DBT) Revenue Distribution</h3>
              <p className="text-xs text-slate-500">Net proceeds automatically disbursed to contributing farmers after wholesale delivery</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-mono font-bold text-xs border border-emerald-200">
              Zero Commission Retained
            </span>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <b className="text-sm block">VIVAAN Automated Escrow-to-DBT Pipeline:</b>
                <span className="text-[11px] text-emerald-800">
                  When wholesale buyer confirms delivery, the Razorpay Escrow engine splits 98% directly to member bank accounts and 2% to FPO operational reserves.
                </span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => addToast('DBT Run Triggered', 'Disbursed ₹3,50,000 across 18 contributing turmeric farmers.')}
              >
                Execute Payout Run
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Gross Inflow</span>
                <span className="text-xl font-black text-slate-900 block mt-1">₹8,47,000</span>
                <span className="text-[11px] text-emerald-700 font-semibold">100% Cleared via Escrow</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Direct Member DBT Payouts</span>
                <span className="text-xl font-black text-emerald-800 block mt-1">₹8,30,060</span>
                <span className="text-[11px] text-slate-500">98.0% disbursed to farmers</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">FPO Reserve & Maintenance</span>
                <span className="text-xl font-black text-sky-800 block mt-1">₹16,940</span>
                <span className="text-[11px] text-slate-500">2.0% cold-hub operating fee</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  );
}
