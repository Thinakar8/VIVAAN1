import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Building,
  KeyRound
} from 'lucide-react';

export default function FarmerRegistration() {
  const { setUser, setActiveView, addToast } = useApp();

  const [step, setStep] = useState(1);
  const [farmerType, setFarmerType] = useState('OWN_LAND');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [kycType, setKycType] = useState('Aadhaar Card');
  const [kycNumber, setKycNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');

  // Land Details
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Salem');
  const [taluk, setTaluk] = useState('Omalur');
  const [village, setVillage] = useState('Muthampatty');
  const [surveyNo, setSurveyNo] = useState('142');
  const [subdivisionNo, setSubdivisionNo] = useState('2B');
  const [pattaNo, setPattaNo] = useState('PAT-4821/2026');
  const [landExtent, setLandExtent] = useState('4.5 Acres');
  const [soilType, setSoilType] = useState('Red Loam');
  const [waterSource, setWaterSource] = useState('Borewell with Solar Pump');

  // Lease Fields
  const [landownerName, setLandownerName] = useState('');
  const [landownerPhone, setLandownerPhone] = useState('');
  const [consentOtp, setConsentOtp] = useState('');
  const [consentSent, setConsentSent] = useState(false);

  const handleSendConsentOtp = () => {
    if (!landownerPhone) {
      addToast('Missing Info', 'Please enter landowner phone number.', 'error');
      return;
    }
    setConsentSent(true);
    setConsentOtp('7721');
    addToast('Consent SMS Triggered', 'Landowner consent OTP sent (Demo code: 7721)');
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      addToast('Incomplete', 'Please fill name and phone number.', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          primary_phone: phone,
          farmer_type: farmerType,
          address: `${village}, ${taluk}, ${district}`,
          kyc_type: kycType,
          kyc_number: kycNumber || 'XXXX-XXXX-1234',
          bank_account: bankAccount || 'SBIN0001234 - 9876543210',
          bank_ifsc: bankIfsc || 'SBIN0001234',
          bank_name: bankName,
          state,
          district,
          taluk,
          village,
          survey_no: surveyNo,
          subdivision_no: subdivisionNo,
          patta_no: pattaNo,
          land_extent: landExtent,
          soil_type: soilType,
          water_source: waterSource,
          landowner_name: landownerName,
          landowner_phone: landownerPhone
        })
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        addToast('Farmer Verified & Registered!', `Generated VIVAAN ID: ${data.farmer.vivaan_id}`);
        setActiveView('farmer_dash');
      } else {
        addToast('Registration Error', data.error || 'Failed to submit registration.', 'error');
      }
    } catch (err) {
      addToast('Error', 'Registration request failed.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-3xl mb-1">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Farmer Registration & Land KYC</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Digital verification of Land Patta, tenure rights, and banking details to enable zero-middleman direct selling.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        
        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${
          step >= 1 ? 'bg-emerald-800 text-white shadow-md ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-600'
        }`}>
          1
        </div>

        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${
          step >= 2 ? 'bg-emerald-800 text-white shadow-md ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-600'
        }`}>
          2
        </div>

        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${
          step >= 3 ? 'bg-emerald-800 text-white shadow-md ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-600'
        }`}>
          3
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
        
        {/* Step 1: Tenure Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Step 1: Select Your Land Tenure Classification</h2>
            
            <div className="space-y-3">
              <label
                onClick={() => setFarmerType('OWN_LAND')}
                className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  farmerType === 'OWN_LAND'
                    ? 'border-emerald-700 bg-emerald-50/70'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="farmerType"
                  checked={farmerType === 'OWN_LAND'}
                  onChange={() => setFarmerType('OWN_LAND')}
                  className="mt-1 text-emerald-700"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Own Land Farmer</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You cultivate agricultural land legally registered and titled under your name. Verified via Patta / Chitta records.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setFarmerType('LEASED_WITH_AGREEMENT')}
                className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  farmerType === 'LEASED_WITH_AGREEMENT'
                    ? 'border-emerald-700 bg-emerald-50/70'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="farmerType"
                  checked={farmerType === 'LEASED_WITH_AGREEMENT'}
                  onChange={() => setFarmerType('LEASED_WITH_AGREEMENT')}
                  className="mt-1 text-emerald-700"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Leased Land – Written Agreement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You cultivate under a registered lease deed or signed tenancy agreement with the landowner.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setFarmerType('LEASED_WITHOUT_AGREEMENT')}
                className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  farmerType === 'LEASED_WITHOUT_AGREEMENT'
                    ? 'border-emerald-700 bg-emerald-50/70'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="farmerType"
                  checked={farmerType === 'LEASED_WITHOUT_AGREEMENT'}
                  onChange={() => setFarmerType('LEASED_WITHOUT_AGREEMENT')}
                  className="mt-1 text-emerald-700"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Leased Land – Oral / Mutual Agreement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No formal paper agreement. VIVAAN verifies cultivation rights through an SMS OTP consent flow sent to the landowner.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black flex items-center gap-2"
              >
                <span>Continue to Personal KYC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal KYC & Bank Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Step 2: Personal KYC & Bank Direct Transfer Setup</h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramasamy Gounder"
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98421 04582"
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">KYC Document Type</label>
                  <select
                    value={kycType}
                    onChange={(e) => setKycType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID (EPIC)</option>
                    <option value="Agricultural Credit Card">Agricultural Credit Card (ACC)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">KYC ID Number</label>
                  <input
                    type="text"
                    value={kycNumber}
                    onChange={(e) => setKycNumber(e.target.value)}
                    placeholder="XXXX-XXXX-4821"
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <span className="font-black text-emerald-950 uppercase tracking-wider block">
                  Direct Escrow Bank Payout Account
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="SBI"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="30891283912"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="SBIN0001234"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Leased Land Special Consent Section */}
              {farmerType === 'LEASED_WITHOUT_AGREEMENT' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                  <span className="font-black text-amber-950 uppercase tracking-wider block">
                    Landowner SMS Consent Verification
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Landowner Full Name</label>
                      <input
                        type="text"
                        value={landownerName}
                        onChange={(e) => setLandownerName(e.target.value)}
                        placeholder="Vijay Deshmukh"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Landowner Mobile Number</label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={landownerPhone}
                          onChange={(e) => setLandownerPhone(e.target.value)}
                          placeholder="+91 98229 98877"
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleSendConsentOtp}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px]"
                        >
                          Send OTP
                        </button>
                      </div>
                    </div>
                  </div>

                  {consentSent && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={consentOtp}
                        onChange={(e) => setConsentOtp(e.target.value)}
                        placeholder="Enter Landowner OTP"
                        className="w-40 p-2.5 rounded-xl border border-slate-200 bg-white text-center font-mono"
                      />
                      <span className="text-emerald-700 font-bold text-xs">✓ Consent Verified (OTP: 7721)</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black flex items-center gap-2"
              >
                <span>Continue to Land Records</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Land Patta & Complete Registration */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Step 3: Agricultural Land Records & Patta Audit</h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Taluk</label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Survey No</label>
                  <input
                    type="text"
                    value={surveyNo}
                    onChange={(e) => setSurveyNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subdivision</label>
                  <input
                    type="text"
                    value={subdivisionNo}
                    onChange={(e) => setSubdivisionNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patta Number</label>
                  <input
                    type="text"
                    value={pattaNo}
                    onChange={(e) => setPattaNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Land Extent</label>
                  <input
                    type="text"
                    value={landExtent}
                    onChange={(e) => setLandExtent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Red Loam">Red Loam</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Laterite Clay">Laterite Clay</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Irrigation Source</label>
                  <input
                    type="text"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="font-black text-emerald-950 block">Instant Verification Check</span>
                    <span className="text-[11px] text-emerald-800">State Land Registry Ledger Simulation Active</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-200 px-3 py-1 rounded-full">
                  Ledger Match 100%
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black shadow-xl flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-amber-300" />
                <span>Verify Land & Generate VIVAAN Farmer ID</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
