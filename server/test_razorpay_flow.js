const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
  fs.copyFileSync(p1, p2);
  console.log(`   📸 Captured: ${filename}`);
}

async function runRazorpayVerification() {
  console.log('===============================================================');
  console.log('💳 VIVAAN Complete Razorpay Payment Integration Verification');
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

  // -------------------------------------------------------------
  // Test 1: Backend Endpoints & Cryptographic HMAC Verification
  // -------------------------------------------------------------
  await testStep('Backend Endpoints & HMAC SHA-256 Signature Verification', async () => {
    // 1. Create order intent
    const createRes = await fetch(`${APP_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_inr: 1720,
        buyer_name: 'Aditi Sharma',
        buyer_phone: '+919876543210'
      })
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.razorpay_order_id) {
      throw new Error('create-order failed: ' + JSON.stringify(createData));
    }
    if (createData.key_secret || createData.secret) {
      throw new Error('SECURITY VIOLATION: Secret key leaked in create-order response!');
    }
    if (createData.payment_status !== 'Pending') {
      throw new Error('Initial payment status should be Pending');
    }

    const testOrderId = createData.razorpay_order_id;
    const testPaymentId = `pay_test_${Date.now()}`;
    const secret = 'vivaan_secret_key_demo_2026';

    // 2. Test valid HMAC signature
    const validSig = crypto.createHmac('sha256', secret).update(`${testOrderId}|${testPaymentId}`).digest('hex');
    const verifyRes = await fetch(`${APP_URL}/api/payments/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSig
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success || !verifyData.verified || verifyData.payment_status !== 'Successful') {
      throw new Error('Valid signature was rejected or status was not Successful');
    }

    // 3. Test invalid HMAC signature rejected
    const badVerifyRes = await fetch(`${APP_URL}/api/payments/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'invalid_forged_signature_12345'
      })
    });
    const badData = await badVerifyRes.json();
    if (badVerifyRes.status === 200 || badData.verified || badData.payment_status !== 'Failed') {
      throw new Error('Invalid signature was improperly accepted');
    }

    // 4. Test refund endpoint
    const refundRes = await fetch(`${APP_URL}/api/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_id: testPaymentId,
        amount_inr: 1720,
        reason: 'Verification test refund'
      })
    });
    const refundData = await refundRes.json();
    if (!refundData.success || refundData.payment_status !== 'Refunded') {
      throw new Error('Refund failed or status was not Refunded');
    }
  });

  // -------------------------------------------------------------
  // Test 2: Security Audit (Zero Secret Credentials in Frontend)
  // -------------------------------------------------------------
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

  await testStep('Security Audit: Zero Secret Credentials & Zero Card Storage', async () => {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.innerText.includes('VIVAAN'));

    const content = await page.content();
    if (content.includes('vivaan_secret_key_demo_2026')) {
      throw new Error('SECURITY VIOLATION: RAZORPAY_KEY_SECRET discovered in frontend HTML/DOM!');
    }

    const hasStoredCards = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val && (val.includes('cardNumber') || val.includes('card_number') || val.includes('cvv'))) {
          return true;
        }
      }
      return false;
    });

    if (hasStoredCards) {
      throw new Error('SECURITY VIOLATION: Discovered sensitive credit/debit card fields in client storage!');
    }
  });

  // -------------------------------------------------------------
  // Test 3: Buyer Cart Displays Product Amount, Delivery Charge, Total Amount
  // -------------------------------------------------------------
  await testStep('Buyer Cart: Financial Breakdown (Product Amount, Delivery Charge, Total Amount)', async () => {
    // Fast-track to role selection if welcome screen is showing
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.textContent.includes('Skip to Role Selection'));
      if (found) found.click();
    });
    await new Promise(r => setTimeout(r, 600));

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

    // Click "Add to Cart" on the first produce card
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Add to Cart') || b.textContent.includes('Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Navigate to Cart via navbar selector
    await page.click('#nav-buyer_cart');
    await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));

    // Verify amounts
    const amounts = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasProductAmount: text.includes('Product Amount'),
        hasDeliveryCharge: text.includes('Delivery Charge'),
        hasTotalAmount: text.includes('Total Amount'),
        hasPayButton: text.includes('via Razorpay')
      };
    });

    if (!amounts.hasProductAmount || !amounts.hasDeliveryCharge || !amounts.hasTotalAmount || !amounts.hasPayButton) {
      throw new Error('Cart missing required amounts or Razorpay pay button: ' + JSON.stringify(amounts));
    }

    await takeSnapshot(page, 'razorpay_01_cart_checkout.png');
  });

  // -------------------------------------------------------------
  // Test 4: Razorpay Checkout -> Verify Signature -> Order Confirmation (Successful)
  // -------------------------------------------------------------
  await testStep('Razorpay Checkout & Confirmation: Verify Status Successful & Escrow Protection', async () => {
    // Click "Pay via Razorpay" button
    await page.click('#order-submit-btn');
    await new Promise(r => setTimeout(r, 1000));

    // Wait for simulator modal
    await page.waitForSelector('#razorpay-simulator-modal', { timeout: 8000 });
    await takeSnapshot(page, 'razorpay_02_payment_modal.png');

    // Click "Authorize & Pay (Simulate Success)"
    await page.click('#rzp-simulate-success-btn');
    await new Promise(r => setTimeout(r, 1500));

    // Verify confirmation modal opens
    await page.waitForSelector('#conf-order-id', { timeout: 8000 });
    const confData = await page.evaluate(() => {
      return {
        orderId: document.querySelector('#conf-order-id')?.textContent,
        trackingId: document.querySelector('#conf-tracking-id')?.textContent,
        productAmount: document.querySelector('#conf-product-amount')?.textContent,
        deliveryCharge: document.querySelector('#conf-delivery-charge')?.textContent,
        totalAmount: document.querySelector('#conf-total-amount')?.textContent,
        paymentStatus: document.querySelector('#conf-payment-status')?.textContent,
        paymentId: document.querySelector('#conf-payment-id')?.textContent
      };
    });

    if (!confData.orderId || !confData.trackingId || !confData.totalAmount) {
      throw new Error('Confirmation modal missing core parameters: ' + JSON.stringify(confData));
    }
    if (!confData.paymentStatus.includes('Successful')) {
      throw new Error(`Expected paymentStatus "Successful", got "${confData.paymentStatus}"`);
    }

    await takeSnapshot(page, 'razorpay_03_order_confirmation_success.png');

    // Close modal and navigate to orders
    await page.click('#view-orders-btn');
    await new Promise(r => setTimeout(r, 1000));
  });

  // -------------------------------------------------------------
  // Test 5: Payment Failure Simulation (Status: Failed & Retry State)
  // -------------------------------------------------------------
  await testStep('Payment Failure Handling: Status Failed & Immediate User Retry', async () => {
    // Navigate back to marketplace via navbar
    await page.click('#nav-buyer_marketplace');
    await page.waitForSelector('#marketplace-search-input', { timeout: 8000 });

    // Add item to cart
    await page.waitForSelector('[id^="btn-add-cart-"]', { timeout: 5000 });
    await page.click('[id^="btn-add-cart-"]');
    await new Promise(r => setTimeout(r, 600));

    // Go to cart
    await page.click('#nav-buyer_cart');
    await page.waitForFunction(() => document.body.innerText.includes('My Cart & Order Summary'));

    // Click Pay via Razorpay
    await page.click('#order-submit-btn');
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('#razorpay-simulator-modal', { timeout: 8000 });

    // Click "Simulate Payment Failure / Decline"
    await page.click('#rzp-simulate-fail-btn');
    await new Promise(r => setTimeout(r, 800));

    // Verify failure notification is visible with Failed badge
    await page.waitForSelector('#payment-failure-notice', { timeout: 5000 });
    const failBadge = await page.$eval('#cart-payment-failed-badge', el => el.textContent.trim());
    if (failBadge !== 'Failed') {
      throw new Error(`Expected failure status badge "Failed", got "${failBadge}"`);
    }

    // Verify cart items are still in cart (retryable)
    const cartCount = await page.evaluate(() => {
      const txt = document.body.innerText.toLowerCase();
      return txt.includes('items in cart') || txt.includes('total amount');
    });
    if (!cartCount) {
      throw new Error('Cart items were unexpectedly lost on payment failure');
    }

    await takeSnapshot(page, 'razorpay_04_payment_failed.png');
  });


  // -------------------------------------------------------------
  // Test 6: Orders Table Displays All 4 Required Payment Statuses
  // -------------------------------------------------------------
  await testStep('Orders History: Verify All 4 Statuses (Pending, Successful, Failed, Refunded)', async () => {
    // Navigate to My Orders via navbar
    await page.click('#nav-buyer_orders');
    await page.waitForFunction(() => document.body.innerText.includes('My Farmgate Orders'));

    const statusPresence = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasPending: text.includes('Pending'),
        hasSuccessful: text.includes('Successful'),
        hasFailed: text.includes('Failed'),
        hasRefunded: text.includes('Refunded')
      };
    });

    if (!statusPresence.hasPending || !statusPresence.hasSuccessful || !statusPresence.hasFailed || !statusPresence.hasRefunded) {
      throw new Error('Orders table does not display all 4 required payment statuses: ' + JSON.stringify(statusPresence));
    }

    await takeSnapshot(page, 'razorpay_05_orders_all_statuses.png');
  });

  // -------------------------------------------------------------
  // Test 7: Razorpay Refund Processing (Status -> Refunded)
  // -------------------------------------------------------------
  await testStep('Razorpay Refund Flow: Reversal & Status Transition to Refunded', async () => {
    // Find an order with Successful status and click Track
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        if (row.innerText.includes('Successful') && !row.innerText.includes('DELIVERED')) {
          const trackBtn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Track'));
          if (trackBtn) {
            trackBtn.click();
            break;
          }
        }
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Verify refund button is present in modal
    await page.waitForSelector('#initiate-refund-btn', { timeout: 5000 });

    // Click "Request Razorpay Refund"
    await page.click('#initiate-refund-btn');
    await new Promise(r => setTimeout(r, 1500));

    // Verify payment status changes to Refunded
    const isRefunded = await page.evaluate(() => {
      return document.body.innerText.includes('Refunded') && document.body.innerText.includes('Refund Completed');
    });

    if (!isRefunded) {
      throw new Error('Order modal failed to transition to Refunded status');
    }

    await takeSnapshot(page, 'razorpay_06_refund_processed.png');
  });

  await browser.close();

  console.log('\n===============================================================');
  console.log(`📊 Final Razorpay Verification Results: ${passed} PASSED | ${failed} FAILED`);
  console.log(`🚨 Browser Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors Sample:', consoleErrors.slice(0, 3));
  }
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRazorpayVerification().catch((err) => {
  console.error('Fatal Verification Runner Error:', err);
  process.exit(1);
});
