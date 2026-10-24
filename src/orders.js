// Saves orders in the browser so History survives a page refresh.
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
