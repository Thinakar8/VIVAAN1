import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Award,
  Layers,
  Phone,
  FileText,
  Clock,
  Weight
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

export default function AgencyRegister() {
  const { setActiveView, addToast, firestoreService } = useApp();

  // 16 Required Agency Registration Fields
  const [legalName, setLegalName] = useState('GreenCorridor Agro Logistics Private Limited');
  const [brandName, setBrandName] = useState('GreenCorridor Express');
  const [corporateOffice, setCorporateOffice] = useState('Plot 12, SIDCO Industrial Estate, Guindy, Chennai - 600032');
  const [businessTaxId, setBusinessTaxId] = useState('33AABCG1234F1Z5');
  const [contactPerson, setContactPerson] = useState('Sundaramurthy Pillai (VP Operations)');
  const [contactPhone, setContactPhone] = useState('+91 98421 77650');
  const [states, setStates] = useState('Tamil Nadu');
  const [districts, setDistricts] = useState('Salem, Chennai, Coimbatore, Erode, Namakkal, Dharmapuri, Thanjavur');
  const [taluks, setTaluks] = useState('Omalur, Salem West, Guindy, Adyar, Kumbakonam, RS Puram');
  const [serviceableAreas, setServiceableAreas] = useState('Salem-Chennai Agri Corridor, Cauvery Delta & Western Agro Belt');
  const [noGoAreas, setNoGoAreas] = useState('Valparai Ghat routes during monsoon; unpaved foot-trails');
  const [warehouses, setWarehouses] = useState('Salem Central Cold Hub, Chennai Guindy Cross-Dock, Coimbatore Agro Facility');
  const [vehicleTypes, setVehicleTypes] = useState('Tata Ace Pickup, Mahindra Bolero Maxi Truck, 16T Refrigerated Truck');
  const [fleetSize, setFleetSize] = useState('14');
  const [ownedOutsourced, setOwnedOutsourced] = useState('10 Owned, 4 Outsourced');
  const [avgTransitTime, setAvgTransitTime] = useState('4.5');
  const [maxWeightCapacity, setMaxWeightCapacity] = useState('18000');
  const [maxVolumeCapacity, setMaxVolumeCapacity] = useState('1200');

  // Classification manual override or auto
  const [selectedClassification, setSelectedClassification] = useState('BLUE'); // 'GREEN' | 'ORANGE' | 'BLUE'

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredAgency, setRegisteredAgency] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!legalName || !brandName || !businessTaxId) {
      addToast('Missing Details', 'Please fill in legal entity and business tax identification.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const agency = await firestoreService.registerDeliveryAgency({
        legalName,
        brandName,
        corporateOffice,
        businessTaxId,
        contactPerson,
        contactPhone,
        states: [states],
        districts: districts.split(',').map(s => s.trim()),
        taluks: taluks.split(',').map(s => s.trim()),
        serviceableAreas,
        noGoAreas,
        warehouses: warehouses.split(',').map(s => s.trim()),
        vehicleTypes: vehicleTypes.split(',').map(s => s.trim()),
        fleetSize: Number(fleetSize),
        ownedVehiclesCount: 10,
        outsourcedVehiclesCount: 4,
        avgTransitTimeHours: Number(avgTransitTime),
        maxWeightCapacityKg: Number(maxWeightCapacity),
        maxVolumeCapacityCuFt: Number(maxVolumeCapacity),
        classification: selectedClassification
      });

      addToast(
        'Agency Verified & Registered!',
        `Generated Agency ID: ${agency.agencyId} with ${agency.classification} Classification.`
      );
      setRegisteredAgency(agency);
    } catch (err) {
      addToast('Registration Error', err.message || 'Failed to register delivery agency.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Working Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('agency_dashboard')} label="Back to Logistics Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Delivery Agency Registration & KYC</h1>
            <p className="text-xs text-slate-500">Government revenue compliance, fleet classification & corridor verification</p>
          </div>
        </div>

        <Badge variant="state" size="md">
          🏛️ Logistics Carrier Desk
        </Badge>
      </div>

      {/* Tier Classification Explanation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setSelectedClassification('GREEN')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedClassification === 'GREEN'
              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-black uppercase text-emerald-950">GREEN Tier</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Local Level Agency</h4>
          <p className="text-[11px] text-slate-500 mt-1">Servicing local taluk & adjacent rural mandis (&lt; 50 km)</p>
        </div>

        <div
          onClick={() => setSelectedClassification('ORANGE')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedClassification === 'ORANGE'
              ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-xs font-black uppercase text-amber-950">ORANGE Tier</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">District Level Agency</h4>
          <p className="text-[11px] text-slate-500 mt-1">Comprehensive intra-district coverage & cold feeder routes (50–150 km)</p>
        </div>

        <div
          onClick={() => setSelectedClassification('BLUE')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedClassification === 'BLUE'
              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-xs font-black uppercase text-blue-950">BLUE Tier</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">State Level Agency</h4>
          <p className="text-[11px] text-slate-500 mt-1">Inter-district statewide express freight & reefer corridors (&gt; 100 km)</p>
        </div>
      </div>

      {/* Main Registration Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-900 rounded-2xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Carrier Verification & Fleet Capacity</h3>
                <p className="text-xs text-slate-500">All 16 mandatory regulatory fields for VIVAAN logistics onboarding</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-full">
              Automated Capacity Check
            </span>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Corporate & Legal Identification */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                1. Legal & Corporate Identification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="agency-legal-name-input"
                  label="Legal Name (Certificate of Incorporation)"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. GreenCorridor Agro Logistics Pvt Ltd"
                  required
                />
                <Input
                  id="agency-brand-name-input"
                  label="Brand / Operating Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. GreenCorridor Express"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="agency-tax-id-input"
                  label="Business / Tax Identification (GSTIN / PAN)"
                  value={businessTaxId}
                  onChange={(e) => setBusinessTaxId(e.target.value)}
                  placeholder="33AABCG1234F1Z5"
                  required
                />
                <Input
                  id="agency-contact-person-input"
                  label="Authorized Contact Person & Designation"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Sundaramurthy Pillai (VP Operations)"
                  required
                />
              </div>

              <Input
                id="agency-office-input"
                label="Corporate Office Address"
                value={corporateOffice}
                onChange={(e) => setCorporateOffice(e.target.value)}
                placeholder="Plot 12, SIDCO Industrial Estate, Guindy, Chennai"
                required
              />
            </div>

            {/* Section 2: Operational Coverage & Serviceable Area */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                2. Operational Geography & Corridor Coverage
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  id="agency-states-input"
                  label="Operating States"
                  value={states}
                  onChange={(e) => setStates(e.target.value)}
                  placeholder="Tamil Nadu"
                  required
                />
                <Input
                  id="agency-districts-input"
                  label="Operational Districts (Comma separated)"
                  value={districts}
                  onChange={(e) => setDistricts(e.target.value)}
                  placeholder="Salem, Chennai, Coimbatore"
                  required
                />
                <Input
                  id="agency-taluks-input"
                  label="Operational Taluks"
                  value={taluks}
                  onChange={(e) => setTaluks(e.target.value)}
                  placeholder="Omalur, Salem West, Guindy"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="agency-serviceable-areas-input"
                  label="Designated Serviceable Areas"
                  value={serviceableAreas}
                  onChange={(e) => setServiceableAreas(e.target.value)}
                  placeholder="Salem-Chennai Agri Corridor & Cauvery Delta"
                  required
                />
                <Input
                  id="agency-nogo-areas-input"
                  label="Restricted / No-Go Areas (Inaccessible terrains)"
                  value={noGoAreas}
                  onChange={(e) => setNoGoAreas(e.target.value)}
                  placeholder="Valparai Ghat routes during monsoon; unpaved trails"
                  required
                />
              </div>

              <Input
                id="agency-warehouses-input"
                label="Warehouses & Cross-Dock Hubs"
                value={warehouses}
                onChange={(e) => setWarehouses(e.target.value)}
                placeholder="Salem Central Cold Hub, Chennai Guindy Cross-Dock"
                required
              />
            </div>

            {/* Section 3: Fleet Size, Capacity & Transit Timelines */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-blue-700" />
                3. Fleet Size, Payload Capacities & Transit Speeds
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="agency-vehicle-types-input"
                  label="Active Vehicle Types in Fleet"
                  value={vehicleTypes}
                  onChange={(e) => setVehicleTypes(e.target.value)}
                  placeholder="Tata Ace Pickup, Mahindra Bolero Maxi Truck"
                  required
                />
                <Input
                  id="agency-owned-outsourced-input"
                  label="Owned vs Outsourced Vehicles Ratio"
                  value={ownedOutsourced}
                  onChange={(e) => setOwnedOutsourced(e.target.value)}
                  placeholder="10 Owned, 4 Outsourced"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  id="agency-fleet-size-input"
                  label="Total Fleet Size"
                  type="number"
                  value={fleetSize}
                  onChange={(e) => setFleetSize(e.target.value)}
                  placeholder="14"
                  required
                />
                <Input
                  id="agency-transit-time-input"
                  label="Avg Transit Time (Hours)"
                  type="number"
                  step="0.5"
                  value={avgTransitTime}
                  onChange={(e) => setAvgTransitTime(e.target.value)}
                  placeholder="4.5"
                  required
                />
                <Input
                  id="agency-max-weight-input"
                  label="Max Weight Capacity (kg)"
                  type="number"
                  value={maxWeightCapacity}
                  onChange={(e) => setMaxWeightCapacity(e.target.value)}
                  placeholder="18000"
                  required
                />
                <Input
                  id="agency-max-volume-input"
                  label="Max Volume Capacity (cu ft)"
                  type="number"
                  value={maxVolumeCapacity}
                  onChange={(e) => setMaxVolumeCapacity(e.target.value)}
                  placeholder="1200"
                  required
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveView('agency_dashboard')}
              >
                Cancel
              </Button>

              <Button
                id="agency-register-submit-btn"
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                icon={CheckCircle2}
              >
                {isSubmitting ? 'Verifying Agency...' : 'Verify & Register Delivery Agency'}
              </Button>
            </div>

          </form>
        </CardBody>
      </Card>

      {/* Verification Success Modal */}
      {registeredAgency && (
        <Modal
          isOpen={true}
          onClose={() => {
            setRegisteredAgency(null);
            setActiveView('agency_dashboard');
          }}
          title="Agency Verification & Classification Complete!"
        >
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-center space-y-1">
              <span className="text-3xl">🚚</span>
              <h3 className="text-base font-black text-sky-950">VIVAAN Verified Logistics Carrier</h3>
              <p className="text-xs text-sky-700">Digital carrier credential generated for farmgate-to-doorstep dispatch</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Generated Agency ID:</span>
                <span className="font-mono font-black text-sky-800 text-sm" id="conf-agency-id">{registeredAgency.agencyId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Classification Tier:</span>
                <span
                  id="conf-agency-classification"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-xs ${
                    registeredAgency.classification === 'GREEN'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : registeredAgency.classification === 'ORANGE'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    registeredAgency.classification === 'GREEN' ? 'bg-emerald-600' : registeredAgency.classification === 'ORANGE' ? 'bg-amber-600' : 'bg-blue-600'
                  }`}></span>
                  {registeredAgency.classification} ({registeredAgency.classificationLabel})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Operating Brand:</span>
                <span className="font-bold text-slate-900">{registeredAgency.brandName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Max Weight Capacity:</span>
                <span className="font-bold text-slate-900">{registeredAgency.maxWeightCapacityKg} kg</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Serviceable Districts:</span>
                <span className="font-bold text-slate-900 text-right max-w-xs truncate">{registeredAgency.districts.join(', ')}</span>
              </div>
            </div>

            <Button
              id="view-agency-dashboard-btn"
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setRegisteredAgency(null);
                setActiveView('agency_dashboard');
              }}
              icon={ArrowRight}
            >
              Open Agency Dashboard
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
}
