"""
VIVAAN Database Engine - SQLite schema & persistence layer
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'vivaan.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL, -- 'FARMER', 'AGENCY', 'DRIVER', 'BUYER', 'ADMIN'
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT,
        auth_provider TEXT DEFAULT 'LOCAL', -- 'LOCAL', 'GOOGLE'
        avatar_url TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Farmers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS farmers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        farmer_type TEXT NOT NULL, -- 'OWN_LAND', 'LEASED_WITH_AGREEMENT', 'LEASED_WITHOUT_AGREEMENT'
        full_name TEXT NOT NULL,
        primary_phone TEXT NOT NULL,
        alt_phone TEXT,
        address TEXT NOT NULL,
        kyc_type TEXT NOT NULL,
        kyc_number TEXT NOT NULL,
        photo_url TEXT,
        email TEXT,
        bank_account TEXT NOT NULL,
        bank_ifsc TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'PENDING', 'UNDER_REVIEW', 'INFO_REQUIRED', 'VERIFIED', 'FAILED', 'SUSPENDED'
        vivaan_id TEXT UNIQUE NOT NULL, -- e.g. VIV-FR-104582
        consent_status TEXT, -- 'NOT_REQUIRED', 'REQUESTED', 'APPROVED', 'REJECTED'
        consent_date TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Land Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS land_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        taluk TEXT NOT NULL,
        village TEXT NOT NULL,
        survey_no TEXT NOT NULL,
        subdivision_no TEXT NOT NULL,
        patta_no TEXT NOT NULL,
        chitta_no TEXT,
        land_extent TEXT NOT NULL,
        land_classification TEXT NOT NULL,
        soil_type TEXT,
        water_source TEXT,
        leased_area TEXT,
        FOREIGN KEY (farmer_id) REFERENCES farmers (id)
    )
    """)

    # Lease Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lease_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        landowner_name TEXT NOT NULL,
        landowner_phone TEXT NOT NULL,
        landowner_kyc TEXT,
        patta_details TEXT,
        agreement_doc TEXT,
        lease_start TEXT,
        lease_end TEXT,
        duration_months INTEGER,
        cultivation_terms TEXT,
        farmer_signature TEXT,
        landowner_signature TEXT,
        consent_otp TEXT,
        consent_verified INTEGER DEFAULT 0,
        FOREIGN KEY (farmer_id) REFERENCES farmers (id)
    )
    """)

    # Farmer Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS farmer_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        doc_type TEXT NOT NULL,
        doc_name TEXT NOT NULL,
        doc_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'UPLOADED', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED'
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (farmer_id) REFERENCES farmers (id)
    )
    """)

    # Products (Farmer Produce)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY, -- e.g. PRD-88210
        farmer_id INTEGER NOT NULL,
        vivaan_farmer_id TEXT NOT NULL,
        farmer_name TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL, -- Grains, Vegetables, Fruits, Spices, Pulses, Organic, etc.
        quantity REAL NOT NULL,
        available_quantity REAL NOT NULL,
        unit TEXT NOT NULL, -- kg, Quintal, Metric Ton, Litre, Pack, Piece
        price_per_unit REAL NOT NULL,
        harvest_date TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        description TEXT,
        quality_info TEXT,
        city TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (farmer_id) REFERENCES farmers (id)
    )
    """)

    # Delivery Agencies
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        service_type TEXT NOT NULL, -- 'LOCAL', 'DISTRICT', 'STATE'
        tier TEXT NOT NULL, -- 'LOCAL_GREEN', 'DISTRICT_ORANGE', 'STATE_BLUE'
        legal_name TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        corp_office TEXT NOT NULL,
        tax_id TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'PENDING', 'UNDER_REVIEW', 'INFO_REQUIRED', 'VERIFIED', 'REJECTED', 'SUSPENDED'
        vivaan_id TEXT UNIQUE NOT NULL, -- e.g. VIV-AG-104582
        rural_transit_time TEXT,
        max_weight_kg REAL,
        max_volume_cbm REAL,
        operating_hours TEXT,
        supported_types TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Agency Coverage & Serviceability Matrix
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agency_coverage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER NOT NULL,
        coverage_zones TEXT, -- JSON array
        serviceable_districts TEXT, -- JSON array
        serviceable_states TEXT, -- JSON array
        no_go_zones TEXT,
        unserviceable_locations TEXT,
        FOREIGN KEY (agency_id) REFERENCES agencies (id)
    )
    """)

    # Agency Fleet
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agency_fleet (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER NOT NULL,
        vehicle_type TEXT NOT NULL, -- 'Bike', 'Pickup', 'Van', 'Truck'
        count INTEGER NOT NULL,
        target_districts TEXT,
        ownership TEXT NOT NULL, -- 'Self', 'Agency', 'Crowdsourced', 'Outsourced'
        FOREIGN KEY (agency_id) REFERENCES agencies (id)
    )
    """)

    # Drivers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER NOT NULL,
        driver_id TEXT UNIQUE NOT NULL, -- e.g. VIV-DR-104582
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        alt_phone TEXT,
        dob TEXT,
        address TEXT NOT NULL,
        aadhaar_no TEXT,
        license_no TEXT NOT NULL,
        license_class TEXT NOT NULL, -- 'LMV', 'HGV', '2-Wheeler'
        license_expiry TEXT,
        experience_years INTEGER,
        criminal_record TEXT DEFAULT 'None',
        home_state TEXT NOT NULL,
        home_district TEXT NOT NULL,
        familiar_taluk TEXT,
        languages TEXT,
        vehicle_owner TEXT, -- 'Self', 'Agency'
        vehicle_type TEXT NOT NULL, -- 'Bike', 'Pickup', 'Truck'
        vehicle_no TEXT,
        max_weight_kg REAL,
        smartphone_user INTEGER DEFAULT 1,
        cod_handling INTEGER DEFAULT 1,
        heavy_lifting INTEGER DEFAULT 1,
        shift TEXT DEFAULT 'Flexible',
        status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'
        created_at TEXT NOT NULL,
        FOREIGN KEY (agency_id) REFERENCES agencies (id)
    )
    """)

    # Buyers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS buyers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        city_village TEXT NOT NULL,
        pincode TEXT NOT NULL,
        street_address TEXT NOT NULL,
        buyer_type TEXT NOT NULL, -- 'Retail Consumer', 'Wholesaler', 'Retailer', 'Restaurant'
        business_name TEXT,
        gstin TEXT,
        preferred_language TEXT DEFAULT 'English',
        payment_mode TEXT DEFAULT 'UPI',
        alert_channel TEXT DEFAULT 'WhatsApp',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Orders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, -- e.g. VIV-ORD-77401
        buyer_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        buyer_phone TEXT NOT NULL,
        farmer_id INTEGER NOT NULL,
        farmer_name TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        total_amount REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 150.0,
        delivery_address TEXT NOT NULL,
        delivery_state TEXT NOT NULL,
        delivery_district TEXT NOT NULL,
        delivery_pincode TEXT NOT NULL,
        delivery_type TEXT NOT NULL DEFAULT 'Standard', -- 'Standard', 'Express', 'Scheduled'
        preferred_date TEXT,
        preferred_time TEXT, -- 'Morning', 'Afternoon', 'Evening'
        driver_notes TEXT,
        payment_method TEXT NOT NULL, -- 'COD', 'UPI', 'CARD', 'NET_BANKING'
        payment_status TEXT NOT NULL DEFAULT 'PAID', -- 'PENDING', 'AUTHORIZED', 'PAID', 'REFUNDED', 'SETTLED'
        order_status TEXT NOT NULL DEFAULT 'IN_TRANSIT', -- 'PENDING', 'MATCHED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'
        agency_id INTEGER,
        agency_name TEXT,
        driver_id TEXT,
        driver_name TEXT,
        delivery_otp TEXT NOT NULL, -- 4 digit PIN
        pickup_lat REAL DEFAULT 11.6643,
        pickup_lng REAL DEFAULT 78.1460,
        delivery_lat REAL DEFAULT 13.0827,
        delivery_lng REAL DEFAULT 80.2707,
        driver_lat REAL DEFAULT 11.6643,
        driver_lng REAL DEFAULT 78.1460,
        last_gps_update TEXT,
        tracking_active INTEGER DEFAULT 1,
        tracking_phase TEXT DEFAULT 'TO_FARMER', -- 'TO_FARMER', 'TO_BUYER', 'ENDED'
        simulation_progress REAL DEFAULT 0.0,
        accepted_at TEXT,
        collected_at TEXT,
        created_at TEXT NOT NULL,
        delivered_at TEXT
    )
    """)

    # Payments & Escrow Settlements
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments_escrow (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL UNIQUE,
        total_amount REAL NOT NULL,
        farmer_amount REAL NOT NULL,
        agency_fee REAL NOT NULL,
        platform_fee REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'HELD_IN_ESCROW', -- 'HELD_IN_ESCROW', 'SETTLED', 'REFUNDED'
        transaction_ref TEXT NOT NULL,
        paid_at TEXT NOT NULL,
        settled_at TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id)
    )
    """)

    # Reviews & Ratings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        farmer_id INTEGER NOT NULL,
        farmer_rating INTEGER NOT NULL,
        product_quality_rating INTEGER NOT NULL,
        listing_accuracy_rating INTEGER NOT NULL,
        farmer_review TEXT,
        agency_id INTEGER,
        agency_rating INTEGER,
        delivery_timeliness_rating INTEGER,
        professionalism_rating INTEGER,
        agency_review TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Notifications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO', -- 'INFO', 'SUCCESS', 'WARNING', 'ORDER'
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # Delivery Batches for Multi-Order Trips (Phase 52)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS delivery_batches (
        id TEXT PRIMARY KEY, -- e.g. VIV-BATCH-0042
        driver_id TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        agency_id INTEGER NOT NULL,
        agency_name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        max_weight_kg REAL NOT NULL,
        current_load_kg REAL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'BATCH_CREATED', -- 'BATCH_CREATED', 'BATCH_ASSIGNED', 'BATCH_ACCEPTED', 'PICKUP_IN_PROGRESS', 'DELIVERY_IN_PROGRESS', 'COMPLETED'
        created_at TEXT NOT NULL,
        completed_at TEXT
    )
    """)

    # Automatic schema migration for new tracking & batch columns
    cursor.execute("PRAGMA table_info(orders)")
    existing_cols = [col[1] for col in cursor.fetchall()]
    new_cols = [
        ("driver_lat", "REAL DEFAULT 11.6643"),
        ("driver_lng", "REAL DEFAULT 78.1460"),
        ("last_gps_update", "TEXT"),
        ("tracking_active", "INTEGER DEFAULT 1"),
        ("tracking_phase", "TEXT DEFAULT 'TO_FARMER'"),
        ("simulation_progress", "REAL DEFAULT 0.0"),
        ("accepted_at", "TEXT"),
        ("collected_at", "TEXT"),
        ("checkout_id", "TEXT"),
        ("batch_id", "TEXT")
    ]
    for c_name, c_def in new_cols:
        if c_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {c_name} {c_def}")
            except Exception:
                pass

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("VIVAAN database initialized successfully.")
