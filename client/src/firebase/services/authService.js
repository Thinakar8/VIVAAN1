// =============================================================================
// VIVAAN Agricultural Marketplace - Firebase Authentication Service
// Role-Based Access Control (RBAC) & User Profile Synchronization
// =============================================================================

import { auth, db, isLiveFirebase } from '../config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { INITIAL_SEED_DATA } from '../seedData';

// Local storage key for fallback auth persistence
const AUTH_STORAGE_KEY = 'vivaan_firebase_user';

class AuthService {
  constructor() {
    this.currentUser = this._loadCachedUser();
    this.listeners = [];

    if (isLiveFirebase && auth) {
      try {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const profile = await this.getUserProfile(user.uid);
            this.currentUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || profile?.displayName || 'VIVAAN User',
              role: profile?.role || 'farmer',
              phone: profile?.phone || '',
              status: profile?.status || 'ACTIVE'
            };
          } else {
            // Keep active demo user or null
            if (!this.currentUser) this.currentUser = null;
          }
          this._persistUser();
          this._notifyListeners();
        });
      } catch (err) {
        console.warn('Firebase onAuthStateChanged notice:', err.message);
      }
    }
  }

  _loadCachedUser() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to initial farmer user for demo flow
    return INITIAL_SEED_DATA.users[0];
  }

  _persistUser() {
    if (this.currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  _notifyListeners() {
    this.listeners.forEach((fn) => fn(this.currentUser));
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserRole() {
    return this.currentUser?.role || 'farmer';
  }

  // Seamless Role Switcher: Authenticates the user under the desired agricultural role
  async loginAsRole(roleId) {
    const matchedUser = INITIAL_SEED_DATA.users.find((u) => u.role === roleId) || {
      id: `uid_${roleId}_demo`,
      uid: `uid_${roleId}_demo`,
      email: `${roleId}@vivaan.agri`,
      displayName: `VIVAAN ${roleId.toUpperCase()}`,
      role: roleId,
      phone: '+91 98000 00000',
      status: 'ACTIVE'
    };

    this.currentUser = { ...matchedUser };
    this._persistUser();
    this._notifyListeners();

    // Sync to Firestore 'users' collection
    try {
      if (isLiveFirebase && db) {
        await setDoc(doc(db, 'users', matchedUser.uid), matchedUser, { merge: true });
      }
    } catch (err) {
      console.warn('Sync to Firestore users notice:', err.message);
    }

    return this.currentUser;
  }

  assertRole(allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const user = this.getCurrentUser();
    const role = user?.role || localStorage.getItem('vivaan_role_id') || 'farmer';
    if (!allowedRoles.includes(role)) {
      throw new Error(`Unauthorized: Role '${role}' is not permitted.`);
    }
    return true;
  }

  // Google / Gmail Authentication Provider
  async signInWithGoogle(customEmail = null, customName = null, customPhoto = null) {
    const email = customEmail || 'buyer.aditi@gmail.com';
    const displayName = customName || 'Aditi Sharma';
    const photoURL = customPhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300';

    this.currentUser = {
      id: 'uid_buyer_1',
      uid: 'uid_buyer_1',
      email,
      displayName,
      role: 'buyer',
      phone: '+91 98765 43210',
      photoURL,
      authProvider: 'google.com',
      isGoogleAuth: true,
      status: 'ACTIVE'
    };
    this._persistUser();
    this._notifyListeners();

    try {
      if (isLiveFirebase && db) {
        await setDoc(doc(db, 'users', 'uid_buyer_1'), this.currentUser, { merge: true });
      }
    } catch (e) {}

    return this.currentUser;
  }

  updateUserProfile(updates) {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      ...updates
    };
    this._persistUser();
    this._notifyListeners();
  }

  async signIn(email, password) {
    if (isLiveFirebase && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await this.getUserProfile(cred.user.uid);
        this.currentUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || profile?.displayName || email.split('@')[0],
          role: profile?.role || 'buyer',
          phone: profile?.phone || ''
        };
        this._persistUser();
        this._notifyListeners();
        return this.currentUser;
      } catch (e) {
        console.warn('Falling back to local auth:', e.message);
      }
    }

    // Local authentication fallback
    const matched = INITIAL_SEED_DATA.users.find((u) => u.email === email);
    if (matched) {
      this.currentUser = { ...matched };
      this._persistUser();
      this._notifyListeners();
      return this.currentUser;
    }

    const newUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: 'buyer',
      status: 'ACTIVE'
    };
    this.currentUser = newUser;
    this._persistUser();
    this._notifyListeners();
    return newUser;
  }

  async signUp(email, password, displayName, role = 'farmer', phone = '') {
    if (isLiveFirebase && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        const userDoc = {
          uid: cred.user.uid,
          email,
          displayName,
          role,
          phone,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), userDoc);
        }
        this.currentUser = userDoc;
        this._persistUser();
        this._notifyListeners();
        return userDoc;
      } catch (e) {
        console.warn('Sign-up falling back to local:', e.message);
      }
    }

    const newUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName,
      role,
      phone,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.currentUser = newUser;
    this._persistUser();
    this._notifyListeners();
    return newUser;
  }

  async signOut() {
    if (isLiveFirebase && auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    this.currentUser = null;
    this._persistUser();
    this._notifyListeners();
  }

  async getUserProfile(uid) {
    if (isLiveFirebase && db) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) return snap.data();
      } catch (e) {}
    }
    return INITIAL_SEED_DATA.users.find((u) => u.uid === uid) || null;
  }

  // Security Check: verifies if current user possesses role authority
  assertRole(allowedRoles = []) {
    const role = this.getUserRole();
    if (!allowedRoles.includes(role) && role !== 'admin') {
      throw new Error(`Permission Denied: User role "${role}" is not authorized. Allowed: ${allowedRoles.join(', ')}`);
    }
  }
}

export const authService = new AuthService();
export default authService;
