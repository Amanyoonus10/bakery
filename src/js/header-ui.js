import { PRODUCTS } from "../data/products.js";
import { CITIES_SERVED, STORES } from "../data/stores.js";
import { cart } from "./cart.js";

export function initHeaderUI(showToast) {
  // Location Selector
  const locBtn = document.getElementById("header-location-btn");
  const locModal = document.getElementById("location-modal");
  const locCityText = document.getElementById("header-current-city");

  if (locBtn && locModal) {
    const locClose = locModal.querySelector(".modal-close-btn");
    const locBackdrop = locModal.querySelector(".modal-backdrop");
    const citiesGrid = locModal.querySelector("#cities-selection-grid");
    const pincodeInput = locModal.querySelector("#modal-pincode-input");
    const pincodeCheckBtn = locModal.querySelector("#modal-pincode-check-btn");
    const pincodeStatus = locModal.querySelector("#modal-pincode-status");

    function openLocModal() {
      locModal.classList.add("active");
      document.body.classList.add("modal-open");
    }

    function closeLocModal() {
      locModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }

    locBtn.onclick = openLocModal;
    if (locClose) locClose.onclick = closeLocModal;
    if (locBackdrop) locBackdrop.onclick = closeLocModal;

    // Render cities
    if (citiesGrid) {
      citiesGrid.innerHTML = CITIES_SERVED.map(c => `
        <button type="button" class="city-card-btn ${cart.deliveryCity.includes(c.name.split(' ')[0]) ? 'active' : ''}" data-city="${c.name}" data-pincode="${c.pincodes[0]}">
          <div class="city-name">${c.name}</div>
          <div class="city-sub">⚡ ${c.deliveryTime}</div>
        </button>
      `).join('');

      citiesGrid.querySelectorAll(".city-card-btn").forEach(btn => {
        btn.onclick = () => {
          citiesGrid.querySelectorAll(".city-card-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const city = btn.dataset.city;
          const pincode = btn.dataset.pincode;
          cart.setLocation(city, pincode);
          if (locCityText) locCityText.textContent = city.split(' ')[0];
          showToast(`📍 Delivery location set to ${city}`);
          closeLocModal();
        };
      });
    }

    // Pincode checker
    if (pincodeCheckBtn && pincodeInput && pincodeStatus) {
      pincodeCheckBtn.onclick = () => {
        const pin = pincodeInput.value.trim();
        if (pin.length !== 6 || isNaN(pin)) {
          pincodeStatus.innerHTML = `<span style="color:#ef4444">Please enter a valid 6-digit Kerala pincode.</span>`;
          return;
        }

        const foundCity = CITIES_SERVED.find(c => c.pincodes.includes(pin) || pin.startsWith(c.pincodes[0].substring(0, 3)));
        if (foundCity) {
          cart.setLocation(foundCity.name, pin);
          if (locCityText) locCityText.textContent = foundCity.name.split(' ')[0];
          pincodeStatus.innerHTML = `<span style="color:#10b981">✓ Available! Same-Day Express Delivery to ${pin} (${foundCity.name}).</span>`;
          showToast(`📍 Pincode ${pin} is serviceable for 2-hour delivery!`);
          setTimeout(closeLocModal, 900);
        } else {
          pincodeStatus.innerHTML = `<span style="color:#10b981">✓ Standard refrigerated delivery available to pincode ${pin} (Kerala).</span>`;
          cart.setLocation("Kerala Delivery", pin);
          setTimeout(closeLocModal, 900);
        }
      };
    }
  }

  // Live Omnisearch
  const searchInput = document.getElementById("search-input");
  const searchSuggestions = document.getElementById("search-suggestions-box");
  const clearSearchBtn = document.getElementById("search-clear-btn");

  if (searchInput && searchSuggestions) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = q ? "block" : "none";
      }

      if (q.length < 2) {
        searchSuggestions.style.display = "none";
        window.dispatchEvent(new CustomEvent("search:filter", { detail: "" }));
        return;
      }

      // Filter products
      const matches = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.malayalamName && p.malayalamName.includes(q)) ||
        p.category.toLowerCase().includes(q.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.includes(q.toLowerCase())))
      ).slice(0, 5);

      if (matches.length > 0) {
        searchSuggestions.innerHTML = `
          <div class="search-suggestions-header">Matching Fresh Bakes (${matches.length})</div>
          ${matches.map(m => `
            <div class="suggestion-item" data-id="${m.id}">
              <img src="${m.image}" alt="${m.name}" class="sug-img">
              <div class="sug-info">
                <div class="sug-name">${m.name} ${m.malayalamName ? `<span class="sug-ml">(${m.malayalamName})</span>` : ''}</div>
                <div class="sug-price">From ₹${m.variants[0].price} • <span class="sug-badge">${m.badge || 'Fresh'}</span></div>
              </div>
            </div>
          `).join('')}
        `;
        searchSuggestions.style.display = "block";

        searchSuggestions.querySelectorAll(".suggestion-item").forEach(item => {
          item.onclick = () => {
            const id = item.dataset.id;
            searchSuggestions.style.display = "none";
            const productCard = document.querySelector(`.product-card[data-id="${id}"]`);
            if (productCard) {
              productCard.scrollIntoView({ behavior: "smooth", block: "center" });
              productCard.classList.add("highlight-pulse");
              setTimeout(() => productCard.classList.remove("highlight-pulse"), 2000);
            }
          };
        });
      } else {
        searchSuggestions.innerHTML = `
          <div class="suggestion-empty">No bakes found matching "${q}". Press enter to search all categories.</div>
        `;
        searchSuggestions.style.display = "block";
      }

      window.dispatchEvent(new CustomEvent("search:filter", { detail: q }));
    });

    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        searchSuggestions.style.display = "none";
        window.dispatchEvent(new CustomEvent("search:filter", { detail: "" }));
      };
    }

    // Close suggestions on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-bar-wrap")) {
        searchSuggestions.style.display = "none";
      }
    });
  }

  // Store Locator Modal
  const storeLocatorBtn = document.getElementById("nav-store-locator-btn");
  const storeModal = document.getElementById("store-locator-modal");
  if (storeLocatorBtn && storeModal) {
    const storeClose = storeModal.querySelector(".modal-close-btn");
    const storeBackdrop = storeModal.querySelector(".modal-backdrop");
    const storeList = storeModal.querySelector("#stores-list-container");

    if (storeList) {
      storeList.innerHTML = STORES.map(s => `
        <div class="store-card ${s.isFlagship ? 'flagship' : ''}">
          <div class="store-top">
            <h4 class="store-title">${s.name}</h4>
            ${s.isFlagship ? `<span class="flagship-badge">⭐ Flagship Kitchen</span>` : ''}
          </div>
          <p class="store-address">📍 ${s.address}</p>
          <div class="store-timing">⏰ Daily: ${s.timing}</div>
          <div class="store-tags">
            ${s.features.map(f => `<span class="st-tag">✓ ${f}</span>`).join('')}
          </div>
          <div class="store-actions">
            <a href="tel:${s.phone.replace(/\s+/g, '')}" class="btn btn-outline btn-sm">📞 Call ${s.phone}</a>
            <a href="https://maps.google.com/?q=${encodeURIComponent(s.name + ' ' + s.address)}" target="_blank" class="btn btn-primary btn-sm">🗺 Get Directions</a>
          </div>
        </div>
      `).join('');
    }

    storeLocatorBtn.onclick = () => {
      storeModal.classList.add("active");
      document.body.classList.add("modal-open");
    };

    if (storeClose) storeClose.onclick = () => {
      storeModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    };
    if (storeBackdrop) storeBackdrop.onclick = () => {
      storeModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    };
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-toggle-btn");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");
  const mobileDrawerClose = document.getElementById("mobile-nav-close");
  const mobileBackdrop = document.getElementById("mobile-nav-backdrop");

  if (mobileMenuBtn && mobileDrawer) {
    function openMobileNav() {
      mobileDrawer.classList.add("active");
      if (mobileBackdrop) mobileBackdrop.classList.add("active");
      document.body.classList.add("mobile-nav-open");
    }

    function closeMobileNav() {
      mobileDrawer.classList.remove("active");
      if (mobileBackdrop) mobileBackdrop.classList.remove("active");
      document.body.classList.remove("mobile-nav-open");
    }

    mobileMenuBtn.onclick = openMobileNav;
    if (mobileDrawerClose) mobileDrawerClose.onclick = closeMobileNav;
    if (mobileBackdrop) mobileBackdrop.onclick = closeMobileNav;

    mobileDrawer.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.onclick = closeMobileNav;
    });
  }

  // Floating Hero Quick Delivery checker
  const heroDateSelect = document.getElementById("hero-delivery-date");
  const heroSlotSelect = document.getElementById("hero-delivery-slot");
  const heroCheckBtn = document.getElementById("hero-delivery-check-btn");
  if (heroCheckBtn) {
    heroCheckBtn.onclick = () => {
      const dateVal = heroDateSelect ? heroDateSelect.value : "Today";
      const slotVal = heroSlotSelect ? heroSlotSelect.value : "2-Hour Express";
      cart.setDeliverySlot(dateVal, slotVal);
      showToast(`⚡ Delivery slot set: ${dateVal} • ${slotVal}!`);
      const prodSec = document.getElementById("products-section");
      if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
    };
  }
}
