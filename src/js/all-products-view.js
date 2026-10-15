import { cart } from "./cart.js";
import { wishlist } from "./wishlist-store.js";
import confetti from "canvas-confetti";

export function initAllProductsView(showToast) {
  const toggleBtn = document.getElementById("btnToggleAllProducts");
  const coverflowContainer = document.querySelector(".gallery-container");
  const gridWrap = document.getElementById("allProductsGridWrap");
  const gridContainer = document.getElementById("allProductsGrid");
  const countBadge = document.getElementById("catalogueCountBadge");
  const searchInput = document.getElementById("catalogueSearchInput");
  const hintPill = document.getElementById("showcaseHintPill");
  const subtitleEl = document.getElementById("showcaseSubtitle");

  if (!toggleBtn || !coverflowContainer || !gridWrap || !gridContainer) return;

  // Extract all 55 products from coverflow cards
  const carouselItems = document.querySelectorAll("#coverflowCards li");
  const products = [];

  carouselItems.forEach((li, index) => {
    const name = li.dataset.name || `Snack ${index + 1}`;
    const ingredients = li.dataset.ingredients || "";
    const eyebrow = li.dataset.eyebrow || "AUTHENTIC KERALA BAKERY";
    const tagline = li.dataset.tagline || "";
    const priceStr = li.dataset.price || "₹89";
    const price = parseInt(priceStr.replace(/[^0-9]/g, "")) || 89;
    const badge = li.dataset.badge || "";
    const badgeClass = li.dataset.badgeClass || "";
    const img = li.dataset.img || "/images/card_banana_chips_clean.jpg";
    const id = li.dataset.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const explicitCat = li.dataset.category;

    // Category detection heuristic
    const upper = name.toUpperCase();
    let category = explicitCat || "murukku";
    if (!explicitCat) {
    if (upper.includes("CHIPS") || upper.includes("UPPERI") || upper.includes("TAPIOCA STICK")) {
      category = "chips";
    } else if (upper.includes("MIXTURE") || upper.includes("OMAPPODI")) {
      category = "mixtures";
    } else if (upper.includes("SWEET") || upper.includes("KAJA") || upper.includes("LADDUMANI") || upper.includes("MADHURASEVA")) {
      category = "sweets";
    } else if (upper.includes("BISCUIT") || upper.includes("RUSK") || upper.includes("VARKEY")) {
      category = "biscuits";
    }
    }

    products.push({
      id,
      name,
      ingredients,
      eyebrow,
      tagline,
      price,
      priceStr,
      badge,
      badgeClass,
      img,
      category
    });
  });

  // Render 55 Products in Grid
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

    gridContainer.innerHTML = filteredProducts.map(prod => {
      const isSaved = wishlist.hasItem(prod.id);
      return `
        <div class="catalogue-prod-card store-prod-card" data-id="${prod.id}" data-name="${prod.name}" data-price="${prod.price}" data-img="${prod.img}" data-category="${prod.category}">
          ${prod.badge ? `<span class="card-badge-pill ${prod.badgeClass || 'badge-red'}">${prod.badge}</span>` : ''}
          <button type="button" class="card-wishlist-btn ${isSaved ? 'active' : ''}" aria-label="Add ${prod.name} to Wishlist">
            <i class="${isSaved ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
          </button>
          <div class="catalogue-img-box" role="button" tabindex="0" title="Click to view ingredients and details">
            <img src="${prod.img}" alt="${prod.name}" class="catalogue-prod-img" loading="lazy" onerror="this.src='/images/card_banana_chips_clean.jpg'">
          </div>
          <div class="catalogue-card-content">
            <span class="catalogue-eyebrow">${prod.eyebrow}</span>
            <h3 class="catalogue-prod-title" role="button" tabindex="0">${prod.name}</h3>
            <p class="catalogue-ingredients" title="${prod.ingredients}">${prod.tagline || prod.ingredients}</p>
            <div class="catalogue-price-row">
              <span class="catalogue-price">₹${prod.price}</span>
              <span class="catalogue-stock"><i class="ri-check-line"></i> Fresh &amp; In Stock</span>
            </div>
            <div class="catalogue-actions-row">
              <div class="card-stepper">
                <button type="button" class="stepper-btn stepper-minus">-</button>
                <span class="stepper-val">1</span>
                <button type="button" class="stepper-btn stepper-plus">+</button>
              </div>
              <button type="button" class="btn-catalogue-add-cart">
                <i class="ri-shopping-cart-2-line"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindCardEvents();
  }

  // Bind Card Interactions (Steppers, Add to Cart, Wishlist, Modal)
  function bindCardEvents() {
    gridContainer.querySelectorAll(".catalogue-prod-card").forEach(card => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price) || 89;
      const img = card.dataset.img;

      // 1. Steppers
      const minusBtn = card.querySelector(".stepper-minus");
      const plusBtn = card.querySelector(".stepper-plus");
      const valEl = card.querySelector(".stepper-val");
      let qty = 1;

      if (minusBtn && plusBtn && valEl) {
        minusBtn.onclick = (e) => {
          e.stopPropagation();
          if (qty > 1) {
            qty--;
            valEl.textContent = qty;
          }
        };
        plusBtn.onclick = (e) => {
          e.stopPropagation();
          qty++;
          valEl.textContent = qty;
        };
      }

      // 2. Add to Cart
      const addBtn = card.querySelector(".btn-catalogue-add-cart");
      if (addBtn) {
        addBtn.onclick = (e) => {
          e.stopPropagation();
          cart.addItem({
            productId: id,
            productName: name,
            unitPrice: price,
            productImage: img,
            quantity: qty
          });

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#0f3822', '#e2b87f', '#d32f2f', '#10b981']
            });
          } catch (err) {}

          showToast(`Added ${qty}x ${name} to your cart! 🛍️`);
          window.dispatchEvent(new CustomEvent("cart:open"));
        };
      }

      // 3. Wishlist Heart
      const wishBtn = card.querySelector(".card-wishlist-btn");
      if (wishBtn) {
        wishBtn.onclick = (e) => {
          e.stopPropagation();
          const wasAdded = wishlist.toggleItem({
            productId: id,
            productName: name,
            unitPrice: price,
            productImage: img
          });

          const icon = wishBtn.querySelector("i");
          if (wasAdded) {
            wishBtn.classList.add("active");
            if (icon) {
              icon.classList.remove("ri-heart-line");
              icon.classList.add("ri-heart-fill");
            }
            showToast(`Saved ${name} to Wishlist! ❤️`);
            try {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { y: 0.65 },
                colors: ['#d32f2f', '#e2b87f']
              });
            } catch (err) {}
          } else {
            wishBtn.classList.remove("active");
            if (icon) {
              icon.classList.remove("ri-heart-fill");
              icon.classList.add("ri-heart-line");
            }
            showToast(`Removed from Wishlist`);
          }
        };
      }

      // 4. Open Details Modal on Image / Title Click
      const clickables = card.querySelectorAll(".catalogue-img-box, .catalogue-prod-title");
      clickables.forEach(el => {
        el.onclick = () => {
          openProductModal(id);
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
    if (modalPrice) modalPrice.textContent = `₹${prod.price}`;

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
            colors: ['#0f3822', '#e2b87f', '#d32f2f']
          });
        } catch (err) {}
        showToast(`Added ${prod.name} to Cart! 🛍️`);
        window.dispatchEvent(new CustomEvent("cart:open"));
      };
    }

    modal.classList.add("is-open");
  }

  // Initial Grid Render
  renderGrid();

  // Toggle Between 3D Coverflow and Grid View
  let isGridView = false;

  function setViewMode(gridActive) {
    isGridView = gridActive;
    toggleBtn.setAttribute("aria-expanded", isGridView);

    if (isGridView) {
      coverflowContainer.style.display = "none";
      gridWrap.style.display = "block";
      toggleBtn.classList.add("active-grid");

      // Update button text & icon
      toggleBtn.innerHTML = `
        <div class="view-all-text-wrap">
          <span class="view-all-label">3D Carousel</span>
          <span class="view-all-sub">Swipe View</span>
        </div>
        <div class="view-all-icon-circle">
          <i class="ri-film-line"></i>
        </div>
      `;

      if (hintPill) {
        hintPill.innerHTML = `
          <i class="ri-layout-grid-line"></i>
          <span>Showing all 55 authentic Kerala snacks • Filter by category or search below</span>
        `;
      }

      if (subtitleEl) {
        subtitleEl.textContent = "Browse all 55 authentic Kerala snacks, freshly made and delivered directly to your door.";
      }

      // Smooth scroll to showcase
      const target = document.getElementById("products");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      gridWrap.style.display = "none";
      coverflowContainer.style.display = "block";
      toggleBtn.classList.remove("active-grid");

      // Update button text & icon back to View All
      toggleBtn.innerHTML = `
        <div class="view-all-text-wrap">
          <span class="view-all-label">View All</span>
          <span class="view-all-sub">55 Snacks</span>
        </div>
        <div class="view-all-icon-circle">
          <i class="ri-grid-fill"></i>
        </div>
      `;

      if (hintPill) {
        hintPill.innerHTML = `
          <i class="ri-drag-move-fill"></i>
          <span>Trackpad horizontal swipe enabled • Tactile tick sound feedback • Tap card to explore</span>
        `;
      }

      if (subtitleEl) {
        subtitleEl.textContent = "Swipe sideways on your trackpad or drag with your mouse to explore 55 freshly prepared Malabar snack specialties.";
      }
    }
  }

  toggleBtn.addEventListener("click", () => {
    setViewMode(!isGridView);
  });

  // Category Filter Chips
  const categoryChips = document.querySelectorAll(".category-chip");
  categoryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      categoryChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const cat = chip.dataset.category;
      if (cat === "all") {
        renderGrid(products);
      } else {
        const filtered = products.filter(p => p.category === cat);
        renderGrid(filtered);
      }
    });
  });

  // Search Input Filter
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const activeChip = document.querySelector(".category-chip.active");
      const activeCat = activeChip ? activeChip.dataset.category : "all";

      let filtered = products;
      if (activeCat !== "all") {
        filtered = filtered.filter(p => p.category === activeCat);
      }

      if (query) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.ingredients.toLowerCase().includes(query)
        );
      }

      renderGrid(filtered);
    });
  }

  // Also bind any other "Shop All" buttons to open grid view
  window.addEventListener("products:view-all", () => {
    setViewMode(true);
  });
}
