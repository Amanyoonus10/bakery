import { cart } from "./cart.js";
import { wishlist } from "./wishlist-store.js";
import { PRODUCTS } from "../data/products.js";
import confetti from "canvas-confetti";

export function initAllProductsView(showToast) {
  const gridWrap = document.getElementById("allProductsGridWrap");
  const gridContainer = document.getElementById("allProductsGrid");
  const countBadge = document.getElementById("catalogueCountBadge");
  const searchInput = document.getElementById("catalogueSearchInput");
  const sortSelect = document.getElementById("haldiramSortSelect");
  const filterBtn = document.getElementById("btnHaldiramFilter");
  const filterPanel = document.getElementById("haldiramFilterPanel");

  if (!gridWrap || !gridContainer) return;

  // Use all 55 products directly from products dataset
  const products = PRODUCTS.map((prod, index) => ({
    id: prod.id,
    name: prod.name,
    ingredients: prod.ingredients || "",
    eyebrow: prod.eyebrow || "AUTHENTIC KERALA BAKERY",
    tagline: prod.tagline || "",
    price: prod.price || 89,
    priceStr: `₹${prod.price || 89}`,
    badge: prod.badge || "",
    badgeClass: prod.badgeClass || "",
    img: prod.imageWebp || prod.image || "/images/card_banana_chips_clean.jpg",
    category: prod.category || "mixtures",
    rating: prod.rating || (4.8 + ((index % 3) * 0.1)),
    description: prod.description || "",
    nutrition: prod.nutrition || ""
  }));

  // Haldiram's Package Weight Options per product
  function getProductWeights(prod) {
    if (prod.category === "biscuits") {
      return [
        { label: "250 gm", mult: 1 },
        { label: "500 gm", mult: 1.9 },
        { label: "1 kg", mult: 3.6 }
      ];
    } else if (prod.category === "sweets") {
      return [
        { label: "250 gm", mult: 1 },
        { label: "500 gm", mult: 1.95 },
        { label: "1 kg", mult: 3.8 }
      ];
    } else {
      // Authentic Haldiram's Savories Options: 200 gm, 400 gm, 600 gm, 1 kg
      return [
        { label: "200 gm", mult: 1 },
        { label: "400 gm", mult: 1.9 },
        { label: "600 gm", mult: 2.8 },
        { label: "1 kg", mult: 4.4 }
      ];
    }
  }

  // Helper to query quantity of a specific card's selected variant from cart
  function getVariantCartQty(id, weight) {
    const weightSlug = (weight || "200 gm").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const targetVariantId = `${id}-${weightSlug}`;
    const cartItem = cart.items.find(i => i.productId === targetVariantId);
    return cartItem ? cartItem.quantity : 0;
  }

  // Update a single card's stepper/ADD button display based on current cart state
  function updateCardStepperState(card) {
    const id = card.dataset.id;
    const currentWeight = card.dataset.selectedWeight || "200 gm";
    const qty = getVariantCartQty(id, currentWeight);

    const addBtn = card.querySelector(".haldiram-add-btn");
    const stepper = card.querySelector(".haldiram-card-stepper");
    const stepperVal = card.querySelector(".haldiram-stepper-val");

    if (!addBtn || !stepper || !stepperVal) return;

    if (qty > 0) {
      addBtn.style.display = "none";
      stepper.style.display = "flex";
      stepperVal.textContent = qty;
    } else {
      stepper.style.display = "none";
      addBtn.style.display = "flex";
    }
  }

  // Update all product cards in grid when cart state changes
  function updateAllCardSteppers() {
    if (!gridContainer) return;
    gridContainer.querySelectorAll(".haldiram-card").forEach(card => {
      updateCardStepperState(card);
    });
  }

  // Generate Haldiram's Style Product Card
  function generateCardHtml(prod) {
    const isSaved = wishlist.hasItem(prod.id);
    const weights = getProductWeights(prod);
    const defaultWeight = weights[0].label;
    const basePrice = prod.price;
    const initialQty = getVariantCartQty(prod.id, defaultWeight);

    return `
      <div class="haldiram-card" data-id="${prod.id}" data-name="${prod.name}" data-base-price="${basePrice}" data-current-price="${basePrice}" data-selected-weight="${defaultWeight}" data-img="${prod.img}" data-category="${prod.category}">
        <div class="haldiram-img-box" role="button" tabindex="0" title="Click to view ${prod.name}">
          ${prod.badge ? `<span class="haldiram-badge ${prod.badgeClass || ''}">${prod.badge}</span>` : ''}
          <button type="button" class="haldiram-wishlist-btn ${isSaved ? 'active' : ''}" aria-label="Add ${prod.name} to Wishlist">
            <i class="${isSaved ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
          </button>
          <img src="${prod.img}" alt="${prod.name}" class="haldiram-img" loading="lazy" onerror="if (this.src.endsWith('.webp')) { this.src = this.src.replace('.webp', '.png'); } else { this.src='/images/card_banana_chips_clean.jpg'; }">
        </div>
        <div class="haldiram-content">
          <div class="haldiram-title-row">
            <h3 class="haldiram-title" role="button" tabindex="0" title="${prod.name}">${prod.name}</h3>
            <span class="haldiram-veg-icon" title="100% Pure Vegetarian">
              <span class="haldiram-veg-dot"></span>
            </span>
          </div>

          <!-- Weight Selection Pills -->
          <div class="haldiram-weights-row" aria-label="Select package size">
            ${weights.map((w, idx) => `
              <button type="button" 
                      class="haldiram-weight-pill ${idx === 0 ? 'active' : ''}" 
                      data-weight="${w.label}" 
                      data-mult="${w.mult}">
                ${w.label}
              </button>
            `).join('')}
          </div>

          <!-- Price formatted in Indian retail slash-dash style: ₹60/- -->
          <div class="haldiram-price-row">
            <span class="haldiram-price">₹${basePrice}/-</span>
          </div>

          <!-- Card Action Container: switches between ADD + and - [count] + -->
          <div class="haldiram-action-wrap">
            <button type="button" class="haldiram-add-btn" aria-label="Add ${prod.name} to cart" style="${initialQty > 0 ? 'display: none;' : 'display: flex;'}">
              <span>ADD</span>
              <span class="add-plus">+</span>
            </button>
            <div class="haldiram-card-stepper" aria-label="Quantity for ${prod.name}" style="${initialQty > 0 ? 'display: flex;' : 'display: none;'}">
              <button type="button" class="haldiram-stepper-btn haldiram-stepper-minus" aria-label="Decrease quantity">−</button>
              <span class="haldiram-stepper-val">${initialQty || 1}</span>
              <button type="button" class="haldiram-stepper-btn haldiram-stepper-plus" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render Products in Haldiram's Grid
  function renderGrid(filteredProducts = products) {
    if (!gridContainer) return;

    if (!filteredProducts.length) {
      gridContainer.innerHTML = `
        <div class="catalogue-empty-state">
          <i class="ri-search-line"></i>
          <h4>No snacks found matching your search</h4>
          <p>Try searching for banana chips, mixture, murukku or sweet kaja.</p>
        </div>
      `;
      if (countBadge) countBadge.textContent = "0 items";
      return;
    }

    if (countBadge) {
      countBadge.textContent = `${filteredProducts.length} items`;
    }

    gridContainer.innerHTML = `
      <div class="haldiram-grid">
        ${filteredProducts.map(generateCardHtml).join("")}
      </div>
    `;

    bindCardEvents();
  }

  // Bind Card Interactions (Weight Variant, ADD +, Stepper +/- , Wishlist, Navigation)
  function bindCardEvents() {
    gridContainer.querySelectorAll(".haldiram-card").forEach(card => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const basePrice = parseInt(card.dataset.basePrice) || 89;
      const img = card.dataset.img;

      const addBtn = card.querySelector(".haldiram-add-btn");
      const stepper = card.querySelector(".haldiram-card-stepper");
      const stepperVal = card.querySelector(".haldiram-stepper-val");
      const minusBtn = card.querySelector(".haldiram-stepper-minus");
      const plusBtn = card.querySelector(".haldiram-stepper-plus");

      // 1. Weight Variant Switching
      card.querySelectorAll(".haldiram-weight-pill").forEach(pill => {
        pill.onclick = (e) => {
          e.stopPropagation();
          card.querySelectorAll(".haldiram-weight-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");

          const mult = parseFloat(pill.dataset.mult) || 1;
          const weight = pill.dataset.weight;
          const newPrice = Math.round(basePrice * mult);

          card.dataset.currentPrice = newPrice;
          card.dataset.selectedWeight = weight;

          const priceEl = card.querySelector(".haldiram-price");
          if (priceEl) {
            priceEl.textContent = `₹${newPrice}/-`;
          }

          // Instantly sync the stepper state to the newly selected weight!
          updateCardStepperState(card);
        };
      });

      // 2. Initial ADD + Click -> Transitions to [- 1 +] stepper
      if (addBtn) {
        addBtn.onclick = (e) => {
          e.stopPropagation();
          const currentPrice = parseInt(card.dataset.currentPrice) || basePrice;
          const currentWeight = card.dataset.selectedWeight || "200 gm";
          const weightSlug = currentWeight.toLowerCase().replace(/[^a-z0-9]+/g, "");

          cart.addItem({
            productId: `${id}-${weightSlug}`,
            productName: `${name} (${currentWeight})`,
            weight: currentWeight,
            unitPrice: currentPrice,
            productImage: img,
            quantity: 1
          });

          // Transition to stepper display immediately
          addBtn.style.display = "none";
          stepper.style.display = "flex";
          if (stepperVal) {
            stepperVal.textContent = "1";
            stepperVal.classList.add("qty-bump");
            setTimeout(() => stepperVal.classList.remove("qty-bump"), 250);
          }

          try {
            confetti({
              particleCount: 35,
              spread: 50,
              origin: { y: 0.7 },
              colors: ['#0f3822', '#e2b87f', '#f8f3eb', '#16a34a']
            });
          } catch (err) {}

          showToast(`Added ${name} (${currentWeight}) to cart! 🛍️`);
        };
      }

      // 3. Plus Button (+) -> Increments Quantity
      if (plusBtn) {
        plusBtn.onclick = (e) => {
          e.stopPropagation();
          const currentPrice = parseInt(card.dataset.currentPrice) || basePrice;
          const currentWeight = card.dataset.selectedWeight || "200 gm";
          const weightSlug = currentWeight.toLowerCase().replace(/[^a-z0-9]+/g, "");
          const targetVariantId = `${id}-${weightSlug}`;

          const cartItem = cart.items.find(i => i.productId === targetVariantId);
          if (cartItem) {
            cart.updateQuantity(cartItem.itemKey, 1);
          } else {
            cart.addItem({
              productId: targetVariantId,
              productName: `${name} (${currentWeight})`,
              weight: currentWeight,
              unitPrice: currentPrice,
              productImage: img,
              quantity: 1
            });
          }

          const updated = cart.items.find(i => i.productId === targetVariantId);
          if (stepperVal && updated) {
            stepperVal.textContent = updated.quantity;
            stepperVal.classList.add("qty-bump");
            setTimeout(() => stepperVal.classList.remove("qty-bump"), 250);
          }
        };
      }

      // 4. Minus Button (-) -> Decrements Quantity or Removes Item
      if (minusBtn) {
        minusBtn.onclick = (e) => {
          e.stopPropagation();
          const currentWeight = card.dataset.selectedWeight || "200 gm";
          const weightSlug = currentWeight.toLowerCase().replace(/[^a-z0-9]+/g, "");
          const targetVariantId = `${id}-${weightSlug}`;

          const cartItem = cart.items.find(i => i.productId === targetVariantId);
          if (!cartItem) return;

          if (cartItem.quantity > 1) {
            cart.updateQuantity(cartItem.itemKey, -1);
            const updated = cart.items.find(i => i.productId === targetVariantId);
            if (stepperVal && updated) {
              stepperVal.textContent = updated.quantity;
              stepperVal.classList.add("qty-bump");
              setTimeout(() => stepperVal.classList.remove("qty-bump"), 250);
            }
          } else {
            // Reached 0 -> remove from cart and revert to ADD + button
            cart.updateQuantity(cartItem.itemKey, -1);
            stepper.style.display = "none";
            addBtn.style.display = "flex";
            showToast(`Removed ${name} (${currentWeight}) from cart`);
          }
        };
      }

      // 5. Wishlist Heart
      const wishBtn = card.querySelector(".haldiram-wishlist-btn");
      if (wishBtn) {
        wishBtn.onclick = (e) => {
          e.stopPropagation();
          const icon = wishBtn.querySelector("i");
          if (wishlist.hasItem(id)) {
            wishlist.removeItem(id);
            wishBtn.classList.remove("active");
            if (icon) {
              icon.classList.remove("ri-heart-fill");
              icon.classList.add("ri-heart-line");
            }
            showToast(`Removed ${name} from Wishlist`);
          } else {
            wishlist.addItem({
              id: id,
              name: name,
              price: parseInt(card.dataset.currentPrice) || basePrice,
              image: img,
              category: card.dataset.category
            });
            wishBtn.classList.add("active");
            if (icon) {
              icon.classList.remove("ri-heart-line");
              icon.classList.add("ri-heart-fill");
            }
            showToast(`Saved ${name} to Wishlist! ❤️`);
          }
        };
      }

      // 6. Open Product Details Page on Image / Title Click
      const clickables = card.querySelectorAll(".haldiram-img-box, .haldiram-title");
      clickables.forEach(el => {
        el.onclick = (e) => {
          if (e.target.closest(".haldiram-wishlist-btn") || e.target.closest(".haldiram-action-wrap") || e.target.closest(".haldiram-weight-pill")) {
            return;
          }
          window.location.href = `product.html?id=${encodeURIComponent(id)}`;
        };
      });
    });
  }

  // Open Modal Helper
  function openProductModal(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById("productModal");
    if (!modal) return;

    const modalImg = document.getElementById("productModalImg");
    const modalBadge = document.getElementById("productModalBadge");
    const modalEyebrow = document.getElementById("productModalEyebrow");
    const modalName = document.getElementById("productModalName");
    const modalTagline = document.getElementById("productModalTagline");
    const modalDesc = document.getElementById("productModalDesc");
    const modalPrice = document.getElementById("productModalPrice");
    const modalAddToCart = document.getElementById("productModalAddToCart");

    if (modalImg) modalImg.src = prod.img;
    if (modalBadge) {
      modalBadge.textContent = prod.badge;
      modalBadge.style.display = prod.badge ? "inline-block" : "none";
    }
    if (modalEyebrow) modalEyebrow.textContent = prod.eyebrow;
    if (modalName) modalName.textContent = prod.name;
    if (modalTagline) modalTagline.textContent = prod.tagline;
    if (modalDesc) {
      modalDesc.innerHTML = `
        <p><strong>Ingredients:</strong> ${prod.ingredients || 'Fresh natural ingredients, traditional Malabar recipe.'}</p>
        <p style="margin-top:8px; font-size:0.86rem; color:#666;">
          Hand-crafted in coconut oil, packed fresh with zero artificial preservatives for authentic crispiness.
        </p>
      `;
    }
    if (modalPrice) modalPrice.textContent = `₹${prod.price}/-`;

    if (modalAddToCart) {
      modalAddToCart.onclick = () => {
        cart.addItem({
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.price,
          productImage: prod.img,
          quantity: 1
        });
        modal.classList.remove("is-open");
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#0f3822', '#e2b87f', '#f8f3eb', '#16a34a']
          });
        } catch (err) {}
        showToast(`Added ${prod.name} to Cart! 🛍️`);
        window.dispatchEvent(new CustomEvent("cart:open"));
      };
    }

    modal.classList.add("is-open");
  }

  // Filter and Sort Controller
  function applyFilterAndSort() {
    const activeChip = document.querySelector(".category-chip.active");
    const activeCat = activeChip ? activeChip.dataset.category : "all";
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const sortVal = sortSelect ? sortSelect.value : "featured";

    let result = [...products];

    // Category filter
    if (activeCat !== "all") {
      result = result.filter(p => p.category === activeCat);
    }

    // Search query filter
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.ingredients.toLowerCase().includes(query)
      );
    }

    // Sort order
    if (sortVal === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortVal === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortVal === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === "popular") {
      result.sort((a, b) => b.rating - a.rating);
    }

    renderGrid(result);
  }

  // Filter Button Toggle for Panel on mobile
  if (filterBtn && filterPanel) {
    filterBtn.addEventListener("click", () => {
      const isExpanded = filterBtn.getAttribute("aria-expanded") === "true";
      filterBtn.setAttribute("aria-expanded", String(!isExpanded));
      filterPanel.classList.toggle("mobile-hidden");
    });
  }

  // Category Filter Chips
  const categoryChips = document.querySelectorAll(".category-chip");
  categoryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      categoryChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilterAndSort();
    });
  });

  // Search Input Filter
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyFilterAndSort();
    });
  }

  // Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFilterAndSort();
    });
  }

  // Initial Grid Render: 55 snacks displayed immediately
  renderGrid();

  // Scroll to products on Shop All actions
  const scrollToProducts = () => {
    const target = document.getElementById("products") || document.getElementById("shop-all");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.addEventListener("products:view-all", scrollToProducts);

  if (window.location.hash === "#shop-all" || window.location.hash === "#products") {
    setTimeout(scrollToProducts, 100);
  }

  document.querySelectorAll('a[href="#shop-all"], a[href="#products"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToProducts();
    });
  });

  // Re-sync all card steppers whenever the cart updates
  window.addEventListener("cart:updated", () => {
    updateAllCardSteppers();
  });
}


