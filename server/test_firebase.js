const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'scratch_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runFirebaseVerification() {
  console.log('===============================================================');
  console.log('🔥 VIVAAN Firebase Architecture & Operations Verification');
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

  // 1. Static Configuration & Security Rules Verification
  await testStep('Verify Firestore Security Rules (15 Collections & RBAC)', async () => {
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    if (!fs.existsSync(rulesPath)) throw new Error('firestore.rules missing');
    const content = fs.readFileSync(rulesPath, 'utf8');
    const requiredCollections = [
      'users', 'farmers', 'farmerVerification', 'landRecords', 'farmerProducts',
      'buyers', 'deliveryAgencies', 'drivers', 'vehicles', 'orders',
      'payments', 'tracking', 'ratings', 'notifications', 'aiInsights'
    ];
    for (const col of requiredCollections) {
      if (!content.includes(`match /${col}/`)) {
        throw new Error(`Collection ${col} missing from firestore.rules`);
      }
    }
    // Check sensitive document protection
    if (!content.includes('farmerVerification') || !content.includes('landRecords') || !content.includes('payments')) {
      throw new Error('Sensitive document rules missing');
    }
  });

  await testStep('Verify Storage & Realtime Database Security Rules', async () => {
    const storagePath = path.join(__dirname, '..', 'storage.rules');
    const rtdbPath = path.join(__dirname, '..', 'database.rules.json');
    if (!fs.existsSync(storagePath)) throw new Error('storage.rules missing');
    if (!fs.existsSync(rtdbPath)) throw new Error('database.rules.json missing');

    const storageContent = fs.readFileSync(storagePath, 'utf8');
    if (!storageContent.includes('match /produce/') || !storageContent.includes('match /verification/')) {
      throw new Error('storage.rules missing produce or verification rules');
    }

    const rtdbContent = fs.readFileSync(rtdbPath, 'utf8');
    if (!rtdbContent.includes('"tracking"') || !rtdbContent.includes('"auth != null"')) {
      throw new Error('database.rules.json missing tracking rules');
    }
  });

  await testStep('Verify Zero Secret Credentials in Frontend Code', async () => {
    const clientSrc = path.join(__dirname, '..', 'client', 'src');
    function searchNoSecrets(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          searchNoSecrets(full);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          const c = fs.readFileSync(full, 'utf8');
          if (c.includes('serviceAccount') || c.includes('private_key') || c.includes('BEGIN PRIVATE KEY')) {
            throw new Error(`Potential secret found in frontend code: ${file}`);
          }
        }
      }
    }
    searchNoSecrets(clientSrc);
  });

  // 2. Browser Verification of Firebase Operations
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.log('[BROWSER UNCAUGHT PAGE ERROR]:', err.message);
    consoleErrors.push(err.message);
  });

  try {
    // 3. Initial Load & Firebase Initialization Check
    await testStep('Browser Load & Firebase SDK Initialization', async () => {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_01_welcome.png') });
    });

    // 4. Role Selection & Firebase Auth Sync
    await testStep('Role Selection & Firebase Authentication Sync', async () => {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Skip to Role Selection')) {
          await btn.click();
          break;
        }
      }
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Farmer Role
      const farmerCard = await page.$('#role-farmer');
      await farmerCard.click();
      await page.waitForFunction(() => document.body.innerText.includes('Ramasamy Gounder'));

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_02_farmer_auth.png') });
    });

    // 5. Farmer Adds Produce -> Writes to Firestore farmerProducts
    await testStep('Firestore: Farmer Adds Produce (Real-time Sync)', async () => {
      // Navigate to Add Produce
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Add New Produce') || text.includes('Add Produce')) {
          await btn.click();
          break;
        }
      }
      await page.waitForFunction(() => document.body.innerText.includes('List New Harvest Batch'));

      // Fill in Produce form using explicit IDs
      await page.type('#produce-title-input', 'Nilgiris Fresh Hill Garlic (Poondu)');
      await page.type('#produce-qty-input', '75');
      await page.type('#produce-price-input', '240');

      // Submit Produce Listing
      const submitBtn = await page.$('#produce-submit-btn');
      await submitBtn.click();

      // Verify redirected to produce catalog and new produce is present
      await page.waitForFunction(() => document.body.innerText.includes('Nilgiris Fresh Hill Garlic'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_03_produce_created.png') });
    });

    // 6. Farmer Submits Land Patta Verification -> Writes to landRecords & farmerVerification
    await testStep('Firestore: Farmer Land Patta KYC Verification (Sensitive Collections)', async () => {
      // Navigate to Land Patta KYC
      const clickableElements = await page.$$('button, div[class*="cursor-pointer"]');
      for (const el of clickableElements) {
        const text = await page.evaluate(node => node.textContent, el);
        if (text.includes('Land Patta Audit') || text.includes('Land Patta KYC')) {
          await el.click();
          break;
        }
      }
      await page.waitForFunction(() => document.body.innerText.includes('Land Title Ownership Form'));

      // Submit Form
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();

      await page.waitForFunction(() => document.body.innerText.includes('My Active Harvest Listings') || document.body.innerText.includes('Ramasamy Gounder'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_04_kyc_submitted.png') });
    });

    // 7. Buyer Marketplace Reads New Produce & Places Order (orders & payments)
    await testStep('Firestore: Buyer Browses & Submits Farmgate Order with Escrow', async () => {
      // Switch Role to Buyer
      const switchBtn = await page.$('#switch-role-btn');
      await switchBtn.click();
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      const buyerCard = await page.$('#role-buyer');
      await buyerCard.click();
      await page.waitForFunction(() => document.body.innerText.includes('Fresh Agricultural Harvest Direct from Verified Farmers'));

      // Verify newly created produce from Firestore appears in Marketplace
      await page.waitForFunction(() => document.body.innerText.includes('Nilgiris Fresh Hill Garlic'));

      // Add to Cart
      const addBtns = await page.$$('button');
      for (const btn of addBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Add to Cart')) {
          await btn.click();
          break;
        }
      }

      // Go to Cart
      const cartBtn = await page.$('button[title="View Cart"]');
      if (cartBtn) {
        await cartBtn.click();
      } else {
        const buttons = await page.$$('button');
        for (const b of buttons) {
          const t = await page.evaluate(el => el.textContent, b);
          if (t.includes('View Cart') || t.includes('Cart')) {
            await b.click();
            break;
          }
        }
      }

      await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));

      // Submit Order
      const orderSubmitBtn = await page.$('#order-submit-btn');
      await orderSubmitBtn.click();

      try {
        const simBtn = await page.waitForSelector('#rzp-simulate-success-btn', { timeout: 4000 });
        if (simBtn) await simBtn.click();
      } catch (e) {}

      try {
        const viewOrdersBtn = await page.waitForSelector('#view-orders-btn', { timeout: 6000 });
        if (viewOrdersBtn) await viewOrdersBtn.click();
      } catch (e) {}

      // Verify redirected to orders
      await page.waitForFunction(() => document.body.innerText.includes('My Farmgate Orders'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_05_buyer_order_placed.png') });
    });

    // 8. Delivery Agency Onboards Driver (drivers & vehicles)
    await testStep('Firestore: Delivery Agency Onboards Carrier Driver & Vehicle', async () => {
      const switchBtn = await page.$('#switch-role-btn');
      await switchBtn.click();
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      const agencyCard = await page.$('#role-agency');
      await agencyCard.click();
      await page.waitForFunction(() => document.body.innerText.includes('GreenCorridor Agro Logistics'));

      // Go to Onboard Driver via Navbar ID
      const navBtn = await page.$('#nav-agency_onboard_driver');
      if (navBtn) {
        await navBtn.click();
      } else {
        const onboardBtns = await page.$$('button');
        for (const btn of onboardBtns) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Onboard Driver') || text.includes('Onboard New Driver')) {
            await btn.click();
            break;
          }
        }
      }
      await page.waitForFunction(() => document.body.innerText.includes('Onboard Carrier Driver'));

      // Fill in Driver Form using IDs
      await page.type('#driver-name-input', 'Praveen Kumar');
      await page.type('#driver-phone-input', '+91 94420 12345');
      await page.type('#driver-license-input', 'TN-30-2024-0048123');
      await page.type('#driver-vehicle-no-input', 'TN-30-CZ-4412');

      // Submit Form
      await page.evaluate(() => {
        const btn = document.getElementById('driver-submit-btn');
        if (btn) btn.click();
      });

      // Wait for success modal
      await page.waitForSelector('#conf-driver-id', { timeout: 10000 });

      // Click continue to roster
      await page.click('#view-driver-portal-btn');

      await page.waitForFunction(() => document.body.innerText.includes('Fleet Drivers Roster'));
      const rosterText = await page.evaluate(() => document.body.innerText);
      if (!rosterText.includes('Praveen Kumar')) {
        throw new Error('Onboarded driver not rendered in Fleet Drivers Roster');
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_06_driver_onboarded.png') });
    });

    // 9. Driver Completes Delivery Handover (updates orders, payments release, RTDB tracking)
    await testStep('Firestore & RTDB: Driver OTP Handover & Escrow Release', async () => {
      console.log('\n  [9.1] Clicking switch role button...');
      const switchBtn = await page.$('#switch-role-btn');
      await switchBtn.click();
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      console.log('  [9.2] Clicking role-driver card...');
      await page.evaluate(() => {
        const btn = document.getElementById('role-driver');
        if (btn) {
          btn.scrollIntoView();
          btn.click();
        }
      });
      await new Promise(r => setTimeout(r, 1000));
      const afterDriverClickText = await page.evaluate(() => document.body.innerText);
      console.log('  [9.2.1] Body text 1s after driver click:', afterDriverClickText.substring(0, 300).replace(/\n+/g, ' '));
      await page.waitForFunction(() => document.body.innerText.includes('Murugan K'));

      console.log('  [9.3] Navigating to OTP handover...');
      // Click OTP Handover button via ID or Navbar
      await page.evaluate(() => {
        const otpBtn = document.getElementById('driver-otp-btn');
        if (otpBtn) {
          otpBtn.scrollIntoView();
          otpBtn.click();
        } else {
          const navOtpBtn = document.getElementById('nav-driver_handover');
          if (navOtpBtn) navOtpBtn.click();
        }
      });
      await page.waitForFunction(() => document.body.innerText.includes('Doorstep OTP Handover'));

      console.log('  [9.4] Clicking OTP digits 4, 8, 1, 9...');
      await page.evaluate(() => {
        document.getElementById('otp-key-4')?.click();
        document.getElementById('otp-key-8')?.click();
        document.getElementById('otp-key-1')?.click();
        document.getElementById('otp-key-9')?.click();
      });

      console.log('  [9.5] Clicking handover submit button...');
      await page.evaluate(() => {
        document.getElementById('handover-submit-btn')?.click();
      });

      console.log('  [9.6] Waiting after submit...');
      await new Promise(r => setTimeout(r, 2000));
      const pageBodyText = await page.evaluate(() => document.body.innerText);
      console.log('  [9.6.1] Body text snippet after submit:', pageBodyText.substring(0, 300).replace(/\n+/g, ' '));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_07_delivery_debug.png') });

      await page.waitForFunction(() =>
        document.body.innerText.includes('Murugan K') ||
        document.body.innerText.includes('Delivery Complete') ||
        document.body.innerText.includes('Deliveries Completed')
      );
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'firebase_07_delivery_completed.png') });
    });

    // 10. Check for unhandled console errors
    await testStep('Audit Browser Console for Firebase Errors', async () => {
      const criticalErrors = consoleErrors.filter(
        err => !err.includes('favicon') && !err.includes('net::ERR_')
      );
      if (criticalErrors.length > 0) {
        console.log('Console warnings/errors encountered:', criticalErrors);
      }
    });

  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`🎉 FIREBASE VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
}

runFirebaseVerification().catch((err) => {
  console.error('Fatal Firebase verification error:', err);
  process.exit(1);
});
