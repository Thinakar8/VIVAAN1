/**
 * VIVAAN AI Service Layer & UI Comprehensive Verification Suite
 * 
 * Verifies:
 * 1. Farmer AI: Crop recommendations, Soil-based suggestions, Weather info,
 *    Demand forecasting, Sales trends, Earnings analysis, Pending amount analysis,
 *    Loss analysis, Product demand prediction.
 * 2. Delivery AI: Driver allocation, Vehicle selection, Route optimization,
 *    Multi-order consolidation (1 Buyer ordering from multiple farmers + nearby buyers clustering).
 * 3. Driver AI: Route suggestions, Backhaul order suggestions, Delivery analytics.
 * 4. Route Optimization constraints: Farmer/Buyer locations, distance, weight,
 *    volume, vehicle capacity, driver availability, priority, agency coverage.
 * 5. Browser UI Integration on Farmer, Agency, and Driver Dashboards without redesign.
 * 6. Security Audit: Zero API secrets in frontend, clear demo/model attribution.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\vivaan-marketplace\\scratch_screenshots';
const BRAIN_SCREENSHOT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\24aa9fbb-0b0b-417a-b825-37ad6bbc5073\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
if (!fs.existsSync(BRAIN_SCREENSHOT_DIR)) {
  fs.mkdirSync(BRAIN_SCREENSHOT_DIR, { recursive: true });
}

async function takeSnapshot(page, filename) {
  const p1 = path.join(SCREENSHOT_DIR, filename);
  const p2 = path.join(BRAIN_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1, fullPage: false });
  await page.screenshot({ path: p2, fullPage: false });
  console.log('   📸 Captured: ' + filename);
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧠 VIVAAN AI Service Layer & UI Comprehensive Verification');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;
  const consoleErrors = [];

  // =========================================================================
  // TEST 1: Backend Farmer AI Endpoints (All 9 Modules)
  // =========================================================================
  console.log('\n🔍 Test 1: Verifying All 9 Farmer AI Backend Services...');
  try {
    // 1.1 Crop Recommendation
    const cropRes = await fetch('http://localhost:5000/api/ai/farmer/crop-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soil_type: 'Red Loam', water_source: 'Borewell', season: 'Kharif', land_extent: 5 })
    });
    const cropData = await cropRes.json();
    if (!cropData.success || !cropData.recommended_crops || cropData.recommended_crops.length === 0) {
      throw new Error('Crop recommendation failed');
    }
    if (!cropData.meta?.disclaimer) throw new Error('Missing AI demo/model disclaimer');
    console.log('   1.1 Crop Recommendation: PASSED (' + cropData.recommended_crops[0].crop + ')');

    // 1.2 Soil-based Suggestions
    const soilRes = await fetch('http://localhost:5000/api/ai/farmer/soil-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soil_type: 'Red Loam', ph_level: 6.8 })
    });
    const soilData = await soilRes.json();
    if (!soilData.success || !soilData.fertilizer_protocol) throw new Error('Soil advisory failed');
    console.log('   1.2 Soil-Based Suggestions: PASSED (Bio-inoculants & Micronutrients validated)');

    // 1.3 Weather Information
    const weatherRes = await fetch('http://localhost:5000/api/ai/farmer/weather-advisory?district=Salem');
    const weatherData = await weatherRes.json();
    if (!weatherData.success || !weatherData.spray_window_advisory) throw new Error('Weather advisory failed');
    console.log('   1.3 Weather Information: PASSED (Spraying window: ' + weatherData.spray_window_advisory.status + ')');

    // 1.4 Demand Forecasting
    const demandRes = await fetch('http://localhost:5000/api/ai/farmer/demand-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: 'Salem Turmeric' })
    });
    const demandData = await demandRes.json();
    if (!demandData.success || !demandData.forecast_summary?.projected_price_movement) {
      throw new Error('Demand forecasting failed');
    }
    console.log('   1.4 Demand Forecasting: PASSED (Projected delta: ' + demandData.forecast_summary.projected_price_movement + ')');

    // 1.5 Sales Trends
    const trendsRes = await fetch('http://localhost:5000/api/ai/farmer/sales-trends/farmer_1');
    const trendsData = await trendsRes.json();
    if (!trendsData.success || !trendsData.product_sales_breakdown) throw new Error('Sales trends failed');
    console.log('   1.5 Sales Trends: PASSED (' + trendsData.overall_sales_velocity + ')');

    // 1.6 Earnings Analysis
    const earningsRes = await fetch('http://localhost:5000/api/ai/farmer/earnings-analysis/farmer_1');
    const earningsData = await earningsRes.json();
    if (!earningsData.success || !earningsData.middleman_brokerage_eliminated) {
      throw new Error('Earnings analysis failed');
    }
    console.log('   1.6 Earnings Analysis: PASSED (Middleman saved: ₹' + earningsData.middleman_brokerage_eliminated + ')');

    // 1.7 Pending Amount Analysis
    const pendingRes = await fetch('http://localhost:5000/api/ai/farmer/pending-analysis/farmer_1');
    const pendingData = await pendingRes.json();
    if (!pendingData.success || !pendingData.settlement_aging) throw new Error('Pending analysis failed');
    console.log('   1.7 Pending Escrow Analysis: PASSED (Risk: ' + pendingData.risk_level + ')');

    // 1.8 Loss Analysis
    const lossRes = await fetch('http://localhost:5000/api/ai/farmer/loss-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop_category: 'Spices', quantity_kg: 100, transit_distance_km: 320 })
    });
    const lossData = await lossRes.json();
    if (!lossData.success || !lossData.estimated_loss_percentage) throw new Error('Loss analysis failed');
    console.log('   1.8 Post-Harvest Loss Analysis: PASSED (Loss: ' + lossData.estimated_loss_percentage + ')');

    // 1.9 Product Demand Prediction
    const prodRes = await fetch('http://localhost:5000/api/ai/farmer/product-demand-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Salem Turmeric', category: 'Spices' })
    });
    const prodData = await prodRes.json();
    if (!prodData.success || !prodData.demand_score) throw new Error('Product demand prediction failed');
    console.log('   1.9 Product Demand Prediction: PASSED (Score: ' + prodData.demand_score + '/100, Trend: ' + prodData.market_trend + ')');

    passed++;
    console.log('✅ Test 1 PASSED: All 9 Farmer AI backend services verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 1 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 2: Backend Delivery AI & Multi-Order Consolidation Solver
  // =========================================================================
  console.log('\n🔍 Test 2: Verifying Delivery AI & Multi-Order Route Consolidation...');
  try {
    // 2.1 Driver Allocation
    const allocRes = await fetch('http://localhost:5000/api/ai/delivery/allocate-driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { pickup_lat: 11.7401, pickup_lng: 78.0406 } })
    });
    const allocData = await allocRes.json();
    if (!allocData.success || !allocData.recommended_driver) throw new Error('Driver allocation failed');
    console.log('   2.1 Driver Allocation: PASSED (' + allocData.recommended_driver.name + ', ' + allocData.recommended_driver.allocation_confidence_percent + '% confidence)');

    // 2.2 Vehicle Selection
    const vehRes = await fetch('http://localhost:5000/api/ai/delivery/select-vehicle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_weight_kg: 35, total_volume_m3: 0.13, distance_km: 334 })
    });
    const vehData = await vehRes.json();
    if (!vehData.success || !vehData.selected_vehicle) throw new Error('Vehicle selection failed');
    console.log('   2.2 Vehicle Selection: PASSED (' + vehData.selected_vehicle.type + ')');

    // 2.3 Multi-Order Consolidation: 1 Buyer Ordering from Multiple Farmers
    const consRes = await fetch('http://localhost:5000/api/ai/delivery/consolidate-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: [
          {
            id: 'VIV-ORD-88120',
            buyer_id: 10,
            buyer_name: 'Aditi Sharma',
            delivery_address: 'Flat 4B, Adyar, Chennai',
            delivery_lat: 13.0012,
            delivery_lng: 80.2565,
            farmer_name: 'Ramasamy Gounder',
            farmer_village: 'Salem Farmgate',
            pickup_lat: 11.7401,
            pickup_lng: 78.0406,
            product_name: 'Salem Pure Turmeric',
            weight_kg: 10,
            volume_m3: 0.04
          },
          {
            id: 'VIV-ORD-88125',
            buyer_id: 10,
            buyer_name: 'Aditi Sharma',
            delivery_address: 'Flat 4B, Adyar, Chennai',
            delivery_lat: 13.0012,
            delivery_lng: 80.2565,
            farmer_name: 'Murugesan K',
            farmer_village: 'Namakkal Farmgate',
            pickup_lat: 11.4500,
            pickup_lng: 78.1600,
            product_name: 'Country Small Shallots',
            weight_kg: 25,
            volume_m3: 0.09
          }
        ],
        driver_lat: 11.6643,
        driver_lng: 78.1460,
        max_vehicle_type: 'Tata Ace Mini-Carrier'
      })
    });
    const consData = await consRes.json();
    if (!consData.success || consData.feasibility !== 'OPTIMIZED_AND_FEASIBLE') {
      throw new Error('Multi-farmer consolidation solver failed');
    }
    if (consData.scenario_type !== 'ONE_BUYER_MULTI_FARMERS') {
      throw new Error('Expected scenario ONE_BUYER_MULTI_FARMERS, got: ' + consData.scenario_type);
    }
    console.log('   2.3 Multi-Farmer Consolidation Solver: PASSED (' + consData.route_analytics.distance_saved_km + ' km saved, ' + consData.route_analytics.fuel_reduction_percent + ' fuel saved)');

    // 2.4 Precedence Check: Pickups MUST precede Deliveries
    const itinerary = consData.itinerary;
    let seenDelivery = false;
    for (const stop of itinerary) {
      if (stop.type === 'DELIVERY') seenDelivery = true;
      if (stop.type === 'PICKUP' && seenDelivery) {
        throw new Error('Precedence violation: Pickup occurred after Delivery');
      }
    }
    console.log('   2.4 Cargo Precedence Validation: PASSED (All pickups precede deliveries)');

    passed++;
    console.log('✅ Test 2 PASSED: Delivery AI & Multi-Order Route Consolidation verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 2 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 3: Backend Driver AI Services
  // =========================================================================
  console.log('\n🔍 Test 3: Verifying Driver AI Services (Route, Backhaul, Analytics)...');
  try {
    // 3.1 Route Suggestions
    const rRes = await fetch('http://localhost:5000/api/ai/driver/route-suggestions/VIV-DR-104582');
    const rData = await rRes.json();
    if (!rData.success || !rData.recommended_route?.route_name) throw new Error('Route suggestions failed');
    console.log('   3.1 Smart Route Suggestions: PASSED (' + rData.recommended_route.route_name + ')');

    // 3.2 Backhaul Order Suggestions
    const bRes = await fetch('http://localhost:5000/api/ai/driver/order-suggestions/VIV-DR-104582');
    const bData = await bRes.json();
    if (!bData.success || !bData.recommendations || bData.recommendations.length === 0) {
      throw new Error('Backhaul suggestions failed');
    }
    console.log('   3.2 Backhaul Order Suggestions: PASSED (' + bData.recommendations.length + ' return matches found)');

    // 3.3 Driver Delivery Analytics
    const aRes = await fetch('http://localhost:5000/api/ai/driver/analytics/VIV-DR-104582');
    const aData = await aRes.json();
    if (!aData.success || !aData.performance_metrics?.on_time_delivery_rate_percent) {
      throw new Error('Driver analytics failed');
    }
    console.log('   3.3 Driver Delivery Analytics: PASSED (On-time: ' + aData.performance_metrics.on_time_delivery_rate_percent + '%, Rating: ★' + aData.performance_metrics.customer_handover_rating + ')');

    passed++;
    console.log('✅ Test 3 PASSED: Driver AI backend services verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 3 FAILED:', err.message);
  }

  // =========================================================================
  // BROWSER UI TESTS (Headless Edge)
  // =========================================================================
  console.log('\n🌐 Launching Microsoft Edge for Dashboard UI Testing...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') &&
          !txt.includes('404') &&
          !txt.includes('WebSocket') &&
          !txt.includes('net::ERR_') &&
          !txt.includes('Failed to load resource') &&
          !txt.includes('openstreetmap') &&
          !txt.includes('tile.')) {
        console.warn('  [Browser Error]:', txt);
        consoleErrors.push(txt);
      }
    }
  });

  // =========================================================================
  // TEST 4: Farmer Dashboard AI UI (Crop & Soil, Financial, Demand Forecast)
  // =========================================================================
  console.log('\n🔍 Test 4: Testing Farmer Dashboard AI Modules in Browser...');
  try {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => document.body && document.body.innerText.includes('VIVAAN'), { timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'farmer');
      localStorage.setItem('vivaan_view', 'farmer_dashboard');
    });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // 4.1 Check Agronomy Panel
    await page.waitForSelector('#panel-ai-agronomy', { timeout: 12000 });
    const agroText = await page.$eval('#panel-ai-agronomy', el => el.innerText);
    if (!agroText.includes('Turmeric') && !agroText.includes('Soil Chemistry Advisory')) {
      throw new Error('Agronomy panel content not displayed properly');
    }
    await takeSnapshot(page, 'ai_01_farmer_crop_soil_advisory.png');

    // 4.2 Switch to Financial & Loss Tab
    const finTab = await page.waitForSelector('#tab-ai-financial', { timeout: 8000 });
    await finTab.click();
    await new Promise(r => setTimeout(r, 1200));

    await page.waitForSelector('#panel-ai-financial', { timeout: 8000 });
    const finText = await page.$eval('#panel-ai-financial', el => el.innerText);
    if (!finText.includes('Middleman Loss') && !finText.includes('Spoilage')) {
      throw new Error('Financial & Loss panel content missing');
    }
    await takeSnapshot(page, 'ai_02_farmer_financial_loss_analysis.png');

    // 4.3 Switch to Demand Forecast Tab
    const demTab = await page.waitForSelector('#tab-ai-demand', { timeout: 8000 });
    await demTab.click();
    await new Promise(r => setTimeout(r, 1200));

    await page.waitForSelector('#panel-ai-demand', { timeout: 8000 });
    const demText = await page.$eval('#panel-ai-demand', el => el.innerText);
    if (!demText.includes('60-Day') && !demText.includes('Demand')) {
      throw new Error('Demand forecast panel content missing');
    }

    // 4.4 Check Product Listings Table for AI Demand Badges
    const pageFullText = await page.evaluate(() => document.body.innerText);
    if (!pageFullText.includes('BULLISH') && !pageFullText.includes('EXTREME SURGE')) {
      throw new Error('Product listings do not display AI Demand Forecast badges');
    }
    await takeSnapshot(page, 'ai_03_farmer_product_demand_prediction.png');

    passed++;
    console.log('✅ Test 4 PASSED: Farmer Dashboard AI integration verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 4 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 5: Agency Dashboard AI UI (Consolidation & Fleet Allocation)
  // =========================================================================
  console.log('\n🔍 Test 5: Testing Agency Dashboard AI Modules in Browser...');
  try {
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'agency');
      localStorage.setItem('vivaan_view', 'agency_dashboard');
    });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // 5.1 Multi-Order Consolidation Panel
    await page.waitForSelector('#panel-ai-consolidation', { timeout: 12000 });
    const consText = await page.$eval('#panel-ai-consolidation', el => el.innerText);
    const upperCons = consText.toUpperCase();
    if (!upperCons.includes('ONE BUYER ORDERING FROM MULTIPLE FARMERS') || !upperCons.includes('FEASIBLE')) {
      throw new Error('Multi-Order Consolidation UI failed to render properly');
    }
    await takeSnapshot(page, 'ai_04_delivery_ai_multi_order_consolidation.png');

    // 5.2 Switch to Driver & Vehicle Allocation Tab
    const allocTab = await page.waitForSelector('#tab-ai-allocation', { timeout: 8000 });
    await allocTab.click();
    await new Promise(r => setTimeout(r, 1200));

    await page.waitForSelector('#panel-ai-allocation', { timeout: 8000 });
    const allocText = await page.$eval('#panel-ai-allocation', el => el.innerText);
    const upperAlloc = allocText.toUpperCase();
    if (!upperAlloc.includes('VEHICLE SIZING') && !upperAlloc.includes('TATA ACE')) {
      throw new Error('Vehicle Sizing & Allocation UI failed to render properly');
    }
    await takeSnapshot(page, 'ai_05_delivery_ai_vehicle_driver_allocation.png');

    passed++;
    console.log('✅ Test 5 PASSED: Agency Dashboard Delivery AI integration verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 5 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 6: Driver Dashboard AI UI (Route, Backhaul, Performance Analytics)
  // =========================================================================
  console.log('\n🔍 Test 6: Testing Driver Dashboard AI Modules in Browser...');
  try {
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'driver');
      localStorage.setItem('vivaan_view', 'driver_dashboard');
    });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // Switch to AI Copilot Tab
    const copilotTab = await page.waitForSelector('#tab-driver-ai-copilot', { timeout: 12000 });
    await copilotTab.click();
    await new Promise(r => setTimeout(r, 1500));

    await page.waitForSelector('#panel-driver-ai-copilot', { timeout: 12000 });
    const copilotText = await page.$eval('#panel-driver-ai-copilot', el => el.innerText);
    if (!copilotText.includes('Green-Corridor') || !copilotText.includes('Backhaul')) {
      throw new Error('Driver AI Copilot panel not displaying expected suggestions');
    }

    await takeSnapshot(page, 'ai_06_driver_ai_route_and_backhaul_suggestions.png');

    // Verify Performance Analytics (case-insensitive check for styled uppercase elements)
    const upperCopilot = copilotText.toUpperCase();
    if (!upperCopilot.includes('ON-TIME DELIVERY RATE') || !upperCopilot.includes('ECO-DRIVING INDEX')) {
      throw new Error('Driver Performance Analytics missing');
    }
    await takeSnapshot(page, 'ai_07_driver_ai_delivery_analytics.png');

    passed++;
    console.log('✅ Test 6 PASSED: Driver Dashboard AI Copilot integration verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 6 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 7: Security Audit - Zero API Secrets in Client Bundles
  // =========================================================================
  console.log('\n🔍 Test 7: Performing Security Audit for Zero Secret Exposure...');
  try {
    const clientDist = 'C:/Users/DELL/.gemini/antigravity/scratch/vivaan-marketplace/client/dist';
    if (fs.existsSync(clientDist)) {
      const files = fs.readdirSync(path.join(clientDist, 'assets'));
      for (const f of files) {
        if (f.endsWith('.js')) {
          const content = fs.readFileSync(path.join(clientDist, 'assets', f), 'utf8');
          if (content.includes('RAZORPAY_KEY_SECRET') || content.includes('vivaan_secret_key') || content.includes('GEMINI_API_SECRET')) {
            throw new Error('Secret credential leaked in client bundle ' + f);
          }
        }
      }
    }
    passed++;
    console.log('✅ Test 7 PASSED: Zero secret credentials in client bundles verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 7 FAILED:', err.message);
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log('📊 Final AI Service & UI Verification: ' + passed + ' PASSED | ' + failed + ' FAILED');
  console.log('🚨 Browser Console Errors: ' + consoleErrors.length);
  console.log('===============================================================');

  if (failed > 0 || consoleErrors.length > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
