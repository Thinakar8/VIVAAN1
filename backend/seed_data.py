"""
VIVAAN Seed Data Generator
Populates realistic Indian agricultural demo data for Farmers, Land/Lease records,
Agencies (Local/District/State), Drivers, Buyers, Products, Orders, Escrow, and Reviews.
"""
from database import get_db, init_db
from datetime import datetime

def seed():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing data
    tables = [
        'users', 'farmers', 'land_records', 'lease_records', 'farmer_documents',
        'products', 'agencies', 'agency_coverage', 'agency_fleet', 'drivers',
        'buyers', 'orders', 'payments_escrow', 'reviews', 'notifications', 'audit_logs'
    ]
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    try:
        cursor.execute("DELETE FROM sqlite_sequence")
    except Exception:
        pass

    now = datetime.now().isoformat()

    # 1. USERS
    users_data = [
        # (role, name, email, phone, password_hash, auth_provider, avatar_url)
        ('ADMIN', 'VIVAAN Chief Administrator', 'admin@vivaan.agri', '+919800000001', 'admin123', 'LOCAL', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
        ('FARMER', 'Ramasamy Gounder', 'ramasamy@vivaan.agri', '+919842104582', 'farmer123', 'LOCAL', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
        ('FARMER', 'Harpreet Singh', 'harpreet@vivaan.agri', '+919876543210', 'farmer123', 'LOCAL', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
        ('FARMER', 'Dattatray Patil', 'dattatray@vivaan.agri', '+919822334455', 'farmer123', 'LOCAL', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
        ('FARMER', 'Suresh Patel', 'suresh@vivaan.agri', '+919898123456', 'farmer123', 'LOCAL', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
        ('AGENCY', 'GreenCorridor Agro Logistics', 'contact@greencorridor.in', '+919840112233', 'agency123', 'LOCAL', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150'),
        ('AGENCY', 'KrishiExpress Rural Transport', 'ops@krishiexpress.in', '+919842887766', 'agency123', 'LOCAL', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
        ('AGENCY', 'GramaSeva Express', 'support@gramaseva.in', '+919843990011', 'agency123', 'LOCAL', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
        ('DRIVER', 'Murugan K', 'murugan@vivaan.driver', '+919443219870', 'driver123', 'LOCAL', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
        ('DRIVER', 'Jaswinder Singh', 'jaswinder@vivaan.driver', '+919814567890', 'driver123', 'LOCAL', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
        ('BUYER', 'Aditi Sharma', 'aditi.sharma@gmail.com', '+919841234567', 'buyer123', 'GOOGLE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
        ('BUYER', 'Annam Gourmet Restaurant', 'chef@annamayya.com', '+919843110022', 'buyer123', 'LOCAL', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150')
    ]

    inserted_user_ids = {}
    for u in users_data:
        cursor.execute("""
        INSERT INTO users (role, name, email, phone, password_hash, auth_provider, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (u[0], u[1], u[2], u[3], u[4], u[5], u[6], now))
        inserted_user_ids[u[2]] = cursor.lastrowid

    # 2. FARMERS & LAND RECORDS
    # Farmer 1: Ramasamy (Own Land)
    cursor.execute("""
    INSERT INTO farmers (user_id, farmer_type, full_name, primary_phone, alt_phone, address, kyc_type, kyc_number, photo_url, email, bank_account, bank_ifsc, bank_name, status, vivaan_id, consent_status, created_at)
    VALUES (?, 'OWN_LAND', 'Ramasamy Gounder', '+919842104582', '+919842104583', 'Survey 14/2B, Omalur Main Road, Salem', 'Aadhaar Card', 'XXXX-XXXX-4821', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'ramasamy@vivaan.agri', 'SBIN0001234 - 30891283912', 'SBIN0001234', 'State Bank of India, Omalur Branch', 'VERIFIED', 'VIV-FR-104582', 'NOT_REQUIRED', ?)
    """, (inserted_user_ids['ramasamy@vivaan.agri'], now))
    f1_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO land_records (farmer_id, state, district, taluk, village, survey_no, subdivision_no, patta_no, chitta_no, land_extent, land_classification, soil_type, water_source)
    VALUES (?, 'Tamil Nadu', 'Salem', 'Omalur', 'Muthampatty', '142', '2B', 'PAT-4821/2021', 'CHT-9912', '5.5 Acres', 'Nanjai (Wetland)', 'Red Loam', 'Borewell with Solar Pump')
    """, (f1_id,))

    cursor.execute("""
    INSERT INTO farmer_documents (farmer_id, doc_type, doc_name, doc_url, status, uploaded_at)
    VALUES (?, 'Patta / Chitta', 'Patta_4821_Certified.pdf', '/static/docs/patta_sample.pdf', 'VERIFIED', ?)
    """, (f1_id, now))

    # Farmer 2: Harpreet Singh (Own Land)
    cursor.execute("""
    INSERT INTO farmers (user_id, farmer_type, full_name, primary_phone, alt_phone, address, kyc_type, kyc_number, photo_url, email, bank_account, bank_ifsc, bank_name, status, vivaan_id, consent_status, created_at)
    VALUES (?, 'OWN_LAND', 'Harpreet Singh', '+919876543210', '', 'GT Road, Samrala, Ludhiana', 'Aadhaar Card', 'XXXX-XXXX-7182', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'harpreet@vivaan.agri', 'PUNB0123400 - 1029384756', 'PUNB0123400', 'Punjab National Bank, Samrala', 'VERIFIED', 'VIV-FR-208914', 'NOT_REQUIRED', ?)
    """, (inserted_user_ids['harpreet@vivaan.agri'], now))
    f2_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO land_records (farmer_id, state, district, taluk, village, survey_no, subdivision_no, patta_no, chitta_no, land_extent, land_classification, soil_type, water_source)
    VALUES (?, 'Punjab', 'Ludhiana', 'Samrala', 'Kotla', '38', '1A', 'JAM-8821/2020', 'KHW-332', '12 Acres', 'Irrigated Arable', 'Alluvial Soil', 'Canal & Tube Well')
    """, (f2_id,))

    # Farmer 3: Dattatray Patil (Leased with Agreement)
    cursor.execute("""
    INSERT INTO farmers (user_id, farmer_type, full_name, primary_phone, alt_phone, address, kyc_type, kyc_number, photo_url, email, bank_account, bank_ifsc, bank_name, status, vivaan_id, consent_status, created_at)
    VALUES (?, 'LEASED_WITH_AGREEMENT', 'Dattatray Patil', '+919822334455', '', 'Alibaug Road, Ratnagiri', 'Voter ID', 'MHR-9921448', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'dattatray@vivaan.agri', 'MAHB0000987 - 5544332211', 'MAHB0000987', 'Bank of Maharashtra, Ratnagiri', 'VERIFIED', 'VIV-FR-301275', 'APPROVED', ?)
    """, (inserted_user_ids['dattatray@vivaan.agri'], now))
    f3_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO land_records (farmer_id, state, district, taluk, village, survey_no, subdivision_no, patta_no, chitta_no, land_extent, land_classification, soil_type, water_source, leased_area)
    VALUES (?, 'Maharashtra', 'Ratnagiri', 'Guhagar', 'Pawas', '89', '4C', '7-12-EXT-992', 'NA', '8 Acres', 'Orchard / Bagayat', 'Laterite Clay', 'Natural Stream & Well', '6.5 Acres')
    """, (f3_id,))

    cursor.execute("""
    INSERT INTO lease_records (farmer_id, landowner_name, landowner_phone, landowner_kyc, patta_details, agreement_doc, lease_start, lease_end, duration_months, cultivation_terms, farmer_signature, landowner_signature, consent_otp, consent_verified)
    VALUES (?, 'Vijay Deshmukh', '+919822998877', 'XXXX-XXXX-3344', '7/12 Extract Pawas 89/4C', '/static/docs/lease_agreement.pdf', '2024-01-01', '2027-12-31', 48, 'Commercial Alphonso Mango Cultivation with organic compliance', 'Signed digitally via Aadhaar OTP', 'Signed digitally via Aadhaar OTP', '7741', 1)
    """, (f3_id,))

    # Farmer 4: Suresh Patel (Leased without Agreement - Landowner Consent Process)
    cursor.execute("""
    INSERT INTO farmers (user_id, farmer_type, full_name, primary_phone, alt_phone, address, kyc_type, kyc_number, photo_url, email, bank_account, bank_ifsc, bank_name, status, vivaan_id, consent_status, consent_date, created_at)
    VALUES (?, 'LEASED_WITHOUT_AGREEMENT', 'Suresh Patel', '+919898123456', '', 'Borsad Road, Anand', 'Aadhaar Card', 'XXXX-XXXX-9912', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', 'suresh@vivaan.agri', 'BARB0ANAND - 8877665544', 'BARB0ANAND', 'Bank of Baroda, Anand Main', 'VERIFIED', 'VIV-FR-407891', 'APPROVED', '2026-08-10', ?)
    """, (inserted_user_ids['suresh@vivaan.agri'], now))
    f4_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO land_records (farmer_id, state, district, taluk, village, survey_no, subdivision_no, patta_no, chitta_no, land_extent, land_classification, soil_type, water_source, leased_area)
    VALUES (?, 'Gujarat', 'Anand', 'Borsad', 'Davol', '215', '1', 'GUJ-PAT-1188', 'NA', '4 Acres', 'Goradu (Sandy Loam)', 'Sandy Loam', 'Tube Well', '3.5 Acres')
    """, (f4_id,))

    cursor.execute("""
    INSERT INTO lease_records (farmer_id, landowner_name, landowner_phone, landowner_kyc, patta_details, agreement_doc, lease_start, lease_end, duration_months, cultivation_terms, farmer_signature, landowner_signature, consent_otp, consent_verified)
    VALUES (?, 'Bhupendra Patel', '+919898009988', 'XXXX-XXXX-7722', 'Borsad Land Ledger 215/1', 'NO_WRITTEN_AGREEMENT_CONSENT_FLOW', '2025-06-01', '2027-05-31', 24, 'Vegetable cultivation rights granted on mutual seasonal lease sharing', 'Digital Verification', 'OTP Verified by Landowner', '6620', 1)
    """, (f4_id,))

    # 3. PRODUCTS
    products_data = [
        ('PRD-88210', f1_id, 'VIV-FR-104582', 'Ramasamy Gounder', 'Salem Pure Organic Turmeric (Haldi)', 'Spices', 250.0, 210.0, 'kg', 160.0, '2026-08-28', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', 'GI-Certified authentic Salem Erode variety turmeric with high curcumin content (4.8%). Grown with organic compost and sun-dried naturally.', 'Organic Certified, High Curcumin', 'Omalur', 'Salem', 'Tamil Nadu'),
        ('PRD-88211', f1_id, 'VIV-FR-104582', 'Ramasamy Gounder', 'Ponni Boiled Rice (Old Harvest)', 'Grains', 80.0, 65.0, 'Quintal', 3400.0, '2026-08-15', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 'Aged single-origin Ponni rice from fertile Cauvery belt. Fluffy, non-sticky, rich aroma, zero chemical polish.', 'Aged 12 Months, Zero Polish', 'Omalur', 'Salem', 'Tamil Nadu'),
        ('PRD-88212', f1_id, 'VIV-FR-104582', 'Ramasamy Gounder', 'Farm-Fresh Country Small Onions (Shallots)', 'Vegetables', 500.0, 380.0, 'kg', 45.0, '2026-09-12', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500', 'Crisp, pungent sambar onions freshly harvested. Hand-graded, sorted, and packed in ventilated breathable crates.', 'Grade-A Freshly Harvested', 'Omalur', 'Salem', 'Tamil Nadu'),
        ('PRD-77301', f2_id, 'VIV-FR-208914', 'Harpreet Singh', 'Sharbati Premium Golden Wheat', 'Grains', 150.0, 120.0, 'Quintal', 2850.0, '2026-07-20', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', 'Sun-soaked Sharbati wheat grains from Punjab soil. Produces soft, fluffy chapatis with high dietary fibre and natural sweetness.', 'High Protein, Clean Graded', 'Samrala', 'Ludhiana', 'Punjab'),
        ('PRD-77302', f2_id, 'VIV-FR-208914', 'Harpreet Singh', 'Cold-Pressed Raw Mustard Seeds (Sarson)', 'Spices', 60.0, 45.0, 'Quintal', 5600.0, '2026-06-30', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500', 'Bold yellow and black mustard seeds cultivated naturally. Excellent for cold-pressed oil extraction and tempering.', 'Bold Grain, High Oil Yield', 'Samrala', 'Ludhiana', 'Punjab'),
        ('PRD-66401', f3_id, 'VIV-FR-301275', 'Dattatray Patil', 'Authentic Ratnagiri Alphonso Mangoes (GI Tagged)', 'Fruits', 400.0, 180.0, 'Pack', 950.0, '2026-05-18', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', 'GI-tagged Ratnagiri Hapus mangoes ripened naturally in hay grass. Incomparable saffron aroma and velvety fiberless pulp. 1 Dozen per pack.', 'GI Tagged, Chemical-Free', 'Pawas', 'Ratnagiri', 'Maharashtra'),
        ('PRD-55101', f4_id, 'VIV-FR-407891', 'Suresh Patel', 'G4 Spicy Green Chillies (Hari Mirch)', 'Vegetables', 1200.0, 950.0, 'kg', 38.0, '2026-09-14', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500', 'Crisp, fiery green chillies grown under drip irrigation. Ideal for wholesale, daily retail supply, and food processing.', 'Export Grade Freshness', 'Davol', 'Anand', 'Gujarat')
    ]

    cursor.executemany("""
    INSERT INTO products (id, farmer_id, vivaan_farmer_id, farmer_name, title, category, quantity, available_quantity, unit, price_per_unit, harvest_date, photo_url, description, quality_info, city, district, state, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    """, [(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16], now) for p in products_data])

    # 4. AGENCIES (State, District, Local)
    # Agency 1: State Level (Blue Card)
    cursor.execute("""
    INSERT INTO agencies (user_id, service_type, tier, legal_name, brand_name, corp_office, tax_id, contact_name, phone, email, status, vivaan_id, rural_transit_time, max_weight_kg, max_volume_cbm, operating_hours, supported_types, created_at)
    VALUES (?, 'STATE', 'STATE_BLUE', 'GreenCorridor Agro Logistics Pvt Ltd', 'GreenCorridor Logistics', '45 Mount Road, Guindy, Chennai, TN', '33AABCG1234F1Z8', 'R. Senthil Kumar', '+919840112233', 'contact@greencorridor.in', 'VERIFIED', 'VIV-AG-104582', '24 - 36 Hours', 18000.0, 48.0, '24x7 Operations', 'Interstate, Heavy Freight, Cold Chain', ?)
    """, (inserted_user_ids['contact@greencorridor.in'], now))
    ag1_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO agency_coverage (agency_id, coverage_zones, serviceable_districts, serviceable_states, no_go_zones, unserviceable_locations)
    VALUES (?, '["South Corridor", "Western Highway", "Coastal Belt"]', '["Chennai", "Salem", "Coimbatore", "Erode", "Madurai", "Bengaluru Rural", "Chittoor"]', '["Tamil Nadu", "Karnataka", "Andhra Pradesh"]', 'Restricted forest zones without permits', 'None')
    """, (ag1_id,))

    cursor.execute("""
    INSERT INTO agency_fleet (agency_id, vehicle_type, count, target_districts, ownership)
    VALUES (?, 'Truck', 18, 'State-wide Inter-district', 'Agency-owned'),
           (?, 'Pickup', 12, 'District feeder hubs', 'Self-owned')
    """, (ag1_id, ag1_id))

    # Agency 2: District Level (Orange Card)
    cursor.execute("""
    INSERT INTO agencies (user_id, service_type, tier, legal_name, brand_name, corp_office, tax_id, contact_name, phone, email, status, vivaan_id, rural_transit_time, max_weight_kg, max_volume_cbm, operating_hours, supported_types, created_at)
    VALUES (?, 'DISTRICT', 'DISTRICT_ORANGE', 'KrishiExpress Rural Transport Services LLP', 'KrishiExpress', '12 Leigh Bazaar, Salem, TN', '33AACKR9988G1Z2', 'K. Murugesan', '+919842887766', 'ops@krishiexpress.in', 'VERIFIED', 'VIV-AG-209143', '6 - 12 Hours', 4500.0, 16.0, '06:00 AM - 10:00 PM', 'Mandi-to-Market, Perishable Produce, Farmgate Collection', ?)
    """, (inserted_user_ids['ops@krishiexpress.in'], now))
    ag2_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO agency_coverage (agency_id, coverage_zones, serviceable_districts, serviceable_states, no_go_zones, unserviceable_locations)
    VALUES (?, '["Central Tamil Nadu Agri Hub"]', '["Salem", "Erode", "Namakkal", "Dharmapuri"]', '["Tamil Nadu"]', 'Hilly ghat roads above 3500kg', 'None')
    """, (ag2_id,))

    cursor.execute("""
    INSERT INTO agency_fleet (agency_id, vehicle_type, count, target_districts, ownership)
    VALUES (?, 'Pickup', 8, 'Salem, Erode, Namakkal', 'Self-owned'),
           (?, 'Van', 6, 'Perishable vegetables', 'Outsourced')
    """, (ag2_id, ag2_id))

    # Agency 3: Local Level (Green Card)
    cursor.execute("""
    INSERT INTO agencies (user_id, service_type, tier, legal_name, brand_name, corp_office, tax_id, contact_name, phone, email, status, vivaan_id, rural_transit_time, max_weight_kg, max_volume_cbm, operating_hours, supported_types, created_at)
    VALUES (?, 'LOCAL', 'LOCAL_GREEN', 'GramaSeva Hyperlocal Express Co.', 'GramaSeva Express', 'Village Junction, Omalur, Salem, TN', '33AABBG4411D1Z1', 'M. Saravanan', '+919843990011', 'support@gramaseva.in', 'VERIFIED', 'VIV-AG-308821', '2 - 4 Hours', 850.0, 4.0, '07:00 AM - 08:00 PM', 'Farm-to-Door, Daily Vegetables, Same-day Delivery', ?)
    """, (inserted_user_ids['support@gramaseva.in'], now))
    ag3_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO agency_coverage (agency_id, coverage_zones, serviceable_districts, serviceable_states, no_go_zones, unserviceable_locations)
    VALUES (?, '["Omalur Taluk", "Salem City Metro"]', '["Salem"]', '["Tamil Nadu"]', 'None', 'Locations beyond 35km radius')
    """, (ag3_id,))

    cursor.execute("""
    INSERT INTO agency_fleet (agency_id, vehicle_type, count, target_districts, ownership)
    VALUES (?, 'Bike', 10, 'Omalur and Salem North', 'Crowdsourced'),
           (?, 'Pickup', 4, 'Village aggregation', 'Agency-owned')
    """, (ag3_id, ag3_id))

    # 5. DRIVERS
    cursor.execute("""
    INSERT INTO drivers (agency_id, driver_id, full_name, phone, alt_phone, dob, address, aadhaar_no, license_no, license_class, license_expiry, experience_years, criminal_record, home_state, home_district, familiar_taluk, languages, vehicle_owner, vehicle_type, vehicle_no, max_weight_kg, smartphone_user, cod_handling, heavy_lifting, shift, status, created_at)
    VALUES (?, 'VIV-DR-104582', 'Murugan K', '+919443219870', '+919443219871', '1988-04-12', '45 Gandhi Street, Suramangalam, Salem', 'XXXX-XXXX-9012', 'TN-27-2012004589', 'LMV', '2032-04-11', 11, 'None', 'Tamil Nadu', 'Salem', 'Omalur, Salem West', 'Tamil, English, Telugu', 'Agency', 'Pickup', 'TN-30-BC-4890', 1200.0, 1, 1, 1, 'Flexible', 'ACTIVE', ?)
    """, (ag1_id, now))
    d1_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO drivers (agency_id, driver_id, full_name, phone, alt_phone, dob, address, aadhaar_no, license_no, license_class, license_expiry, experience_years, criminal_record, home_state, home_district, familiar_taluk, languages, vehicle_owner, vehicle_type, vehicle_no, max_weight_kg, smartphone_user, cod_handling, heavy_lifting, shift, status, created_at)
    VALUES (?, 'VIV-DR-201944', 'Jaswinder Singh', '+919814567890', '', '1992-09-22', 'Civil Lines, Ludhiana', 'XXXX-XXXX-3311', 'PB-10-2015009123', 'HGV', '2034-09-21', 8, 'None', 'Punjab', 'Ludhiana', 'Samrala, Khanna', 'Punjabi, Hindi, English', 'Self', 'Truck', 'PB-10-XY-9988', 8500.0, 1, 0, 1, 'Day', 'ACTIVE', ?)
    """, (ag1_id, now))

    # 6. BUYERS
    cursor.execute("""
    INSERT INTO buyers (user_id, full_name, email, phone, state, district, city_village, pincode, street_address, buyer_type, business_name, gstin, preferred_language, payment_mode, alert_channel, created_at)
    VALUES (?, 'Aditi Sharma', 'aditi.sharma@gmail.com', '+919841234567', 'Tamil Nadu', 'Chennai', 'Adyar', '600020', 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar', 'Retail Consumer', '', '', 'English', 'UPI', 'WhatsApp', ?),
           (?, 'Chef Sundar Rajan', 'chef@annamayya.com', '+919843110022', 'Tamil Nadu', 'Coimbatore', 'RS Puram', '641002', '18 West Club Road, RS Puram', 'Restaurant', 'Annam Traditional Kitchens', '33AABCA9081B1ZM', 'Tamil', 'Net Banking', 'Email', ?)
    """, (inserted_user_ids['aditi.sharma@gmail.com'], now, inserted_user_ids['chef@annamayya.com'], now))

    # 7. ORDERS & ESCROW
    # Order 1: Active In-Transit Order - PICKED_UP stage (Live Tracking available to Buyer)
    # Ramasamy Turmeric -> Aditi Sharma in Chennai
    order1_id = 'VIV-ORD-88120'
    cursor.execute("""
    INSERT INTO orders (
        id, buyer_id, buyer_name, buyer_phone, farmer_id, farmer_name,
        product_id, product_name, quantity, unit, unit_price, total_amount,
        delivery_fee, delivery_address, delivery_state, delivery_district,
        delivery_pincode, delivery_type, preferred_date, preferred_time,
        driver_notes, payment_method, payment_status, order_status,
        agency_id, agency_name, driver_id, driver_name, delivery_otp,
        pickup_lat, pickup_lng, delivery_lat, delivery_lng,
        driver_lat, driver_lng, last_gps_update, tracking_active,
        tracking_phase, simulation_progress, accepted_at, collected_at, created_at
    ) VALUES (
        ?, 1, 'Aditi Sharma', '+919841234567', ?, 'Ramasamy Gounder',
        'PRD-88210', 'Salem Pure Organic Turmeric (Haldi)', 10.0, 'kg', 160.0, 1750.0,
        150.0, 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar, Chennai', 'Tamil Nadu', 'Chennai',
        '600020', 'Express', '2026-09-18', 'Morning',
        'Please call before arrival. Gate code 4092.', 'UPI', 'PAID', 'PICKED_UP',
        ?, 'GreenCorridor Agro Logistics', 'VIV-DR-104582', 'Murugan K', '4819',
        11.6643, 78.1460, 13.0012, 80.2565,
        12.6500, 79.6000, ?, 1,
        'TO_BUYER', 0.55, ?, ?, ?
    )
    """, (order1_id, f1_id, ag1_id, now, now, now, now))

    cursor.execute("""
    INSERT INTO payments_escrow (order_id, total_amount, farmer_amount, agency_fee, platform_fee, status, transaction_ref, paid_at)
    VALUES (?, 1750.0, 1500.0, 150.0, 100.0, 'HELD_IN_ESCROW', 'TXN-RAZOR-8841920', ?)
    """, (order1_id, now))

    # Order 3: Active Order - ACCEPTED stage (Driver on way to Farmer, Buyer CANNOT track yet)
    order3_id = 'VIV-ORD-88121'
    cursor.execute("""
    INSERT INTO orders (
        id, buyer_id, buyer_name, buyer_phone, farmer_id, farmer_name,
        product_id, product_name, quantity, unit, unit_price, total_amount,
        delivery_fee, delivery_address, delivery_state, delivery_district,
        delivery_pincode, delivery_type, preferred_date, preferred_time,
        driver_notes, payment_method, payment_status, order_status,
        agency_id, agency_name, driver_id, driver_name, delivery_otp,
        pickup_lat, pickup_lng, delivery_lat, delivery_lng,
        driver_lat, driver_lng, last_gps_update, tracking_active,
        tracking_phase, simulation_progress, accepted_at, created_at
    ) VALUES (
        ?, 1, 'Aditi Sharma', '+919841234567', ?, 'Ramasamy Gounder',
        'PRD-88211', 'Ponni Boiled Rice (Old Harvest)', 1.0, 'Quintal', 3400.0, 3650.0,
        250.0, 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar, Chennai', 'Tamil Nadu', 'Chennai',
        '600020', 'Standard', '2026-09-18', 'Evening',
        'Deliver to security desk.', 'UPI', 'PAID', 'ACCEPTED',
        ?, 'GreenCorridor Agro Logistics', 'VIV-DR-104582', 'Murugan K', '6291',
        11.6643, 78.1460, 13.0012, 80.2565,
        11.7500, 78.1000, ?, 1,
        'TO_FARMER', 0.25, ?, ?
    )
    """, (order3_id, f1_id, ag1_id, now, now, now))

    cursor.execute("""
    INSERT INTO payments_escrow (order_id, total_amount, farmer_amount, agency_fee, platform_fee, status, transaction_ref, paid_at)
    VALUES (?, 3650.0, 3230.0, 250.0, 170.0, 'HELD_IN_ESCROW', 'TXN-RAZOR-8841921', ?)
    """, (order3_id, now))

    # Order 2: Completed & Delivered Order
    order2_id = 'VIV-ORD-77401'
    cursor.execute("""
    INSERT INTO orders (
        id, buyer_id, buyer_name, buyer_phone, farmer_id, farmer_name,
        product_id, product_name, quantity, unit, unit_price, total_amount,
        delivery_fee, delivery_address, delivery_state, delivery_district,
        delivery_pincode, delivery_type, preferred_date, preferred_time,
        driver_notes, payment_method, payment_status, order_status,
        agency_id, agency_name, driver_id, driver_name, delivery_otp,
        pickup_lat, pickup_lng, delivery_lat, delivery_lng,
        driver_lat, driver_lng, last_gps_update, tracking_active,
        tracking_phase, simulation_progress, created_at, delivered_at
    ) VALUES (
        ?, 2, 'Chef Sundar Rajan', '+919843110022', ?, 'Ramasamy Gounder',
        'PRD-88211', 'Ponni Boiled Rice (Old Harvest)', 5.0, 'Quintal', 3400.0, 17500.0,
        500.0, '18 West Club Road, RS Puram, Coimbatore', 'Tamil Nadu', 'Coimbatore',
        '641002', 'Standard', '2026-09-14', 'Morning',
        'Restaurant kitchen back door delivery.', 'Net Banking', 'PAID', 'DELIVERED',
        ?, 'KrishiExpress Rural Transport', 'VIV-DR-104582', 'Murugan K', '9034',
        11.6643, 78.1460, 11.0168, 76.9558,
        11.0168, 76.9558, '2026-09-15T11:45:00', 0,
        'ENDED', 1.0, '2026-09-14T08:30:00', '2026-09-15T11:45:00'
    )
    """, (order2_id, f1_id, ag2_id))

    cursor.execute("""
    INSERT INTO payments_escrow (order_id, total_amount, farmer_amount, agency_fee, platform_fee, status, transaction_ref, paid_at, settled_at)
    VALUES (?, 17500.0, 16200.0, 800.0, 500.0, 'SETTLED', 'TXN-RAZOR-7729103', '2026-09-14T08:35:00', '2026-09-15T12:00:00')
    """, (order2_id,))

    cursor.execute("""
    INSERT INTO reviews (order_id, buyer_name, farmer_id, farmer_rating, product_quality_rating, listing_accuracy_rating, farmer_review, agency_id, agency_rating, delivery_timeliness_rating, professionalism_rating, agency_review, created_at)
    VALUES (?, 'Chef Sundar Rajan', ?, 5, 5, 5, 'Superb authentic Ponni rice quality! Fluffy grains, perfect aroma for our traditional dining menus. Direct from Ramasamy ji.', ?, 5, 5, 5, 'Timely transport by KrishiExpress. Neatly stacked 1-quintal jute sacks without tearing.', '2026-09-15T14:30:00')
    """, (order2_id, f1_id, ag2_id))

    # 8. NOTIFICATIONS
    notifications_data = [
        (2, 'FARMER', 'VIVAAN ID Verified & Generated', 'Your identity and land records for Survey 14/2B have been verified. Your permanent VIVAAN ID is VIV-FR-104582.', 'SUCCESS', now),
        (2, 'FARMER', 'New Order Received', 'Order VIV-ORD-88120 for 10 kg Turmeric has been placed by Aditi Sharma. Pickup assigned to GreenCorridor Logistics.', 'ORDER', now),
        (6, 'AGENCY', 'Agency Verified - State Level', 'Your corporate footprint across 3 states was approved. Blue State Level ID Card VIV-AG-104582 issued.', 'SUCCESS', now),
        (6, 'AGENCY', 'New Transit Assignment', 'Driver Murugan K assigned to Order VIV-ORD-88120. En route to Salem pickup point.', 'INFO', now),
        (11, 'BUYER', 'Order Confirmed - Driver Assigned', 'Your order VIV-ORD-88120 is out for delivery! Driver Murugan K is en route. Your secret delivery OTP is 4819. Share with driver only on package handover.', 'ORDER', now)
    ]

    cursor.executemany("""
    INSERT INTO notifications (user_id, role, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
    """, notifications_data)

    # 9. AUDIT LOGS
    audit_data = [
        (1, 'ADMIN', 'APPROVE_FARMER_KYC', 'Farmer VIV-FR-104582', 'Verified Patta 4821/2021 against land ledger. Issued Farmer ID card.', now),
        (1, 'ADMIN', 'VERIFY_AGENCY_TIER', 'Agency VIV-AG-104582', 'Verified fleet of 30 commercial vehicles & 3 states coverage. Assigned Blue State Tier.', now),
        (1, 'ADMIN', 'RELEASE_ESCROW_PAYMENT', 'Order VIV-ORD-77401', 'Released ₹16,200 to farmer Ramasamy SBI account upon OTP delivery proof.', now)
    ]

    cursor.executemany("""
    INSERT INTO audit_logs (user_id, role, action, target, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, audit_data)

    conn.commit()
    conn.close()
    print("VIVAAN demo database seeded with rich Indian agricultural records!")

if __name__ == '__main__':
    seed()
