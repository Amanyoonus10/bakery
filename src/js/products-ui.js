import { PRODUCTS, CATEGORIES } from "../data/products.js";
import { cart } from "./cart.js";

export function initProductsUI(showToast) {
  const grid = document.getElementById("products-grid");
  const catContainer = document.getElementById("category-filter-bar");
  const quickViewModal = document.getElementById("quick-view-modal");
  const egglessFilterBtn = document.getElementById("filter-eggless-only");

  let currentCategory = "all";
  let egglessOnly = false;
  let searchQuery = "";

  // Render Category Bar
  if (catContainer) {
    catContainer.innerHTML = CATEGORIES.map(cat => `
      <button type="button" class="cat-pill ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
      </button>
    `).join('');

    catContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".cat-pill");
      if (!btn) return;
      currentCategory = btn.dataset.category;
      catContainer.querySelectorAll(".cat-pill").forEach(b => b.classList.toggle("active", b === btn));
      renderGrid();
    });
  }

  // Eggless filter toggle
  if (egglessFilterBtn) {
    egglessFilterBtn.addEventListener("click", () => {
      egglessOnly = !egglessOnly;
      egglessFilterBtn.classList.toggle("active", egglessOnly);
      renderGrid();
    });
  }

  // Render Grid
  function renderGrid() {
    if (!grid) return;

    let filtered = PRODUCTS.filter(p => {
      if (currentCategory !== "all" && p.category !== currentCategory) return false;
      if (egglessOnly && !p.egglessAvailable && !p.isVeg) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchMalayalam = p.malayalamName ? p.malayalamName.includes(q) : false;
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTags = p.tags ? p.tags.some(t => t.includes(q)) : false;
        if (!matchName && !matchMalayalam && !matchDesc && !matchTags) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-products-state">
          <div class="empty-icon">🍰</div>
          <h3>No freshly baked items found</h3>
          <p>Try adjusting your category or dietary filter to see more delicious treats.</p>
          <button type="button" class="btn btn-outline" id="reset-filters-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = grid.querySelector("#reset-filters-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          currentCategory = "all";
          egglessOnly = false;
          searchQuery = "";
          if (catContainer) {
            catContainer.querySelectorAll(".cat-pill").forEach(b => b.classList.toggle("active", b.dataset.category === "all"));
          }
          if (egglessFilterBtn) egglessFilterBtn.classList.remove("active");
          const searchInput = document.getElementById("search-input");
          if (searchInput) searchInput.value = "";
          renderGrid();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(product => {
      const defaultVariant = product.variants.find(v => v.default) || product.variants[0];
      const hasDiscount = defaultVariant.originalPrice && defaultVariant.originalPrice > defaultVariant.price;

      return `
        <div class="product-card" data-id="${product.id}">
          <!-- Badges -->
          <div class="card-badges">
            ${product.badge ? `
              <span class="badge badge-${product.badgeColor || 'primary'}">${product.badge}</span>
            ` : ''}
            <span class="diet-indicator ${product.isVeg ? 'veg' : 'non-veg'}" title="${product.isVeg ? 'Vegetarian / Eggless available' : 'Contains Egg'}">
              <span class="diet-dot"></span>
            </span>
          </div>

          <!-- Image Container -->
          <div class="card-image-wrap">
            <img src="${product.image}" alt="${product.name}" loading="lazy" class="card-image">
            <div class="card-quick-actions">
              <button type="button" class="quick-view-btn" data-id="${product.id}" title="Quick View & Customize">
                👁 Quick View
              </button>
            </div>
            <div class="delivery-pill">
              ⚡ ${product.deliveryTime || 'Same Day 2h'}
            </div>
          </div>

          <!-- Content -->
          <div class="card-content">
            <div class="card-rating">
              <span class="stars">★★★★★</span>
              <span class="rating-num">${product.rating}</span>
              <span class="review-count">(${product.reviewCount})</span>
            </div>

            <h3 class="card-title">
              <a href="#" class="product-title-link" data-id="${product.id}">${product.name}</a>
            </h3>
            ${product.malayalamName ? `<div class="card-malayalam">${product.malayalamName}</div>` : ''}

            <!-- Weight Pills -->
            <div class="weight-pills-row" data-id="${product.id}">
              ${product.variants.map((v, idx) => `
                <button type="button" class="w-pill ${v.default || idx === 0 ? 'active' : ''}" 
                  data-weight="${v.weight}" 
                  data-price="${v.price}" 
                  data-original="${v.originalPrice || ''}">
                  ${v.weight}
                </button>
              `).join('')}
            </div>

            <!-- Price and CTA -->
            <div class="card-bottom">
              <div class="card-price-wrap">
                <span class="current-price" data-price-el="${product.id}">₹${defaultVariant.price}</span>
                ${hasDiscount ? `<span class="original-price" data-orig-el="${product.id}">₹${defaultVariant.originalPrice}</span>` : ''}
              </div>

              <button type="button" class="btn-card-add" data-id="${product.id}">
                <span class="btn-icon">🛒</span>
                <span class="btn-text">Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindCardEvents();
  }

  function bindCardEvents() {
    // Weight pill click updates displayed price
    grid.querySelectorAll(".w-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        const parent = pill.closest(".weight-pills-row");
        const card = pill.closest(".product-card");
        const productId = parent.dataset.id;
        parent.querySelectorAll(".w-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        const newPrice = pill.dataset.price;
        const newOrig = pill.dataset.original;
        const priceEl = card.querySelector(`[data-price-el="${productId}"]`);
        const origEl = card.querySelector(`[data-orig-el="${productId}"]`);

        if (priceEl) priceEl.textContent = `₹${newPrice}`;
        if (origEl) origEl.textContent = newOrig ? `₹${newOrig}` : '';
      });
    });

    // Quick Add button
    grid.querySelectorAll(".btn-card-add").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".product-card");
        const productId = btn.dataset.id;
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const activePill = card.querySelector(".w-pill.active");
        const selectedWeight = activePill ? activePill.dataset.weight : product.variants[0].weight;

        // Button feedback animation
        btn.classList.add("added");
        btn.innerHTML = `<span class="btn-icon">✓</span> <span class="btn-text">Added!</span>`;
        setTimeout(() => {
          btn.classList.remove("added");
          btn.innerHTML = `<span class="btn-icon">🛒</span> <span class="btn-text">Add to Cart</span>`;
        }, 1400);

        cart.addItem({
          productId: product.id,
          weight: selectedWeight,
          shape: "Round",
          isEggless: product.isVeg ? true : false,
          quantity: 1
        });

        showToast(`✨ ${product.name} (${selectedWeight}) added to cart!`);
      });
    });

    // Quick View and Product Title click opens Modal
    grid.querySelectorAll(".quick-view-btn, .product-title-link").forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = trigger.dataset.id;
        openQuickViewModal(productId);
      });
    });
  }

  // Quick View Modal Logic
  function openQuickViewModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product || !quickViewModal) return;

    let selectedWeight = (product.variants.find(v => v.default) || product.variants[0]).weight;
    let selectedShape = product.shapes ? product.shapes[0].name : "Round";
    let isEggless = product.isVeg ? true : false;
    let messageText = "";

    function renderModalContent() {
      const activeVariant = product.variants.find(v => v.weight === selectedWeight) || product.variants[0];
      let currentPrice = activeVariant.price;
      if (isEggless && product.egglessAvailable) currentPrice += (product.egglessExtra || 50);
      if (selectedShape && product.shapes) {
        const sh = product.shapes.find(s => s.name === selectedShape);
        if (sh) currentPrice += sh.priceExtra;
      }

      const modalBody = quickViewModal.querySelector(".modal-body-content");
      if (!modalBody) return;

      modalBody.innerHTML = `
        <div class="modal-product-layout">
          <!-- Gallery Col -->
          <div class="modal-gallery">
            <div class="modal-main-image-wrap">
              <img src="${product.image}" alt="${product.name}" class="modal-main-img">
              <div class="modal-badge-float">
                <span class="badge badge-${product.badgeColor || 'primary'}">${product.badge || 'Fresh'}</span>
              </div>
            </div>
            <div class="modal-guarantees">
              <div class="guarantee-item">
                <span>⏱</span>
                <div>
                  <strong>${product.deliveryTime}</strong>
                  <div>Fast refrigerated van delivery</div>
                </div>
              </div>
              <div class="guarantee-item">
                <span>🧁</span>
                <div>
                  <strong>Baked Fresh Daily</strong>
                  <div>Finest grade ingredients</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Details & Customization Col -->
          <div class="modal-info">
            <div class="modal-category-tag">${product.category.toUpperCase()} • ${product.subCategory || ''}</div>
            <h2 class="modal-title">${product.name}</h2>
            ${product.malayalamName ? `<div class="modal-malayalam-subtitle">${product.malayalamName}</div>` : ''}

            <div class="modal-rating-row">
              <span class="stars">★★★★★</span>
              <span class="rating-bold">${product.rating}</span>
              <span class="review-muted">(${product.reviewCount} Kerala customer reviews)</span>
            </div>

            <div class="modal-price-strip">
              <span class="modal-price">₹${currentPrice}</span>
              ${activeVariant.originalPrice ? `<span class="modal-strike-price">₹${activeVariant.originalPrice}</span>` : ''}
              <span class="modal-save-pill">Save ₹${(activeVariant.originalPrice || currentPrice) - currentPrice + 50}</span>
            </div>

            <p class="modal-description">${product.description}</p>

            <!-- Weight Selection -->
            <div class="modal-option-section">
              <div class="option-header">
                <span class="option-title">Select Weight & Servings</span>
                <span class="option-selected-hint">${activeVariant.serves || ''}</span>
              </div>
              <div class="modal-weights-grid">
                ${product.variants.map(v => `
                  <button type="button" class="modal-weight-btn ${v.weight === selectedWeight ? 'active' : ''}" data-weight="${v.weight}">
                    <span class="w-val">${v.weight}</span>
                    <span class="w-serves">${v.serves || 'Standard'}</span>
                    <span class="w-price">₹${v.price}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Shape Selection (if cake) -->
            ${product.shapes && product.shapes.length > 0 ? `
              <div class="modal-option-section">
                <div class="option-header">
                  <span class="option-title">Select Cake Shape</span>
                </div>
                <div class="modal-shapes-grid">
                  ${product.shapes.map(s => `
                    <button type="button" class="modal-shape-btn ${s.name === selectedShape ? 'active' : ''}" data-shape="${s.name}">
                      <span>${s.name === 'Heart' ? '💖' : (s.name === 'Square' ? '⬛' : '⭕')}</span>
                      <span>${s.name}</span>
                      ${s.priceExtra > 0 ? `<small class="extra-text">+₹${s.priceExtra}</small>` : ''}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Eggless / Veg Toggle -->
            ${product.egglessAvailable ? `
              <div class="modal-option-section">
                <div class="option-header">
                  <span class="option-title">Dietary Recipe</span>
                </div>
                <div class="modal-dietary-row">
                  <button type="button" class="modal-diet-btn ${!isEggless ? 'active' : ''}" data-eggless="false">
                    <span class="dot-red"></span> Standard Recipe
                  </button>
                  <button type="button" class="modal-diet-btn ${isEggless ? 'active' : ''}" data-eggless="true">
                    <span class="dot-green"></span> 100% Pure Eggless (+₹${product.egglessExtra || 50})
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Message on Cake -->
            ${product.category === 'cakes' ? `
              <div class="modal-option-section">
                <div class="option-header">
                  <span class="option-title">Message on Cake (Complimentary)</span>
                  <span class="option-selected-hint">Max 35 chars</span>
                </div>
                <input type="text" id="modal-cake-message" class="modal-text-input" placeholder="e.g. Happy Birthday Rahul!" maxlength="35" value="${messageText}">
              </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="modal-actions-row">
              <button type="button" id="modal-add-to-cart-btn" class="btn btn-primary btn-large">
                🛒 Add to Cart • ₹${currentPrice}
              </button>
              <button type="button" id="modal-buy-now-btn" class="btn btn-secondary btn-large">
                ⚡ Buy Now (Express)
              </button>
            </div>

            <!-- Allergen & Info accordion -->
            <div class="modal-meta-box">
              <div class="meta-item">
                <strong>Ingredients:</strong> ${product.ingredients}
              </div>
              <div class="meta-item">
                <strong>Allergens:</strong> ${product.allergens}
              </div>
            </div>
          </div>
        </div>
      `;

      bindModalEvents(currentPrice);
    }

    function bindModalEvents(currentPrice) {
      // Weight click
      quickViewModal.querySelectorAll(".modal-weight-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedWeight = btn.dataset.weight;
          renderModalContent();
        });
      });

      // Shape click
      quickViewModal.querySelectorAll(".modal-shape-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedShape = btn.dataset.shape;
          renderModalContent();
        });
      });

      // Eggless click
      quickViewModal.querySelectorAll(".modal-diet-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          isEggless = btn.dataset.eggless === "true";
          renderModalContent();
        });
      });

      // Cake message typing
      const msgInput = quickViewModal.querySelector("#modal-cake-message");
      if (msgInput) {
        msgInput.addEventListener("input", (e) => {
          messageText = e.target.value;
        });
      }

      // Add to Cart from modal
      const addBtn = quickViewModal.querySelector("#modal-add-to-cart-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          cart.addItem({
            productId: product.id,
            weight: selectedWeight,
            shape: selectedShape,
            isEggless: isEggless,
            messageOnCake: messageText,
            quantity: 1,
            unitPrice: currentPrice
          });
          closeModal();
          showToast(`✨ ${product.name} added to cart!`);
          window.dispatchEvent(new CustomEvent("cart:open"));
        });
      }

      // Buy Now
      const buyNowBtn = quickViewModal.querySelector("#modal-buy-now-btn");
      if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
          cart.addItem({
            productId: product.id,
            weight: selectedWeight,
            shape: selectedShape,
            isEggless: isEggless,
            messageOnCake: messageText,
            quantity: 1,
            unitPrice: currentPrice
          });
          closeModal();
          window.dispatchEvent(new CustomEvent("checkout:open"));
        });
      }
    }

    function closeModal() {
      quickViewModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }

    // Modal Close button
    const closeBtn = quickViewModal.querySelector(".modal-close-btn");
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }
    const backdrop = quickViewModal.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.onclick = closeModal;
    }

    renderModalContent();
    quickViewModal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  // Live Search listener
  window.addEventListener("search:filter", (e) => {
    searchQuery = e.detail || "";
    renderGrid();
  });

  renderGrid();
}
