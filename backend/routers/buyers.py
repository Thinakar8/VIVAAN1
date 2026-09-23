"""
VIVAAN Buyer & Marketplace Router
Handles Product Catalog Search, Privacy-Preserving Details, Buyer Profile, and Saved Items.
"""
from fastapi import APIRouter, HTTPException, Query
from database import get_db
from typing import Optional

router = APIRouter(prefix="/api/buyers", tags=["buyers"])

@router.get("/products")
def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "popular"
):
    """
    Powerful Search Engine with Farmer Privacy Protection.
    Does NOT expose exact coordinates, home address, bank info, or government KYC.
    """
    conn = get_db()
    cursor = conn.cursor()

    sql = """
    SELECT p.id, p.farmer_id, p.vivaan_farmer_id, p.farmer_name, p.title, p.category,
           p.quantity, p.available_quantity, p.unit, p.price_per_unit, p.harvest_date,
           p.photo_url, p.description, p.quality_info, p.city, p.district, p.state, p.is_active,
           f.status as farmer_verification_status
    FROM products p
    JOIN farmers f ON f.id = p.farmer_id
    WHERE p.is_active = 1
    """
    params = []

    if query:
        q = f"%{query}%"
        sql += " AND (p.title LIKE ? OR p.category LIKE ? OR p.farmer_name LIKE ? OR p.district LIKE ? OR p.state LIKE ?)"
        params.extend([q, q, q, q, q])

    if category and category.lower() != "all":
        sql += " AND LOWER(p.category) = LOWER(?)"
        params.append(category)

    if state and state.lower() != "all":
        sql += " AND LOWER(p.state) = LOWER(?)"
        params.append(state)

    if district and district.lower() != "all":
        sql += " AND LOWER(p.district) = LOWER(?)"
        params.append(district)

    if max_price:
        sql += " AND p.price_per_unit <= ?"
        params.append(max_price)

    if sort_by == "price_low":
        sql += " ORDER BY p.price_per_unit ASC"
    elif sort_by == "price_high":
        sql += " ORDER BY p.price_per_unit DESC"
    elif sort_by == "fresh":
        sql += " ORDER BY p.harvest_date DESC"
    else:
        sql += " ORDER BY p.available_quantity DESC"

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    products_list = []
    for r in rows:
        item = dict(r)
        # Approximate distance placeholder based on district
        item['estimated_delivery'] = "1 - 2 Days via Verified VIVAAN Logistics"
        products_list.append(item)

    return {"success": True, "count": len(products_list), "products": products_list}

@router.get("/products/{product_id}")
def get_product_details(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT p.*, f.status as farmer_verification_status, f.farmer_type,
           l.land_extent, l.soil_type
    FROM products p
    JOIN farmers f ON f.id = p.farmer_id
    JOIN land_records l ON l.farmer_id = f.id
    WHERE p.id = ?
    """, (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    p = dict(row)
    # Mask private fields explicitly
    return {
        "success": True,
        "product": {
            "id": p['id'],
            "title": p['title'],
            "category": p['category'],
            "price_per_unit": p['price_per_unit'],
            "available_quantity": p['available_quantity'],
            "unit": p['unit'],
            "harvest_date": p['harvest_date'],
            "photo_url": p['photo_url'],
            "description": p['description'],
            "quality_info": p['quality_info'],
            "approximate_location": f"{p['city']}, {p['district']}, {p['state']}",
            "farmer_name": p['farmer_name'],
            "vivaan_farmer_id": p['vivaan_farmer_id'],
            "farmer_type": p['farmer_type'].replace("_", " ").title(),
            "verification_status": p['farmer_verification_status'],
            "soil_type": p['soil_type'],
            "estimated_transit": "Direct farmgate pickup -> Buyer doorstep with temperature check"
        }
    }

@router.get("/{buyer_id}/profile")
def get_buyer_profile(buyer_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM buyers WHERE id = ?", (buyer_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Buyer profile not found")
    return {"success": True, "profile": dict(row)}
