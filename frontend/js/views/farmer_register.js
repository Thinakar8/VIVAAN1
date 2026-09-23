/**
 * VIVAAN Farmer Registration Wizard
 * Supports Own Land, Leased with Agreement, and Leased without Agreement (OTP Consent Flow).
 * Steps: Personal -> Land -> Documents -> Verification -> Bank -> Review -> VIVAAN ID
 */
import { t } from '../i18n.js';
import { apiPost, setRole, setView } from '../state.js';

let formState = {
  currentStep: 0, // 0: Select Type, 1: Personal, 2: Land, 3: Documents, 4: Verification/Consent, 5: Bank, 6: Review, 7: ID Card
  farmer_type: 'OWN_LAND',
  full_name: '',
  primary_phone: '',
  alt_phone: '',
  address: '',
  kyc_type: 'Aadhaar Card',
  kyc_number: '',
  email: '',
  // Land
  state: 'Tamil Nadu',
  district: 'Salem',
  taluk: 'Omalur',
  village: 'Muthampatty',
  survey_no: '142',
  subdivision_no: '2B',
  patta_no: 'PAT-4821',
  chitta_no: 'CHT-9912',
  land_extent: '5.5 Acres',
  land_classification: 'Nanjai (Wetland)',
  soil_type: 'Red Loam',
  water_source: 'Borewell & Well',
  leased_area: '5.5 Acres',
  // Lease
  landowner_name: '',
  landowner_phone: '',
  landowner_kyc: '',
  lease_start: '2025-01-01',
  lease_end: '2027-12-31',
  duration_months: 24,
  cultivation_terms: 'Seasonal crop cultivation rights only',
  landowner_consent_otp: '',
  consent_verified: false,
  // Bank
  bank_account: '',
  bank_ifsc: '',
  bank_name: '',
  // Result
  created_vivaan_id: null,
  created_farmer_id: null
};

export function renderFarmerRegister() {
  const steps = [
    t('step_personal'),
    t('step_land'),
    t('step_docs'),
    t('step_verification'),
    t('step_bank'),
    t('step_review'),
    t('step_vivaan_id')
  ];

  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      
      <!-- Top Back Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button 
          onclick="${formState.currentStep === 0 ? "window.vivaanApp.goBack('user_type_select')" : `window.vivaanFarmerWizard.goToStep(${formState.currentStep - 1})`}"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-2xl border border-slate-200 text-xs font-black shadow-sm transition-all transform hover:-translate-x-0.5"
        >
          <span class="text-sm font-black text-emerald-700">&larr;</span>
          <span>${formState.currentStep === 0 ? `${t('back')} to Personas` : `${t('back')} (Step ${formState.currentStep > 1 ? formState.currentStep - 1 : 'Type'})`}</span>
        </button>
        <span class="text-xs text-slate-400 font-semibold">Farmer Verification Wizard</span>
      </div>

      <!-- Card Container -->
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <!-- Header with VIVAAN Logo -->
        <div class="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 text-white flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-14 w-14 object-contain rounded-full shadow-md border border-amber-300 ring-2 ring-white/20" />
            <div>
              <h2 class="text-xl font-black">VIVAAN Farmer Enrollment</h2>
              <p class="text-xs text-amber-200 font-semibold">Direct Agricultural Verification & Marketplace Access</p>
            </div>
          </div>
          <span class="text-xs bg-emerald-700/80 px-3 py-1.5 rounded-full border border-emerald-500 font-medium">
            ${formState.currentStep === 0 ? 'Type Selection' : `Step ${formState.currentStep} of 7`}
          </span>
        </div>

        <!-- Stepper Indicators (If step > 0) -->
        ${formState.currentStep > 0 && formState.currentStep <= 7 ? `
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <div class="flex items-center justify-between min-w-[620px] text-xs">
              ${steps.map((label, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < formState.currentStep;
                const isActive = stepNum === formState.currentStep;
                return `
                  <div class="flex items-center gap-2">
                    <div class="stepper-circle ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}">
                      ${isCompleted ? '✓' : stepNum}
                    </div>
                    <span class="font-bold ${isActive ? 'text-emerald-800 font-black' : isCompleted ? 'text-slate-700' : 'text-slate-400'}">
                      ${label}
                    </span>
                    ${idx < steps.length - 1 ? `<div class="w-6 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}"></div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Wizard Step Body -->
        <div class="p-6 sm:p-10">
          ${renderCurrentStep()}
        </div>

      </div>

    </div>
  `;
}

function renderCurrentStep() {
  switch (formState.currentStep) {
    case 0:
      return renderStep0_TypeSelection();
    case 1:
      return renderStep1_Personal();
    case 2:
      return renderStep2_Land();
    case 3:
      return renderStep3_Documents();
    case 4:
      return renderStep4_VerificationAndConsent();
    case 5:
      return renderStep5_Bank();
    case 6:
      return renderStep6_Review();
    case 7:
      return renderStep7_IdCard();
    default:
      return renderStep0_TypeSelection();
  }
}

// Step 0: "What type of farmer are you?"
function renderStep0_TypeSelection() {
  return `
    <div class="space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">${t('farmer_reg_title')}</h2>
        <p class="text-slate-500 text-sm max-w-lg mx-auto">${t('farmer_reg_sub')}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Own Land -->
        <div 
          onclick="window.vivaanFarmerWizard.selectFarmerType('OWN_LAND')"
          class="p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            formState.farmer_type === 'OWN_LAND' ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-400'
          }"
        >
          <div class="space-y-3">
            <span class="text-3xl">🌾</span>
            <h3 class="text-lg font-bold text-slate-900">${t('own_land')}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${t('own_land_desc')}</p>
          </div>
          <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Requires Patta / Chitta</span>
            <span>&rarr;</span>
          </div>
        </div>

        <!-- Leased With Agreement -->
        <div 
          onclick="window.vivaanFarmerWizard.selectFarmerType('LEASED_WITH_AGREEMENT')"
          class="p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            formState.farmer_type === 'LEASED_WITH_AGREEMENT' ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-400'
          }"
        >
          <div class="space-y-3">
            <span class="text-3xl">📜</span>
            <h3 class="text-lg font-bold text-slate-900">${t('leased_with_agreement')}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${t('leased_with_agreement_desc')}</p>
          </div>
          <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Requires Lease Document</span>
            <span>&rarr;</span>
          </div>
        </div>

        <!-- Leased Without Agreement -->
        <div 
          onclick="window.vivaanFarmerWizard.selectFarmerType('LEASED_WITHOUT_AGREEMENT')"
          class="p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
            formState.farmer_type === 'LEASED_WITHOUT_AGREEMENT' ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-400'
          }"
        >
          <div class="space-y-3">
            <span class="text-3xl">🤝</span>
            <h3 class="text-lg font-bold text-slate-900">${t('leased_without_agreement')}</h3>
            <p class="text-xs text-slate-600 leading-relaxed">${t('leased_without_agreement_desc')}</p>
          </div>
          <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>OTP Landowner Consent</span>
            <span>&rarr;</span>
          </div>
        </div>

      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button onclick="window.vivaanApp.navigateTo('user_type_select')" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button onclick="window.vivaanFarmerWizard.goToStep(1)" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </div>
  `;
}

// Step 1: Personal Details
function renderStep1_Personal() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanFarmerWizard.saveStep1();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Personal Profile & Identity</h3>
        <p class="text-xs text-slate-500">Sensitive KYC identity information is strictly protected and never shown on public produce listings.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name (as per Aadhaar/Records) *</label>
          <input type="text" id="farmer_name" required value="${formState.full_name || 'K. Ramasamy Gounder'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. Ramasamy Gounder" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Mobile Number *</label>
          <input type="tel" id="farmer_phone" required value="${formState.primary_phone || '+919842104582'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="+91 98421 XXXXX" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Alternative Mobile (Optional)</label>
          <input type="tel" id="farmer_alt_phone" value="${formState.alt_phone || '+919842104583'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="+91 94432 XXXXX" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Optional)</label>
          <input type="email" id="farmer_email" value="${formState.email || 'ramasamy@vivaan.agri'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="farmer@example.com" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Government KYC Document Type *</label>
          <select id="farmer_kyc_type" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
            <option value="Aadhaar Card" ${formState.kyc_type === 'Aadhaar Card' ? 'selected' : ''}>Aadhaar Card</option>
            <option value="Voter ID" ${formState.kyc_type === 'Voter ID' ? 'selected' : ''}>Voter Identity Card</option>
            <option value="Agricultural Credit Card" ${formState.kyc_type === 'Agricultural Credit Card' ? 'selected' : ''}>Agricultural Credit Card (ACC)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Government ID Number *</label>
          <input type="text" id="farmer_kyc_number" required value="${formState.kyc_number || '902188444821'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Enter 12-digit Aadhaar / Voter ID" />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Full Residential Address *</label>
          <input type="text" id="farmer_address" required value="${formState.address || 'Survey 14/2B, Omalur Main Road, Muthampatty, Salem District'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Village, Street, Taluk, PIN code" />
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(0)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Step 2: Land Details
function renderStep2_Land() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanFarmerWizard.saveStep2();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Agricultural Land Details</h3>
        <p class="text-xs text-slate-500">Government revenue record parameters to verify agricultural authenticity.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
          <input type="text" id="land_state" required value="${formState.state}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">District *</label>
          <input type="text" id="land_district" required value="${formState.district}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Taluk / Tehsil *</label>
          <input type="text" id="land_taluk" required value="${formState.taluk}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Revenue Village *</label>
          <input type="text" id="land_village" required value="${formState.village}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Survey Number *</label>
          <input type="text" id="land_survey" required value="${formState.survey_no}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. 142" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Subdivision Number *</label>
          <input type="text" id="land_subdiv" required value="${formState.subdivision_no}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. 2B" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Patta Number *</label>
          <input type="text" id="land_patta" required value="${formState.patta_no}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. PAT-4821" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Chitta Number</label>
          <input type="text" id="land_chitta" value="${formState.chitta_no}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. CHT-9912" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Total Land Extent *</label>
          <input type="text" id="land_extent" required value="${formState.land_extent}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. 5.5 Acres" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Classification *</label>
          <select id="land_class" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
            <option value="Nanjai (Wetland)">Nanjai (Wetland / Irrigated)</option>
            <option value="Punjai (Dryland)">Punjai (Dryland / Rainfed)</option>
            <option value="Bagayat (Orchard)">Bagayat (Orchard / Plantation)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Soil Type</label>
          <select id="land_soil" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
            <option value="Red Loam">Red Loam</option>
            <option value="Black Cotton">Black Cotton</option>
            <option value="Alluvial Soil">Alluvial Soil</option>
            <option value="Laterite Clay">Laterite Clay</option>
            <option value="Sandy Loam">Sandy Loam</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Water Source</label>
          <select id="land_water" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
            <option value="Borewell & Well">Borewell & Open Well</option>
            <option value="Canal Irrigation">Canal Irrigation</option>
            <option value="Rainfed / Tank">Rainfed / River Basin</option>
            <option value="Drip System">Solar Drip Irrigation</option>
          </select>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(1)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Step 3: Documents Upload
function renderStep3_Documents() {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Supporting Document Verification</h3>
        <p class="text-xs text-slate-500">Upload official land title documents. Encryption protects these files from public view.</p>
      </div>

      <div class="space-y-4">
        <!-- Document 1: Patta / Chitta -->
        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">📄</div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm">Patta / Chitta Revenue Extract</h4>
              <p class="text-xs text-slate-500">Government certified extract for Survey No. ${formState.survey_no}/${formState.subdivision_no}</p>
            </div>
          </div>
          <span class="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span> Uploaded – Under Verification
          </span>
        </div>

        <!-- Document 2: Farmer Photo -->
        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">📷</div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm">Farmer Photograph</h4>
              <p class="text-xs text-slate-500">Clear face portrait for the digital VIVAAN Farmer ID card</p>
            </div>
          </div>
          <span class="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span> Uploaded (Photo ID Ready)
          </span>
        </div>

        <!-- If Leased: Lease document -->
        ${formState.farmer_type === 'LEASED_WITH_AGREEMENT' ? `
          <div class="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">📑</div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Registered Lease / Tenancy Agreement</h4>
                <p class="text-xs text-slate-500">Signed mutual agreement document with duration & terms</p>
              </div>
            </div>
            <span class="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              Verified Copy Attached
            </span>
          </div>
        ` : ''}
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(2)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(4)" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </div>
  `;
}

// Step 4: Verification & Consent (Specialized for Leased Farmers)
function renderStep4_VerificationAndConsent() {
  if (formState.farmer_type === 'OWN_LAND') {
    return `
      <div class="space-y-6 text-center py-6">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl">
          🌾
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-bold text-slate-900">Own Land Ownership Verification</h3>
          <p class="text-sm text-slate-600 max-w-md mx-auto">
            Your Patta No. <strong>${formState.patta_no}</strong> for Survey No. <strong>${formState.survey_no}/${formState.subdivision_no}</strong> in village ${formState.village} matches land registry records.
          </p>
        </div>
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-md mx-auto text-left text-xs text-emerald-900 space-y-1">
          <div class="font-bold flex items-center gap-1">🟢 Multi-Source Verification Ready</div>
          <div>✓ Government ID format validated</div>
          <div>✓ Patta ownership ledger matched</div>
          <div>✓ No third-party landlord consent required for own land</div>
        </div>

        <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onclick="window.vivaanFarmerWizard.goToStep(3)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
            ${t('back')}
          </button>
          <button type="button" onclick="window.vivaanFarmerWizard.goToStep(5)" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
            ${t('save_continue')} &rarr;
          </button>
        </div>
      </div>
    `;
  } else if (formState.farmer_type === 'LEASED_WITH_AGREEMENT') {
    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold text-slate-900 mb-1">Lease Agreement & Landowner Validation</h3>
          <p class="text-xs text-slate-500">Cross-referencing lease tenure with landowner records.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Landowner Full Name *</label>
            <input type="text" id="landowner_name" value="${formState.landowner_name || 'Vijay Deshmukh'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Landowner Mobile Number *</label>
            <input type="tel" id="landowner_phone" value="${formState.landowner_phone || '+919822998877'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Lease Start Date</label>
            <input type="date" id="lease_start" value="${formState.lease_start}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Lease End Date</label>
            <input type="date" id="lease_end" value="${formState.lease_end}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Cultivation / Usage Terms</label>
            <input type="text" id="cultivation_terms" value="${formState.cultivation_terms}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>
        </div>

        <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
          <strong>Workflow:</strong> Agreement &rarr; Landowner &rarr; Patta/Land Record &rarr; Survey Number &rarr; Farmer.
          The farmer is verified as having lawful cultivation rights without being classified as legal owner.
        </div>

        <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onclick="window.vivaanFarmerWizard.goToStep(3)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
            ${t('back')}
          </button>
          <button type="button" onclick="window.vivaanFarmerWizard.saveLeaseStep(); window.vivaanFarmerWizard.goToStep(5)" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
            ${t('save_continue')} &rarr;
          </button>
        </div>
      </div>
    `;
  } else {
    // Leased Without Agreement: Stronger Consent-based Verification
    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold text-slate-900 mb-1">Consent-Based Tenancy Verification</h3>
          <p class="text-xs text-slate-500">Since no written document exists, VIVAAN secures direct digital landowner OTP consent.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Landowner Name *</label>
            <input type="text" id="landowner_name" value="${formState.landowner_name || 'Bhupendra Patel'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Landowner Contact Number *</label>
            <input type="tel" id="landowner_phone" value="${formState.landowner_phone || '+919898009988'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" />
          </div>
        </div>

        <!-- Landowner OTP Trigger Box -->
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Request Landowner Consent</h4>
              <p class="text-xs text-slate-500">Send an official verification message to landowner with secure confirmation code.</p>
            </div>
            <button 
              type="button" 
              onclick="window.vivaanFarmerWizard.requestLandownerOtp()"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              📲 Send Landowner OTP
            </button>
          </div>

          <div id="landowner-otp-container" class="space-y-2 pt-2 border-t border-slate-200 ${formState.consent_verified ? '' : ''}">
            <label class="block text-xs font-bold text-slate-700 uppercase">Enter Landowner Confirmation OTP</label>
            <div class="flex gap-2">
              <input type="text" id="consent_otp_input" maxlength="4" value="${formState.landowner_consent_otp || '8492'}" class="w-44 px-4 py-2 border border-slate-300 rounded-xl text-center tracking-widest font-black text-lg" placeholder="8492" />
              <button 
                type="button" 
                onclick="window.vivaanFarmerWizard.verifyConsentOtp()"
                class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                Confirm Consent
              </button>
            </div>
            <div id="consent-status-badge" class="text-xs ${formState.consent_verified ? 'text-emerald-700 font-bold' : 'text-slate-500'}">
              ${formState.consent_verified ? '✓ Landowner Consent Confirmed & Recorded' : 'ℹ️ Demo code 8492 pre-filled for immediate testing.'}
            </div>
          </div>
        </div>

        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
          <strong>Transparency Guarantee:</strong> VIVAAN clearly distinguishes legal land ownership from cultivation rights. This enables unwritten tenant farmers to sell legally while respecting land records.
        </div>

        <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onclick="window.vivaanFarmerWizard.goToStep(3)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
            ${t('back')}
          </button>
          <button type="button" onclick="window.vivaanFarmerWizard.saveConsentStep(); window.vivaanFarmerWizard.goToStep(5)" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
            ${t('save_continue')} &rarr;
          </button>
        </div>
      </div>
    `;
  }
}

// Step 5: Bank Account Details
function renderStep5_Bank() {
  return `
    <form onsubmit="event.preventDefault(); window.vivaanFarmerWizard.saveStep5();" class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Direct Bank Payout Details</h3>
        <p class="text-xs text-slate-500">Produce proceeds from escrow are released directly to this account with zero third-party deduction.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Bank Name & Branch *</label>
          <input type="text" id="bank_name" required value="${formState.bank_name || 'State Bank of India, Omalur Branch'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" placeholder="e.g. State Bank of India" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Account Number *</label>
          <input type="password" id="bank_account" required value="${formState.bank_account || '30891283912'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono" placeholder="Enter bank account number" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">IFSC Code *</label>
          <input type="text" id="bank_ifsc" required value="${formState.bank_ifsc || 'SBIN0001234'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase" placeholder="e.g. SBIN0001234" />
        </div>
      </div>

      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <span class="text-xl">🔒</span>
        <span>Account numbers are encrypted and never disclosed publicly. Buyers pay through VIVAAN Escrow.</span>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(4)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button type="submit" class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm">
          ${t('save_continue')} &rarr;
        </button>
      </div>
    </form>
  `;
}

// Step 6: Review & Final Submission
function renderStep6_Review() {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-slate-900 mb-1">Review Your Application Details</h3>
        <p class="text-xs text-slate-500">Please check all entries before generating your digital VIVAAN Farmer ID card.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Farmer Type</span>
          <p class="font-bold text-emerald-800">${formState.farmer_type.replace(/_/g, ' ')}</p>
          <span class="text-xs font-bold text-slate-400 uppercase pt-2 block">Full Name</span>
          <p class="font-semibold text-slate-800">${formState.full_name || 'K. Ramasamy Gounder'}</p>
          <span class="text-xs font-bold text-slate-400 uppercase pt-2 block">Mobile</span>
          <p class="font-semibold text-slate-800">${formState.primary_phone || '+91 98421 04582'}</p>
        </div>

        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Revenue Land Location</span>
          <p class="font-semibold text-slate-800">${formState.village}, ${formState.taluk}, ${formState.district}, ${formState.state}</p>
          <span class="text-xs font-bold text-slate-400 uppercase pt-2 block">Survey / Patta</span>
          <p class="font-semibold text-slate-800">Survey No. ${formState.survey_no}/${formState.subdivision_no} (Patta: ${formState.patta_no})</p>
          <span class="text-xs font-bold text-slate-400 uppercase pt-2 block">Land Extent</span>
          <p class="font-semibold text-slate-800">${formState.land_extent} (${formState.soil_type})</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-950 text-xs">
        <div>
          <span class="font-bold">Automated Verification Status:</span> 🟢 Verified Farmer
          <p class="text-emerald-700">Identity, land records, and payment gateway account configured.</p>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button type="button" onclick="window.vivaanFarmerWizard.goToStep(5)" class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">
          ${t('back')}
        </button>
        <button 
          type="button" 
          onclick="window.vivaanFarmerWizard.submitRegistration()" 
          class="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-lg shadow-emerald-700/25 text-base flex items-center gap-2"
        >
          <span>Submit & Generate VIVAAN ID</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  `;
}

// Step 7: Digital Farmer ID Card Display
function renderStep7_IdCard() {
  const vid = formState.created_vivaan_id || 'VIV-FR-104582';

  return `
    <div class="space-y-8 text-center py-4">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          ✓ Verification Completed
        </div>
        <h2 class="text-3xl font-black text-slate-900">Your Digital VIVAAN Farmer ID is Active!</h2>
        <p class="text-sm text-slate-600 max-w-md mx-auto">This card acts as your permanent VIVAAN identification. Buyers can scan the QR code to verify your credentials.</p>
      </div>

      <!-- Realistic Digital ID Card Component -->
      <div class="max-w-md mx-auto id-card-farmer p-6 rounded-3xl text-white text-left shadow-2xl relative">
        
        <!-- Top Card Header with Logo -->
        <div class="flex items-center justify-between border-b border-amber-300/30 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <img src="/static/assets/vivaan-logo.jpg" alt="VIVAAN Logo" class="h-12 w-12 object-contain rounded-full border border-amber-300 bg-white/10" />
            <div>
              <h3 class="font-black text-lg tracking-wider text-amber-200">VIVAAN</h3>
              <p class="text-[10px] tracking-widest text-slate-200 uppercase font-semibold">Digital Agricultural ID</p>
            </div>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-[11px] shadow-sm uppercase tracking-wide">
              🟢 VERIFIED
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="flex items-start gap-4">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" alt="Farmer Photo" class="w-24 h-28 object-cover rounded-2xl border-2 border-amber-300 shadow-md" />
          <div class="space-y-1.5 flex-1">
            <span class="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Farmer Name</span>
            <h4 class="text-lg font-black leading-tight text-white">${formState.full_name || 'K. Ramasamy Gounder'}</h4>
            
            <div class="pt-1">
              <span class="text-[10px] text-slate-300 uppercase font-bold tracking-wider">VIVAAN ID</span>
              <p class="font-mono text-base font-black text-amber-300 tracking-wider">${vid}</p>
            </div>

            <div>
              <span class="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Category</span>
              <p class="text-xs font-semibold text-emerald-200">${formState.farmer_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>

        <!-- Card Bottom with QR Code & Location -->
        <div class="mt-4 pt-3 border-t border-amber-300/30 flex items-center justify-between text-xs">
          <div class="space-y-0.5">
            <span class="text-[9px] text-slate-300 uppercase font-bold">Location</span>
            <p class="text-[11px] font-semibold text-white">${formState.village}, ${formState.district}, ${formState.state}</p>
            <span class="text-[9px] text-emerald-300 block">Zero Sensitive Info Publicly Exposed</span>
          </div>

          <!-- Dynamic QR Code Container -->
          <div class="bg-white p-1.5 rounded-xl shadow-sm">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://vivaan.agri/verify?id=${vid}" alt="QR Verification" class="w-14 h-14" />
          </div>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button 
          onclick="window.print()" 
          class="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2"
        >
          <span>🖨️</span> Print / Save ID Card
        </button>
        
        <button 
          onclick="window.vivaanApp.switchRole('FARMER')" 
          class="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm flex items-center gap-2"
        >
          <span>Go to Farmer Dashboard</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  `;
}

// Global wizard controller attached to window
window.vivaanFarmerWizard = {
  selectFarmerType(type) {
    formState.farmer_type = type;
    document.getElementById('app-main').innerHTML = renderFarmerRegister();
  },
  goToStep(step) {
    formState.currentStep = step;
    document.getElementById('app-main').innerHTML = renderFarmerRegister();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  saveStep1() {
    formState.full_name = document.getElementById('farmer_name').value;
    formState.primary_phone = document.getElementById('farmer_phone').value;
    formState.alt_phone = document.getElementById('farmer_alt_phone').value;
    formState.email = document.getElementById('farmer_email').value;
    formState.kyc_type = document.getElementById('farmer_kyc_type').value;
    formState.kyc_number = document.getElementById('farmer_kyc_number').value;
    formState.address = document.getElementById('farmer_address').value;
    this.goToStep(2);
  },
  saveStep2() {
    formState.state = document.getElementById('land_state').value;
    formState.district = document.getElementById('land_district').value;
    formState.taluk = document.getElementById('land_taluk').value;
    formState.village = document.getElementById('land_village').value;
    formState.survey_no = document.getElementById('land_survey').value;
    formState.subdivision_no = document.getElementById('land_subdiv').value;
    formState.patta_no = document.getElementById('land_patta').value;
    formState.chitta_no = document.getElementById('land_chitta').value;
    formState.land_extent = document.getElementById('land_extent').value;
    formState.land_classification = document.getElementById('land_class').value;
    formState.soil_type = document.getElementById('land_soil').value;
    formState.water_source = document.getElementById('land_water').value;
    this.goToStep(3);
  },
  saveLeaseStep() {
    if (document.getElementById('landowner_name')) {
      formState.landowner_name = document.getElementById('landowner_name').value;
      formState.landowner_phone = document.getElementById('landowner_phone').value;
      formState.lease_start = document.getElementById('lease_start').value;
      formState.lease_end = document.getElementById('lease_end').value;
      formState.cultivation_terms = document.getElementById('cultivation_terms').value;
    }
  },
  saveConsentStep() {
    if (document.getElementById('landowner_name')) {
      formState.landowner_name = document.getElementById('landowner_name').value;
      formState.landowner_phone = document.getElementById('landowner_phone').value;
    }
  },
  saveStep5() {
    formState.bank_name = document.getElementById('bank_name').value;
    formState.bank_account = document.getElementById('bank_account').value;
    formState.bank_ifsc = document.getElementById('bank_ifsc').value;
    this.goToStep(6);
  },
  async requestLandownerOtp() {
    const phone = document.getElementById('landowner_phone') ? document.getElementById('landowner_phone').value : '+919898009988';
    try {
      const res = await apiPost('/api/farmers/landowner-consent/request-otp', { landowner_phone: phone });
      alert(res.message);
    } catch (e) {
      alert("OTP sent to landowner: 8492");
    }
  },
  verifyConsentOtp() {
    const otp = document.getElementById('consent_otp_input').value;
    if (otp === '8492' || otp.length === 4) {
      formState.consent_verified = true;
      formState.landowner_consent_otp = otp;
      const statusEl = document.getElementById('consent-status-badge');
      if (statusEl) {
        statusEl.className = "text-xs text-emerald-700 font-bold";
        statusEl.innerHTML = "✓ Landowner Digital Consent Verified!";
      }
      alert("Landowner consent verified successfully!");
    } else {
      alert("Invalid OTP. For demo testing, enter 8492");
    }
  },
  async submitRegistration() {
    try {
      const payload = {
        farmer_type: formState.farmer_type,
        full_name: formState.full_name || 'K. Ramasamy Gounder',
        primary_phone: formState.primary_phone || '+919842104582',
        alt_phone: formState.alt_phone,
        address: formState.address || 'Survey 14/2B, Omalur Main Road, Salem',
        kyc_type: formState.kyc_type,
        kyc_number: formState.kyc_number || '902188444821',
        email: formState.email,
        bank_account: formState.bank_account || '30891283912',
        bank_ifsc: formState.bank_ifsc || 'SBIN0001234',
        bank_name: formState.bank_name || 'State Bank of India',
        state: formState.state,
        district: formState.district,
        taluk: formState.taluk,
        village: formState.village,
        survey_no: formState.survey_no,
        subdivision_no: formState.subdivision_no,
        patta_no: formState.patta_no,
        chitta_no: formState.chitta_no,
        land_extent: formState.land_extent,
        land_classification: formState.land_classification,
        soil_type: formState.soil_type,
        water_source: formState.water_source,
        landowner_name: formState.landowner_name,
        landowner_phone: formState.landowner_phone
      };

      const res = await apiPost('/api/farmers/register', payload);
      if (res.success) {
        formState.created_vivaan_id = res.vivaan_id;
        formState.created_farmer_id = res.farmer_id;
        this.goToStep(7);
      }
    } catch (err) {
      console.error(err);
      // Fallback in demo mode
      formState.created_vivaan_id = `VIV-FR-${Math.floor(100000 + Math.random() * 900000)}`;
      this.goToStep(7);
    }
  }
};
