"""
VIVAAN Orders & Delivery Workflow Router
Implements the exact end-to-end flow:
Order Created -> Availability Check -> Agency/Driver Route Match -> Delivery OTP Generated -> Escrow Hold -> Reviews
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from models import (
    OrderCreateRequest, ReviewSubmitRequest, MultiFarmerCheckoutRequest,
    DeliveryBatchCreateRequest, BatchSimulateStepRequest
)
from datetime import datetime
import random

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/create")
def create_order(payload: OrderCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # 1. Product Availability Check
    cursor.execute("""
    SELECT p.*, f.full_name as farmer_name, f.user_id as farmer_user_id,
           l.state as f_state, l.district as f_district, l.village as f_village
    FROM products p
    JOIN farmers f ON f.id = p.farmer_id
    JOIN land_records l ON l.farmer_id = f.id
    WHERE p.id = ? AND p.is_active = 1
    """, (payload.product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product is not currently available.")

    if product['available_quantity'] < payload.quantity:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Insufficient produce stock. Available: {product['available_quantity']} {product['unit']}")

    # Deduct stock
    new_stock = product['available_quantity'] - payload.quantity
    cursor.execute("UPDATE products SET available_quantity = ? WHERE id = ?", (new_stock, payload.product_id))

    # 2. Pricing & Delivery Fee Calculation
    unit_price = product['price_per_unit']
    subtotal = unit_price * payload.quantity
    delivery_fee = 120.0 if payload.delivery_type == "Standard" else 220.0
    total_amount = subtotal + delivery_fee

    # 3. Order-to-Agency Intelligent Serviceability Matching
    # Check if intra-district or state-wide
    same_state = (product['f_state'].strip().lower() == payload.delivery_state.strip().lower())
    same_district = same_state and (product['f_district'].strip().lower() == payload.delivery_district.strip().lower())

    if same_district:
        # Match Local or District agency
        cursor.execute("SELECT * FROM agencies WHERE service_type IN ('LOCAL', 'DISTRICT') AND status = 'VERIFIED' LIMIT 1")
    elif same_state:
        # Match District or State agency
        cursor.execute("SELECT * FROM agencies WHERE service_type IN ('DISTRICT', 'STATE') AND status = 'VERIFIED' LIMIT 1")
    else:
        # Match State agency
        cursor.execute("SELECT * FROM agencies WHERE service_type = 'STATE' AND status = 'VERIFIED' LIMIT 1")

    agency = cursor.fetchone()
    if not agency:
        # Fallback to any verified agency
        cursor.execute("SELECT * FROM agencies WHERE status = 'VERIFIED' LIMIT 1")
        agency = cursor.fetchone()

    agency_id = agency['id'] if agency else 1
    agency_name = agency['brand_name'] if agency else "VIVAAN Certified Logistics"

    # Match active driver from agency
    cursor.execute("SELECT * FROM drivers WHERE agency_id = ? AND status = 'ACTIVE' LIMIT 1", (agency_id,))
    driver = cursor.fetchone()
    if not driver:
        cursor.execute("SELECT * FROM drivers WHERE status = 'ACTIVE' LIMIT 1")
        driver = cursor.fetchone()

    driver_id = driver['driver_id'] if driver else "VIV-DR-104582"
    driver_name = driver['full_name'] if driver else "Murugan K"

    # 4. Generate 4-digit Delivery OTP
    delivery_otp = str(random.randint(1000, 9999))
    order_id = f"VIV-ORD-{random.randint(10000, 99999)}"

    # Set approximate coordinates for map visualization
    # Salem -> Chennai or custom coordinates
    pickup_lat, pickup_lng = 11.6643, 78.1460
    delivery_lat, delivery_lng = 13.0827, 80.2707

    # 5. Insert Order
    cursor.execute("""
    INSERT INTO orders (
        id, buyer_id, buyer_name, buyer_phone, farmer_id, farmer_name,
        product_id, product_name, quantity, unit, unit_price, total_amount,
        delivery_fee, delivery_address, delivery_state, delivery_district,
        delivery_pincode, delivery_type, preferred_date, preferred_time,
        driver_notes, payment_method, payment_status, order_status,
        agency_id, agency_name, driver_id, driver_name, delivery_otp,
        pickup_lat, pickup_lng, delivery_lat, delivery_lng, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'IN_TRANSIT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id, payload.buyer_id, payload.buyer_name, payload.buyer_phone,
        product['farmer_id'], product['farmer_name'], product['id'], product['title'],
        payload.quantity, product['unit'], unit_price, total_amount, delivery_fee,
        payload.delivery_address, payload.delivery_state, payload.delivery_district,
        payload.delivery_pincode, payload.delivery_type, payload.preferred_date or now[:10],
        payload.preferred_time or 'Morning', payload.driver_notes or '',
        payload.payment_method, agency_id, agency_name, driver_id, driver_name,
        delivery_otp, pickup_lat, pickup_lng, delivery_lat, delivery_lng, now
    ))

    # 6. Escrow Record
    farmer_share = subtotal * 0.95 # 95% straight to farmer
    platform_fee = subtotal * 0.05
    cursor.execute("""
    INSERT INTO payments_escrow (
        order_id, total_amount, farmer_amount, agency_fee, platform_fee,
        status, transaction_ref, paid_at
    ) VALUES (?, ?, ?, ?, ?, 'HELD_IN_ESCROW', ?, ?)
    """, (
        order_id, total_amount, farmer_share, delivery_fee, platform_fee,
        f"TXN-RAZOR-{random.randint(1000000, 9999999)}", now
    ))

    # 7. Notifications
    # Buyer notification with Delivery OTP
    cursor.execute("""
    SELECT user_id FROM buyers WHERE id = ?
    """, (payload.buyer_id,))
    buyer_user = cursor.fetchone()
    if buyer_user:
        cursor.execute("""
        INSERT INTO notifications (user_id, role, title, message, type, created_at)
        VALUES (?, 'BUYER', 'Order Confirmed - Secret OTP Inside', ?, 'ORDER', ?)
        """, (buyer_user['user_id'], f"Order {order_id} placed successfully. Driver {driver_name} is en route. Your secret delivery OTP is {delivery_otp}. Share with driver only upon handover.", now))

    # Farmer notification
    cursor.execute("""
    INSERT INTO notifications (user_id, role, title, message, type, created_at)
    VALUES (?, 'FARMER', 'New Direct Order Received', ?, 'ORDER', ?)
    """, (product['farmer_user_id'], f"Order {order_id} for {payload.quantity} {product['unit']} of {product['title']} received. Escrow payout of ₹{farmer_share:,.2f} reserved.", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": order_id,
        "delivery_otp": delivery_otp,
        "driver_name": driver_name,
        "agency_name": agency_name,
        "total_amount": total_amount,
        "message": f"Order {order_id} placed successfully! Delivery driver {driver_name} assigned."
    }

@router.get("/{order_id}/track")
def track_order(order_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, f.primary_phone as farmer_phone, l.village as farmer_village,
           p.status as escrow_status, p.transaction_ref
    FROM orders o
    JOIN farmers f ON f.id = o.farmer_id
    JOIN land_records l ON l.farmer_id = f.id
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    WHERE o.id = ?
    """, (order_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    o = dict(row)
    return {"success": True, "order": o}

@router.get("/{order_id}/live-tracking")
def get_role_based_live_tracking(
    order_id: str,
    role: str = "BUYER",
    agency_id: int = None
):
    """
    PHASE 41: Strict Role-Based Tracking Permission Enforcement
    ----------------------------------------------------------
    Order Stage       | VIVAAN Admin | Assigned Agency | Buyer | Driver
    ORDER_PLACED      | No live driver| No              | No    | No
    ASSIGNED          | No live driver| No              | No    | No
    ACCEPTED/TO_FARMER| YES          | YES             | NO    | YES
    PICKED_UP/TO_BUYER| YES          | YES             | YES   | YES
    DELIVERED         | NO (Stopped) | NO (Stopped)    | NO    | Delivery complete
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, f.full_name as farmer_name, l.village as farmer_village, l.district as farmer_district,
           p.status as escrow_status
    FROM orders o
    JOIN farmers f ON f.id = o.farmer_id
    JOIN land_records l ON l.farmer_id = f.id
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    WHERE o.id = ?
    """, (order_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    o = dict(row)
    status = o['order_status']
    tracking_phase = o.get('tracking_phase') or 'TO_FARMER'
    tracking_active = bool(o.get('tracking_active', 0))

    # Stage: DELIVERED -> Tracking is TERMINATED for everyone! (Phase 47 & 48)
    if status == 'DELIVERED' or not tracking_active:
        return {
            "success": True,
            "order_id": order_id,
            "order_status": "DELIVERED",
            "tracking_phase": "ENDED",
            "live_tracking_allowed": False,
            "delivered_at": o.get('delivered_at'),
            "message": "Order Delivered. Delivery confirmed by OTP. Live tracking ended."
        }

    # Stage: Placed or Assigned -> No driver has accepted yet
    if status in ('ORDER_PLACED', 'ASSIGNED', 'PENDING'):
        return {
            "success": True,
            "order_id": order_id,
            "order_status": status,
            "tracking_phase": "PENDING_ACCEPTANCE",
            "live_tracking_allowed": False,
            "message": "Delivery driver is being assigned. Live tracking will activate upon route acceptance."
        }

    # Agency Privacy Check: Agency can only track its own orders (Phase 56 & 59)
    if role.upper() == 'AGENCY' and agency_id and o.get('agency_id') != agency_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Agencies can only track their own assigned drivers.")

    # Buyer Role Check (Phase 36, 40, 41)
    if role.upper() == 'BUYER':
        # Before Collect: Buyer CANNOT track driver!
        if status in ('ACCEPTED', 'TO_FARMER'):
            return {
                "success": True,
                "order_id": order_id,
                "order_status": status,
                "tracking_phase": "TO_FARMER",
                "live_tracking_allowed": False,
                "delivery_otp": o['delivery_otp'],
                "driver_name": o['driver_name'],
                "agency_name": o['agency_name'],
                "message": "Your order is being collected from the farmer. Live tracking will become available after pickup."
            }

        # After Collect: Buyer CAN see assigned driver!
        if status in ('PICKED_UP', 'TO_BUYER', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'):
            return {
                "success": True,
                "order_id": order_id,
                "order_status": status,
                "tracking_phase": "TO_BUYER",
                "live_tracking_allowed": True,
                "driver_id": o['driver_id'],
                "driver_name": o['driver_name'],
                "agency_name": o['agency_name'],
                "driver_lat": o.get('driver_lat') or 12.6500,
                "driver_lng": o.get('driver_lng') or 79.6000,
                "destination_lat": o['delivery_lat'],
                "destination_lng": o['delivery_lng'],
                "destination_address": o['delivery_address'],
                "pickup_lat": o['pickup_lat'],
                "pickup_lng": o['pickup_lng'],
                "delivery_otp": o['delivery_otp'],
                "last_gps_update": o.get('last_gps_update'),
                "message": "Live tracking active. Driver is en route to your delivery address."
            }

    # Admin, Agency, and Driver Roles
    # Can track when status is ACCEPTED (to farmer) or PICKED_UP (to buyer)
    dest_lat = o['pickup_lat'] if tracking_phase == 'TO_FARMER' else o['delivery_lat']
    dest_lng = o['pickup_lng'] if tracking_phase == 'TO_FARMER' else o['delivery_lng']
    dest_label = "Farmer Farmgate Pickup" if tracking_phase == 'TO_FARMER' else "Buyer Destination"

    return {
        "success": True,
        "order_id": order_id,
        "order_status": status,
        "tracking_phase": tracking_phase,
        "live_tracking_allowed": True,
        "driver_id": o['driver_id'],
        "driver_name": o['driver_name'],
        "agency_id": o['agency_id'],
        "agency_name": o['agency_name'],
        "driver_lat": o.get('driver_lat') or (11.7500 if tracking_phase == 'TO_FARMER' else 12.6500),
        "driver_lng": o.get('driver_lng') or (78.1000 if tracking_phase == 'TO_FARMER' else 79.6000),
        "destination_lat": dest_lat,
        "destination_lng": dest_lng,
        "destination_label": dest_label,
        "pickup_lat": o['pickup_lat'],
        "pickup_lng": o['pickup_lng'],
        "delivery_lat": o['delivery_lat'],
        "delivery_lng": o['delivery_lng'],
        "delivery_otp": o['delivery_otp'],
        "last_gps_update": o.get('last_gps_update'),
        "message": f"Active route live tracking: {tracking_phase.replace('_', ' ')}"
    }

@router.post("/simulate-step")
def simulate_order_delivery_step(payload: dict):
    """
    PHASE 65: DEMO TRACKING FOR HACKATHON
    Simulates driver progression from Acceptance -> Farm Pickup -> Highway -> Handover -> OTP Delivery.
    Clearly labeled 'Demo / Simulated GPS'.
    """
    order_id = payload.get("order_id", "VIV-ORD-88120")
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    o = dict(order)
    current_status = o['order_status']
    current_progress = float(o.get('simulation_progress') or 0.0)

    # Route Simulation Waypoints from Salem Farm to Chennai
    # 0.0: Salem Hub, 0.2: Farm Pickup, 0.4: Dharmapuri, 0.6: Krishnagiri, 0.8: Vellore, 1.0: Chennai Adyar
    sim_waypoints = [
        (11.6643, 78.1460, "Salem Farmgate Pickup"),
        (12.1211, 78.1582, "NH-44 Dharmapuri Corridor"),
        (12.5186, 78.2137, "Krishnagiri Junction"),
        (12.9165, 79.1325, "Vellore Toll Plaza"),
        (12.8342, 79.7036, "Kanchipuram Outer Ring"),
        (13.0012, 80.2565, "Buyer Doorstep (Adyar, Chennai)")
    ]

    action = payload.get("action", "ADVANCE").upper()

    if action == "ACCEPT" or current_status in ('ORDER_PLACED', 'ASSIGNED'):
        # Step 1: Driver Accepts -> Route to Farmer
        new_status = "ACCEPTED"
        new_phase = "TO_FARMER"
        new_progress = 0.2
        coords = sim_waypoints[0]
        cursor.execute("""
        UPDATE orders
        SET order_status = ?, tracking_phase = ?, simulation_progress = ?,
            driver_lat = ?, driver_lng = ?, last_gps_update = ?, tracking_active = 1
        WHERE id = ?
        """, (new_status, new_phase, new_progress, coords[0], coords[1], now, order_id))
        msg = "Demo GPS: Driver accepted order. Live route to farmer active (VIVAAN & Agency only)."

    elif action == "COLLECT" or (current_status == "ACCEPTED" and current_progress <= 0.25):
        # Step 2: Driver Collects -> Route to Buyer
        new_status = "PICKED_UP"
        new_phase = "TO_BUYER"
        new_progress = 0.4
        coords = sim_waypoints[1]
        cursor.execute("""
        UPDATE orders
        SET order_status = ?, tracking_phase = ?, simulation_progress = ?,
            driver_lat = ?, driver_lng = ?, last_gps_update = ?, tracking_active = 1,
            collected_at = ?
        WHERE id = ?
        """, (new_status, new_phase, new_progress, coords[0], coords[1], now, now, order_id))
        msg = "Demo GPS: Produce collected at farmgate! Buyer live tracking now ACTIVE."

    elif action == "ADVANCE" and current_progress < 0.9:
        # Step 3: Advance along highway corridor towards buyer
        new_status = "PICKED_UP"
        new_phase = "TO_BUYER"
        idx = min(len(sim_waypoints) - 1, int(current_progress * len(sim_waypoints)) + 1)
        coords = sim_waypoints[idx]
        new_progress = min(0.95, current_progress + 0.25)
        cursor.execute("""
        UPDATE orders
        SET order_status = ?, tracking_phase = ?, simulation_progress = ?,
            driver_lat = ?, driver_lng = ?, last_gps_update = ?, tracking_active = 1
        WHERE id = ?
        """, (new_status, new_phase, new_progress, coords[0], coords[1], now, order_id))
        msg = f"Demo GPS: Driver simulated movement to {coords[2]} (Progress: {int(new_progress * 100)}%)."

    else:
        # Step 4: Arrived & Verified with OTP -> DELIVERED & Live tracking STOPS
        new_status = "DELIVERED"
        new_phase = "ENDED"
        new_progress = 1.0
        coords = sim_waypoints[-1]
        cursor.execute("""
        UPDATE orders
        SET order_status = ?, tracking_phase = ?, simulation_progress = ?,
            driver_lat = ?, driver_lng = ?, last_gps_update = ?, tracking_active = 0,
            delivered_at = ?
        WHERE id = ?
        """, (new_status, new_phase, new_progress, coords[0], coords[1], now, now, order_id))

        cursor.execute("""
        UPDATE payments_escrow SET status = 'SETTLED', settled_at = ? WHERE order_id = ?
        """, (now, order_id))
        msg = f"Demo GPS: Arrived at buyer doorstep! Handover OTP {o['delivery_otp']} verified. LIVE TRACKING ENDED."

    conn.commit()
    conn.close()

    return {
        "success": True,
        "is_simulated": True,
        "label": "Demo / Simulated GPS",
        "order_id": order_id,
        "order_status": new_status,
        "tracking_phase": new_phase,
        "simulation_progress": new_progress,
        "current_coords": [coords[0], coords[1]],
        "message": msg
    }


@router.get("/buyer/{buyer_id}")
def get_buyer_orders(buyer_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, r.farmer_rating, r.agency_rating
    FROM orders o
    LEFT JOIN reviews r ON r.order_id = o.id
    WHERE o.buyer_id = ?
    ORDER BY o.created_at DESC
    """, (buyer_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "orders": [dict(r) for r in rows]}

@router.post("/reviews")
def submit_review(payload: ReviewSubmitRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT id FROM reviews WHERE order_id = ?", (payload.order_id,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {"success": True, "message": "Review already submitted for this order."}

    cursor.execute("""
    INSERT INTO reviews (
        order_id, buyer_name, farmer_id, farmer_rating, product_quality_rating,
        listing_accuracy_rating, farmer_review, agency_id, agency_rating,
        delivery_timeliness_rating, professionalism_rating, agency_review, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.order_id, payload.buyer_name, payload.farmer_id, payload.farmer_rating,
        payload.product_quality_rating, payload.listing_accuracy_rating, payload.farmer_review,
        payload.agency_id or 1, payload.agency_rating or 5, payload.delivery_timeliness_rating or 5,
        payload.professionalism_rating or 5, payload.agency_review or '', now
    ))

    conn.commit()
    conn.close()

    return {"success": True, "message": "Thank you! Your feedback helps verified farmers and delivery partners maintain high standards."}


# ============================================================================
# PHASE 42-45: MULTI-FARMER CHECKOUT ("One Buyer. Multiple Farmers. One VIVAAN Cart.")
# ============================================================================
@router.post("/checkout-multi")
def checkout_multi_farmer_cart(payload: MultiFarmerCheckoutRequest):
    """
    Creates one unified buyer checkout (VIV-CHECKOUT-XXXX) and separates
    individual child orders (VIV-ORD-XXXX) per farmer item, ensuring stock deduction,
    transparent pricing, and shared delivery logistics.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    checkout_id = f"VIV-CHECKOUT-{random.randint(1000, 9999)}"
    created_orders = []
    total_products_amount = 0.0

    # Total items and shared delivery fee calculation (Phases 58 & 59)
    # Fixed shared delivery charge across multiple farmers: ₹80 base + ₹20 per additional farm
    num_items = len(payload.items)
    shared_delivery_fee = 80.0 if num_items == 1 else round(80.0 + (num_items - 1) * 20.0, 2)
    delivery_per_order = round(shared_delivery_fee / num_items, 2)

    # Find verified agency & driver for logistics consolidation (Phases 47-52)
    cursor.execute("SELECT * FROM agencies WHERE status = 'VERIFIED' ORDER BY id ASC LIMIT 1")
    agency = cursor.fetchone()
    agency_id = agency['id'] if agency else 1
    agency_name = agency['brand_name'] if agency else "GreenCorridor Logistics"

    cursor.execute("SELECT * FROM drivers WHERE agency_id = ? AND status = 'ACTIVE' LIMIT 1", (agency_id,))
    driver = cursor.fetchone()
    driver_id = driver['driver_id'] if driver else "VIV-DR-104582"
    driver_name = driver['full_name'] if driver else "Murugan K"

    for idx, item in enumerate(payload.items):
        cursor.execute("""
        SELECT p.*, f.full_name as farmer_name, f.user_id as farmer_user_id,
               l.state as f_state, l.district as f_district, l.village as f_village
        FROM products p
        JOIN farmers f ON f.id = p.farmer_id
        JOIN land_records l ON l.farmer_id = f.id
        WHERE p.id = ? AND p.is_active = 1
        """, (item.product_id,))
        product = cursor.fetchone()

        if not product:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found or inactive.")

        if product['available_quantity'] < item.quantity:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product['title']}. Available: {product['available_quantity']} {product['unit']}"
            )

        # 1. Deduct Inventory automatically (Phase 14 & 46)
        new_stock = product['available_quantity'] - item.quantity
        cursor.execute("UPDATE products SET available_quantity = ? WHERE id = ?", (new_stock, item.product_id))

        # 2. Price calculation
        item_subtotal = round(product['price_per_unit'] * item.quantity, 2)
        total_products_amount += item_subtotal
        order_total = round(item_subtotal + delivery_per_order, 2)

        order_id = f"VIV-ORD-{random.randint(10000, 99999)}"
        tracking_id = f"VIV-TRK-{order_id.split('-')[-1]}"
        delivery_otp = str(random.randint(1000, 9999))

        pickup_lat, pickup_lng = 11.6643 + (idx * 0.05), 78.1460 + (idx * 0.04)
        delivery_lat, delivery_lng = 13.0827, 80.2707

        cursor.execute("""
        INSERT INTO orders (
            id, buyer_id, buyer_name, buyer_phone, farmer_id, farmer_name,
            product_id, product_name, quantity, unit, unit_price, total_amount,
            delivery_fee, delivery_address, delivery_state, delivery_district,
            delivery_pincode, delivery_type, preferred_date, preferred_time,
            driver_notes, payment_method, payment_status, order_status,
            agency_id, agency_name, driver_id, driver_name, delivery_otp,
            pickup_lat, pickup_lng, delivery_lat, delivery_lng, created_at,
            checkout_id, tracking_active, tracking_phase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'ORDER_PLACED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'TO_FARMER')
        """, (
            order_id, payload.buyer_id, payload.buyer_name, payload.buyer_phone,
            product['farmer_id'], product['farmer_name'], product['id'], product['title'],
            item.quantity, product['unit'], product['price_per_unit'], order_total,
            delivery_per_order, payload.delivery_address, payload.delivery_state,
            payload.delivery_district, payload.delivery_pincode, payload.delivery_type,
            payload.preferred_date or now[:10], payload.preferred_time or 'Morning',
            payload.driver_notes or '', payload.payment_method, agency_id, agency_name,
            driver_id, driver_name, delivery_otp, pickup_lat, pickup_lng,
            delivery_lat, delivery_lng, now, checkout_id
        ))

        # Escrow Allocation
        farmer_share = round(item_subtotal * 0.95, 2)
        platform_fee = round(item_subtotal * 0.05, 2)
        cursor.execute("""
        INSERT INTO payments_escrow (
            order_id, total_amount, farmer_amount, agency_fee, platform_fee,
            status, transaction_ref, paid_at
        ) VALUES (?, ?, ?, ?, ?, 'HELD_IN_ESCROW', ?, ?)
        """, (
            order_id, order_total, farmer_share, delivery_per_order, platform_fee,
            f"TXN-RAZOR-{random.randint(1000000, 9999999)}", now
        ))

        created_orders.append({
            "order_id": order_id,
            "tracking_id": tracking_id,
            "product_title": product['title'],
            "farmer_name": product['farmer_name'],
            "quantity": item.quantity,
            "unit": product['unit'],
            "item_subtotal": item_subtotal,
            "delivery_share": delivery_per_order,
            "order_total": order_total,
            "delivery_otp": delivery_otp
        })

    # Optional: Group into batch VIV-BATCH-XXXX for logistics consolidation
    batch_id = f"VIV-BATCH-{random.randint(1000, 9999)}"
    cursor.execute("""
    INSERT INTO delivery_batches (
        id, driver_id, driver_name, agency_id, agency_name,
        vehicle_type, max_weight_kg, current_load_kg, status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'Mini Van', 800.0, 180.0, 'BATCH_CREATED', ?)
    """, (batch_id, driver_id, driver_name, agency_id, agency_name, now))

    for ord_obj in created_orders:
        cursor.execute("UPDATE orders SET batch_id = ? WHERE id = ?", (batch_id, ord_obj['order_id']))

    conn.commit()
    conn.close()

    grand_total = round(total_products_amount + shared_delivery_fee, 2)

    return {
        "success": True,
        "checkout_id": checkout_id,
        "batch_id": batch_id,
        "products_subtotal": total_products_amount,
        "shared_delivery_charge": shared_delivery_fee,
        "grand_total": grand_total,
        "payment_method": payload.payment_method,
        "payment_provider": "Razorpay (Verified Escrow)",
        "orders_count": len(created_orders),
        "orders": created_orders,
        "message": f"Successfully placed {len(created_orders)} farmer orders under Checkout {checkout_id}!"
    }


# ============================================================================
# PHASE 52, 67, 68, 87: ACTIVE TRACKING & BATCH LIFECYCLE
# ============================================================================
@router.get("/active-tracking/list")
def get_active_tracking_orders():
    """
    Returns all currently active orders and batches for the Left-Side list
    in the Two-Column Active Tracking layout (Phases 67, 68, 87).
    Completed/DELIVERED orders are strictly filtered out (Phase 80).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, checkout_id, batch_id, buyer_name, farmer_name, product_name,
           quantity, unit, order_status, tracking_phase, driver_id, driver_name,
           agency_name, driver_lat, driver_lng, delivery_address, created_at
    FROM orders
    WHERE order_status != 'DELIVERED' AND tracking_active = 1
    ORDER BY created_at DESC
    """)
    active_orders = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT * FROM delivery_batches WHERE status != 'COMPLETED' ORDER BY created_at DESC
    """)
    active_batches = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "success": True,
        "active_orders_count": len(active_orders),
        "active_batches_count": len(active_batches),
        "active_orders": active_orders,
        "active_batches": active_batches
    }


# ============================================================================
# PHASE 62: SETTLEMENT WORKFLOW (5-10 MIN POST-DELIVERY TARGET)
# ============================================================================
@router.get("/{order_id}/settlement-status")
def get_order_settlement_status(order_id: str):
    """
    Reports the post-delivery settlement workflow (Phases 62 & 81).
    Target initiation window: ~5-10 minutes after OTP delivery.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.id, o.order_status, o.total_amount, o.delivered_at,
           p.farmer_amount, p.agency_fee, p.platform_fee, p.status as escrow_status,
           p.settled_at, p.transaction_ref
    FROM orders o
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    WHERE o.id = ?
    """, (order_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    data = dict(row)
    is_delivered = (data['order_status'] == 'DELIVERED')

    driver_earning = round(data.get('agency_fee', 0) * 0.70, 2)
    agency_earning = round(data.get('agency_fee', 0) * 0.30, 2)

    return {
        "success": True,
        "order_id": order_id,
        "order_status": data['order_status'],
        "escrow_status": data.get('escrow_status', 'HELD_IN_ESCROW'),
        "target_initiation_window": "5–10 minutes post-delivery",
        "settlement_initiated": is_delivered,
        "splits": {
            "farmer_amount": data.get('farmer_amount', 0),
            "driver_earning": driver_earning,
            "agency_earning": agency_earning,
            "platform_fee": data.get('platform_fee', 0),
            "total_payout": data.get('total_amount', 0)
        },
        "transaction_ref": data.get('transaction_ref'),
        "settled_at": data.get('settled_at')
    }
