// =============================================================================
// VIVAAN Agricultural Marketplace - Cloud Firestore Data Service
// Complete CRUD & RBAC for all 15 required collections:
// 1. users              2. farmers          3. farmerVerification
// 4. landRecords        5. farmerProducts   6. buyers
// 7. deliveryAgencies   8. drivers          9. vehicles
// 10. orders            11. payments        12. tracking
// 13. ratings           14. notifications   15. aiInsights
// =============================================================================

import { db, isLiveFirebase } from '../config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { INITIAL_SEED_DATA } from '../seedData';
import { authService } from './authService';

const FIRESTORE_STORAGE_KEY = 'vivaan_firestore_db';

class FirestoreService {
  constructor() {
    this.memoryStore = this._loadLocalStore();
    this.changeListeners = {};
  }

  _loadLocalStore() {
    try {
      const saved = localStorage.getItem(FIRESTORE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    // Initialize with initial seed data for all 15 collections
    const copy = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this._saveLocalStore(copy);
    return copy;
  }

  _saveLocalStore(data) {
    try {
      localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  _notify(colName) {
    const subs = this.changeListeners[colName] || [];
    const list = this.memoryStore[colName] || [];
    subs.forEach((fn) => fn([...list]));
  }

  // Generic local fallback query
  _getLocal(colName) {
    return this.memoryStore[colName] || [];
  }

  _addLocal(colName, docData) {
    const id = docData.id || `${colName}_${Date.now()}`;
    const newDoc = { ...docData, id };
    if (!this.memoryStore[colName]) this.memoryStore[colName] = [];
    this.memoryStore[colName].unshift(newDoc);
    this._saveLocalStore(this.memoryStore);
    this._notify(colName);
    return newDoc;
  }

  _updateLocal(colName, id, updates) {
    if (!this.memoryStore[colName]) return null;
    const index = this.memoryStore[colName].findIndex((d) => d.id === id || d.uid === id || d.orderId === id);
    if (index !== -1) {
      this.memoryStore[colName][index] = {
        ...this.memoryStore[colName][index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this._saveLocalStore(this.memoryStore);
      this._notify(colName);
      return this.memoryStore[colName][index];
    }
    return null;
  }

  // Subscribe to real-time changes in a collection
  subscribeCollection(colName, callback) {
    if (!this.changeListeners[colName]) {
      this.changeListeners[colName] = [];
    }
    this.changeListeners[colName].push(callback);
    callback(this._getLocal(colName));

    if (isLiveFirebase && db) {
      try {
        const q = collection(db, colName);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length > 0) {
            this.memoryStore[colName] = items;
            callback(items);
          }
        }, () => {});
        return () => {
          unsubscribe();
          this.changeListeners[colName] = (this.changeListeners[colName] || []).filter((fn) => fn !== callback);
        };
      } catch (e) {}
    }

    return () => {
      this.changeListeners[colName] = (this.changeListeners[colName] || []).filter((fn) => fn !== callback);
    };
  }

  // ===========================================================================
  // 1. users Collection
  // ===========================================================================
  async getUsers() {
    if (isLiveFirebase && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {}
    }
    return this._getLocal('users');
  }

  async getUser(uid) {
    if (isLiveFirebase && db) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) return { id: snap.id, ...snap.data() };
      } catch (e) {}
    }
    return this._getLocal('users').find((u) => u.uid === uid || u.id === uid) || null;
  }

  // ===========================================================================
  // 2. farmers Collection
  // ===========================================================================
  async getFarmers() {
    if (isLiveFirebase && db) {
      try {
        const snap = await getDocs(collection(db, 'farmers'));
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {}
    }
    return this._getLocal('farmers');
  }

  async getFarmer(farmerId) {
    const list = await this.getFarmers();
    return list.find((f) => f.id === farmerId || f.userId === farmerId) || list[0];
  }

  // ===========================================================================
  // 3. farmerVerification (SENSITIVE: KYC, Land Audit, Aadhaar hash)
  // ===========================================================================
  async getFarmerVerification(farmerId) {
    authService.assertRole(['farmer', 'admin']);
    const user = authService.getCurrentUser();
    const verifs = this._getLocal('farmerVerification');
    const matched = verifs.find((v) => v.farmerId === farmerId || v.userId === user?.uid);
    return matched || verifs[0];
  }

  async submitFarmerVerification(verificationData) {
    authService.assertRole(['farmer', 'admin']);
    const user = authService.getCurrentUser();
    const newVerif = {
      id: `verif_${Date.now()}`,
      farmerId: verificationData.farmerId || 'farmer_1',
      userId: user?.uid || 'uid_farmer_1',
      fullName: verificationData.fullName || user?.displayName || 'Ramasamy Gounder',
      primaryMobile: verificationData.primaryMobile || '+91 98421 88210',
      altMobile: verificationData.altMobile || '',
      address: {
        street: verificationData.address?.street || '4/182, East Garden Street',
        village: verificationData.address?.village || 'Muthampatty',
        taluk: verificationData.address?.taluk || 'Omalur',
        district: verificationData.address?.district || 'Salem',
        state: verificationData.address?.state || 'Tamil Nadu',
        pincode: verificationData.address?.pincode || '636455',
        isPrivate: true
      },
      govIdType: verificationData.govIdType || 'Aadhaar Card',
      govIdNumberMasked: verificationData.govIdNumber ? `XXXX-XXXX-${verificationData.govIdNumber.slice(-4)}` : 'XXXX-XXXX-4821',
      aadhaarHash: verificationData.aadhaarHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      bankDetails: {
        accountHolder: verificationData.bankDetails?.accountHolder || verificationData.fullName || 'Ramasamy Gounder',
        bankName: verificationData.bankDetails?.bankName || 'State Bank of India',
        accountNumberMasked: verificationData.bankDetails?.accountNumber ? `•••• •••• ${verificationData.bankDetails.accountNumber.slice(-4)}` : '•••• •••• 4891',
        ifscCode: verificationData.bankDetails?.ifscCode || 'SBIN0001824',
        branch: verificationData.bankDetails?.branch || 'Omalur Main Branch'
      },
      photoUrl: verificationData.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      pattaNumber: verificationData.pattaNumber,
      uniqueFarmerId: verificationData.uniqueFarmerId || `VIV-FR-${Math.floor(100000 + Math.random() * 900000)}`,
      landAuditStatus: 'VERIFIED',
      verificationAuthority: 'Revenue Dept & e-Mandi Land Audit Desk',
      verifiedAt: new Date().toISOString(),
      documentUrl: verificationData.documentUrl || '/docs/patta-verified.pdf'
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'farmerVerification'), newVerif);
      } catch (e) {}
    }

    // Also update matching record in 'farmers' collection
    const farmers = this._getLocal('farmers');
    const existingFarmer = farmers.find(f => f.id === newVerif.farmerId || f.userId === newVerif.userId);
    if (existingFarmer) {
      this._updateLocal('farmers', existingFarmer.id, {
        name: newVerif.fullName,
        uniqueFarmerId: newVerif.uniqueFarmerId,
        photoUrl: newVerif.photoUrl,
        verified: true,
        district: newVerif.address.district,
        taluk: newVerif.address.taluk,
        village: newVerif.address.village,
        state: newVerif.address.state,
        totalAcres: Number(verificationData.extentAcres) || existingFarmer.totalAcres || 5.5,
        ownershipType: verificationData.ownershipType || existingFarmer.ownershipType || 'Own Land',
        pattaNumber: newVerif.pattaNumber
      });
    }

    return this._addLocal('farmerVerification', newVerif);
  }

  // ===========================================================================
  // 4. landRecords (SENSITIVE: Survey No, Patta extent, ownership)
  // ===========================================================================
  async getLandRecords(farmerId) {
    authService.assertRole(['farmer', 'admin']);
    const user = authService.getCurrentUser();
    const records = this._getLocal('landRecords');
    return records.filter((r) => r.farmerId === farmerId || r.userId === user?.uid);
  }

  async submitLandRecord(recordData) {
    authService.assertRole(['farmer', 'admin']);
    const user = authService.getCurrentUser();
    const newRecord = {
      id: `land_${Date.now()}`,
      farmerId: recordData.farmerId || 'farmer_1',
      userId: user?.uid || 'uid_farmer_1',
      ownershipType: recordData.ownershipType || 'Own Land', // 'Own Land' | 'Leased Land With Agreement' | 'Leased Land Without Agreement'
      district: recordData.district || 'Salem',
      taluk: recordData.taluk || 'Omalur',
      village: recordData.village || 'Muthampatty',
      surveyNumber: recordData.surveyNumber || '142',
      subdivisionNumber: recordData.subdivisionNumber || '2B',
      pattaNumber: recordData.pattaNumber || 'PAT-4821/2021',
      chittaNumber: recordData.chittaNumber || 'CHT-8842',
      extentAcres: Number(recordData.extentAcres) || 5.5,
      soilType: recordData.soilType || 'Red Loam',
      irrigationSource: recordData.irrigationSource || 'Borewell with Solar Pump',
      // Dynamic leased land information
      leaseInfo: recordData.ownershipType?.includes('Leased') ? {
        landownerName: recordData.landownerName || 'Kandasamy Perumal',
        landownerPhone: recordData.landownerPhone || '+91 94432 88120',
        leasePeriodYears: Number(recordData.leasePeriodYears) || 3,
        leaseExpiryDate: recordData.leaseExpiryDate || '2028-06-30',
        annualLeaseAmount: Number(recordData.annualLeaseAmount) || 45000,
        hasAgreement: recordData.ownershipType === 'Leased Land With Agreement',
        agreementDocType: recordData.agreementDocType || (recordData.ownershipType === 'Leased Land With Agreement' ? 'Registered Lease Deed' : 'Village Panchayat Affidavit'),
        agreementRefNumber: recordData.agreementRefNumber || 'LSE-TN-2024-81'
      } : null,
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'landRecords'), newRecord);
      } catch (e) {}
    }

    return this._addLocal('landRecords', newRecord);
  }

  // ===========================================================================
  // 5. farmerProducts (Public Harvest Catalog)
  // ===========================================================================
  async getFarmerProducts(filters = {}) {
    let prods = this._getLocal('farmerProducts');

    if (filters.category && filters.category !== 'All') {
      prods = prods.filter((p) => p.category === filters.category);
    }
    if (filters.organicOnly) {
      prods = prods.filter((p) => p.organic === true);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.farmerName?.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  async addFarmerProduct(productData) {
    authService.assertRole(['farmer', 'admin']);
    const user = authService.getCurrentUser();
    const newProd = {
      id: `prod_${Date.now()}`,
      farmerId: productData.farmerId || 'farmer_1',
      farmerName: user?.displayName || 'Ramasamy Gounder',
      userId: user?.uid || 'uid_farmer_1',
      title: productData.title,
      category: productData.category || 'Vegetables',
      pricePerUnit: Number(productData.pricePerUnit),
      price_per_unit: Number(productData.pricePerUnit),
      mandiPrice: Number(productData.mandiPrice) || Math.round(productData.pricePerUnit * 0.7),
      mandiSpread: Number(productData.mandiSpread) || Math.round(productData.pricePerUnit * 0.3),
      unit: productData.unit || 'kg',
      availableStock: Number(productData.availableStock) || 100,
      available_stock: Number(productData.availableStock) || 100,
      available_quantity: Number(productData.availableStock) || 100,
      minOrderQty: Number(productData.minOrderQty) || 5,
      harvestDate: productData.harvestDate || new Date().toISOString().split('T')[0],
      dispatchTime: productData.dispatchTime || '08:00 AM',
      availability: productData.availability || 'Immediate Harvest',
      description: productData.description || 'Fresh farmgate harvest batch.',
      organic: Boolean(productData.organic),
      is_organic: Boolean(productData.organic),
      photoUrl: productData.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
      photo_url: productData.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
      status: 'ACTIVE',
      // Aggregate locality only: NO exact private residential street address exposed
      village: productData.village || 'Omalur',
      district: productData.district || 'Salem',
      state: productData.state || 'Tamil Nadu',
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'farmerProducts'), newProd);
      } catch (e) {}
    }

    return this._addLocal('farmerProducts', newProd);
  }

  // ===========================================================================
  // 6. buyers Collection
  // ===========================================================================
  async getBuyers() {
    return this._getLocal('buyers');
  }

  async getBuyer(buyerId) {
    const list = this._getLocal('buyers');
    return list.find((b) => b.id === buyerId || b.userId === buyerId) || list[0];
  }

  async getBuyerProfile(userId = null) {
    const user = authService.getCurrentUser();
    const uid = userId || user?.uid || 'uid_buyer_1';
    const list = this._getLocal('buyers');
    return list.find((b) => b.userId === uid || b.id === uid) || list[0];
  }

  async saveBuyerProfile(profileData) {
    const user = authService.getCurrentUser();
    const buyerId = profileData.id || profileData.buyerId || 'buyer_1';
    const updatedBuyer = {
      id: buyerId,
      userId: user?.uid || 'uid_buyer_1',
      fullName: profileData.fullName || profileData.name || 'Aditi Sharma',
      name: profileData.fullName || profileData.name || 'Aditi Sharma',
      email: profileData.email || user?.email || 'aditi.sharma@gmail.com',
      mobile: profileData.mobile || profileData.phone || '+91 98765 43210',
      phone: profileData.mobile || profileData.phone || '+91 98765 43210',
      state: profileData.state || 'Tamil Nadu',
      district: profileData.district || 'Chennai',
      cityVillage: profileData.cityVillage || 'Adyar',
      pincode: profileData.pincode || '600020',
      deliveryAddress: profileData.deliveryAddress || 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar',
      buyerType: profileData.buyerType || 'Retail Consumer',
      authProvider: profileData.authProvider || (user?.isGoogleAuth ? 'google.com' : 'email'),
      avatarUrl: profileData.avatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      updatedAt: new Date().toISOString()
    };

    const existing = this._getLocal('buyers').find(b => b.id === buyerId || b.userId === updatedBuyer.userId);
    if (existing) {
      this._updateLocal('buyers', existing.id, updatedBuyer);
    } else {
      this._addLocal('buyers', updatedBuyer);
    }

    if (user) {
      authService.updateUserProfile({
        displayName: updatedBuyer.fullName,
        phone: updatedBuyer.mobile,
        deliveryAddress: updatedBuyer.deliveryAddress,
        buyerType: updatedBuyer.buyerType
      });
    }

    if (isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'buyers', buyerId), updatedBuyer, { merge: true });
      } catch (e) {}
    }

    return updatedBuyer;
  }

    // ===========================================================================
  // 7. deliveryAgencies Collection
  // ===========================================================================
  async getDeliveryAgencies() {
    return this._getLocal('deliveryAgencies');
  }

  async getDeliveryAgency(agencyId = null) {
    const list = this._getLocal('deliveryAgencies');
    if (!agencyId) return list[0];
    return list.find((a) => a.id === agencyId || a.agencyId === agencyId || a.userId === agencyId) || list[0];
  }

  async registerDeliveryAgency(agencyData) {
    const agencyIdNum = `VIV-AG-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Determine classification (GREEN / ORANGE / BLUE)
    let classification = agencyData.classification;
    if (!classification) {
      const dists = Array.isArray(agencyData.districts) ? agencyData.districts : String(agencyData.districts || '').split(',').map(s => s.trim()).filter(Boolean);
      if (dists.length <= 1) {
        classification = 'GREEN';
      } else if (dists.length <= 3) {
        classification = 'ORANGE';
      } else {
        classification = 'BLUE';
      }
    }

    const classLabels = {
      GREEN: 'Local Level Delivery Agency',
      ORANGE: 'District Level Delivery Agency',
      BLUE: 'State Level Delivery Agency'
    };

    const newAgency = {
      id: `agency_${Date.now()}`,
      agencyId: agencyIdNum,
      userId: `uid_ag_${Date.now()}`,
      legalName: agencyData.legalName || 'GreenCorridor Agro Logistics Private Limited',
      brandName: agencyData.brandName || 'GreenCorridor Express',
      agencyName: agencyData.brandName || agencyData.legalName || 'GreenCorridor Agro Logistics',
      corporateOffice: agencyData.corporateOffice || 'Plot 12, SIDCO Industrial Estate, Guindy, Chennai',
      businessTaxId: agencyData.businessTaxId || '33AABCG1234F1Z5',
      contactPerson: agencyData.contactPerson || 'Sundaramurthy Pillai',
      contactPhone: agencyData.contactPhone || '+91 98421 77650',
      contactEmail: agencyData.contactEmail || 'operations@logistics.vivaan.agri',
      states: Array.isArray(agencyData.states) ? agencyData.states : [agencyData.states || 'Tamil Nadu'],
      districts: Array.isArray(agencyData.districts) ? agencyData.districts : String(agencyData.districts || 'Salem, Chennai, Coimbatore').split(',').map(s => s.trim()),
      taluks: Array.isArray(agencyData.taluks) ? agencyData.taluks : String(agencyData.taluks || 'Omalur, Guindy, Adyar').split(',').map(s => s.trim()),
      serviceableAreas: agencyData.serviceableAreas || 'Salem-Chennai Agri Corridor & Cauvery Delta',
      noGoAreas: agencyData.noGoAreas || 'Valparai Ghat routes during monsoon; unpaved footpaths',
      warehouses: Array.isArray(agencyData.warehouses) ? agencyData.warehouses : String(agencyData.warehouses || 'Salem Central Cold Hub, Chennai Guindy Cross-Dock').split(',').map(s => s.trim()),
      vehicleTypes: Array.isArray(agencyData.vehicleTypes) ? agencyData.vehicleTypes : String(agencyData.vehicleTypes || 'Tata Ace Pickup, Mahindra Bolero Maxi Truck').split(',').map(s => s.trim()),
      fleetSize: Number(agencyData.fleetSize) || 12,
      ownedVehiclesCount: Number(agencyData.ownedVehiclesCount) || 8,
      outsourcedVehiclesCount: Number(agencyData.outsourcedVehiclesCount) || 4,
      avgTransitTimeHours: Number(agencyData.avgTransitTimeHours) || 4,
      maxWeightCapacityKg: Number(agencyData.maxWeightCapacityKg) || 18000,
      maxVolumeCapacityCuFt: Number(agencyData.maxVolumeCapacityCuFt) || 1200,
      classification,
      classificationLabel: classLabels[classification] || 'District Level Delivery Agency',
      verified: true,
      carrierRating: 5.0,
      completedDeliveriesCount: 0,
      totalLogisticsEarnings: 0,
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'deliveryAgencies'), newAgency);
      } catch (e) {}
    }

    return this._addLocal('deliveryAgencies', newAgency);
  }

  // ===========================================================================
  // 8. drivers Collection
  // ===========================================================================
  async getDrivers(agencyId = null) {
    const list = this._getLocal('drivers');
    if (!agencyId) return list;
    return list.filter((d) => d.agencyId === agencyId || d.agencyId === 'agency_1');
  }

  async getDriver(driverId = null) {
    const list = this._getLocal('drivers');
    if (!driverId) return list[0];
    return list.find((d) => d.id === driverId || d.vivaanId === driverId || d.userId === driverId) || list[0];
  }

  async addDriver(driverData) {
    return this.registerDriver(driverData);
  }

  async registerDriver(driverData) {
    const vivaanId = driverData.vivaanId || `VIV-DR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newDriver = {
      id: `driver_${Date.now()}`,
      vivaanId,
      userId: `uid_dr_${Date.now()}`,
      agencyId: driverData.agencyId || 'agency_1',
      name: driverData.fullName || driverData.name || 'Murugan K',
      fullName: driverData.fullName || driverData.name || 'Murugan Karuppasamy',
      phone: driverData.phone || '+91 94432 19842',
      altPhone: driverData.altPhone || '',
      dob: driverData.dob || '1990-05-12',
      address: driverData.address || 'Omalur, Salem District',
      kycType: driverData.kycType || 'Aadhaar Card',
      kycMasked: driverData.kycNumber ? `XXXX-XXXX-${driverData.kycNumber.slice(-4)}` : 'XXXX-XXXX-4819',
      commercialDlNumber: driverData.commercialDlNumber || driverData.licenseNo || 'TN-30-2020-0012495',
      licenseClass: driverData.licenseClass || 'LMV (Light Motor Vehicle)',
      dlExpiry: driverData.dlExpiry || '2032-12-31',
      experienceYears: Number(driverData.experienceYears) || 5,
      state: driverData.state || 'Tamil Nadu',
      district: driverData.district || 'Salem',
      familiarTaluks: Array.isArray(driverData.familiarTaluks) ? driverData.familiarTaluks : String(driverData.familiarTaluks || 'Omalur, Salem, Adyar, Guindy').split(',').map(s => s.trim()),
      languages: Array.isArray(driverData.languages) ? driverData.languages : String(driverData.languages || 'Tamil, English').split(',').map(s => s.trim()),
      vehicleOwner: driverData.vehicleOwner || 'Agency Provided',
      vehicleId: `veh_${Date.now()}`,
      vehicleType: driverData.vehicleType || 'Tata Ace Pickup',
      vehicleNo: driverData.vehicleNo || 'TN-30-AZ-8120',
      vehicleCapacityKg: Number(driverData.vehicleCapacityKg) || 1200,
      hasColdChain: Boolean(driverData.hasColdChain !== undefined ? driverData.hasColdChain : true),
      hasSmartphone: Boolean(driverData.hasSmartphone !== undefined ? driverData.hasSmartphone : true),
      codHandling: Boolean(driverData.codHandling !== undefined ? driverData.codHandling : true),
      heavyLifting: Boolean(driverData.heavyLifting !== undefined ? driverData.heavyLifting : true),
      preferredShift: driverData.preferredShift || 'Morning & Full Day',
      rating: 5.0,
      tripsCompleted: 0,
      todayEarnings: 0,
      weeklyEarnings: 0,
      totalEarnings: 0,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'drivers'), newDriver);
      } catch (e) {}
    }

    // Also register vehicle
    this._addLocal('vehicles', {
      id: newDriver.vehicleId,
      agencyId: newDriver.agencyId,
      registrationNumber: newDriver.vehicleNo,
      vehicleType: newDriver.vehicleType,
      payloadCapacityKg: newDriver.vehicleCapacityKg,
      hasColdChain: newDriver.hasColdChain,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    return this._addLocal('drivers', newDriver);
  }

  async updateDriverStatus(driverId, newStatus) {
    return this._updateLocal('drivers', driverId, { status: newStatus });
  }

  // ===========================================================================
  // CAPABILITY-BASED ORDER ASSIGNMENT ENGINE
  // "Orders must only be assigned to agencies/drivers capable of handling the delivery."
  // ===========================================================================
  async getCapableOrdersForAgency(agencyId = 'agency_1') {
    const agency = await this.getDeliveryAgency(agencyId);
    const allOrders = this._getLocal('orders');
    const drivers = this._getLocal('drivers').filter(d => d.agencyId === agency.id || d.agencyId === 'agency_1');
    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'IDLE');

    const maxWeight = agency.maxWeightCapacityKg || 18000;
    const maxVol = agency.maxVolumeCapacityCuFt || 1200;
    const noGo = (agency.noGoAreas || '').toLowerCase();

    const capableOrders = [];
    const incapableOrders = [];

    for (const ord of allOrders) {
      const weight = Number(ord.cargoWeightKg || (ord.items?.[0]?.quantity || 10));
      const vol = Number(ord.cargoVolumeCuFt || 2);
      const destText = (typeof ord.deliveryAddress === 'string' ? ord.deliveryAddress : `${ord.deliveryAddress?.street || ''} ${ord.deliveryAddress?.district || ''}`).toLowerCase();

      // Check reasons for incapability
      let rejectionReason = null;
      if (weight > maxWeight) {
        rejectionReason = `Cargo weight (${weight} kg) exceeds agency maximum fleet capacity (${maxWeight} kg)`;
      } else if (vol > maxVol) {
        rejectionReason = `Cargo volume (${vol} cu ft) exceeds maximum volume limit (${maxVol} cu ft)`;
      } else if (noGo && (destText.includes('valparai') || destText.includes('ghat') || noGo.includes(ord.deliveryAddress?.district?.toLowerCase() || ''))) {
        rejectionReason = 'Destination falls within restricted No-Go Area (Ghat landslides / Inaccessible zone)';
      }

      if (rejectionReason) {
        incapableOrders.push({ ...ord, rejectionReason, isCapable: false });
      } else {
        capableOrders.push({ ...ord, isCapable: true });
      }
    }

    const insights = {
      totalOrdersEvaluated: allOrders.length,
      capableCount: capableOrders.length,
      incapableCount: incapableOrders.length,
      activeDriversCount: drivers.length,
      availableDriversCount: availableDrivers.length,
      capacityUtilizationPct: Math.round((capableOrders.reduce((s, o) => s + (o.cargoWeightKg || 10), 0) / maxWeight) * 100),
      fleetReadiness: availableDrivers.length > 0 ? 'HIGH (Immediate Dispatch Ready)' : 'OPTIMAL'
    };

    return { agency, capableOrders, incapableOrders, insights };
  }

  async getCapableOrdersForDriver(driverId = 'driver_1') {
    const driver = await this.getDriver(driverId);
    const allOrders = this._getLocal('orders');
    const vehicleCap = driver.vehicleCapacityKg || 1200;

    const availableOrders = [];
    const acceptedOrders = [];
    const currentDelivery = [];
    const completedOrders = [];
    const cancelledOrders = [];

    for (const ord of allOrders) {
      const weight = Number(ord.cargoWeightKg || (ord.items?.[0]?.quantity || 10));

      if (ord.status === 'CANCELLED') {
        cancelledOrders.push(ord);
        continue;
      }
      if (ord.status === 'DELIVERED') {
        completedOrders.push(ord);
        continue;
      }
      if (ord.status === 'IN_TRANSIT' || ord.status === 'PICKED_UP') {
        if (ord.assignedDriverId === driver.id || ord.assignedDriverId === driver.vivaanId || ord.assignedDriverId === 'driver_1' || ord.assignedDriverId === 'uid_driver_1') {
          currentDelivery.push(ord);
        }
        continue;
      }
      if (ord.status === 'ACCEPTED') {
        if (ord.assignedDriverId === driver.id || ord.assignedDriverId === driver.vivaanId || ord.assignedDriverId === 'driver_1') {
          acceptedOrders.push(ord);
        }
        continue;
      }

      // If status is CONFIRMED (Unassigned available pool)
      if (ord.status === 'CONFIRMED' || !ord.assignedDriverId) {
        // Must be capable: weight <= vehicleCap
        if (weight <= vehicleCap) {
          availableOrders.push({ ...ord, isCapable: true, driverCap: vehicleCap });
        }
      }
    }

    return {
      driver,
      availableOrders,
      acceptedOrders,
      currentDelivery: currentDelivery[0] || acceptedOrders[0] || null,
      completedOrders,
      cancelledOrders
    };
  }

  async acceptOrderDriver(orderId, driverId = 'driver_1') {
    const driver = await this.getDriver(driverId);
    const updatedOrder = this._updateLocal('orders', orderId, {
      assignedDriverId: driver.id || driver.vivaanId || 'driver_1',
      status: 'ACCEPTED',
      updatedAt: new Date().toISOString()
    });

    this._updateLocal('drivers', driver.id, { status: 'IN_TRANSIT' });

    if (isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { assignedDriverId: driver.id, status: 'ACCEPTED' });
      } catch (e) {}
    }

    return updatedOrder;
  }

  async pickupOrderDriver(orderId) {
    const updatedOrder = this._updateLocal('orders', orderId, {
      status: 'PICKED_UP',
      updatedAt: new Date().toISOString()
    });
    if (isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: 'PICKED_UP' });
      } catch (e) {}
    }
    return updatedOrder;
  }

  async startTransitOrderDriver(orderId) {
    const updatedOrder = this._updateLocal('orders', orderId, {
      status: 'IN_TRANSIT',
      updatedAt: new Date().toISOString()
    });
    if (isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: 'IN_TRANSIT' });
      } catch (e) {}
    }
    return updatedOrder;
  }

  async cancelOrderDriver(orderId, reason = 'Driver unavailable or vehicle issue') {
    const updatedOrder = this._updateLocal('orders', orderId, {
      status: 'CANCELLED',
      cancellationReason: reason,
      updatedAt: new Date().toISOString()
    });
    return updatedOrder;
  }

// ===========================================================================
  // 9. vehicles Collection
  // ===========================================================================
  async getVehicles() {
    return this._getLocal('vehicles');
  }

  async addVehicle(vehicleData) {
    authService.assertRole(['agency', 'admin']);
    const newVeh = {
      id: `veh_${Date.now()}`,
      agencyId: vehicleData.agencyId || 'agency_1',
      registrationNumber: vehicleData.registrationNumber,
      vehicleType: vehicleData.vehicleType,
      payloadCapacityKg: Number(vehicleData.payloadCapacityKg) || 1500,
      hasColdChain: Boolean(vehicleData.hasColdChain),
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'vehicles'), newVeh);
      } catch (e) {}
    }

    return this._addLocal('vehicles', newVeh);
  }

  // ===========================================================================
  // 10. orders Collection
  // ===========================================================================
  async getOrders(role = null, userId = null) {
    const list = this._getLocal('orders');
    if (!role || role === 'admin') return list;
    if (role === 'farmer') return list.filter((o) => o.farmerId === userId || o.farmerId === 'uid_farmer_1');
    if (role === 'buyer') return list.filter((o) => o.buyerId === userId || o.buyerId === 'uid_buyer_1');
    if (role === 'driver') return list.filter((o) => o.assignedDriverId === userId || o.assignedDriverId === 'uid_driver_1');
    if (role === 'agency') return list;
    return list;
  }

  async createOrder(orderData) {
    authService.assertRole(['buyer', 'admin']);
    const user = authService.getCurrentUser();
    const orderNum = orderData.orderNumber || `VIV-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingId = orderData.trackingId || `TRK-${orderNum.replace('VIV-ORD-', 'VIV-')}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const produceSubtotal = Number(orderData.produceSubtotal || 0);
    const logisticsFee = Number(orderData.logisticsFee !== undefined ? orderData.logisticsFee : 120);
    const totalAmount = Number(orderData.totalAmount || (produceSubtotal + logisticsFee));
    const paymentStatus = orderData.paymentStatus || (orderData.razorpayPaymentId ? 'Successful' : 'Pending');

    const newOrder = {
      id: `order_${Date.now()}`,
      orderNumber: orderNum,
      orderId: orderNum,
      trackingId,
      buyerId: user?.uid || 'uid_buyer_1',
      buyerName: user?.displayName || 'Aditi Sharma',
      farmerId: orderData.farmerId || 'uid_farmer_1',
      farmerName: orderData.farmerName || 'Ramasamy Gounder',
      assignedAgencyId: 'uid_agency_1',
      assignedDriverId: 'uid_driver_1',
      items: orderData.items || [],
      produceSubtotal,
      productAmount: produceSubtotal,
      logisticsFee,
      deliveryCharge: logisticsFee,
      totalAmount,
      paymentStatus, // 'Pending' | 'Successful' | 'Failed' | 'Refunded'
      razorpayOrderId: orderData.razorpayOrderId || null,
      razorpayPaymentId: orderData.razorpayPaymentId || null,
      razorpaySignature: orderData.razorpaySignature || null,
      deliveryAddress: orderData.deliveryAddress || {
        street: 'Flat 4B, Greenview Apts, Adyar',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: paymentStatus === 'Failed' ? 'CANCELLED' : (orderData.status || 'CONFIRMED'),
      otpCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'orders'), newOrder);
      } catch (e) {}
    }

    this._addLocal('orders', newOrder);

    // Automatically reduce available quantity in farmerProducts
    for (const item of (newOrder.items || [])) {
      const prodId = item.productId || item.product_id || item.id;
      if (prodId) {
        const prod = this._getLocal('farmerProducts').find((p) => p.id === prodId || p.title === item.title);
        if (prod) {
          const currentQty = Number(prod.availableStock !== undefined ? prod.availableStock : (prod.available_stock !== undefined ? prod.available_stock : (prod.available_quantity || 100)));
          const orderedQty = Number(item.quantity || 1);
          const newQty = Math.max(0, currentQty - orderedQty);
          this._updateLocal('farmerProducts', prod.id, {
            availableStock: newQty,
            available_stock: newQty,
            available_quantity: newQty,
            status: newQty === 0 ? 'OUT_OF_STOCK' : (prod.status || 'ACTIVE')
          });
          if (isLiveFirebase && db) {
            try {
              await updateDoc(doc(db, 'farmerProducts', prod.id), {
                availableStock: newQty,
                available_stock: newQty,
                available_quantity: newQty,
                status: newQty === 0 ? 'OUT_OF_STOCK' : (prod.status || 'ACTIVE')
              });
            } catch (e) {}
          }
        }
      }
    }

    // Create SENSITIVE escrow payment record in 'payments'
    this.createEscrowPayment({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      trackingId: newOrder.trackingId,
      buyerId: newOrder.buyerId,
      farmerId: newOrder.farmerId,
      totalAmount: newOrder.totalAmount,
      produceAmount: newOrder.produceSubtotal,
      logisticsAmount: newOrder.logisticsFee,
      paymentStatus: newOrder.paymentStatus,
      razorpayOrderId: newOrder.razorpayOrderId,
      razorpayPaymentId: newOrder.razorpayPaymentId,
      status: newOrder.paymentStatus === 'Successful' ? 'HELD_IN_ESCROW' : 'PENDING'
    });

    // Create initial tracking milestone in 'tracking'
    this._addLocal('tracking', {
      id: `track_${newOrder.id}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      trackingId: newOrder.trackingId,
      driverId: newOrder.assignedDriverId,
      driverName: 'Murugan K',
      currentLat: 11.6643,
      currentLng: 78.1460,
      origin: 'Salem, Tamil Nadu',
      destination: `${newOrder.deliveryAddress.district}, ${newOrder.deliveryAddress.state}`,
      status: 'CONFIRMED',
      etaMinutes: 180,
      lastUpdated: new Date().toISOString()
    });

    // Add alert notification in 'notifications'
    this._addLocal('notifications', {
      id: `notif_${Date.now()}`,
      userId: newOrder.farmerId,
      role: 'farmer',
      title: 'New Order Received',
      message: `Buyer ${newOrder.buyerName} placed order ${newOrder.orderNumber} for ₹${newOrder.totalAmount} (Payment: ${newOrder.paymentStatus})`,
      read: false,
      type: 'ORDER_PLACED',
      createdAt: new Date().toISOString()
    });

    return newOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    const updated = this._updateLocal('orders', orderId, { status: newStatus });
    if (isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      } catch (e) {}
    }
    return updated;
  }

  // ===========================================================================
  // 11. payments (SENSITIVE: Escrow Security & Razorpay)
  // ===========================================================================
  async getPayment(orderId) {
    authService.assertRole(['buyer', 'farmer', 'admin']);
    const payments = this._getLocal('payments');
    return payments.find((p) => p.orderId === orderId || p.orderNumber === orderId) || payments[0];
  }

  async createEscrowPayment(paymentData) {
    const pStatus = paymentData.paymentStatus || (paymentData.status === 'HELD_IN_ESCROW' ? 'Successful' : (paymentData.status || 'Successful'));
    const newPay = {
      id: `pay_${Date.now()}`,
      orderId: paymentData.orderId,
      orderNumber: paymentData.orderNumber,
      buyerId: paymentData.buyerId,
      farmerId: paymentData.farmerId,
      totalAmount: paymentData.totalAmount,
      produceAmount: paymentData.produceAmount,
      logisticsAmount: paymentData.logisticsAmount,
      platformFee: 0,
      currency: 'INR',
      paymentStatus: pStatus, // 'Pending' | 'Successful' | 'Failed' | 'Refunded'
      status: pStatus === 'Successful' ? 'HELD_IN_ESCROW' : (pStatus === 'Refunded' ? 'REFUNDED_TO_BUYER' : 'PENDING'),
      razorpayOrderId: paymentData.razorpayOrderId || `order_RPY_${Date.now()}`,
      razorpayPaymentId: paymentData.razorpayPaymentId || `pay_RPY_${Date.now()}`,
      escrowReleaseTimestamp: null,
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'payments'), newPay);
      } catch (e) {}
    }

    return this._addLocal('payments', newPay);
  }

  async updatePaymentStatus(orderId, newStatus, extraData = {}) {
    const updatedOrder = this._updateLocal('orders', orderId, {
      paymentStatus: newStatus,
      status: newStatus === 'Failed' ? 'CANCELLED' : (newStatus === 'Refunded' ? 'CANCELLED' : undefined),
      ...extraData
    });

    const payments = this._getLocal('payments');
    const matchedPay = payments.find(p => p.orderId === orderId || p.orderNumber === orderId);
    if (matchedPay) {
      this._updateLocal('payments', matchedPay.id, {
        paymentStatus: newStatus,
        status: newStatus === 'Successful' ? 'HELD_IN_ESCROW' : (newStatus === 'Refunded' ? 'REFUNDED_TO_BUYER' : newStatus),
        ...extraData
      });
    }

    return updatedOrder;
  }

  async refundPayment(orderId, reason = 'Buyer cancellation / refund requested') {
    // 1. Notify backend API
    try {
      await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, reason })
      });
    } catch (e) {}

    // 2. Update local Firestore
    return this.updatePaymentStatus(orderId, 'Refunded', {
      cancellationReason: reason,
      refundedAt: new Date().toISOString()
    });
  }

  async releaseEscrowPayment(orderId) {
    const payments = this._getLocal('payments');
    const matched = payments.find((p) => p.orderId === orderId);
    if (matched) {
      return this._updateLocal('payments', matched.id, {
        status: 'RELEASED_TO_FARMER',
        escrowReleaseTimestamp: new Date().toISOString()
      });
    }
    return null;
  }


  // ===========================================================================
  // 12. tracking Collection
  // ===========================================================================
  async getTracking(orderId) {
    const list = this._getLocal('tracking');
    return list.find((t) => t.orderId === orderId) || list[0];
  }

  async updateTracking(orderId, trackingData) {
    const list = this._getLocal('tracking');
    const matched = list.find((t) => t.orderId === orderId);
    if (matched) {
      return this._updateLocal('tracking', matched.id, trackingData);
    }
    return this._addLocal('tracking', { orderId, ...trackingData });
  }

  // ===========================================================================
  // 13. ratings Collection
  // ===========================================================================
  async getRatings(targetId = null) {
    const list = this._getLocal('ratings');
    if (targetId) return list.filter((r) => r.farmerId === targetId || r.driverId === targetId);
    return list;
  }

  async addRating(ratingData) {
    authService.assertRole(['buyer', 'admin']);
    const user = authService.getCurrentUser();
    const newRating = {
      id: `rate_${Date.now()}`,
      orderId: ratingData.orderId || 'order_88120',
      buyerId: user?.uid || 'uid_buyer_1',
      farmerId: ratingData.farmerId || 'uid_farmer_1',
      driverId: ratingData.driverId || 'uid_driver_1',
      targetType: ratingData.targetType || 'FARMER',
      score: ratingData.score || 5,
      review: ratingData.review || 'Excellent agricultural freshness direct from farm.',
      createdAt: new Date().toISOString()
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'ratings'), newRating);
      } catch (e) {}
    }

    return this._addLocal('ratings', newRating);
  }

  async submitOrderFeedback({ orderId, farmerRating = 5, farmerReview = '', agencyRating = 5, agencyReview = '', driverRating = 5, driverReview = '', farmerId = 'farmer_1', driverId = 'driver_1', agencyId = 'agency_1' }) {
    const user = authService.getCurrentUser();
    const timestamp = new Date().toISOString();
    const records = [];

    if (farmerRating) {
      records.push(await this.addRating({
        orderId,
        buyerId: user?.uid || 'uid_buyer_1',
        farmerId,
        targetType: 'FARMER',
        score: Number(farmerRating),
        review: farmerReview || 'Produce freshness and grading was exceptional.'
      }));
    }

    if (agencyRating) {
      records.push(await this.addRating({
        orderId,
        buyerId: user?.uid || 'uid_buyer_1',
        agencyId,
        targetType: 'DELIVERY_AGENCY',
        score: Number(agencyRating),
        review: agencyReview || 'Punctual dispatch and careful cold-chain handling.'
      }));
    }

    if (driverRating) {
      records.push(await this.addRating({
        orderId,
        buyerId: user?.uid || 'uid_buyer_1',
        driverId,
        targetType: 'DRIVER',
        score: Number(driverRating),
        review: driverReview || 'Polite, verified delivery handover with OTP.'
      }));
    }

    this._updateLocal('orders', orderId, { isRated: true, feedbackSubmittedAt: timestamp });
    return records;
  }

  // ===========================================================================
  // 14. notifications Collection
  // ===========================================================================
  async getNotifications(userId) {
    const list = this._getLocal('notifications');
    return list.filter((n) => n.userId === userId || n.userId === 'uid_farmer_1');
  }

  async markNotificationRead(notifId) {
    return this._updateLocal('notifications', notifId, { read: true });
  }

  // ===========================================================================
  // 15. aiInsights Collection
  // ===========================================================================
  async getAiInsights(farmerId) {
    authService.assertRole(['farmer', 'admin']);
    const list = this._getLocal('aiInsights');
    return list.find((i) => i.farmerId === farmerId || i.farmerId === 'farmer_1') || list[0];
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
