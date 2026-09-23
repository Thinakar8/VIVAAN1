// =============================================================================
// VIVAAN Agricultural Marketplace - Firebase Realtime Database Service
// Real-time live GPS telemetry tracking for agricultural transport dispatches
// =============================================================================

import { rtdb, isLiveFirebase } from '../config';
import { ref, set, onValue, off } from 'firebase/database';
import { authService } from './authService';
import { firestoreService } from './firestoreService';

class RealtimeDbService {
  constructor() {
    this.trackingListeners = {};
    this.localTelemetry = {
      order_88120: {
        orderId: 'order_88120',
        trackingId: 'TRK-88120',
        driverId: 'uid_driver_1',
        driverName: 'Murugan K',
        vehicleType: 'Tata Ace Pickup',
        vehicleNo: 'TN-30-AZ-8120',
        lat: 11.6643,
        lng: 78.1460,
        heading: 45,
        speedKmh: 42,
        status: 'IN_TRANSIT',
        trackingPhase: 'TO_BUYER',
        trackingActive: true,
        etaMinutes: 210,
        pickupPoint: {
          farmerName: 'Ramasamy Gounder',
          village: 'Omalur',
          lat: 11.7401,
          lng: 78.0406
        },
        deliveryPoint: {
          address: 'Flat 4B, Greenview Apts, Adyar, Chennai',
          district: 'Chennai',
          lat: 13.0012,
          lng: 80.2565,
          exactGpsConsented: false
        },
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * Driver clicks "ACCEPT ORDER" -> Pre-collection phase
   */
  async acceptOrderTracking(orderId, driverData) {
    const existing = this.localTelemetry[orderId] || {};
    const payload = {
      ...existing,
      orderId,
      driverId: driverData?.id || 'uid_driver_1',
      driverName: driverData?.name || 'Murugan K',
      vehicleType: driverData?.vehicleType || 'Tata Ace Pickup',
      vehicleNo: driverData?.vehicleNo || 'TN-30-AZ-8120',
      lat: driverData?.lat || 11.6643,
      lng: driverData?.lng || 78.1460,
      heading: 45,
      speedKmh: 35,
      status: 'ACCEPTED',
      trackingPhase: 'TO_FARMER',
      trackingActive: true,
      lastUpdated: Date.now()
    };

    this.localTelemetry[orderId] = payload;
    this._broadcast(orderId, payload);
    this._syncRemote(orderId, payload);
    return payload;
  }

  /**
   * Driver clicks "COLLECT / PICKED UP" at farmgate -> Unlocks buyer live tracking
   */
  async confirmPickupTracking(orderId) {
    const existing = this.localTelemetry[orderId] || {};
    const payload = {
      ...existing,
      status: 'PICKED_UP',
      trackingPhase: 'TO_BUYER',
      trackingActive: true,
      pickedUpAt: Date.now(),
      lastUpdated: Date.now()
    };

    this.localTelemetry[orderId] = payload;
    this._broadcast(orderId, payload);
    this._syncRemote(orderId, payload);
    return payload;
  }

  /**
   * Driver updates live GPS coordinates and speed
   */
  async updateDriverLocation(orderId, telemetryData) {
    const existing = this.localTelemetry[orderId] || {};
    if (existing.status === 'DELIVERED') return existing;

    const payload = {
      ...existing,
      lat: Number(telemetryData.lat || telemetryData.latitude || existing.lat || 11.6643),
      lng: Number(telemetryData.lng || telemetryData.longitude || existing.lng || 78.1460),
      speedKmh: Number(telemetryData.speedKmh || telemetryData.speed || existing.speedKmh || 35),
      heading: Number(telemetryData.heading || existing.heading || 0),
      etaMinutes: telemetryData.etaMinutes !== undefined ? telemetryData.etaMinutes : existing.etaMinutes,
      status: telemetryData.status || existing.status || 'IN_TRANSIT',
      lastUpdated: Date.now()
    };

    this.localTelemetry[orderId] = payload;
    this._broadcast(orderId, payload);
    this._syncRemote(orderId, payload);

    try {
      firestoreService.updateTracking(orderId, {
        currentLat: payload.lat,
        currentLng: payload.lng,
        speedKmh: payload.speedKmh,
        heading: payload.heading,
        status: payload.status
      });
    } catch (e) {}

    return payload;
  }

  /**
   * Explicit Buyer Location Permission
   */
  async grantBuyerLocationConsent(orderId, coords) {
    const existing = this.localTelemetry[orderId] || {};
    const deliveryPoint = {
      ...(existing.deliveryPoint || {}),
      lat: Number(coords.lat || coords.latitude),
      lng: Number(coords.lng || coords.longitude),
      exactGpsConsented: true,
      consentedAt: Date.now()
    };

    const payload = {
      ...existing,
      deliveryPoint,
      lastUpdated: Date.now()
    };

    this.localTelemetry[orderId] = payload;
    this._broadcast(orderId, payload);
    this._syncRemote(orderId, payload);
    return payload;
  }

  /**
   * Stop Live Tracking Post-Delivery & Teardown Driver Location
   */
  async stopLiveTracking(orderId, completionData = {}) {
    const existing = this.localTelemetry[orderId] || {};
    const payload = {
      ...existing,
      status: 'DELIVERED',
      trackingPhase: 'ENDED',
      trackingActive: false,
      speedKmh: 0,
      etaMinutes: 0,
      driverLocationRemoved: true,
      lat: null,
      lng: null,
      deliveredAt: Date.now(),
      historicalRecord: {
        orderId,
        deliveredAt: new Date().toISOString(),
        deliveryAddress: existing.deliveryPoint?.address || completionData.address,
        deliveredOtpVerified: true
      },
      lastUpdated: Date.now()
    };

    this.localTelemetry[orderId] = payload;
    this._broadcast(orderId, payload);
    this._syncRemote(orderId, payload);
    return payload;
  }

  /**
   * Subscribes to live GPS telemetry stream for a specific order
   */
  subscribeLiveTracking(orderId, role = 'BUYER', callback) {
    if (!orderId) return () => {};

    if (!this.trackingListeners[orderId]) {
      this.trackingListeners[orderId] = [];
    }

    const wrappedCallback = (data) => {
      const sanitized = this._sanitizeForRole(data, role);
      callback(sanitized);
    };

    this.trackingListeners[orderId].push(wrappedCallback);

    const current = this.localTelemetry[orderId] || {
      orderId,
      lat: 11.6643,
      lng: 78.1460,
      heading: 45,
      speedKmh: 40,
      status: 'IN_TRANSIT',
      trackingPhase: 'TO_BUYER',
      trackingActive: true,
      lastUpdated: Date.now()
    };
    wrappedCallback(current);

    if (isLiveFirebase && rtdb) {
      try {
        const trackingRef = ref(rtdb, `tracking/${orderId}`);
        onValue(
          trackingRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              this.localTelemetry[orderId] = data;
              wrappedCallback(data);
            }
          },
          (err) => {
            console.warn('RTDB onValue error, continuing with local telemetry:', err.message);
          }
        );

        return () => {
          off(trackingRef);
          this.trackingListeners[orderId] = (this.trackingListeners[orderId] || []).filter((fn) => fn !== wrappedCallback);
        };
      } catch (e) {}
    }

    return () => {
      this.trackingListeners[orderId] = (this.trackingListeners[orderId] || []).filter((fn) => fn !== wrappedCallback);
    };
  }

  _sanitizeForRole(data, role) {
    if (!data) return data;
    const clone = { ...data };

    if (clone.status === 'DELIVERED') {
      clone.driverLocation = null;
      clone.lat = null;
      clone.lng = null;
      clone.trackingActive = false;
      return clone;
    }

    if (role === 'BUYER' && (clone.trackingPhase === 'TO_FARMER' || clone.status === 'ACCEPTED' || clone.status === 'CONFIRMED')) {
      clone.liveTrackingAllowed = false;
      clone.lat = null;
      clone.lng = null;
      clone.speedKmh = null;
    } else {
      clone.liveTrackingAllowed = true;
    }

    return clone;
  }

  _broadcast(orderId, payload) {
    const listeners = this.trackingListeners[orderId] || [];
    listeners.forEach((fn) => fn(payload));
  }

  async _syncRemote(orderId, payload) {
    if (isLiveFirebase && rtdb) {
      try {
        const trackingRef = ref(rtdb, `tracking/${orderId}`);
        await set(trackingRef, payload);
      } catch (e) {
        console.warn('RTDB sync notice:', e.message);
      }
    }
  }
}

export const realtimeDbService = new RealtimeDbService();
export default realtimeDbService;
