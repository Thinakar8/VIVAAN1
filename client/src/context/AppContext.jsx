import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { authService, firestoreService, storageService, realtimeDbService } from '../firebase';

const AppContext = createContext();

export const ROLES = [
  {
    id: 'farmer',
    title: 'Farmer',
    nativeKey: 'role_farmer',
    icon: '🌾',
    badge: 'Producer',
    description: 'Sell agricultural produce directly without middlemen, verify land ownership, and manage harvest batches.',
    primaryView: 'farmer_dashboard',
    color: 'emerald'
  },
  {
    id: 'fpo',
    title: 'FPO / Farmer Organization',
    nativeKey: 'role_fpo',
    icon: '🏢',
    badge: 'Farmer Organization',
    description: 'Aggregate agricultural harvest from member farmers, coordinate bulk mandi consignments, and manage collective cold-chain dispatches.',
    primaryView: 'fpo_dashboard',
    color: 'emerald'
  },
  {
    id: 'buyer',
    title: 'Consumer / Buyer',
    nativeKey: 'role_buyer',
    icon: '🛒',
    badge: 'Direct Buyer',
    description: 'Buy fresh farmgate produce directly from verified farmers, compare mandi prices, and track orders.',
    primaryView: 'buyer_marketplace',
    color: 'amber'
  },
  {
    id: 'agency',
    title: 'Delivery Agency',
    nativeKey: 'role_agency',
    icon: '🚚',
    badge: 'Logistics Partner',
    description: 'Manage logistics fleets, assign certified drivers, and coordinate rural agricultural freight corridors.',
    primaryView: 'agency_dashboard',
    color: 'sky'
  },
  {
    id: 'driver',
    title: 'Driver',
    nativeKey: 'role_driver',
    icon: '📱',
    badge: 'Carrier Driver',
    description: 'Mobile interface to accept agricultural transport trips, confirm farmgate collections, and handle doorstep OTP handovers.',
    primaryView: 'driver_dashboard',
    color: 'purple'
  }
];

export function AppProvider({ children }) {
  // Required Initial Flow: 'welcome' -> 'lang_select' -> 'role_select' -> role portals
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('vivaan_view') || 'welcome';
  });

  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem('vivaan_role_id');
    return ROLES.find(r => r.id === saved) || null;
  });

  // Active Order for Tracking
  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem('vivaan_active_order_id') || 'VIV-ORD-88120';
  });

  // Current Language (Default English)
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('vivaan_lang') || 'en';
  });

  const [showLangModal, setShowLangModal] = useState(false);

  // Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('vivaan_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Global Toasts
  const [toasts, setToasts] = useState([]);

  // Local persistent state
  useEffect(() => {
    localStorage.setItem('vivaan_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('vivaan_lang', currentLang);
  }, [currentLang]);

  useEffect(() => {
    if (activeRole) {
      localStorage.setItem('vivaan_role_id', activeRole.id);
    } else {
      localStorage.removeItem('vivaan_role_id');
    }
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('vivaan_cart', JSON.stringify(cart));
  }, [cart]);

  // Translation helper
  const t = (key) => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    if (langDict && langDict[key]) return langDict[key];
    const enDict = TRANSLATIONS['en'] || {};
    return enDict[key] || key;
  };

  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    return authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-1), { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const selectRole = (roleId) => {
    const roleObj = ROLES.find(r => r.id === roleId);
    if (roleObj) {
      setActiveRole(roleObj);
      setActiveView(roleObj.primaryView);
      authService.loginAsRole(roleId);
      addToast('Role Activated', `Entered as ${roleObj.title} (${authService.getCurrentUser()?.email || roleId})`);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        title: product.title,
        price_per_unit: product.price_per_unit,
        unit: product.unit,
        farmer_name: product.farmer_name,
        farmer_id: product.farmer_id,
        village: product.village,
        district: product.district,
        photo_url: product.photo_url,
        quantity
      }];
    });
    addToast('Added to Cart', `${quantity} ${product.unit} of ${product.title}`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('vivaan_active_order_id', activeOrderId);
    }
  }, [activeOrderId]);

  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView,
      activeRole,
      setActiveRole,
      activeOrderId,
      setActiveOrderId,
      selectRole,
      ROLES,
      currentLang,
      setCurrentLang,
      LANGUAGES,
      t,
      showLangModal,
      setShowLangModal,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      toasts,
      addToast,
      currentUser,
      authService,
      firestoreService,
      storageService,
      realtimeDbService
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
