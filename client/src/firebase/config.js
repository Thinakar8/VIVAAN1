// =============================================================================
// VIVAAN Agricultural Marketplace - Firebase Configuration
// Connects to Firebase Auth, Firestore, Storage, and Realtime Database
// Zero Secret Credentials - Uses public client identifiers from environment
// =============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Standard public Firebase web configuration (read from Vite environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoVivaanMktplaceKey2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vivaan-agri-marketplace.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vivaan-agri-marketplace',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vivaan-agri-marketplace.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '104582918234',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:104582918234:web:882109bc48d91',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://vivaan-agri-marketplace-default-rtdb.firebaseio.com'
};

// Initialize Firebase App singleton safely
let app;
let auth;
let db;
let storage;
let rtdb;
let isLiveFirebase = false;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  rtdb = getDatabase(app);
  // Set isLiveFirebase to true only when non-demo cloud credentials are provided
  isLiveFirebase = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('Demo')
  );
  console.log('🌾 VIVAAN Firebase SDK initialized with project:', firebaseConfig.projectId, 'Live network:', isLiveFirebase);
} catch (error) {
  console.warn('⚠️ Notice: Initializing VIVAAN Resilient Firebase Bridge (offline/sandbox ready):', error.message);
}

export { app, auth, db, storage, rtdb, isLiveFirebase, firebaseConfig };
