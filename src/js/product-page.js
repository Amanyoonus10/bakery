import { PRODUCTS } from "../data/products.js";
import { cart } from "./cart.js";
import { wishlist } from "./wishlist-store.js";
import { initCartDrawerUI } from "./cart-drawer-ui.js";
import { initCheckoutModal } from "./checkout-modal.js";
import { initWishlistUI } from "./wishlist-ui.js";
import { initAccountUI } from "./account-ui.js";
import confetti from "canvas-confetti";

// Toast Notification
export function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

window.showBakeryToast = showToast;

function formatTitle(name) {
  if (!name) return "";
  if (name === name.toUpperCase()) {
    return name
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return name;
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Global Stores & Drawers
  initCartDrawerUI(showToast);
  initCheckoutModal(showToast);
  initWishlistUI(showToast);
  initAccountUI(showToast);

  // 2. Extract Product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  let prodId = urlParams.get("id") || urlParams.get("product");

  // Robust product lookup supporting IDs, slugs, and aliases (e.g. keerthi-manda -> keerthi-egg-biscuits)
  let product = PRODUCTS.find(
    p => p.id === prodId || p.slug === prodId || (p.aliases && p.aliases.includes(prodId))
  );
  if (!product && prodId) {
    const lower = prodId.toLowerCase();
    product = PRODUCTS.find(
      p => p.id.toLowerCase() === lower ||
           p.slug.toLowerCase() === lower ||
           (p.aliases && p.aliases.some(a => a.toLowerCase() === lower)) ||
           p.name.toLowerCase().includes(lower)
    );
  }
  if (!product) {
    product = PRODUCTS[0];
  }

  // Update Page Title
  document.title = `${formatTitle(product.name)} — Keerthi Bakery | Pee Kay Group`;

  // 3. Render Product Info
  renderProductDetails(product);

  // 4. Render Suggestions / "You May Also Like"
  renderSuggestions(product);

  // 5. Setup Global Header Cart Count
  updateHeaderCartCount();
  window.addEventListener("cartUpdated", updateHeaderCartCount);
});

function updateHeaderCartCount() {
  const badge = document.getElementById("headerCartCount");
  if (badge) {
    const total = typeof cart.getItemCount === "function" ? cart.getItemCount() : 0;
    badge.textContent = total;
  }
}

// Render Main Product Details
function renderProductDetails(product) {
  const formattedTitle = formatTitle(product.name);

  // Breadcrumbs
  const breadcrumbCurrent = document.getElementById("pdpBreadcrumbCurrent");
  const breadcrumbCategory = document.getElementById("pdpBreadcrumbCategory");
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = formattedTitle;
  if (breadcrumbCategory) {
    let catName = "Savouries & Snacks";
    if (product.category === "chips") catName = "Banana & Tapioca Chips";
    else if (product.category === "mixtures") catName = "Kerala Mixtures & Sev";
    else if (product.category === "biscuits") catName = "Bakery & Biscuits";
    else if (product.category === "sweets") catName = "Traditional Sweets";
    breadcrumbCategory.textContent = catName;
  }

  // Image
  const mainImg = document.getElementById("pdpMainImg");
  if (mainImg) {
    mainImg.src = product.imageWebp || product.image || "/images/card_banana_chips_clean.jpg";
    mainImg.alt = formattedTitle;
    mainImg.onerror = function() {
      if (this.src.endsWith(".webp")) {
        this.src = this.src.replace(".webp", ".png");
      } else {
        this.src = "/images/card_banana_chips_clean.jpg";
      }
    };
  }

  // Share Button
  const shareBtn = document.getElementById("haldiramShareBtn");
  if (shareBtn) {
    shareBtn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: formattedTitle,
          text: `Check out ${formattedTitle} from Keerthi Bakery!`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast("Product link copied to clipboard! 📋");
        });
      }
    };
  }

  // Title
  const titleEl = document.getElementById("pdpTitle");
  if (titleEl) titleEl.textContent = formattedTitle;

  // Base Price & Calculation from PRICEWEB.xlsx variants
  const variants = (product.variants && product.variants.length > 0)
    ? product.variants
    : [{ label: product.unit || "200g", price: product.price || 85 }];

  const defaultVariant = variants[0];
  const basePrice = defaultVariant.price;
  let currentPrice = basePrice;
  let selectedWeight = defaultVariant.label || defaultVariant.weight || "200g";
  let quantity = 1;

  const livePriceEl = document.getElementById("pdpLivePrice");
  if (livePriceEl) livePriceEl.textContent = `₹${basePrice}/-`;

  // Short Excerpt / Description
  const shortDescEl = document.getElementById("pdpShortDesc");
  if (shortDescEl) {
    if (product.description) {
      const firstSentence = product.description.split(".")[0];
      shortDescEl.textContent = `${firstSentence}....`;
    } else {
      shortDescEl.textContent = `${formattedTitle} are handcrafted authentic Kerala snacks prepared with pure ingredients....`;
    }
  }

  // Read More button scrolls to Description tab
  const readMoreBtn = document.getElementById("pdpReadMoreBtn");
  if (readMoreBtn) {
    readMoreBtn.onclick = () => {
      const tabsWrapper = document.getElementById("haldiramTabsWrapper");
      if (tabsWrapper) {
        tabsWrapper.scrollIntoView({ behavior: "smooth" });
        const descTabBtn = document.querySelector('.haldiram-tab-nav[data-target="tab-desc"]');
        if (descTabBtn) descTabBtn.click();
      }
    };
  }

  // Pincode Delivery Check
  const pinInput = document.getElementById("haldiramPincodeInput");
  const pinBtn = document.getElementById("haldiramPincodeBtn");
  const pinStatus = document.getElementById("haldiramPincodeStatus");

  if (pinBtn && pinInput && pinStatus) {
    pinBtn.onclick = () => {
      const code = pinInput.value.trim();
      if (/^\d{6}$/.test(code)) {
        pinStatus.textContent = "Delivery available in your area.";
        pinStatus.style.color = "#16a34a";
      } else {
        pinStatus.textContent = "Please enter a valid 6-digit Indian pincode.";
        pinStatus.style.color = "#dc2626";
      }
    };
  }

  // Authentic Package Weight & Size Variants from PRICEWEB.xlsx
  const weightsContainer = document.getElementById("pdpWeightsGrid");
  if (weightsContainer) {
    weightsContainer.innerHTML = variants.map((w, idx) => `
      <button type="button" class="haldiram-variant-pill ${idx === 0 ? 'active' : ''}" data-weight="${w.label}" data-price="${w.price}">
        ${w.label}
      </button>
    `).join("");

    weightsContainer.querySelectorAll(".haldiram-variant-pill").forEach(btn => {
      btn.onclick = () => {
        weightsContainer.querySelectorAll(".haldiram-variant-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedWeight = btn.dataset.weight;
        currentPrice = parseInt(btn.dataset.price) || basePrice;
        if (livePriceEl) livePriceEl.textContent = `₹${currentPrice}/-`;
      };
    });
  }

  // Stepper Controls
  const qtyMinus = document.getElementById("pdpQtyMinus");
  const qtyPlus = document.getElementById("pdpQtyPlus");
  const qtyVal = document.getElementById("pdpQtyVal");

  if (qtyMinus && qtyPlus && qtyVal) {
    quantity = 1;
    qtyVal.textContent = "1";

    qtyMinus.onclick = () => {
      if (quantity > 1) {
        quantity--;
        qtyVal.textContent = quantity;
      }
    };

    qtyPlus.onclick = () => {
      quantity++;
      qtyVal.textContent = quantity;
    };
  }

  // CHECKOUT CTA Button
  const checkoutBtn = document.getElementById("pdpCheckoutBtn");
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      cart.addItem({
        id: `${product.id}-${selectedWeight}`,
        name: `${formattedTitle} (${selectedWeight})`,
        price: currentPrice,
        image: product.image,
        category: product.category
      }, quantity);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      showToast(`Added ${quantity}x ${formattedTitle} to Cart!`);

      // Open Express Checkout Modal
      window.dispatchEvent(new CustomEvent("checkout:open"));
      updateHeaderCartCount();
    };
  }

  // Tabs: DESCRIPTION & DETAILS
  const hookEl = document.getElementById("pdpDescHook");
  const bodyEl = document.getElementById("pdpDescBody");
  if (hookEl) {
    hookEl.textContent = "Simple flavour. Serious crunch. The kind of snack that mysteriously disappears before you realise you have eaten half the pack.";
  }
  if (bodyEl) {
    bodyEl.textContent = product.description 
      ? `Authentic Keerthi Bakery ${formattedTitle}: ${product.description}`
      : `Authentic Keerthi Bakery ${formattedTitle} are prepared daily with pure local ingredients, natural spices, and uncompromised Malabar craftsmanship.`;
  }

  // Details Tab Content
  const ingVal = document.getElementById("pdpDetailsIngredients");
  const nutVal = document.getElementById("pdpDetailsNutrition");
  if (ingVal) ingVal.textContent = product.ingredients || "Selected high quality ingredients, pure vegetable oil, aromatic curry leaves, and sea salt.";
  if (nutVal) nutVal.textContent = product.nutrition || "Energy: 485 kcal • Protein: 16g • Carbohydrates: 45g • Fat: 26g (Per 100g)";

  // Tab Switching
  const tabNavs = document.querySelectorAll(".haldiram-tab-nav");
  const tabContents = document.querySelectorAll(".haldiram-tab-content");

  tabNavs.forEach(nav => {
    nav.onclick = () => {
      tabNavs.forEach(n => {
        n.classList.remove("active");
        n.setAttribute("aria-selected", "false");
      });
      tabContents.forEach(c => c.classList.remove("active"));

      nav.classList.add("active");
      nav.setAttribute("aria-selected", "true");
      const targetId = nav.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add("active");
    };
  });
}

// Render "You May Also Like" Suggestions
function renderSuggestions(currentProduct) {
  const grid = document.getElementById("pdpSuggestionsGrid");
  if (!grid) return;

  const suggestions = PRODUCTS.filter(p => p.id !== currentProduct.id).slice(0, 4);

  function getQty(id) {
    const item = cart.items.find(i => i.productId === id || i.productId.startsWith(`${id}-`));
    return item ? item.quantity : 0;
  }

  function updateCard(card) {
    const id = card.dataset.id;
    const qty = getQty(id);
    const addBtn = card.querySelector(".haldiram-card-add-btn");
    const stepper = card.querySelector(".haldiram-suggestion-stepper");
    const val = card.querySelector(".mini-step-val");

    if (qty > 0) {
      if (addBtn) addBtn.style.display = "none";
      if (stepper) stepper.style.display = "flex";
      if (val) val.textContent = qty;
    } else {
      if (stepper) stepper.style.display = "none";
      if (addBtn) addBtn.style.display = "flex";
    }
  }

  function renderGrid() {
    grid.innerHTML = suggestions.map(prod => {
      const formatted = formatTitle(prod.name);
      const initialQty = getQty(prod.id);
      return `
        <div class="haldiram-card" data-id="${prod.id}" data-name="${formatted}" data-price="${prod.price}" data-img="${prod.image}">
          <div class="haldiram-card-img-wrap" onclick="window.location.href='product.html?id=${prod.id}'">
            ${prod.badge ? `<span class="haldiram-card-badge">${prod.badge}</span>` : ''}
            <img src="${prod.imageWebp || prod.image}" alt="${formatted}" class="haldiram-card-img" loading="lazy" onerror="this.onerror=null; this.src='${(prod.image || '').replace('.webp', '.jpg')}';">
          </div>
          <div class="haldiram-card-body">
            <h3 class="haldiram-card-title" onclick="window.location.href='product.html?id=${prod.id}'">${formatted}</h3>
            <div class="haldiram-card-price-row">
              <span class="haldiram-card-price">₹${prod.price}/-</span>
              <div class="haldiram-suggestion-action-wrap">
                <button type="button" class="haldiram-card-add-btn" data-id="${prod.id}" data-name="${formatted}" data-price="${prod.price}" data-img="${prod.image}" style="${initialQty > 0 ? 'display: none;' : 'display: flex;'}">
                  ADD +
                </button>
                <div class="haldiram-suggestion-stepper" data-id="${prod.id}" style="${initialQty > 0 ? 'display: flex;' : 'display: none;'}">
                  <button type="button" class="mini-step-btn minus" aria-label="Decrease quantity">−</button>
                  <span class="mini-step-val">${initialQty || 1}</span>
                  <button type="button" class="mini-step-btn plus" aria-label="Increase quantity">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".haldiram-card").forEach(card => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price) || 85;
      const img = card.dataset.img;

      const addBtn = card.querySelector(".haldiram-card-add-btn");
      const plusBtn = card.querySelector(".mini-step-btn.plus");
      const minusBtn = card.querySelector(".mini-step-btn.minus");

      if (addBtn) {
        addBtn.onclick = (e) => {
          e.stopPropagation();
          cart.addItem({
            productId: id,
            productName: name,
            unitPrice: price,
            productImage: img,
            quantity: 1
          });
          updateCard(card);
          showToast(`Added ${name} to Cart! 🛍️`);
          updateHeaderCartCount();
        };
      }

      if (plusBtn) {
        plusBtn.onclick = (e) => {
          e.stopPropagation();
          const item = cart.items.find(i => i.productId === id || i.productId.startsWith(`${id}-`));
          if (item) {
            cart.updateQuantity(item.itemKey, 1);
          } else {
            cart.addItem({
              productId: id,
              productName: name,
              unitPrice: price,
              productImage: img,
              quantity: 1
            });
          }
          updateCard(card);
          updateHeaderCartCount();
        };
      }

      if (minusBtn) {
        minusBtn.onclick = (e) => {
          e.stopPropagation();
          const item = cart.items.find(i => i.productId === id || i.productId.startsWith(`${id}-`));
          if (!item) return;
          cart.updateQuantity(item.itemKey, -1);
          updateCard(card);
          updateHeaderCartCount();
        };
      }
    });
  }

  renderGrid();

  window.addEventListener("cart:updated", () => {
    grid.querySelectorAll(".haldiram-card").forEach(updateCard);
  });
}
