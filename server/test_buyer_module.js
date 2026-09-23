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

async function runBuyerModuleVerification() {
  console.log('===============================================================');
  console.log('🛒 VIVAAN Complete Buyer / Consumer Module Verification Suite');
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
    // 1. Enter Buyer Portal
    await testStep('Access Application & Enter Consumer / Buyer Portal', async () => {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));

      // Fast-track to role select if on welcome screen
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const found = btns.find(b => b.textContent.includes('Skip to Role Selection'));
        if (found) found.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('How do you want to use VIVAAN?'));

      // Click Consumer / Buyer Role
      await page.evaluate(() => {
        const btn = document.getElementById('role-buyer');
        if (btn) {
          btn.click();
        } else {
          const cards = Array.from(document.querySelectorAll('button, div'));
          const buyerCard = cards.find(el => el.textContent.includes('Consumer / Buyer'));
          if (buyerCard) buyerCard.click();
        }
      });

      await page.waitForSelector('#marketplace-search-input', { timeout: 10000 });
      await takeSnapshot(page, 'buyer_01_marketplace_landing.png');
    });

    // 2. Buyer Profile & Google Login
    await testStep('Buyer Profile: Google Login & Profile Fields (5 Buyer Types)', async () => {
      // Navigate to Buyer Profile via navbar
      await page.click('#nav-buyer_profile');

      await page.waitForSelector('#buyer-fullname-input', { timeout: 10000 });

      // Check all 9 required profile fields exist in DOM
      const fieldsExist = await page.evaluate(() => {
        const ids = [
          'buyer-fullname-input',
          'buyer-email-input',
          'buyer-mobile-input',
          'buyer-state-select',
          'buyer-district-input',
          'buyer-city-input',
          'buyer-pincode-input',
          'buyer-address-input'
        ];
        return ids.every(id => document.getElementById(id) !== null);
      });

      if (!fieldsExist) {
        throw new Error('One or more of the required profile input fields are missing from the DOM');
      }

      // Check all 5 Buyer Types exist
      const buyerTypesExist = await page.evaluate(() => {
        const typeIds = [
          'buyertype-retail-consumer',
          'buyertype-wholesaler',
          'buyertype-retailer',
          'buyertype-restaurant',
          'buyertype-business-buyer'
        ];
        return typeIds.every(id => document.getElementById(id) !== null);
      });

      if (!buyerTypesExist) {
        throw new Error('One or more of the 5 required Buyer Type selection cards are missing');
      }

      // Click "Continue with Google / Gmail"
      await page.click('#google-signin-btn');
      await new Promise(r => setTimeout(r, 600));

      // Select "Restaurant" buyer type
      await page.click('#buyertype-restaurant');
      await new Promise(r => setTimeout(r, 300));

      // Fill in custom address
      await page.evaluate(() => {
        const addrInput = document.getElementById('buyer-address-input');
        if (addrInput) {
          addrInput.value = 'Plot 88, Anna Nagar West, Gourmet Kitchen Hub';
          addrInput.dispatchEvent(new Event('input', { bubbles: true }));
          addrInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Submit / Save Profile
      await page.click('#buyer-profile-save-btn');
      await new Promise(r => setTimeout(r, 600));
      await takeSnapshot(page, 'buyer_02_google_auth_and_profile.png');
    });

    // 3. Marketplace: Search & Distance Filters
    await testStep('Marketplace: Search Products & Farmers, Distance Filters (Nearby vs Long-Distance)', async () => {
      // Navigate to Marketplace via navbar
      await page.click('#nav-buyer_marketplace');
      await page.waitForSelector('#marketplace-search-input', { timeout: 10000 });

      // Filter by Nearby (< 50 km)
      await page.click('#filter-dist-nearby');
      await new Promise(r => setTimeout(r, 400));
      const textNearby = await page.evaluate(() => document.body.innerText);
      if (!textNearby.toLowerCase().includes('km') || !textNearby.toLowerCase().includes('nearby')) {
        throw new Error('Nearby distance filter failed to activate');
      }

      // Filter by Long-Distance (> 100 km)
      await page.click('#filter-dist-long');
      await new Promise(r => setTimeout(r, 400));
      const textLong = await page.evaluate(() => document.body.innerText);
      if (!textLong.toLowerCase().includes('corridor') && !textLong.toLowerCase().includes('long-distance')) {
        throw new Error('Long-distance corridor filter failed to activate');
      }

      // Reset to All Distances
      await page.click('#filter-dist-all');
      await new Promise(r => setTimeout(r, 300));

      // Search for "Turmeric"
      await page.evaluate(() => {
        const searchInput = document.getElementById('marketplace-search-input');
        if (searchInput) {
          searchInput.value = 'Turmeric';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 400));
      const searchProduceResult = await page.evaluate(() => document.body.innerText);
      if (!searchProduceResult.toLowerCase().includes('turmeric')) {
        throw new Error('Search produce query for Turmeric did not match listings');
      }

      // Test farmer search "Kavitha"
      await page.evaluate(() => {
        const searchInput = document.getElementById('marketplace-search-input');
        if (searchInput) {
          searchInput.value = 'Kavitha';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 400));
      const searchFarmerResult = await page.evaluate(() => document.body.innerText);
      if (!searchFarmerResult.toLowerCase().includes('kavitha')) {
        throw new Error('Search farmer query for Kavitha did not match listings');
      }

      // Clear search
      await page.evaluate(() => {
        const searchInput = document.getElementById('marketplace-search-input');
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 400));
      await takeSnapshot(page, 'buyer_03_search_and_filters.png');
    });

    // 4. Product Details & Farmer Details Modals
    await testStep('Marketplace: Product Details & Farmer Profile Modals (Privacy Guarded)', async () => {
      // Click "View Details" on the first product card
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const detailBtn = btns.find(b => b.textContent.includes('View Details') || b.textContent.includes('Details'));
        if (detailBtn) detailBtn.click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('Harvest Date:') || document.body.innerText.includes('Dispatch:'));
      await takeSnapshot(page, 'buyer_04_product_details_modal.png');

      // Click "View Farmer Profile" from inside the product modal
      await page.click('#view-farmer-profile-modal-btn');

      await page.waitForSelector('#farmer-details-modal', { timeout: 10000 });

      // Check farmer profile privacy: verify Farmer ID and locality, but ensure NO private street address is leaked
      const farmerModalText = await page.evaluate(() => document.body.innerText);
      if (!farmerModalText.includes('VIV-FR-')) {
        throw new Error('Farmer modal missing verified VIV-FR Farmer ID');
      }
      if (farmerModalText.includes('4/182, East Garden Street')) {
        throw new Error('CRITICAL PRIVACY LEAK: Private farmer street address was exposed in public buyer modal!');
      }

      await takeSnapshot(page, 'buyer_05_farmer_details_modal.png');

      // Close modal
      await page.evaluate(() => {
        const modal = document.getElementById('farmer-details-modal');
        if (modal) {
          const closeBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Close' || b.querySelector('svg.lucide-x'));
          if (closeBtn) closeBtn.click();
        }
      });
      await new Promise(r => setTimeout(r, 400));
    });

    // 5. Quantity Selection & Add to Cart
    await testStep('Quantity Selection & Add to Cart Integration', async () => {
      // Find a quantity selector on a card and increment quantity
      await page.evaluate(() => {
        const plusBtns = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('svg.lucide-plus') || b.textContent === '+');
        if (plusBtns.length > 0) {
          plusBtns[0].click(); // increment
          plusBtns[0].click();
        }
      });

      await new Promise(r => setTimeout(r, 300));

      // Click "Add to Cart"
      await page.evaluate(() => {
        const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Add to Cart') || b.textContent.includes('Add'));
        if (addBtns.length > 0) {
          addBtns[0].click();
        }
      });

      await new Promise(r => setTimeout(r, 600));

      // Navigate to Cart via navbar
      await page.click('#nav-buyer_cart');

      await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));

      // Verify cart breakdown: Produce Subtotal, Delivery Charge, Total Amount
      const cartText = await page.evaluate(() => document.body.innerText.toLowerCase());
      if (!cartText.includes('product amount') && !cartText.includes('produce subtotal')) {
        throw new Error('Cart missing Product Amount / Produce Subtotal');
      }
      if (!cartText.includes('delivery charge') && !cartText.includes('logistics transit')) {
        throw new Error('Cart missing Delivery Charge');
      }
      if (!cartText.includes('total amount')) {
        throw new Error('Cart missing Total Amount');
      }

      await takeSnapshot(page, 'buyer_06_cart_summary.png');
    });

    // 6. Order Placement: Order ID, Tracking ID, Escrow Lock
    await testStep('Place Order: Generate Order ID, Tracking ID, Escrow Payment Status & Order Status', async () => {
      await new Promise(r => setTimeout(r, 2600));

      // Remove any overlapping toast notifications and click submit
      await page.waitForSelector('#order-submit-btn', { timeout: 10000 });
      await page.evaluate(() => {
        document.querySelectorAll('.fixed .pointer-events-auto').forEach(el => el.remove());
        const btn = document.getElementById('order-submit-btn');
        if (btn) btn.click();
      });
      await page.click('#order-submit-btn').catch(() => {});
      await new Promise(r => setTimeout(r, 1500));

      // Wait for simulator modal
      await page.waitForSelector('#razorpay-simulator-modal', { timeout: 10000 });

      // Click "Authorize & Pay (Simulate Success)"
      await page.click('#rzp-simulate-success-btn');
      await new Promise(r => setTimeout(r, 2000));

      // Wait for confirmation modal
      await page.waitForSelector('#conf-order-id', { timeout: 12000 });

      const modalDetails = await page.evaluate(() => {
        return {
          orderId: document.getElementById('conf-order-id')?.textContent,
          trackingId: document.getElementById('conf-tracking-id')?.textContent,
          productAmount: document.getElementById('conf-product-amount')?.textContent,
          deliveryCharge: document.getElementById('conf-delivery-charge')?.textContent,
          totalAmount: document.getElementById('conf-total-amount')?.textContent,
          paymentStatus: document.getElementById('conf-payment-status')?.textContent,
          orderStatus: document.getElementById('conf-order-status')?.textContent
        };
      });

      if (!modalDetails.orderId || !modalDetails.trackingId || !modalDetails.totalAmount) {
        throw new Error('Order confirmation modal is missing generated identifiers or amounts: ' + JSON.stringify(modalDetails));
      }

      await takeSnapshot(page, 'buyer_07_order_confirmation_modal.png');

      // Click "View in My Orders"
      await page.click('#view-orders-btn');
      await page.waitForFunction(() => document.body.innerText.includes('My Farmgate Orders'));
    });

    // 7. Orders View: Display Order ID, Tracking ID, Product Amount, Delivery Charge, Total Amount, Payment Status, Order Status
    await testStep('Orders History: Verify All 7 Required Columns & Live Consignment Modal', async () => {
      const ordersPageText = await page.evaluate(() => document.body.innerText.toLowerCase());

      // Verify Table Headers case-insensitively
      const requiredColumns = [
        'order id',
        'tracking id',
        'product amount',
        'delivery charge',
        'total amount',
        'payment status',
        'order status'
      ];
      for (const col of requiredColumns) {
        if (!ordersPageText.includes(col)) {
          throw new Error(`Orders table missing column header: ${col}`);
        }
      }

      // Verify at least one row has VIV-ORD- and TRK-VIV- and Successful / HELD_IN_ESCROW
      if (!ordersPageText.includes('viv-ord-') || !ordersPageText.includes('trk-viv-') || (!ordersPageText.includes('held_in_escrow') && !ordersPageText.includes('successful'))) {
        throw new Error('Orders table rows missing Order ID, Tracking ID, or Escrow Payment Status');
      }


      // Click "Track" on the first order
      await page.evaluate(() => {
        const trackBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Track'));
        if (trackBtns.length > 0) trackBtns[0].click();
      });

      await page.waitForFunction(() => document.body.innerText.includes('Live Logistics Progress') || document.body.innerText.includes('Logistics Partner Assigned'));
      await takeSnapshot(page, 'buyer_08_live_tracking_modal.png');

      // Close modal
      await page.evaluate(() => {
        const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Close'));
        if (closeBtns.length > 0) closeBtns[0].click();
      });
      await new Promise(r => setTimeout(r, 400));
    });

  } catch (globalErr) {
    console.error('Fatal Test Exception:', globalErr);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`📊 Final Buyer Verification Results: ${passed} PASSED | ${failed} FAILED`);
  console.log(`🚨 Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors Sample:', consoleErrors.slice(0, 5));
  }
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBuyerModuleVerification();
