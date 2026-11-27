import { cart } from "./cart.js";
import { redirectToShopifyCheckout } from "./shopify.js";
import confetti from "canvas-confetti";

export const RAZORPAY_KEY_ID = "rzp_test_U3A1Gr1x7zBzm8";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

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
                  <input type="text" id="cust-name" required class="input-field" placeholder="e.g. Rahul Nambiar" value="">
                </div>
                <div class="form-group half">
                  <label>Mobile Number (For WhatsApp Updates) *</label>
                  <input type="tel" id="cust-phone" required class="input-field" placeholder="e.g. 98470 12345" value="">
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="cust-email" class="input-field" placeholder="name@example.com" value="">
              </div>
            </div>

            <!-- 2. Delivery Address -->
            <div class="checkout-section">
              <h3 class="section-title"><span class="step-num">2</span> Delivery Address</h3>
              <div class="form-group">
                <label>Delivery Address / House / Flat / Street *</label>
                <textarea id="cust-address" required class="input-field textarea" rows="2" placeholder="House/Flat name, Street, Landmark..."></textarea>
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
              <div class="checkout-perks-strip" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                <span style="background: #fbf8f2; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #6b1d28; border: 1px solid rgba(141, 25, 29, 0.15);">
                  📮 ${summary.deliverySlot.time || 'India Post Speed Post (24-48 Hours)'}
                </span>
                <span style="background: #fbf8f2; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #166534; border: 1px solid rgba(22, 101, 52, 0.2);">
                  🥥 Aroma-Lock Fresh Pouch (FREE)
                </span>
              </div>
            </div>

            <!-- 3. Payment Method -->
            <div class="checkout-section">
              <h3 class="section-title"><span class="step-num">3</span> Select Payment Method</h3>
              <div class="payment-options-grid">
                <label class="payment-option selected">
                  <input type="radio" name="payment_method" value="cod" checked>
                  <div class="payment-meta">
                    <div class="payment-name">💵 Cash on Delivery (COD)</div>
                    <div class="payment-desc">Pay upon receiving fresh snacks at your doorstep</div>
                  </div>
                  <span class="pay-tag" style="background:#e8f5ed; color:#166534; font-weight:800;">Recommended</span>
                </label>

                <label class="payment-option">
                  <input type="radio" name="payment_method" value="upi">
                  <div class="payment-meta">
                    <div class="payment-name">⚡ Instant UPI / QR / Google Pay / PhonePe</div>
                    <div class="payment-desc">Zero transaction fee • Instant confirmation</div>
                  </div>
                </label>

                <label class="payment-option">
                  <input type="radio" name="payment_method" value="card">
                  <div class="payment-meta">
                    <div class="payment-name">💳 Credit / Debit Card / Netbanking</div>
                    <div class="payment-desc">Visa, Mastercard, RuPay, Netbanking</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- 4. Bill Details Section -->
            <div class="checkout-section checkout-bill-details-section">
              <h3 class="section-title"><span class="step-num">4</span> Bill Details</h3>
              <div class="checkout-form-bill-card" style="background: #fbf8f2; border: 1px solid rgba(141, 25, 29, 0.15); border-radius: 12px; padding: 14px 16px;">
                <div class="bill-row" style="display:flex; justify-content:space-between; font-size:0.88rem; color:#4a3b30; margin-bottom:6px;">
                  <span>Items Subtotal (${summary.count} item${summary.count === 1 ? '' : 's'})</span>
                  <span style="font-weight:700;">₹${summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                ${summary.discount > 0 ? `
                  <div class="bill-row" style="display:flex; justify-content:space-between; font-size:0.88rem; color:#16a34a; font-weight:700; margin-bottom:6px;">
                    <span>Discount (${summary.appliedCoupon?.code})</span>
                    <span>-₹${summary.discount.toLocaleString('en-IN')}</span>
                  </div>
                ` : ''}
                <div class="bill-row" style="display:flex; justify-content:space-between; font-size:0.88rem; color:#4a3b30; margin-bottom:6px;">
                  <span>Delivery Fee (India Post Speed Post)</span>
                  <span style="color:#166534; font-weight:700;">${summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee}`}</span>
                </div>
                <div class="bill-row" style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:900; color:#8d191d; border-top:1px solid rgba(141, 25, 29, 0.2); padding-top:10px; margin-top:8px;">
                  <span>Total Payable</span>
                  <span>₹${summary.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button type="submit" id="place-order-btn" class="btn-pay-submit" style="display:flex !important; align-items:center !important; justify-content:center !important; width:100% !important; background:#8d191d !important; background:linear-gradient(135deg, #8d191d 0%, #631013 100%) !important; color:#ffffff !important; border:1px solid rgba(255,255,255,0.25) !important; padding:15px 22px !important; border-radius:10px !important; font-size:1rem !important; font-weight:800 !important; cursor:pointer !important; margin-top:14px !important; box-shadow:0 8px 22px rgba(141,25,29,0.45) !important;">
              <span class="btn-spinner" style="display:none;"></span>
              <span class="btn-text" style="color:#ffffff !important; font-weight:800 !important; display:inline-block !important;">📦 Confirm Cash on Delivery Order • ₹${summary.grandTotal.toLocaleString('en-IN')}</span>
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
            <h5 style="font-size:0.92rem; font-weight:800; color:#2c1810; margin:0 0 10px 0; display:flex; align-items:center; gap:6px;">
              <span>📋</span> Bill Details
            </h5>
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
    const form = modalContent.querySelector("#checkout-form");
    if (!form) return;

    const placeBtn = modalContent.querySelector("#place-order-btn");
    const btnText = placeBtn?.querySelector(".btn-text");
    const btnSpinner = placeBtn?.querySelector(".btn-spinner");
    const summary = cart.getSummary();

    function updatePayButtonText() {
      const selectedRadio = form.querySelector("input[name='payment_method']:checked");
      const method = selectedRadio ? selectedRadio.value : "upi";
      if (!btnText) return;
      if (method === "upi") {
        btnText.textContent = `⚡ Pay via Razorpay (UPI / GPay / PhonePe) • ₹${summary.grandTotal.toLocaleString('en-IN')}`;
      } else if (method === "card") {
        btnText.textContent = `💳 Pay via Razorpay (Cards / Netbanking) • ₹${summary.grandTotal.toLocaleString('en-IN')}`;
      } else if (method === "cod") {
        btnText.textContent = `📦 Confirm Cash on Delivery Order • ₹${summary.grandTotal.toLocaleString('en-IN')}`;
      }
    }

    // Payment method radio selection styling
    modalContent.querySelectorAll(".payment-option").forEach(opt => {
      opt.addEventListener("click", () => {
        modalContent.querySelectorAll(".payment-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        const radio = opt.querySelector("input[type='radio']");
        if (radio) {
          radio.checked = true;
          updatePayButtonText();
        }
      });
    });

    form.onsubmit = async (e) => {
      e.preventDefault();

      const customerName = form.querySelector("#cust-name")?.value.trim() || "Valued Customer";
      const phone = form.querySelector("#cust-phone")?.value.trim() || "";
      const email = form.querySelector("#cust-email")?.value.trim() || "";
      const address = form.querySelector("#cust-address")?.value.trim() || "";
      const city = form.querySelector("#cust-city")?.value || "Calicut";
      const pincode = form.querySelector("#cust-pincode")?.value.trim() || "673001";
      const selectedRadio = form.querySelector("input[name='payment_method']:checked");
      const paymentMethod = selectedRadio ? selectedRadio.value : "upi";

      if (placeBtn) placeBtn.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "inline-block";

      // Case 1: Cash on Delivery (COD)
      if (paymentMethod === "cod") {
        if (btnText) btnText.textContent = "Placing Cash on Delivery Order...";
        setTimeout(() => {
          const orderId = "KB-COD-" + Math.floor(100000 + Math.random() * 900000);
          const orderItems = [...summary.items];
          const grandTotal = summary.grandTotal;
          cart.clear();
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch (err) {}
          renderOrderSuccess(orderId, customerName, phone, city, grandTotal, orderItems, {
            method: "Cash on Delivery (COD)",
            paymentId: null,
            address,
            pincode
          });
        }, 700);
        return;
      }

      // Case 2: Online Payment via Razorpay (UPI, GPay, PhonePe, Cards)
      if (btnText) btnText.textContent = "Opening Razorpay Secure Checkout...";
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || typeof window.Razorpay === "undefined") {
        if (placeBtn) placeBtn.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
        updatePayButtonText();
        if (typeof showToast === "function") {
          showToast("Payment gateway could not load. Please choose Cash on Delivery (COD) or check your connection.");
        }
        return;
      }

      const rzpOptions = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(summary.grandTotal * 100), // amount in paise
        currency: "INR",
        name: "Keerthi Bakery",
        description: `Order of ${summary.count} fresh Malabar snack${summary.count === 1 ? '' : 's'}`,
        image: "/images/keerthi_logo_clean_hq.png",
        prefill: {
          name: customerName,
          email: email,
          contact: phone
        },
        notes: {
          shipping_address: `${address}, ${city} - ${pincode}`,
          delivery_slot: summary.deliverySlot?.time || "Express Delivery"
        },
        theme: {
          color: "#6B1D28"
        },
        handler: function (response) {
          const orderId = "KB-" + Math.floor(100000 + Math.random() * 900000);
          const orderItems = [...summary.items];
          const grandTotal = summary.grandTotal;
          cart.clear();
          try {
            confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
          } catch (err) {}
          renderOrderSuccess(orderId, customerName, phone, city, grandTotal, orderItems, {
            method: "Razorpay (Online Payment)",
            paymentId: response.razorpay_payment_id,
            address,
            pincode
          });
        },
        modal: {
          ondismiss: function () {
            if (placeBtn) placeBtn.disabled = false;
            if (btnSpinner) btnSpinner.style.display = "none";
            updatePayButtonText();
          }
        }
      };

      try {
        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      } catch (err) {
        console.error("Razorpay error", err);
        if (placeBtn) placeBtn.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
        updatePayButtonText();
        if (typeof showToast === "function") {
          showToast("Unable to initiate online payment. Please select Cash on Delivery (COD).");
        }
      }
    };
  }

  function renderOrderSuccess(orderId, customerName, phone, city, total, items, paymentInfo = {}) {
    const isCod = paymentInfo.method && paymentInfo.method.includes("COD");

    // Persist new order into live Admin Dashboard via serverless API
    try {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          customerName,
          phone,
          email: paymentInfo.email || "",
          address: paymentInfo.address || "",
          city,
          pincode: paymentInfo.pincode || "",
          items,
          total,
          paymentMethod: paymentInfo.method || (isCod ? "Cash on Delivery (COD)" : "Razorpay Online"),
          paymentId: paymentInfo.paymentId || null
        })
      }).catch(e => console.warn("Orders API sync warning:", e));
    } catch (e) {}

    modalContent.innerHTML = `
      <div class="order-success-card">
        <div class="success-icon-wrap">
          <span class="success-checkmark">✓</span>
        </div>
        <div class="success-tag">Order Confirmed • Keerthi Bakery Kadavathur</div>
        <h2>Thank You, ${customerName}!</h2>
        <p class="success-subtitle">Your fresh snacks order has been placed successfully and assigned for immediate packing at our Kadavathur facility for dispatch via <strong>India Post Speed Post</strong> to <strong>${city}</strong>.</p>

        <div class="order-id-pill" style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
          <div>
            <span>Order Reference:</span>
            <strong>${orderId}</strong>
          </div>
          ${paymentInfo.paymentId ? `
            <div style="font-size: 11px; color: #166534; font-weight: 600;">
              ✓ Razorpay Payment ID: <code>${paymentInfo.paymentId}</code>
            </div>
          ` : isCod ? `
            <div style="font-size: 11px; color: #b45309; font-weight: 600;">
              💵 Cash on Delivery: Pay ₹${total.toLocaleString('en-IN')} upon delivery
            </div>
          ` : ''}
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
            <span class="timeline-dot">📮</span>
            <span class="timeline-text">Speed Post Dispatch</span>
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

        <!-- Bill Details Summary -->
        <div class="success-bill-box" style="background: #ffffff; border: 1px dashed rgba(141, 25, 29, 0.25); border-radius: 12px; padding: 14px 18px; margin: 14px 0; text-align: left;">
          <h4 style="font-size: 0.88rem; font-weight: 800; color: #8d191d; margin: 0 0 10px 0; display:flex; align-items:center; gap:6px;">
            <span>📋</span> Bill Details
          </h4>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#475569; margin-bottom:6px;">
            <span>Items Subtotal (${items.length} snack${items.length === 1 ? '' : 's'})</span>
            <span style="font-weight:600;">₹${(total - (paymentInfo.deliveryFee || 0)).toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#475569; margin-bottom:6px;">
            <span>Delivery (India Post Speed Post)</span>
            <span style="color:#166534; font-weight:700;">FREE</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:1rem; font-weight:900; color:#8d191d; padding-top:8px; border-top:1px solid rgba(141, 25, 29, 0.15); margin-top:4px;">
            <span>Total ${isCod ? 'Payable (COD)' : 'Paid'}</span>
            <span>₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="success-actions">
          <a href="https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery,\n\nI just placed order *${orderId}* on www.keerthibakery.com!\n\n*Name:* ${customerName}\n*Phone:* ${phone}\n*Address:* ${paymentInfo.address ? paymentInfo.address + ', ' : ''}${city} - ${paymentInfo.pincode || ''}\n*Payment:* ${paymentInfo.method || 'Order'}${paymentInfo.paymentId ? ` (${paymentInfo.paymentId})` : ''}\n*Dispatch:* India Post Speed Post\n*Total:* ₹${total}\n\n*Items:*\n` + items.map(i => `• ${i.name} (${i.weight || 'Std'}) x ${i.quantity}`).join('\n'))}" 
             target="_blank" class="btn-whatsapp-order" style="background:#25d366 !important; color:#ffffff !important; padding:12px 22px !important; border-radius:10px !important; font-weight:800 !important; font-size:0.92rem !important; text-decoration:none !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; gap:8px !important; box-shadow:0 6px 18px rgba(37,211,102,0.4) !important; border:none !important;">
            <span style="font-size: 1.1rem; line-height: 1;">💬</span> <span style="color:#ffffff !important; font-weight:800 !important;">Track Order on WhatsApp</span>
          </a>
          <button type="button" class="btn-order-done" id="success-done-btn" style="background:#ffffff !important; border:1.5px solid #8d191d !important; color:#8d191d !important; padding:12px 22px !important; border-radius:10px !important; font-weight:800 !important; font-size:0.92rem !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; justify-content:center !important;">
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
