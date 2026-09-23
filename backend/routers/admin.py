"""
VIVAAN Admin Panel Router
Comprehensive administration cockpit for Farmer verifications, Agency tiers,
Driver oversight, Marketplace moderation, Escrow settlements, and Audit logs.
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM farmers WHERE status = 'VERIFIED'")
    verified_farmers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM agencies WHERE status = 'VERIFIED'")
    verified_agencies = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM drivers WHERE status = 'ACTIVE'")
    active_drivers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1")
    active_listings = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM orders")
    order_row = cursor.fetchone()
    total_orders = order_row[0]
    total_trade_volume = order_row[1]

    cursor.execute("SELECT COALESCE(SUM(farmer_amount), 0) FROM payments_escrow WHERE status = 'SETTLED'")
    settled_to_farmers = cursor.fetchone()[0]

    conn.close()
    return {
        "success": True,
        "stats": {
            "verified_farmers": verified_farmers,
            "verified_agencies": verified_agencies,
            "active_drivers": active_drivers,
            "active_listings": active_listings,
            "total_orders": total_orders,
            "total_trade_volume": total_trade_volume,
            "settled_to_farmers": settled_to_farmers
        }
    }

@router.get("/farmers")
def get_all_farmers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT f.*, l.state, l.district, l.taluk, l.village, l.survey_no, l.patta_no, l.land_extent, l.land_classification,
           le.landowner_name, le.landowner_phone, le.consent_otp, le.consent_verified
    FROM farmers f
    LEFT JOIN land_records l ON l.farmer_id = f.id
    LEFT JOIN lease_records le ON le.farmer_id = f.id
    ORDER BY f.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "farmers": [dict(r) for r in rows]}

@router.put("/farmers/{farmer_id}/status")
def update_farmer_status(farmer_id: int, payload: dict):
    new_status = payload.get("status", "VERIFIED")
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("UPDATE farmers SET status = ? WHERE id = ?", (new_status, farmer_id))

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'ADMIN', 'UPDATE_FARMER_STATUS', ?, ?, ?)
    """, (f"Farmer ID {farmer_id}", f"Status updated to {new_status}", now))

    conn.commit()
    conn.close()
    return {"success": True, "status": new_status, "message": f"Farmer status updated to {new_status}"}

@router.get("/agencies")
def get_all_agencies():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT a.*, c.coverage_zones, c.serviceable_districts, c.serviceable_states,
           (SELECT COUNT(*) FROM drivers WHERE agency_id = a.id) as driver_count
    FROM agencies a
    LEFT JOIN agency_coverage c ON c.agency_id = a.id
    ORDER BY a.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "agencies": [dict(r) for r in rows]}

@router.put("/agencies/{agency_id}/classify")
def classify_agency(agency_id: int, payload: dict):
    tier = payload.get("tier", "LOCAL_GREEN")
    status = payload.get("status", "VERIFIED")
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("UPDATE agencies SET tier = ?, status = ? WHERE id = ?", (tier, status, agency_id))

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'ADMIN', 'CLASSIFY_AGENCY_TIER', ?, ?, ?)
    """, (f"Agency ID {agency_id}", f"Assigned tier {tier} with status {status}", now))

    conn.commit()
    conn.close()
    return {"success": True, "tier": tier, "status": status}

@router.get("/orders")
def get_all_orders():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, p.status as escrow_status, p.farmer_amount, p.agency_fee, p.transaction_ref
    FROM orders o
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    ORDER BY o.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "orders": [dict(r) for r in rows]}

@router.post("/orders/{order_id}/release-escrow")
def manual_release_escrow(order_id: str):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("UPDATE payments_escrow SET status = 'SETTLED', settled_at = ? WHERE order_id = ?", (now, order_id))
    cursor.execute("UPDATE orders SET order_status = 'DELIVERED', delivered_at = ? WHERE id = ?", (now, order_id))

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'ADMIN', 'MANUAL_RELEASE_ESCROW', ?, ?, ?)
    """, (order_id, f"Admin manual release of escrow payout for order {order_id}", now))

    conn.commit()
    conn.close()
    return {"success": True, "message": f"Escrow payout released to farmer and agency for order {order_id}"}

@router.get("/active-deliveries")
def get_admin_active_deliveries():
    """
    PHASE 55: Admin Active Tracking List
    Returns currently active deliveries (ACCEPTED, TO_FARMER, PICKED_UP, TO_BUYER).
    Automatically omits DELIVERED orders.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.id as order_id, o.order_status, o.tracking_phase, o.tracking_active,
           o.driver_id, o.driver_name, o.agency_id, o.agency_name,
           o.farmer_name, o.buyer_name, o.product_name, o.quantity, o.unit,
           o.delivery_address, o.delivery_district,
           o.driver_lat, o.driver_lng, o.pickup_lat, o.pickup_lng,
           o.delivery_lat, o.delivery_lng, o.last_gps_update, o.delivery_otp
    FROM orders o
    WHERE o.tracking_active = 1 AND o.order_status != 'DELIVERED'
    ORDER BY o.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "active_deliveries": [dict(r) for r in rows]}

@router.put("/farmers/{farmer_id}/consent")
def update_landowner_consent(farmer_id: int, payload: dict):
    consent_status = payload.get("consent_status", "APPROVED")
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("UPDATE farmers SET consent_status = ?, consent_date = ? WHERE id = ?", (consent_status, now, farmer_id))
    cursor.execute("UPDATE lease_records SET consent_verified = ? WHERE farmer_id = ?", (1 if consent_status == 'APPROVED' else 0, farmer_id))

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'ADMIN', 'VERIFY_LANDOWNER_CONSENT', ?, ?, ?)
    """, (f"Farmer ID {farmer_id}", f"Landowner consent marked as {consent_status}", now))

    conn.commit()
    conn.close()
    return {"success": True, "consent_status": consent_status, "message": f"Landowner consent marked as {consent_status}"}

@router.put("/farmers/{farmer_id}/bank-status")
def update_farmer_bank_status(farmer_id: int, payload: dict):
    bank_status = payload.get("status", "VERIFIED") # PENDING, VERIFIED, FAILED, REVERIFICATION_REQUIRED
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (1, 'ADMIN', 'VERIFY_BANK_ACCOUNT', ?, ?, ?)
    """, (f"Farmer ID {farmer_id}", f"Bank verification status set to {bank_status}", now))

    conn.commit()
    conn.close()
    return {"success": True, "bank_status": bank_status}

@router.get("/audit-logs")
def get_audit_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "logs": [dict(r) for r in rows]}

