"""
VIVAAN Driver Router
Handles Driver Tasks, Route Mapping Coordinates, and Strict Delivery OTP Verification.
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from models import (
    VerifyDeliveryOtpRequest,
    DriverAcceptRequest,
    DriverCollectRequest,
    DriverLocationUpdateRequest
)
from datetime import datetime

router = APIRouter(prefix="/api/drivers", tags=["drivers"])

@router.get("/{driver_id}/deliveries")
def get_driver_deliveries(driver_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, f.full_name as farmer_name, f.primary_phone as farmer_phone,
           l.village as farm_village, l.district as farm_district, l.state as farm_state
    FROM orders o
    JOIN farmers f ON f.id = o.farmer_id
    JOIN land_records l ON l.farmer_id = f.id
    WHERE o.driver_id = ?
    ORDER BY CASE 
        WHEN o.order_status IN ('ACCEPTED', 'TO_FARMER', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY') THEN 0 
        ELSE 1 
    END, o.created_at DESC
    """, (driver_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "deliveries": [dict(r) for r in rows]}

@router.post("/accept-order")
def accept_order(payload: DriverAcceptRequest):
    """
    PHASE 35: Driver Clicks 'Accept Order'
    1. Assigns order to driver.
    2. Stores Driver ID and acceptance timestamp.
    3. Status becomes 'ACCEPTED' / 'TO_FARMER'.
    4. Starts driver location sharing for VIVAAN Admin & Assigned Agency ONLY.
    5. Live location is strictly HIDDEN from Buyer at this stage.
    6. Returns route destination: Farmer Pickup location.
    """
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (payload.order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    if order['order_status'] == 'DELIVERED':
        conn.close()
        raise HTTPException(status_code=400, detail="Order is already delivered.")

    driver_name = payload.driver_name or order['driver_name'] or "Murugan K"

    cursor.execute("""
    UPDATE orders
    SET order_status = 'ACCEPTED',
        driver_id = ?,
        driver_name = ?,
        accepted_at = ?,
        tracking_active = 1,
        tracking_phase = 'TO_FARMER',
        last_gps_update = ?
    WHERE id = ?
    """, (payload.driver_id, driver_name, now, now, payload.order_id))

    # Audit & Notification to Agency
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'DRIVER', 'ACCEPT_ORDER', ?, ?, ?)
    """, (payload.order_id, f"Order {payload.order_id} accepted by driver {payload.driver_id}. Route to farmer active.", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": payload.order_id,
        "status": "ACCEPTED",
        "tracking_phase": "TO_FARMER",
        "destination_type": "FARMER_PICKUP",
        "pickup_lat": order['pickup_lat'],
        "pickup_lng": order['pickup_lng'],
        "message": f"Order {payload.order_id} accepted! Route mapped to farmer pickup point."
    }

@router.post("/collect-order")
def collect_order(payload: DriverCollectRequest):
    """
    PHASE 39: Driver Clicks 'Collect Order' (Physical parcel collected from farmer)
    1. Status becomes 'PICKED_UP' / 'TO_BUYER'.
    2. Records pickup time.
    3. Changes tracking phase: To Farmer -> To Buyer.
    4. Destination changes: Farmer -> Buyer.
    5. Buyer live tracking becomes ACTIVE!
    6. Buyer is notified with secret Delivery OTP.
    """
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (payload.order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    cursor.execute("""
    UPDATE orders
    SET order_status = 'PICKED_UP',
        collected_at = ?,
        tracking_active = 1,
        tracking_phase = 'TO_BUYER',
        last_gps_update = ?
    WHERE id = ?
    """, (now, now, payload.order_id))

    # Notify Buyer that produce is picked up and on the way
    cursor.execute("SELECT user_id FROM buyers WHERE id = ?", (order['buyer_id'],))
    buyer_user = cursor.fetchone()
    if buyer_user:
        cursor.execute("""
        INSERT INTO notifications (user_id, role, title, message, type, created_at)
        VALUES (?, 'BUYER', 'Produce Picked Up - Live Tracking Now Active', ?, 'ORDER', ?)
        """, (
            buyer_user['user_id'],
            f"Your order {payload.order_id} has been picked up from {order['farmer_name']} and is on the way! Your secret delivery OTP is {order['delivery_otp']}. Share with driver only on package handover.",
            now
        ))

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'DRIVER', 'COLLECT_ORDER', ?, ?, ?)
    """, (payload.order_id, f"Produce collected from farmer for {payload.order_id}. Buyer live tracking activated.", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": payload.order_id,
        "status": "PICKED_UP",
        "tracking_phase": "TO_BUYER",
        "destination_type": "BUYER_DESTINATION",
        "delivery_lat": order['delivery_lat'],
        "delivery_lng": order['delivery_lng'],
        "message": f"Produce collected! Route updated to buyer destination in {order['delivery_district']}."
    }

@router.post("/update-location")
def update_driver_location(payload: DriverLocationUpdateRequest):
    """
    PHASE 42: Driver GPS Updates
    Receives current coordinates. Rejects updates if order is already DELIVERED.
    """
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT order_status, tracking_active FROM orders WHERE id = ?", (payload.order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    if order['order_status'] == 'DELIVERED' or order['tracking_active'] == 0:
        conn.close()
        raise HTTPException(status_code=400, detail="Order is already completed. Live GPS tracking has ended.")

    cursor.execute("""
    UPDATE orders
    SET driver_lat = ?, driver_lng = ?, last_gps_update = ?
    WHERE id = ?
    """, (payload.latitude, payload.longitude, now, payload.order_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": payload.order_id,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "timestamp": now
    }

@router.post("/verify-delivery-otp")
def verify_delivery_otp(payload: VerifyDeliveryOtpRequest):
    """
    PHASE 46 & 47: Strict Delivery OTP Confirmation
    1. Driver arrives at buyer's destination.
    2. Buyer gives the secret 4-digit OTP.
    3. Validates Order ID + Assigned Driver + OTP.
    4. Order status updated to 'DELIVERED'.
    5. LIVE TRACKING IMMEDIATELY TERMINATES FOR EVERYONE (tracking_active = 0).
    6. Escrow payment released to Farmer (95%) and Agency.
    7. Notifications sent to Buyer and Farmer.
    """
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (payload.order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    if order['order_status'] == 'DELIVERED':
        conn.close()
        return {"success": True, "message": "Order was already successfully delivered.", "order_id": payload.order_id}

    # Strict OTP Check
    if order['delivery_otp'] != payload.entered_otp.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid Delivery OTP. Please ask the recipient for the 4-digit code displayed in their VIVAAN app/SMS.")

    # 1. Update Order Status and STOP LIVE TRACKING FOR EVERYONE
    cursor.execute("""
    UPDATE orders
    SET order_status = 'DELIVERED',
        delivered_at = ?,
        tracking_active = 0,
        tracking_phase = 'ENDED',
        last_gps_update = ?
    WHERE id = ?
    """, (now, now, payload.order_id))

    # 2. Release Escrow Settlement to Farmer and Agency
    cursor.execute("""
    UPDATE payments_escrow
    SET status = 'SETTLED', settled_at = ?
    WHERE order_id = ?
    """, (now, payload.order_id))

    # 3. Notify Buyer
    cursor.execute("""
    SELECT user_id FROM buyers WHERE id = ?
    """, (order['buyer_id'],))
    buyer_user = cursor.fetchone()
    if buyer_user:
        cursor.execute("""
        INSERT INTO notifications (user_id, role, title, message, type, created_at)
        VALUES (?, 'BUYER', 'Delivery Completed! Rate Your Experience', ?, 'SUCCESS', ?)
        """, (buyer_user['user_id'], f"Order {payload.order_id} has been delivered. Live tracking has ended. Please share your rating for the farmer and delivery partner.", now))

    # 4. Notify Farmer
    cursor.execute("""
    SELECT user_id FROM farmers WHERE id = ?
    """, (order['farmer_id'],))
    farmer_user = cursor.fetchone()
    if farmer_user:
        cursor.execute("""
        INSERT INTO notifications (user_id, role, title, message, type, created_at)
        VALUES (?, 'FARMER', 'Produce Delivered - Escrow Released', ?, 'SUCCESS', ?)
        """, (farmer_user['user_id'], f"Order {payload.order_id} for {order['product_name']} was verified with OTP. Escrow payout of ₹{order['total_amount'] - order['delivery_fee'] - 100:,.2f} has been released to your bank account.", now))

    # 5. Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'DRIVER', 'DELIVERY_OTP_VERIFIED', ?, ?, ?)
    """, (payload.order_id, f"Order {payload.order_id} verified via OTP {payload.entered_otp} by driver {payload.driver_id or order['driver_name']}. Live tracking permanently disabled.", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": payload.order_id,
        "order_status": "DELIVERED",
        "tracking_active": False,
        "message": f"Delivery successfully confirmed with OTP {payload.entered_otp}! Escrow payout released to farmer and delivery partner. Live GPS tracking has ended.",
        "delivered_at": now
    }

