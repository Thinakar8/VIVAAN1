/**
 * VIVAAN – Digital Agricultural Marketplace
 * Delivery AI & Route Optimization Service Layer
 * 
 * Supports:
 * - Driver Allocation & Vehicle Selection
 * - Multi-Order Consolidation (1 Buyer ordering from Multiple Farmers)
 * - Compatible Nearby Buyers Clustering
 * - Capacity Constraints: Weight, Volume, Priority, Coverage
 */

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Indian road curvature factor (typically 1.22x straight-line distance)
  return Math.round(straightLine * 1.22 * 10) / 10;
}

const VEHICLE_CATALOG = [
  {
    type: 'Two-wheeler',
    model_name: 'Hero Splendor / EV Cargo Bike',
    category: 'TWO_WHEELER',
    max_payload_kg: 40,
    max_volume_m3: 0.15,
    cold_chain_capable: false,
    fuel_efficiency_kmpl: 60.0,
    base_fare_rs: 40,
    per_km_rate_rs: 6,
    road_access: 'ALL_TERRAIN_VILLAGE_NARROW'
  },
  {
    type: 'Car',
    model_name: 'Maruti Eeco Cargo / Compact Car',
    category: 'CAR',
    max_payload_kg: 250,
    max_volume_m3: 1.2,
    cold_chain_capable: false,
    fuel_efficiency_kmpl: 19.5,
    base_fare_rs: 150,
    per_km_rate_rs: 10,
    road_access: 'ALL_TERRAIN_VILLAGE'
  },
  {
    type: 'Mini van',
    model_name: 'Tata Ace Mini-Van / Chhota Hathi',
    category: 'MINI_VAN',
    max_payload_kg: 850,
    max_volume_m3: 3.5,
    cold_chain_capable: false,
    fuel_efficiency_kmpl: 17.5,
    base_fare_rs: 250,
    per_km_rate_rs: 14,
    road_access: 'ALL_TERRAIN_VILLAGE'
  },
  {
    type: 'Pickup',
    model_name: 'Mahindra Bolero Maxi-Truck Pickup',
    category: 'PICKUP',
    max_payload_kg: 1500,
    max_volume_m3: 6.0,
    cold_chain_capable: true,
    fuel_efficiency_kmpl: 13.0,
    base_fare_rs: 450,
    per_km_rate_rs: 18,
    road_access: 'DISTRICT_AND_STATE_HIGHWAY'
  },
  {
    type: 'Truck',
    model_name: 'Eicher Pro 16-Ton Freight Hauler',
    category: 'TRUCK',
    max_payload_kg: 10000,
    max_volume_m3: 32.0,
    cold_chain_capable: true,
    fuel_efficiency_kmpl: 6.5,
    base_fare_rs: 1800,
    per_km_rate_rs: 38,
    road_access: 'NATIONAL_HIGHWAY_CORRIDOR'
  }
];

class RouteOptimizationService {
  /**
   * Driver Allocation Algorithm
   */
  allocateDriver({ order, available_drivers = [], target_district = 'Salem' }) {
    if (available_drivers.length === 0) {
      return {
        success: false,
        message: 'No available drivers registered currently',
        driver: null
      };
    }

    // Filter available/idle drivers
    const activeDrivers = available_drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'IDLE' || d.status === 'ON_DUTY');
    const pool = activeDrivers.length > 0 ? activeDrivers : available_drivers;

    // Score drivers based on proximity, familiar taluks, rating, vehicle compatibility
    const scored = pool.map(d => {
      let score = 50;
      const driverLat = d.current_lat || 11.6643;
      const driverLng = d.current_lng || 78.1460;
      const pickupLat = order.pickup_lat || 11.7401;
      const pickupLng = order.pickup_lng || 78.0406;
      const distance = haversineDistance(driverLat, driverLng, pickupLat, pickupLng);

      // Distance score (closer = higher)
      score += Math.max(0, 30 - Math.min(30, distance));

      // Rating bonus
      score += (Number(d.rating) || 4.8) * 4;

      // Experience bonus
      score += Math.min(10, (Number(d.experience_years) || 4) * 2);

      return {
        driver: d,
        distance_to_pickup_km: distance,
        allocation_score: Math.round(score)
      };
    });

    scored.sort((a, b) => b.allocation_score - a.allocation_score);
    const best = scored[0];

    return {
      success: true,
      meta: {
        demo_mode: true,
        model_engine: 'VIVAAN Fleet Dispatch & Proximity Allocator v2.4'
      },
      recommended_driver: {
        id: best.driver.vivaan_id || best.driver.id,
        name: best.driver.full_name || best.driver.name,
        phone: best.driver.phone,
        vehicle_type: best.driver.vehicle_type,
        vehicle_no: best.driver.vehicle_no,
        rating: best.driver.rating || 4.9,
        distance_to_pickup_km: best.distance_to_pickup_km,
        allocation_confidence_percent: Math.min(99, best.allocation_score)
      },
      ranked_candidates: scored.map(s => ({
        id: s.driver.vivaan_id || s.driver.id,
        name: s.driver.full_name || s.driver.name,
        score: s.allocation_score,
        distance_km: s.distance_to_pickup_km
      }))
    };
  }

  /**
   * Vehicle Selection Engine
   */
  selectVehicle({ total_weight_kg = 50, total_volume_m3 = 0.2, requires_cold_chain = false, distance_km = 100 }) {
    const weight = Number(total_weight_kg);
    const volume = Number(total_volume_m3);

    const candidates = VEHICLE_CATALOG.filter(v => {
      const weightFits = v.max_payload_kg >= weight;
      const volumeFits = v.max_volume_m3 >= volume;
      const coldChainFits = !requires_cold_chain || v.cold_chain_capable;
      return weightFits && volumeFits && coldChainFits;
    });

    const chosen = candidates.length > 0 ? candidates[0] : VEHICLE_CATALOG[VEHICLE_CATALOG.length - 1];

    const weightUtilPct = Math.round((weight / chosen.max_payload_kg) * 100 * 10) / 10;
    const volumeUtilPct = Math.round((volume / chosen.max_volume_m3) * 100 * 10) / 10;

    return {
      success: true,
      meta: {
        demo_mode: true,
        model_engine: 'VIVAAN Vehicle Fleet Sizing & Payload Solver v2.4'
      },
      selected_vehicle: chosen,
      utilization: {
        weight_utilization_percent: weightUtilPct,
        volume_utilization_percent: volumeUtilPct,
        status: weightUtilPct > 90 ? 'NEAR_CAPACITY' : 'OPTIMAL_HEADROOM'
      },
      cost_estimate: {
        base_fare: chosen.base_fare_rs,
        distance_fare: Math.round(distance_km * chosen.per_km_rate_rs),
        total_estimated_freight_rs: Math.round(chosen.base_fare_rs + (distance_km * chosen.per_km_rate_rs))
      },
      recommendation_rationale: requires_cold_chain
        ? 'Refrigerated ' + chosen.type + ' selected to protect perishable produce during transit.'
        : chosen.type + ' provides ideal payload fit with ' + (100 - weightUtilPct) + '% spare capacity for potential backhaul pickup.'
    };
  }

  /**
   * Multi-Order Consolidation Solver
   * Supports:
   * 1. One Buyer ordering from multiple farmers (Multi-pickup -> 1 delivery)
   * 2. Compatible nearby buyers clustering (1 or multiple pickups -> Multiple nearby drop-offs)
   * 3. Rigorous capacity checks (weight, volume, vehicle limits)
   */
  consolidateOrders({ orders = [], driver_lat = 11.6643, driver_lng = 78.1460, max_vehicle_type = 'Tata Ace Mini-Carrier' }) {
    const vehicle = VEHICLE_CATALOG.find(v => v.type.includes(max_vehicle_type)) || VEHICLE_CATALOG[0];

    // Compute cumulative weight and volume
    let cumulativeWeightKg = 0;
    let cumulativeVolumeM3 = 0;
    let containsPerishable = false;

    orders.forEach(o => {
      const w = Number(o.total_weight_kg || o.weight_kg || o.quantity || 15);
      const v = Number(o.total_volume_m3 || o.volume_m3 || (w * 0.0035)); // approx 0.0035 m3 per kg of produce
      cumulativeWeightKg += w;
      cumulativeVolumeM3 += v;
      if (o.is_perishable || (o.category && o.category.toLowerCase().includes('veg'))) {
        containsPerishable = true;
      }
    });

    cumulativeWeightKg = Math.round(cumulativeWeightKg * 10) / 10;
    cumulativeVolumeM3 = Math.round(cumulativeVolumeM3 * 1000) / 1000;

    const isWeightWithin = cumulativeWeightKg <= vehicle.max_payload_kg;
    const isVolumeWithin = cumulativeVolumeM3 <= vehicle.max_volume_m3;
    const canConsolidate = isWeightWithin && isVolumeWithin;

    // Detect Consolidation Scenarios
    const uniqueBuyers = [...new Set(orders.map(o => o.buyer_id || o.buyer_name || 'Buyer'))];
    const uniqueFarmers = [...new Set(orders.map(o => o.farmer_id || o.farmer_name || 'Farmer'))];

    let scenarioType = 'MULTI_STOP_STANDARD';
    if (uniqueBuyers.length === 1 && uniqueFarmers.length > 1) {
      scenarioType = 'ONE_BUYER_MULTI_FARMERS';
    } else if (uniqueBuyers.length > 1 && uniqueFarmers.length >= 1) {
      scenarioType = 'COMPATIBLE_NEARBY_BUYERS';
    }

    if (!canConsolidate) {
      return {
        success: false,
        feasibility: 'SPLIT_REQUIRED',
        scenario_type: scenarioType,
        reason: 'Consolidated cargo (' + cumulativeWeightKg + ' kg / ' + cumulativeVolumeM3 + ' m³) exceeds ' + vehicle.type + ' capacity (' + vehicle.max_payload_kg + ' kg / ' + vehicle.max_volume_m3 + ' m³).',
        action_required: 'Split into 2 dispatches or upgrade to Mahindra Bolero 1.5T.',
        metrics: {
          cumulative_weight_kg: cumulativeWeightKg,
          cumulative_volume_m3: cumulativeVolumeM3,
          vehicle_max_weight_kg: vehicle.max_payload_kg,
          vehicle_max_volume_m3: vehicle.max_volume_m3
        }
      };
    }

    // Build Precedence-Aware Multi-Stop Itinerary
    // RULE: All farmgate pickups MUST happen before buyer deliveries
    const itinerary = [];
    let currentLat = Number(driver_lat);
    let currentLng = Number(driver_lng);
    let totalConsolidatedDist = 0;
    let stopIndex = 1;

    // 1. Driver Origin
    itinerary.push({
      stop_number: stopIndex++,
      type: 'DRIVER_ORIGIN',
      title: 'Carrier Depot / Driver Origin',
      location: 'Salem Transport Nagar Logistics Hub',
      lat: currentLat,
      lng: currentLng,
      distance_km: 0,
      cargo_onboard_kg: 0
    });

    let currentLoad = 0;

    // 2. Pickups (Greedy Nearest Neighbor among pickups)
    const pendingPickups = orders.map(o => ({
      order_id: o.id || o.order_number,
      farmer_name: o.farmer_name || 'Farmer',
      product_name: o.product_name || 'Agricultural Produce',
      quantity: o.quantity || 10,
      unit: o.unit || 'kg',
      weight_kg: Number(o.total_weight_kg || o.weight_kg || o.quantity || 15),
      lat: Number(o.pickup_lat || 11.7401),
      lng: Number(o.pickup_lng || 78.0406),
      address: o.farmer_village ? o.farmer_village + ', Salem' : 'Salem Farmgate Hub'
    }));

    while (pendingPickups.length > 0) {
      let nearestIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < pendingPickups.length; i++) {
        const d = haversineDistance(currentLat, currentLng, pendingPickups[i].lat, pendingPickups[i].lng);
        if (d < minD) {
          minD = d;
          nearestIdx = i;
        }
      }

      const pick = pendingPickups.splice(nearestIdx, 1)[0];
      totalConsolidatedDist += minD;
      currentLoad += pick.weight_kg;

      itinerary.push({
        stop_number: stopIndex++,
        type: 'PICKUP',
        order_id: pick.order_id,
        title: 'Farmgate Pickup: ' + pick.farmer_name,
        commodity: pick.product_name + ' (' + pick.quantity + ' ' + pick.unit + ')',
        location: pick.address,
        lat: pick.lat,
        lng: pick.lng,
        leg_distance_km: minD,
        cargo_onboard_kg: currentLoad,
        action: 'Inspect harvest quality & seal consignment'
      });

      currentLat = pick.lat;
      currentLng = pick.lng;
    }

    // 3. Deliveries (Greedy Nearest Neighbor among drop-offs)
    const pendingDrops = orders.map(o => ({
      order_id: o.id || o.order_number,
      buyer_name: o.buyer_name || 'Buyer',
      delivery_address: o.delivery_address || 'Chennai Doorstep',
      weight_kg: Number(o.total_weight_kg || o.weight_kg || o.quantity || 15),
      lat: Number(o.delivery_lat || 13.0012),
      lng: Number(o.delivery_lng || 80.2565)
    }));

    while (pendingDrops.length > 0) {
      let nearestIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < pendingDrops.length; i++) {
        const d = haversineDistance(currentLat, currentLng, pendingDrops[i].lat, pendingDrops[i].lng);
        if (d < minD) {
          minD = d;
          nearestIdx = i;
        }
      }

      const drop = pendingDrops.splice(nearestIdx, 1)[0];
      totalConsolidatedDist += minD;
      currentLoad -= drop.weight_kg;

      itinerary.push({
        stop_number: stopIndex++,
        type: 'DELIVERY',
        order_id: drop.order_id,
        title: 'Doorstep Delivery: ' + drop.buyer_name,
        location: drop.delivery_address,
        lat: drop.lat,
        lng: drop.lng,
        leg_distance_km: minD,
        cargo_onboard_kg: Math.max(0, currentLoad),
        action: 'Verify 4-Digit Doorstep OTP'
      });

      currentLat = drop.lat;
      currentLng = drop.lng;
    }

    totalConsolidatedDist = Math.round(totalConsolidatedDist * 10) / 10;

    // Compute Savings vs Independent Separate Trips
    let totalSeparateDistance = 0;
    orders.forEach(o => {
      const pLat = Number(o.pickup_lat || 11.7401);
      const pLng = Number(o.pickup_lng || 78.0406);
      const dLat = Number(o.delivery_lat || 13.0012);
      const dLng = Number(o.delivery_lng || 80.2565);
      const dist = haversineDistance(driver_lat, driver_lng, pLat, pLng) + haversineDistance(pLat, pLng, dLat, dLng);
      totalSeparateDistance += dist;
    });
    totalSeparateDistance = Math.round(totalSeparateDistance * 10) / 10;

    const distanceSavedKm = Math.max(0, Math.round((totalSeparateDistance - totalConsolidatedDist) * 10) / 10);
    const fuelSavedPct = totalSeparateDistance > 0 ? Math.round((distanceSavedKm / totalSeparateDistance) * 100 * 10) / 10 : 38.5;
    const co2SavedKg = Math.round(distanceSavedKm * 0.24 * 10) / 10; // ~0.24 kg CO2 per km for light commercial vehicles

    return {
      success: true,
      feasibility: 'OPTIMIZED_AND_FEASIBLE',
      scenario_type: scenarioType,
      scenario_description: scenarioType === 'ONE_BUYER_MULTI_FARMERS'
        ? 'One Buyer (' + uniqueBuyers[0] + ') ordered from ' + uniqueFarmers.length + ' separate farmers. Single vehicle consolidation activated.'
        : 'Clustered multi-drop corridor for ' + uniqueBuyers.length + ' nearby compatible buyers.',
      vehicle_assigned: vehicle.type,
      vehicle_capacity_utilization: {
        total_weight_kg: cumulativeWeightKg,
        max_weight_kg: vehicle.max_payload_kg,
        weight_utilization_percent: Math.round((cumulativeWeightKg / vehicle.max_payload_kg) * 100),
        total_volume_m3: cumulativeVolumeM3,
        max_volume_m3: vehicle.max_volume_m3,
        volume_utilization_percent: Math.round((cumulativeVolumeM3 / vehicle.max_volume_m3) * 100)
      },
      route_analytics: {
        total_stops: itinerary.length,
        consolidated_distance_km: totalConsolidatedDist,
        independent_trips_distance_km: totalSeparateDistance,
        distance_saved_km: distanceSavedKm,
        fuel_reduction_percent: fuelSavedPct + '%',
        carbon_emissions_saved_kg: co2SavedKg + ' kg CO₂',
        estimated_total_transit_hours: Math.round((totalConsolidatedDist / 42) * 10) / 10
      },
      itinerary
    };
  }
}

module.exports = new RouteOptimizationService();
