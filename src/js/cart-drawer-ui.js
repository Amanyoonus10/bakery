import { cart } from "./cart.js";

export function initCartDrawerUI(showToast) {
  const drawer = document.getElementById("cart-drawer");
  const drawerBackdrop = document.getElementById("cart-drawer-backdrop");
  const drawerCloseBtn = document.getElementById("cart-drawer-close");
  const drawerItemsContainer = document.getElementById("cart-drawer-items") || document.getElementById("cart-drawer-items-list");
  const drawerFooter = document.getElementById("cart-drawer-footer");
  const drawerCountHeader = document.getElementById("drawer-item-count") || document.getElementById("cart-drawer-item-count");
  const freeShippingBar = document.getElementById("free-shipping-progress-bar") || document.getElementById("cart-progress-bar");
  const freeShippingText = document.getElementById("free-shipping-text") || document.getElementById("cart-shipping-msg");
  const freeShippingMeter = document.getElementById("free-shipping-meter") || document.querySelector(".free-shipping-meter, .cart-shipping-bar");
  const headerCartCountPills = document.querySelectorAll(".cart-count-badge");
  const headerCartTotalPill = document.getElementById("header-cart-total");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("active");
    drawer.classList.add("open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.add("active");
      drawerBackdrop.classList.add("open");
    }
    document.body.classList.add("drawer-open");
    renderDrawer();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("active");
    drawer.classList.remove("open");
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove("active");
      drawerBackdrop.classList.remove("open");
    }
    document.body.classList.remove("drawer-open");
  }

  // Open & Close triggers
  window.addEventListener("cart:open", openDrawer);
  window.addEventListener("cart:close", closeDrawer);
  document.querySelectorAll(".cart-trigger-btn").forEach(btn => {
    btn.addEventListener("click", openDrawer);
  });

  if (drawerCloseBtn) drawerCloseBtn.onclick = closeDrawer;
  if (drawerBackdrop) drawerBackdrop.onclick = closeDrawer;

  function renderDrawer() {
    const summary = cart.getSummary();

    // Update Header badges
    headerCartCountPills.forEach(pill => {
      pill.textContent = summary.count;
      pill.style.display = summary.count > 0 ? "inline-flex" : "none";
    });
    if (headerCartTotalPill) {
      headerCartTotalPill.textContent = `₹${summary.subtotal}`;
    }
    if (drawerCountHeader) {
      drawerCountHeader.textContent = `${summary.count} item${summary.count === 1 ? '' : 's'}`;
    }

    // Free Shipping Bar
    if (freeShippingBar && freeShippingText) {
      const fs = summary.freeShipping;
      freeShippingBar.style.width = `${fs.progress}%`;
      if (fs.qualified) {
        freeShippingBar.classList.add("completed");
        freeShippingText.innerHTML = `🎉 <strong>Hurrah!</strong> You unlocked <strong>FREE Delivery</strong> across Kerala &amp; India!`;
      } else {
        freeShippingBar.classList.remove("completed");
        freeShippingText.innerHTML = `Add <strong>₹${fs.remaining}</strong> more for <strong>FREE Delivery</strong> across Kerala &amp; India`;
      }
    }

    // Empty State
    if (summary.items.length === 0) {
      if (drawerItemsContainer) {
        drawerItemsContainer.innerHTML = `
          <div class="empty-cart-state">
            <div class="empty-cart-icon-wrap">
              <span class="empty-snack-emoji">🛍️</span>
            </div>
            <h3 class="empty-cart-title">Your Fresh Cart is Empty</h3>
            <p class="empty-cart-desc">
              Experience the authentic taste of 100% pure cold-pressed coconut oil banana chips, roasted sharkkara upperi, and crunchy Malabar snacks!
            </p>
            <button type="button" class="btn-explore-snacks" id="drawer-explore-btn">
              <span>Explore Kerala Snacks</span>
              <i class="ri-arrow-right-line"></i>
            </button>
            <div class="empty-quick-shortcuts">
              <span class="shortcuts-title">Popular Snacks:</span>
              <div class="shortcuts-row">
                <button type="button" class="quick-chip" data-scroll="products-section">🍌 Banana Chips</button>
                <button type="button" class="quick-chip" data-scroll="coverflow-section">🍯 Jaggery Upperi</button>
                <button type="button" class="quick-chip" data-scroll="products-section">🌶️ Spicy Mixture</button>
                <button type="button" class="quick-chip" data-scroll="coverflow-section">🍪 Spiral Biscuits</button>
              </div>
            </div>
          </div>
        `;

        const expBtn = drawerItemsContainer.querySelector("#drawer-explore-btn");
        if (expBtn) {
          expBtn.onclick = () => {
            closeDrawer();
            const target = document.getElementById("coverflow-section") || document.getElementById("products-section");
            if (target) target.scrollIntoView({ behavior: "smooth" });
          };
        }

        drawerItemsContainer.querySelectorAll(".quick-chip").forEach(chip => {
          chip.onclick = () => {
            closeDrawer();
            const secId = chip.dataset.scroll;
            const target = document.getElementById(secId) || document.getElementById("products-section");
            if (target) target.scrollIntoView({ behavior: "smooth" });
          };
        });
      }

      if (freeShippingMeter) freeShippingMeter.style.display = "none";
      if (drawerFooter) drawerFooter.style.display = "none";
      return;
    }

    // Active Cart with items
    if (freeShippingMeter) freeShippingMeter.style.display = "block";
    if (drawerFooter) drawerFooter.style.display = "block";

    // Items list
    if (drawerItemsContainer) {
      drawerItemsContainer.innerHTML = `
        <div class="cart-items-list">
          ${summary.items.map(item => `
            <div class="drawer-cart-item" data-key="${item.itemKey}">
              <img src="${item.image || '/images/keerthi_pouch_cutout.png'}" alt="${item.name}" class="item-thumb" onerror="this.src='/images/keerthi_pouch_cutout.png'">
              <div class="item-details">
                <div class="item-title-row">
                  <h4 class="item-name">${item.name}</h4>
                  <button type="button" class="item-remove-btn" data-key="${item.itemKey}" title="Remove item" aria-label="Remove item">✕</button>
                </div>

                <div class="item-meta-tags">
                  <span class="meta-tag tag-weight">${item.weight || '500g Pack'}</span>
                  <span class="meta-tag tag-pure">🥥 Pure Coconut Oil</span>
                </div>

                <div class="item-bottom-row">
                  <div class="quantity-control">
                    <button type="button" class="qty-btn minus" data-key="${item.itemKey}" aria-label="Decrease quantity">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button type="button" class="qty-btn plus" data-key="${item.itemKey}" aria-label="Increase quantity">+</button>
                  </div>
                  <div class="item-total-price">
                    ₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Freshness Packaging & Delivery Option -->
        <div class="drawer-slot-section">
          <div class="slot-title">📦 Delivery &amp; Packaging Preference</div>
          <div class="slot-inputs-row">
            <select id="drawer-slot-time" class="drawer-select">
              <option value="Kerala Express (24-48 Hours)">⚡ Kerala Express (24-48 Hours)</option>
              <option value="Standard Pan-India (3-5 Days)">📦 Standard Pan-India (3-5 Days)</option>
              <option value="Kadavathur Store Pickup">🏪 Kadavathur Head Office Pickup</option>
            </select>
            <div class="drawer-packaging-badge">
              <i class="ri-shield-check-line"></i> Aroma-Lock Freshness Box (FREE)
            </div>
          </div>
        </div>

        <!-- Special packing Instructions -->
        <div class="drawer-instruction-box">
          <input type="text" id="drawer-chef-notes" class="drawer-input" 
            placeholder="Special packing notes (e.g., extra bubble wrap for travel)..." 
            value="${summary.specialInstruction || ''}">
        </div>
      `;

      bindDrawerItemEvents();
    }

    // Render Drawer Footer Breakdown
    if (drawerFooter) {
      drawerFooter.innerHTML = `
        <!-- Coupon Section -->
        <div class="drawer-coupon-box">
          ${summary.appliedCoupon ? `
            <div class="applied-coupon-pill">
              <span class="coupon-tag">🏷️ ${summary.appliedCoupon.code}</span>
              <span class="coupon-desc">${summary.appliedCoupon.label}</span>
              <button type="button" id="remove-coupon-btn" class="coupon-remove" title="Remove coupon">✕</button>
            </div>
          ` : `
            <div class="coupon-input-wrap">
              <input type="text" id="coupon-code-input" class="coupon-input" placeholder="Promo code (e.g. PEEKAY100)" style="text-transform:uppercase;">
              <button type="button" id="apply-coupon-btn" class="btn-apply-coupon">Apply</button>
            </div>
            <div class="quick-coupon-pills">
              <button type="button" class="quick-pill" data-code="PEEKAY100">🏷️ PEEKAY100 (₹100 Off)</button>
              <button type="button" class="quick-pill" data-code="KEERTHI10">🏷️ KEERTHI10 (10% Off)</button>
            </div>
          `}
        </div>

        <!-- Price Breakdown -->
        <div class="price-breakdown">
          <div class="breakdown-row">
            <span>Items Subtotal</span>
            <span>₹${summary.subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${summary.discount > 0 ? `
            <div class="breakdown-row row-discount">
              <span>Coupon Discount (${summary.appliedCoupon?.code})</span>
              <span>-₹${summary.discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="breakdown-row">
            <span>Delivery Fee</span>
            <span>${summary.deliveryFee === 0 ? '<span class="text-free">FREE</span>' : `₹${summary.deliveryFee}`}</span>
          </div>
          <div class="breakdown-row row-total">
            <span>Grand Total</span>
            <span class="total-amount">₹${summary.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button type="button" id="drawer-checkout-btn" class="btn-checkout">
          <span class="checkout-btn-text">Proceed to Secure Checkout</span>
          <span class="checkout-price">₹${summary.grandTotal.toLocaleString('en-IN')} ➔</span>
        </button>

        <div class="drawer-trust-icons">
          <span><i class="ri-shield-check-fill"></i> 256-Bit SSL</span>
          <span><i class="ri-flashlight-fill"></i> Same-Day Dispatch</span>
        </div>
      `;

      bindFooterEvents();
    }
  }

  function bindDrawerItemEvents() {
    // Quantity Plus
    drawerItemsContainer.querySelectorAll(".qty-btn.plus").forEach(btn => {
      btn.onclick = () => {
        cart.updateQuantity(btn.dataset.key, 1);
        renderDrawer();
      };
    });

    // Quantity Minus
    drawerItemsContainer.querySelectorAll(".qty-btn.minus").forEach(btn => {
      btn.onclick = () => {
        cart.updateQuantity(btn.dataset.key, -1);
        renderDrawer();
      };
    });

    // Remove item
    drawerItemsContainer.querySelectorAll(".item-remove-btn").forEach(btn => {
      btn.onclick = () => {
        cart.removeItem(btn.dataset.key);
        renderDrawer();
        showToast("Item removed from cart");
      };
    });

    // Slot date & time
    const slotTime = drawerItemsContainer.querySelector("#drawer-slot-time");
    if (slotTime) {
      slotTime.onchange = () => cart.setDeliverySlot(new Date().toISOString().split("T")[0], slotTime.value);
    }

    // Chef notes
    const chefInput = drawerItemsContainer.querySelector("#drawer-chef-notes");
    if (chefInput) {
      chefInput.onchange = (e) => cart.setSpecialInstruction(e.target.value);
    }
  }

  function bindFooterEvents() {
    // Apply coupon
    const applyBtn = drawerFooter.querySelector("#apply-coupon-btn");
    const codeInput = drawerFooter.querySelector("#coupon-code-input");
    if (applyBtn && codeInput) {
      applyBtn.onclick = () => {
        const res = cart.applyCoupon(codeInput.value);
        showToast(res.message);
        renderDrawer();
      };
      codeInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          applyBtn.click();
        }
      };
    }

    // Quick coupon pills
    drawerFooter.querySelectorAll(".quick-pill").forEach(pill => {
      pill.onclick = () => {
        const res = cart.applyCoupon(pill.dataset.code);
        showToast(res.message);
        renderDrawer();
      };
    });

    // Remove coupon
    const removeCouponBtn = drawerFooter.querySelector("#remove-coupon-btn");
    if (removeCouponBtn) {
      removeCouponBtn.onclick = () => {
        cart.removeCoupon();
        showToast("Coupon removed");
        renderDrawer();
      };
    }

    // Checkout button
    const checkoutBtn = drawerFooter.querySelector("#drawer-checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        closeDrawer();
        window.dispatchEvent(new CustomEvent("checkout:open"));
      };
    }
  }

  // Listen to cart state change
  window.addEventListener("cart:updated", renderDrawer);
  renderDrawer();
}
