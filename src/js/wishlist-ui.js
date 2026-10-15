import { wishlist } from "./wishlist-store.js";
import { cart } from "./cart.js";
import confetti from "canvas-confetti";

export function initWishlistUI(showToast) {
  const drawer = document.getElementById("wishlist-drawer");
  const drawerBackdrop = document.getElementById("wishlist-drawer-backdrop");
  const drawerCloseBtn = document.getElementById("wishlist-drawer-close");
  const drawerItemsContainer = document.getElementById("wishlist-drawer-items");
  const drawerFooter = document.getElementById("wishlist-drawer-footer");
  const drawerCountHeader = document.getElementById("wishlist-drawer-count");
  const wishlistHeaderBtn = document.getElementById("wishlistHeaderBtn");
  const wishlistCountBadge = document.getElementById("wishlistCount");
  const moveAllBtn = document.getElementById("wishlist-move-all-btn");
  const clearBtn = document.getElementById("wishlist-clear-btn");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("active", "open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.add("active", "open");
    }
    document.body.classList.add("drawer-open");
    renderWishlist();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("active", "open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove("active", "open");
    }
    document.body.classList.remove("drawer-open");
  }

  // Header button & drawer controls
  if (wishlistHeaderBtn) {
    wishlistHeaderBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  window.addEventListener("wishlist:open", openDrawer);
  window.addEventListener("wishlist:close", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  // Render Drawer Content
  function renderWishlist() {
    const items = wishlist.getItems();
    const count = items.length;

    // Update Header and Badge
    updateBadge();

    if (drawerCountHeader) {
      drawerCountHeader.textContent = `${count} item${count === 1 ? "" : "s"}`;
    }

    if (!drawerItemsContainer) return;

    if (count === 0) {
      drawerItemsContainer.innerHTML = `
        <div class="wishlist-empty-state">
          <div class="empty-icon-circle">
            <i class="ri-heart-line"></i>
          </div>
          <h4 class="empty-title">Your Wishlist is Empty</h4>
          <p class="empty-subtitle">
            Explore our fresh Malabar bakery savouries and tap the heart icon on any snack to save your favourites!
          </p>
          <button type="button" class="btn-wishlist-explore" id="wishlist-start-shopping">
            <i class="ri-store-2-line"></i>
            <span>Shop All Snacks</span>
          </button>
        </div>
      `;

      if (drawerFooter) drawerFooter.style.display = "none";

      const startShopBtn = document.getElementById("wishlist-start-shopping");
      if (startShopBtn) {
        startShopBtn.addEventListener("click", () => {
          closeDrawer();
          const target = document.getElementById("shop-all");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        });
      }
      return;
    }

    // Has Items
    if (drawerFooter) drawerFooter.style.display = "flex";

    drawerItemsContainer.innerHTML = `
      <div class="wishlist-items-list">
        ${items.map(item => `
          <div class="wishlist-item-card" data-id="${item.productId}">
            <div class="wishlist-item-thumb">
              <img src="${item.productImage}" alt="${item.productName}" onerror="this.src='/images/card_banana_chips_clean.jpg'">
            </div>
            <div class="wishlist-item-info">
              <div class="wishlist-item-header">
                <h4 class="wishlist-item-name">${item.productName}</h4>
                <button type="button" class="btn-wishlist-remove" data-id="${item.productId}" aria-label="Remove ${item.productName}" title="Remove item">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <div class="wishlist-item-meta">
                <span class="wishlist-item-price">₹${item.unitPrice}</span>
                <span class="wishlist-stock-status"><i class="ri-check-line"></i> In Stock</span>
              </div>
              <div class="wishlist-item-footer">
                <button type="button" class="btn-wishlist-add-cart" data-id="${item.productId}">
                  <i class="ri-shopping-cart-2-line"></i>
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    // Bind item actions inside drawer
    drawerItemsContainer.querySelectorAll(".btn-wishlist-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        wishlist.removeItem(id);
        showToast("Removed from Wishlist");
        renderWishlist();
        syncProductCardHearts();
      });
    });

    drawerItemsContainer.querySelectorAll(".btn-wishlist-add-cart").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = items.find(i => i.productId === id);
        if (item) {
          cart.addItem({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            productImage: item.productImage,
            quantity: 1
          });

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#0f3822', '#e2b87f', '#d32f2f']
            });
          } catch (err) {}

          showToast(`Added ${item.productName} to Cart! 🛍️`);
          closeDrawer();
          window.dispatchEvent(new CustomEvent("cart:open"));
        }
      });
    });
  }

  // Footer Actions: Add all and Clear
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", () => {
      const items = wishlist.getItems();
      if (!items.length) return;

      items.forEach(item => {
        cart.addItem({
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          productImage: item.productImage,
          quantity: 1
        });
      });

      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0f3822', '#e2b87f', '#ffffff']
        });
      } catch (err) {}

      showToast(`Added all ${items.length} items to your cart! 🛍️`);
      closeDrawer();
      window.dispatchEvent(new CustomEvent("cart:open"));
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your wishlist?")) {
        wishlist.clear();
        showToast("Wishlist cleared");
        renderWishlist();
        syncProductCardHearts();
      }
    });
  }

  // Update Header Badge
  function updateBadge() {
    const count = wishlist.getCount();
    if (wishlistCountBadge) {
      wishlistCountBadge.textContent = count;
      if (count > 0) {
        wishlistCountBadge.style.display = "inline-flex";
      } else {
        wishlistCountBadge.style.display = "none";
      }
    }
  }

  // Sync heart buttons across product cards
  function syncProductCardHearts() {
    document.querySelectorAll(".store-prod-card").forEach(card => {
      const id = card.dataset.id || (card.dataset.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const btn = card.querySelector(".card-wishlist-btn");
      if (!btn) return;

      const icon = btn.querySelector("i");
      const isSaved = wishlist.hasItem(id);

      if (isSaved) {
        btn.classList.add("active");
        if (icon) {
          icon.classList.remove("ri-heart-line");
          icon.classList.add("ri-heart-fill");
        }
      } else {
        btn.classList.remove("active");
        if (icon) {
          icon.classList.remove("ri-heart-fill");
          icon.classList.add("ri-heart-line");
        }
      }
    });
  }

  // Bind click listeners on product card heart buttons
  document.querySelectorAll(".store-prod-card").forEach(card => {
    const btn = card.querySelector(".card-wishlist-btn");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const id = card.dataset.id || (card.dataset.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const name = card.dataset.name || "Keerthi Snack";
      const price = parseInt(card.dataset.price) || 89;
      const img = card.dataset.img || "/images/card_banana_chips_clean.jpg";

      const wasAdded = wishlist.toggleItem({
        productId: id,
        productName: name,
        unitPrice: price,
        productImage: img
      });

      if (wasAdded) {
        showToast(`Saved ${name} to Wishlist! ❤️`);
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#d32f2f', '#e2b87f']
          });
        } catch (err) {}
      } else {
        showToast(`Removed from Wishlist`);
      }

      updateBadge();
      syncProductCardHearts();
    });
  });

  // Listen to external wishlist updates
  window.addEventListener("wishlist:updated", () => {
    updateBadge();
    syncProductCardHearts();
  });

  // Initial Sync on Page Load
  updateBadge();
  syncProductCardHearts();
}
