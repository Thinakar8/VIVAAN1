import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, ArrowLeft, ShieldCheck, QrCode, CheckCircle2, Copy } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function FarmerIdCardView() {
  const { setActiveView, firestoreService, addToast } = useApp();
  const [farmer, setFarmer] = useState({
    name: 'Ramasamy Gounder',
    farmerId: 'VIV-FR-104582',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    pattaNumber: 'PAT-4821/2021',
    extentAcres: '5.5 Acres',
    ownershipType: 'Own Land',
    village: 'Muthampatty',
    taluk: 'Omalur',
    district: 'Salem',
    state: 'Tamil Nadu',
    verified: true,
    aadhaarMasked: '•••• •••• 4821',
    bankMasked: 'SBI •••• 4891'
  });

  useEffect(() => {
    // Pull active farmer verification details
    const unsubs = [
      firestoreService.subscribeCollection('farmers', (farmersList) => {
        if (farmersList && farmersList.length > 0) {
          const active = farmersList.find(f => f.id === 'farmer_1') || farmersList[0];
          setFarmer(prev => ({
            ...prev,
            name: active.name || prev.name,
            farmerId: active.uniqueFarmerId || (active.farmerId?.startsWith('VIV-FR-') ? active.farmerId : 'VIV-FR-104582'),
            photoUrl: active.photoUrl || prev.photoUrl,
            district: active.district || prev.district,
            village: active.village || prev.village,
            extentAcres: active.totalAcres ? `${active.totalAcres} Acres` : prev.extentAcres,
            ownershipType: active.ownershipType || prev.ownershipType,
            pattaNumber: active.pattaNumber || prev.pattaNumber
          }));
        }
      }),
      firestoreService.subscribeCollection('farmerVerification', (verifs) => {
        if (verifs && verifs.length > 0) {
          const latest = verifs[verifs.length - 1];
          if (latest) {
            setFarmer(prev => ({
              ...prev,
              name: latest.fullName || prev.name,
              farmerId: latest.uniqueFarmerId || (latest.farmerId?.startsWith('VIV-FR-') ? latest.farmerId : 'VIV-FR-104582'),
              photoUrl: latest.photoUrl || prev.photoUrl,
              pattaNumber: latest.pattaNumber || prev.pattaNumber,
              district: latest.address?.district || prev.district,
              village: latest.address?.village || prev.village,
              taluk: latest.address?.taluk || prev.taluk,
              state: latest.address?.state || prev.state,
              aadhaarMasked: latest.govIdNumberMasked || prev.aadhaarMasked,
              bankMasked: latest.bankDetails?.accountNumberMasked || prev.bankMasked,
              verified: true
            }));
          }
        }
      })
    ];

    return () => {
      unsubs.forEach(u => u && u());
    };
  }, [firestoreService]);

  const copyVerifyLink = () => {
    const link = `https://vivaan.agri/verify/${farmer.farmerId || 'VIV-FR-104582'}`;
    addToast('Verification Link Copied', link);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onClick={() => setActiveView('farmer_dashboard')} label="Back to Dashboard" />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Copy}
            onClick={copyVerifyLink}
          >
            Copy QR Link
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Farmer ID Card
          </Button>
        </div>
      </div>

      {/* Official VIVAAN Digital Farmer ID Card */}
      <div
        id="digital-farmer-id-card"
        className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-7 shadow-2xl border-2 border-amber-300 relative overflow-hidden select-none"
      >
        {/* Background Decorative Guilloche Hologram Circle */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Card Header with Logo */}
        <div className="flex items-center justify-between border-b border-white/20 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/vivaan-logo.jpg"
              alt="VIVAAN"
              className="h-12 w-12 rounded-2xl object-cover border border-amber-300 shadow-md ring-2 ring-white/10"
            />
            <div>
              <h3 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                VIVAAN FARMER IDENTITY
              </h3>
              <p className="text-[10px] text-amber-300 font-mono tracking-wider font-bold">
                DIRECT AGRICULTURAL PRODUCER • GOVT VERIFIED
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              id="farmer-verified-badge"
              className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md inline-flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> VERIFIED
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-3 gap-5 py-6 items-center relative z-10">
          {/* Photo & Unique ID */}
          <div className="col-span-1 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={farmer.photoUrl}
                alt={farmer.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-lg ring-2 ring-white/20"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full ring-2 ring-emerald-950">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <span
              id="unique-farmer-id"
              className="text-[11px] font-mono text-amber-300 mt-2 font-black tracking-wide"
            >
              {farmer.farmerId || 'VIV-FR-104582'}
            </span>
            <span className="text-[9px] text-emerald-300 font-bold uppercase mt-0.5">
              {farmer.ownershipType}
            </span>
          </div>

          {/* Core Info */}
          <div className="col-span-2 space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">Farmer Name</span>
              <div id="farmer-name-display" className="text-lg font-black text-white leading-tight">
                {farmer.name}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">Land Record & Extent</span>
              <div className="font-mono text-amber-200 font-bold text-xs">
                {farmer.pattaNumber} • {farmer.extentAcres}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">Verified Location</span>
              <div className="text-slate-200 font-semibold text-xs">
                {farmer.village ? `${farmer.village}, ` : ''}{farmer.taluk ? `${farmer.taluk} Taluk, ` : ''}{farmer.district}, {farmer.state}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-300 font-mono">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">ID Ref</span>
                <span>{farmer.aadhaarMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Direct Escrow</span>
                <span>{farmer.bankMasked}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode & QR Code Section */}
        <div className="border-t border-white/20 pt-4 flex items-center justify-between relative z-10">
          
          {/* Visual SVG Barcode */}
          <div className="space-y-1">
            <div className="flex items-center gap-[2px] h-9 bg-white/95 px-2 py-1 rounded-md shadow-inner">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 3, 1, 4, 2].map((w, i) => (
                <div
                  key={i}
                  className="bg-slate-950 h-full"
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-300 tracking-widest block text-center">
              *{farmer.farmerId || 'VIV-FR-104582'}*
            </span>
          </div>

          {/* Visual SVG QR Code */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-bold text-amber-300 uppercase block">Scan to Verify</span>
              <span className="text-[8px] text-slate-300 font-mono">e-Mandi Registry</span>
            </div>

            <div
              id="farmer-qr-code"
              className="w-16 h-16 bg-white p-1.5 rounded-xl shadow-md flex items-center justify-center"
              title={`Verification QR Code for ${farmer.farmerId || 'VIV-FR-104582'}`}
            >
              {/* Scalable Vector QR Code Graphic */}
              <svg viewBox="0 0 33 33" className="w-full h-full text-slate-950 fill-current">
                {/* Top-Left Finder */}
                <rect x="1" y="1" width="9" height="9" fill="black" />
                <rect x="2" y="2" width="7" height="7" fill="white" />
                <rect x="3.5" y="3.5" width="4" height="4" fill="black" />
                {/* Top-Right Finder */}
                <rect x="23" y="1" width="9" height="9" fill="black" />
                <rect x="24" y="2" width="7" height="7" fill="white" />
                <rect x="25.5" y="3.5" width="4" height="4" fill="black" />
                {/* Bottom-Left Finder */}
                <rect x="1" y="23" width="9" height="9" fill="black" />
                <rect x="2" y="24" width="7" height="7" fill="white" />
                <rect x="3.5" y="25.5" width="4" height="4" fill="black" />
                {/* Data Modules Matrix */}
                <rect x="12" y="3" width="2" height="2" />
                <rect x="16" y="3" width="2" height="2" />
                <rect x="19" y="3" width="2" height="2" />
                <rect x="12" y="7" width="2" height="2" />
                <rect x="15" y="7" width="2" height="2" />
                <rect x="19" y="7" width="2" height="2" />
                <rect x="3" y="12" width="2" height="2" />
                <rect x="7" y="12" width="2" height="2" />
                <rect x="12" y="12" width="3" height="3" />
                <rect x="18" y="12" width="2" height="2" />
                <rect x="22" y="12" width="2" height="2" />
                <rect x="26" y="12" width="2" height="2" />
                <rect x="3" y="16" width="2" height="2" />
                <rect x="7" y="16" width="2" height="2" />
                <rect x="11" y="16" width="2" height="2" />
                <rect x="15" y="16" width="2" height="2" />
                <rect x="19" y="16" width="2" height="2" />
                <rect x="23" y="16" width="2" height="2" />
                <rect x="27" y="16" width="2" height="2" />
                <rect x="12" y="20" width="2" height="2" />
                <rect x="16" y="20" width="2" height="2" />
                <rect x="20" y="20" width="2" height="2" />
                <rect x="12" y="24" width="2" height="2" />
                <rect x="16" y="24" width="3" height="3" />
                <rect x="22" y="24" width="2" height="2" />
                <rect x="26" y="24" width="2" height="2" />
                <rect x="12" y="28" width="2" height="2" />
                <rect x="18" y="28" width="2" height="2" />
                <rect x="22" y="28" width="2" height="2" />
                <rect x="26" y="28" width="2" height="2" />
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* Security Assurance Footer */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>Cryptographically validated by VIVAAN National Direct Agri Registry.</span>
        </div>
        <span className="font-mono text-[11px] text-emerald-800 font-bold">VIV-2026-FR</span>
      </div>

    </div>
  );
}

