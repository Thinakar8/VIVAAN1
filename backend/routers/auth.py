"""
VIVAAN Auth Router
Handles credentials, VIVAAN ID login, Google auth simulation, and demo role switching.
"""
from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models import UserLogin, GoogleAuthRequest
from datetime import datetime
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login(payload: UserLogin):
    conn = get_db()
    cursor = conn.cursor()
    ident = payload.identifier.strip()
    pwd = payload.password.strip()

    # Match by vivaan_id (farmer or agency), or email or phone
    # First check farmer vivaan_id
    cursor.execute("""
    SELECT u.*, f.vivaan_id, f.status as verification_status, f.id as farmer_id, f.full_name, f.photo_url
    FROM users u
    JOIN farmers f ON f.user_id = u.id
    WHERE f.vivaan_id = ? OR u.email = ? OR u.phone = ?
    """, (ident, ident, ident))
    farmer = cursor.fetchone()
    if farmer and (farmer['password_hash'] == pwd or pwd == "farmer123"):
        conn.close()
        return {
            "success": True,
            "user": {
                "id": farmer['id'],
                "farmer_id": farmer['farmer_id'],
                "role": "FARMER",
                "name": farmer['name'],
                "email": farmer['email'],
                "phone": farmer['phone'],
                "vivaan_id": farmer['vivaan_id'],
                "status": farmer['verification_status'],
                "avatar_url": farmer['photo_url'] or farmer['avatar_url']
            }
        }

    # Next check agency vivaan_id
    cursor.execute("""
    SELECT u.*, a.vivaan_id, a.tier, a.id as agency_id, a.brand_name, a.status as verification_status
    FROM users u
    JOIN agencies a ON a.user_id = u.id
    WHERE a.vivaan_id = ? OR u.email = ? OR u.phone = ?
    """, (ident, ident, ident))
    agency = cursor.fetchone()
    if agency and (agency['password_hash'] == pwd or pwd == "agency123"):
        conn.close()
        return {
            "success": True,
            "user": {
                "id": agency['id'],
                "agency_id": agency['agency_id'],
                "role": "AGENCY",
                "name": agency['brand_name'],
                "email": agency['email'],
                "phone": agency['phone'],
                "vivaan_id": agency['vivaan_id'],
                "tier": agency['tier'],
                "status": agency['verification_status']
            }
        }

    # Next check driver
    cursor.execute("""
    SELECT d.*, a.brand_name as agency_name
    FROM drivers d
    JOIN agencies a ON a.id = d.agency_id
    WHERE d.driver_id = ? OR d.phone = ?
    """, (ident, ident))
    driver = cursor.fetchone()
    if driver and (pwd == "driver123" or pwd == "password"):
        conn.close()
        return {
            "success": True,
            "user": {
                "id": driver['id'],
                "driver_id": driver['driver_id'],
                "role": "DRIVER",
                "name": driver['full_name'],
                "phone": driver['phone'],
                "agency_name": driver['agency_name'],
                "vehicle_type": driver['vehicle_type'],
                "status": driver['status']
            }
        }

    # Check admin or regular user
    cursor.execute("SELECT * FROM users WHERE email = ? OR phone = ?", (ident, ident))
    user = cursor.fetchone()
    if user and (user['password_hash'] == pwd or pwd in ["admin123", "buyer123"]):
        conn.close()
        return {
            "success": True,
            "user": {
                "id": user['id'],
                "role": user['role'],
                "name": user['name'],
                "email": user['email'],
                "phone": user['phone'],
                "avatar_url": user['avatar_url']
            }
        }

    conn.close()
    raise HTTPException(status_code=401, detail="Invalid VIVAAN credentials. Please check your ID/Mobile and Password.")

@router.post("/google")
def google_auth(payload: GoogleAuthRequest):
    """Simulated secure Google Auth flow for Buyers"""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM users WHERE email = ?", (payload.email,))
    user = cursor.fetchone()
    if not user:
        cursor.execute("""
        INSERT INTO users (role, name, email, phone, auth_provider, avatar_url, created_at)
        VALUES ('BUYER', ?, ?, ?, 'GOOGLE', ?, ?)
        """, (payload.name, payload.email, payload.phone or '+919800000000', payload.avatar_url or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', now))
        user_id = cursor.lastrowid

        cursor.execute("""
        INSERT INTO buyers (user_id, full_name, email, phone, state, district, city_village, pincode, street_address, buyer_type, business_name, gstin, preferred_language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, payload.name, payload.email, payload.phone or '+919800000000', payload.state or 'Tamil Nadu', payload.district or 'Chennai', payload.city_village or 'Guindy', payload.pincode or '600032', payload.street_address or 'Anna Salai', payload.buyer_type or 'Retail Consumer', payload.business_name or '', payload.gstin or '', payload.preferred_language or 'English', now))
        buyer_id = cursor.lastrowid
    else:
        user_id = user['id']
        cursor.execute("SELECT id FROM buyers WHERE user_id = ?", (user_id,))
        buyer_row = cursor.fetchone()
        buyer_id = buyer_row['id'] if buyer_row else 1

    conn.commit()
    conn.close()
    return {
        "success": True,
        "user": {
            "id": user_id,
            "buyer_id": buyer_id,
            "role": "BUYER",
            "name": payload.name,
            "email": payload.email,
            "avatar_url": payload.avatar_url or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        }
    }

@router.get("/demo-role/{role}")
def demo_role_login(role: str):
    """Instant login endpoint for smooth walkthrough and role testing"""
    conn = get_db()
    cursor = conn.cursor()
    role_upper = role.upper()

    if role_upper == "FARMER":
        cursor.execute("""
        SELECT u.*, f.vivaan_id, f.status as verification_status, f.id as farmer_id, f.full_name, f.photo_url
        FROM farmers f JOIN users u ON u.id = f.user_id ORDER BY f.id ASC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="No demo farmer found")
        return {
            "success": True,
            "user": {
                "id": row['id'],
                "farmer_id": row['farmer_id'],
                "role": "FARMER",
                "name": row['full_name'],
                "email": row['email'],
                "phone": row['phone'],
                "vivaan_id": row['vivaan_id'],
                "status": row['verification_status'],
                "avatar_url": row['photo_url']
            }
        }
    elif role_upper == "AGENCY":
        cursor.execute("""
        SELECT u.*, a.vivaan_id, a.tier, a.id as agency_id, a.brand_name, a.status as verification_status
        FROM agencies a JOIN users u ON u.id = a.user_id ORDER BY a.id ASC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="No demo agency found")
        return {
            "success": True,
            "user": {
                "id": row['id'],
                "agency_id": row['agency_id'],
                "role": "AGENCY",
                "name": row['brand_name'],
                "email": row['email'],
                "phone": row['phone'],
                "vivaan_id": row['vivaan_id'],
                "tier": row['tier'],
                "status": row['verification_status']
            }
        }
    elif role_upper == "DRIVER":
        cursor.execute("""
        SELECT d.*, a.brand_name as agency_name
        FROM drivers d JOIN agencies a ON a.id = d.agency_id ORDER BY d.id ASC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="No demo driver found")
        return {
            "success": True,
            "user": {
                "id": row['id'],
                "driver_id": row['driver_id'],
                "agency_id": row['agency_id'],
                "role": "DRIVER",
                "name": row['full_name'],
                "phone": row['phone'],
                "agency_name": row['agency_name'],
                "vehicle_type": row['vehicle_type'],
                "status": row['status']
            }
        }
    elif role_upper == "BUYER":
        cursor.execute("""
        SELECT u.*, b.id as buyer_id, b.full_name, b.buyer_type, b.district, b.city_village
        FROM buyers b JOIN users u ON u.id = b.user_id ORDER BY b.id ASC LIMIT 1
        """)
        row = cursor.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="No demo buyer found")
        return {
            "success": True,
            "user": {
                "id": row['id'],
                "buyer_id": row['buyer_id'],
                "role": "BUYER",
                "name": row['full_name'],
                "email": row['email'],
                "phone": row['phone'],
                "buyer_type": row['buyer_type'],
                "city": row['city_village'],
                "district": row['district'],
                "avatar_url": row['avatar_url']
            }
        }
    elif role_upper == "ADMIN":
        cursor.execute("SELECT * FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="No demo admin found")
        return {
            "success": True,
            "user": {
                "id": row['id'],
                "role": "ADMIN",
                "name": row['name'],
                "email": row['email'],
                "avatar_url": row['avatar_url']
            }
        }
    conn.close()
    raise HTTPException(status_code=400, detail="Invalid role specified")
