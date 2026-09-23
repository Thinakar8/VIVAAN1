import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  User,
  LandPlot,
  Building,
  CreditCard,
  Camera,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function FarmerLandKyc() {
  const { setActiveView, addToast, firestoreService } = useApp();

  // Active tab in the registration desk
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'land' | 'lease'

  // 1. Personal Details
  const [fullName, setFullName] = useState('Ramasamy Gounder');
  const [primaryMobile, setPrimaryMobile] = useState('+91 98421 88210');
  const [altMobile, setAltMobile] = useState('+91 94432 19840');
  const [streetAddress, setStreetAddress] = useState('4/182, East Garden Street, Post Office Road');
  const [village, setVillage] = useState('Muthampatty');
  const [taluk, setTaluk] = useState('Omalur');
  const [district, setDistrict] = useState('Salem');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('636455');
  const [govIdType, setGovIdType] = useState('Aadhaar Card');
  const [govIdNumber, setGovIdNumber] = useState('5482 9102 4821');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300');

  // Bank Details
  const [accountHolder, setAccountHolder] = useState('Ramasamy Gounder');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('309812489102');
  const [ifscCode, setIfscCode] = useState('SBIN0001824');
  const [branch, setBranch] = useState('Omalur Main Branch');

  // 2. Land Details
  const [ownershipStatus, setOwnershipStatus] = useState('Own Land'); // 'Own Land' | 'Leased Land With Agreement' | 'Leased Land Without Agreement'
  const [surveyNo, setSurveyNo] = useState('142');
  const [subdivisionNo, setSubdivisionNo] = useState('2B');
  const [pattaNo, setPattaNo] = useState('PAT-4821/2021');
  const [chittaNo, setChittaNo] = useState('CHT-8842');
  const [extent, setExtent] = useState('5.5 Acres');
  const [soilType, setSoilType] = useState('Red Loam');
  const [waterSource, setWaterSource] = useState('Borewell with Solar Pump');

  // 3. Dynamic Leased Landowner Information
  const [landownerName, setLandownerName] = useState('Kandasamy Perumal');
  const [landownerMobile, setLandownerMobile] = useState('+91 94432 88120');
  const [leasePeriodYears, setLeasePeriodYears] = useState('3');
  const [leaseExpiryDate, setLeaseExpiryDate] = useState('2028-06-30');
  const [annualLeaseAmount, setAnnualLeaseAmount] = useState('45000');
  const [agreementDocType, setAgreementDocType] = useState('Registered Lease Deed');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [generatedFarmerId, setGeneratedFarmerId] = useState('VIV-FR-104582');

  const isLeased = ownershipStatus.includes('Leased');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    try {
      const farmerGovtId = generatedFarmerId || `VIV-FR-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedFarmerId(farmerGovtId);

      // 1. Submit sensitive land record to Firestore
      await firestoreService.submitLandRecord({
        farmerId: 'farmer_1',
        ownershipType: ownershipStatus,
        district,
        taluk,
        village,
        surveyNumber: surveyNo,
        subdivisionNumber: subdivisionNo,
        pattaNumber: pattaNo,
        chittaNumber: chittaNo,
        extentAcres: parseFloat(extent) || 5.5,
        soilType,
        irrigationSource: waterSource,
        landownerName: isLeased ? landownerName : null,
        landownerPhone: isLeased ? landownerMobile : null,
        leasePeriodYears: isLeased ? leasePeriodYears : null,
        leaseExpiryDate: isLeased ? leaseExpiryDate : null,
        annualLeaseAmount: isLeased ? annualLeaseAmount : null,
        agreementDocType: isLeased ? agreementDocType : null
      });

      // 2. Submit sensitive farmer verification KYC to Firestore
      await firestoreService.submitFarmerVerification({
        farmerId: 'farmer_1',
        fullName,
        primaryMobile,
        altMobile,
        address: {
          street: streetAddress,
          village,
          taluk,
          district,
          state,
          pincode,
          isPrivate: true
        },
        govIdType,
        govIdNumber,
        bankDetails: {
          accountHolder,
          bankName,
          accountNumber,
          ifscCode,
          branch
        },
        photoUrl,
        pattaNumber: pattaNo,
        uniqueFarmerId: farmerGovtId,
        extentAcres: extent,
        ownershipType: ownershipStatus,
        landAuditStatus: 'VERIFIED'
      });

      setVerificationDone(true);
      addToast(
        'Farmer Registration Verified!',
        `Farmer ID ${farmerGovtId} issued! Revenue land ledger & KYC audit confirmed.`
      );
    } catch (err) {
      console.error('KYC verification error:', err);
      addToast('Verification Error', err.message || 'Failed to submit registration.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation & Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('farmer_dashboard')} label="Back to Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Farmer Registration & Land Patta KYC</h1>
            <p className="text-xs text-slate-500">Government land registry record check & certified Farmer ID issuance</p>
          </div>
        </div>

        <Badge variant="verified" size="md">
          ✓ Verified Registry
        </Badge>
      </div>

      {/* Success Banner if verified */}
      {verificationDone && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-amber-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-300">{generatedFarmerId}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  AUDIT PASSED
                </span>
              </div>
              <h2 className="text-lg font-black">{fullName} — Verified Farmer Profile</h2>
              <p className="text-xs text-slate-200">
                Land Patta #{pattaNo} ({extent}) confirmed with e-Mandi Land Audit Desk.
              </p>
            </div>
          </div>

          <Button
            id="view-generated-farmer-card-btn"
            variant="accent"
            size="md"
            icon={FileText}
            onClick={() => setActiveView('farmer_id_card')}
          >
            Open Digital Farmer ID Card
          </Button>
        </div>
      )}

      {/* Multi-Section Tabbed Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Land Title Ownership Form</h3>
                <p className="text-xs text-slate-500">Cross-referenced with State Revenue & Land Ledgers</p>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                id="tab-personal"
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Personal & KYC
              </button>
              <button
                id="tab-land"
                type="button"
                onClick={() => setActiveTab('land')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'land'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Land Records
              </button>
              {isLeased && (
                <button
                  id="tab-lease"
                  type="button"
                  onClick={() => setActiveTab('lease')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'lease'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3. Lease Agreement
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SECTION 1: PERSONAL, ADDRESS & BANK KYC */}
            {activeTab === 'personal' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    Personal & Government KYC Identification
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Exact residential address is strictly private
                  </span>
                </div>

                {/* Name & Mobiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="farmer-fullname-input"
                    label="Full Name (as per Govt ID)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    id="farmer-primary-mobile-input"
                    label="Primary Mobile Number"
                    value={primaryMobile}
                    onChange={(e) => setPrimaryMobile(e.target.value)}
                    required
                  />
                  <Input
                    id="farmer-alt-mobile-input"
                    label="Alternative Mobile / WhatsApp"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                  />
                </div>

                {/* Residential Address (Private) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Private Residential Address</span>
                    <span className="text-[10px] text-slate-500 font-mono">Masked on Public Marketplace</span>
                  </div>

                  <Input
                    id="farmer-street-input"
                    label="Door No, Street & Locality"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      id="farmer-village-input"
                      label="Village / Town"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-taluk-input"
                      label="Taluk"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-district-input"
                      label="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-pincode-input"
                      label="PIN Code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Govt ID & Photo URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    id="farmer-govid-type"
                    label="Government ID Type"
                    value={govIdType}
                    onChange={(e) => setGovIdType(e.target.value)}
                    options={['Aadhaar Card', 'Voter ID Card', 'Agricultural Credit Card (ACC)', 'PAN Card']}
                    required
                  />
                  <Input
                    id="farmer-govid-number"
                    label="Govt ID / Aadhaar Number"
                    value={govIdNumber}
                    onChange={(e) => setGovIdNumber(e.target.value)}
                    required
                  />
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      Farmer Photograph URL
                    </label>
                    <div className="flex items-center gap-2">
                      <img
                        src={photoUrl}
                        alt="Farmer"
                        className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-600 shrink-0"
                      />
                      <input
                        id="farmer-photo-url-input"
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-800"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Escrow Bank Details */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-800" />
                      Bank Account Details for Direct Escrow Payout
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">100% Direct DBT</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      id="farmer-bank-holder"
                      label="Account Holder Name"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-bank-name"
                      label="Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-bank-account"
                      label="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      id="farmer-bank-ifsc"
                      label="IFSC Code"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      required
                    />
                    <Input
                      id="farmer-bank-branch"
                      label="Branch Name"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    id="btn-goto-land-tab"
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setActiveTab('land')}
                  >
                    Proceed to Land Records →
                  </Button>
                </div>

              </div>
            )}

            {/* SECTION 2: LAND OWNERSHIP, SURVEY & PATTA */}
            {activeTab === 'land' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <LandPlot className="w-4 h-4 text-emerald-700" />
                    Agricultural Land Title & Ledger Records
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Revenue Patta Verification
                  </span>
                </div>

                {/* Land Ownership Status */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Land Ownership Status <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Own Land', title: 'Own Land', desc: 'Title deed in farmer name' },
                      { id: 'Leased Land With Agreement', title: 'Leased (With Agreement)', desc: 'Written deed or lease contract' },
                      { id: 'Leased Land Without Agreement', title: 'Leased (Oral / No Agreement)', desc: 'Panchayat witness or declaration' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        id={`ownership-${opt.id.toLowerCase().replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => setOwnershipStatus(opt.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          ownershipStatus === opt.id
                            ? 'border-emerald-800 bg-emerald-50/80 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-black text-slate-900">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* State, District, Taluk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                  <Input
                    label="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  />
                  <Input
                    label="Taluk"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    required
                  />
                </div>

                {/* Survey, Subdivision, Patta, Chitta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    id="land-survey-no"
                    label="Survey Number"
                    value={surveyNo}
                    onChange={(e) => setSurveyNo(e.target.value)}
                    placeholder="e.g. 142"
                    required
                  />
                  <Input
                    id="land-subdivision-no"
                    label="Subdivision Number"
                    value={subdivisionNo}
                    onChange={(e) => setSubdivisionNo(e.target.value)}
                    placeholder="e.g. 2B"
                    required
                  />
                  <Input
                    id="land-patta-no"
                    label="Patta Number"
                    value={pattaNo}
                    onChange={(e) => setPattaNo(e.target.value)}
                    placeholder="PAT-4821/2021"
                    required
                  />
                  <Input
                    id="land-chitta-no"
                    label="Chitta Number"
                    value={chittaNo}
                    onChange={(e) => setChittaNo(e.target.value)}
                    placeholder="CHT-8842"
                    required
                  />
                </div>

                {/* Extent, Soil Type, Water Source */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="land-extent-input"
                    label="Land Extent (Acres)"
                    value={extent}
                    onChange={(e) => setExtent(e.target.value)}
                    required
                  />
                  <Select
                    id="land-soil-select"
                    label="Soil Type"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    options={['Red Loam', 'Black Cotton Soil', 'Alluvial Soil', 'Laterite Clay', 'Sandy Loam']}
                    required
                  />
                  <Input
                    id="land-water-input"
                    label="Irrigation / Water Source"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    placeholder="Borewell with Solar Pump"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setActiveTab('personal')}
                  >
                    ← Back to Personal KYC
                  </Button>

                  {isLeased ? (
                    <Button
                      id="btn-goto-lease-tab"
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => setActiveTab('lease')}
                    >
                      Next: Landowner Information →
                    </Button>
                  ) : null}
                </div>

              </div>
            )}

            {/* SECTION 3: LEASED LANDOWNER INFORMATION (CONDITIONAL) */}
            {activeTab === 'lease' && isLeased && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    Leased Landowner & Contract Verification Desk
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                    {ownershipStatus}
                  </span>
                </div>

                {/* FLOW A: LEASED LAND WITH AGREEMENT (Chain: Agreement → Landowner → Patta/Land Record → Survey Number → Farmer) */}
                {ownershipStatus === 'Leased Land With Agreement' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block mb-1.5">
                        Verification Logical Chain (Req 4):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-black text-emerald-950">
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 shadow-xs">📄 1. Agreement</span>
                        <span>→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 shadow-xs">👤 2. Landowner</span>
                        <span>→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 shadow-xs">🏛️ 3. Patta #{pattaNo || '4821'}</span>
                        <span>→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 shadow-xs">📍 4. Survey #{surveyNo || '142'}</span>
                        <span>→</span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-700 text-white shadow-xs">🌾 5. Cultivator</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="lease-landowner-name"
                        label="Landowner Full Name (As in Patta)"
                        value={landownerName}
                        onChange={(e) => setLandownerName(e.target.value)}
                        required
                      />
                      <Input
                        id="lease-landowner-phone"
                        label="Landowner Mobile Number"
                        value={landownerMobile}
                        onChange={(e) => setLandownerMobile(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        id="lease-period-years"
                        label="Lease Period (Years)"
                        type="number"
                        value={leasePeriodYears}
                        onChange={(e) => setLeasePeriodYears(e.target.value)}
                        required
                      />
                      <Input
                        id="lease-expiry-date"
                        label="Lease Expiry Date"
                        type="date"
                        value={leaseExpiryDate}
                        onChange={(e) => setLeaseExpiryDate(e.target.value)}
                        required
                      />
                      <Input
                        id="lease-annual-amount"
                        label="Annual Lease Amount (₹)"
                        type="number"
                        value={annualLeaseAmount}
                        onChange={(e) => setAnnualLeaseAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        id="lease-agreement-type"
                        label="Agreement Document Type"
                        value={agreementDocType}
                        onChange={(e) => setAgreementDocType(e.target.value)}
                        options={[
                          'Registered Lease Deed',
                          'Notarized Lease Agreement',
                          'Village Panchayat Affidavit',
                          'Joint Farmer Tenancy Declaration'
                        ]}
                        required
                      />
                      <Input
                        id="lease-agreement-ref"
                        label="Agreement Ref / Witness ID"
                        defaultValue="LSE-TN-2024-81"
                        placeholder="Deed / Witness Ref"
                      />
                    </div>
                  </div>
                )}

                {/* FLOW B: LEASED LAND WITHOUT AGREEMENT (Separate Consent-Based Verification Flow) */}
                {ownershipStatus === 'Leased Land Without Agreement' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          Consent-Based Verification Flow (Oral Tenancy Protocol)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                          Oral Lease Consent
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        For unwritten customary tenancy, verification is conducted via two-party consent verification with landowner phone confirmation and local village administrative attestation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="consent-landowner-name"
                        label="Landowner Full Name (Record Holder)"
                        value={landownerName}
                        onChange={(e) => setLandownerName(e.target.value)}
                        required
                      />
                      <div className="space-y-1">
                        <Input
                          id="consent-landowner-mobile"
                          label="Landowner Mobile (For Digital Consent)"
                          value={landownerMobile}
                          onChange={(e) => setLandownerMobile(e.target.value)}
                          required
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500">Landowner Consent Status:</span>
                          <button
                            type="button"
                            onClick={() => addToast('Digital Consent Dispatched', `Verification SMS with approval link dispatched to ${landownerMobile}`)}
                            className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer"
                          >
                            Send Consent SMS / OTP →
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        id="consent-duration"
                        label="Agreed Tenancy (Years)"
                        type="number"
                        value={leasePeriodYears}
                        onChange={(e) => setLeasePeriodYears(e.target.value)}
                        required
                      />
                      <Input
                        id="consent-vao-officer"
                        label="Village Administrative Officer (VAO)"
                        defaultValue="K. Senthil Nathan (VAO Omalur)"
                        required
                      />
                      <Input
                        id="consent-witness-ref"
                        label="Gram Panchayat Witness Ref"
                        defaultValue="PAN-OM-2024-582"
                        required
                      />
                    </div>

                    <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-amber-200 cursor-pointer select-none text-xs text-slate-800 shadow-xs">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 mt-0.5 shrink-0"
                        required
                      />
                      <span>
                        <strong>Cultivator Consent Affidavit:</strong> I declare under penalty of perjury that I am the sole active cultivator of Survey #{surveyNo}, Subdivision #{subdivisionNo} under an oral tenancy consent with the landowner named above, attested by the local Village Administrative Officer.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setActiveTab('land')}
                  >
                    ← Back to Land Records
                  </Button>
                </div>

              </div>
            )}

            {/* Audit Status Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <span>State Land Records Simulation Status: MATCH CONFIRMED</span>
              </div>
              <span className="font-mono text-emerald-800 font-black">100% Audit Score</span>
            </div>

            {/* Form Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveView('farmer_dashboard')}
              >
                Cancel
              </Button>

              <Button
                id="farmer-reg-submit-btn"
                type="submit"
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                icon={CheckCircle2}
              >
                {isSubmitting ? 'Verifying Ledger...' : 'Submit for Verification'}
              </Button>
            </div>

          </form>
        </CardBody>
      </Card>

    </div>
  );
}

