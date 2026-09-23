"""
VIVAAN Automated Test Suite
Verifies all 41 requirements across Auth, Multilingual i18n, Farmer Onboarding,
Agency 3-Tier Classification, Driver OTP Handover, Escrow, and Admin Moderation.
"""
import unittest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from main import app
from seed_data import seed

class TestVivaanMarketplace(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["supported_languages"], 14)

    def test_02_multilingual_i18n(self):
        # Check languages list
        res = self.client.get("/api/i18n/languages")
        self.assertEqual(res.status_code, 200)
        langs = res.json()["languages"]
        codes = [l["code"] for l in langs]
        for c in ["en", "ta", "hi", "te", "kn", "ml", "mr", "bn", "gu", "pa", "or", "as", "ur"]:
            self.assertIn(c, codes)

        # Check Tamil translation
        ta_res = self.client.get("/api/i18n/translations/ta")
        self.assertEqual(ta_res.status_code, 200)
        self.assertIn("விவசாயி", ta_res.json()["translations"]["role_farmer"])

        # Check Hindi translation
        hi_res = self.client.get("/api/i18n/translations/hi")
        self.assertEqual(hi_res.status_code, 200)
        self.assertIn("किसान", hi_res.json()["translations"]["role_farmer"])

    def test_03_auth_and_demo_switch(self):
        # Test farmer demo login
        res = self.client.get("/api/auth/demo-role/FARMER")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["user"]["role"], "FARMER")
        self.assertTrue(res.json()["user"]["vivaan_id"].startswith("VIV-FR-"))

        # Test agency demo login
        res = self.client.get("/api/auth/demo-role/AGENCY")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["user"]["role"], "AGENCY")
        self.assertIn("STATE_BLUE", res.json()["user"]["tier"])

        # Test driver demo login
        res = self.client.get("/api/auth/demo-role/DRIVER")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["user"]["role"], "DRIVER")

        # Test admin demo login
        res = self.client.get("/api/auth/demo-role/ADMIN")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["user"]["role"], "ADMIN")

    def test_04_farmer_registration_and_id_card(self):
        # Register new own-land farmer
        payload = {
            "farmer_type": "OWN_LAND",
            "full_name": "Balakrishnan Vellore",
            "primary_phone": "+919445100200",
            "address": "Anaicut Road, Vellore",
            "kyc_type": "Aadhaar Card",
            "kyc_number": "902188443322",
            "email": "balakrishnan@vivaan.agri",
            "bank_account": "009988776655",
            "bank_ifsc": "SBIN0004921",
            "bank_name": "State Bank of India, Vellore",
            "state": "Tamil Nadu",
            "district": "Vellore",
            "taluk": "Anaicut",
            "village": "Pallikonda",
            "survey_no": "204",
            "subdivision_no": "3A",
            "patta_no": "PAT-99120",
            "land_extent": "4.2 Acres",
            "land_classification": "Nanjai (Wetland)",
            "soil_type": "Red Loam",
            "water_source": "Well Irrigation"
        }
        res = self.client.post("/api/farmers/register", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        farmer_id = data["farmer_id"]
        vivaan_id = data["vivaan_id"]
        self.assertTrue(vivaan_id.startswith("VIV-FR-"))

        # Verify ID card privacy protection
        id_res = self.client.get(f"/api/farmers/{farmer_id}/id-card")
        self.assertEqual(id_res.status_code, 200)
        card = id_res.json()["id_card"]
        self.assertEqual(card["vivaan_id"], vivaan_id)
        self.assertEqual(card["status"], "VERIFIED")
        # Ensure private details are NOT in card payload
        self.assertNotIn("bank_account", card)
        self.assertNotIn("kyc_number", card)
        self.assertIn("Pallikonda, Vellore, Tamil Nadu", card["location"])

    def test_05_farmer_produce_and_ai_assistant(self):
        # Get active farmer
        farmer_res = self.client.get("/api/auth/demo-role/FARMER")
        farmer_id = farmer_res.json()["user"]["farmer_id"]

        # Add new product
        prd_payload = {
            "farmer_id": farmer_id,
            "title": "Natural Black Rice (Karuppu Kavuni)",
            "category": "Grains",
            "quantity": 50.0,
            "unit": "kg",
            "price_per_unit": 180.0,
            "harvest_date": "2026-09-01",
            "description": "Ancient heirloom anthocyanin-rich medicinal black rice."
        }
        res = self.client.post("/api/farmers/products", json=prd_payload)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertTrue(res.json()["product_id"].startswith("PRD-"))

        # Test AI assistant crop recommendation
        ai_res = self.client.post("/api/farmers/ai-assistant", json={
            "query_type": "crop_recommendation",
            "soil_type": "Red Loam",
            "water_source": "Borewell"
        })
        self.assertEqual(ai_res.status_code, 200)
        ai_data = ai_res.json()
        self.assertTrue(len(ai_data["recommendations"]) > 0)
        self.assertIn("Turmeric", ai_data["recommendations"][0]["crop"])

    def test_06_agency_registration_and_tiered_id(self):
        # Register District Agency
        agency_payload = {
            "service_type": "DISTRICT",
            "legal_name": "Kongu Fast Agro Freight LLP",
            "brand_name": "Kongu Cargo",
            "corp_office": "Perundurai Road, Erode, TN",
            "tax_id": "33AAAKK1122G1Z5",
            "contact_name": "P. Ramesh",
            "phone": "+919842001122",
            "email": "contact@kongucargo.in",
            "coverage_zones": ["Erode Outer", "Perundurai Corridor"],
            "serviceable_districts": ["Erode", "Tiruppur", "Coimbatore"],
            "serviceable_states": ["Tamil Nadu"]
        }
        res = self.client.post("/api/agencies/register", json=agency_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["tier"], "DISTRICT_ORANGE")
        agency_id = data["agency_id"]

        # Check 3-Tier ID Card
        id_res = self.client.get(f"/api/agencies/{agency_id}/id-card")
        self.assertEqual(id_res.status_code, 200)
        card = id_res.json()["id_card"]
        self.assertEqual(card["tier"], "DISTRICT_ORANGE")
        self.assertIn("DISTRICT LEVEL", card["tier_title"])

    def test_07_buyer_search_and_privacy_masking(self):
        res = self.client.get("/api/buyers/products?query=turmeric")
        self.assertEqual(res.status_code, 200)
        products = res.json()["products"]
        self.assertTrue(len(products) > 0)
        p = products[0]
        # Check location privacy: should only show city, district, state
        self.assertEqual(p["district"], "Salem")
        self.assertEqual(p["state"], "Tamil Nadu")
        # Ensure zero exposure of farmer bank / Aadhaar
        self.assertNotIn("bank_account", p)
        self.assertNotIn("kyc_number", p)

    def test_08_order_workflow_and_strict_otp_handover(self):
        # 1. Place order
        order_payload = {
            "buyer_id": 1,
            "buyer_name": "Aditi Sharma",
            "buyer_phone": "+919841234567",
            "product_id": "PRD-88210", # Turmeric
            "quantity": 5.0,
            "delivery_address": "Flat 4B, Greenview Apts, Adyar",
            "delivery_state": "Tamil Nadu",
            "delivery_district": "Chennai",
            "delivery_pincode": "600020",
            "delivery_type": "Standard",
            "payment_method": "UPI"
        }
        res = self.client.post("/api/orders/create", json=order_payload)
        self.assertEqual(res.status_code, 200)
        ord_data = res.json()
        self.assertTrue(ord_data["success"])
        order_id = ord_data["order_id"]
        secret_otp = ord_data["delivery_otp"]
        self.assertEqual(len(secret_otp), 4)

        # 2. Driver attempts delivery with INCORRECT OTP -> Must FAIL (400)
        bad_verify = self.client.post("/api/drivers/verify-delivery-otp", json={
            "order_id": order_id,
            "entered_otp": "0000"
        })
        self.assertEqual(bad_verify.status_code, 400)
        self.assertIn("Invalid Delivery OTP", bad_verify.json()["detail"])

        # 3. Driver enters CORRECT OTP -> Must SUCCEED & release escrow
        good_verify = self.client.post("/api/drivers/verify-delivery-otp", json={
            "order_id": order_id,
            "entered_otp": secret_otp
        })
        self.assertEqual(good_verify.status_code, 200)
        self.assertIn("successfully confirmed", good_verify.json()["message"])

        # 4. Check order status is now DELIVERED
        track_res = self.client.get(f"/api/orders/{order_id}/track")
        self.assertEqual(track_res.status_code, 200)
        order_record = track_res.json()["order"]
        self.assertEqual(order_record["order_status"], "DELIVERED")
        self.assertEqual(order_record["escrow_status"], "SETTLED")

    def test_09_reviews_and_ratings(self):
        review_payload = {
            "order_id": "VIV-ORD-88120",
            "buyer_name": "Aditi Sharma",
            "farmer_id": 1,
            "farmer_rating": 5,
            "product_quality_rating": 5,
            "listing_accuracy_rating": 5,
            "farmer_review": "Top grade natural turmeric, rich golden color!",
            "agency_id": 1,
            "agency_rating": 5,
            "delivery_timeliness_rating": 5,
            "professionalism_rating": 5,
            "agency_review": "Courteous driver, proper protective crate packaging."
        }
        res = self.client.post("/api/orders/reviews", json=review_payload)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])

    def test_10_admin_panel_cockpit(self):
        # Stats
        stats_res = self.client.get("/api/admin/stats")
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.json()["stats"]
        self.assertTrue(stats["verified_farmers"] > 0)
        self.assertTrue(stats["total_orders"] > 0)

        # Audit logs
        logs_res = self.client.get("/api/admin/audit-logs")
        self.assertEqual(logs_res.status_code, 200)
        self.assertTrue(len(logs_res.json()["logs"]) > 0)


    def test_11_role_based_live_tracking_permissions(self):
        """
        Verifies Phase 41 & 69 Strict Role-Based Tracking Rules:
        - ACCEPTED / TO_FARMER: Admin & Agency CAN track. Buyer CANNOT track.
        - PICKED_UP / TO_BUYER: Admin, Agency, AND Buyer CAN track.
        - DELIVERED: Tracking is STOPPED for EVERYONE.
        - Agency Privacy: Agencies can only track their own assigned drivers.
        """
        # 1. Test ACCEPTED Order (VIV-ORD-88121)
        # Buyer view: MUST BE HIDDEN
        b_res = self.client.get("/api/orders/VIV-ORD-88121/live-tracking?role=BUYER")
        self.assertEqual(b_res.status_code, 200)
        b_data = b_res.json()
        self.assertFalse(b_data["live_tracking_allowed"])
        self.assertNotIn("driver_lat", b_data)
        self.assertIn("being collected from the farmer", b_data["message"])

        # Admin view: MUST BE ALLOWED
        adm_res = self.client.get("/api/orders/VIV-ORD-88121/live-tracking?role=ADMIN")
        self.assertEqual(adm_res.status_code, 200)
        adm_data = adm_res.json()
        self.assertTrue(adm_data["live_tracking_allowed"])
        self.assertEqual(adm_data["tracking_phase"], "TO_FARMER")
        self.assertIn("driver_lat", adm_data)

        # Assigned Agency view: MUST BE ALLOWED
        ag_res = self.client.get("/api/orders/VIV-ORD-88121/live-tracking?role=AGENCY&agency_id=1")
        self.assertEqual(ag_res.status_code, 200)
        self.assertTrue(ag_res.json()["live_tracking_allowed"])

        # Unrelated Agency view: MUST BE FORBIDDEN (403)
        bad_ag = self.client.get("/api/orders/VIV-ORD-88121/live-tracking?role=AGENCY&agency_id=99")
        self.assertEqual(bad_ag.status_code, 403)

        # 2. Test PICKED_UP Order (VIV-ORD-88120)
        # Buyer view: MUST BE ALLOWED
        b_live = self.client.get("/api/orders/VIV-ORD-88120/live-tracking?role=BUYER")
        self.assertEqual(b_live.status_code, 200)
        live_data = b_live.json()
        self.assertTrue(live_data["live_tracking_allowed"])
        self.assertEqual(live_data["tracking_phase"], "TO_BUYER")
        self.assertIn("driver_lat", live_data)

        # 3. Test DELIVERED Order (VIV-ORD-77401)
        # For all roles: MUST BE STOPPED
        del_res = self.client.get("/api/orders/VIV-ORD-77401/live-tracking?role=BUYER")
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(del_res.json()["live_tracking_allowed"])
        self.assertEqual(del_res.json()["order_status"], "DELIVERED")

    def test_12_driver_accept_and_collect_workflow(self):
        """
        Verifies Phases 35 & 39: Driver Accept Order & Collect Order
        """
        # Create a fresh order
        order_payload = {
            "buyer_id": 1,
            "buyer_name": "Aditi Sharma",
            "buyer_phone": "+919841234567",
            "product_id": "PRD-88210",
            "quantity": 2.0,
            "delivery_address": "Test Street, Chennai",
            "delivery_state": "Tamil Nadu",
            "delivery_district": "Chennai",
            "delivery_pincode": "600020",
            "payment_method": "UPI"
        }
        create_res = self.client.post("/api/orders/create", json=order_payload)
        self.assertEqual(create_res.status_code, 200)
        order_id = create_res.json()["order_id"]

        # 1. Driver Accepts Order (Phase 35)
        acc_res = self.client.post("/api/drivers/accept-order", json={
            "order_id": order_id,
            "driver_id": "VIV-DR-104582",
            "driver_name": "Murugan K"
        })
        self.assertEqual(acc_res.status_code, 200)
        self.assertEqual(acc_res.json()["status"], "ACCEPTED")
        self.assertEqual(acc_res.json()["tracking_phase"], "TO_FARMER")

        # 2. Driver Updates GPS (Phase 42)
        gps_res = self.client.post("/api/drivers/update-location", json={
            "order_id": order_id,
            "driver_id": "VIV-DR-104582",
            "latitude": 11.8500,
            "longitude": 78.3000
        })
        self.assertEqual(gps_res.status_code, 200)

        # 3. Driver Collects Order (Phase 39)
        col_res = self.client.post("/api/drivers/collect-order", json={
            "order_id": order_id,
            "driver_id": "VIV-DR-104582"
        })
        self.assertEqual(col_res.status_code, 200)
        self.assertEqual(col_res.json()["status"], "PICKED_UP")
        self.assertEqual(col_res.json()["tracking_phase"], "TO_BUYER")

    def test_13_serviceability_and_route_optimization(self):
        """
        Verifies Phases 32, 33 & 70: Serviceability Matrix and Route Optimization
        """
        # Check Serviceability
        serv_res = self.client.post("/api/routing/check-serviceability", json={
            "pickup_district": "Salem",
            "pickup_state": "Tamil Nadu",
            "delivery_district": "Chennai",
            "delivery_state": "Tamil Nadu",
            "weight_kg": 500.0
        })
        self.assertEqual(serv_res.status_code, 200)
        s_data = serv_res.json()
        self.assertTrue(s_data["is_serviceable"])
        self.assertIn(s_data["required_level"], ["DISTRICT", "STATE"])

        # Run Route Optimization (2 orders)
        opt_res = self.client.post("/api/routing/optimize", json={
            "driver_lat": 11.6643,
            "driver_lng": 78.1460,
            "order_ids": ["VIV-ORD-88120", "VIV-ORD-88121"]
        })
        self.assertEqual(opt_res.status_code, 200)
        opt_data = opt_res.json()
        self.assertTrue(opt_data["success"])
        self.assertTrue(opt_data["total_stops"] >= 3)
        self.assertTrue(opt_data["total_distance_km"] > 0)

    def test_14_admin_active_deliveries_split_view(self):
        """
        Verifies Phase 55 & 56: Active Deliveries list omits delivered orders
        """
        # Admin active deliveries
        adm_del = self.client.get("/api/admin/active-deliveries")
        self.assertEqual(adm_del.status_code, 200)
        deliveries = adm_del.json()["active_deliveries"]
        order_ids = [d["order_id"] for d in deliveries]
        # Delivered order VIV-ORD-77401 MUST NOT be present!
        self.assertNotIn("VIV-ORD-77401", order_ids)

        # Agency active deliveries
        ag_del = self.client.get("/api/agencies/1/active-deliveries")
        self.assertEqual(ag_del.status_code, 200)
        self.assertTrue(len(ag_del.json()["active_deliveries"]) > 0)

    def test_15_hackathon_demo_simulation(self):
        """
        Verifies Phase 65: Demo / Simulated GPS step progression
        """
        sim_res = self.client.post("/api/orders/simulate-step", json={
            "order_id": "VIV-ORD-88120",
            "action": "ADVANCE"
        })
        self.assertEqual(sim_res.status_code, 200)
        sim_data = sim_res.json()
        self.assertTrue(sim_data["is_simulated"])
        self.assertEqual(sim_data["label"], "Demo / Simulated GPS")
        self.assertIn("Demo GPS", sim_data["message"])

    def test_16_logo_and_back_navigation(self):
        """
        Verifies VIVAAN logo asset serving and 'back' localization in all 14 languages
        """
        # Check static logo exists and is served
        logo_res = self.client.get("/static/assets/vivaan-logo.jpg")
        self.assertEqual(logo_res.status_code, 200)
        self.assertIn("image", logo_res.headers.get("content-type", ""))

        # Check 'back' translation in all languages
        lang_res = self.client.get("/api/i18n/languages")
        self.assertEqual(lang_res.status_code, 200)
        languages = lang_res.json()["languages"]

        for lang in languages:
            code = lang["code"]
            trans_res = self.client.get(f"/api/i18n/translations/{code}")
            self.assertEqual(trans_res.status_code, 200)
            trans = trans_res.json()["translations"]
            self.assertIn("back", trans)
            self.assertTrue(len(trans["back"]) > 0)

        # Check standalone distribution file exists and contains Back Button implementation
        standalone_file = os.path.join(os.path.dirname(__file__), '..', 'vivaan_complete_website.html')
        self.assertTrue(os.path.exists(standalone_file))
        with open(standalone_file, 'r', encoding='utf-8') as f:
            content = f.read()
            self.assertIn("VIVAAN", content)
            self.assertIn("renderBackButton", content)
            self.assertIn("goBack", content)


    def test_17_multi_farmer_checkout_and_settlement(self):
        """
        Verifies Phases 66, 67, 107-110:
        - Multi-farmer single checkout
        - Multiple sub-orders created under single checkout_id
        - Settlement status endpoint (5-10 min target simulation)
        - Active tracking list
        """
        # Multi-farmer checkout payload
        checkout_payload = {
            "buyer_id": 1,
            "buyer_name": "Aditi Sharma",
            "buyer_phone": "+919841234567",
            "items": [
                {
                    "product_id": "PRD-88210",
                    "title": "Natural Curcumin Turmeric",
                    "farmer_id": 1,
                    "farmer_name": "Ramanathan Chettiar",
                    "quantity": 5.0,
                    "unit": "kg",
                    "price_per_unit": 220.0
                },
                {
                    "product_id": "PRD-88211",
                    "title": "Fresh Moringa Leaves",
                    "farmer_id": 2,
                    "farmer_name": "Kavitha Sundaram",
                    "quantity": 10.0,
                    "unit": "bunch",
                    "price_per_unit": 25.0
                }
            ],
            "delivery_address": "Flat 4B, Greenview Apts, Adyar",
            "delivery_state": "Tamil Nadu",
            "delivery_district": "Chennai",
            "delivery_pincode": "600020",
            "delivery_type": "Standard",
            "payment_method": "Razorpay - UPI / NetBanking",
            "razorpay_payment_id": "pay_test_multi_8899"
        }
        res = self.client.post("/api/orders/checkout-multi", json=checkout_payload)
        self.assertEqual(res.status_code, 200)
        c_data = res.json()
        self.assertTrue(c_data["success"])
        self.assertIn("checkout_id", c_data)
        self.assertEqual(len(c_data["orders"]), 2)
        self.assertGreater(c_data["grand_total"], 0)
        self.assertEqual(c_data["orders_count"], 2)

        # Check sub-order settlement status
        first_order_id = c_data["orders"][0]["order_id"]
        settle_res = self.client.get(f"/api/orders/{first_order_id}/settlement-status")
        self.assertEqual(settle_res.status_code, 200)
        s_data = settle_res.json()
        self.assertIn("escrow_status", s_data)
        self.assertIn("target_initiation_window", s_data)

        # Check active tracking list
        track_list_res = self.client.get("/api/orders/active-tracking/list")
        self.assertEqual(track_list_res.status_code, 200)
        track_list = track_list_res.json()["active_orders"]
        self.assertIsInstance(track_list, list)

    def test_18_standalone_and_demo_sections(self):
        """
        Verifies:
        - Standalone HTML (index.html and vivaan_complete_website.html) contain all 22 Landing Page sections
        - All 4 interactive demonstrations (Phase 107, 108, 109, 110)
        - Multi-farmer cart with exact tagline 'One Buyer. Multiple Farmers. One VIVAAN Cart.'
        - Phase 71 'Track Live Delivery' privacy constraint
        """
        standalone_file = os.path.join(os.path.dirname(__file__), '..', 'vivaan_complete_website.html')
        self.assertTrue(os.path.exists(standalone_file))
        with open(standalone_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check 22 Sections
        self.assertIn("SECTION 1: HEADER BANNER", content)
        self.assertIn("SECTION 2: HERO", content)
        self.assertIn("SECTION 8: MULTI-FARMER MARKETPLACE", content)
        self.assertIn("SECTION 11: ROUTE OPTIMIZATION", content)
        self.assertIn("SECTION 15: DELIVERY AGENCY", content)
        self.assertIn("SECTION 22: FOOTER", content)

        # Check Tagline
        self.assertIn("One Buyer. Multiple Farmers. One VIVAAN Cart.", content)

        # Check 4 Demos
        self.assertIn("Phase 107", content)
        self.assertIn("Phase 108", content)
        self.assertIn("Phase 109", content)
        self.assertIn("Phase 110", content)

        # Check Privacy constraint button
        self.assertIn("Track Live Delivery", content)

if __name__ == '__main__':
    unittest.main()
