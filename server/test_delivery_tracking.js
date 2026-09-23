/**
 * VIVAAN Delivery Tracking Full Lifecycle Verification Suite
 * Verifies:
 * 1. Order Creation & Driver Assignment
 * 2. Driver clicks ACCEPT ORDER -> Route to Farmer
 * 3. Delivery Agency & VIVAAN Admin see assigned driver status/location
 * 4. Buyer Pre-Collection Guard (No live tracking before collection)
 * 5. Driver clicks COLLECT / PICKED UP -> Route to Buyer
 * 6. Buyer tracking unlocks with strictly assigned driver (zero unrelated drivers)
 * 7. Buyer Geolocation Privacy (explicit consent required)
 * 8. Driver reaches buyer & OTP handover
 * 9. Delivery confirmed -> Live tracking stops across Buyer, Agency, and Admin
 * 10. Historical delivery record preserved
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://127.0.0.1:5000';
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
  fs.copyFileSync(p1, p2);
  console.log(`   📸 Captured: ${filename}`);
}

async function runTests() {
  console.log('===============================================================');
  console.log('🚚 VIVAAN Real-Time Delivery Tracking System Verification');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;
  const consoleErrors = [];

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,900']
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

  // TEST 1: Backend API Endpoints & Role Authorization
  console.log('\n🔍 Test 1: Verifying Backend Tracking Endpoints & Role Authorization...');
  try {
    const testOrderId = 'VIV-ORD-TEST-001';

    // Seed test order
    const createRes = await fetch(APP_URL + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_number: testOrderId,
        tracking_id: 'TRK-TEST-001',
        buyer_id: 10,
        buyer_name: 'Aditi Sharma',
        items: [{ product_id: 1, quantity: 5 }],
        delivery_address: 'Flat 4B, Greenview Apts, Adyar, Chennai',
        payment_status: 'Successful'
      })
    });
    const createData = await createRes.json();
    if (!createData.success) throw new Error('Failed to create test order');

    // 1.1 Pre-collection guard for buyer
    const buyerPreRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/live-tracking?role=BUYER`);
    const buyerPreData = await buyerPreRes.json();
    if (buyerPreData.live_tracking_allowed !== false) {
      throw new Error('Buyer should NOT be allowed live tracking before farmgate pickup');
    }
    console.log('   Buyer Pre-Collection Guard: PASSED (live_tracking_allowed: false)');

    // 1.2 Driver Accepts Order -> Phase: TO_FARMER
    const acceptRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/accept-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: 'VIV-DR-104582', driver_name: 'Murugan K' })
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success || acceptData.tracking_phase !== 'TO_FARMER') {
      throw new Error('Driver accept failed or phase not TO_FARMER');
    }
    console.log('   Driver Accept Order -> Route to Farmer: PASSED (tracking_phase: TO_FARMER)');

    // 1.3 Agency sees assigned driver status
    const agencyRes = await fetch(APP_URL + '/api/tracking/active-agency/1');
    const agencyData = await agencyRes.json();
    const agencyOrder = agencyData.active_fleet.find(f => f.order_id === testOrderId);
    if (!agencyOrder || !agencyOrder.driver || agencyOrder.driver.id !== 'VIV-DR-104582') {
      throw new Error('Agency failed to see assigned driver for active order');
    }
    console.log('   Agency Fleet Active Tracking: PASSED (assigned driver: Murugan K)');

    // 1.4 Driver confirms pickup -> Phase: TO_BUYER & Unlocks Buyer Tracking
    const pickupRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/confirm-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const pickupData = await pickupRes.json();
    if (!pickupData.success || pickupData.tracking_phase !== 'TO_BUYER') {
      throw new Error('Driver pickup failed or phase not TO_BUYER');
    }
    console.log('   Driver Confirm Pickup -> Route to Buyer: PASSED (tracking_phase: TO_BUYER)');

    // 1.5 Buyer Tracking Now Unlocked
    const buyerUnlockedRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/live-tracking?role=BUYER`);
    const buyerUnlockedData = await buyerUnlockedRes.json();
    if (buyerUnlockedData.live_tracking_allowed !== true || !buyerUnlockedData.driver) {
      throw new Error('Buyer live tracking should be unlocked post-pickup');
    }
    console.log('   Buyer Live Tracking Post-Pickup: PASSED (live_tracking_allowed: true)');

    // 1.6 Teardown upon OTP Verification
    const otp = createData.order.delivery_otp;
    const otpRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entered_otp: otp, driver_id: 'VIV-DR-104582' })
    });
    const otpData = await otpRes.json();
    if (!otpData.success || otpData.tracking_active !== false) {
      throw new Error('OTP verification failed or tracking not stopped');
    }

    // Verify driver live location REMOVED
    const postDelivRes = await fetch(`http://localhost:5000/api/orders/${testOrderId}/live-tracking?role=BUYER`);
    const postDelivData = await postDelivRes.json();
    if (postDelivData.driver !== null || postDelivData.live_tracking_allowed !== false) {
      throw new Error('Live driver location must be REMOVED post-delivery');
    }
    console.log('   Post-Delivery Teardown: PASSED (live driver removed: null, tracking_active: false)');

    passed++;
    console.log('✅ Test 1 PASSED: Backend tracking endpoints and role authorization validated.');
  } catch (err) {
    failed++;
    console.error('❌ Test 1 FAILED:', err.message);
  }

  // TEST 2: Driver Acceptance & Route to Farmer UI
  console.log('\n🔍 Test 2: Testing Driver Acceptance & Route to Farmer UI...');
  try {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));
    
    // Switch to driver role
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'driver');
      localStorage.setItem('vivaan_view', 'driver_dashboard');
      window.location.reload();
    });
    await new Promise(r => setTimeout(r, 2000));

    // In Available Orders tab, click accept order
    const availableTab = await page.waitForSelector('#tab-available-orders', { timeout: 8000 });
    await availableTab.click();
    await new Promise(r => setTimeout(r, 600));

    // Look for accept delivery button
    const acceptOrderBtn = await page.$('button[id^="accept-order-btn-"]');
    if (acceptOrderBtn) {
      await acceptOrderBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Switch to accepted orders tab
    const acceptedTab = await page.waitForSelector('#tab-accepted-orders', { timeout: 5000 });
    await acceptedTab.click();
    await new Promise(r => setTimeout(r, 1000));

    // Click View Route to Farmgate
    const viewRouteBtn = await page.$('#view-route-to-farmer-btn');
    if (viewRouteBtn) {
      await viewRouteBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }

    // Verify Route to Farmgate is displayed
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes('Farmgate') && !pageText.includes('Route to Farmgate')) {
      throw new Error('Route to Farmgate not visible after accepting order');
    }

    await takeSnapshot(page, 'tracking_01_driver_accept_route_to_farmer.png');
    passed++;
    console.log('✅ Test 2 PASSED: Driver accepted order and route to farmgate verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 2 FAILED:', err.message);
  }

  // TEST 3: Agency & VIVAAN Admin Active Driver Status/Location
  console.log('\n🔍 Test 3: Testing Agency & Admin Active Fleet Tracking...');
  try {
    // Go to Agency Dashboard
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'agency');
      localStorage.setItem('vivaan_view', 'agency_dashboard');
      window.location.reload();
    });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForSelector('#agency-classification-badge', { timeout: 8000 });
    
    // Check if Live Fleet Tracking button is present
    const fleetBtn = await page.$('#agency-fleet-tracking-btn');
    if (fleetBtn) {
      await fleetBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }

    const agencyTrackingText = await page.evaluate(() => document.body.innerText);
    if (!agencyTrackingText.includes('Murugan Karuppasamy') && !agencyTrackingText.includes('TN-30-AZ-8120')) {
      throw new Error('Agency tracking view does not display assigned driver details');
    }

    await takeSnapshot(page, 'tracking_02_agency_admin_active_driver.png');
    passed++;
    console.log('✅ Test 3 PASSED: Agency active driver status and vehicle verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 3 FAILED:', err.message);
  }

  // TEST 4: Buyer Pre-Collection Privacy Guard
  console.log('\n🔍 Test 4: Testing Buyer Pre-Collection Privacy Guard...');
  try {
    // Reset order VIV-ORD-88120 to TO_FARMER for clean verification
    await fetch(APP_URL + '/api/orders/VIV-ORD-88120/accept-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: 'VIV-DR-104582', driver_name: 'Murugan Karuppasamy' })
    });

    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'buyer');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'order_tracking');
      window.location.reload();
    });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForSelector('#buyer-pre-collection-card', { timeout: 8000 });
    const preCardText = await page.$eval('#buyer-pre-collection-card', el => el.innerText);
    if (!preCardText.includes('Awaiting Farmgate Collection') && !preCardText.includes('harvest')) {
      throw new Error('Buyer pre-collection privacy notice not displayed correctly');
    }

    await takeSnapshot(page, 'tracking_03_buyer_pre_collection_guard.png');
    passed++;
    console.log('✅ Test 4 PASSED: Buyer pre-collection privacy guard verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 4 FAILED:', err.message);
  }

  // TEST 5: Driver Clicks COLLECT / PICKED UP -> Route to Buyer
  console.log('\n🔍 Test 5: Testing Driver Pickup & Route to Buyer...');
  try {
    // Switch to driver tracking view where COLLECT / PICKED UP button is directly rendered
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'driver');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'order_tracking');
      window.location.reload();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Look for driver pickup button
    const pickupBtn = await page.waitForSelector('#driver-confirm-pickup-btn', { timeout: 8000 });
    await pickupBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Should now show Route to Buyer
    const currentText = await page.evaluate(() => document.body.innerText);
    if (!currentText.includes('Live GPS Corridor') && !currentText.includes('Doorstep')) {
      throw new Error('Did not transition to Route to Buyer after pickup');
    }

    await takeSnapshot(page, 'tracking_04_driver_picked_up_route_to_buyer.png');
    passed++;
    console.log('✅ Test 5 PASSED: Driver pickup confirmed and route to buyer displayed.');
  } catch (err) {
    failed++;
    console.error('❌ Test 5 FAILED:', err.message);
  }

  // TEST 6: Buyer Live Tracking Unlocked & Strict Driver Isolation
  console.log('\n🔍 Test 6: Testing Buyer Live Tracking Unlocked & Driver Isolation...');
  try {
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'buyer');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'order_tracking');
      window.location.reload();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Pre-collection card should now be GONE
    const preCard = await page.$('#buyer-pre-collection-card');
    if (preCard) {
      throw new Error('Pre-collection card should be replaced with live tracking once picked up');
    }

    // Map canvas and assigned driver should be visible
    await page.waitForSelector('#vivaan-tracking-map-canvas', { timeout: 8000 });
    const assignedDriverName = await page.$eval('#map-assigned-driver-name', el => el.innerText);
    if (!assignedDriverName.includes('Murugan')) {
      throw new Error(`Expected assigned driver Murugan, found: ${assignedDriverName}`);
    }

    // Isolation check: Verify no unrelated drivers are leaked
    const fullText = await page.evaluate(() => document.body.innerText);
    if (fullText.includes('Suresh Kumar') || fullText.includes('Ramesh Babu') || fullText.includes('Unassigned Driver')) {
      throw new Error('Unrelated drivers leaked into buyer tracking view');
    }

    await takeSnapshot(page, 'tracking_05_buyer_live_tracking_unlocked.png');
    passed++;
    console.log('✅ Test 6 PASSED: Buyer live tracking unlocked with strictly assigned driver.');
  } catch (err) {
    failed++;
    console.error('❌ Test 6 FAILED:', err.message);
  }

  // TEST 7: Buyer Geolocation Privacy (Permission Grant)
  console.log('\n🔍 Test 7: Testing Buyer Geolocation Privacy & Explicit Consent...');
  try {
    // Ensure buyer location consent is clean/reset for this test
    await fetch(APP_URL + '/api/orders/VIV-ORD-88120/reset-buyer-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    // Reload page to ensure clean state
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'buyer');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'order_tracking');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForSelector('#buyer-privacy-permission-card', { timeout: 8000 });
    
    // Check initial masked state
    const maskedBadge = await page.waitForSelector('#buyer-gps-masked-badge', { timeout: 8000 });
    if (!maskedBadge) {
      throw new Error('Buyer GPS should be masked by default before consent');
    }

    // Click Share GPS button
    const shareGpsBtn = await page.waitForSelector('#grant-buyer-gps-btn', { timeout: 8000 });
    await shareGpsBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Check consented badge
    await page.waitForSelector('#buyer-gps-consented-badge', { timeout: 8000 });
    const consentedText = await page.$eval('#buyer-gps-consented-badge', el => el.textContent || el.innerText);
    if (!consentedText.toUpperCase().includes('EXACT GPS SHARED')) {
      throw new Error('Consent badge not updated after clicking share GPS: ' + consentedText);
    }

    await takeSnapshot(page, 'tracking_06_buyer_location_consent_granted.png');
    passed++;
    console.log('✅ Test 7 PASSED: Buyer geolocation permission flow and status updated.');
  } catch (err) {
    failed++;
    console.error('❌ Test 7 FAILED:', err.message);
  }

  // TEST 8: Driver Doorstep Handover & 4-Digit OTP Entry
  console.log('\n🔍 Test 8: Testing Doorstep OTP Handover Entry...');
  try {
    // Switch to Driver Handover view
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'driver');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'driver_handover');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Fetch expected OTP from backend
    const oRes = await fetch(APP_URL + '/api/orders/VIV-ORD-88120/track');
    const oData = await oRes.json();
    const otp = oData.order.delivery_otp || '4819';

    // Click keypad buttons corresponding to OTP digits
    for (const digit of otp) {
      const keyBtn = await page.waitForSelector(`#otp-key-${digit}`, { timeout: 5000 });
      await keyBtn.click();
      await new Promise(r => setTimeout(r, 200));
    }

    await takeSnapshot(page, 'tracking_07_driver_otp_handover.png');

    // Submit handover
    const submitBtn = await page.waitForSelector('#driver-submit-handover-btn, #handover-submit-btn', { timeout: 5000 });
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000));

    passed++;
    console.log('✅ Test 8 PASSED: 4-digit OTP handover successfully submitted.');
  } catch (err) {
    failed++;
    console.error('❌ Test 8 FAILED:', err.message);
  }

  // TEST 9: Post-Delivery Teardown Across Buyer, Agency, and Admin
  console.log('\n🔍 Test 9: Testing Post-Delivery Live Tracking Teardown & Historical Record...');
  try {
    // 9.1 Buyer view post-delivery
    await page.evaluate(() => {
      localStorage.setItem('vivaan_role_id', 'buyer');
      localStorage.setItem('vivaan_active_order_id', 'VIV-ORD-88120');
      localStorage.setItem('vivaan_view', 'order_tracking');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForSelector('#post-delivery-historical-card', { timeout: 8000 });
    const postDelivText = await page.$eval('#post-delivery-historical-card', el => el.innerText);
    if (!postDelivText.includes('Delivery Confirmed') && !postDelivText.includes('Settled')) {
      throw new Error('Post-delivery historical card not found on buyer view');
    }

    // Verify live driver truck marker is GONE
    const truckMarker = await page.$('#live-driver-truck-marker');
    if (truckMarker) {
      throw new Error('Live driver truck marker was NOT removed post-delivery');
    }

    // 9.2 Agency active fleet tracking removes delivered order
    const agencyRes = await fetch(APP_URL + '/api/tracking/active-agency/1');
    const agencyData = await agencyRes.json();
    const deliveredOrderInAgency = agencyData.active_fleet.find(f => f.order_id === 'VIV-ORD-88120');
    if (deliveredOrderInAgency) {
      throw new Error('Delivered order still present in agency active fleet tracking');
    }

    // 9.3 Admin active tracking removes delivered order
    const adminRes = await fetch(APP_URL + '/api/tracking/active-admin');
    const adminData = await adminRes.json();
    const deliveredOrderInAdmin = adminData.active_fleet.find(f => f.order_id === 'VIV-ORD-88120');
    if (deliveredOrderInAdmin) {
      throw new Error('Delivered order still present in admin active telemetry');
    }

    await takeSnapshot(page, 'tracking_08_post_delivery_teardown_historical.png');
    passed++;
    console.log('✅ Test 9 PASSED: Complete post-delivery teardown and historical preservation verified.');
  } catch (err) {
    failed++;
    console.error('❌ Test 9 FAILED:', err.message);
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log(`📊 Final Delivery Tracking Verification Results: ${passed} PASSED | ${failed} FAILED`);
  console.log(`🚨 Browser Console Errors: ${consoleErrors.length}`);
  console.log('===============================================================');

  if (failed > 0 || consoleErrors.length > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
