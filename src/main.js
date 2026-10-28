import { PRODUCTS, ADDONS } from "./data/products.js";
import { OUTLETS, LEADERSHIP, MAIN_ADMIN_PHONE } from "./data/stores.js";
import { cart } from "./js/cart.js";
import { initCartDrawerUI } from "./js/cart-drawer-ui.js";
import { initCheckoutModal } from "./js/checkout-modal.js";
import { initWishlistUI } from "./js/wishlist-ui.js";
import { initAccountUI } from "./js/account-ui.js";
import { initAllProductsView } from "./js/all-products-view.js";
import { playTickSound } from "./js/tick-sound.js";
import confetti from "canvas-confetti";

// Toast Notification Helper
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

document.addEventListener("DOMContentLoaded", () => {
  // 0. Brand Logo Language Switcher (English <-> Malayalam)
  const langBtn = document.getElementById("langSwitchBtn");
  const mainLogo = document.getElementById("mainStoreLogo");
  const langLabel = document.getElementById("langSwitchLabel");
  let currentLang = "en";

  try {
    const saved = localStorage.getItem("keerthi_brand_lang");
    if (saved === "ml") currentLang = "ml";
  } catch (e) {}

  function updateLogoState(lang) {
    currentLang = lang;
    const isEn = lang === "en";
    const src = isEn ? "/images/keerthi_logo_clean_hq.png" : "/images/keerthi_logo_ml.png";
    if (langLabel) {
      langLabel.textContent = isEn ? "EN • മലയാളം" : "മലയാളം • EN";
    }
    if (mainLogo) {
      mainLogo.src = src;
    }
    try {
      localStorage.setItem("keerthi_brand_lang", lang);
    } catch (e) {}
  }

  if (currentLang === "ml") {
    updateLogoState("ml");
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const next = currentLang === "en" ? "ml" : "en";
      const logos = [mainLogo, preloaderLogo].filter(Boolean);
      logos.forEach((img) => {
        img.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        img.style.opacity = "0";
        img.style.transform = "scale(0.95)";
      });
      setTimeout(() => {
        updateLogoState(next);
        logos.forEach((img) => {
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        });
      }, 180);
    });
  }

  // 1. Initialize Cart Drawer and Checkout
  initCartDrawerUI(showToast);
  initCheckoutModal(showToast);

  // 2. Product Cards: Steppers and Add to Cart
  document.querySelectorAll(".store-prod-card").forEach((card) => {
    const minusBtn = card.querySelector(".stepper-minus");
    const plusBtn = card.querySelector(".stepper-plus");
    const valEl = card.querySelector(".stepper-val");
    let qty = 1;

    if (minusBtn && plusBtn && valEl) {
      minusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (qty > 1) {
          qty--;
          valEl.textContent = qty;
        }
      });
      plusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        qty++;
        valEl.textContent = qty;
      });
    }

    const addBtn = card.querySelector(".btn-card-add-cart");
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = card.dataset.id || "keerthi-item";
        const name = card.dataset.name || "Keerthi Snack";
        const price = parseInt(card.dataset.price) || 89;
        const img = card.dataset.img || "/images/card_banana_chips_clean.jpg";

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
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#0f3822', '#e2b87f', '#d32f2f', '#10b981']
          });
        } catch (err) {}

        showToast(`Added ${qty}x ${name} to your cart! 🛍️`);
        window.dispatchEvent(new CustomEvent("cart:open"));
      });
    }
  });

  // 3. Initialize Interactive Wishlist UI & Sync
  initWishlistUI(showToast);

  // 4. Interactive Omnisearch Modal (Search Bar Optimized to Button)
  initSearchModal(showToast);

  function filterSnacksOnPage(query) {
    document.querySelectorAll(".store-prod-card, .catalogue-prod-card, .cards li").forEach((card) => {
      const name = (card.dataset.name || card.querySelector(".catalogue-prod-title, .store-prod-title, h3")?.textContent || "").toLowerCase();
      if (!query || name.includes(query)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  function initSearchModal(showToast) {
    const headerSearchBtn = document.getElementById("headerSearchBtn");
    const searchModal = document.getElementById("searchModal");
    const searchModalBackdrop = document.getElementById("searchModalBackdrop");
    const closeSearchModalBtn = document.getElementById("closeSearchModalBtn");
    const modalSearchInput = document.getElementById("modalSearchInput");
    const clearModalSearchBtn = document.getElementById("clearModalSearchBtn");
    const searchModalChips = document.getElementById("searchModalChips");
    const modalSearchResults = document.getElementById("modalSearchResults");
    const btnModalViewAll = document.getElementById("btnModalViewAll");

    if (!searchModal) return;

    let activeCategory = "all";

    function openSearchModal() {
      searchModal.classList.add("active");
      document.body.classList.add("modal-open");
      renderResults();
      setTimeout(() => {
        if (modalSearchInput) modalSearchInput.focus();
      }, 80);
    }

    function closeSearchModal() {
      searchModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }

    if (headerSearchBtn) {
      headerSearchBtn.addEventListener("click", openSearchModal);
    }

    if (closeSearchModalBtn) {
      closeSearchModalBtn.addEventListener("click", closeSearchModal);
    }

    if (searchModalBackdrop) {
      searchModalBackdrop.addEventListener("click", closeSearchModal);
    }

    if (clearModalSearchBtn) {
      clearModalSearchBtn.addEventListener("click", () => {
        if (modalSearchInput) {
          modalSearchInput.value = "";
          clearModalSearchBtn.style.display = "none";
          filterSnacksOnPage("");
          renderResults();
          modalSearchInput.focus();
        }
      });
    }

    // Keyboard shortcuts: Cmd+K / Ctrl+K or / to open, ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchModal.classList.contains("active")) {
        closeSearchModal();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchModal.classList.contains("active")) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      }
    });

    if (modalSearchInput) {
      modalSearchInput.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (clearModalSearchBtn) {
          clearModalSearchBtn.style.display = q ? "block" : "none";
        }
        filterSnacksOnPage(q);
        renderResults();
      });
    }

    if (searchModalChips) {
      searchModalChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".modal-chip");
        if (!chip) return;
        searchModalChips.querySelectorAll(".modal-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeCategory = chip.dataset.category || "all";
        renderResults();
      });
    }

    if (btnModalViewAll) {
      btnModalViewAll.addEventListener("click", () => {
        closeSearchModal();
        const target = document.getElementById("products") || document.getElementById("shop-all");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }

    function renderResults() {
      if (!modalSearchResults) return;
      const query = (modalSearchInput?.value || "").toLowerCase().trim();

      let filtered = PRODUCTS;
      if (activeCategory !== "all") {
        filtered = filtered.filter((p) => p.category === activeCategory);
      }

      if (query) {
        filtered = filtered.filter((p) => {
          const name = (p.name || "").toLowerCase();
          const mlName = (p.malayalamName || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          const tags = (p.tags || []).join(" ").toLowerCase();
          return name.includes(query) || mlName.includes(query) || desc.includes(query) || cat.includes(query) || tags.includes(query);
        });
      }

      if (filtered.length === 0) {
        modalSearchResults.innerHTML = `
          <div class="modal-search-empty">
            <i class="ri-search-eye-line"></i>
            <h4>No snacks matching "${query}"</h4>
            <p>Try searching for "banana chips", "pakoda", "murukku", or "rusk".</p>
          </div>
        `;
        return;
      }

      const displayList = filtered.slice(0, 24);
      const headerTitle = query
        ? `Found ${filtered.length} Authentic Snack${filtered.length > 1 ? "s" : ""}`
        : activeCategory !== "all"
        ? `${activeCategory.toUpperCase()} (${filtered.length})`
        : `🔥 Malabar Bakery Favourites (${filtered.length} Available)`;

      modalSearchResults.innerHTML = `
        <div class="search-section-header">
          <span>${headerTitle}</span>
          ${filtered.length > 24 ? `<span style="font-size:0.7rem; color:#8c7e73;">Showing first 24</span>` : ""}
        </div>
        ${displayList
          .map(
            (p) => `
          <div class="modal-result-item" data-id="${p.id}" role="button" tabindex="0">
            <img src="${p.imageCutout || p.image}" alt="${p.name}" class="modal-result-thumb" loading="lazy">
            <div class="modal-result-info">
              <div class="modal-result-name">${p.name}</div>
              <div class="modal-result-sub">${p.tagline || p.malayalamName || p.unit || "Authentic Kerala snack"}</div>
              <div class="modal-result-meta">
                <span class="modal-result-price">₹${p.price}</span>
                ${p.badge ? `<span class="modal-result-badge">${p.badge}</span>` : ""}
              </div>
            </div>
            <button type="button" class="modal-result-add-btn" data-add-id="${p.id}" aria-label="Add ${p.name} to cart">
              <i class="ri-shopping-cart-2-line"></i>
              <span>Add</span>
            </button>
          </div>
        `
          )
          .join("")}
      `;

      // Direct Add to Cart buttons
      modalSearchResults.querySelectorAll(".modal-result-add-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.dataset.addId;
          const prod = PRODUCTS.find((x) => x.id === id);
          if (prod) {
            cart.addItem({
              id: prod.id,
              name: prod.name,
              price: prod.price,
              image: prod.image,
              unit: prod.unit || "Pack"
            });
            playTickSound();
            showToast(`Added ${prod.name} to cart! 🛍️`);
            window.dispatchEvent(new CustomEvent("cart:open"));
            closeSearchModal();
          }
        });
      });

      // Click card to scroll to item
      modalSearchResults.querySelectorAll(".modal-result-item").forEach((item) => {
        item.addEventListener("click", () => {
          const id = item.dataset.id;
          closeSearchModal();
          const card = document.querySelector(`.product-carousel-item[data-id="${id}"], .catalogue-prod-card[data-id="${id}"]`);
          if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.classList.add("highlight-pulse");
            setTimeout(() => card.classList.remove("highlight-pulse"), 2000);
          } else {
            const target = document.getElementById("products") || document.getElementById("shop-all");
            if (target) target.scrollIntoView({ behavior: "smooth" });
          }
        });
      });
    }
  }

  // 5. Category Promo Card Filters
  document.querySelectorAll(".btn-category-tan").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = document.getElementById("shop-all");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // 6. Initialize User Account Drawer & Dashboard
  initAccountUI(showToast);

  // 7. Newsletter Subscription Form
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.8 },
          colors: ['#e2b87f', '#0f3822', '#ffffff']
        });
      } catch (err) {}
      showToast("🎉 Thank you for subscribing! Your 10% OFF code: KERALA10");
      newsletterForm.reset();
    });
  }

  // 8. Empty Cart "Shop All Snacks" Button
  const cartStartShopping = document.getElementById("cart-start-shopping");
  if (cartStartShopping) {
    cartStartShopping.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("cart:close"));
      const target = document.getElementById("shop-all");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  // 9. Initialize 55 Products Haldiram-Style Grid Catalogue
  initAllProductsView(showToast);

  // 10. Initialize GSAP 3-Panel Overlay Navigation (Apsara Bakes Menubar Style)
  initNavOverlay();

  // 11. Attract Pills Active State On Scroll & Click
  document.querySelectorAll(".attract-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".attract-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });
});

// ==========================================================================
// GSAP 3-PANEL INTERRUPTIBLE NAV OVERLAY (APSARA BAKES STYLE)
// ==========================================================================
function initNavOverlay() {
  if (!window.gsap) return;

  let isOpen = false;
  const exitSpeed = 1.5;
  let navTl;
  let enterEndTime = 0;

  function buildNavTimeline() {
    navTl && navTl.revert();

    gsap.set("#nav", { visibility: "hidden" });
    gsap.set(".nav-bg", { opacity: 0 });
    gsap.set(".nav-login", { opacity: 0, y: 8 });

    navTl = gsap.timeline({ paused: true })
      .set("#nav", { visibility: "visible", pointerEvents: "auto" })
      
      // ═══ ENTER ═══
      .to(".nav-bg", {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        easeReverse: "power4.out"
      }, 0)
      .fromTo(".nav-panel",
        { x: "110%", y: 0, rotation: 0 },
        {
          x: "0%",
          y: 0,
          duration: 0.6,
          ease: "back.out(1.1)",
          easeReverse: "power3.in",
          stagger: 0.08,
        },
        0
      )
      .fromTo(".nav-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "expo.out",
          easeReverse: "power3.in",
          stagger: 0.03
        },
        0.1
      )
      .fromTo(".bar-top",
        { stroke: "#0f3822", attr: { x1: 3, y1: 6, x2: 17, y2: 6 } },
        {
          stroke: "#ffffff",
          attr: { x1: 4, y1: 4, x2: 16, y2: 16 },
          duration: 0.35,
          ease: "back.out(1.4)",
          easeReverse: "power3.out"
        },
        0.06
      )
      .fromTo(".bar-bot",
        { stroke: "#0f3822", attr: { x1: 3, y1: 14, x2: 17, y2: 14 } },
        {
          stroke: "#ffffff",
          attr: { x1: 4, y1: 16, x2: 16, y2: 4 },
          duration: 0.35,
          ease: "back.out(1.4)",
          easeReverse: "power3.out"
        },
        0.06
      )
      .to(".bar-mid", {
        opacity: 0,
        duration: 0.2
      }, 0.06)
      .to(".nav-login", {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power3.out",
        easeReverse: "power4.out"
      }, 0.35)

      // ═══ PAUSE ═══
      .addPause();

    enterEndTime = navTl.duration();

    // ═══ EXIT ═══
    navTl
      .to(".bar-top", {
        attr: { x1: 3, y1: 6, x2: 17, y2: 6 },
        stroke: "#0f3822",
        duration: 0.2,
        ease: "power3.in"
      })
      .to(".bar-bot", {
        attr: { x1: 3, y1: 14, x2: 17, y2: 14 },
        stroke: "#0f3822",
        duration: 0.2,
        ease: "power3.in"
      }, "<")
      .to(".bar-mid", {
        opacity: 1,
        duration: 0.2
      }, "<")
      .to(".nav-panel", {
        y: "110vh",
        rotation: "random(-15, 15)",
        duration: 0.8,
        ease: "power3.in",
        stagger: {
          from: "end",
          each: 0.02
        }
      }, "<")
      .to(".nav-bg", {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "<0.1")
      .set("#nav", { visibility: "hidden", pointerEvents: "none" });
  }

  buildNavTimeline();

  function toggleNav() {
    isOpen = !isOpen;
    const btn = document.getElementById("menuToggle");
    const header = document.getElementById("header");
    
    if (btn) {
      btn.setAttribute("aria-expanded", isOpen);
      btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    }

    if (isOpen) {
      if (header) header.classList.add("menu-open");
      if (navTl.time() >= enterEndTime) {
        navTl.timeScale(1).restart();
      } else {
        navTl.timeScale(1).play();
      }
    } else {
      if (header) header.classList.remove("menu-open");
      if (navTl.time() < enterEndTime) {
        navTl.timeScale(exitSpeed).reverse();
      } else {
        navTl.timeScale(1).play();
      }
    }
  }

  window.toggleNav = toggleNav;

  const mainToggleBtn = document.getElementById("menuToggle");
  if (mainToggleBtn) {
    mainToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleNav();
    });
  }

  const navBgEl = document.querySelector(".nav-bg");
  if (navBgEl) {
    navBgEl.addEventListener("click", () => {
      if (isOpen) toggleNav();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      toggleNav();
      mainToggleBtn && mainToggleBtn.focus();
    }
  });

  document.querySelectorAll("#navTop .nav-list > li > a.nav-link, .nav-login a, .nav-middle-actions a, .nav-socials a").forEach(link => {
    link.addEventListener("click", () => {
      if (isOpen) toggleNav();
    });
  });
}
