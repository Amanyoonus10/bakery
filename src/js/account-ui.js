import { cart } from "./cart.js";
import confetti from "canvas-confetti";

export function initAccountUI(showToast) {
  const drawer = document.getElementById("account-drawer");
  const drawerBackdrop = document.getElementById("account-drawer-backdrop");
  const drawerCloseBtn = document.getElementById("account-drawer-close");
  const userAccountBtn = document.getElementById("userAccountBtn");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("active", "open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.add("active", "open");
    }
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("active", "open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove("active", "open");
    }
    document.body.classList.remove("drawer-open");
  }

  if (userAccountBtn) {
    userAccountBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  window.addEventListener("account:open", openDrawer);
  window.addEventListener("account:close", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  // Tab switching inside Account Drawer
  const tabBtns = document.querySelectorAll(".account-tab-btn");
  const tabPanes = document.querySelectorAll(".account-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Reorder Button in Orders Tab
  const reorderBtn = document.getElementById("btn-reorder-combo");
  if (reorderBtn) {
    reorderBtn.addEventListener("click", () => {
      cart.addItem({
        productId: "combo-3-pack",
        productName: "Snack Combo Pack (3 Items)",
        unitPrice: 299,
        productImage: "/images/card_combo_pack_clean.jpg",
        quantity: 1
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0f3822', '#e2b87f', '#ffffff']
        });
      } catch (err) {}

      showToast("Reordered! Added Snack Combo to your cart 🛍️");
      closeDrawer();
      window.dispatchEvent(new CustomEvent("cart:open"));
    });
  }

  // Track Shipment Button
  const trackBtn = document.getElementById("btn-track-active-order");
  if (trackBtn) {
    trackBtn.addEventListener("click", () => {
      showToast("🚚 Live Tracker: Courier Raghu is 10 mins away with your snacks!");
    });
  }

  // Profile Form Save
  const profileForm = document.getElementById("accountProfileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#0f3822', '#e2b87f']
        });
      } catch (err) {}
      showToast("Profile details updated successfully! ✨");
    });
  }

  // Add Address Button
  const addAddressBtn = document.getElementById("btn-add-address");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", () => {
      const address = prompt("Enter your new delivery address in Kerala / India:");
      if (address && address.trim()) {
        showToast("📍 New delivery address saved to your profile!");
      }
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById("btn-account-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      showToast("👤 Switched to Guest Mode. Happy shopping!");
      closeDrawer();
    });
  }
}
