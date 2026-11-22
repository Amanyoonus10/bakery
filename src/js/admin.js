import { PRODUCTS } from "../data/products.js";
import { fetchLiveInventory, isSoldOut, getSoldOutList, updateCloudStock } from "./inventory.js";

// Global Admin State
let adminPin = sessionStorage.getItem("keerthi_admin_pin") || "";
let orders = [];
let soldOutList = [];
let currentTab = "orders";
let orderSearchQuery = "";
let orderStatusFilter = "all";
let invSearchQuery = "";
let invCategoryFilter = "all";
let refreshInterval = null;

// Toast Helper
function showToast(message, type = "success") {
  const container = document.getElementById("admin-toasts");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "⚠️"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3200);
}

// ── Authentication & Lock Screen ──
function initAuth() {
  const overlay = document.getElementById("pinLockOverlay");
  const pinInput = document.getElementById("pinInput");
  const unlockBtn = document.getElementById("btnUnlockPin");
  const errorMsg = document.getElementById("pinErrorMsg");
  const logoutBtn = document.getElementById("btnAdminLogout");

  if (!overlay) return;

  if (adminPin) {
    // Try auto-login with stored PIN
    verifyAndLogin(adminPin, false);
  } else {
    overlay.style.display = "flex";
  }

  if (unlockBtn && pinInput) {
    unlockBtn.onclick = () => {
      const entered = pinInput.value.trim();
      if (!entered) {
        if (errorMsg) errorMsg.textContent = "Please enter 4-digit PIN";
        return;
      }
      verifyAndLogin(entered, true);
    };

    pinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        unlockBtn.click();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem("keerthi_admin_pin");
      adminPin = "";
      if (refreshInterval) clearInterval(refreshInterval);
      if (overlay) {
        overlay.style.display = "flex";
        if (pinInput) pinInput.value = "";
        if (errorMsg) errorMsg.textContent = "";
      }
    };
  }
}

async function verifyAndLogin(enteredPin, isManual = true) {
  const errorMsg = document.getElementById("pinErrorMsg");
  const overlay = document.getElementById("pinLockOverlay");
  const unlockBtn = document.getElementById("btnUnlockPin");

  if (unlockBtn) unlockBtn.textContent = "Verifying...";

  try {
    const res = await fetch(`/api/orders?pin=${encodeURIComponent(enteredPin)}`);
    if (res.ok) {
      adminPin = enteredPin;
      sessionStorage.setItem("keerthi_admin_pin", adminPin);
      if (overlay) overlay.style.display = "none";
      if (errorMsg) errorMsg.textContent = "";
      showToast("Welcome back, Keerthi Admin!");
      startAdminSession();
    } else {
      if (errorMsg) errorMsg.textContent = "Incorrect PIN. Default is 1993.";
      if (overlay) overlay.style.display = "flex";
      sessionStorage.removeItem("keerthi_admin_pin");
      adminPin = "";
    }
  } catch (err) {
    console.error("Auth verify error:", err);
    if (errorMsg) errorMsg.textContent = "Connection failed. Please check network.";
  } finally {
    if (unlockBtn) unlockBtn.textContent = "Unlock Dashboard 🔓";
  }
}

// ── Admin Session Startup ──
function startAdminSession() {
  loadLiveOrders();
  loadLiveInventory();

  // Setup auto-refresh every 25 seconds for orders
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (currentTab === "orders") {
      loadLiveOrders(false);
    }
  }, 25000);
}

// ── Orders Board Management ──
async function loadLiveOrders(showNotification = true) {
  if (!adminPin) return;

  try {
    const res = await fetch(`/api/orders?pin=${encodeURIComponent(adminPin)}`);
    if (res.ok) {
      const data = await res.json();
      orders = Array.isArray(data.orders) ? data.orders : [];
      updateOrderMetrics();
      renderOrders();
      if (showNotification) {
        showToast(`Synced ${orders.length} orders from cloud!`);
      }
    }
  } catch (err) {
    console.error("Failed to load orders:", err);
  }
}

function updateOrderMetrics() {
  const totalEl = document.getElementById("metricTotalOrders");
  const pendingEl = document.getElementById("metricPendingOrders");
  const dispatchedEl = document.getElementById("metricDispatchedOrders");
  const deliveredEl = document.getElementById("metricDeliveredOrders");
  const revenueEl = document.getElementById("metricTotalRevenue");
  const tabBadge = document.getElementById("ordersTabBadge");

  const total = orders.length;
  const pending = orders.filter(o => o.status === "Received" || o.status === "Packing").length;
  const dispatched = orders.filter(o => o.status === "Dispatched").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const revenue = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (dispatchedEl) dispatchedEl.textContent = dispatched;
  if (deliveredEl) deliveredEl.textContent = delivered;
  if (revenueEl) revenueEl.textContent = `₹${revenue.toLocaleString("en-IN")}`;
  if (tabBadge) tabBadge.textContent = pending > 0 ? pending : total;
}

function renderOrders() {
  const container = document.getElementById("ordersGrid");
  if (!container) return;

  let filtered = [...orders];

  // 1. Filter by status
  if (orderStatusFilter !== "all") {
    if (orderStatusFilter === "cod") {
      filtered = filtered.filter(o => String(o.paymentMethod).toUpperCase().includes("COD"));
    } else if (orderStatusFilter === "online") {
      filtered = filtered.filter(o => !String(o.paymentMethod).toUpperCase().includes("COD"));
    } else if (orderStatusFilter === "pending") {
      filtered = filtered.filter(o => o.status === "Received" || o.status === "Packing");
    } else {
      filtered = filtered.filter(o => String(o.status).toLowerCase() === orderStatusFilter.toLowerCase());
    }
  }

  // 2. Filter by search query
  if (orderSearchQuery) {
    const q = orderSearchQuery.toLowerCase();
    filtered = filtered.filter(o =>
      String(o.id).toLowerCase().includes(q) ||
      String(o.customerName).toLowerCase().includes(q) ||
      String(o.phone).toLowerCase().includes(q) ||
      String(o.city).toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border-radius: 12px; padding: 48px; text-align: center; border: 1.5px dashed #cbd5e1;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">📦</span>
        <h3 style="color: #64748b; font-size: 1.1rem; margin-bottom: 6px;">No orders found</h3>
        <p style="font-size: 0.85rem; color: #94a3b8;">Try clearing the search or filter to see all incoming orders.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const isCod = String(order.paymentMethod).toUpperCase().includes("COD");
    const statusClass = String(order.status).toLowerCase();
    const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }) : "Recent";

    const cleanPhone = String(order.phone || "").replace(/\D/g, "");
    const waText = encodeURIComponent(
      `Hello ${order.customerName},\nThis is Keerthi Bakery regarding your order *${order.id}*.\nStatus: ${order.status}\nTotal: ₹${order.total}\nWe are preparing your fresh snacks!`
    );

    return `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-header-row">
          <div class="order-meta-left">
            <span class="order-id-badge">${order.id}</span>
            <span class="order-timestamp">🕒 ${createdDate}</span>
          </div>
          <div class="order-badges-right">
            <span class="payment-method-badge ${isCod ? 'cod' : 'online'}">
              ${isCod ? '💵 COD' : '⚡ Online Paid'}
            </span>
            <span class="order-status-badge ${statusClass}">${order.status || 'Received'}</span>
          </div>
        </div>

        <div class="order-body-columns">
          <!-- Column 1: Customer Details -->
          <div class="order-cust-info">
            <h4>Customer Details</h4>
            <div class="cust-name">${order.customerName}</div>
            <div class="cust-contact-buttons">
              <a href="https://wa.me/91${cleanPhone}?text=${waText}" target="_blank" class="btn-whatsapp-chat">
                <span>💬</span> WhatsApp
              </a>
              <a href="tel:${cleanPhone}" class="btn-phone-call">
                <span>📞</span> Call
              </a>
            </div>
            <div class="cust-address">
              <strong>Phone:</strong> ${order.phone}<br>
              <strong>Address:</strong> ${order.address ? order.address + ', ' : ''}${order.city}${order.pincode ? ' - ' + order.pincode : ''}
              ${order.email ? `<br><strong>Email:</strong> ${order.email}` : ''}
              ${order.paymentId ? `<br><strong>Txn ID:</strong> <code style="font-size:11px;">${order.paymentId}</code>` : ''}
            </div>
          </div>

          <!-- Column 2: Items in Order -->
          <div class="order-items-col">
            <h4>Items (${order.items?.length || 0})</h4>
            <div class="order-items-list">
              ${(order.items || []).map(item => `
                <div class="order-item-row">
                  <span><strong>${item.quantity}x</strong> ${item.name} (${item.weight || 'Std'})</span>
                  <span>₹${item.price || (item.unitPrice * item.quantity) || '—'}</span>
                </div>
              `).join('')}
            </div>
            <div class="order-grand-total">Total Payable: ₹${(Number(order.total) || 0).toLocaleString('en-IN')}</div>
          </div>

          <!-- Column 3: Change Status -->
          <div class="order-actions-col">
            <h4>Update Status</h4>
            <select class="status-update-select" data-order-id="${order.id}">
              <option value="Received" ${order.status === "Received" ? "selected" : ""}>🟡 Received</option>
              <option value="Packing" ${order.status === "Packing" ? "selected" : ""}>🟠 Aroma-Packing</option>
              <option value="Dispatched" ${order.status === "Dispatched" ? "selected" : ""}>🚚 Dispatched</option>
              <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>✅ Delivered</option>
              <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>❌ Cancelled</option>
            </select>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 8px;">
              Changing status notifies customer on WhatsApp and syncs to cloud.
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Bind status select changes
  container.querySelectorAll(".status-update-select").forEach(sel => {
    sel.onchange = async (e) => {
      const targetOrderId = sel.dataset.orderId;
      const newStatus = sel.value;
      await updateOrderStatus(targetOrderId, newStatus);
    };
  });
}

async function updateOrderStatus(orderId, status) {
  if (!adminPin) return;

  try {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: adminPin,
        orderId,
        status
      })
    });

    if (res.ok) {
      showToast(`Order ${orderId} marked as ${status}!`);
      const target = orders.find(o => o.id === orderId);
      if (target) target.status = status;
      updateOrderMetrics();
      renderOrders();
    } else {
      showToast("Failed to update order status", "error");
    }
  } catch (err) {
    console.error("Status update error:", err);
    showToast("Network error updating status", "error");
  }
}

// ── Stock & Inventory Management ──
async function loadLiveInventory() {
  try {
    const data = await fetchLiveInventory(true);
    soldOutList = data.soldOut || [];
    updateInventoryMetrics();
    renderInventory();
  } catch (err) {
    console.error("Failed to load inventory:", err);
  }
}

function updateInventoryMetrics() {
  const totalEl = document.getElementById("metricTotalProducts");
  const inStockEl = document.getElementById("metricInStockProducts");
  const soldOutEl = document.getElementById("metricSoldOutProducts");

  const total = PRODUCTS.length;
  const soldOutCount = PRODUCTS.filter(p => isProductSoldOut(p.id)).length;
  const inStockCount = total - soldOutCount;

  if (totalEl) totalEl.textContent = total;
  if (inStockEl) inStockEl.textContent = inStockCount;
  if (soldOutEl) soldOutEl.textContent = soldOutCount;
}

function isProductSoldOut(productId) {
  if (!productId) return false;
  const idStr = String(productId).toLowerCase().trim();
  return soldOutList.some(item => {
    const itemStr = String(item).toLowerCase().trim();
    return itemStr === idStr || idStr.includes(itemStr) || itemStr.includes(idStr);
  });
}

function renderInventory() {
  const container = document.getElementById("inventoryGrid");
  if (!container) return;

  let filtered = [...PRODUCTS];

  // Category filter
  if (invCategoryFilter !== "all") {
    filtered = filtered.filter(p => p.category === invCategoryFilter);
  }

  // Search filter
  if (invSearchQuery) {
    const q = invSearchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.tagline && p.tagline.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  container.innerHTML = filtered.map(prod => {
    const soldOut = isProductSoldOut(prod.id);
    const price = prod.price || 85;
    const unit = prod.unit || "200g Pouch";
    const img = prod.imageWebp || prod.image || "/images/card_banana_chips_clean.jpg";

    return `
      <div class="inventory-card ${soldOut ? 'is-sold-out' : ''}" data-product-id="${prod.id}">
        <div class="inventory-top-row">
          <img src="${img}" alt="${prod.name}" class="inventory-thumb" onerror="this.src='/images/card_banana_chips_clean.jpg'">
          <div class="inventory-info">
            <div class="inventory-title" title="${prod.name}">${prod.name}</div>
            <span class="inventory-category-pill">${prod.category}</span>
            <div class="inventory-price-tag">₹${price} <span style="font-size:0.72rem; color:#64748b; font-weight:600;">/ ${unit}</span></div>
          </div>
        </div>

        <button type="button" class="stock-toggle-btn ${soldOut ? 'sold-out' : 'in-stock'}" data-product-id="${prod.id}">
          <span>${soldOut ? '🔴 SOLD OUT' : '🟢 IN STOCK'}</span>
          <span style="font-size:0.75rem; opacity:0.8;">(Tap to Toggle)</span>
        </button>
      </div>
    `;
  }).join("");

  // Bind Stock Toggle Buttons
  container.querySelectorAll(".stock-toggle-btn").forEach(btn => {
    btn.onclick = async () => {
      const prodId = btn.dataset.productId;
      await toggleProductStock(prodId);
    };
  });
}

async function toggleProductStock(productId) {
  if (!adminPin) {
    showToast("Please enter PIN first", "error");
    return;
  }

  const isCurrentlySoldOut = isProductSoldOut(productId);
  let updatedList;

  if (isCurrentlySoldOut) {
    // Switch to IN STOCK (remove from soldOutList)
    const idLower = String(productId).toLowerCase();
    updatedList = soldOutList.filter(id => {
      const itm = String(id).toLowerCase();
      return itm !== idLower && !idLower.includes(itm) && !itm.includes(idLower);
    });
  } else {
    // Switch to SOLD OUT (add to soldOutList)
    updatedList = [...soldOutList, productId];
  }

  try {
    await updateCloudStock(updatedList, adminPin);
    soldOutList = updatedList;
    updateInventoryMetrics();
    renderInventory();
    showToast(`${productId} is now ${isCurrentlySoldOut ? '🟢 IN STOCK' : '🔴 SOLD OUT'}!`);
  } catch (err) {
    console.error("Stock toggle error:", err);
    showToast("Failed to sync stock to cloud", "error");
  }
}

// ── Export Orders CSV ──
function exportOrdersCsv() {
  if (!orders || orders.length === 0) {
    showToast("No orders available to export", "error");
    return;
  }

  const headers = ["Order ID", "Date", "Customer Name", "Phone", "Email", "Address", "City", "Pincode", "Total Amount", "Payment Method", "Payment ID", "Status", "Items"];
  const rows = orders.map(o => [
    o.id,
    o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "",
    `"${(o.customerName || "").replace(/"/g, '""')}"`,
    `"${o.phone || ""}"`,
    `"${o.email || ""}"`,
    `"${(o.address || "").replace(/"/g, '""')}"`,
    `"${o.city || ""}"`,
    `"${o.pincode || ""}"`,
    o.total || 0,
    `"${o.paymentMethod || ""}"`,
    `"${o.paymentId || ""}"`,
    o.status || "Received",
    `"${(o.items || []).map(i => `${i.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `keerthi_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Orders CSV downloaded! 📊");
}

// ── Change Admin PIN ──
async function handleChangePin(e) {
  e.preventDefault();
  const currentPinInput = document.getElementById("currAdminPin");
  const newPinInput = document.getElementById("newAdminPin");
  const confirmPinInput = document.getElementById("confirmAdminPin");

  const curr = currentPinInput?.value.trim();
  const next = newPinInput?.value.trim();
  const confirm = confirmPinInput?.value.trim();

  if (!curr || !next || !confirm) {
    showToast("Please fill all PIN fields", "error");
    return;
  }

  if (next.length < 4) {
    showToast("New PIN must be at least 4 digits", "error");
    return;
  }

  if (next !== confirm) {
    showToast("New PINs do not match", "error");
    return;
  }

  try {
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: curr,
        newPin: next
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      adminPin = next;
      sessionStorage.setItem("keerthi_admin_pin", next);
      showToast("Admin PIN updated successfully! 🔒");
      currentPinInput.value = "";
      newPinInput.value = "";
      confirmPinInput.value = "";
    } else {
      showToast(data.error || "Failed to update PIN", "error");
    }
  } catch (err) {
    console.error("PIN change error:", err);
    showToast("Network error changing PIN", "error");
  }
}

// ── DOM Initialization ──
document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  // Tab Switching
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-tab-pane").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = btn.dataset.tab;
      currentTab = targetTab;
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add("active");

      if (targetTab === "orders") {
        loadLiveOrders(false);
      } else if (targetTab === "inventory") {
        loadLiveInventory();
      }
    };
  });

  // Orders Search & Filter Controls
  const orderSearch = document.getElementById("orderSearchInput");
  if (orderSearch) {
    orderSearch.addEventListener("input", (e) => {
      orderSearchQuery = e.target.value.trim();
      renderOrders();
    });
  }

  document.querySelectorAll(".order-filter-pill").forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll(".order-filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      orderStatusFilter = pill.dataset.filter;
      renderOrders();
    };
  });

  const refreshBtn = document.getElementById("btnRefreshOrders");
  if (refreshBtn) {
    refreshBtn.onclick = () => loadLiveOrders(true);
  }

  const exportBtn = document.getElementById("btnExportOrdersCsv");
  if (exportBtn) {
    exportBtn.onclick = exportOrdersCsv;
  }

  // Inventory Search & Filter Controls
  const invSearch = document.getElementById("invSearchInput");
  if (invSearch) {
    invSearch.addEventListener("input", (e) => {
      invSearchQuery = e.target.value.trim();
      renderInventory();
    });
  }

  document.querySelectorAll(".inv-filter-pill").forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll(".inv-filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      invCategoryFilter = pill.dataset.category;
      renderInventory();
    };
  });

  // Settings PIN Form
  const pinForm = document.getElementById("changePinForm");
  if (pinForm) {
    pinForm.onsubmit = handleChangePin;
  }
});
