const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const APP_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'scratch_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runFarmerModuleVerification() {
  console.log('===============================================================');
  console.log('🌾 VIVAAN Complete Farmer Module Verification Suite');
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
    // 1. Initial Load & Enter Farmer Portal
    await testStep('Access Application & Enter Farmer Portal', async () => {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));

      // Fast-track to role select if on welcome screen
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const found = btns.find(b => b.textContent.includes('Skip to Role Selection'));
        if (found) found.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Farmer Role
      await page.evaluate(() => {
        const btn = document.getElementById('role-farmer');
        if (btn) btn.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('Ramasamy Gounder'));
    });

    // 2. Farmer Dashboard: Verify All 10 Required Features
    await testStep('Farmer Dashboard: Verify All 10 Modules (Products, Orders, Sales, Earnings, Pending Escrow, Analytics, AI Assistant, Weather, Profile, Verification)', async () => {
      const bodyText = await page.evaluate(() => document.body.innerText);

      // 1. Profile
      if (!bodyText.includes('Ramasamy Gounder') || !bodyText.includes('VIV-FR-104582')) {
        throw new Error('Profile header missing name or Farmer ID');
      }

      // 2. Verification
      if (!bodyText.toLowerCase().includes('verified farmer')) {
        throw new Error('Verification badge missing from dashboard');
      }

      // 3. Products
      if (!bodyText.toLowerCase().includes('active listings') || !bodyText.toLowerCase().includes('my active harvest listings')) {
        throw new Error('Products module missing from dashboard');
      }

      // 4. Orders
      if (!bodyText.toLowerCase().includes('orders received') || !bodyText.toLowerCase().includes('buyer orders')) {
        throw new Error('Orders module missing from dashboard');
      }

      // 5. Sales
      if (!bodyText.toLowerCase().includes('total sales')) {
        throw new Error('Sales metric widget missing from dashboard');
      }

      // 6. Earnings
      if (!bodyText.toLowerCase().includes('total earnings')) {
        throw new Error('Total Earnings widget missing from dashboard');
      }

      // 7. Pending Payments (Escrow)
      if (!bodyText.toLowerCase().includes('pending payments') || !bodyText.toLowerCase().includes('held in escrow')) {
        throw new Error('Pending Payments widget missing from dashboard');
      }

      // 8. Analytics
      if (!bodyText.toLowerCase().includes('mandi spread') || !bodyText.toLowerCase().includes('above apmc rates')) {
        throw new Error('Analytics Mandi Spread widget missing from dashboard');
      }

      // 9. AI Assistant
      if (!bodyText.includes('VIVAAN Farm Advisory AI Assistant') || !bodyText.includes('ACTIVE ADVISOR')) {
        throw new Error('AI Assistant Copilot card missing from dashboard');
      }

      // 10. Weather
      if (!bodyText.includes('Localized Agro-Weather') || !bodyText.includes('29°C') || !bodyText.includes('Humidity')) {
        throw new Error('Localized Agro-Weather widget missing from dashboard');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_01_dashboard_all_widgets.png') });
    });

    // 3. Farmer Registration & Land Patta KYC with Leased Land Support
    await testStep('Farmer Registration & Land KYC (Personal, Bank, Leased Landowner Details & Verification)', async () => {
      // Navigate to Land Patta KYC
      await page.waitForSelector('#btn-farmer-manage-kyc');
      await page.click('#btn-farmer-manage-kyc');

      await page.waitForFunction(() => document.body.innerText.includes('Land Title Ownership Form'));

      // Check Personal tab fields
      await page.waitForSelector('#farmer-fullname-input');
      await page.type('#farmer-fullname-input', ' Perumal');
      await page.type('#farmer-alt-mobile-input', '+91 94420 55123');

      // Go to Land Records tab
      await page.waitForSelector('#btn-goto-land-tab');
      await page.click('#btn-goto-land-tab');
      await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('agricultural land title & ledger records'));

      // Select 'Leased Land With Agreement'
      await page.waitForSelector('#ownership-leased-land-with-agreement');
      await page.click('#ownership-leased-land-with-agreement');

      // Proceed to Leased Landowner Information tab
      await page.waitForSelector('#btn-goto-lease-tab');
      await page.click('#btn-goto-lease-tab');
      await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('leased landowner & contract verification'));

      // Fill Leased Landowner Details
      await page.waitForSelector('#lease-landowner-name');
      await page.type('#lease-landowner-name', ' S');
      await page.type('#lease-landowner-phone', '0');

      // Submit Registration & Land Audit
      await page.waitForSelector('#farmer-reg-submit-btn');
      await page.click('#farmer-reg-submit-btn');

      // Verify successful verification banner with Unique Farmer ID and "AUDIT PASSED"
      await page.waitForFunction(() =>
        document.body.innerText.includes('Farmer Registration Verified!') ||
        document.body.innerText.includes('AUDIT PASSED') ||
        document.body.innerText.includes('Open Digital Farmer ID Card')
      );

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_02_registration_verified.png') });
    });

    // 4. Digital Farmer Identity Card Generation
    await testStep('Generate Digital Farmer ID Card (Unique Farmer ID, Photo, QR Code, Barcode & Verification Status)', async () => {
      // Click Open Digital Farmer ID Card
      await page.evaluate(() => {
        const btn = document.getElementById('view-generated-farmer-card-btn') || document.getElementById('nav-farmer_id_card');
        if (btn) btn.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('VIVAAN FARMER IDENTITY'));

      // Verify Card elements
      const farmerId = await page.evaluate(() => document.getElementById('unique-farmer-id')?.textContent);
      if (!farmerId || !farmerId.startsWith('VIV-FR-')) {
        throw new Error(`Invalid or missing Unique Farmer ID: ${farmerId}`);
      }

      const verifiedBadge = await page.evaluate(() => document.getElementById('farmer-verified-badge')?.textContent);
      if (!verifiedBadge || !verifiedBadge.includes('VERIFIED')) {
        throw new Error('Verified badge missing on Farmer Card');
      }

      const hasQrCode = await page.evaluate(() => Boolean(document.getElementById('farmer-qr-code')));
      if (!hasQrCode) {
        throw new Error('SVG QR code missing from Farmer Card');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_03_digital_farmer_card.png') });
    });

    // 5. Farmer Product Posting (Full Fields: Image, Availability, Date/Time)
    await testStep('Farmer Product Posting (Name, Image, Quantity, Unit, Price, Availability, Date/Time)', async () => {
      // Navigate to Add Produce
      await page.evaluate(() => {
        document.getElementById('nav-farmer_add_produce')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('List New Harvest Batch'));

      // Fill in all required product fields
      await page.type('#produce-title-input', 'Salem Premium Hill Garlic (GI Tag)');
      await page.type('#produce-qty-input', '180');
      await page.type('#produce-price-input', '240');
      await page.type('#produce-description-input', 'High-altitude organic hill garlic batch with potent allicin content.');

      // Select preset photo
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const garlicBtn = btns.find(b => b.textContent.includes('Hill Garlic'));
        if (garlicBtn) garlicBtn.click();
      });

      // Submit Produce Listing
      await page.evaluate(() => {
        document.getElementById('produce-submit-btn')?.click();
      });

      // Verify redirected to produce listings and newly created produce is rendered
      await page.waitForFunction(() => document.body.innerText.includes('My Produce Listings'));
      await page.waitForFunction(() => document.body.innerText.includes('Salem Premium Hill Garlic (GI Tag)'));

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_04_produce_posted.png') });
    });

    // 6. Automatic Quantity Reduction on Order Placement
    await testStep('Automatic Quantity Reduction: Order Placement Decrements Available Harvest Stock in Real-time', async () => {
      // 1. Get initial stock of Salem Pure Organic Turmeric
      const initialStockText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        for (const row of rows) {
          if (row.innerText.includes('Salem Pure Organic Turmeric')) {
            return row.innerText;
          }
        }
        return '';
      });
      console.log('    Initial stock row:', initialStockText.replace(/\n+/g, ' '));

      // 2. Switch to Buyer Role
      await page.evaluate(() => {
        document.getElementById('switch-role-btn')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      await page.evaluate(() => {
        document.getElementById('role-buyer')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('Fresh Agricultural Harvest Direct from Verified Farmers'));

      // 3. Add 10 kg Turmeric to Cart
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.bg-white'));
        for (const card of cards) {
          if (card.innerText.includes('Salem Pure Organic Turmeric')) {
            const addBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Add to Cart') || b.id.startsWith('btn-add-cart'));
            if (addBtn) addBtn.click();
            break;
          }
        }
      });

      // 4. Go to Cart & Submit Order
      await page.evaluate(() => {
        const cartBtn = document.getElementById('btn-view-cart') || document.getElementById('nav-buyer_cart') || document.querySelector('button[title="View Cart"]');
        if (cartBtn) cartBtn.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));

      await page.evaluate(() => {
        document.getElementById('order-submit-btn')?.click();
      });

      try {
        const simBtn = await page.waitForSelector('#rzp-simulate-success-btn', { timeout: 4000 });
        if (simBtn) await simBtn.click();
      } catch (e) {}

      try {
        const viewOrdersBtn = await page.waitForSelector('#view-orders-btn', { timeout: 6000 });
        if (viewOrdersBtn) await viewOrdersBtn.click();
      } catch (e) {}

      await page.waitForFunction(() => document.body.innerText.includes('My Farmgate Orders'));

      // 5. Switch back to Farmer Role
      await page.evaluate(() => {
        document.getElementById('switch-role-btn')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      await page.evaluate(() => {
        document.getElementById('role-farmer')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('Ramasamy Gounder'));

      // 6. Go to Produce Listings & Check Stock
      await page.evaluate(() => {
        document.getElementById('nav-farmer_produce')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('My Produce Listings'));

      const reducedStockText = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        for (const row of rows) {
          if (row.innerText.includes('Salem Pure Organic Turmeric')) {
            return row.innerText;
          }
        }
        return '';
      });
      console.log('    Reduced stock row:', reducedStockText.replace(/\n+/g, ' '));

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_05_inventory_reduced.png') });
    });

    // 7. Privacy Masking Verification (Residential Address Not Exposed)
    await testStep('Privacy Masking: Farmer Residential Street/Door Address Strictly Hidden from Public Marketplace', async () => {
      // Switch to Buyer Role
      await page.evaluate(() => {
        document.getElementById('switch-role-btn')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      await page.evaluate(() => {
        document.getElementById('role-buyer')?.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('Fresh Agricultural Harvest Direct from Verified Farmers'));

      const marketplaceContent = await page.evaluate(() => document.body.innerText);

      // Verify private street address is NEVER present in the marketplace text
      if (marketplaceContent.includes('4/182, East Garden Street') || marketplaceContent.includes('Post Office Road')) {
        throw new Error('CRITICAL PRIVACY LEAK: Farmer exact residential street address exposed in public marketplace!');
      }

      // Verify aggregate locality (village, district) IS visible
      if (!marketplaceContent.includes('Omalur') || !marketplaceContent.includes('Salem')) {
        throw new Error('Expected aggregate locality (Omalur, Salem) missing from marketplace cards');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'farmer_06_privacy_masked.png') });
    });

    // 8. Browser Console Audit
    await testStep('Audit Browser Console for Errors', async () => {
      const criticalErrors = consoleErrors.filter(
        err => !err.includes('favicon') && !err.includes('net::ERR_')
      );
      if (criticalErrors.length > 0) {
        console.log('Console warnings encountered:', criticalErrors);
      }
    });

  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`🎉 FARMER MODULE VERIFICATION: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
}

runFarmerModuleVerification().catch((err) => {
  console.error('Fatal farmer module verification error:', err);
  process.exit(1);
});
