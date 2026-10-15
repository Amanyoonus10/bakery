import { cart } from "./cart.js";
import confetti from "canvas-confetti";

export function initCheckoutModal(showToast) {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;

  const modalContent = modal.querySelector(".checkout-modal-content");
  const closeBtn = modal.querySelector(".checkout-modal-close");
  const backdrop = modal.querySelector(".checkout-modal-backdrop");

  function openCheckout() {
    const summary = cart.getSummary();
    if (summary.items.length === 0) {
      showToast("Your cart is empty! Add delicious snacks and bakery items first.");
      return;
    }
    renderCheckoutSteps();
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeCheckout() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  window.addEventListener("checkout:open", openCheckout);
  if (closeBtn) closeBtn.onclick = closeCheckout;
  if (backdrop) backdrop.onclick = closeCheckout;

  function renderCheckoutSteps() {
    const summary = cart.getSummary();

    modalContent.innerHTML = `
      <div class="checkout-layout">
        <!-- Left: Form -->
        <div class="checkout-form-col">
          <div class="checkout-brand-header">
            <img src="/images/keerthi_logo_clean_hq.png" alt="Keerthi Bakery - Pee Kay Group" class="checkout-logo">
            <div class="checkout-badge">Express Checkout</div>
          </div>

          <form id="checkout-form" class="checkout-form-body">
            <!-- 1. Contact -->
            <div class="checkout-section">
              <h3 class="section-title"><span class="step-num">1</span> Contact Information</h3>
              <div class="form-row">
                <div class="form-group half">
                  <label>Full Name *</label>
                  <input type="text" id="cust-name" required class="input-field" placeholder="e.g. Rahul Nambiar" value="Aman Yoonus">
                </div>
                <div class="form-group half">
                  <label>Mobile Number (For WhatsApp Updates) *</label>
                  <input type="tel" id="cust-phone" required class="input-field" placeholder="e.g. 98470 12345" value="98471 23456">
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="cust-email" class="input-field" placeholder="name@example.com" value="aman@example.com">
              </div>
            </div>

            <!-- 2. Delivery Address -->
            <div class="checkout-section">
              <h3 class="section-title"><span class="step-num">2</span> Delivery Address</h3>
              <div class="form-group">
                <label>Delivery Address / House / Flat / Street *</label>
                <textarea id="cust-address" required class="input-field textarea" rows="2" placeholder="House/Flat name, Street, Landmark...">Pinnacle Enclave, Mavoor Road, Near Star Hospital</textarea>
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label>City / Region *</label>
                  <select id="cust-city" class="input-field select">
                    <option value="Calicut (Kozhikode)" ${summary.deliveryCity.includes("Calicut") ? 'selected' : ''}>Calicut (Kozhikode)</option>
                    <option value="Kannur" ${summary.deliveryCity.includes("Kannur") ? 'selected' : ''}>Kannur</option>
                    <option value="Thalassery" ${summary.deliveryCity.includes("Thalassery") ? 'selected' : ''}>Thalassery</option>
                    <option value="Vadakara">Vadakara</option>
                    <option value="Malappuram">Malappuram</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Pan-India (Other Cities)">Pan-India (Other Cities)</option>
                  </select>
                </div>
                <div class="form-group half">
                  <label>Pincode *</label>
                  <input type="text" id="cust-pincode" required class="input-field" value="${summary.deliveryPincode}" maxlength="6">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label>Delivery Speed</label>
                  <input type="text" readonly class="input-field readonly" value="${summary.deliverySlot.time || 'Kerala Express (24-48 Hours)'}">
                </div>
                <div class="form-group half">
                  <label>Packaging</label>
                  <input type="text" readonly class="input-field readonly" value="Aroma-Lock Fresh Pouch (FREE)">
                </div>
              </div>
            </div>

            <!-- 3. Payment Method -->
            <div class="checkout-section">
              <h3 class="section-title"><span class="step-num">3</span> Select Payment Method</h3>
              <div class="payment-options-grid">
                <label class="payment-option selected">
                  <input type="radio" name="payment_method" value="upi" checked>
                  <div class="payment-meta">
                    <div class="payment-name">⚡ Instant UPI / QR / Google Pay / PhonePe</div>
                    <div class="payment-desc">Zero transaction fee • Instant confirmation</div>
                  </div>
                  <span class="pay-tag">Fastest</span>
                </label>

                <label class="payment-option">
                  <input type="radio" name="payment_method" value="card">
                  <div class="payment-meta">
                    <div class="payment-name">💳 Credit / Debit Card / Netbanking</div>
                    <div class="payment-desc">Visa, Mastercard, RuPay, Netbanking</div>
                  </div>
                </label>

                <label class="payment-option">
                  <input type="radio" name="payment_method" value="cod">
                  <div class="payment-meta">
                    <div class="payment-name">💵 Cash on Delivery (COD)</div>
                    <div class="payment-desc">Pay upon receiving fresh snacks at your doorstep</div>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" id="place-order-btn" class="btn btn-primary btn-block btn-pay">
              <span class="btn-spinner" style="display:none;"></span>
              <span class="btn-text">🔒 Place Order • ₹${summary.grandTotal.toLocaleString('en-IN')}</span>
            </button>
          </form>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="checkout-summary-col">
          <h4 class="summary-heading">Order Summary (${summary.count} item${summary.count === 1 ? '' : 's'})</h4>

          <div class="checkout-summary-items">
            ${summary.items.map(item => `
              <div class="summary-mini-item">
                <div class="mini-thumb-wrap">
                  <img src="${item.image || '/images/keerthi_pouch_cutout.png'}" alt="${item.name}" class="mini-thumb" onerror="this.src='/images/keerthi_pouch_cutout.png'">
                  <span class="mini-qty">${item.quantity}</span>
                </div>
                <div class="mini-info">
                  <div class="mini-title">${item.name}</div>
                  <div class="mini-sub">${item.weight || '500g Pack'} • Pure Coconut Oil 🥥</div>
                </div>
                <div class="mini-price">₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            `).join('')}
          </div>

          <div class="checkout-bill-card">
            <div class="bill-row">
              <span>Subtotal</span>
              <span>₹${summary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            ${summary.discount > 0 ? `
              <div class="bill-row bill-discount">
                <span>Discount (${summary.appliedCoupon?.code})</span>
                <span>-₹${summary.discount.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="bill-row">
              <span>Delivery Fee</span>
              <span>${summary.deliveryFee === 0 ? '<strong style="color:#0f3822">FREE</strong>' : `₹${summary.deliveryFee}`}</span>
            </div>
            <div class="bill-row">
              <span>Aroma-Lock Freshness Packaging</span>
              <span style="color:#0f3822; font-weight:700;">FREE</span>
            </div>
            <div class="bill-row bill-grand-total">
              <span>Total Payable</span>
              <span class="grand-amount">₹${summary.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="bakery-assurance-card">
            <div class="assurance-title">🥥 Keerthi Real Taste, Real Quality Promise</div>
            <p>Every snack pack is prepared in 100% pure cold-pressed coconut oil and sealed immediately for maximum crunch and natural aroma by Pee Kay master bakers.</p>
          </div>
        </div>
      </div>
    `;

    bindCheckoutEvents();
  }

  function bindCheckoutEvents() {
    // Payment method radio selection styling
    modalContent.querySelectorAll(".payment-option").forEach(opt => {
      opt.addEventListener("click", () => {
        modalContent.querySelectorAll(".payment-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });

    const form = modalContent.querySelector("#checkout-form");
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      const placeBtn = modalContent.querySelector("#place-order-btn");
      const btnText = placeBtn.querySelector(".btn-text");
      const btnSpinner = placeBtn.querySelector(".btn-spinner");

      // Animate payment processing
      placeBtn.disabled = true;
      btnSpinner.style.display = "inline-block";
      btnText.textContent = "Connecting to Secure Gateway...";

      setTimeout(() => {
        btnText.textContent = "Confirming Fresh Snack Order...";
      }, 900);

      setTimeout(() => {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#0f3822', '#e2b87f', '#10b981', '#165333']
          });
        } catch (err) {}

        const orderId = `KB-${Math.floor(100000 + Math.random() * 900000)}`;
        const customerName = form.querySelector("#cust-name").value || "Valued Customer";
        const phone = form.querySelector("#cust-phone").value || "98471 23456";
        const city = form.querySelector("#cust-city").value;
        const total = cart.getGrandTotal();
        const items = [...cart.items];

        // Clear cart
        cart.clear();

        // Render success screen
        renderOrderSuccess(orderId, customerName, phone, city, total, items);
      }, 1800);
    };
  }

  function renderOrderSuccess(orderId, customerName, phone, city, total, items) {
    modalContent.innerHTML = `
      <div class="order-success-card">
        <div class="success-icon-wrap">
          <span class="success-checkmark">✓</span>
        </div>
        <div class="success-tag">Order Confirmed • Keerthi Bakery Kadavathur</div>
        <h2>Thank You, ${customerName}!</h2>
        <p class="success-subtitle">Your fresh snacks order has been placed successfully and assigned for immediate packing at our Kadavathur facility for delivery to <strong>${city}</strong>.</p>

        <div class="order-id-pill">
          <span>Order Reference:</span>
          <strong>${orderId}</strong>
        </div>

        <div class="order-timeline">
          <div class="timeline-step done">
            <span class="timeline-dot">✓</span>
            <span class="timeline-text">Order Received</span>
          </div>
          <div class="timeline-step active">
            <span class="timeline-dot">🔥</span>
            <span class="timeline-text">Aroma-Seal Packing</span>
          </div>
          <div class="timeline-step">
            <span class="timeline-dot">🚚</span>
            <span class="timeline-text">Express Dispatch</span>
          </div>
          <div class="timeline-step">
            <span class="timeline-dot">🎉</span>
            <span class="timeline-text">Delivered Fresh</span>
          </div>
        </div>

        <div class="success-items-box">
          <h4>Items in Order:</h4>
          <ul>
            ${items.map(i => `<li>${i.name} (${i.weight || 'Std'}) x ${i.quantity}</li>`).join('')}
          </ul>
        </div>

        <div class="success-actions">
          <a href="https://wa.me/919447123450?text=Hi%20Keerthi%20Bakery,%20I%20just%20placed%20order%20${orderId}%20for%20₹${total}!" 
             target="_blank" class="btn btn-whatsapp">
            💬 Track Order on WhatsApp
          </a>
          <button type="button" class="btn btn-outline" id="success-done-btn">
            Continue Shopping
          </button>
        </div>

        <div class="success-contact-note">
          Need immediate support? Call Keerthi Bakery Helpdesk: <strong>+91 94471 23450</strong> (8 AM - 10:30 PM)
        </div>
      </div>
    `;

    const doneBtn = modalContent.querySelector("#success-done-btn");
    if (doneBtn) {
      doneBtn.onclick = () => {
        closeCheckout();
      };
    }
  }
}
