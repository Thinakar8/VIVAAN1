/**
 * VIVAAN Central State & API Client
 */

export const state = {
  currentView: 'landing',
  history: [],
  currentRole: 'VISITOR',
  currentUser: null,
  cart: [],
  activeOrderId: 'VIV-ORD-88120',
  notifications: [],
  hasSelectedLanguageInitially: localStorage.getItem('vivaan_lang_selected') === 'true'
};

export const listeners = new Set();

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notify() {
  listeners.forEach(cb => cb(state));
}

export function setView(viewName, params = {}, pushToHistory = true) {
  if (pushToHistory && state.currentView && state.currentView !== viewName) {
    state.history.push(state.currentView);
  }
  state.currentView = viewName;
  state.viewParams = params;
  
  // Sync URL hash for browser back/forward buttons
  try {
    if (window.location.hash !== '#' + viewName) {
      window.history.pushState({ view: viewName }, '', '#' + viewName);
    }
  } catch (e) {}

  notify();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function canGoBack() {
  return (state.history && state.history.length > 0) || state.currentView !== 'landing';
}

export function getPreviousView(fallbackView = 'landing') {
  if (state.history && state.history.length > 0) {
    return state.history[state.history.length - 1];
  }
  return fallbackView;
}

export function goBack(fallbackView = 'landing') {
  if (state.history && state.history.length > 0) {
    const prevView = state.history.pop();
    setView(prevView, {}, false);
  } else {
    setView(fallbackView, {}, false);
  }
}

export function setRole(role, user = null) {
  state.currentRole = role;
  state.currentUser = user;
  notify();
}

export async function switchDemoRole(role) {
  try {
    if (role === 'VISITOR') {
      state.currentRole = 'VISITOR';
      state.currentUser = null;
      setView('landing');
      return;
    }
    const res = await apiGet(`/api/auth/demo-role/${role}`);
    if (res.success) {
      state.currentRole = res.user.role;
      state.currentUser = res.user;

      if (res.user.role === 'FARMER') setView('farmer_dashboard');
      else if (res.user.role === 'AGENCY') setView('agency_dashboard');
      else if (res.user.role === 'DRIVER') setView('driver_view');
      else if (res.user.role === 'BUYER') setView('buyer_marketplace');
      else if (res.user.role === 'ADMIN') setView('admin_panel');
      else setView('landing');

      notify();
    }
  } catch (err) {
    console.error("Demo switch failed:", err);
  }
}

export async function apiGet(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'API Request failed' }));
    throw new Error(errorData.detail || 'API Request failed');
  }
  return res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'API Request failed' }));
    throw new Error(errorData.detail || 'API Request failed');
  }
  return res.json();
}

export async function apiPut(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'API Request failed' }));
    throw new Error(errorData.detail || 'API Request failed');
  }
  return res.json();
}

export async function apiDelete(endpoint) {
  const res = await fetch(endpoint, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'API Request failed' }));
    throw new Error(errorData.detail || 'API Request failed');
  }
  return res.json();
}

export function addToCart(product, quantity = 1) {
  const existing = state.cart.find(item => item.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ product, quantity });
  }
  notify();
}

export function clearCart() {
  state.cart = [];
  notify();
}

// Browser Back / Forward Button integration
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view) {
      setView(event.state.view, {}, false);
    } else {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setView(hash, {}, false);
      } else {
        setView('landing', {}, false);
      }
    }
  });
}
