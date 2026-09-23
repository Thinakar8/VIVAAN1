# VIVAAN – Digital Agricultural Marketplace

> **Mission:** Direct farmgate-to-consumer agri-commerce platform connecting farmers, farmer producer organizations (FPOs), consumers, logistics agencies, and carrier drivers with transparent escrow payments and AI-driven agricultural advisory.

---

## 🌟 Key Features

### 1. Multi-Role Ecosystem (6 Roles)
- **Farmer Portal:** Land Patta KYC verification (Own Land, Leased with Agreement, Leased without Agreement), Digital Farmer ID card generation with QR & barcode, produce catalog management with live mandi price benchmarks, and financial order management.
- **FPO (Farmer Producer Organization) Portal:** Collective batching, bulk aggregation, member registry, and high-volume dispatch.
- **Consumer / Buyer Marketplace:** Distance-based farmgate browsing, price transparency breakdown (Produce Amount + Delivery Charge = Total), cart bundling, and secure escrow checkout.
- **Delivery Agency Operations:** 3-tier classification (**GREEN** Local, **ORANGE** District, **BLUE** State), fleet vehicle roster (Two-wheelers, Cars, Pickups, Mini vans, Trucks), cold-chain support, and dispatcher controls.
- **Carrier Driver Portal:** Commercial DL verification, assigned order workflow, turn-by-turn route navigation from farmgate to doorstep, and doorstep 4-digit OTP handover.
- **National Operations Admin Console:** Centralized ledger, live escrow transaction auditing, driver document verification, price monitoring, and multi-agency coverage analytics.

### 2. Privacy & Security Architecture
- **Farmgate & Buyer Location Privacy:** Exact farmgate survey numbers remain private; buyer location is shielded from drivers until produce is physically collected.
- **Live GPS Teardown:** Driver live GPS telemetry terminates immediately upon OTP verification at the doorstep, preserving only historical audit timestamps.
- **Masked Sensitive KYC:** Aadhaar numbers (`XXXX-XXXX-4921`) and bank account numbers (`••••••••6789`) are masked on the frontend.
- **Strict Role-Based Access Control (RBAC):** Firestore rules, Firebase Storage security, and Realtime Database access restrict data mutations to authenticated parties.

### 3. AI & Optimization Engine
- **Farmer Agronomist AI:** Localized soil and season recommendations, crop disease advisory, 30/60/90-day produce availability forecasting, and post-harvest loss prevention analysis.
- **Logistics AI Sizing & TSP Consolidation:** Automated vehicle sizing based on payload weight/volume and multi-stop Traveling Salesperson Problem (TSP) corridor route optimization.
- **Driver AI Copilot:** Dynamic route guidance, backhaul load matching, and carrier fuel efficiency analytics.

### 4. Multilingual Experience
- **14 Indian Languages:** Full language switching support (English, Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Assamese, Urdu, Sanskrit) via universal top-right selector.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [Python](https://www.python.org/) 3.10+ (optional, for backend microservices)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Thinakar8/VIVAAN-WEB-WEB.git
cd VIVAAN

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### 2. Build Frontend
```bash
cd client
npm run build
cd ..
```

### 3. Run the Platform
Start the unified backend server (serves the API and client application):
```bash
cd server
node server.js
```

Open your browser and navigate to:
- **Application Portal:** [http://localhost:5000](http://localhost:5000)
- **Health Check API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 Repository Structure

```
VIVAAN/
├── client/                     # React + Vite frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── context/            # React AppContext (Auth, Cart, Orders)
│   │   ├── firebase/           # Firebase SDK, Auth, Firestore & RTDB services
│   │   ├── i18n/               # 14-language dictionary & localization
│   │   ├── views/              # Role-specific portals (Farmer, Buyer, Agency, Driver, Admin)
│   │   └── main.jsx            # Application entry point
│   └── package.json
├── server/                     # Node.js Express backend & API services
│   ├── server.js               # Primary API server, Escrow, and Telemetry endpoints
│   ├── services/               # AI agronomy, demand forecasting & route optimization
│   └── test_*.js               # Automated headless verification suites
├── backend/                    # Python FastAPI microservices (alternative API)
├── firestore.rules             # Cloud Firestore security rules (15 collections)
├── storage.rules               # Firebase Storage security rules
├── database.rules.json         # Realtime Database security rules
└── README.md
```

---

## 🧪 Automated Verification Suites

The repository contains comprehensive test suites verifying end-to-end functionality:
```bash
# Run end-to-end system test
node server/test_e2e.js

# Run delivery tracking and telemetry privacy test
node server/test_delivery_tracking.js

# Run full system security and multi-role audit
node server/test_full_system_audit.js

# Run Firebase security and database operations test
node server/test_firebase.js
```

---

## 📄 License
This project is open-source under the MIT License.
