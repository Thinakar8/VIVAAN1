"""
VIVAAN Logistics Routing & Serviceability Engine
Implements Phases 32, 33, and 70:
- Intelligent Serviceability Matrix Calculation
- Level 1 Route Optimization (Driver -> Farmer -> Buyer)
- Level 2 Multi-Order Sequencing with strict Pickup-Before-Delivery Precedence
"""
from fastapi import APIRouter, HTTPException
from database import get_db
from models import ServiceabilityCheckRequest, RouteOptimizationRequest
import math

router = APIRouter(prefix="/api/routing", tags=["routing"])

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.post("/check-serviceability")
def check_serviceability(payload: ServiceabilityCheckRequest):
    """
    PHASE 32: Delivery Serviceability Matrix
    Calculates eligible delivery tiers and matching verified agencies.
    """
    conn = get_db()
    cursor = conn.cursor()

    same_state = (payload.pickup_state.strip().lower() == payload.delivery_state.strip().lower())
    same_district = same_state and (payload.pickup_district.strip().lower() == payload.delivery_district.strip().lower())

    if same_district:
        required_level = "LOCAL"
        tier_color = "LOCAL_GREEN"
        eligible_services = ["LOCAL", "DISTRICT", "STATE"]
    elif same_state:
        required_level = "DISTRICT"
        tier_color = "DISTRICT_ORANGE"
        eligible_services = ["DISTRICT", "STATE"]
    else:
        required_level = "STATE"
        tier_color = "STATE_BLUE"
        eligible_services = ["STATE"]

    # Query matching verified agencies
    placeholders = ",".join(["?"] * len(eligible_services))
    cursor.execute(f"""
    SELECT a.*, (SELECT COUNT(*) FROM drivers WHERE agency_id = a.id AND status = 'ACTIVE') as active_drivers
    FROM agencies a
    WHERE a.service_type IN ({placeholders}) AND a.status = 'VERIFIED' AND a.max_weight_kg >= ?
    ORDER BY CASE WHEN a.service_type = ? THEN 0 ELSE 1 END
    """, (*eligible_services, payload.weight_kg, required_level))
    agencies = cursor.fetchall()
    conn.close()

    agency_list = [dict(a) for a in agencies]

    return {
        "success": True,
        "is_serviceable": len(agency_list) > 0,
        "corridor_type": "Intra-District" if same_district else ("Intra-State" if same_state else "Inter-State"),
        "required_level": required_level,
        "tier_color": tier_color,
        "eligible_agencies_count": len(agency_list),
        "eligible_agencies": agency_list,
        "message": f"Serviceable via {required_level} logistics partners." if agency_list else "No verified carrier available for this corridor."
    }

@router.post("/optimize")
def optimize_multi_order_route(payload: RouteOptimizationRequest):
    """
    PHASE 33 & 70: Level 1 & Level 2 Route Optimization
    Calculates optimal sequencing honoring pickup-before-delivery constraints.
    """
    conn = get_db()
    cursor = conn.cursor()

    if not payload.order_ids:
        conn.close()
        raise HTTPException(status_code=400, detail="At least one order ID must be provided.")

    placeholders = ",".join(["?"] * len(payload.order_ids))
    cursor.execute(f"""
    SELECT id, product_name, quantity, unit, farmer_name, buyer_name,
           pickup_lat, pickup_lng, delivery_lat, delivery_lng,
           delivery_address, order_status, tracking_phase
    FROM orders
    WHERE id IN ({placeholders})
    """, tuple(payload.order_ids))
    orders = [dict(r) for r in cursor.fetchall()]
    conn.close()

    if not orders:
        raise HTTPException(status_code=404, detail="None of the specified orders were found.")

    # Driver starting coordinates
    curr_lat, curr_lng = payload.driver_lat, payload.driver_lng

    stops = []
    total_distance_km = 0.0

    if len(orders) == 1:
        o = orders[0]
        d1 = haversine_distance(curr_lat, curr_lng, o['pickup_lat'], o['pickup_lng'])
        d2 = haversine_distance(o['pickup_lat'], o['pickup_lng'], o['delivery_lat'], o['delivery_lng'])
        total_distance_km = round(d1 + d2, 2)

        stops = [
            {
                "stop_number": 1,
                "type": "DRIVER_ORIGIN",
                "label": "Driver Current Position",
                "lat": curr_lat,
                "lng": curr_lng,
                "distance_from_prev_km": 0.0
            },
            {
                "stop_number": 2,
                "type": "PICKUP",
                "order_id": o['id'],
                "label": f"Farmgate Pickup: {o['farmer_name']} ({o['product_name']})",
                "lat": o['pickup_lat'],
                "lng": o['pickup_lng'],
                "distance_from_prev_km": d1,
                "cargo": f"{o['quantity']} {o['unit']}"
            },
            {
                "stop_number": 3,
                "type": "DELIVERY",
                "order_id": o['id'],
                "label": f"Buyer Doorstep: {o['buyer_name']} ({o['delivery_address']})",
                "lat": o['delivery_lat'],
                "lng": o['delivery_lng'],
                "distance_from_prev_km": d2,
                "action": "Collect Delivery OTP"
            }
        ]
    else:
        # Multi-order TSP with precedence: Pickups must precede Deliveries
        pending_pickups = list(orders)
        eligible_deliveries = []
        visited_stops = [
            {
                "stop_number": 1,
                "type": "DRIVER_ORIGIN",
                "label": "Driver Current Location",
                "lat": curr_lat,
                "lng": curr_lng,
                "distance_from_prev_km": 0.0
            }
        ]

        last_lat, last_lng = curr_lat, curr_lng
        step_idx = 2

        while pending_pickups or eligible_deliveries:
            best_candidate = None
            best_dist = float('inf')
            candidate_type = None

            # Check nearest eligible pickup
            for p in pending_pickups:
                dist = haversine_distance(last_lat, last_lng, p['pickup_lat'], p['pickup_lng'])
                if dist < best_dist:
                    best_dist = dist
                    best_candidate = p
                    candidate_type = 'PICKUP'

            # Check nearest eligible delivery (only if already picked up)
            for d in eligible_deliveries:
                dist = haversine_distance(last_lat, last_lng, d['delivery_lat'], d['delivery_lng'])
                if dist < best_dist:
                    best_dist = dist
                    best_candidate = d
                    candidate_type = 'DELIVERY'

            if candidate_type == 'PICKUP':
                visited_stops.append({
                    "stop_number": step_idx,
                    "type": "PICKUP",
                    "order_id": best_candidate['id'],
                    "label": f"Pickup: {best_candidate['farmer_name']} ({best_candidate['product_name']})",
                    "lat": best_candidate['pickup_lat'],
                    "lng": best_candidate['pickup_lng'],
                    "distance_from_prev_km": best_dist,
                    "cargo": f"{best_candidate['quantity']} {best_candidate['unit']}"
                })
                pending_pickups.remove(best_candidate)
                eligible_deliveries.append(best_candidate)
            else:
                visited_stops.append({
                    "stop_number": step_idx,
                    "type": "DELIVERY",
                    "order_id": best_candidate['id'],
                    "label": f"Deliver to {best_candidate['buyer_name']}",
                    "lat": best_candidate['delivery_lat'],
                    "lng": best_candidate['delivery_lng'],
                    "distance_from_prev_km": best_dist,
                    "action": "OTP Handover Required"
                })
                eligible_deliveries.remove(best_candidate)

            total_distance_km += best_dist
            last_lat = visited_stops[-1]['lat']
            last_lng = visited_stops[-1]['lng']
            step_idx += 1

        stops = visited_stops

    est_transit_hours = (total_distance_km / 45.0) + (len(stops) - 1) * 0.25
    est_transit_minutes = int(est_transit_hours * 60)

    return {
        "success": True,
        "optimization_level": "Level 1" if len(orders) == 1 else "Level 2 Multi-Order Precedence",
        "orders_count": len(orders),
        "total_stops": len(stops),
        "total_distance_km": round(total_distance_km, 1),
        "estimated_travel_time": f"{est_transit_minutes // 60}h {est_transit_minutes % 60}m",
        "stops": stops,
        "polyline_coords": [[s['lat'], s['lng']] for s in stops]
    }
