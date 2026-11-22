/**
 * Keerthi Bakery - Real-time Inventory & Stock State Manager
 * Zero-cost cloud persistence synced across all devices.
 */

let cachedInventory = {
  soldOut: [],
  priceOverrides: {},
  lastFetched: 0
};

// Attempt to load initial cache from sessionStorage
try {
  const saved = sessionStorage.getItem("keerthi_inventory_cache");
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.soldOut)) {
      cachedInventory = parsed;
    }
  }
} catch (e) {}

/**
 * Fetch latest inventory from Vercel Serverless /api/inventory
 */
export async function fetchLiveInventory(force = false) {
  const now = Date.now();
  // Cache for 15 seconds unless forced
  if (!force && cachedInventory.lastFetched && (now - cachedInventory.lastFetched < 15000)) {
    return cachedInventory;
  }

  try {
    const res = await fetch("/api/inventory");
    if (res.ok) {
      const data = await res.json();
      cachedInventory = {
        soldOut: Array.isArray(data.soldOut) ? data.soldOut : [],
        priceOverrides: data.priceOverrides || {},
        lastFetched: Date.now()
      };
      try {
        sessionStorage.setItem("keerthi_inventory_cache", JSON.stringify(cachedInventory));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("inventory:updated", { detail: cachedInventory }));
    }
  } catch (err) {
    console.warn("Could not fetch live inventory, using local cache:", err);
  }

  return cachedInventory;
}

/**
 * Check if a product is marked Sold Out
 * @param {string} productId - Product ID or slug
 * @returns {boolean}
 */
export function isSoldOut(productId) {
  if (!productId) return false;
  const list = cachedInventory.soldOut || [];
  const idStr = String(productId).toLowerCase().trim();
  return list.some(item => {
    const itemStr = String(item).toLowerCase().trim();
    return itemStr === idStr || idStr.includes(itemStr) || itemStr.includes(idStr);
  });
}

/**
 * Get current list of sold out product IDs
 */
export function getSoldOutList() {
  return cachedInventory.soldOut || [];
}

/**
 * Update stock status for a product (Admin only)
 */
export async function updateCloudStock(soldOutList, pin, priceOverrides = null) {
  const payload = {
    pin,
    soldOut: soldOutList
  };
  if (priceOverrides) {
    payload.priceOverrides = priceOverrides;
  }

  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok && data.success) {
    cachedInventory.soldOut = data.soldOut;
    if (data.priceOverrides) cachedInventory.priceOverrides = data.priceOverrides;
    cachedInventory.lastFetched = Date.now();
    try {
      sessionStorage.setItem("keerthi_inventory_cache", JSON.stringify(cachedInventory));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("inventory:updated", { detail: cachedInventory }));
    return { success: true };
  } else {
    throw new Error(data.error || "Failed to update stock");
  }
}

// Kick off initial fetch in background
if (typeof window !== "undefined") {
  fetchLiveInventory();
}
