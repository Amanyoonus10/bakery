/* ==========================================================================
   APSARA BAKES - INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

// 1. OUTLETS DATA (18 Outlets across Iritty, Mattannur, Uliyil, etc., Kannur District)
const MAIN_OWNER_PHONE = "+91 98475 72417";

const OUTLETS = [
  { id: 1, name: "Old Bus Stand", town: "Iritty", district: "Kannur", phone: "+91 82815 98401", timing: "09:00 AM - 06:00 PM", region: "iritty" },
  { id: 2, name: "Mele Bus Stand", town: "Iritty", district: "Kannur", phone: "+91 82815 98402", timing: "09:00 AM - 06:00 PM", region: "iritty" },
  { id: 3, name: "New Bus Stand", town: "Iritty", district: "Kannur", phone: "+91 82815 98403", timing: "09:00 AM - 06:00 PM", region: "iritty" },
  { id: 4, name: "Ittans Coolbar", town: "Iritty", district: "Kannur", phone: "+91 82815 98406", timing: "09:00 AM - 06:00 PM", region: "iritty" },
  { id: 5, name: "Opp. Bus Stand", town: "Mattannur", district: "Kannur", phone: "+91 82815 98404", timing: "09:00 AM - 06:00 PM", region: "mattannur" },
  { id: 6, name: "Kannur Road", town: "Mattannur", district: "Kannur", phone: "+91 98472 44200", timing: "09:00 AM - 06:00 PM", region: "mattannur" },
  { id: 7, name: "Iritty Road", town: "Mattannur", district: "Kannur", phone: "+91 96455 02000", timing: "09:00 AM - 06:00 PM", region: "mattannur" },
  { id: 8, name: "Aleema Plaza", town: "Uliyil", district: "Kannur", phone: "+91 95266 61980", timing: "09:00 AM - 06:00 PM", region: "uliyil" },
  { id: 9, name: "Grand bei Market", town: "19th Mile", district: "Kannur", phone: "+91 95444 74250", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 10, name: "Kooranmukku Branch", town: "Kooranmukku", district: "Kannur", phone: "+91 82815 98405", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 11, name: "Uliyil Main Branch", town: "Uliyil", district: "Kannur", phone: "+91 75590 65874", timing: "09:00 AM - 06:00 PM", region: "uliyil" },
  { id: 12, name: "Express Cafe", town: "Uliyil", district: "Kannur", phone: "+91 92074 89789", timing: "09:00 AM - 06:00 PM", region: "uliyil" },
  { id: 13, name: "Punnad Branch", town: "Punnad", district: "Kannur", phone: "+91 82815 98407", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 14, name: "Keezhurkunnu Store", town: "Keezhurkunnu", district: "Kannur", phone: "+91 81389 91980", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 15, name: "Vallithode Branch", town: "Vallithode", district: "Kannur", phone: "+91 90727 01980", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 16, name: "Thillankery Branch", town: "Thillankery", district: "Kannur", phone: "+91 80865 84009", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 17, name: "Kakkayangad Branch", town: "Kakkayangad", district: "Kannur", phone: "+91 83040 89147", timing: "09:00 AM - 06:00 PM", region: "other" },
  { id: 18, name: "Vilakode Branch", town: "Vilakode", district: "Kannur", phone: "+91 86064 72000", timing: "09:00 AM - 06:00 PM", region: "other" }
];

// 2. PRODUCTS DATA (Featuring actual project assets)
const PRODUCTS = [
  {
    id: 101,
    name: "Authentic Kerala Banana Chips",
    category: "snacks",
    image: "banana chips.png",
    price: "₹180 / 500g",
    rawPrice: 180,
    badge: "Bestseller",
    description: "Crispy golden raw Nendran banana chips fried to perfection in 100% pure cold-pressed coconut oil with light sea salt.",
    ingredients: "Raw Nendran Banana, Pure Coconut Oil, Salt, Turmeric"
  },
  {
    id: 102,
    name: "Jackfruit Chips (Chakka Upperi)",
    category: "snacks",
    image: "jackfuit chips.png",
    price: "₹220 / 500g",
    rawPrice: 220,
    badge: "Seasonal Special",
    description: "Crispy sliced ripe-raw raw jackfruit chips fried in coconut oil. Naturally sweet, aromatic, and uniquely crunchy.",
    ingredients: "Selected Jackfruit, Pure Coconut Oil, Sea Salt"
  },
  {
    id: 103,
    name: "Spicy Kerala Hot Mixture",
    category: "snacks",
    image: "kerala hot mixture.png",
    price: "₹160 / 500g",
    rawPrice: 160,
    badge: "Spicy Favorite",
    description: "Rich traditional Kerala mixture blend with crispy sev, roasted peanuts, fried curry leaves, and aromatic Kerala spices.",
    ingredients: "Gram Flour, Peanuts, Curry Leaves, Chili Powder, Asafoetida, Coconut Oil"
  },
  {
    id: 104,
    name: "Crunchy Masala Chana",
    category: "snacks",
    image: "masala chana.png",
    price: "₹140 / 400g",
    rawPrice: 140,
    badge: "High Protein",
    description: "Roasted chickpeas coated in tangy South Indian chat masala and spices. The perfect guilt-free tea-time snack.",
    ingredients: "Black Chickpeas, Chili, Amchur, Black Salt, Spices"
  },
  {
    id: 105,
    name: "Yellow Special Tea Mixture",
    category: "snacks",
    image: "mixture 1 yellow.png",
    price: "₹150 / 500g",
    rawPrice: 150,
    badge: "Classic",
    description: "Golden mild crunchy mixture crafted with fine bhoondhi, roasted gram, and mild spices. Perfect with evening chai.",
    ingredients: "Gram Flour, Roasted Gram, Cashews, Mild Spices, Coconut Oil"
  },
  {
    id: 106,
    name: "Crispy Tapioca Chips (Kappa Upperi)",
    category: "snacks",
    image: "tapioca chips.png",
    price: "₹150 / 500g",
    rawPrice: 150,
    badge: "Traditional",
    description: "Thinly sliced, ultra-crispy cassava tapioca chips salted and tossed in fresh curry leaves.",
    ingredients: "Fresh Tapioca Roots, Pure Coconut Oil, Salt, Red Chili Flakes"
  },
  {
    id: 107,
    name: "Royal Dark Velvet Truffle Cake",
    category: "cakes",
    image: "hero_cake.png",
    price: "₹850 / 1 Kg",
    rawPrice: 850,
    badge: "Chef Signature",
    description: "Decadent Dutch chocolate sponge layered with rich Belgian chocolate ganache and finished with edible gold leaf.",
    ingredients: "Belgian Chocolate, Cocoa Butter, Fresh Cream, Vanilla Extract"
  },
  {
    id: 108,
    name: "Artisan Bakery Pastries Basket",
    category: "pastries",
    image: "artisan_pastries.png",
    price: "₹380 / Box of 6",
    rawPrice: 380,
    badge: "Fresh Daily",
    description: "Assortment of fresh butter croissants, fruit tarts, almond pastries, and chocolate eclairs.",
    ingredients: "French Butter, Wheat Flour, Fresh Fruits, Pastry Cream"
  }
];

// DOM Load Event
document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initAmbientCanvas();
  renderOutletsGrid(OUTLETS);
  initCinematicSlider();
  initCakeCalculator();
  initToastNotifications();
  initScrollAnimations();
  initWhatsNewAutoRotate();
  initMobileOutletsCarousel();
  setupEventListeners();
});

/* --------------------------------------------------------------------------
   MOBILE OUTLETS SLIDESHOW / CAROUSEL NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileOutletsCarousel() {
  const prevBtn = document.getElementById("mobileOutletsPrev");
  const nextBtn = document.getElementById("mobileOutletsNext");
  const counterEl = document.getElementById("mobileOutletsCounter");
  const grid = document.getElementById("outletsGrid");

  if (!grid) return;

  function updateCounter() {
    if (!counterEl) return;
    const cards = Array.from(grid.querySelectorAll(".outlet-card")).filter(c => c.style.display !== "none");
    if (cards.length === 0) return;

    const gridLeft = grid.getBoundingClientRect().left;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, i) => {
      const distance = Math.abs(card.getBoundingClientRect().left - gridLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    counterEl.innerHTML = `Outlet <strong>${closestIndex + 1}</strong> of <strong>${cards.length}</strong>`;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const card = grid.querySelector(".outlet-card");
      const scrollAmount = card ? card.offsetWidth + 16 : 300;
      grid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setTimeout(updateCounter, 350);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const card = grid.querySelector(".outlet-card");
      const scrollAmount = card ? card.offsetWidth + 16 : 300;
      grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(updateCounter, 350);
    });
  }

  grid.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateCounter);
  }, { passive: true });

  window.addEventListener("resize", updateCounter);
  window.updateMobileOutletsCounter = updateCounter;
}

/* --------------------------------------------------------------------------
   HERO BACKGROUND SLIDER
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const bgSlider = document.getElementById("hero-bg-slider");
  if (!bgSlider) return;

  const bgImages = [
    "banana chips.png",
    "kerala hot mixture.png",
    "hero_cake.png",
    "masala chana.png",
    "tapioca chips.png"
  ];

  bgSlider.innerHTML = bgImages.map((src, index) => `
    <img src="${src}" class="hero-bg-slide ${index === 0 ? 'active' : ''}" alt="Bakery Texture ${index}" />
  `).join('');

  const slides = document.querySelectorAll(".hero-bg-slide");
  if(slides.length === 0) return;
  
  let current = 0;

  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 6000);
}

/* --------------------------------------------------------------------------
   3. AMBIENT PARTICLES CANVAS
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speedY: -Math.random() * 0.4 - 0.1,
    speedX: Math.sin(Math.random() * Math.PI) * 0.2,
    opacity: Math.random() * 0.5 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   4. OUTLETS RENDER & FILTERING
   -------------------------------------------------------------------------- */
function renderOutletsGrid(outletsList) {
  const grid = document.getElementById("outletsGrid") || document.getElementById("outlets-grid");
  const countEl = document.getElementById("outlets-count");
  if (!grid) return;
  if (grid.querySelectorAll(".outlet-card").length > 0) return;

  if (countEl) countEl.innerText = `${outletsList.length} Outlets Available`;

  if (outletsList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="ri-search-line" style="font-size: 3rem; color: var(--accent-gold);"></i>
        <p style="margin-top: 10px;">No outlet found matching your search. Try searching "Keezhoorkunnu" or "Kottayam".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = outletsList.map(item => `
    <div class="outlet-card ${item.isMain ? 'main-branch-card' : ''}" data-district="${item.district.toLowerCase()}">
      <div>
        <div class="outlet-header">
          <div>
            <span class="outlet-district">${item.district} District</span>
            <h3 class="outlet-name">${item.name}</h3>
          </div>
          ${item.isMain ? `<span class="badge badge-main-outlet">★ MAIN BRANCH</span>` : `<span class="badge badge-green">Open Now</span>`}
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 12px; line-height: 1.5;">
          <i class="ri-map-pin-2-fill" style="color: var(--accent-gold);"></i> ${item.address}
        </p>
        <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted);">
          <i class="ri-time-line"></i> ${item.timing} &bull; <i class="ri-phone-line"></i> ${item.phone}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px;">
          ${item.features.map(f => `<span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; color: var(--accent-gold-light);">${f}</span>`).join('')}
        </div>
      </div>
      <div class="outlet-actions">
        <a href="https://maps.google.com/?q=${encodeURIComponent(item.mapsQuery)}" target="_blank" class="btn btn-secondary">
          <i class="ri-direction-line"></i> Directions
        </a>
        <a href="https://wa.me/919847572417?text=${encodeURIComponent(`Hello Apsara Bakes! I want to inquire about orders at ${item.name}`)}" target="_blank" class="btn btn-primary">
          <i class="ri-whatsapp-line"></i> Order
        </a>
      </div>
    </div>
  `).join('');
}

function filterOutlets() {
  const searchVal = document.getElementById("outlet-search")?.value.toLowerCase().trim() || "";
  const activeTab = document.querySelector(".filter-chip.active")?.getAttribute("data-district") || "all";

  const filtered = OUTLETS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchVal) ||
                          item.address.toLowerCase().includes(searchVal) ||
                          item.district.toLowerCase().includes(searchVal);
    const matchesDistrict = activeTab === "all" || item.district.toLowerCase() === activeTab;
    return matchesSearch && matchesDistrict;
  });

  renderOutletsGrid(filtered);
}

/* --------------------------------------------------------------------------
   5. CINEMATIC SLIDER (PRODUCTS)
   -------------------------------------------------------------------------- */
function initCinematicSlider() {
  const sliderContainer = document.getElementById("cinematic-slider");
  const indicatorsContainer = document.getElementById("slider-indicators");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");
  
  if (!sliderContainer) return;

  let currentSlide = 0;
  
  // Render Slides
  sliderContainer.innerHTML = PRODUCTS.map((item, index) => `
    <div class="cinematic-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="slide-img-wrapper">
        <img src="${item.image}" alt="${item.name}" class="slide-img" />
      </div>
      <div class="slide-content">
        <span class="slide-badge">${item.badge}</span>
        <h3 class="slide-title">${item.name}</h3>
        <p class="slide-desc">${item.description}</p>
        <div class="slide-price">${item.price}</div>
        <button class="btn btn-primary" onclick="openProductModal(${item.id})">
          <i class="ri-eye-line"></i> View Details
        </button>
      </div>
    </div>
  `).join('');

  // Render Indicators
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = PRODUCTS.map((_, index) => `
      <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
  }

  const slides = document.querySelectorAll(".cinematic-slide");
  const indicators = document.querySelectorAll(".indicator");

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    indicators.forEach(i => i.classList.remove("active"));
    
    currentSlide = (index + PRODUCTS.length) % PRODUCTS.length;
    
    slides[currentSlide].classList.add("active");
    if (indicators[currentSlide]) {
      indicators[currentSlide].classList.add("active");
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
  
  indicators.forEach(ind => {
    ind.addEventListener("click", (e) => {
      goToSlide(parseInt(e.target.dataset.index));
    });
  });

  // Auto Play
  setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 6000);
}

/* Product Modal Detail */
function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("product-modal");
  const body = document.getElementById("modal-body-content");

  const whatsappMsg = `Hello Apsara Bakes! I would like to order: ${product.name} (${product.price}). Please share delivery/pickup options at Keezhoorkunnu Main Branch.`;

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid var(--accent-gold); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 300px; object-fit: cover;" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <span class="badge badge-gold" style="align-self: flex-start;">${product.badge}</span>
        <h2 style="font-size: 1.8rem; color: #FFF;">${product.name}</h2>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-gold);">${product.price}</div>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">${product.description}</p>
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--text-muted);">
          <strong style="color: var(--accent-gold);">Key Ingredients:</strong> ${product.ingredients}
        </div>
        <div style="margin-top: 10px; display: flex; gap: 12px;">
          <a href="https://wa.me/919847572417?text=${encodeURIComponent(whatsappMsg)}" target="_blank" class="btn btn-whatsapp" style="flex: 1;">
            <i class="ri-whatsapp-line"></i> Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("product-modal")?.classList.remove("active");
}

/* --------------------------------------------------------------------------
   6. CUSTOM CAKE CALCULATOR
   -------------------------------------------------------------------------- */
function initCakeCalculator() {
  const flavorSelect = document.getElementById("cake-flavor");
  const weightSelect = document.getElementById("cake-weight");
  const outletSelect = document.getElementById("cake-outlet");
  const msgInput = document.getElementById("cake-message");

  if (!flavorSelect || !weightSelect) return;

  // Populate Outlet Select in calculator
  if (outletSelect) {
    outletSelect.innerHTML = OUTLETS.map(o => `
      <option value="${o.name}" ${o.isMain ? 'selected' : ''}>${o.name} (${o.district})</option>
    `).join('');
  }

  function calculate() {
    const basePrice = parseInt(flavorSelect.value || 800);
    const weightMultiplier = parseFloat(weightSelect.value || 1);
    const totalPrice = Math.round(basePrice * weightMultiplier);

    const priceEl = document.getElementById("calc-total-price");
    const summaryFlav = document.getElementById("summary-flavor");
    const summaryWeight = document.getElementById("summary-weight");
    const summaryOutlet = document.getElementById("summary-outlet");

    if (priceEl) priceEl.innerText = `₹${totalPrice}`;
    if (summaryFlav) summaryFlav.innerText = flavorSelect.options[flavorSelect.selectedIndex].text;
    if (summaryWeight) summaryWeight.innerText = `${weightSelect.value} Kg`;
    if (summaryOutlet) summaryOutlet.innerText = outletSelect ? outletSelect.options[outletSelect.selectedIndex].text : "Keezhoorkunnu Main Branch";

    // Set WhatsApp link
    const waBtn = document.getElementById("cake-wa-btn");
    if (waBtn) {
      const text = `Hello Apsara Bakes! I would like to order a Custom Celebration Cake:
- Flavour: ${flavorSelect.options[flavorSelect.selectedIndex].text}
- Weight: ${weightSelect.value} Kg
- Message on Cake: "${msgInput?.value || 'Happy Birthday!'}"
- Preferred Pickup Outlet: ${outletSelect ? outletSelect.value : 'Keezhoorkunnu Main Outlet'}
- Estimated Price: ₹${totalPrice}`;
      waBtn.href = `https://wa.me/919847572417?text=${encodeURIComponent(text)}`;
    }
  }

  flavorSelect.addEventListener("change", calculate);
  weightSelect.addEventListener("change", calculate);
  if (outletSelect) outletSelect.addEventListener("change", calculate);
  if (msgInput) msgInput.addEventListener("input", calculate);

  calculate();
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function initToastNotifications() {
  const messages = [
    "🔥 Fresh batch of crisp Banana Chips hot off frying at Keezhoorkunnu Branch!",
    "📍 17 Outlets across Kerala ready to serve you fresh delicacies daily!",
    "🎂 Order custom wedding & birthday cakes 24 hours in advance via WhatsApp!",
    "🌿 100% Pure Coconut Oil used for all traditional Kerala snack bakes!"
  ];

  let index = 0;
  setInterval(() => {
    showToast(messages[index]);
    index = (index + 1) % messages.length;
  }, 12000);
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="ri-sparkles-line" style="color: var(--accent-gold);"></i> <span>${msg}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-100%)";
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

/* --------------------------------------------------------------------------
   8. SCROLL ANIMATIONS & LISTENERS
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".animate-on-scroll").forEach(el => observer.observe(el));
}

function setupEventListeners() {
  // Mobile Nav Drawer Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navLinks = document.getElementById("nav-links");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        icon.className = navLinks.classList.contains("active") ? "ri-close-line" : "ri-menu-3-line";
      }
    });
  }

  // Sticky Navbar Class on Scroll
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });

  // District Filter Chip Clicks
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      filterOutlets();
    });
  });

  // Search input for outlets
  document.getElementById("outlet-search")?.addEventListener("input", filterOutlets);

  // Manual Flip Adjustment Control for ElSombrero2 Card
  const flipCard = document.getElementById("brand-profile-flip-card");
  if (flipCard) {
    document.querySelectorAll(".manual-flip-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.toggle("is-flipped");
      });
    });

    document.querySelectorAll(".manual-flip-back-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.remove("is-flipped");
      });
    });

    flipCard.addEventListener("click", (e) => {
      if (e.target.closest(".manual-flip-back-btn")) {
        flipCard.classList.remove("is-flipped");
      } else if (!e.target.closest(".detail-pillar-card")) {
        flipCard.classList.toggle("is-flipped");
      }
    });
  }

  // Init Desktop & Mobile Nav Smooth Scroll + ScrollSpy
  initNavScrollAndSpy();
}

/* --------------------------------------------------------------------------
   NAV SMOOTH SCROLL & SCROLLSPY
   -------------------------------------------------------------------------- */
function initNavScrollAndSpy() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('section[id], header[id]');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update active state immediately
        document.querySelectorAll('.attract-pill, .nav-link').forEach(pill => {
          pill.classList.remove('active');
        });
        this.classList.add('active');

        // Close mobile overlay if open
        const navOverlay = document.getElementById("nav");
        if (navOverlay && navOverlay.classList.contains("is-open")) {
          navOverlay.classList.remove("is-open");
        }
      }
    });
  });

  // ScrollSpy active highlighting
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      document.querySelectorAll('.attract-pill, .nav-link').forEach(pill => {
        if (pill.getAttribute('href') === `#${current}`) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   5. LEADERSHIP PROFILE LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
const LEADERS_DATA = {
  "mayan": {
    imgSrc: "mayan.png",
    name: "K.V. Mayan",
    title: "Founder & Managing Director",
    headline: "A Visionary. A Leader. A Legacy.",
    quote: "Our journey started local, our vision took us global. Quality is our promise, trust is our strength.",
    description: "Mr. K.V. Mayan is the visionary founder and Managing Director of Apsara Bakes Private Limited. Starting in 1980 with just two dedicated staff in Iritty, Kannur, his uncompromising commitment to pure ingredients, traditional recipes, and food safety built Apsara Bakes into one of Kerala's premier bakery enterprises. Under his leadership, the brand expanded to 17+ modern retail outlets across Kannur district, large-scale wholesale operations, and international exports reaching New Zealand, Australia, GCC, Oman, and the USA.",
    roleTag: "FOUNDER & MD",
    milestones: [
      "1980 - A Humble Beginning: Founded Apsara Bakes with two staff, crafting fresh traditional snacks and bakery items in Iritty, Kannur.",
      "Manufacturing & Expansion: Scaled production with state-of-the-art baking machinery while preserving traditional Malabar flavors.",
      "17+ Modern Retail Outlets: Built a trusted retail presence across Kannur, serving over 10 Lakh+ loyal customers.",
      "ISO 22000 & Cleanroom Standards: Implemented ISO certified touchless automated production & nitrogen vacuum sealing.",
      "Global Supply Network: Expanded export distribution across 5+ countries including New Zealand, Australia, GCC, Oman & USA."
    ],
    highlights: [
      "Quality First: Unmatched taste in every batch",
      "40+ Years Leadership: Pioneer of Kannur baking",
      "17+ Outlets Network: Regional market leader",
      "Global Distribution: Exports to 5+ countries",
      "ISO Food Safety: Pure coconut oil & hygiene"
    ]
  },
  "safoora": {
    imgSrc: "safoora.png",
    name: "Safoora Mayan",
    title: "Director & Recipe Advisor",
    headline: "Behind Every Success, There Is Visionary Guidance.",
    quote: "Her vision shapes our journey. Her values define our success.",
    description: "Mrs. Safoora Mayan serves as Director and Chief Recipe Advisor of Apsara Bakes Private Limited. A cornerstone of the family business since its inception, she is the creative force behind Apsara's signature authentic Kerala snack recipes, including banana chips, halwa variants, and traditional festive savouries. Her emphasis on pure cold-pressed coconut oil, unadulterated spices, and home-style warmth ensures that every Apsara product retains its nostalgic heritage flavor while meeting global food quality standards.",
    roleTag: "DIRECTOR",
    milestones: [
      "Co-Founding Support: Stood as a primary pillar of strength, wise counsel, and encouragement during the early establishment phase.",
      "Mastering Recipe Formulation: Developed the proprietary spice blends and frying techniques for Kerala's favorite Banana Chips and Halwa.",
      "Uncompromising Quality Control: Established standard operating recipes ensuring consistent taste across all 17 outlets.",
      "Preserving Culinary Heritage: Championed traditional methods, natural sweeteners like jaggery, and 100% pure coconut oil."
    ],
    highlights: [
      "Authentic Recipes: Heritage Kerala taste",
      "Culinary R&D: Flavor & texture innovator",
      "Pure Ingredients: 100% Coconut Oil & Ghee",
      "Organizational Culture: Family values & care"
    ]
  },
  "shahid": {
    imgSrc: "shahid.png",
    name: "Shahid Pilakool",
    title: "Director & Growth Strategist",
    headline: "A Leader. An Entrepreneur. A Vision For Growth.",
    quote: "Rooted in values. Driven by innovation. Taking Apsara from Kerala to the world.",
    description: "Mr. Shahid Pilakool is the Director & Growth Strategist at Apsara Bakes Private Limited. Holding a Master's degree in Business Entrepreneurship from De Montfort University, Leicester, UK, he joined the leadership team in 2017 to modernize corporate governance, expand international exports, and introduce next-generation café concepts. He leads global business development, digital brand strategy, and high-capacity manufacturing logistics, driving Apsara Bakes into its next era of international expansion.",
    roleTag: "DIRECTOR",
    milestones: [
      "2017 - Strategic Leadership: Joined as Director after completing Postgraduate studies in Business Entrepreneurship in the UK.",
      "International Business Development: Established direct export pipelines into GCC markets, Australia, New Zealand, and North America.",
      "2019 - Café & Retail Modernization: Launched modern boutique bakery café formats and premium product packaging.",
      "Digital Transformation: Spearheaded online ordering, automated inventory management, and contemporary customer experiences."
    ],
    highlights: [
      "UK Business Graduate: Master's in Entrepreneurship",
      "Global Expansion: Export operations in 5+ countries",
      "Modern Café Formats: Next-gen customer experience",
      "Corporate Strategy: Sustainable brand growth"
    ]
  }
};

function openProfileModal(leaderKeyOrImg, name, title, headline, quote, description) {
  const modal = document.getElementById("leadershipModal");
  if (!modal) return;

  let leader = LEADERS_DATA[leaderKeyOrImg];
  if (!leader) {
    leader = {
      imgSrc: leaderKeyOrImg,
      name: name || "Leader Profile",
      title: title || "",
      headline: headline || "",
      quote: quote || "",
      description: description || "",
      roleTag: title && title.toUpperCase().includes('FOUNDER') ? 'FOUNDER & MD' : 'DIRECTOR',
      milestones: [],
      highlights: []
    };
  }

  const imgEl = document.getElementById("modalProfileImg");
  const nameEl = document.getElementById("modalProfileName");
  const titleEl = document.getElementById("modalProfileTitle");
  const headlineEl = document.getElementById("modalHeadline");
  const quoteEl = document.getElementById("modalQuote");
  const descEl = document.getElementById("modalDescription");
  const tagEl = document.getElementById("modalRoleTag");
  const milestonesEl = document.getElementById("modalMilestones");
  const highlightsEl = document.getElementById("modalHighlights");

  const isFounder = leader.roleTag.includes('FOUNDER');
  const themeColor = isFounder ? '#ffd700' : '#e0e0e0';

  if (imgEl) imgEl.src = leader.imgSrc;
  if (nameEl) nameEl.innerText = leader.name;
  if (titleEl) {
    titleEl.innerText = leader.title;
    titleEl.style.color = themeColor;
  }
  if (headlineEl) {
    headlineEl.innerText = leader.headline ? `“${leader.headline}”` : '';
    headlineEl.style.color = themeColor;
  }
  if (quoteEl) {
    quoteEl.innerText = leader.quote ? `“${leader.quote}”` : '';
    quoteEl.style.borderLeftColor = themeColor;
  }
  if (descEl) descEl.innerText = leader.description;

  if (tagEl) {
    tagEl.innerText = leader.roleTag;
    if (leader.roleTag.includes('FOUNDER')) {
      tagEl.className = 'modal-badge-tag founder-gold-badge';
    } else {
      tagEl.className = 'modal-badge-tag silver-badge';
    }
  }

  const milestonesTitle = document.getElementById("modalMilestonesTitle");
  if (milestonesTitle) milestonesTitle.style.color = themeColor;

  const highlightsTitle = document.getElementById("modalHighlightsTitle");
  if (highlightsTitle) highlightsTitle.style.color = themeColor;

  if (milestonesEl) {
    if (leader.milestones && leader.milestones.length > 0) {
      milestonesEl.innerHTML = leader.milestones.map(m => `
        <li style="margin-bottom: 10px; font-size: 0.88rem; color: #e5e5e5; line-height: 1.5; display: flex; align-items: flex-start; gap: 8px;">
          <i class="ri-checkbox-circle-fill" style="color: ${themeColor}; font-size: 1.05rem; flex-shrink: 0; margin-top: 2px;"></i>
          <span>${m}</span>
        </li>
      `).join('');
      if (milestonesTitle) milestonesTitle.style.display = "block";
      milestonesEl.style.display = "block";
    } else {
      milestonesEl.style.display = "none";
      if (milestonesTitle) milestonesTitle.style.display = "none";
    }
  }

  if (highlightsEl) {
    if (leader.highlights && leader.highlights.length > 0) {
      const chipBg = isFounder ? 'rgba(255, 215, 0, 0.12)' : 'rgba(224, 224, 224, 0.12)';
      const chipBorder = isFounder ? 'rgba(255, 215, 0, 0.4)' : 'rgba(224, 224, 224, 0.35)';

      highlightsEl.innerHTML = leader.highlights.map(h => `
        <div style="font-size: 0.82rem; font-weight: 600; padding: 7px 14px; background: ${chipBg}; border-radius: 10px; border: 1px solid ${chipBorder}; color: #ffffff; display: flex; align-items: center; gap: 8px;">
          <i class="ri-star-fill" style="color: ${themeColor};"></i> ${h}
        </div>
      `).join('');
      if (highlightsTitle) highlightsTitle.style.display = "block";
      highlightsEl.style.display = "flex";
    } else {
      highlightsEl.style.display = "none";
      if (highlightsTitle) highlightsTitle.style.display = "none";
    }
  }

  const contactBtn = document.getElementById("modalContactBtn");
  if (contactBtn) {
    contactBtn.href = "tel:+919847572417";
    contactBtn.style.background = isFounder 
      ? 'linear-gradient(135deg, #ffd700 0%, #cca010 100%)' 
      : 'linear-gradient(135deg, #ffffff 0%, #a8a9b3 100%)';
    contactBtn.style.color = '#0d0a00';
    contactBtn.style.fontWeight = '800';
    contactBtn.style.border = isFounder ? '1px solid #ffe885' : '1px solid #ffffff';
  }

  const modalBox = modal.querySelector(".leadership-modal-box");
  if (modalBox) {
    modalBox.style.borderColor = isFounder ? 'rgba(255, 215, 0, 0.45)' : 'rgba(224, 224, 224, 0.35)';
    modalBox.style.boxShadow = isFounder 
      ? '0 25px 70px rgba(255, 215, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.8)' 
      : '0 25px 70px rgba(255, 255, 255, 0.12), 0 10px 40px rgba(0, 0, 0, 0.8)';
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProfileModal() {
  const modal = document.getElementById("leadershipModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Expose globally on window
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfileModal();
});

/* --------------------------------------------------------------------------
   7. WHAT'S NEW 5-SECOND PRODUCT AUTO-ROTATION
   -------------------------------------------------------------------------- */
const WHATS_NEW_ITEMS = [
  {
    title: "Fresh Banana Chips",
    desc: "Crispy, light, and 100% natural. Handcrafted in Kerala in 100% pure coconut oil.",
    badgeIcon: "ri-flashlight-fill",
    price: "₹180 / 500g",
    btnText: "Shop Banana Chips"
  },
  {
    title: "Jackfruit Chips (Chakka Upperi)",
    desc: "Naturally sweet, aromatic, and uniquely crunchy fried in cold-pressed coconut oil.",
    badgeIcon: "ri-sparkles-fill",
    price: "₹220 / 500g",
    btnText: "Shop Jackfruit Chips"
  },
  {
    title: "Spicy Kerala Hot Mixture",
    desc: "Rich traditional Kerala mixture blend with crispy sev, peanuts & fried curry leaves.",
    badgeIcon: "ri-fire-fill",
    price: "₹160 / 500g",
    btnText: "Shop Hot Mixture"
  },
  {
    title: "Royal Dark Velvet Truffle Cake",
    desc: "Decadent Dutch chocolate sponge layered with Belgian chocolate ganache & gold leaf.",
    badgeIcon: "ri-cake-3-fill",
    price: "₹850 / 1 Kg",
    btnText: "Order Truffle Cake"
  },
  {
    title: "Crunchy Masala Chana",
    desc: "Roasted chickpeas coated in tangy South Indian chat masala for healthy tea-time snack.",
    badgeIcon: "ri-heart-pulse-fill",
    price: "₹140 / 400g",
    btnText: "Shop Masala Chana"
  },
  {
    title: "Crispy Tapioca Chips (Kappa Upperi)",
    desc: "Thinly sliced cassava tapioca chips salted and tossed with fresh fried curry leaves.",
    badgeIcon: "ri-leaf-fill",
    price: "₹150 / 500g",
    btnText: "Shop Tapioca Chips"
  },
  {
    title: "Yellow Special Tea Mixture",
    desc: "Golden mild crunchy mixture crafted with fine bhoondhi, roasted gram & cashews.",
    badgeIcon: "ri-cup-fill",
    price: "₹150 / 500g",
    btnText: "Shop Tea Mixture"
  },
  {
    title: "Artisan Bakery Pastries Basket",
    desc: "Assortment of fresh butter croissants, fruit tarts, almond pastries & eclairs.",
    badgeIcon: "ri-restaurant-2-fill",
    price: "₹380 / Box of 6",
    btnText: "Shop Bakery Pastries"
  }
];

function initWhatsNewAutoRotate() {
  const card = document.getElementById("whatsNewCard");
  const titleEl = document.getElementById("whatsNewTitle");
  const descEl = document.getElementById("whatsNewDesc");
  const badgeEl = document.getElementById("whatsNewBadge");
  const btnEl = document.getElementById("whatsNewBtn");
  const dotsEl = document.getElementById("whatsNewDots");

  if (!card || !titleEl || !descEl) return;

  let currentIndex = 0;

  if (dotsEl) {
    dotsEl.innerHTML = WHATS_NEW_ITEMS.map((_, i) => `
      <span class="wn-dot ${i === 0 ? 'active' : ''}" data-index="${i}" style="width: ${i === 0 ? '14px' : '6px'}; height: 6px; border-radius: 6px; background: ${i === 0 ? '#ffffff' : 'rgba(255,255,255,0.35)'}; transition: all 0.3s ease; cursor: pointer; display: inline-block;"></span>
    `).join('');

    dotsEl.querySelectorAll('.wn-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (!isNaN(idx)) {
          currentIndex = idx;
          updateCard(currentIndex);
        }
      });
    });
  }

  function updateCard(index) {
    card.style.opacity = "0";
    card.style.transform = "translateY(-6px)";

    setTimeout(() => {
      const item = WHATS_NEW_ITEMS[index];
      if (titleEl) titleEl.innerText = item.title;
      if (descEl) descEl.innerText = item.desc;
      if (badgeEl) {
        badgeEl.innerHTML = `<i class="${item.badgeIcon}" style="font-size: 1.25rem; color: var(--gold);"></i>`;
      }
      if (btnEl) {
        btnEl.innerText = `${item.btnText} • ${item.price}`;
      }

      if (dotsEl) {
        dotsEl.querySelectorAll('.wn-dot').forEach((dot, i) => {
          if (i === index) {
            dot.style.width = '14px';
            dot.style.background = '#ffffff';
          } else {
            dot.style.width = '6px';
            dot.style.background = 'rgba(255,255,255,0.35)';
          }
        });
      }

      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 250);
  }

  setInterval(() => {
    currentIndex = (currentIndex + 1) % WHATS_NEW_ITEMS.length;
    updateCard(currentIndex);
  }, 5000);
}

window.initWhatsNewAutoRotate = initWhatsNewAutoRotate;


function scrollToAdminContact() {
  if (typeof closeProfileModal === 'function') {
    closeProfileModal();
  }
  const outletsSec = document.getElementById('outlets');
  if (outletsSec) {
    outletsSec.scrollIntoView({ behavior: 'smooth' });
    const vipCard = document.querySelector('.owner-vip-card');
    if (vipCard) {
      vipCard.style.transition = 'transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease';
      vipCard.style.transform = 'scale(1.04)';
      vipCard.style.borderColor = '#ffffff';
      vipCard.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
      setTimeout(() => {
        vipCard.style.transform = 'scale(1)';
        vipCard.style.boxShadow = '0 18px 45px rgba(0, 0, 0, 0.45)';
      }, 1800);
    }
  }
}
