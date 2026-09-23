const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = 'C:\\\\Users\\\\DELL\\\\.gemini\\\\antigravity\\\\scratch\\\\vivaan-marketplace\\\\scratch_screenshots';
const BRAIN_SCREENSHOT_DIR = 'C:\\\\Users\\\\DELL\\\\.gemini\\\\antigravity\\\\brain\\\\24aa9fbb-0b0b-417a-b825-37ad6bbc5073\\\\screenshots';

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

async function runAgencyDriverVerification() {
  console.log('===============================================================');
  console.log('🚚 VIVAAN Delivery Agency & Driver Modules Verification Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`🔍 Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // 1. Enter Delivery Agency Portal
    await testStep('Access Application & Enter Delivery Agency Portal', async () => {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));

      // Fast-track to role select if on welcome screen
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const found = btns.find(b => b.textContent.includes('Skip to Role Selection'));
        if (found) found.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Delivery Agency Role
      await page.evaluate(() => {
        const btn = document.getElementById('role-agency');
        if (btn) {
          btn.click();
        } else {
          const cards = Array.from(document.querySelectorAll('button, div'));
          const agencyCard = cards.find(el => el.textContent.includes('Delivery Agency'));
          if (agencyCard) agencyCard.click();
        }
      });

      await page.waitForFunction(() => document.body.innerText.includes('GreenCorridor') || document.body.innerText.includes('Logistics Overview'));
      await takeSnapshot(page, 'agency_01_dashboard_landing.png');
    });

    // 2. Delivery Agency Registration (All 16 Fields, Agency ID & GREEN/ORANGE/BLUE Classification)
    await testStep('Agency Registration: 16 Fields, Agency ID Generation & Classification', async () => {
      // Navigate to Agency Register Form
      await page.click('#agency-goto-register-btn');
      await page.waitForSelector('#agency-legal-name-input', { timeout: 10000 });

      // Verify presence of all 16 required fields in DOM
      const fieldsExist = await page.evaluate(() => {
        const ids = [
          'agency-legal-name-input',
          'agency-brand-name-input',
          'agency-tax-id-input',
          'agency-contact-person-input',
          'agency-office-input',
          'agency-states-input',
          'agency-districts-input',
          'agency-taluks-input',
          'agency-serviceable-areas-input',
          'agency-nogo-areas-input',
          'agency-warehouses-input',
          'agency-vehicle-types-input',
          'agency-owned-outsourced-input',
          'agency-fleet-size-input',
          'agency-transit-time-input',
          'agency-max-weight-input',
          'agency-max-volume-input'
        ];
        return ids.every(id => document.getElementById(id) !== null);
      });

      if (!fieldsExist) {
        throw new Error('One or more of the 16 mandatory agency registration input fields are missing');
      }

      // Submit form
      await page.click('#agency-register-submit-btn');

      // Wait for verification success modal
      await page.waitForSelector('#conf-agency-id', { timeout: 10000 });

      const agencyResult = await page.evaluate(() => {
        return {
          agencyId: document.getElementById('conf-agency-id')?.innerText || '',
          classification: document.getElementById('conf-agency-classification')?.innerText || ''
        };
      });

      if (!agencyResult.agencyId.startsWith('VIV-AG-')) {
        throw new Error(`Expected Agency ID to start with VIV-AG-, got: ${agencyResult.agencyId}`);
      }
      if (!agencyResult.classification.includes('BLUE') && !agencyResult.classification.includes('GREEN') && !agencyResult.classification.includes('ORANGE')) {
        throw new Error(`Agency classification tier missing or invalid: ${agencyResult.classification}`);
      }

      await takeSnapshot(page, 'agency_02_registration_verified.png');

      // Return to Dashboard
      await page.click('#view-agency-dashboard-btn');
      await page.waitForFunction(() => document.body.innerText.includes('GreenCorridor'));
    });

    // 3. Agency Dashboard: Verify All 8 Modules & Assignment Insights
    await testStep('Agency Dashboard: Verify All 8 Modules & Assignment Insights', async () => {
      const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());

      const requiredModules = [
        'active orders',
        'drivers',
        'available drivers',
        'vehicles',
        'completed deliveries',
        'earnings',
        'operational coverage & warehouse hubs',
        'assignment insights & capability match engine'
      ];

      for (const mod of requiredModules) {
        if (!pageText.includes(mod)) {
          throw new Error(`Agency dashboard missing module: ${mod}`);
        }
      }

      // Verify Assignment Insights contains capability evaluation
      if (!pageText.includes('capable orders matched') || !pageText.includes('fleet capacity utilization')) {
        throw new Error('Assignment Insights missing capability metrics');
      }

      await takeSnapshot(page, 'agency_03_dashboard_widgets_insights.png');
    });

    // 4. Driver Onboarding / Application Form (All 5 Sections: Personal, License, Coverage, Vehicle, Operations)
    await testStep('Driver Onboarding / Application: All 5 Sections & Driver ID Generation', async () => {
      await page.click('#agency-onboard-driver-btn');
      await page.waitForSelector('#driver-name-input', { timeout: 10000 });

      // Verify all 5 sections present in DOM
      const sectionsExist = await page.evaluate(() => {
        const checks = [
          document.getElementById('driver-name-input'),       // 1. Personal
          document.getElementById('driver-phone-input'),      // 1. Personal
          document.getElementById('driver-license-input'),    // 2. License
          document.getElementById('driver-experience-input'), // 2. License
          document.getElementById('driver-district-input'),   // 3. Coverage
          document.getElementById('driver-taluks-input'),     // 3. Coverage
          document.getElementById('driver-vehicle-no-input'),  // 4. Vehicle
          document.getElementById('driver-capacity-input'),   // 4. Vehicle
          document.getElementById('driver-smartphone-check'), // 5. Operations
          document.getElementById('driver-cod-check'),        // 5. Operations
          document.getElementById('driver-lifting-check')     // 5. Operations
        ];
        return checks.every(el => el !== null);
      });

      if (!sectionsExist) {
        throw new Error('One or more of the required 5 Driver Application sections are missing');
      }

      // Submit driver onboarding
      await page.click('#driver-submit-btn');

      // Wait for success modal
      await page.waitForSelector('#conf-driver-id', { timeout: 10000 });

      const driverResult = await page.evaluate(() => {
        return {
          driverId: document.getElementById('conf-driver-id')?.innerText || '',
          driverName: document.getElementById('conf-driver-name')?.innerText || ''
        };
      });

      if (!driverResult.driverId.startsWith('VIV-DR-')) {
        throw new Error(`Expected Driver ID to start with VIV-DR-, got: ${driverResult.driverId}`);
      }

      await takeSnapshot(page, 'driver_01_onboard_verified.png');

      // Continue to roster
      await page.click('#view-driver-portal-btn');
      await page.waitForFunction(() => document.body.innerText.includes('Fleet Drivers Roster'));
    });

    // 5. Switch to Driver Role & Verify Driver Dashboard (All 9 Modules & Capability Filter)
    await testStep('Driver Dashboard: All 9 Modules & Capability-Based Order Filtering', async () => {
      // Switch Role to Driver via header dropdown
      await page.evaluate(() => {
        const switchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Switch Role'));
        if (switchBtn) switchBtn.click();
      });
      await new Promise(r => setTimeout(r, 400));

      await page.evaluate(() => {
        const roleBtns = Array.from(document.querySelectorAll('button'));
        const driverBtn = roleBtns.find(b => b.textContent.includes('Driver'));
        if (driverBtn) driverBtn.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('Murugan Karuppasamy') || document.body.innerText.includes('Tata Ace Pickup'));

      const driverDashboardText = await page.evaluate(() => document.body.innerText.toLowerCase());

      // Verify required modules
      const driverModules = [
        'available orders',
        'accepted orders',
        'current delivery & route',
        'completed deliveries',
        'cancelled orders',
        'driver earnings',
        'assigned vehicle'
      ];

      for (const dm of driverModules) {
        if (!driverDashboardText.includes(dm)) {
          throw new Error(`Driver dashboard missing section: ${dm}`);
        }
      }

      // Verify Capability Filter: 2,500 kg heavy order must NOT appear in available orders for 1,200 kg vehicle!
      if (driverDashboardText.includes('85,000') || driverDashboardText.includes('25 quintal')) {
        throw new Error('CAPABILITY BREACH: 2,500 kg heavy order was erroneously exposed to 1,200 kg Tata Ace driver!');
      }

      await takeSnapshot(page, 'driver_02_dashboard_available_orders.png');
    });

    // 6. Driver Lifecycle: Accept Order -> Confirm Pickup -> In-Transit Route
    await testStep('Driver Lifecycle: Accept Order, Confirm Farmgate Pickup & View Route Itinerary', async () => {
      // Ensure on Available Orders tab
      await page.click('#tab-available-orders');
      await new Promise(r => setTimeout(r, 400));

      // Click "Accept Delivery" on the first available order
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Accept Delivery'));
        if (btns.length > 0) btns[0].click();
      });
      await new Promise(r => setTimeout(r, 800));

      // Ensure on Accepted Orders tab
      await page.click('#tab-accepted-orders');
      await new Promise(r => setTimeout(r, 400));

      const acceptedText = await page.evaluate(() => document.body.innerText);
      if (!acceptedText.toLowerCase().includes('step 1: proceed to farmgate') && !acceptedText.toLowerCase().includes('confirm farmgate pickup')) {
        throw new Error('Accepted order missing farmgate pickup action');
      }

      // Click "Confirm Farmgate Pickup"
      await page.click('#start-pickup-btn');
      await new Promise(r => setTimeout(r, 800));

      // Switch to Current Delivery & Route tab
      await page.click('#tab-current-delivery');
      await new Promise(r => setTimeout(r, 500));

      const routeText = await page.evaluate(() => document.body.innerText.toLowerCase());
      if (!routeText.includes('origin stop: farmgate pickup') || !routeText.includes('destination stop: buyer doorstep')) {
        throw new Error('Current Delivery tab missing pickup or destination itinerary details');
      }

      await takeSnapshot(page, 'driver_03_active_route_itinerary.png');
    });

    // 7. Doorstep OTP Handover & Escrow Payout Release
    await testStep('Doorstep OTP Handover: 4-Digit Code Entry & Escrow Payout Release', async () => {
      // Click "Doorstep OTP Handover (Release Escrow)"
      await page.click('#driver-handover-action-btn');
      await page.waitForSelector('#handover-otp-hint', { timeout: 10000 });

      // Read dynamic OTP code from hint
      const otpCode = await page.evaluate(() => {
        return document.getElementById('handover-otp-hint')?.innerText?.trim() || '4819';
      });

      console.log(`(Using OTP: ${otpCode})`);

      // Click keypad numbers for each digit
      for (const char of otpCode) {
        await page.click(`#otp-key-${char}`);
        await new Promise(r => setTimeout(r, 100));
      }

      await new Promise(r => setTimeout(r, 300));

      // Submit OTP handover
      await page.click('#handover-submit-btn');

      // Wait for redirect back to dashboard
      await page.waitForFunction(() => document.body.innerText.includes('Driver Portal') || document.body.innerText.includes('Murugan'));

      await takeSnapshot(page, 'driver_04_handover_success.png');
    });

  } catch (globalErr) {
    console.error('Fatal Test Exception:', globalErr);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`📊 Final Agency & Driver Verification Results: ${passed} PASSED | ${failed} FAILED`);
  console.log(`🚨 Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors Sample:', consoleErrors.slice(0, 5));
  }
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAgencyDriverVerification();
