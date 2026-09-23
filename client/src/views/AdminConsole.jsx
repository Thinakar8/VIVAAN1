import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BackButton from '../components/ui/BackButton';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Sprout,
  Truck,
  CreditCard,
  CheckCircle,
  FileCheck,
  RefreshCw,
  Scale,
  Star,
  Navigation,
  MapPin,
  Eye,
  Building2,
  UserCheck,
  MessageSquare,
  AlertCircle,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Table, { TableRow, TableCell } from '../components/ui/Table';

export default function AdminConsole() {
  const { addToast, setActiveView, setActiveOrderId } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'farmers' | 'carriers' | 'orders' | 'users_feedback'

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Demo Price Monitoring Benchmarks (Req 28: Price monitoring)
  const priceBenchmarks = [
    { commodity: 'Salem Organic Turmeric (GI Grade)', mandiPrice: 220, farmgatePrice: 160, farmerPremium: '+35%', buyerSaving: '27.2%', trend: 'BULLISH' },
    { commodity: 'Country Small Shallots (Co-5)', mandiPrice: 95, farmgatePrice: 68, farmerPremium: '+40%', buyerSaving: '28.4%', trend: 'SURGE' },
    { commodity: 'Salem White Garlic', mandiPrice: 190, farmgatePrice: 140, farmerPremium: '+32%', buyerSaving: '26.3%', trend: 'STABLE' },
    { commodity: 'Fresh Green Moringa Pods', mandiPrice: 65, farmgatePrice: 48, farmerPremium: '+30%', buyerSaving: '26.1%', trend: 'STABLE' },
    { commodity: 'Ratnagiri Alphonso Mango', mandiPrice: 850, farmgatePrice: 620, farmerPremium: '+38%', buyerSaving: '27.0%', trend: 'HIGH_DEMAND' }
  ];

  // Feedback & Reports Repository (Req 28: Feedback / reports)
  const feedbackReports = [
    {
      id: 'FB-101',
      orderId: 'VIV-ORD-88120',
      buyer: 'Aditi Sharma (Adyar, Chennai)',
      targetType: 'FARMER',
      targetName: 'Ramasamy Gounder',
      rating: 5,
      review: 'Turmeric fingers arrived golden and highly fragrant. Excellent sorting and moisture curing.',
      status: 'APPROVED'
    },
    {
      id: 'FB-102',
      orderId: 'VIV-ORD-88120',
      buyer: 'Aditi Sharma (Adyar, Chennai)',
      targetType: 'DELIVERY_AGENCY',
      targetName: 'GreenCorridor Logistics',
      rating: 5,
      review: 'Same-day cold chain dispatch from Salem depot. No bruising or temperature fluctuations.',
      status: 'APPROVED'
    },
    {
      id: 'FB-103',
      orderId: 'VIV-ORD-88120',
      buyer: 'Aditi Sharma (Adyar, Chennai)',
      targetType: 'DRIVER',
      targetName: 'Murugan K',
      rating: 5,
      review: 'Driver was punctual, verified the delivery with OTP promptly, and handled crates with care.',
      status: 'APPROVED'
    },
    {
      id: 'FB-104',
      orderId: 'VIV-ORD-90214',
      buyer: 'Karthik Raja (Coimbatore)',
      targetType: 'FARMER',
      targetName: 'Harpreet Singh',
      rating: 5,
      review: 'Premium Basmati grain quality. Direct packaging saved us retail markup.',
      status: 'APPROVED'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Back Navigation & Status */}
      <div className="flex items-center justify-between">
        <BackButton onClick={() => setActiveView('role_select')} label="Back to Portals" />
        <span className="text-xs font-mono font-bold text-slate-400">VIVAAN National Operations Gateway &bull; Multi-Domain Console</span>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-3xl">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-400 text-purple-950 font-black text-xs uppercase tracking-wider">
                System Administrator
              </span>
              <span className="text-amber-300 font-mono font-bold text-sm">VIV-AD-0001</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">VIVAAN National Operations Console</h1>
            <p className="text-xs text-slate-300">
              National Market Oversight &bull; Land Patta Audit &bull; Logistics & Escrow Vault Settlement Ledger
            </p>
          </div>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Navigation Tabs (All 10 Areas of Requirement 28) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📊 Overview & Price Monitoring
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'farmers'
              ? 'bg-white text-emerald-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌾 Farmer & Land Verification
        </button>

        <button
          onClick={() => setActiveTab('carriers')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'carriers'
              ? 'bg-white text-sky-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🚚 Agency & Driver Verification
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white text-purple-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📦 Orders, Delivery & Escrow
        </button>

        <button
          onClick={() => setActiveTab('users_feedback')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'users_feedback'
              ? 'bg-white text-amber-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👥 User Directory & Feedback Desk
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & PRICE MONITORING (Req 28: Overview & Price Monitoring) */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* KPI Stat Widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Farmer Direct Earnings</span>
              <h3 className="text-2xl font-black text-emerald-800">
                ₹{stats?.stats?.total_farmer_direct_earnings_inr?.toLocaleString() || '18,400'}
              </h3>
              <span className="text-[11px] text-emerald-600 font-semibold">100% Payout without middlemen cuts</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Middlemen Cuts Eliminated</span>
              <h3 className="text-2xl font-black text-amber-600">
                ₹{stats?.stats?.middleman_commission_eliminated_inr?.toLocaleString() || '6,992'}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Saved directly for producers & consumers</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrow Vault Liquidity</span>
              <h3 className="text-2xl font-black text-sky-800">
                ₹{stats?.stats?.current_escrow_pool_inr?.toLocaleString() || '1,750'}
              </h3>
              <span className="text-[11px] text-sky-600 font-semibold">Held securely until doorstep OTP verification</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Ecosystem Network</span>
              <h3 className="text-2xl font-black text-slate-900">
                {stats?.stats?.total_farmers || 4} Farmers &bull; {stats?.stats?.total_agencies || 3} Carriers
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Verified across 4 Agricultural States</span>
            </div>
          </div>

          {/* Price Monitoring Desk (Req 28: Price monitoring) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">APMC Mandi vs VIVAAN Farmgate Price Monitor</h3>
                  <p className="text-xs text-slate-500">Live commodity price surveillance ensuring fair farmer net and buyer savings</p>
                </div>
              </div>
              <Badge variant="verified" size="sm">
                Live Heuristics Active
              </Badge>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Agricultural Produce', 'APMC Mandi Benchmark', 'VIVAAN Farmgate Price', 'Farmer Direct Premium', 'Buyer Direct Saving', 'Price Trend']}
                isEmpty={false}
              >
                {priceBenchmarks.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-black text-slate-900 text-xs">{p.commodity}</TableCell>
                    <TableCell className="text-slate-500 line-through text-xs font-mono">₹{p.mandiPrice}/unit</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-800 text-xs">₹{p.farmgatePrice}/unit</TableCell>
                    <TableCell className="text-emerald-700 font-bold text-xs">{p.farmerPremium}</TableCell>
                    <TableCell className="text-blue-700 font-bold text-xs">{p.buyerSaving}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800">
                        {p.trend}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardBody>
          </Card>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FARMER VERIFICATION (Req 28: Farmer verification) */}
      {/* ======================================================== */}
      {activeTab === 'farmers' && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Farmer Land Records & Patta Audit Desk</h3>
                <p className="text-xs text-slate-500">
                  Verification of Own Land, Leased with Agreement (Agreement &rarr; Landowner &rarr; Patta &rarr; Survey &rarr; Farmer), and Leased with Consent
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl">
              100% Zero Fake Profiles
            </span>
          </CardHeader>

          <CardBody className="p-0 overflow-x-auto">
            <Table
              headers={['Farmer Name', 'VIVAAN ID', 'State / District', 'Survey & Sub-div', 'Patta / Record No', 'Tenure & Extent', 'Audit Status', 'Actions']}
              isEmpty={false}
            >
              <TableRow>
                <TableCell className="font-bold text-slate-900 text-xs">Ramasamy Gounder</TableCell>
                <TableCell className="font-mono text-emerald-700 font-bold text-xs">VIV-FR-104582</TableCell>
                <TableCell className="text-slate-600 text-xs">Tamil Nadu / Salem</TableCell>
                <TableCell className="font-mono text-xs">142 / 2B</TableCell>
                <TableCell className="font-mono text-slate-800 text-xs">PAT-4821/2021</TableCell>
                <TableCell className="font-semibold text-xs">5.5 Acres (Own Land)</TableCell>
                <TableCell>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    ✓ Verified
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="outline" onClick={() => addToast('Audit Confirmed', 'Patta record PAT-4821/2021 matched Tamil Nilam database.')}>
                    Audit Land
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-bold text-slate-900 text-xs">Harpreet Singh</TableCell>
                <TableCell className="font-mono text-emerald-700 font-bold text-xs">VIV-FR-208914</TableCell>
                <TableCell className="text-slate-600 text-xs">Punjab / Ludhiana</TableCell>
                <TableCell className="font-mono text-xs">38 / 1A</TableCell>
                <TableCell className="font-mono text-slate-800 text-xs">JAM-8821/2020</TableCell>
                <TableCell className="font-semibold text-xs">12 Acres (Own Land)</TableCell>
                <TableCell>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    ✓ Verified
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="outline" onClick={() => addToast('Audit Confirmed', 'Jamabandi record JAM-8821/2020 verified.')}>
                    Audit Land
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-bold text-slate-900 text-xs">Dattatray Patil</TableCell>
                <TableCell className="font-mono text-emerald-700 font-bold text-xs">VIV-FR-301275</TableCell>
                <TableCell className="text-slate-600 text-xs">Maharashtra / Ratnagiri</TableCell>
                <TableCell className="font-mono text-xs">89 / 4C</TableCell>
                <TableCell className="font-mono text-slate-800 text-xs">7-12-EXT-992</TableCell>
                <TableCell className="font-semibold text-xs">6.5 Acres (Leased with Agreement)</TableCell>
                <TableCell>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    ✓ Agreement Chain Verified
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="outline" onClick={() => addToast('Audit Confirmed', 'Agreement → Landowner → Patta chain fully validated.')}>
                    Audit Land
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-bold text-slate-900 text-xs">Suresh Patel</TableCell>
                <TableCell className="font-mono text-emerald-700 font-bold text-xs">VIV-FR-407891</TableCell>
                <TableCell className="text-slate-600 text-xs">Gujarat / Anand</TableCell>
                <TableCell className="font-mono text-xs">215 / 1</TableCell>
                <TableCell className="font-mono text-slate-800 text-xs">GUJ-PAT-1188</TableCell>
                <TableCell className="font-semibold text-xs">3.5 Acres (Consent Flow - VAO)</TableCell>
                <TableCell>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    ✓ Consent & VAO Verified
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="xs" variant="outline" onClick={() => addToast('Audit Confirmed', 'Landowner SMS OTP & VAO reference validated.')}>
                    Audit Land
                  </Button>
                </TableCell>
              </TableRow>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AGENCY & DRIVER VERIFICATION (Req 28: Agency & Driver verification) */}
      {/* ======================================================== */}
      {activeTab === 'carriers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Delivery Agencies Verification */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-900 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Delivery Agency Verification Desk</h3>
                  <p className="text-xs text-slate-500">Corporate logistics license, GSTIN, cold chain certifications, and warehouse coverage</p>
                </div>
              </div>
              <Badge variant="verified" size="sm">Audited Carriers</Badge>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Agency Name', 'Agency ID', 'Corporate Hub', 'Fleet Size', 'Cold-Chain Rating', 'Classification', 'Audit Status', 'Actions']}
                isEmpty={false}
              >
                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">GreenCorridor Agro Logistics</TableCell>
                  <TableCell className="font-mono font-bold text-sky-800 text-xs">VIV-AG-104582</TableCell>
                  <TableCell className="text-slate-600 text-xs">Guindy Hub, Chennai</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">14 Vehicles</TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">★ 4.9</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">GREEN &bull; State Level</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">✓ Active License</span></TableCell>
                  <TableCell>
                    <Button size="xs" variant="outline" onClick={() => addToast('Agency Verified', 'GreenCorridor Agro Logistics license active.')}>Audit</Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Kongu Freight Express</TableCell>
                  <TableCell className="font-mono font-bold text-sky-800 text-xs">VIV-AG-201944</TableCell>
                  <TableCell className="text-slate-600 text-xs">Omalur Depot, Salem</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">8 Vehicles</TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">★ 4.8</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">GREEN &bull; Regional</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">✓ Active License</span></TableCell>
                  <TableCell>
                    <Button size="xs" variant="outline" onClick={() => addToast('Agency Verified', 'Kongu Freight Express license active.')}>Audit</Button>
                  </TableCell>
                </TableRow>
              </Table>
            </CardBody>
          </Card>

          {/* Driver Verification Desk */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-900 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Driver Carrier Verification Desk</h3>
                  <p className="text-xs text-slate-500">Commercial driving license, RC book, police background check, and vehicle classification</p>
                </div>
              </div>
              <Badge variant="verified" size="sm">5 Vetted Drivers</Badge>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Driver Name', 'Driver ID', 'DL Number', 'Vehicle Type', 'Vehicle Number', 'Rating', 'Vetting Status', 'Actions']}
                isEmpty={false}
              >
                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Murugan K</TableCell>
                  <TableCell className="font-mono text-purple-800 font-bold text-xs">VIV-DR-88120</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">TN-24-2018000491</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">Mini van (Tata Ace)</TableCell>
                  <TableCell className="font-mono text-slate-800 text-xs">TN-24-AZ-8120</TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">★ 4.9</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">✓ Vetted & Approved</span></TableCell>
                  <TableCell>
                    <Button size="xs" variant="outline" onClick={() => addToast('Driver Verified', 'Murugan K DL & RC valid.')}>Audit</Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Saravanan P</TableCell>
                  <TableCell className="font-mono text-purple-800 font-bold text-xs">VIV-DR-90214</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">TN-30-2019001248</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">Pickup (Mahindra Bolero)</TableCell>
                  <TableCell className="font-mono text-slate-800 text-xs">TN-30-BK-4012</TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">★ 4.8</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">✓ Vetted & Approved</span></TableCell>
                  <TableCell>
                    <Button size="xs" variant="outline" onClick={() => addToast('Driver Verified', 'Saravanan P DL & RC valid.')}>Audit</Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Rajesh Kumar</TableCell>
                  <TableCell className="font-mono text-purple-800 font-bold text-xs">VIV-DR-77142</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">TN-01-2017009812</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">Two-wheeler (EV Bike)</TableCell>
                  <TableCell className="font-mono text-slate-800 text-xs">TN-01-EQ-9920</TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">★ 4.9</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">✓ Vetted & Approved</span></TableCell>
                  <TableCell>
                    <Button size="xs" variant="outline" onClick={() => addToast('Driver Verified', 'Rajesh Kumar DL & RC valid.')}>Audit</Button>
                  </TableCell>
                </TableRow>
              </Table>
            </CardBody>
          </Card>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ORDERS, DELIVERY & ESCROW (Req 28: Order & Delivery monitoring, Escrow balance) */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Escrow Balance & Vault Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-sky-700" />
                <h3 className="text-base font-black text-slate-900">
                  Escrow Security & Split Payout Ledger (Req 28: Escrow balance)
                </h3>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl">
                Razorpay Escrow Vault Active &bull; Zero Direct Custody
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Farmer Settlement Payouts</span>
                <span className="text-xl font-black text-emerald-900">₹{stats?.stats?.total_farmer_direct_earnings_inr?.toLocaleString() || '18,400'}</span>
                <span className="text-[10px] text-emerald-700 block">100% of Farmgate Produce Value</span>
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Logistics Settlement Payouts</span>
                <span className="text-xl font-black text-sky-900">₹1,240</span>
                <span className="text-[10px] text-sky-700 block">Settled to Delivery Agencies / Drivers</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Current Active Escrow Float</span>
                <span className="text-xl font-black text-amber-900">₹{stats?.stats?.current_escrow_pool_inr?.toLocaleString() || '1,750'}</span>
                <span className="text-[10px] text-amber-700 block">Awaiting Buyer Doorstep OTP</span>
              </div>
            </div>
          </div>

          {/* Orders & Live Delivery Monitoring */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-900 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Order Management & Delivery Monitoring</h3>
                  <p className="text-xs text-slate-500">Live order consignments, carrier dispatches, GPS telemetry, and escrow status</p>
                </div>
              </div>
              <Button size="xs" variant="outline" onClick={loadStats}>Refresh Orders</Button>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Order ID', 'Produce Cargo', 'Buyer', 'Farmer', 'Carrier Driver', 'Split (Farmer / Logistics)', 'Delivery Status', 'Escrow Status', 'Actions']}
                isEmpty={false}
              >
                {(stats?.orders || stats?.recent_orders || [
                  {
                    id: 'VIV-ORD-88120',
                    product_name: 'Salem Pure Turmeric',
                    buyer_name: 'Aditi Sharma',
                    farmer_name: 'Ramasamy Gounder',
                    driver_name: 'Murugan K',
                    farmer_payout_amount: 1600,
                    logistics_fee: 120,
                    status: 'DELIVERED',
                    escrow_status: 'RELEASED_TO_FARMER'
                  }
                ]).map((ord) => (
                  <TableRow key={ord.id}>
                    <TableCell className="font-mono font-bold text-sky-800 text-xs">{ord.id || ord.order_number}</TableCell>
                    <TableCell className="font-black text-slate-900 text-xs">{ord.product_name || ord.items?.[0]?.title || 'Turmeric'}</TableCell>
                    <TableCell className="text-slate-700 text-xs">{ord.buyer_name || 'Aditi Sharma'}</TableCell>
                    <TableCell className="text-slate-700 text-xs">{ord.farmer_name || 'Ramasamy'}</TableCell>
                    <TableCell className="font-bold text-slate-800 text-xs">{ord.driver_name || 'Murugan K'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      ₹{ord.farmer_payout_amount || 1600} / ₹{ord.logistics_fee || 120}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ord.status === 'DELIVERED' ? 'delivered' : ord.status === 'CONFIRMED' ? 'confirmed' : 'in_transit'} size="sm">
                        {ord.status || 'DELIVERED'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        ord.escrow_status === 'HELD_IN_ESCROW' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {ord.escrow_status || 'RELEASED'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        variant="primary"
                        icon={Navigation}
                        onClick={() => {
                          setActiveOrderId(ord.id || 'VIV-ORD-88120');
                          setActiveView('order_tracking');
                        }}
                      >
                        Live GPS
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardBody>
          </Card>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: USER DIRECTORY & FEEDBACK (Req 28: User management & Feedback / reports) */}
      {/* ======================================================== */}
      {activeTab === 'users_feedback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* User Management Directory (Req 28: User management) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-900 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Platform User Directory & Role-Based Access</h3>
                  <p className="text-xs text-slate-500">Farmers, FPOs, Buyers, Agencies, Drivers, and Operations Admins</p>
                </div>
              </div>
              <Badge variant="verified" size="sm">12 Active Users</Badge>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Full Name', 'Role', 'VIVAAN ID / UID', 'Phone / Email', 'Verification', 'Account State']}
                isEmpty={false}
              >
                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Ramasamy Gounder</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">FARMER</span></TableCell>
                  <TableCell className="font-mono text-xs">VIV-FR-104582</TableCell>
                  <TableCell className="text-slate-600 text-xs">+91 98421 78901</TableCell>
                  <TableCell><span className="text-emerald-700 font-bold text-xs">✓ Land Patta Verified</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">Active</span></TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Salem Agri Producer FPO</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">FPO / COOP</span></TableCell>
                  <TableCell className="font-mono text-xs">VIV-FPO-99120</TableCell>
                  <TableCell className="text-slate-600 text-xs">contact@salemfpo.org</TableCell>
                  <TableCell><span className="text-emerald-700 font-bold text-xs">✓ SFAC / NABARD Registered</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">Active</span></TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Aditi Sharma</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">BUYER</span></TableCell>
                  <TableCell className="font-mono text-xs">uid_buyer_1</TableCell>
                  <TableCell className="text-slate-600 text-xs">aditi.sharma@example.com</TableCell>
                  <TableCell><span className="text-blue-700 font-bold text-xs">✓ Phone OTP Verified</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">Active</span></TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">GreenCorridor Logistics</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black">AGENCY</span></TableCell>
                  <TableCell className="font-mono text-xs">VIV-AG-104582</TableCell>
                  <TableCell className="text-slate-600 text-xs">dispatch@greencorridor.in</TableCell>
                  <TableCell><span className="text-emerald-700 font-bold text-xs">✓ Commercial Logistics Audited</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">Active</span></TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-bold text-slate-900 text-xs">Murugan K</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black">DRIVER</span></TableCell>
                  <TableCell className="font-mono text-xs">VIV-DR-88120</TableCell>
                  <TableCell className="text-slate-600 text-xs">+91 94432 10982</TableCell>
                  <TableCell><span className="text-emerald-700 font-bold text-xs">✓ DL & Police Vetted</span></TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">Active</span></TableCell>
                </TableRow>
              </Table>
            </CardBody>
          </Card>

          {/* Feedback & Reports Desk (Req 28: Feedback / reports) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Feedback & Quality Reports Desk</h3>
                  <p className="text-xs text-slate-500">Buyer reviews for Producers, Delivery Agencies, and Drivers</p>
                </div>
              </div>
              <Badge variant="verified" size="sm">Audited Feedback</Badge>
            </CardHeader>

            <CardBody className="p-0 overflow-x-auto">
              <Table
                headers={['Report ID', 'Order Ref', 'Buyer Name', 'Target Type', 'Target Entity', 'Rating', 'Review Details', 'Audit Status']}
                isEmpty={false}
              >
                {feedbackReports.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-mono font-bold text-slate-700 text-xs">{fb.id}</TableCell>
                    <TableCell className="font-mono text-sky-800 text-xs">{fb.orderId}</TableCell>
                    <TableCell className="font-semibold text-slate-800 text-xs">{fb.buyer}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        fb.targetType === 'FARMER'
                          ? 'bg-emerald-100 text-emerald-900'
                          : fb.targetType === 'DELIVERY_AGENCY'
                          ? 'bg-sky-100 text-sky-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {fb.targetType}
                      </span>
                    </TableCell>
                    <TableCell className="font-black text-slate-900 text-xs">{fb.targetName}</TableCell>
                    <TableCell className="font-bold text-amber-600 text-xs">
                      {'★'.repeat(fb.rating)} ({fb.rating}.0)
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs max-w-sm">{fb.review}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        {fb.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardBody>
          </Card>

        </div>
      )}

    </div>
  );
}
