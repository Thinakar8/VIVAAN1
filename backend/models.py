"""
VIVAAN Pydantic Data Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List

class UserRegister(BaseModel):
    role: str
    name: str
    email: Optional[str] = None
    phone: str
    password: str

class UserLogin(BaseModel):
    identifier: str # Email, Phone, or VIVAAN ID (e.g. VIV-FR-104582)
    password: str

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None
    buyer_type: Optional[str] = "Retail Consumer"
    phone: Optional[str] = ""
    state: Optional[str] = ""
    district: Optional[str] = ""
    city_village: Optional[str] = ""
    pincode: Optional[str] = ""
    street_address: Optional[str] = ""
    business_name: Optional[str] = ""
    gstin: Optional[str] = ""
    preferred_language: Optional[str] = "English"

class FarmerRegisterRequest(BaseModel):
    farmer_type: str # 'OWN_LAND', 'LEASED_WITH_AGREEMENT', 'LEASED_WITHOUT_AGREEMENT'
    full_name: str
    primary_phone: str
    alt_phone: Optional[str] = ""
    address: str
    kyc_type: str
    kyc_number: str
    email: Optional[str] = ""
    bank_account: str
    bank_ifsc: str
    bank_name: str
    password: Optional[str] = "farmer123"
    # Land
    state: str
    district: str
    taluk: str
    village: str
    survey_no: str
    subdivision_no: str
    patta_no: str
    chitta_no: Optional[str] = ""
    land_extent: str
    land_classification: str
    soil_type: Optional[str] = "Red Loam"
    water_source: Optional[str] = "Borewell"
    # Lease
    leased_area: Optional[str] = ""
    landowner_name: Optional[str] = ""
    landowner_phone: Optional[str] = ""
    landowner_kyc: Optional[str] = ""
    lease_start: Optional[str] = ""
    lease_end: Optional[str] = ""
    duration_months: Optional[int] = 12
    cultivation_terms: Optional[str] = ""

class ProductCreateRequest(BaseModel):
    farmer_id: int
    title: str
    category: str
    quantity: float
    unit: str # 'kg', 'Quintal', 'Metric Ton', 'Litre', 'Pack', 'Piece'
    price_per_unit: float
    harvest_date: str
    photo_url: Optional[str] = ""
    description: Optional[str] = ""
    quality_info: Optional[str] = ""

class AgencyRegisterRequest(BaseModel):
    service_type: str # 'LOCAL', 'DISTRICT', 'STATE'
    legal_name: str
    brand_name: str
    corp_office: str
    tax_id: str
    contact_name: str
    phone: str
    email: str
    password: Optional[str] = "agency123"
    # Coverage
    coverage_zones: List[str] = []
    serviceable_districts: List[str] = []
    serviceable_states: List[str] = []
    no_go_zones: Optional[str] = ""
    unserviceable_locations: Optional[str] = ""
    # Fleet
    fleet: List[dict] = [] # [{vehicle_type: 'Pickup', count: 5, target_districts: 'Salem', ownership: 'Self'}]
    # Ops
    rural_transit_time: Optional[str] = "12 - 24 Hours"
    max_weight_kg: Optional[float] = 5000.0
    max_volume_cbm: Optional[float] = 20.0
    operating_hours: Optional[str] = "06:00 AM - 10:00 PM"
    supported_types: Optional[str] = "Standard, Fresh Agri Produce"

class DriverApplicationRequest(BaseModel):
    agency_id: int
    full_name: str
    phone: str
    alt_phone: Optional[str] = ""
    dob: Optional[str] = "1990-01-01"
    address: str
    aadhaar_no: Optional[str] = ""
    license_no: str
    license_class: str # 'LMV', 'HGV', '2-Wheeler'
    license_expiry: Optional[str] = "2032-12-31"
    experience_years: Optional[int] = 5
    criminal_record: Optional[str] = "None"
    home_state: str
    home_district: str
    familiar_taluk: Optional[str] = ""
    languages: Optional[str] = "English, Hindi"
    vehicle_owner: Optional[str] = "Self"
    vehicle_type: str # 'Bike', 'Pickup', 'Truck'
    vehicle_no: Optional[str] = ""
    max_weight_kg: Optional[float] = 1000.0
    smartphone_user: Optional[bool] = True
    cod_handling: Optional[bool] = True
    heavy_lifting: Optional[bool] = True
    shift: Optional[str] = "Flexible"

class OrderCreateRequest(BaseModel):
    buyer_id: int
    buyer_name: str
    buyer_phone: str
    product_id: str
    quantity: float
    delivery_address: str
    delivery_state: str
    delivery_district: str
    delivery_pincode: str
    delivery_type: Optional[str] = "Standard" # 'Standard', 'Express', 'Scheduled'
    preferred_date: Optional[str] = ""
    preferred_time: Optional[str] = "Morning"
    driver_notes: Optional[str] = ""
    payment_method: str # 'COD', 'UPI', 'CARD', 'NET_BANKING'

class VerifyDeliveryOtpRequest(BaseModel):
    order_id: str
    entered_otp: str
    driver_id: Optional[str] = ""

class ReviewSubmitRequest(BaseModel):
    order_id: str
    buyer_name: str
    farmer_id: int
    farmer_rating: int
    product_quality_rating: int
    listing_accuracy_rating: int
    farmer_review: Optional[str] = ""
    agency_id: Optional[int] = None
    agency_rating: Optional[int] = 5
    delivery_timeliness_rating: Optional[int] = 5
    professionalism_rating: Optional[int] = 5
    agency_review: Optional[str] = ""

class AIAdvisoryRequest(BaseModel):
    query_type: str # 'crop_recommendation', 'water_requirement', 'description_helper', 'unit_estimator', 'marketplace_procedures'
    soil_type: Optional[str] = "Red Loam"
    water_source: Optional[str] = "Borewell"
    season: Optional[str] = "Kharif"
    state: Optional[str] = "Tamil Nadu"
    crop_name: Optional[str] = ""
    details: Optional[str] = ""

class DriverAcceptRequest(BaseModel):
    order_id: str
    driver_id: str
    driver_name: Optional[str] = ""

class DriverCollectRequest(BaseModel):
    order_id: str
    driver_id: str

class DriverLocationUpdateRequest(BaseModel):
    order_id: str
    driver_id: str
    latitude: float
    longitude: float
    speed: Optional[float] = 42.5
    heading: Optional[float] = 85.0

class ServiceabilityCheckRequest(BaseModel):
    pickup_district: str
    pickup_state: str
    delivery_district: str
    delivery_state: str
    weight_kg: Optional[float] = 100.0

class RouteOptimizationRequest(BaseModel):
    driver_lat: float
    driver_lng: float
    order_ids: List[str]

class LandownerConsentRequest(BaseModel):
    farmer_id: int
    landowner_phone: str
    consent_otp: str
    agreed: Optional[bool] = True

class SimulateStepRequest(BaseModel):
    order_id: str
    action: Optional[str] = "AUTO" # 'ADVANCE', 'ACCEPT', 'COLLECT', 'DELIVER'

class MultiFarmerCartItem(BaseModel):
    product_id: str
    quantity: float

class MultiFarmerCheckoutRequest(BaseModel):
    buyer_id: int
    buyer_name: str
    buyer_phone: str
    items: List[MultiFarmerCartItem]
    delivery_address: str
    delivery_state: str
    delivery_district: str
    delivery_pincode: str
    delivery_type: Optional[str] = "Standard"
    preferred_date: Optional[str] = ""
    preferred_time: Optional[str] = "Morning"
    driver_notes: Optional[str] = ""
    payment_method: str = "UPI" # 'COD', 'UPI', 'CARD', 'NET_BANKING'
    payment_id: Optional[str] = "pay_simulated_razorpay"

class DeliveryBatchCreateRequest(BaseModel):
    driver_id: str
    agency_id: int
    vehicle_type: str
    max_weight_kg: float
    order_ids: List[str]

class BatchSimulateStepRequest(BaseModel):
    batch_id: str
    action: Optional[str] = "ADVANCE" # 'ACCEPT', 'COLLECT_STOP', 'ADVANCE', 'DELIVER_STOP'
    target_order_id: Optional[str] = None

