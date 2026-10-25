// Saves orders in the browser so History survives a page refresh.
// The keys keep their old names on purpose: renaming them would hide orders already saved.
const KEY = "ajs-orders";

export function loadOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {
    /* storage full or blocked: the app keeps working without saving */
  }
}

// Ids this device has already exchanged with the cloud (see sync.js).
const SYNCED_KEY = "ajs-orders-synced";

export function loadSynced() {
  try {
    const ids = JSON.parse(localStorage.getItem(SYNCED_KEY));
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveSynced(set) {
  try {
    localStorage.setItem(SYNCED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage blocked: sync still works while the page stays open */
  }
}
