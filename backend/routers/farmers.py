"""
VIVAAN Farmer Router
Handles Farmer Multi-step registration (Own Land, Leased with Agreement, Leased without Agreement),
Landowner consent OTP simulation, Produce listing CRUD, ID Card data, and AI Assistant.
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from models import FarmerRegisterRequest, ProductCreateRequest, AIAdvisoryRequest
from datetime import datetime
import random

router = APIRouter(prefix="/api/farmers", tags=["farmers"])

@router.post("/register")
def register_farmer(payload: FarmerRegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # Generate unique VIVAAN Farmer ID: VIV-FR-XXXXXX
    random_num = random.randint(100000, 999999)
    vivaan_id = f"VIV-FR-{random_num}"

    # Determine consent status
    consent_status = "NOT_REQUIRED"
    consent_date = None
    if payload.farmer_type == "LEASED_WITH_AGREEMENT":
        consent_status = "APPROVED"
        consent_date = now
    elif payload.farmer_type == "LEASED_WITHOUT_AGREEMENT":
        consent_status = "APPROVED" # In demo registration, user completes OTP verification
        consent_date = now

    # 1. Create user entry
    cursor.execute("""
    INSERT INTO users (role, name, email, phone, password_hash, auth_provider, avatar_url, created_at)
    VALUES ('FARMER', ?, ?, ?, ?, 'LOCAL', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', ?)
    """, (payload.full_name, payload.email or f"farmer_{random_num}@vivaan.agri", payload.primary_phone, payload.password or "farmer123", now))
    user_id = cursor.lastrowid

    # Mask KYC number for public safety
    masked_kyc = f"XXXX-XXXX-{payload.kyc_number[-4:] if len(payload.kyc_number) >= 4 else '9988'}"

    # 2. Create Farmer entry
    cursor.execute("""
    INSERT INTO farmers (
        user_id, farmer_type, full_name, primary_phone, alt_phone, address,
        kyc_type, kyc_number, photo_url, email, bank_account, bank_ifsc,
        bank_name, status, vivaan_id, consent_status, consent_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?, ?, ?)
    """, (
        user_id, payload.farmer_type, payload.full_name, payload.primary_phone,
        payload.alt_phone, payload.address, payload.kyc_type, masked_kyc,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        payload.email, payload.bank_account, payload.bank_ifsc, payload.bank_name,
        vivaan_id, consent_status, consent_date, now
    ))
    farmer_id = cursor.lastrowid

    # 3. Create Land Record
    cursor.execute("""
    INSERT INTO land_records (
        farmer_id, state, district, taluk, village, survey_no, subdivision_no,
        patta_no, chitta_no, land_extent, land_classification, soil_type, water_source, leased_area
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        farmer_id, payload.state, payload.district, payload.taluk, payload.village,
        payload.survey_no, payload.subdivision_no, payload.patta_no, payload.chitta_no or 'CHT-PENDING',
        payload.land_extent, payload.land_classification, payload.soil_type or 'Red Loam',
        payload.water_source or 'Borewell', payload.leased_area or payload.land_extent
    ))

    # 4. If Leased, record lease details & landowner
    if payload.farmer_type in ['LEASED_WITH_AGREEMENT', 'LEASED_WITHOUT_AGREEMENT']:
        cursor.execute("""
        INSERT INTO lease_records (
            farmer_id, landowner_name, landowner_phone, landowner_kyc, patta_details,
            agreement_doc, lease_start, lease_end, duration_months, cultivation_terms,
            farmer_signature, landowner_signature, consent_otp, consent_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            farmer_id, payload.landowner_name or 'Verified Landowner', payload.landowner_phone or '+919800000000',
            payload.landowner_kyc or 'XXXX-XXXX-4411', payload.patta_no,
            'Agreement_Executed.pdf' if payload.farmer_type == 'LEASED_WITH_AGREEMENT' else 'CONSENT_OTP_VERIFIED',
            payload.lease_start or '2025-01-01', payload.lease_end or '2027-12-31',
            payload.duration_months or 24, payload.cultivation_terms or 'Agricultural cultivation rights only',
            'Digital Consent e-Signed', 'Landowner OTP Confirmed', '8492'
        ))

    # 5. Insert sample verified document
    cursor.execute("""
    INSERT INTO farmer_documents (farmer_id, doc_type, doc_name, doc_url, status, uploaded_at)
    VALUES (?, 'Patta / Land Records', 'Patta_Verification_Cert.pdf', '/static/docs/sample_patta.pdf', 'VERIFIED', ?)
    """, (farmer_id, now))

    # 6. Audit & Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, role, title, message, type, created_at)
    VALUES (?, 'FARMER', 'Registration Approved & VIVAAN ID Issued', ?, 'SUCCESS', ?)
    """, (user_id, f"Welcome to VIVAAN! Your permanent Farmer ID is {vivaan_id}. You can now list produce and connect directly with buyers.", now))

    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (?, 'SYSTEM', 'FARMER_REGISTERED', ?, ?, ?)
    """, (user_id, vivaan_id, f"Farmer {payload.full_name} registered as {payload.farmer_type} with ID {vivaan_id}", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "vivaan_id": vivaan_id,
        "farmer_id": farmer_id,
        "message": "Registration successful! Your digital VIVAAN Farmer ID card is active."
    }

@router.post("/landowner-consent/request-otp")
def request_landowner_consent_otp(payload: dict):
    """Simulates sending a secure verification OTP/link to the landowner"""
    landowner_mobile = payload.get("landowner_phone", "")
    return {
        "success": True,
        "message": f"Secure OTP sent to landowner at {landowner_mobile}. (For demo testing, enter code 8492)",
        "demo_otp": "8492"
    }

@router.get("/{farmer_id}/id-card")
def get_farmer_id_card(farmer_id: int):
    """
    Returns public, privacy-safe Farmer ID card information.
    Zero exposure of bank account, exact coordinates, home address, or full Aadhaar.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT f.id, f.vivaan_id, f.full_name, f.farmer_type, f.status, f.photo_url, f.created_at,
           l.state, l.district, l.taluk, l.village, l.soil_type, l.water_source, l.land_extent
    FROM farmers f
    JOIN land_records l ON l.farmer_id = f.id
    WHERE f.id = ?
    """, (farmer_id,))
    farmer = cursor.fetchone()
    conn.close()

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Safe verification QR target (can be scanned by any phone camera)
    qr_verify_url = f"https://vivaan.agri/verify?id={farmer['vivaan_id']}&hash=safeverified"

    return {
        "success": True,
        "id_card": {
            "vivaan_id": farmer['vivaan_id'],
            "full_name": farmer['full_name'],
            "farmer_type": farmer['farmer_type'].replace("_", " ").title(),
            "status": farmer['status'],
            "photo_url": farmer['photo_url'],
            "location": f"{farmer['village']}, {farmer['district']}, {farmer['state']}",
            "land_extent": farmer['land_extent'],
            "issued_date": farmer['created_at'][:10],
            "qr_data": qr_verify_url
        }
    }

@router.get("/{farmer_id}/products")
def get_farmer_products(farmer_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC", (farmer_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "products": [dict(r) for r in rows]}

@router.post("/products")
def add_product(payload: ProductCreateRequest):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # Get farmer details
    cursor.execute("""
    SELECT f.vivaan_id, f.full_name, l.village, l.district, l.state
    FROM farmers f
    JOIN land_records l ON l.farmer_id = f.id
    WHERE f.id = ?
    """, (payload.farmer_id,))
    farmer = cursor.fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail="Farmer not found")

    prd_id = f"PRD-{random.randint(10000, 99999)}"

    # Default photo if none provided
    photo = payload.photo_url
    if not photo:
        cat = payload.category.lower()
        if "grain" in cat or "rice" in cat or "wheat" in cat:
            photo = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"
        elif "fruit" in cat or "mango" in cat:
            photo = "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500"
        elif "spice" in cat or "turmeric" in cat:
            photo = "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500"
        else:
            photo = "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500"

    cursor.execute("""
    INSERT INTO products (
        id, farmer_id, vivaan_farmer_id, farmer_name, title, category,
        quantity, available_quantity, unit, price_per_unit, harvest_date,
        photo_url, description, quality_info, city, district, state, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    """, (
        prd_id, payload.farmer_id, farmer['vivaan_id'], farmer['full_name'],
        payload.title, payload.category, payload.quantity, payload.quantity,
        payload.unit, payload.price_per_unit, payload.harvest_date,
        photo, payload.description, payload.quality_info or 'Verified Farm Fresh',
        farmer['village'], farmer['district'], farmer['state'], now
    ))

    conn.commit()
    conn.close()

    return {"success": True, "product_id": prd_id, "message": "Product listed successfully on VIVAAN marketplace!"}

@router.put("/products/{product_id}/toggle")
def toggle_product(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_active FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    new_status = 0 if row['is_active'] else 1
    cursor.execute("UPDATE products SET is_active = ? WHERE id = ?", (new_status, product_id))
    conn.commit()
    conn.close()
    return {"success": True, "is_active": new_status}

@router.delete("/products/{product_id}")
def delete_product(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Product listing removed"}

@router.get("/{farmer_id}/orders")
def get_farmer_orders(farmer_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT o.*, p.status as escrow_status, p.farmer_amount
    FROM orders o
    LEFT JOIN payments_escrow p ON p.order_id = o.id
    WHERE o.farmer_id = ?
    ORDER BY o.created_at DESC
    """, (farmer_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"success": True, "orders": [dict(r) for r in rows]}

@router.post("/ai-assistant")
def ai_assistant(payload: AIAdvisoryRequest):
    """
    Intelligent Agricultural Guidance Engine
    Helps farmers choose crops, understand water requirements, craft listings,
    and understand marketplace procedures.
    """
    qtype = payload.query_type
    soil = payload.soil_type or "Red Loam"
    water = payload.water_source or "Borewell"
    crop = payload.crop_name or ""

    disclaimer = "⚠️ VIVAAN Agricultural Advisory Disclaimer: These recommendations are generated for guidance and reference purposes. Please consult your local Krishi Vigyan Kendra (KVK) or State Agricultural Department officer for site-specific advice."

    if qtype == "crop_recommendation":
        # Recommendation engine based on soil type
        soil_lower = soil.lower()
        if "red" in soil_lower:
            recommendations = [
                {"crop": "Turmeric (Haldi)", "season": "Kharif (June-July)", "water": "Moderate", "expected_yield": "20-25 Quintals/Acre", "notes": "Thrives in well-drained red loam. Very high demand on VIVAAN."},
                {"crop": "Groundnut (Peanut)", "season": "Kharif & Rabi", "water": "Low-Moderate", "expected_yield": "12-15 Quintals/Acre", "notes": "Fixes atmospheric nitrogen and enriches soil."},
                {"crop": "Small Sambar Onions", "season": "All Seasons", "water": "Regular Drip", "expected_yield": "6-8 Tonnes/Acre", "notes": "Quick cash turnaround, high wholesale demand."}
            ]
        elif "black" in soil_lower:
            recommendations = [
                {"crop": "Cotton", "season": "Kharif", "water": "Moderate", "expected_yield": "10-12 Quintals/Acre", "notes": "Black cotton soil has supreme moisture retention."},
                {"crop": "Soybean", "season": "Kharif", "water": "Rainfed/Moderate", "expected_yield": "8-10 Quintals/Acre", "notes": "Short maturity period with stable market price."},
                {"crop": "Gram / Chana", "season": "Rabi", "water": "Low", "expected_yield": "7-9 Quintals/Acre", "notes": "Excellent pulse crop for residual moisture."}
            ]
        elif "alluvial" in soil_lower:
            recommendations = [
                {"crop": "Sharbati Wheat", "season": "Rabi (Nov-Dec)", "water": "3-4 Irrigations", "expected_yield": "18-22 Quintals/Acre", "notes": "Rich organic content yields golden premium grains."},
                {"crop": "Basmati / Non-Basmati Paddy", "season": "Kharif", "water": "High", "expected_yield": "25-30 Quintals/Acre", "notes": "Best suited for alluvial plains."},
                {"crop": "Mustard Seeds", "season": "Rabi", "water": "Low", "expected_yield": "6-8 Quintals/Acre", "notes": "High oil content, commanding top wholesale rates."}
            ]
        else:
            recommendations = [
                {"crop": "Vegetable Polyhouse / Open", "season": "Year-round", "water": "Drip Irrigation", "expected_yield": "High", "notes": "Ideal for leafy greens, capsicum, and vine tomatoes."},
                {"crop": "Pulses (Arhar / Toor)", "season": "Kharif", "water": "Drought tolerant", "expected_yield": "6-8 Quintals/Acre", "notes": "Requires minimal fertilizer."}
            ]

        return {
            "success": True,
            "title": f"Crop Recommendations for {soil} ({water})",
            "recommendations": recommendations,
            "soil_tip": f"Your {soil} has distinct drainage characteristics. Adding well-decomposed farmyard manure (FYM) will improve microbial activity.",
            "disclaimer": disclaimer
        }

    elif qtype == "water_requirement":
        return {
            "success": True,
            "title": f"Water & Irrigation Guidelines for {crop or 'Seasonal Crops'}",
            "guidelines": [
                "Install Drip or Micro-sprinkler systems to conserve 40-50% water compared to conventional flood irrigation.",
                "For Borewells: Schedule irrigation during early morning (05:00 - 08:00 AM) or evening to prevent evaporation loss.",
                "Mulching: Apply straw or organic mulch around root zones to retain soil moisture during peak summer months.",
                "Critical Stages: Never allow soil water deficit during flowering and fruit/pod development stages."
            ],
            "disclaimer": disclaimer
        }

    elif qtype == "description_helper":
        crop_title = crop or "Farm Produce"
        suggested_desc = f"100% farm-fresh {crop_title}, freshly harvested from fertile fields in {payload.state}. Grown using natural compost and sustainable farming practices. Hand-sorted, graded for uniform size and aroma, and packed in ventilated food-grade packaging. Ideal for direct household consumption, restaurants, and bulk wholesale buyers."
        return {
            "success": True,
            "crop": crop_title,
            "suggested_title": f"Fresh Farm-Direct {crop_title} (Grade-A)",
            "suggested_description": suggested_desc,
            "selling_tip": "Highlight freshness, harvest date, and natural cultivation in your listing to attract premium buyers."
        }

    elif qtype == "unit_estimator":
        return {
            "success": True,
            "title": "Selling Unit Guide for VIVAAN Marketplace",
            "units_guide": [
                {"unit": "kg", "best_for": "Fresh vegetables, tomatoes, greens, retail spices", "tip": "Preferred by retail consumers and small family kitchens."},
                {"unit": "Quintal (100 kg)", "best_for": "Paddy, Wheat, Pulses, Onion bags, Potatoes, Raw Turmeric", "tip": "Standard commercial unit for Mandi and wholesale buyers."},
                {"unit": "Metric Ton (1000 kg)", "best_for": "Sugarcane, bulk grain trucks, industrial processing lots", "tip": "For large commercial orders transported via State Level logistics."},
                {"unit": "Pack / Box", "best_for": "GI Alphonso Mangoes (1 Dozen Box), Strawberry crates, exotic herbs", "tip": "High-margin packaging unit with protective cushioning."}
            ]
        }

    else:
        return {
            "success": True,
            "title": "VIVAAN Farmer Marketplace Procedures",
            "steps": [
                "1. Listing: Add your produce with accurate photos and fair market pricing.",
                "2. Order Notification: You will receive an SMS and WhatsApp alert when a buyer places an order.",
                "3. Agency Pickup: A verified VIVAAN delivery driver will arrive at your village farmgate with digital verification.",
                "4. Handover & Delivery: Once delivered and verified with buyer OTP, payment is released directly to your verified bank account.",
                "5. Zero Middlemen: 100% transparency with escrow security."
            ],
            "disclaimer": disclaimer
        }
