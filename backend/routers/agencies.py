"""
VIVAAN Delivery Agency Router
Handles 5-Part Agency Registration, Serviceability Matrix, 3-Tier ID Cards (Green/Orange/Blue),
Fleet and Driver Management, and Order Assignments.
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from models import AgencyRegisterRequest, DriverApplicationRequest
from datetime import datetime
import json
import random

router = APIRouter(prefix="/api/agencies", tags=["agencies"])

@router.post("/register")
def register_agency(payload: AgencyRegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # Generate unique VIVAAN Agency ID: VIV-AG-XXXXXX
    random_num = random.randint(100000, 999999)
    vivaan_id = f"VIV-AG-{random_num}"

    # Determine tier based on service type & coverage
    stype = payload.service_type.upper()
    if stype == "LOCAL":
        tier = "LOCAL_GREEN"
    elif stype == "DISTRICT":
        tier = "DISTRICT_ORANGE"
    else:
        tier = "STATE_BLUE"

    # 1. Create User
    cursor.execute("""
    INSERT INTO users (role, name, email, phone, password_hash, auth_provider, avatar_url, created_at)
    VALUES ('AGENCY', ?, ?, ?, ?, 'LOCAL', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150', ?)
    """, (payload.brand_name, payload.email, payload.phone, payload.password or "agency123", now))
    user_id = cursor.lastrowid

    # 2. Create Agency
    cursor.execute("""
    INSERT INTO agencies (
        user_id, service_type, tier, legal_name, brand_name, corp_office,
        tax_id, contact_name, phone, email, status, vivaan_id,
        rural_transit_time, max_weight_kg, max_volume_cbm, operating_hours, supported_types, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, payload.service_type, tier, payload.legal_name, payload.brand_name,
        payload.corp_office, payload.tax_id, payload.contact_name, payload.phone,
        payload.email, vivaan_id, payload.rural_transit_time or '12 - 24 Hours',
        payload.max_weight_kg or 5000.0, payload.max_volume_cbm or 20.0,
        payload.operating_hours or '06:00 AM - 10:00 PM',
        payload.supported_types or 'Agricultural Commodities & Farmgate Pickup', now
    ))
    agency_id = cursor.lastrowid

    # 3. Create Coverage Matrix
    cursor.execute("""
    INSERT INTO agency_coverage (
        agency_id, coverage_zones, serviceable_districts, serviceable_states,
        no_go_zones, unserviceable_locations
    ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        agency_id,
        json.dumps(payload.coverage_zones or ["Primary Operational Zone"]),
        json.dumps(payload.serviceable_districts or ["Statewide Mandi Network"]),
        json.dumps(payload.serviceable_states or ["Tamil Nadu"]),
        payload.no_go_zones or "None",
        payload.unserviceable_locations or "None"
    ))

    # 4. Create Fleet entries
    fleet_list = payload.fleet or [
        {"vehicle_type": "Pickup", "count": 6, "target_districts": "Regional corridors", "ownership": "Agency-owned"},
        {"vehicle_type": "Truck", "count": 4, "target_districts": "Inter-state mandi transport", "ownership": "Self-owned"}
    ]
    for item in fleet_list:
        cursor.execute("""
        INSERT INTO agency_fleet (agency_id, vehicle_type, count, target_districts, ownership)
        VALUES (?, ?, ?, ?, ?)
        """, (agency_id, item.get('vehicle_type', 'Pickup'), item.get('count', 5), item.get('target_districts', 'All'), item.get('ownership', 'Agency')))

    # 5. Audit & Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, role, title, message, type, created_at)
    VALUES (?, 'AGENCY', 'Agency Verified & Tier ID Issued', ?, 'SUCCESS', ?)
    """, (user_id, f"Congratulations! {payload.brand_name} is verified. Your VIVAAN Agency ID is {vivaan_id} with {tier} badge.", now))

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (?, 'SYSTEM', 'AGENCY_REGISTERED', ?, ?, ?)
    """, (user_id, vivaan_id, f"Agency {payload.brand_name} registered for {payload.service_type} with tier {tier}", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "vivaan_id": vivaan_id,
        "agency_id": agency_id,
        "tier": tier,
        "message": f"Agency verified! {tier.replace('_', ' ')} ID card generated."
    }

@router.get("/{agency_id}/id-card")
def get_agency_id_card(agency_id: int):
    """
    Returns 3-Tier Delivery Agency ID Card:
    - LOCAL_GREEN: VIVAAN LOCAL LEVEL DELIVERY AGENCY
    - DISTRICT_ORANGE: VIVAAN DISTRICT LEVEL DELIVERY AGENCY
    - STATE_BLUE: VIVAAN STATE LEVEL DELIVERY AGENCY
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT a.*, c.coverage_zones, c.serviceable_districts, c.serviceable_states
    FROM agencies a
    LEFT JOIN agency_coverage c ON c.agency_id = a.id
    WHERE a.id = ?
    """, (agency_id,))
    agency = cursor.fetchone()
    conn.close()

    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    tier = agency['tier']
    if tier == "LOCAL_GREEN":
        tier_title = "VIVAAN LOCAL LEVEL DELIVERY AGENCY"
        theme_color = "emerald"
    elif tier == "DISTRICT_ORANGE":
        tier_title = "VIVAAN DISTRICT LEVEL DELIVERY AGENCY"
        theme_color = "amber"
    else:
        tier_title = "VIVAAN STATE LEVEL DELIVERY AGENCY"
        theme_color = "blue"

    qr_url = f"https://vivaan.agri/agency-verify?id={agency['vivaan_id']}&level={agency['service_type']}"

    return {
        "success": True,
        "id_card": {
            "vivaan_id": agency['vivaan_id'],
            "legal_name": agency['legal_name'],
            "brand_name": agency['brand_name'],
            "service_type": agency['service_type'],
            "tier": tier,
            "tier_title": tier_title,
            "theme_color": theme_color,
            "status": agency['status'],
            "corp_office": agency['corp_office'],
            "tax_id": agency['tax_id'],
            "qr_data": qr_url,
            "issued_date": agency['created_at'][:10]
        }
    }

@router.get("/{agency_id}/drivers")
def get_agency_drivers(agency_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM drivers WHERE agency_id = ? ORDER BY created_at DESC", (agency_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "drivers": [dict(r) for r in rows]}

@router.post("/drivers/apply")
def apply_driver(payload: DriverApplicationRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    driver_id = f"VIV-DR-{random.randint(100000, 999999)}"

    # Mask Aadhaar
    masked_aadhaar = f"XXXX-XXXX-{payload.aadhaar_no[-4:] if payload.aadhaar_no and len(payload.aadhaar_no) >= 4 else '1092'}"

    cursor.execute("""
    INSERT INTO drivers (
        agency_id, driver_id, full_name, phone, alt_phone, dob, address,
        aadhaar_no, license_no, license_class, license_expiry, experience_years,
        criminal_record, home_state, home_district, familiar_taluk, languages,
        vehicle_owner, vehicle_type, vehicle_no, max_weight_kg, smartphone_user,
        cod_handling, heavy_lifting, shift, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    """, (
        payload.agency_id, driver_id, payload.full_name, payload.phone, payload.alt_phone,
        payload.dob, payload.address, masked_aadhaar, payload.license_no,
        payload.license_class, payload.license_expiry, payload.experience_years,
        payload.criminal_record or 'None', payload.home_state, payload.home_district,
        payload.familiar_taluk or payload.home_district, payload.languages or 'Regional, English',
        payload.vehicle_owner or 'Self', payload.vehicle_type, payload.vehicle_no or 'TN-30-AP-9900',
        payload.max_weight_kg or 1000.0, 1 if payload.smartphone_user else 0,
        1 if payload.cod_handling else 0, 1 if payload.heavy_lifting else 0,
        payload.shift or 'Flexible', now
    ))
    row_id = cursor.lastrowid

    # Create audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (?, 'AGENCY', 'DRIVER_ENROLLED', ?, ?, ?)
    """, (payload.agency_id, driver_id, f"Driver {payload.full_name} enrolled with license {payload.license_no} ({payload.license_class})", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "driver_id": driver_id,
        "message": f"Driver application approved! Driver ID {driver_id} activated."
    }

@router.put("/drivers/{driver_id}/status")
def update_driver_status(driver_id: str, payload: dict):
    new_status = payload.get("status", "ACTIVE")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE drivers SET status = ? WHERE driver_id = ?", (new_status, driver_id))
    conn.commit()
    conn.close()
    return {"success": True, "status": new_status}

@router.get("/{agency_id}/orders")
def get_agency_orders(agency_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, p.agency_fee, p.status as escrow_status
    FROM orders o
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    WHERE o.agency_id = ?
    ORDER BY o.created_at DESC
    """, (agency_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "orders": [dict(r) for r in rows]}

@router.get("/{agency_id}/active-deliveries")
def get_agency_active_deliveries(agency_id: int):
    """
    PHASE 56: Agency Active Tracking
    Only returns orders assigned strictly to this agency where tracking is active.
    Orders are automatically removed once delivered.
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
    WHERE o.agency_id = ? AND o.tracking_active = 1 AND o.order_status != 'DELIVERED'
    ORDER BY o.created_at DESC
    """, (agency_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "active_deliveries": [dict(r) for r in rows]}

