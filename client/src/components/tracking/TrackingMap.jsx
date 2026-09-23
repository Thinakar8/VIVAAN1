import React, { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Truck, CheckCircle2, Shield, Layers, Compass } from 'lucide-react';

/**
 * VIVAAN Dual-Engine Interactive Telemetry Map
 * Supports Google Maps JavaScript API with seamless Leaflet/OpenStreetMap fallback.
 * Strictly isolates drivers and supports post-delivery live marker teardown.
 */
export default function TrackingMap({
  pickupPoint,
  deliveryPoint,
  driver,
  phase = 'TO_BUYER',
  liveTrackingActive = true,
  isDelivered = false,
  className = ''
}) {
  const containerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [mapEngine, setMapEngine] = useState('Google Maps / OSM Dual Engine');

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.google && window.google.maps) {
      initGoogleMap();
    } else if (window.L) {
      initLeafletMap();
    }
  }, []);

  useEffect(() => {
    if (googleMapRef.current) {
      updateGoogleMap();
    } else if (leafletMapRef.current) {
      updateLeafletMap();
    }
  }, [pickupPoint, deliveryPoint, driver, phase, liveTrackingActive, isDelivered]);

  const initLeafletMap = () => {
    if (leafletMapRef.current || !containerRef.current || !window.L) return;
    const map = window.L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([12.3, 79.1], 8);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    leafletMapRef.current = map;
    setMapEngine('Google Maps / OSM Dual Engine');
    updateLeafletMap();
  };

  const updateLeafletMap = () => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const pLat = pickupPoint?.lat || 11.7401;
    const pLng = pickupPoint?.lng || 78.0406;
    const dLat = deliveryPoint?.lat || 13.0012;
    const dLng = deliveryPoint?.lng || 80.2565;

    // 1. Farmgate Origin Marker
    const farmIcon = window.L.divIcon({
      className: 'custom-farm-icon',
      html: '<div style="width:38px;height:38px;border-radius:14px;background:#065f46;color:#fef08a;border:2px solid #facc15;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🌾</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    const farmMarker = window.L.marker([pLat, pLng], { icon: farmIcon })
      .addTo(map)
      .bindPopup('<b>🌾 Farmgate Pickup</b><br/>' + (pickupPoint?.farmerName || 'Farmer') + ' (' + (pickupPoint?.village || 'Salem') + ')');
    markersRef.current.push(farmMarker);

    // 2. Buyer Destination Marker
    const buyerIcon = window.L.divIcon({
      className: 'custom-buyer-icon',
      html: '<div style="width:38px;height:38px;border-radius:14px;background:#1e3a8a;color:#fff;border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🏠</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    const buyerMarker = window.L.marker([dLat, dLng], { icon: buyerIcon })
      .addTo(map)
      .bindPopup('<b>🏠 Buyer Destination</b><br/>' + (deliveryPoint?.address || 'Chennai'));
    markersRef.current.push(buyerMarker);

    // 3. Driver Live Marker (Only when active and NOT delivered)
    if (liveTrackingActive && !isDelivered && driver && driver.lat && driver.lng) {
      const curLat = Number(driver.lat);
      const curLng = Number(driver.lng);
      const driverIcon = window.L.divIcon({
        className: 'custom-driver-icon',
        html: '<div id="live-driver-truck-marker" style="width:44px;height:44px;border-radius:50%;background:#022c22;color:#fde047;border:2px solid #f59e0b;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 16px rgba(0,0,0,0.35);">🚚</div>',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      const truckMarker = window.L.marker([curLat, curLng], { icon: driverIcon })
        .addTo(map)
        .bindPopup('<b>🚚 ' + (driver.name || 'Carrier Driver') + '</b><br/>Speed: ' + (driver.speed_kmh || driver.speedKmh || 40) + ' km/h');
      markersRef.current.push(truckMarker);

      const routeCoords = phase === 'TO_FARMER' ? [[curLat, curLng], [pLat, pLng]] : [[pLat, pLng], [curLat, curLng], [dLat, dLng]];
      polylineRef.current = window.L.polyline(routeCoords, { color: '#059669', weight: 4, dashArray: '6, 8' }).addTo(map);
      map.fitBounds(window.L.latLngBounds([[pLat, pLng], [dLat, dLng], [curLat, curLng]]), { padding: [40, 40] });
    } else {
      // Historical or awaiting collection corridor
      polylineRef.current = window.L.polyline([[pLat, pLng], [dLat, dLng]], { color: isDelivered ? '#059669' : '#94a3b8', weight: 4 }).addTo(map);
      map.fitBounds(window.L.latLngBounds([[pLat, pLng], [dLat, dLng]]), { padding: [40, 40] });
    }
  };

  const initGoogleMap = () => {
    if (!containerRef.current || !window.google || !window.google.maps) return;
    googleMapRef.current = new window.google.maps.Map(containerRef.current, { center: { lat: 12.3, lng: 79.1 }, zoom: 8 });
    setMapEngine('Google Maps API');
    updateGoogleMap();
  };

  const updateGoogleMap = () => {
    const map = googleMapRef.current;
    if (!map || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const pLat = pickupPoint?.lat || 11.7401;
    const pLng = pickupPoint?.lng || 78.0406;
    const dLat = deliveryPoint?.lat || 13.0012;
    const dLng = deliveryPoint?.lng || 80.2565;
    const bounds = new window.google.maps.LatLngBounds();

    const farmM = new window.google.maps.Marker({ position: { lat: pLat, lng: pLng }, map, title: 'Farmgate Origin', label: '🌾' });
    markersRef.current.push(farmM);
    bounds.extend({ lat: pLat, lng: pLng });

    const buyerM = new window.google.maps.Marker({ position: { lat: dLat, lng: dLng }, map, title: 'Buyer Delivery', label: '🏠' });
    markersRef.current.push(buyerM);
    bounds.extend({ lat: dLat, lng: dLng });

    if (liveTrackingActive && !isDelivered && driver && driver.lat && driver.lng) {
      const curLat = Number(driver.lat);
      const curLng = Number(driver.lng);
      const driverM = new window.google.maps.Marker({ position: { lat: curLat, lng: curLng }, map, title: driver.name || 'Driver', label: '🚚' });
      markersRef.current.push(driverM);
      bounds.extend({ lat: curLat, lng: curLng });
      const path = phase === 'TO_FARMER' ? [{ lat: curLat, lng: curLng }, { lat: pLat, lng: pLng }] : [{ lat: pLat, lng: pLng }, { lat: curLat, lng: curLng }, { lat: dLat, lng: dLng }];
      polylineRef.current = new window.google.maps.Polyline({ path, strokeColor: '#059669', strokeOpacity: 0.9, strokeWeight: 4 });
      polylineRef.current.setMap(map);
    } else {
      polylineRef.current = new window.google.maps.Polyline({ path: [{ lat: pLat, lng: pLng }, { lat: dLat, lng: dLng }], strokeColor: isDelivered ? '#059669' : '#64748b', strokeWeight: 4 });
      polylineRef.current.setMap(map);
    }
    map.fitBounds(bounds);
  };

  return (
    <div className={'relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md flex flex-col ' + className}>
      <div className='absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none'>
        <div className='pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 border border-white/20'>
          <span className={'w-2.5 h-2.5 rounded-full ' + (isDelivered ? 'bg-emerald-400' : liveTrackingActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400')}></span>
          <span id="map-phase-header-label">{isDelivered ? 'Historical Corridor Map' : phase === 'TO_FARMER' ? 'Route to Farmgate' : 'Live GPS Corridor'}</span>
          <span className='text-[10px] text-slate-300 font-mono'>• {mapEngine}</span>
        </div>
        <div className='pointer-events-auto'>
          <button type='button' onClick={() => { if (leafletMapRef.current) leafletMapRef.current.setView([driver?.lat || 12.3, driver?.lng || 79.1], 10); }} className='p-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-black' title='Recenter Map'>
            <Compass className='w-4 h-4' />
          </button>
        </div>
      </div>
      <div id='vivaan-tracking-map-canvas' ref={containerRef} className='w-full h-full min-h-[400px] z-10' />
      <div className='p-3.5 bg-white/95 backdrop-blur-sm border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs z-20'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5 font-bold text-slate-800'>
            <Truck className='w-4 h-4 text-emerald-800' />
            <span>Carrier: <b id="map-assigned-driver-name">{driver?.name || 'Murugan Karuppasamy'}</b></span>
            <span className='font-mono text-[11px] text-slate-500'>({driver?.vehicle_no || driver?.vehicleNo || 'TN-30-AZ-8120'})</span>
          </div>
          {!isDelivered && liveTrackingActive && (
            <div className='flex items-center gap-3 text-slate-600 font-medium'>
              <span>Speed: <b className='text-slate-900'>{driver?.speed_kmh || driver?.speedKmh || 42} km/h</b></span>
              <span>Heading: <b className='text-slate-900'>{driver?.heading || 45}&deg; NE</b></span>
            </div>
          )}
        </div>
        <div>
          {isDelivered ? (
            <span id="map-delivered-badge" className='inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-black rounded-full text-xs'>
              <CheckCircle2 className='w-3.5 h-3.5 text-emerald-700' />
              Delivery Confirmed & Verified
            </span>
          ) : (
            <span id="map-telemetry-status-pill" className='inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-mono text-[11px] font-bold'>
              Telemetry Streaming (3s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
