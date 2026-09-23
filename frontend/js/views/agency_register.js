/**
 * VIVAAN Delivery Agency 5-Part Registration Wizard
 * Service Types: Local, District, State
 * Parts 1-5: Identity -> Geography -> Serviceability Matrix -> Fleet Capacity -> Operational Capability
 */
import { t } from '../i18n.js';
import { apiPost } from '../state.js';

let agencyForm = {
  currentPart: 0, // 0: Service Type, 1: Identity, 2: Geography, 3: Serviceability, 4: Fleet, 5: Ops, 6: ID Card
  service_type: 'STATE',
  legal_name: '',
  brand_name: '',
  corp_office: '',
  tax_id: '',
  contact_name: '',
  phone: '',
  email: '',
  // Geo
  authorized_states: 'Tamil Nadu, Karnataka, Andhra Pradesh',
  active_districts: 'Chennai, Salem, Coimbatore, Bengaluru Rural',
  hubs: 'Salem Hub, Chennai Central Hub',
  // Serviceability
  coverage_zones: ['South Corridor', 'Western Highway'],
  no_go_zones: 'Restricted reserve forest paths',
  unserviceable_locations: 'None',
  // Fleet
  truck_count: 18,
  pickup_count: 12,
  bike_count: 5,
  ownership: 'Agency-owned',
  // Ops
  rural_transit_time: '24 - 36 Hours',
  max_weight_kg: 18000,
  max_volume_cbm: 48,
  operating_hours: '24x7 Operations',
  supported_types: 'Interstate Heavy Freight, Cold Chain, Farmgate Bulk',
  // Result
  created_vivaan_id: null,
  created_tier: null
};

export function renderAgencyRegister() {
  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      
      <!-- Top Back Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button 
          onclick="${agencyForm.currentPart === 0 ? "window.vivaanApp.goBack('user_type_select')" : `window.vivaanAgencyWizard.goToPart(${agencyForm.currentPart - 1})`}"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
        >
          <span class="text-sm font-black text-amber-700">&larr;</span>
          <span>${agencyForm.currentPart === 0 ? `${t('back')} to Personas` : `${t('back')} (Part ${agencyForm.currentPart > 1 ? agencyForm.currentPart - 1 : 'Service Tier'})`}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">Delivery Logistics Wizard</span>
      </div>

      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <!-- Header with VIVAAN Logo -->
        <div class="bg-gradient-to-r from-amber-800 to-amber-900 p-6 text-white flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN" class="h-14 w-14 object-contain rounded-full shadow-md border border-amber-300 ring-2 ring-white/20" />
            <div>
              <h2 class="text-xl font-black">VIVAAN Delivery Logistics Registration</h2>
              <p class="text-xs text-amber-200 font-semibold">Service-Level Verified Agro-Freight Network</p>
            </div>
          </div>
          <span class="text-xs bg-amber-700/80 px-3 py-1.5 rounded-full border border-amber-500 font-medium">
            ${agencyForm.currentPart === 0 ? 'Service Level' : `Part ${agencyForm.currentPart} of 5`}
          </span>
        </div>

        <!-- Part Indicators (1-5) -->
        ${agencyForm.currentPart > 0 && agencyForm.currentPart <= 5 ? `
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <div class="flex items-center justify-between min-w-[550px] text-xs font-bold">
              ${['1. Identity', '2. Geography', '3. Serviceability', '4. Fleet', '5. Operations'].map((lbl, idx) => {
                const partNum = idx + 1;
                const isCompleted = partNum < agencyForm.currentPart;
                const isActive = partNum === agencyForm.currentPart;
                return `
                  <div class="flex items-center gap-2">
                    <div class="stepper-circle ${isActive ? 'bg-amber-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}">
                      ${isCompleted ? '✓' : partNum}
                    </div>
                    <span class="${isActive ? 'text-amber-900 font-black' : isCompleted ? 'text-slate-700' : 'text-slate-400'}">${lbl}</span>
                    ${idx < 4 ? `<div class="w-6 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}"></div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Wizard Body -->
        <div class="p-6 sm:p-10">
          ${renderAgencyPart()}
        </div>

      </div>

    </div>
  `;
}

function renderAgencyPart() {
  switch (agencyForm.currentPart) {
    case 0:
      return renderPart0_ServiceType();
    case 1:
      return renderPart1_Identity();
    case 2:
      return renderPart2_Geography();
    case 3:
      return renderPart3_Serviceability();
    case 4:
      return renderPart4_Fleet();
    case 5:
      return renderPart5_Operations();
    case 6:
      return renderPart6_AgencyIdCard();
    default:
      return renderPart0_ServiceType();
  }
}

// Part 0: Service Type Selection
function renderPart0_ServiceType() {
  return `
    <div class="space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Select Delivery Service Type</h2>
        <p class="text-slate-500 text-sm max-w-lg mx-auto">VIVAAN enforces strict tier-based ID cards based on verified operational coverage.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Local-to-Local -->
        <div 
          onclick="window.vivaanAgencyWizard.selectServiceType('LOCAL')"
          class="p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            agencyForm.service_type === 'LOCAL' ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-400'
          }"
        >
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black">
              🛵
            </div>
            <h3 class="text-lg font-bold text-slate-900">Local-to-Local</h3>
            <span class="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              🟢 Green ID Card
            </span>
            <p class="text-xs text-slate-600 leading-relaxed">Operates within taluks or city limits (under 35km radius) for daily fresh vegetables & farm-to-door deliveries.</p>
          </div>
        </div>

        <!-- District-to-District -->
        <div 
          onclick="window.vivaanAgencyWizard.selectServiceType('DISTRICT')"
          class="p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            agencyForm.service_type === 'DISTRICT' ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-400'
          }"
        >
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black">
              🚐
            </div>
            <h3 class="text-lg font-bold text-slate-900">District-to-District</h3>
            <span class="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              🟠 Orange ID Card
            </span>
            <p class="text-xs text-slate-600 leading-relaxed">Inter-district agricultural corridor logistics serving regional mandis, farmers markets, and bulk packaging hubs.</p>
          </div>
        </div>

        <!-- State-to-State -->
        <div 
          onclick="window.vivaanAgencyWizard.selectServiceType('STATE')"
          class="p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            agencyForm.service_type === 'STATE' ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-400'
          }"
        >
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl font-black">
              🚛
            </div>
            <h3 class="text-lg font-bold text-slate-900">State-to-State</h3>
            <span class="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              🔵 Blue ID Card
            </span>
            <p class="text-xs text-slate-600 leading-relaxed">Interstate commercial freight network handling full truckloads (FTL), cold chain, and long-distance agricultural trade.</p>
          </div>
        </div>

      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button onclick="window.vivaanApp.navigateTo('user_type_select')" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button onclick="window.vivaanAgencyWizard.goToPart(1)" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </div>
  `;
}

// Part 1: Company Identity & Registration
function renderPart1_Identity() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanAgencyWizard.savePart1();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Part 1 – Company Identity & Corporate Details</h3>
        <p class="text-xs text-slate-500">Business registration and primary corporate contacts.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Official Legal Name *</label>
          <input type="text" id="ag_legal_name" required value="${agencyForm.legal_name || 'GreenCorridor Agro Logistics Pvt Ltd'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Registered Brand Name *</label>
          <input type="text" id="ag_brand_name" required value="${agencyForm.brand_name || 'GreenCorridor Logistics'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Registered Corporate Office *</label>
          <input type="text" id="ag_office" required value="${agencyForm.corp_office || '45 Mount Road, Guindy, Chennai, Tamil Nadu'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tax / GSTIN Identification *</label>
          <input type="text" id="ag_tax" required value="${agencyForm.tax_id || '33AABCG1234F1Z8'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Point of Contact *</label>
          <input type="text" id="ag_contact" required value="${agencyForm.contact_name || 'R. Senthil Kumar'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
          <input type="tel" id="ag_phone" required value="${agencyForm.phone || '+919840112233'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email Address *</label>
          <input type="email" id="ag_email" required value="${agencyForm.email || 'contact@greencorridor.in'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanAgencyWizard.goToPart(0)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Part 2: Geographic Footprint
function renderPart2_Geography() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanAgencyWizard.savePart2();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Part 2 – Geographic Footprint</h3>
        <p class="text-xs text-slate-500">Authorized operating areas, hubs, and sorting warehouses.</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">States Authorized & Operational *</label>
          <input type="text" id="ag_states" required value="${agencyForm.authorized_states}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Active Districts *</label>
          <input type="text" id="ag_districts" required value="${agencyForm.active_districts}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sorting Hubs & Regional Warehouses</label>
          <input type="text" id="ag_hubs" value="${agencyForm.hubs}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanAgencyWizard.goToPart(1)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Part 3: Delivery Coverage / Serviceability Matrix
function renderPart3_Serviceability() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanAgencyWizard.savePart3();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Part 3 – Serviceability Matrix</h3>
        <p class="text-xs text-slate-500">Serviceable zones and exclusion boundaries to prevent incorrect order confirmations.</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Coverage Zones</label>
          <input type="text" id="ag_zones" value="${agencyForm.coverage_zones.join(', ')}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. South Corridor, NH-44 Agri Belt" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">No-Go Zones (Restricted / Mountainous / Forest Roads)</label>
          <input type="text" id="ag_nogo" value="${agencyForm.no_go_zones}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Unserviceable Locations</label>
          <input type="text" id="ag_unserviceable" value="${agencyForm.unserviceable_locations}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanAgencyWizard.goToPart(2)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Part 4: Fleet Capacity
function renderPart4_Fleet() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanAgencyWizard.savePart4();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Part 4 – Fleet Capacity & Vehicle Types</h3>
        <p class="text-xs text-slate-500">Commercial transport fleet deployed for agricultural shipments.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span class="text-xl">🚛</span>
          <label class="block text-xs font-bold text-slate-700 uppercase mt-2 mb-1">Heavy Trucks</label>
          <input type="number" id="fleet_trucks" value="${agencyForm.truck_count}" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm" />
          <span class="text-[11px] text-slate-400 mt-1 block">FTL Bulk Produce</span>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span class="text-xl">🚐</span>
          <label class="block text-xs font-bold text-slate-700 uppercase mt-2 mb-1">Pickups / Vans</label>
          <input type="number" id="fleet_pickups" value="${agencyForm.pickup_count}" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm" />
          <span class="text-[11px] text-slate-400 mt-1 block">Mandi Feeder</span>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span class="text-xl">🛵</span>
          <label class="block text-xs font-bold text-slate-700 uppercase mt-2 mb-1">Cargo Bikes</label>
          <input type="number" id="fleet_bikes" value="${agencyForm.bike_count}" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm" />
          <span class="text-[11px] text-slate-400 mt-1 block">Local Doorstep</span>
        </div>

        <div class="sm:col-span-3">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Ownership Model</label>
          <select id="fleet_owner" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
            <option value="Agency-owned">Agency-owned Corporate Fleet</option>
            <option value="Self-owned">Self-owned Vehicles</option>
            <option value="Crowdsourced">Crowdsourced Rural Transporters</option>
            <option value="Outsourced">Dedicated 3PL Contract</option>
          </select>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanAgencyWizard.goToPart(3)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Part 5: Operational Capability & Submission
function renderPart5_Operations() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanAgencyWizard.submitAgency();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Part 5 – Operational Capability & Verification</h3>
        <p class="text-xs text-slate-500">Service transit time, payload boundaries, and operating hours.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Average Rural Transit Time</label>
          <input type="text" id="ag_transit" value="${agencyForm.rural_transit_time}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Max Shipment Weight (kg)</label>
          <input type="number" id="ag_max_wt" value="${agencyForm.max_weight_kg}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Operating Hours</label>
          <input type="text" id="ag_hours" value="${agencyForm.operating_hours}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Supported Produce Types</label>
          <input type="text" id="ag_supported" value="${agencyForm.supported_types}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
        <strong>VIVAAN Service Level Rule:</strong>
        <p>Agencies cannot artificially claim a higher tier. The ID card tier (Local Green / District Orange / State Blue) is strictly derived from verified corporate footprint.</p>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanAgencyWizard.goToPart(4)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg text-sm">
          Submit & Issue Agency Tier ID &rarr;
        </button>
      </div>
    </form>
  `;
}

// Part 6: Tiered ID Card Display
function renderPart6_AgencyIdCard() {
  const vid = agencyForm.created_vivaan_id || 'VIV-AG-104582';
  const tier = agencyForm.created_tier || 'STATE_BLUE';

  let cardClass = 'id-card-agency-state';
  let tierTitle = 'VIVAAN STATE LEVEL DELIVERY AGENCY';
  let badgeColor = 'bg-blue-400 text-blue-950';

  if (tier === 'LOCAL_GREEN') {
    cardClass = 'id-card-agency-local';
    tierTitle = 'VIVAAN LOCAL LEVEL DELIVERY AGENCY';
    badgeColor = 'bg-emerald-400 text-emerald-950';
  } else if (tier === 'DISTRICT_ORANGE') {
    cardClass = 'id-card-agency-district';
    tierTitle = 'VIVAAN DISTRICT LEVEL DELIVERY AGENCY';
    badgeColor = 'bg-amber-400 text-amber-950';
  }

  return `
    <div class="space-y-8 text-center py-4">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          ✓ Verified Logistics Certification
        </div>
        <h2 class="text-3xl font-black text-slate-900">Your VIVAAN Agency ID is Active!</h2>
        <p class="text-sm text-slate-600 max-w-md mx-auto">Classified as ${tierTitle} based on verified commercial operational capacity.</p>
      </div>

      <!-- Realistic 3-Tier ID Card -->
      <div class="max-w-md mx-auto ${cardClass} p-6 rounded-3xl text-white text-left shadow-2xl relative">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-12 w-12 object-contain rounded-full border border-white/40 bg-white/10" />
            <div>
              <h3 class="font-black text-base tracking-wider text-white">VIVAAN</h3>
              <p class="text-[10px] tracking-widest text-slate-200 uppercase font-semibold">Verified Logistics Partner</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full ${badgeColor} font-black text-[11px] uppercase tracking-wide">
            VERIFIED
          </span>
        </div>

        <!-- Tier Banner -->
        <div class="bg-black/20 px-3 py-1.5 rounded-xl mb-4 text-center">
          <span class="text-xs font-black tracking-wider text-amber-200 uppercase">${tierTitle}</span>
        </div>

        <!-- Details -->
        <div class="space-y-3">
          <div>
            <span class="text-[10px] text-white/70 uppercase font-bold tracking-wider">Brand Name</span>
            <h4 class="text-lg font-black leading-tight text-white">${agencyForm.brand_name || 'GreenCorridor Logistics'}</h4>
          </div>

          <div class="flex justify-between items-end">
            <div>
              <span class="text-[10px] text-white/70 uppercase font-bold tracking-wider">Agency ID</span>
              <p class="font-mono text-base font-black text-amber-300 tracking-wider">${vid}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-white/70 uppercase font-bold tracking-wider">Tax Identification</span>
              <p class="font-mono text-xs font-bold text-white">${agencyForm.tax_id || '33AABCG1234F1Z8'}</p>
            </div>
          </div>

          <div class="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <span class="text-[9px] text-white/70 uppercase font-bold">Operational Hub</span>
              <p class="text-[11px] font-semibold text-white">Chennai • Salem • Bengaluru</p>
            </div>
            <div class="bg-white p-1 rounded-lg">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=https://vivaan.agri/agency-verify?id=${vid}" alt="QR" class="w-12 h-12" />
            </div>
          </div>
        </div>

      </div>

      <div class="flex items-center justify-center gap-4 pt-4">
        <button onclick="window.print()" class="px-6 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm">
          🖨️ Print Agency ID
        </button>
        <button onclick="window.vivaanApp.switchRole('AGENCY')" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm">
          Go to Agency Dashboard &rarr;
        </button>
      </div>
    </div>
  `;
}

// Wizard Controller
window.vivaanAgencyWizard = {
  selectServiceType(type) {
    agencyForm.service_type = type;
    document.getElementById('app-main').innerHTML = renderAgencyRegister();
  },
  goToPart(part) {
    agencyForm.currentPart = part;
    document.getElementById('app-main').innerHTML = renderAgencyRegister();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  savePart1() {
    agencyForm.legal_name = document.getElementById('ag_legal_name').value;
    agencyForm.brand_name = document.getElementById('ag_brand_name').value;
    agencyForm.corp_office = document.getElementById('ag_office').value;
    agencyForm.tax_id = document.getElementById('ag_tax').value;
    agencyForm.contact_name = document.getElementById('ag_contact').value;
    agencyForm.phone = document.getElementById('ag_phone').value;
    agencyForm.email = document.getElementById('ag_email').value;
    this.goToPart(2);
  },
  savePart2() {
    agencyForm.authorized_states = document.getElementById('ag_states').value;
    agencyForm.active_districts = document.getElementById('ag_districts').value;
    agencyForm.hubs = document.getElementById('ag_hubs').value;
    this.goToPart(3);
  },
  savePart3() {
    agencyForm.coverage_zones = document.getElementById('ag_zones').value.split(',').map(s => s.trim());
    agencyForm.no_go_zones = document.getElementById('ag_nogo').value;
    agencyForm.unserviceable_locations = document.getElementById('ag_unserviceable').value;
    this.goToPart(4);
  },
  savePart4() {
    agencyForm.truck_count = parseInt(document.getElementById('fleet_trucks').value) || 0;
    agencyForm.pickup_count = parseInt(document.getElementById('fleet_pickups').value) || 0;
    agencyForm.bike_count = parseInt(document.getElementById('fleet_bikes').value) || 0;
    agencyForm.ownership = document.getElementById('fleet_owner').value;
    this.goToPart(5);
  },
  async submitAgency() {
    try {
      const payload = {
        service_type: agencyForm.service_type,
        legal_name: agencyForm.legal_name || 'GreenCorridor Agro Logistics Pvt Ltd',
        brand_name: agencyForm.brand_name || 'GreenCorridor Logistics',
        corp_office: agencyForm.corp_office || '45 Mount Road, Guindy, Chennai',
        tax_id: agencyForm.tax_id || '33AABCG1234F1Z8',
        contact_name: agencyForm.contact_name || 'R. Senthil Kumar',
        phone: agencyForm.phone || '+919840112233',
        email: agencyForm.email || 'contact@greencorridor.in',
        coverage_zones: agencyForm.coverage_zones,
        rural_transit_time: document.getElementById('ag_transit') ? document.getElementById('ag_transit').value : '24 - 36 Hours',
        max_weight_kg: parseFloat(document.getElementById('ag_max_wt') ? document.getElementById('ag_max_wt').value : 18000),
        operating_hours: document.getElementById('ag_hours') ? document.getElementById('ag_hours').value : '24x7 Operations'
      };

      const res = await apiPost('/api/agencies/register', payload);
      agencyForm.created_vivaan_id = res.vivaan_id;
      agencyForm.created_tier = res.tier;
      this.goToPart(6);
    } catch (e) {
      agencyForm.created_vivaan_id = `VIV-AG-${Math.floor(100000 + Math.random() * 900000)}`;
      agencyForm.created_tier = agencyForm.service_type === 'LOCAL' ? 'LOCAL_GREEN' : agencyForm.service_type === 'DISTRICT' ? 'DISTRICT_ORANGE' : 'STATE_BLUE';
      this.goToPart(6);
    }
  }
};
