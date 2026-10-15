import { cart } from "./cart.js";

export function initCustomCakeStudio(showToast) {
  const container = document.getElementById("custom-cake-builder");
  if (!container) return;

  const state = {
    occasion: "Birthday",
    flavor: "tender-coconut",
    flavorName: "Malabar Tender Coconut",
    flavorPricePerKg: 1200,
    weight: 2.0,
    shape: "Tiered Round",
    tierType: "two-tier",
    tierExtra: 350,
    isEggless: true,
    egglessExtra: 100,
    hasPhotoPrint: false,
    photoExtra: 200,
    message: "Happy Birthday Dearest Ammu!",
    specialInstructions: "Less cream, extra tender coconut pulp filling",
    photoUrl: null
  };

  const flavors = [
    { id: "tender-coconut", name: "Malabar Tender Coconut", priceKg: 1200, color: "#f8fafc", desc: "Signature fresh coconut malai & infused water" },
    { id: "belgian-truffle", name: "Royal Belgian Truffle", priceKg: 1150, color: "#3b1e15", desc: "70% dark Belgian chocolate ganache" },
    { id: "red-velvet", name: "Red Velvet Cream Cheese", priceKg: 1100, color: "#881337", desc: "Velvety crimson sponge & rich cream cheese" },
    { id: "mango-bliss", name: "Alphonso Mango Bliss", priceKg: 1180, color: "#f59e0b", desc: "Pure Ratnagiri Alphonso mango compote" },
    { id: "butterscotch", name: "Butterscotch Praline", priceKg: 950, color: "#d97706", desc: "Crunchy almond cashew nougat & caramel" }
  ];

  const shapes = [
    { id: "round", name: "Classic Round", extra: 0, icon: "⭕" },
    { id: "heart", name: "Romantic Heart", extra: 150, icon: "💖" },
    { id: "two-tier", name: "Royal Two-Tier", extra: 350, icon: "🎂" },
    { id: "three-tier", name: "Grand Three-Tier", extra: 750, icon: "👑" }
  ];

  function calculatePrice() {
    let base = state.flavorPricePerKg * state.weight;
    let extra = 0;
    if (state.tierExtra) extra += state.tierExtra;
    if (state.isEggless) extra += state.egglessExtra;
    if (state.hasPhotoPrint) extra += state.photoExtra;
    return Math.round(base + extra);
  }

  function render() {
    const totalPrice = calculatePrice();

    container.innerHTML = `
      <div class="custom-studio-card">
        <div class="studio-header">
          <div class="studio-tag">
            <span class="pulse-dot"></span> Interactive Studio
          </div>
          <h3>Craft Your Signature Dream Cake</h3>
          <p>Peekay master bakers bring your dream celebration cake to life. Fully customizable with real-time preview & pricing.</p>
        </div>

        <div class="studio-grid">
          <!-- Left Controls -->
          <div class="studio-controls">
            <!-- 1. Occasion -->
            <div class="control-group">
              <label class="control-label">1. Choose Occasion</label>
              <div class="pill-group" id="studio-occasions">
                ${["Birthday", "Anniversary", "Wedding", "Baby Shower", "Corporate / Farewell", "Kids Theme"].map(occ => `
                  <button type="button" class="pill-btn ${state.occasion === occ ? 'active' : ''}" data-occ="${occ}">
                    ${occ}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 2. Flavor -->
            <div class="control-group">
              <label class="control-label">2. Select Gourmet Flavor</label>
              <div class="flavor-grid">
                ${flavors.map(f => `
                  <div class="flavor-card ${state.flavor === f.id ? 'active' : ''}" data-flavor="${f.id}" data-name="${f.name}" data-price="${f.priceKg}">
                    <div class="flavor-dot" style="background-color: ${f.color}"></div>
                    <div class="flavor-info">
                      <div class="flavor-title">${f.name}</div>
                      <div class="flavor-sub">₹${f.priceKg}/kg • ${f.desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 3. Shape & Tiers -->
            <div class="control-group">
              <label class="control-label">3. Shape & Tier Structure</label>
              <div class="shape-grid">
                ${shapes.map(s => `
                  <button type="button" class="shape-btn ${state.shape === s.name ? 'active' : ''}" data-shape="${s.name}" data-extra="${s.extra}">
                    <span class="shape-icon">${s.icon}</span>
                    <span class="shape-name">${s.name}</span>
                    <span class="shape-extra">${s.extra > 0 ? `+₹${s.extra}` : 'Included'}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 4. Weight & Dietary -->
            <div class="control-row">
              <div class="control-half">
                <label class="control-label">4. Cake Weight (Servings)</label>
                <div class="pill-group" id="studio-weights">
                  ${[1.5, 2.0, 3.0, 5.0].map(w => `
                    <button type="button" class="pill-btn ${state.weight === w ? 'active' : ''}" data-weight="${w}">
                      ${w} KG (${Math.round(w * 8)} Guests)
                    </button>
                  `).join('')}
                </div>
              </div>
              <div class="control-half">
                <label class="control-label">5. Dietary Preference</label>
                <div class="dietary-toggle-wrap">
                  <button type="button" class="diet-btn ${!state.isEggless ? 'active' : ''}" data-eggless="false">
                    <span class="dot-red"></span> Contains Egg
                  </button>
                  <button type="button" class="diet-btn ${state.isEggless ? 'active' : ''}" data-eggless="true">
                    <span class="dot-green"></span> 100% Eggless (+₹100)
                  </button>
                </div>
              </div>
            </div>

            <!-- 5. Message on Cake -->
            <div class="control-group">
              <label class="control-label">6. Message on Cake / Board</label>
              <input type="text" id="studio-message-input" class="studio-input" maxlength="45" value="${state.message}" placeholder="e.g. Happy 25th Anniversary Mom & Dad">
              <div class="input-hint">Max 45 characters. Hand-piped in white chocolate cursive.</div>
            </div>

            <!-- 6. Edible Photo Print -->
            <div class="photo-addon-wrap">
              <label class="checkbox-label">
                <input type="checkbox" id="studio-photo-checkbox" ${state.hasPhotoPrint ? 'checked' : ''}>
                <span>Add Sugar Sheet Edible Photo Print (+₹200)</span>
              </label>
              ${state.hasPhotoPrint ? `
                <div class="photo-upload-box">
                  <input type="file" id="studio-photo-upload" accept="image/*" class="file-input-hidden">
                  <label for="studio-photo-upload" class="photo-upload-label">
                    📷 ${state.photoUrl ? 'Photo Uploaded! Click to change' : 'Click to Upload High-Res Photo for Cake Print'}
                  </label>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Live Preview Card -->
          <div class="studio-preview-col">
            <div class="preview-card sticky-preview">
              <div class="preview-badge">Live Bakery Preview</div>
              <div class="preview-img-container">
                <img src="/images/custom_anniversary_cake.jpg" alt="Custom Cake Preview" class="preview-img">
                <div class="preview-overlay-text">
                  <span class="cake-piped-text">"${state.message || 'Happy Celebration'}"</span>
                </div>
              </div>

              <div class="preview-specs">
                <div class="spec-row">
                  <span class="spec-label">Occasion</span>
                  <span class="spec-val">${state.occasion}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Selected Flavor</span>
                  <span class="spec-val">${state.flavorName}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Weight & Shape</span>
                  <span class="spec-val">${state.weight} KG • ${state.shape}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Eggless Recipe</span>
                  <span class="spec-val">${state.isEggless ? 'Yes (100% Pure Veg 🟢)' : 'Regular Recipe (🔴)'}</span>
                </div>
                ${state.hasPhotoPrint ? `
                  <div class="spec-row">
                    <span class="spec-label">Edible Photo Print</span>
                    <span class="spec-val">Included (+₹200)</span>
                  </div>
                ` : ''}
              </div>

              <div class="preview-price-box">
                <div class="price-title">Estimated Price:</div>
                <div class="price-amount">₹${totalPrice.toLocaleString('en-IN')}</div>
                <div class="price-note">Includes luxury satin packaging & greeting card</div>
              </div>

              <button type="button" id="studio-add-cart-btn" class="btn btn-primary btn-block btn-pulse">
                🎂 Order Custom Masterpiece
              </button>

              <div class="trust-micro">
                <span>⚡ Baked Fresh for Your Event</span>
                <span>•</span>
                <span>📞 WhatsApp Baker Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Occasion clicks
    container.querySelectorAll("#studio-occasions .pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.occasion = btn.dataset.occ;
        render();
      });
    });

    // Flavor clicks
    container.querySelectorAll(".flavor-card").forEach(card => {
      card.addEventListener("click", () => {
        state.flavor = card.dataset.flavor;
        state.flavorName = card.dataset.name;
        state.flavorPricePerKg = parseFloat(card.dataset.price);
        render();
      });
    });

    // Shape clicks
    container.querySelectorAll(".shape-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.shape = btn.dataset.shape;
        state.tierExtra = parseFloat(btn.dataset.extra || 0);
        render();
      });
    });

    // Weight clicks
    container.querySelectorAll("#studio-weights .pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.weight = parseFloat(btn.dataset.weight);
        render();
      });
    });

    // Dietary clicks
    container.querySelectorAll(".diet-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.isEggless = btn.dataset.eggless === "true";
        render();
      });
    });

    // Message input
    const msgInput = container.querySelector("#studio-message-input");
    if (msgInput) {
      msgInput.addEventListener("input", (e) => {
        state.message = e.target.value;
        const pipedSpan = container.querySelector(".cake-piped-text");
        if (pipedSpan) {
          pipedSpan.textContent = `"${state.message || 'Happy Celebration'}"`;
        }
      });
    }

    // Photo print checkbox
    const photoCb = container.querySelector("#studio-photo-checkbox");
    if (photoCb) {
      photoCb.addEventListener("change", (e) => {
        state.hasPhotoPrint = e.target.checked;
        render();
      });
    }

    // Photo upload preview
    const photoUpload = container.querySelector("#studio-photo-upload");
    if (photoUpload) {
      photoUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            state.photoUrl = event.target.result;
            showToast("Photo uploaded for sugar sheet print!");
            render();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Add to Cart
    const addBtn = container.querySelector("#studio-add-cart-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const finalPrice = calculatePrice();
        cart.addItem({
          productId: "custom-designer-cake",
          productName: `Custom ${state.occasion} Masterpiece (${state.flavorName})`,
          productImage: "/images/custom_anniversary_cake.jpg",
          weight: `${state.weight} KG`,
          shape: state.shape,
          isEggless: state.isEggless,
          messageOnCake: state.message,
          unitPrice: finalPrice,
          quantity: 1,
          customDetails: {
            occasion: state.occasion,
            flavor: state.flavorName,
            hasPhotoPrint: state.hasPhotoPrint
          }
        });
        showToast("✨ Custom Cake added to cart! Our baker will craft it with love.");
        // Open cart drawer
        window.dispatchEvent(new CustomEvent("cart:open"));
      });
    }
  }

  render();
}
