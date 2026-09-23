// =============================================================================
// VIVAAN Agricultural Marketplace - Firebase Initial Seed Data
// Covers all 15 collections with realistic VIVAAN platform data
// =============================================================================

export const INITIAL_SEED_DATA = {
  // 1. users
  users: [
    {
      id: 'uid_farmer_1',
      uid: 'uid_farmer_1',
      email: 'farmer.ramasamy@vivaan.agri',
      displayName: 'Ramasamy Gounder',
      role: 'farmer',
      phone: '+91 98421 88210',
      status: 'ACTIVE',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'uid_buyer_1',
      uid: 'uid_buyer_1',
      email: 'buyer.aditi@vivaan.agri',
      displayName: 'Aditi Sharma',
      role: 'buyer',
      phone: '+91 98765 43210',
      status: 'ACTIVE',
      createdAt: '2026-02-14T10:30:00Z'
    },
    {
      id: 'uid_agency_1',
      uid: 'uid_agency_1',
      email: 'logistics@greencorridor.in',
      displayName: 'GreenCorridor Agro Logistics',
      role: 'agency',
      phone: '+91 44 2841 9900',
      status: 'ACTIVE',
      createdAt: '2026-01-05T09:15:00Z'
    },
    {
      id: 'uid_driver_1',
      uid: 'uid_driver_1',
      email: 'driver.murugan@greencorridor.in',
      displayName: 'Murugan K',
      role: 'driver',
      phone: '+91 94432 19842',
      status: 'ACTIVE',
      createdAt: '2026-01-20T11:00:00Z'
    },
    {
      id: 'uid_admin_1',
      uid: 'uid_admin_1',
      email: 'admin@vivaan.gov.in',
      displayName: 'VIVAAN National Admin',
      role: 'admin',
      phone: '+91 11 2338 0001',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ],

  // 2. farmers
  farmers: [
    {
      id: 'farmer_1',
      userId: 'uid_farmer_1',
      name: 'Ramasamy Gounder',
      uniqueFarmerId: 'VIV-FR-104582',
      state: 'Tamil Nadu',
      district: 'Salem',
      village: 'Omalur',
      totalAcres: 5.5,
      primaryCrops: ['Turmeric', 'Rice', 'Small Onions', 'Malgoa Mango'],
      verified: true,
      rating: 4.9,
      pattaNumber: 'PATTA-SLM-2024-8821',
      ownershipType: 'Own Land',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      bankAccountMasked: 'HDFC •••• •••• 4891',
      createdAt: '2026-01-10T08:30:00Z'
    },
    {
      id: 'farmer_2',
      userId: 'uid_farmer_2',
      name: 'Kavitha Sundaram',
      uniqueFarmerId: 'VIV-FR-208914',
      state: 'Tamil Nadu',
      district: 'The Nilgiris',
      village: 'Kotagiri',
      totalAcres: 4.2,
      primaryCrops: ['Hill Garlic', 'Organic Carrots', 'Green Tea'],
      verified: true,
      rating: 4.95,
      pattaNumber: 'PATTA-NIL-2023-4102',
      ownershipType: 'Own Land',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
      bankAccountMasked: 'SBI •••• •••• 7123',
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'farmer_3',
      userId: 'uid_farmer_3',
      name: 'Muthukumar Natarajan',
      uniqueFarmerId: 'VIV-FR-304192',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      village: 'Kumbakonam',
      totalAcres: 8.0,
      primaryCrops: ['Ponni Paddy', 'Karuppu Kavuni Rice'],
      verified: true,
      rating: 4.85,
      pattaNumber: 'PATTA-THJ-2022-9018',
      ownershipType: 'Leased Land With Agreement',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      bankAccountMasked: 'Canara •••• •••• 5590',
      createdAt: '2026-01-20T10:15:00Z'
    }
  ],

  // 3. farmerVerification (SENSITIVE)
  farmerVerification: [
    {
      id: 'verif_farmer_1',
      farmerId: 'farmer_1',
      userId: 'uid_farmer_1',
      aadhaarHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      pattaNumber: 'PATTA-SLM-2024-8821',
      landAuditStatus: 'VERIFIED',
      verificationAuthority: 'Revenue Dept, Salem Collectorate',
      verifiedAt: '2026-01-12T14:20:00Z',
      documentUrl: '/docs/patta-salem-8821.pdf'
    }
  ],

  // 4. landRecords (SENSITIVE)
  landRecords: [
    {
      id: 'land_farmer_1',
      farmerId: 'farmer_1',
      userId: 'uid_farmer_1',
      surveyNumber: '142/3A',
      pattaNumber: 'PATTA-SLM-2024-8821',
      extentAcres: 5.5,
      soilType: 'Red Loamy Soil',
      irrigationSource: 'Cauvery Canal & Open Well',
      ownershipType: 'OWN',
      village: 'Omalur',
      district: 'Salem',
      state: 'Tamil Nadu'
    }
  ],

  // 5. farmerProducts (Public Harvest Catalog)
  farmerProducts: [
    {
      id: 'prod_1',
      farmerId: 'farmer_1',
      farmerName: 'Ramasamy Gounder',
      uniqueFarmerId: 'VIV-FR-104582',
      userId: 'uid_farmer_1',
      title: 'Salem Pure Organic Turmeric (Haldi)',
      category: 'Spices',
      pricePerUnit: 160,
      mandiPrice: 110,
      mandiSpread: 50,
      unit: 'kg',
      availableStock: 210,
      minOrderQty: 5,
      harvestDate: '2026-02-10',
      organic: true,
      photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      village: 'Omalur',
      district: 'Salem',
      state: 'Tamil Nadu',
      distanceKm: 18,
      corridorType: 'NEARBY',
      description: 'Potent curcumin-rich organic turmeric fingers cultivated in red loamy soil with canal irrigation.',
      createdAt: '2026-02-15T09:00:00Z'
    },
    {
      id: 'prod_2',
      farmerId: 'farmer_3',
      farmerName: 'Muthukumar Natarajan',
      uniqueFarmerId: 'VIV-FR-304192',
      userId: 'uid_farmer_3',
      title: 'Ponni Boiled Rice (Old Harvest)',
      category: 'Grains & Cereals',
      pricePerUnit: 3400,
      mandiPrice: 2600,
      mandiSpread: 800,
      unit: 'Quintal',
      availableStock: 65,
      minOrderQty: 1,
      harvestDate: '2026-01-05',
      organic: false,
      photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      village: 'Kumbakonam',
      district: 'Thanjavur',
      state: 'Tamil Nadu',
      distanceKm: 195,
      corridorType: 'LONG_DISTANCE',
      description: 'Aged single-origin Cauvery delta Ponni paddy, naturally sun-dried and gently steam-parboiled.',
      createdAt: '2026-02-16T11:20:00Z'
    },
    {
      id: 'prod_3',
      farmerId: 'farmer_1',
      farmerName: 'Ramasamy Gounder',
      uniqueFarmerId: 'VIV-FR-104582',
      userId: 'uid_farmer_1',
      title: 'Farm-Fresh Country Small Onions (Shallots)',
      category: 'Vegetables',
      pricePerUnit: 45,
      mandiPrice: 28,
      mandiSpread: 17,
      unit: 'kg',
      availableStock: 380,
      minOrderQty: 10,
      harvestDate: '2026-02-18',
      organic: false,
      photoUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      village: 'Omalur',
      district: 'Salem',
      state: 'Tamil Nadu',
      distanceKm: 24,
      corridorType: 'NEARBY',
      description: 'Crisp, pungent sambar shallots harvested 48 hours ago from drip-irrigated farmland.',
      createdAt: '2026-02-19T07:45:00Z'
    },
    {
      id: 'prod_4',
      farmerId: 'farmer_2',
      farmerName: 'Kavitha Sundaram',
      uniqueFarmerId: 'VIV-FR-208914',
      userId: 'uid_farmer_2',
      title: 'Nilgiris Organic Hill Garlic (GI Tag)',
      category: 'Vegetables',
      pricePerUnit: 240,
      mandiPrice: 175,
      mandiSpread: 65,
      unit: 'kg',
      availableStock: 140,
      minOrderQty: 2,
      harvestDate: '2026-02-12',
      organic: true,
      photoUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      village: 'Kotagiri',
      district: 'The Nilgiris',
      state: 'Tamil Nadu',
      distanceKm: 215,
      corridorType: 'LONG_DISTANCE',
      description: 'High-altitude cold-climate organic hill garlic with verified Geographical Indication (GI).',
      createdAt: '2026-02-20T10:00:00Z'
    },
    {
      id: 'prod_5',
      farmerId: 'farmer_1',
      farmerName: 'Ramasamy Gounder',
      uniqueFarmerId: 'VIV-FR-104582',
      userId: 'uid_farmer_1',
      title: 'Salem Malgoa Sweet Mangoes (Pre-booking)',
      category: 'Fruits',
      pricePerUnit: 180,
      mandiPrice: 130,
      mandiSpread: 50,
      unit: 'kg',
      availableStock: 250,
      minOrderQty: 5,
      harvestDate: '2026-03-01',
      organic: true,
      photoUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      village: 'Omalur',
      district: 'Salem',
      state: 'Tamil Nadu',
      distanceKm: 30,
      corridorType: 'NEARBY',
      description: 'Naturally tree-ripened royal Salem Malgoa mangoes with zero chemical carbide ripening.',
      createdAt: '2026-02-21T08:15:00Z'
    }
  ],

  // 6. buyers
  buyers: [
    {
      id: 'buyer_1',
      userId: 'uid_buyer_1',
      fullName: 'Aditi Sharma',
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com',
      phone: '+91 98765 43210',
      mobile: '+91 98765 43210',
      state: 'Tamil Nadu',
      district: 'Chennai',
      cityVillage: 'Adyar',
      pincode: '600020',
      deliveryAddress: 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar',
      buyerType: 'Retail Consumer',
      authProvider: 'google.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      createdAt: '2026-02-14T10:30:00Z'
    }
  ],

  // 7. deliveryAgencies
  deliveryAgencies: [
    {
      id: 'agency_1',
      agencyId: 'VIV-AG-104582',
      userId: 'uid_agency_1',
      legalName: 'GreenCorridor Agro Logistics Private Limited',
      brandName: 'GreenCorridor Agro Logistics',
      agencyName: 'GreenCorridor Agro Logistics',
      corporateOffice: 'Plot 12, SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu',
      businessTaxId: '33AABCG1234F1Z5',
      contactPerson: 'Sundaramurthy Pillai (VP Logistics)',
      contactPhone: '+91 98421 77650',
      contactEmail: 'logistics@greencorridor.vivaan.agri',
      states: ['Tamil Nadu'],
      districts: ['Salem', 'Chennai', 'Coimbatore', 'Erode', 'Namakkal', 'Dharmapuri', 'Thanjavur'],
      taluks: ['Omalur', 'Salem West', 'Guindy', 'Adyar', 'Kumbakonam', 'RS Puram'],
      serviceableAreas: 'Salem-Chennai Agri Corridor, Cauvery Delta & Western Agro Belt',
      noGoAreas: 'Inaccessible Ghat roads beyond Valparai during monsoon; unpaved foot-trails',
      warehouses: ['Salem Central Cold Hub', 'Chennai Guindy Cross-Dock', 'Coimbatore Agro Facility'],
      vehicleTypes: ['Tata Ace Pickup', 'Mahindra Bolero Maxi Truck', '16T Refrigerated Truck'],
      fleetSize: 14,
      ownedVehiclesCount: 10,
      outsourcedVehiclesCount: 4,
      avgTransitTimeHours: 4.5,
      maxWeightCapacityKg: 18000,
      maxVolumeCapacityCuFt: 1200,
      classification: 'BLUE', // BLUE = State Level Delivery Agency
      classificationLabel: 'State Level Delivery Agency',
      classificationColor: 'blue',
      verified: true,
      carrierRating: 4.9,
      completedDeliveriesCount: 412,
      totalLogisticsEarnings: 52400,
      createdAt: '2026-01-05T09:15:00Z'
    }
  ],

  // 8. drivers
  drivers: [
    {
      id: 'driver_1',
      vivaanId: 'VIV-DR-104582',
      userId: 'uid_driver_1',
      agencyId: 'agency_1',
      name: 'Murugan K',
      fullName: 'Murugan Karuppasamy',
      phone: '+91 94432 19842',
      altPhone: '+91 98420 55123',
      dob: '1988-06-14',
      address: '12/4, Mariamman Kovil Street, Omalur, Salem - 636455',
      kycType: 'Aadhaar Card',
      kycMasked: 'XXXX-XXXX-4819',
      commercialDlNumber: 'TN-30-2018-0098421',
      licenseClass: 'LMV (Light Motor Vehicle)',
      dlExpiry: '2030-05-15',
      experienceYears: 8,
      state: 'Tamil Nadu',
      district: 'Salem',
      familiarTaluks: ['Omalur', 'Salem West', 'Mettur', 'Adyar', 'Guindy'],
      languages: ['Tamil', 'English'],
      vehicleOwner: 'Agency Provided',
      vehicleId: 'veh_1',
      vehicleType: 'Tata Ace Pickup',
      vehicleNo: 'TN-30-AZ-8120',
      vehicleCapacityKg: 1200,
      hasColdChain: true,
      hasSmartphone: true,
      codHandling: true,
      heavyLifting: true,
      preferredShift: 'Morning & Full Day',
      rating: 4.92,
      tripsCompleted: 148,
      todayEarnings: 840,
      weeklyEarnings: 5880,
      totalEarnings: 42600,
      status: 'AVAILABLE', // 'AVAILABLE' | 'IN_TRANSIT' | 'OFF_DUTY'
      createdAt: '2026-01-20T11:00:00Z'
    },
    {
      id: 'driver_2',
      vivaanId: 'VIV-DR-209841',
      userId: 'uid_driver_2',
      agencyId: 'agency_1',
      name: 'Selvakumar R',
      fullName: 'Selvakumar Ramachandran',
      phone: '+91 98421 99120',
      altPhone: '+91 94431 88201',
      dob: '1992-03-22',
      address: '45, Anna Nagar East, Salem - 636001',
      kycType: 'Aadhaar Card',
      kycMasked: 'XXXX-XXXX-9120',
      commercialDlNumber: 'TN-30-2020-0012495',
      licenseClass: 'HGV (Heavy Goods Vehicle)',
      dlExpiry: '2032-11-20',
      experienceYears: 6,
      state: 'Tamil Nadu',
      district: 'Salem',
      familiarTaluks: ['Salem', 'Attur', 'Sankari', 'Erode', 'Coimbatore'],
      languages: ['Tamil', 'Kannada'],
      vehicleOwner: 'Self-owned',
      vehicleId: 'veh_2',
      vehicleType: 'Mahindra Bolero Maxi Truck',
      vehicleNo: 'TN-30-BY-9412',
      vehicleCapacityKg: 2500,
      hasColdChain: true,
      hasSmartphone: true,
      codHandling: true,
      heavyLifting: true,
      preferredShift: 'Flexible Full Day',
      rating: 4.88,
      tripsCompleted: 94,
      todayEarnings: 650,
      weeklyEarnings: 4550,
      totalEarnings: 29800,
      status: 'AVAILABLE',
      createdAt: '2026-02-01T10:00:00Z'
    }
  ],

  // 9. vehicles
  vehicles: [
    {
      id: 'veh_1',
      agencyId: 'agency_1',
      registrationNumber: 'TN-30-AZ-8120',
      vehicleType: 'Tata Ace Pickup',
      payloadCapacityKg: 1200,
      volumeCapacityCuFt: 140,
      hasColdChain: true,
      status: 'ACTIVE',
      createdAt: '2026-01-10T10:00:00Z'
    },
    {
      id: 'veh_2',
      agencyId: 'agency_1',
      registrationNumber: 'TN-30-BY-9412',
      vehicleType: 'Mahindra Bolero Maxi Truck',
      payloadCapacityKg: 2500,
      volumeCapacityCuFt: 280,
      hasColdChain: true,
      status: 'ACTIVE',
      createdAt: '2026-01-12T12:00:00Z'
    },
    {
      id: 'veh_3',
      agencyId: 'agency_1',
      registrationNumber: 'TN-30-CZ-4501',
      vehicleType: '16T Refrigerated Truck',
      payloadCapacityKg: 16000,
      volumeCapacityCuFt: 1100,
      hasColdChain: true,
      status: 'ACTIVE',
      createdAt: '2026-01-15T09:00:00Z'
    }
  ],

  // 10. orders
  orders: [
    {
      id: 'order_88120',
      orderNumber: 'VIV-ORD-88120',
      orderId: 'VIV-ORD-88120',
      trackingId: 'TRK-VIV-88120',
      buyerId: 'uid_buyer_1',
      buyerName: 'Aditi Sharma',
      buyerPhone: '+91 98765 43210',
      farmerId: 'uid_farmer_1',
      farmerName: 'Ramasamy Gounder',
      farmerPhone: '+91 98421 04582',
      farmerVillage: 'Omalur',
      farmerDistrict: 'Salem',
      farmerState: 'Tamil Nadu',
      assignedAgencyId: 'agency_1',
      assignedDriverId: 'driver_1',
      items: [
        {
          productId: 'prod_1',
          title: 'Salem Pure Organic Turmeric (Haldi)',
          quantity: 10,
          unit: 'kg',
          pricePerUnit: 160
        }
      ],
      cargoWeightKg: 10,
      cargoVolumeCuFt: 1.5,
      requiresColdChain: true,
      produceSubtotal: 1600,
      logisticsFee: 120,
      totalAmount: 1720,
      deliveryAddress: {
        street: 'Flat 4B, Greenview Apts, 2nd Avenue, Adyar',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'IN_TRANSIT',
      otpCode: '4819',
      paymentStatus: 'Successful', // Required: 'Pending' | 'Successful' | 'Failed' | 'Refunded'
      escrowStatus: 'HELD_IN_ESCROW',
      razorpayOrderId: 'order_rzp_88120_live',
      razorpayPaymentId: 'pay_rzp_88120_success',
      createdAt: '2026-02-21T08:30:00Z',
      updatedAt: '2026-02-21T09:15:00Z'
    },
    {
      id: 'order_88125',
      orderNumber: 'VIV-ORD-88125',
      orderId: 'VIV-ORD-88125',
      trackingId: 'TRK-VIV-88125',
      buyerId: 'uid_buyer_1',
      buyerName: 'Gourmet Kitchens Ltd',
      buyerPhone: '+91 98412 88401',
      farmerId: 'uid_farmer_1',
      farmerName: 'Ramasamy Gounder',
      farmerPhone: '+91 98421 04582',
      farmerVillage: 'Omalur',
      farmerDistrict: 'Salem',
      farmerState: 'Tamil Nadu',
      assignedAgencyId: null,
      assignedDriverId: null,
      items: [
        {
          productId: 'prod_3',
          title: 'Farm-Fresh Country Small Onions (Shallots)',
          quantity: 15,
          unit: 'kg',
          pricePerUnit: 45
        }
      ],
      cargoWeightKg: 15,
      cargoVolumeCuFt: 2.0,
      requiresColdChain: false,
      produceSubtotal: 675,
      logisticsFee: 140,
      totalAmount: 815,
      deliveryAddress: {
        street: 'Plot 88, Anna Nagar West',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'CONFIRMED',
      otpCode: '3152',
      paymentStatus: 'Successful',
      escrowStatus: 'HELD_IN_ESCROW',
      razorpayOrderId: 'order_rzp_88125_live',
      razorpayPaymentId: 'pay_rzp_88125_success',
      createdAt: '2026-02-22T06:45:00Z',
      updatedAt: '2026-02-22T06:45:00Z'
    },
    {
      id: 'order_88140_pending',
      orderNumber: 'VIV-ORD-88140',
      orderId: 'VIV-ORD-88140',
      trackingId: 'TRK-VIV-88140',
      buyerId: 'uid_buyer_1',
      buyerName: 'Aditi Sharma',
      farmerId: 'uid_farmer_1',
      farmerName: 'Ramasamy Gounder',
      assignedAgencyId: 'agency_1',
      assignedDriverId: null,
      items: [
        {
          productId: 'prod_4',
          title: 'Nilgiris Organic Hill Garlic (GI Tag)',
          quantity: 3,
          unit: 'kg',
          pricePerUnit: 240
        }
      ],
      cargoWeightKg: 3,
      produceSubtotal: 720,
      logisticsFee: 120,
      totalAmount: 840,
      deliveryAddress: {
        street: 'Flat 4B, Greenview Apts, Adyar',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'CONFIRMED',
      otpCode: '6140',
      paymentStatus: 'Pending', // Demonstrates 'Pending' state
      escrowStatus: 'PENDING_AUTHORIZATION',
      razorpayOrderId: 'order_rzp_88140_pending',
      createdAt: '2026-02-23T05:00:00Z',
      updatedAt: '2026-02-23T05:00:00Z'
    },
    {
      id: 'order_88145_failed',
      orderNumber: 'VIV-ORD-88145',
      orderId: 'VIV-ORD-88145',
      trackingId: 'TRK-VIV-88145',
      buyerId: 'uid_buyer_1',
      buyerName: 'Aditi Sharma',
      farmerId: 'uid_farmer_2',
      farmerName: 'Kavitha Sundaram',
      assignedAgencyId: null,
      assignedDriverId: null,
      items: [
        {
          productId: 'prod_4',
          title: 'Nilgiris Organic Hill Garlic (GI Tag)',
          quantity: 2,
          unit: 'kg',
          pricePerUnit: 240
        }
      ],
      cargoWeightKg: 2,
      produceSubtotal: 480,
      logisticsFee: 120,
      totalAmount: 600,
      deliveryAddress: {
        street: 'Flat 4B, Greenview Apts, Adyar',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'CANCELLED',
      cancellationReason: 'Payment declined / verification timeout',
      otpCode: '9901',
      paymentStatus: 'Failed', // Demonstrates 'Failed' state
      escrowStatus: 'FAILED',
      razorpayOrderId: 'order_rzp_88145_declined',
      createdAt: '2026-02-23T05:30:00Z',
      updatedAt: '2026-02-23T05:31:00Z'
    },
    {
      id: 'order_88130_heavy',
      orderNumber: 'VIV-ORD-88130',
      orderId: 'VIV-ORD-88130',
      trackingId: 'TRK-VIV-88130',
      buyerId: 'uid_buyer_1',
      buyerName: 'Tamil Nadu Agro Mills',
      buyerPhone: '+91 94432 00119',
      farmerId: 'uid_farmer_3',
      farmerName: 'Muthukumar Natarajan',
      farmerPhone: '+91 94430 77112',
      farmerVillage: 'Kumbakonam',
      farmerDistrict: 'Thanjavur',
      farmerState: 'Tamil Nadu',
      assignedAgencyId: null,
      assignedDriverId: null,
      items: [
        {
          productId: 'prod_2',
          title: 'Ponni Boiled Rice (Old Harvest)',
          quantity: 25,
          unit: 'Quintal',
          pricePerUnit: 3400
        }
      ],
      cargoWeightKg: 2500,
      cargoVolumeCuFt: 180,
      requiresColdChain: false,
      produceSubtotal: 85000,
      logisticsFee: 3200,
      totalAmount: 88200,
      deliveryAddress: {
        street: 'Grain Mandi Complex, Koyambedu',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'CONFIRMED',
      otpCode: '7721',
      paymentStatus: 'Successful',
      escrowStatus: 'HELD_IN_ESCROW',
      createdAt: '2026-02-22T07:15:00Z',
      updatedAt: '2026-02-22T07:15:00Z'
    },
    {
      id: 'order_88090_completed',
      orderNumber: 'VIV-ORD-88090',
      orderId: 'VIV-ORD-88090',
      trackingId: 'TRK-VIV-88090',
      buyerId: 'uid_buyer_1',
      buyerName: 'Aditi Sharma',
      farmerId: 'uid_farmer_1',
      farmerName: 'Ramasamy Gounder',
      assignedAgencyId: 'agency_1',
      assignedDriverId: 'driver_1',
      items: [
        {
          productId: 'prod_5',
          title: 'Salem Malgoa Sweet Mangoes',
          quantity: 20,
          unit: 'kg',
          pricePerUnit: 180
        }
      ],
      cargoWeightKg: 20,
      cargoVolumeCuFt: 3.0,
      produceSubtotal: 3600,
      logisticsFee: 180,
      totalAmount: 3780,
      deliveryAddress: {
        street: 'Flat 4B, Greenview Apts, Adyar',
        district: 'Chennai',
        state: 'Tamil Nadu'
      },
      status: 'DELIVERED',
      otpCode: '5519',
      paymentStatus: 'Successful',
      escrowStatus: 'RELEASED_TO_FARMER',
      createdAt: '2026-02-18T10:00:00Z',
      updatedAt: '2026-02-18T15:30:00Z'
    },
    {
      id: 'order_88075_cancelled',
      orderNumber: 'VIV-ORD-88075',
      orderId: 'VIV-ORD-88075',
      trackingId: 'TRK-VIV-88075',
      buyerId: 'uid_buyer_1',
      buyerName: 'Coimbatore Fruit House',
      farmerId: 'uid_farmer_1',
      farmerName: 'Ramasamy Gounder',
      assignedAgencyId: 'agency_1',
      assignedDriverId: 'driver_1',
      items: [
        {
          productId: 'prod_5',
          title: 'Salem Malgoa Sweet Mangoes',
          quantity: 10,
          unit: 'kg',
          pricePerUnit: 180
        }
      ],
      cargoWeightKg: 10,
      produceSubtotal: 1800,
      logisticsFee: 120,
      totalAmount: 1920,
      deliveryAddress: {
        street: 'Valparai High Ghat Road',
        district: 'Coimbatore',
        state: 'Tamil Nadu'
      },
      status: 'CANCELLED',
      cancellationReason: 'Delivery destination located in Restricted No-Go Area during heavy monsoon landslides',
      otpCode: '1092',
      paymentStatus: 'Refunded', // Demonstrates 'Refunded' state
      escrowStatus: 'REFUNDED_TO_BUYER',
      createdAt: '2026-02-17T09:00:00Z',
      updatedAt: '2026-02-17T11:00:00Z'
    }
  ],


  // 11. payments (SENSITIVE ESCROW)
  payments: [
    {
      id: 'pay_88120',
      orderId: 'order_88120',
      buyerId: 'uid_buyer_1',
      farmerId: 'uid_farmer_1',
      totalAmount: 1720,
      produceAmount: 1600,
      logisticsAmount: 120,
      platformFee: 0,
      currency: 'INR',
      status: 'HELD_IN_ESCROW',
      razorpayOrderId: 'order_RPY88120ESCROW',
      razorpayPaymentId: 'pay_RPY88120SUCCESS',
      escrowReleaseTimestamp: null,
      createdAt: '2026-02-21T08:31:00Z'
    }
  ],

  // 12. tracking (Live dispatch milestones & snapshot)
  tracking: [
    {
      id: 'track_88120',
      orderId: 'order_88120',
      driverId: 'uid_driver_1',
      driverName: 'Murugan K',
      currentLat: 11.6643,
      currentLng: 78.1460,
      heading: 45,
      speedKmh: 42,
      origin: 'Omalur, Salem',
      destination: 'Adyar, Chennai',
      status: 'IN_TRANSIT',
      etaMinutes: 210,
      lastUpdated: '2026-02-21T09:40:00Z'
    }
  ],

  // 13. ratings (Public feedback)
  ratings: [
    {
      id: 'rate_1',
      orderId: 'order_88100',
      buyerId: 'uid_buyer_1',
      farmerId: 'uid_farmer_1',
      driverId: 'uid_driver_1',
      targetType: 'FARMER',
      score: 5,
      review: 'Exceptional organic turmeric quality! Direct from farm gate with genuine aroma.',
      createdAt: '2026-02-15T16:00:00Z'
    },
    {
      id: 'rate_2',
      orderId: 'order_88100',
      buyerId: 'uid_buyer_1',
      farmerId: 'uid_farmer_1',
      driverId: 'uid_driver_1',
      targetType: 'DRIVER',
      score: 5,
      review: 'Murugan delivered precisely on time with careful produce handling.',
      createdAt: '2026-02-15T16:05:00Z'
    }
  ],

  // 14. notifications
  notifications: [
    {
      id: 'notif_1',
      userId: 'uid_farmer_1',
      role: 'farmer',
      title: 'New Order Received',
      message: 'Buyer Aditi Sharma placed Order VIV-ORD-88120 for 10kg Turmeric.',
      read: false,
      type: 'ORDER_PLACED',
      createdAt: '2026-02-21T08:31:00Z'
    },
    {
      id: 'notif_2',
      userId: 'uid_driver_1',
      role: 'driver',
      title: 'Dispatch Assignment',
      message: 'Assigned to collect 10kg Turmeric from Omalur, Salem for Adyar, Chennai.',
      read: true,
      type: 'TRIP_ASSIGNED',
      createdAt: '2026-02-21T08:45:00Z'
    },
    {
      id: 'notif_3',
      userId: 'uid_buyer_1',
      role: 'buyer',
      title: 'Harvest Picked Up',
      message: 'Carrier driver Murugan K has collected your fresh harvest from the farm gate.',
      read: false,
      type: 'DISPATCH_IN_TRANSIT',
      createdAt: '2026-02-21T09:15:00Z'
    }
  ],

  // 15. aiInsights
  aiInsights: [
    {
      id: 'insight_farmer_1',
      farmerId: 'farmer_1',
      userId: 'uid_farmer_1',
      soilHealthReport: {
        soilType: 'Red Loam',
        phLevel: 6.8,
        nitrogen: 'Medium',
        organicCarbon: 'High',
        recommendation: 'Optimal soil condition for spice cultivation; add bio-potash before rainy spell.'
      },
      demandForecast: {
        crop: 'Turmeric',
        expectedPriceRange: '₹155 - ₹175 / kg',
        trend: 'BULLISH',
        recommendation: 'Hold stock for next 15 days as wedding and festival demand creates +18% price surge.'
      },
      weatherAdvisory: {
        rainfallProbability: '10%',
        temperatureRange: '24°C - 33°C',
        action: 'Favorable harvesting and outdoor solar drying conditions for next 72 hours.'
      },
      createdAt: '2026-02-21T06:00:00Z'
    }
  ]
};
