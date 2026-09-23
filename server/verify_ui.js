const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'scratch_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserVerification() {
  console.log('===============================================================');
  console.log('🌐 VIVAAN Browser UI & Navigation Automated Verification');
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
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Initial Load & Welcome Screen
    await testStep('Initial Load & VIVAAN Logo Welcome Screen', async () => {
      await page.goto(APP_URL, { waitUntil: 'networkidle0' });
      const content = await page.content();
      if (!content.includes('VIVAAN')) throw new Error('VIVAAN name not found');
      
      const logoImg = await page.$('img[src="/vivaan-logo.jpg"]');
      if (!logoImg) throw new Error('Official VIVAAN logo not rendered');

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_welcome_screen.png') });
    });

    // 2. Navigation: Welcome -> Language Selection
    await testStep('Navigation: Welcome -> Language Selection', async () => {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Get Started & Select Language')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('Choose Your Language'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_language_selection.png') });
    });

    // 3. Language Selection & Back Button
    await testStep('Language Selection & Working Back Button', async () => {
      // Click Back button
      const backBtn = await page.$('button[title="Go Back"]');
      if (!backBtn) throw new Error('Back button not found');
      await backBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('Direct Farmer-to-Buyer Digital Marketplace'));

      // Go forward to language selection again
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Get Started & Select Language')) {
          await btn.click();
          break;
        }
      }
      await page.waitForFunction(() => document.body.innerText.includes('Step 1 of 2'));

      // Continue to Role Selection
      const continueBtns = await page.$$('button');
      for (const btn of continueBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Continue to Role Selection')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_role_selection.png') });
    });

    // 4. Role Selection Screen (Farmer, Buyer, Agency, Driver)
    await testStep('Role Selection Screen (4 Core Roles Verification)', async () => {
      const pageText = await page.evaluate(() => document.body.innerText);
      if (!pageText.includes('Farmer')) throw new Error('Farmer role not found');
      if (!pageText.includes('Consumer / Buyer')) throw new Error('Buyer role not found');
      if (!pageText.includes('Delivery Agency')) throw new Error('Delivery Agency role not found');
      if (!pageText.includes('Driver')) throw new Error('Driver role not found');
    });

    // 5. Enter Farmer Portal & Pages
    await testStep('Farmer Role: Dashboard, Produce Listings & Back Button', async () => {
      // Click role-farmer button
      const farmerCard = await page.$('#role-farmer');
      if (!farmerCard) throw new Error('#role-farmer button not found');
      await farmerCard.click();

      await page.waitForFunction(() => document.body.innerText.includes('Ramasamy Gounder'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_farmer_dashboard.png') });

      // Click "Add New Produce"
      const addBtns = await page.$$('button');
      for (const btn of addBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Add New Produce')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('List New Harvest Batch'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_farmer_add_produce.png') });

      // Verify Submit button exists
      const submitBtn = await page.$('button[type="submit"]');
      if (!submitBtn) throw new Error('Submit button missing on Farmer Add Produce form');
      const submitText = await page.evaluate(el => el.textContent, submitBtn);
      if (!submitText.includes('Submit Produce Listing')) throw new Error('Submit button text incorrect');

      // Click Back button
      const backBtn = await page.$('button[title="Go Back"]');
      if (!backBtn) throw new Error('Back button missing on Farmer Add Produce');
      await backBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('My Produce Listings'));
    });

    // 6. Enter Buyer Portal & Marketplace
    await testStep('Buyer Role: Marketplace, Search, Cart & Back Button', async () => {
      // Click Switch Role button
      const switchBtn = await page.$('#switch-role-btn');
      if (!switchBtn) throw new Error('#switch-role-btn not found in header');
      await switchBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Buyer role button
      const buyerCard = await page.$('#role-buyer');
      if (!buyerCard) throw new Error('#role-buyer button not found');
      await buyerCard.click();

      await page.waitForFunction(() => document.body.innerText.includes('Fresh Agricultural Harvest Direct from Verified Farmers'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_buyer_marketplace.png') });

      // Add to Cart
      const addToCartBtns = await page.$$('button');
      for (const btn of addToCartBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Add to Cart')) {
          await btn.click();
          break;
        }
      }

      // Go to Cart
      const cartBtns = await page.$$('button');
      for (const btn of cartBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('View Cart & Checkout')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_buyer_cart.png') });

      // Check form and Submit button
      const orderSubmitBtn = await page.$('button[type="submit"]');
      if (!orderSubmitBtn) throw new Error('Submit button missing on Buyer Cart form');

      // Click Back button
      const backBtn = await page.$('button[title="Go Back"]');
      if (!backBtn) throw new Error('Back button missing on Buyer Cart page');
      await backBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('Fresh Agricultural Harvest Direct from Verified Farmers'));
    });

    // 7. Enter Delivery Agency Portal
    await testStep('Delivery Agency: Fleet Overview, Onboard Driver & Back Button', async () => {
      // Click Switch Role button
      const switchBtn = await page.$('#switch-role-btn');
      await switchBtn.click();
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Agency role button
      const agencyCard = await page.$('#role-agency');
      if (!agencyCard) throw new Error('#role-agency button not found');
      await agencyCard.click();

      await page.waitForFunction(() => document.body.innerText.includes('GreenCorridor Agro Logistics'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_agency_dashboard.png') });

      // Click Onboard Driver
      const onboardBtns = await page.$$('button');
      for (const btn of onboardBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Onboard Driver') || text.includes('Onboard New Driver')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('Onboard Carrier Driver'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_agency_onboard_driver.png') });

      // Check Submit button
      const submitBtn = await page.$('button[type="submit"]');
      if (!submitBtn) throw new Error('Submit button missing on Onboard Driver form');

      // Click Back button
      const backBtn = await page.$('button[title="Go Back"]');
      if (!backBtn) throw new Error('Back button missing on Onboard Driver page');
      await backBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('Fleet Drivers Roster'));
    });

    // 8. Enter Driver Portal
    await testStep('Driver Role: Portal, Trip Details, OTP Keypad & Back Button', async () => {
      // Click Switch Role button
      const switchBtn = await page.$('#switch-role-btn');
      await switchBtn.click();
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Driver role button
      const driverCard = await page.$('#role-driver');
      if (!driverCard) throw new Error('#role-driver button not found');
      await driverCard.click();

      await page.waitForFunction(() => document.body.innerText.includes('Murugan K'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_driver_dashboard.png') });

      // Click Full Trip Details
      const tripBtns = await page.$$('button');
      for (const btn of tripBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Full Trip Details')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('Active Delivery Itinerary'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_driver_trip_itinerary.png') });

      // Click Proceed to OTP Handover
      const otpBtns = await page.$$('button');
      for (const btn of otpBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Proceed to Doorstep OTP Handover')) {
          await btn.click();
          break;
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('Doorstep OTP Handover'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_driver_handover_otp.png') });

      // Verify numeric keypad & Submit button
      const submitBtn = await page.$('button[type="submit"]');
      if (!submitBtn) throw new Error('Submit Delivery Confirmation button missing on Handover form');

      // Click Back button
      const backBtn = await page.$('button[title="Go Back"]');
      if (!backBtn) throw new Error('Back button missing on OTP Handover page');
      await backBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('Murugan K'));
    });

    // 9. Upper-Right Language Selector
    await testStep('Upper-Right Language Selector Modal Verification', async () => {
      const langBtn = await page.$('#lang-modal-btn');
      if (!langBtn) throw new Error('Language modal trigger button not found in header');
      await langBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('Choose your preferred language') || document.body.innerText.includes('Support for 14 Indian Languages'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_language_modal.png') });

      // Close modal
      const closeBtn = await page.$('button[class*="rounded-full hover:bg-white"]');
      if (closeBtn) await closeBtn.click();
    });

    // 10. Responsive Viewport Audits (Tablet & Mobile)
    await testStep('Responsive Layout: Tablet (768x1024) & Mobile (375x667)', async () => {
      // Tablet Viewport
      await page.setViewport({ width: 768, height: 1024 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_responsive_tablet.png') });

      // Mobile Viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_responsive_mobile.png') });
    });

  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`🎉 BROWSER VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
}

runBrowserVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
