import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Phone,
  FileText,
  MapPin,
  Smartphone,
  CreditCard,
  Clock,
  ArrowRight,
  Award
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

export default function DriverApplication() {
  const { setActiveView, addToast, firestoreService } = useApp();

  // 1. Personal Details
  const [fullName, setFullName] = useState('Murugan Karuppasamy');
  const [mobile, setMobile] = useState('+91 94432 19842');
  const [altMobile, setAltMobile] = useState('+91 98420 55123');
  const [dob, setDob] = useState('1988-06-14');
  const [address, setAddress] = useState('12/4, Mariamman Kovil Street, Omalur, Salem - 636455');
  const [kycType, setKycType] = useState('Aadhaar Card');
  const [kycNumber, setKycNumber] = useState('5481-9920-4819');

  // 2. License Details
  const [licenseNumber, setLicenseNumber] = useState('TN-30-2018-0098421');
  const [licenseClass, setLicenseClass] = useState('LMV (Light Motor Vehicle)');
  const [dlExpiry, setDlExpiry] = useState('2030-05-15');
  const [experience, setExperience] = useState('8');

  // 3. Coverage Details
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Salem');
  const [familiarTaluks, setFamiliarTaluks] = useState('Omalur, Salem West, Mettur, Adyar, Guindy');
  const [languages, setLanguages] = useState('Tamil, English');

  // 4. Vehicle Details
  const [vehicleOwner, setVehicleOwner] = useState('Agency Provided'); // 'Self-owned' | 'Agency Provided'
  const [vehicleType, setVehicleType] = useState('Tata Ace Pickup');
  const [vehicleNumber, setVehicleNumber] = useState('TN-30-AZ-8120');
  const [vehicleCapacity, setVehicleCapacity] = useState('1200'); // in kg

  // 5. Operations
  const [hasSmartphone, setHasSmartphone] = useState(true);
  const [codHandling, setCodHandling] = useState(true);
  const [heavyLifting, setHeavyLifting] = useState(true);
  const [preferredShift, setPreferredShift] = useState('Morning & Full Day');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledDriver, setEnrolledDriver] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !mobile || !licenseNumber) {
      addToast('Missing Info', 'Driver full name, mobile number, and license number are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const driver = await firestoreService.registerDriver({
        fullName,
        name: fullName,
        phone: mobile,
        altPhone: altMobile,
        dob,
        address,
        kycType,
        kycNumber,
        commercialDlNumber: licenseNumber,
        licenseClass,
        dlExpiry,
        experienceYears: Number(experience),
        state,
        district,
        familiarTaluks: familiarTaluks.split(',').map(s => s.trim()),
        languages: languages.split(',').map(s => s.trim()),
        vehicleOwner,
        vehicleType,
        vehicleNo: vehicleNumber,
        vehicleCapacityKg: Number(vehicleCapacity),
        hasColdChain: true,
        hasSmartphone,
        codHandling,
        heavyLifting,
        preferredShift,
        agencyId: 'agency_1'
      });

      addToast('Driver Enrolled Successfully!', `Driver ${driver.fullName} registered with ID: ${driver.vivaanId}`);
      setEnrolledDriver(driver);
    } catch (err) {
      addToast('Registration Error', err.message || 'Failed to submit driver application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('driver_dashboard')} label="Back to Driver Portal" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Driver Registration & Application</h1>
            <p className="text-xs text-slate-500">Commercial DL audit, vehicle payload verification & operational readiness</p>
          </div>
        </div>

        <Badge variant="verified" size="md">
          🛡️ Certified Driver Program
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-900 rounded-2xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Commercial Driver Onboarding Form</h3>
              <p className="text-xs text-slate-500">All 5 sections required for agricultural farmgate logistics authorization</p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-700" />
                1. Personal Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-name-input"
                  label="Full Name (As on Government ID)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Murugan Karuppasamy"
                  required
                />
                <Input
                  id="driver-dob-input"
                  label="Date of Birth (DOB)"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-phone-input"
                  label="Primary Mobile Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 94432 19842"
                  required
                />
                <Input
                  id="driver-alt-phone-input"
                  label="Alternative Mobile / Emergency Contact"
                  type="tel"
                  value={altMobile}
                  onChange={(e) => setAltMobile(e.target.value)}
                  placeholder="+91 98420 55123"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    id="driver-address-input"
                    label="Residential Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12/4, Mariamman Kovil Street, Omalur, Salem"
                    required
                  />
                </div>
                <Input
                  id="driver-kyc-input"
                  label="KYC Number (Aadhaar / Voter ID)"
                  value={kycNumber}
                  onChange={(e) => setKycNumber(e.target.value)}
                  placeholder="5481-9920-4819"
                  required
                />
              </div>
            </div>

            {/* Section 2: License Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                2. Driving License Verification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-license-input"
                  label="Commercial Driving License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="TN-30-2018-0098421"
                  required
                />
                <Select
                  id="driver-class-select"
                  label="License Class"
                  value={licenseClass}
                  onChange={(e) => setLicenseClass(e.target.value)}
                  options={['LMV (Light Motor Vehicle)', 'HGV (Heavy Goods Vehicle)', 'Commercial 3-Wheeler']}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-expiry-input"
                  label="License Expiry Date"
                  type="date"
                  value={dlExpiry}
                  onChange={(e) => setDlExpiry(e.target.value)}
                  required
                />
                <Input
                  id="driver-experience-input"
                  label="Commercial Driving Experience (Years)"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="8"
                  required
                />
              </div>
            </div>

            {/* Section 3: Coverage Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                3. Geographic Coverage & Languages
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-state-input"
                  label="Operating State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
                <Input
                  id="driver-district-input"
                  label="Base Home District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-taluks-input"
                  label="Familiar Taluks (Comma separated)"
                  value={familiarTaluks}
                  onChange={(e) => setFamiliarTaluks(e.target.value)}
                  placeholder="Omalur, Salem West, Mettur, Adyar"
                  required
                />
                <Input
                  id="driver-languages-input"
                  label="Fluent Languages"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Tamil, English, Telugu"
                  required
                />
              </div>
            </div>

            {/* Section 4: Vehicle Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-700" />
                4. Assigned / Self-Owned Vehicle
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="driver-vehicle-owner-select"
                  label="Vehicle Ownership"
                  value={vehicleOwner}
                  onChange={(e) => setVehicleOwner(e.target.value)}
                  options={['Agency Provided', 'Self-owned', 'Leased / Attached']}
                  required
                />
                <Select
                  id="driver-vehicle-select"
                  label="Vehicle Model / Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  options={['Tata Ace Pickup', 'Mahindra Bolero Maxi Truck', 'Refrigerated Cold Van', '16T Eicher Truck']}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="driver-vehicle-no-input"
                  label="Vehicle Registration Number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="TN-30-AZ-8120"
                  required
                />
                <Input
                  id="driver-capacity-input"
                  label="Payload Weight Capacity (kg)"
                  type="number"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  placeholder="1200"
                  required
                />
              </div>
            </div>

            {/* Section 5: Operations & Delivery Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                5. Operations & Operational Readiness
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none">
                  <input
                    id="driver-smartphone-check"
                    type="checkbox"
                    checked={hasSmartphone}
                    onChange={(e) => setHasSmartphone(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded"
                  />
                  <span className="font-bold text-slate-800">Has 4G Smartphone with GPS</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none">
                  <input
                    id="driver-cod-check"
                    type="checkbox"
                    checked={codHandling}
                    onChange={(e) => setCodHandling(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded"
                  />
                  <span className="font-bold text-slate-800">Comfortable with COD & Escrow</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none">
                  <input
                    id="driver-lifting-check"
                    type="checkbox"
                    checked={heavyLifting}
                    onChange={(e) => setHeavyLifting(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded"
                  />
                  <span className="font-bold text-slate-800">Able to Handle Heavy Produce Sacks</span>
                </label>
              </div>

              <div className="max-w-xs">
                <Select
                  id="driver-shift-select"
                  label="Preferred Work Shift"
                  value={preferredShift}
                  onChange={(e) => setPreferredShift(e.target.value)}
                  options={['Morning & Full Day', 'Morning Early Shift (4 AM - 12 PM)', 'Evening Rural Inter-Mandi', 'Flexible 24/7 Corridors']}
                  required
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveView('driver_dashboard')}
              >
                Cancel
              </Button>

              <Button
                id="driver-submit-btn"
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                icon={CheckCircle2}
              >
                {isSubmitting ? 'Verifying...' : 'Submit Driver Application'}
              </Button>
            </div>

          </form>
        </CardBody>
      </Card>

      {/* Success Modal */}
      {enrolledDriver && (
        <Modal
          isOpen={true}
          onClose={() => {
            setEnrolledDriver(null);
            setActiveView('driver_dashboard');
          }}
          title="Driver Verification & Onboarding Complete!"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-3xl">🪪</span>
              <h3 className="text-base font-black text-emerald-950">VIVAAN Authorized Commercial Driver</h3>
              <p className="text-xs text-emerald-700">Commercial DL verified for farmgate cargo pickup and OTP doorstep handover</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Generated Driver ID:</span>
                <span className="font-mono font-black text-emerald-800 text-sm" id="conf-driver-id">{enrolledDriver.vivaanId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Driver Full Name:</span>
                <span className="font-bold text-slate-900" id="conf-driver-name">{enrolledDriver.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Commercial DL No:</span>
                <span className="font-mono font-bold text-slate-800">{enrolledDriver.commercialDlNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Vehicle Assigned:</span>
                <span className="font-bold text-slate-900">{enrolledDriver.vehicleType} ({enrolledDriver.vehicleNo})</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Payload Capacity:</span>
                <span className="font-bold text-emerald-800">{enrolledDriver.vehicleCapacityKg} kg</span>
              </div>
            </div>

            <Button
              id="view-driver-portal-btn"
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setEnrolledDriver(null);
                setActiveView('driver_dashboard');
              }}
              icon={ArrowRight}
            >
              Continue to Dashboard
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
}
