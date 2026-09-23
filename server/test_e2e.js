/**
 * VIVAAN – End-to-End Automated Verification Test Suite
 * Validates all required hackathon features across Farmers, Buyers, Logistics Agencies, Drivers, and Admin
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('================================================================');
  console.log('🌾 VIVAAN Digital Agricultural Marketplace - Verification Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`🧪 Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  // 1. Health
  await test('System Health & Multi-Role Metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (data.status !== 'HEALTHY') throw new Error('Unhealthy status');
    if (data.metrics.total_farmers < 1) throw new Error('No farmers loaded');
  });

  // 2. Farmer Registration & Land Patta Verification
  let registeredFarmerId = null;
  await test('Farmer Registration & Land Patta Verification Engine', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register-farmer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Annamalai Karuppan',
        primary_phone: '+919842991122',
        farmer_type: 'OWN_LAND',
        address: 'Tharamangalam Road, Salem',
        kyc_type: 'Aadhaar Card',
        kyc_number: 'XXXX-XXXX-9912',
        bank_account: 'SBIN0001234 - 9911223344',
        bank_ifsc: 'SBIN0001234',
        bank_name: 'State Bank of India',
        state: 'Tamil Nadu',
        district: 'Salem',
        taluk: 'Omalur',
        village: 'Kadayampatti',
        survey_no: '88',
        subdivision_no: '3C',
        patta_no: 'PAT-9912/2026',
        land_extent: '6.0 Acres',
        land_classification: 'Nanjai (Wetland)',
        soil_type: 'Red Loam',
        water_source: 'Canal & Borewell'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to register farmer');
    if (!data.farmer.vivaan_id.startsWith('VIV-FR-')) throw new Error('Invalid Farmer VIVAAN ID');
    registeredFarmerId = data.farmer.id;
  });

  // 3. Agency Registration & Classification
  let registeredAgencyId = null;
  await test('Logistics Agency Onboarding & Tier Classification', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register-agency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legal_name: 'Cauvery Cold Express Pvt Ltd',
        brand_name: 'Cauvery Express',
        service_type: 'DISTRICT',
        corp_office: '18 Bypass Road, Erode',
        tax_id: '33AABCC9911D1Z4',
        contact_name: 'K. Balaji',
        phone: '+919842001122',
        email: 'ops@cauveryexpress.in',
        serviceable_districts: ['Erode', 'Salem', 'Coimbatore'],
        max_weight_kg: 8000,
        cold_chain: true
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to register agency');
    if (data.agency.tier !== 'DISTRICT_ORANGE') throw new Error('Incorrect tier mapping');
    registeredAgencyId = data.agency.id;
  });

  // 4. Driver Enrollment Under Agency
  await test('Driver Application & Commercial DL Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_id: registeredAgencyId || 1,
        full_name: 'P. Arumugam',
        phone: '+919443881122',
        license_no: 'TN-30-20260008891',
        license_class: 'LMV',
        vehicle_type: 'Ashok Leyland Dost',
        vehicle_no: 'TN-33-BH-7711',
        max_weight_kg: 1500,
        home_district: 'Erode'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Driver registration failed');
    if (!data.driver.vivaan_id.startsWith('VIV-DR-')) throw new Error('Invalid Driver ID format');
  });

  // 5. Product Search & Mandi Pricing Comparison
  await test('Produce Catalog & APMC Mandi Benchmark Ticker', async () => {
    const res = await fetch(`${BASE_URL}/api/products?search=turmeric`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to search products');
    if (data.products.length === 0) throw new Error('Turmeric product not found');
    const p = data.products[0];
    if (p.price_per_unit <= p.mandi_price) throw new Error('Farmer direct price should exceed mandi rate');
  });

  // 6. Razorpay Escrow Intent Initialization
  let rzpOrderId = null;
  await test('Razorpay Escrow Payment Intent Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_inr: 1750 })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Payment intent failed');
    if (!data.razorpay_order_id.startsWith('order_rzp_')) throw new Error('Invalid Razorpay Order ID');
    rzpOrderId = data.razorpay_order_id;
  });

  // 7. Multi-Farmer Order Checkout
  let createdOrderId = null;
  let testDeliveryOtp = null;
  await test('Multi-Farmer Cart Bundling & Escrow Lock', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_id: 10,
        buyer_name: 'Aditi Sharma',
        buyer_phone: '+919841234567',
        items: [{ product_id: 'PRD-88210', quantity: 5 }],
        delivery_address: 'Flat 4B, Greenview Apts, Adyar, Chennai',
        delivery_district: 'Chennai',
        delivery_state: 'Tamil Nadu',
        payment_method: 'UPI',
        payment_id: rzpOrderId
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Order creation failed');
    if (data.order.escrow_status !== 'HELD_IN_ESCROW') throw new Error('Escrow status should be HELD_IN_ESCROW');
    createdOrderId = data.order.id;
    testDeliveryOtp = data.order.delivery_otp;
  });

  // 8. Serviceability Corridor Check
  await test('Corridor Serviceability Engine (Local vs State)', async () => {
    const res = await fetch(`${BASE_URL}/api/routing/check-serviceability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup_district: 'Salem',
        pickup_state: 'Tamil Nadu',
        delivery_district: 'Chennai',
        delivery_state: 'Tamil Nadu',
        weight_kg: 50
      })
    });
    const data = await res.json();
    if (!data.success || !data.is_serviceable) throw new Error('Corridor should be serviceable');
    if (data.required_level !== 'DISTRICT') throw new Error('Intra-state should require DISTRICT level');
  });

  // 9. Route Optimization (TSP Precedence Algorithm)
  await test('TSP Multi-Stop Route Optimization Engine', async () => {
    const res = await fetch(`${BASE_URL}/api/routing/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driver_lat: 11.6643,
        driver_lng: 78.1460,
        order_ids: [createdOrderId]
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Routing optimization failed');
    if (data.stops.length < 2) throw new Error('Insufficient stops returned');
    // Ensure Pickup precedes Delivery
    const pickupIdx = data.stops.findIndex(s => s.type === 'PICKUP');
    const deliveryIdx = data.stops.findIndex(s => s.type === 'DELIVERY');
    if (pickupIdx === -1 || deliveryIdx === -1 || pickupIdx > deliveryIdx) {
      throw new Error('Pickup must strictly precede Delivery in TSP route!');
    }
  });

  // 10. Live Driver GPS Telemetry Stream & Buyer Privacy
  await test('Live Telemetry Stream & Buyer Privacy Shield', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/live-tracking?role=BUYER`);
    const data = await res.json();
    if (!data.success) throw new Error('Live tracking fetch failed');
    if (!data.driver || typeof data.driver.lat !== 'number') throw new Error('Driver coordinates missing');
  });

  // 11. Delivery Confirmation OTP Handover & Escrow Payouts
  await test('Doorstep OTP Handover & Automated Escrow Release', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entered_otp: testDeliveryOtp,
        driver_id: 'VIV-DR-104582'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'OTP verification failed');
    if (!data.settlement.farmer_payout.includes('transferred')) throw new Error('Farmer payout failed');
  });

  // 12. AI Crop Advisory
  await test('AI Agro-Doctor Soil & Season Recommendations', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/crop-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        soil_type: 'Red Loam',
        season: 'Kharif',
        water_source: 'Borewell',
        state: 'Tamil Nadu'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('AI recommendation failed');
    if (data.recommended_crops.length === 0) throw new Error('No crops returned by AI');
  });

  // 13. Demand Forecasting
  await test('AI Mandi Demand & Price Horizon Forecasting', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/demand-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: 'Turmeric (Salem)' })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Demand forecasting failed');
    if (!data.projected_price_growth) throw new Error('Missing projected growth');
  });

  // 14. Realtime Agro-Weather Advisory
  await test('Real-Time Weather & Agricultural Spray Advisory', async () => {
    const res = await fetch(`${BASE_URL}/api/weather?district=Salem`);
    const data = await res.json();
    if (!data.success) throw new Error('Weather fetch failed');
    if (!data.agro_advisory) throw new Error('Missing agro advisory in weather response');
  });

  // 15. Admin Operations Console & Escrow Audit
  await test('National Operations Console & Escrow Liquidity Ledger', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    if (!data.success) throw new Error('Admin stats failed');
    if (typeof data.stats.total_trade_volume_inr !== 'number') throw new Error('Invalid trade volume metric');
  });

  console.log('\n================================================================');
  console.log(`🎉 TEST RUN COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests();
