import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ArrowLeft, Users, ShieldCheck, KeyRound, Smartphone, CheckCircle2, X } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function RoleSelectionScreen() {
  const { ROLES, selectRole, setActiveView, t, addToast } = useApp();
  const [showFarmerIdModal, setShowFarmerIdModal] = useState(false);
  const [farmerIdInput, setFarmerIdInput] = useState('VIV-FR-104582');
  const [deviceLabel, setDeviceLabel] = useState('New Device (Chrome / Android)');

  const handleFarmerIdLogin = (e) => {
    e.preventDefault();
    if (!farmerIdInput.trim()) {
      addToast('Missing ID', 'Please enter your unique Farmer ID.', 'error');
      return;
    }
    const cleanId = farmerIdInput.trim().toUpperCase();
    localStorage.setItem('vivaan_farmer_id', cleanId);
    selectRole('farmer');
    setShowFarmerIdModal(false);
    addToast('Farmer Session Restored', `Logged in as Verified Farmer (${cleanId}) on this device!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onClick={() => setActiveView('lang_select')} label="Back to Languages" />
        <span className="text-xs font-bold text-slate-400">Step 2 of 2: Role Selection</span>
      </div>

      {/* Screen Title & Alternate Device Quick Login */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-900 mb-1">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          How do you want to use VIVAAN?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Select your agricultural role to enter your dedicated workflow and tools.
        </p>

        {/* Existing Farmer ID Quick Access Button (Req 7: Login from another device) */}
        <div className="pt-2">
          <button
            id="btn-login-farmer-id"
            type="button"
            onClick={() => setShowFarmerIdModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Already have a Farmer ID? <u>Login using Farmer ID from another device</u></span>
          </button>
        </div>
      </div>

      {/* Core Roles Grid (Responsive across mobile, tablet, desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROLES.map((role) => {
          return (
            <button
              key={role.id}
              id={`role-${role.id}`}
              type="button"
              onClick={() => selectRole(role.id)}
              className="w-full text-left bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-xs hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {role.icon}
                  </div>
                  <Badge variant="district" size="sm">
                    {role.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-800 group-hover:text-emerald-950 w-full">
                <span>Enter {role.title} Portal</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust Guarantee */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-900 font-semibold flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>You can switch between any of these 4 roles at any time from the top navigation bar.</span>
      </div>

      {/* Admin Access Quick Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-md gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-900/80 border border-purple-500/40 flex items-center justify-center text-base shrink-0">
            ⚙️
          </div>
          <div>
            <h4 className="text-xs font-black flex items-center gap-2">
              VIVAAN National Operations & Admin Console
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">VIV-AD-0001</span>
            </h4>
            <p className="text-[11px] text-slate-400">Land Patta audit desk, escrow settlements, and national fleet telemetry</p>
          </div>
        </div>
        <button
          id="role-admin"
          type="button"
          onClick={() => setActiveView('admin_console')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Open Operations Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal: Login using Farmer ID from another device (Req 7) */}
      <Modal
        isOpen={showFarmerIdModal}
        onClose={() => setShowFarmerIdModal(false)}
        title="Login using Farmer ID (Any Device)"
      >
        <form onSubmit={handleFarmerIdLogin} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your unique Farmer ID issued during government land registry verification to resume your producer session on this device.
          </p>

          <Input
            id="input-login-farmer-id"
            label="Unique Farmer ID"
            value={farmerIdInput}
            onChange={(e) => setFarmerIdInput(e.target.value)}
            placeholder="e.g. VIV-FR-104582"
            required
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo Farmer ID: <b>VIV-FR-104582</b></span>
            <button
              type="button"
              onClick={() => setFarmerIdInput('VIV-FR-104582')}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Fill Demo ID
            </button>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Encrypted token authentication restores your harvest batches and pending escrow payouts.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowFarmerIdModal(false)}
            >
              Cancel
            </Button>
            <Button
              id="submit-farmer-id-login-btn"
              type="submit"
              variant="primary"
              size="md"
              icon={CheckCircle2}
            >
              Verify & Enter Portal
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
