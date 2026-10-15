import { ALL_CAKES } from './data/all_cakes.js';
import { cart } from './js/cart.js';
import confetti from 'canvas-confetti';

let activeCategory = 'all';
let currentSearch = '';
let currentSort = 'recommended';
let selectedWeights = {}; // cakeId -> weight string ('0.5 KG', '1.0 KG', '2.0 KG')

// Initialize default selected weights
ALL_CAKES.forEach(c => {
  selectedWeights[c.id] = '1.0 KG';
});

// DOM Elements
const catalogGrid = document.getElementById('cakesCatalogGrid');
const filterPills = document.querySelectorAll('.filter-pill-btn');
const searchInput = document.getElementById('cakeSearchInput');
const sortSelect = document.getElementById('cakeSortSelect');
const cartCountBadge = document.getElementById('cakeCartCount');
const cakeModalBackdrop = document.getElementById('cakeModalBackdrop');
const cakeModalDialog = document.getElementById('cakeModalDialog');
const cakeModalContent = document.getElementById('cakeModalContent');
const cakeModalClose = document.getElementById('cakeModalClose');

// Update Cart Count
function updateHeaderCartBadge() {
  const count = cart.getItemCount();
  if (cartCountBadge) {
    cartCountBadge.textContent = count;
    cartCountBadge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Get price for a selected weight
function getPriceForWeight(cake, weight) {
  if (weight === '0.5 KG') return cake.price05;
  if (weight === '2.0 KG') return cake.price20;
  return cake.price10;
}

// Filter and Sort Cakes
function getFilteredCakes() {
  let list = [...ALL_CAKES];

  // Category filter
  if (activeCategory !== 'all') {
    if (activeCategory === 'eggless') {
      list = list.filter(c => c.isEggless);
    } else {
      list = list.filter(c => c.category === activeCategory);
    }
  }

  // Search filter
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase().trim();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.tagline.toLowerCase().includes(q) || 
      c.ingredients.toLowerCase().includes(q)
    );
  }

  // Sort
  if (currentSort === 'price-asc') {
    list.sort((a, b) => a.price10 - b.price10);
  } else if (currentSort === 'price-desc') {
    list.sort((a, b) => b.price10 - a.price10);
  } else if (currentSort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

// Render Cakes Grid
function renderCakes() {
  if (!catalogGrid) return;
  const cakes = getFilteredCakes();

  if (cakes.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="ri-search-line" style="font-size: 3rem; color: var(--gold-accent); margin-bottom: 12px; display: block;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 8px;">No cakes found matching your search</h3>
        <p>Try searching for chocolate, fruit, truffles, or reset filters.</p>
        <button type="button" class="btn-shop-now" style="margin-top: 18px;" id="resetFilterBtn">View All 24 Cakes</button>
      </div>
    `;
    const resetBtn = document.getElementById('resetFilterBtn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        activeCategory = 'all';
        currentSearch = '';
        if (searchInput) searchInput.value = '';
        filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
        renderCakes();
      };
    }
    return;
  }

  catalogGrid.innerHTML = cakes.map(cake => {
    const selectedWeight = selectedWeights[cake.id] || '1.0 KG';
    const livePrice = getPriceForWeight(cake, selectedWeight);

    return `
      <article class="cake-grid-card" data-id="${cake.id}">
        <div class="card-top-visual" data-action="open-modal" data-id="${cake.id}">
          <img src="${cake.image}" alt="${cake.name}" loading="lazy">
          <span class="card-badge ${cake.badgeClass}">${cake.badge}</span>
          <span class="quick-view-hint"><i class="ri-eye-line"></i> Quick View</span>
        </div>

        <div class="card-content-body">
          <div class="card-category-eyebrow">${cake.categoryLabel}</div>
          <h3 class="card-cake-title" data-action="open-modal" data-id="${cake.id}">${cake.name}</h3>
          <p class="card-tagline">${cake.tagline}</p>

          <!-- Weight Pills -->
          <div class="weight-selector-row" data-id="${cake.id}">
            <button type="button" class="weight-pill ${selectedWeight === '0.5 KG' ? 'selected' : ''}" data-weight="0.5 KG">0.5 KG</button>
            <button type="button" class="weight-pill ${selectedWeight === '1.0 KG' ? 'selected' : ''}" data-weight="1.0 KG">1.0 KG</button>
            <button type="button" class="weight-pill ${selectedWeight === '2.0 KG' ? 'selected' : ''}" data-weight="2.0 KG">2.0 KG</button>
          </div>

          <!-- Price & Action Row -->
          <div class="card-price-action-row">
            <div class="card-live-price" id="price-${cake.id}">₹${livePrice}</div>
            <div class="card-action-btns">
              <button type="button" class="btn-card-cart" data-id="${cake.id}" aria-label="Add ${cake.name} to Cart">
                <i class="ri-shopping-bag-3-line"></i>
                <span>Add</span>
              </button>
              <a href="https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery, I would like to order ${selectedWeight} ${cake.name} (₹${livePrice})`)}" 
                 target="_blank" class="btn-card-wa" title="Order on WhatsApp">
                <i class="ri-whatsapp-fill"></i>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  bindCardEvents();
}

// Bind Card Click Events
function bindCardEvents() {
  // Weight Pill selection
  document.querySelectorAll('.weight-pill').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const parent = btn.closest('.weight-selector-row');
      const cakeId = parent.dataset.id;
      const weight = btn.dataset.weight;
      selectedWeights[cakeId] = weight;

      parent.querySelectorAll('.weight-pill').forEach(p => p.classList.remove('selected'));
      btn.classList.add('selected');

      const cake = ALL_CAKES.find(c => c.id === cakeId);
      if (cake) {
        const priceEl = document.getElementById(`price-${cake.id}`);
        if (priceEl) priceEl.textContent = `₹${getPriceForWeight(cake, weight)}`;

        // Update WA link
        const waLink = parent.closest('.cake-grid-card').querySelector('.btn-card-wa');
        if (waLink) {
          waLink.href = `https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery, I would like to order ${weight} ${cake.name} (₹${getPriceForWeight(cake, weight)})`)}`;
        }
      }
    };
  });

  // Add to cart buttons
  document.querySelectorAll('.btn-card-cart').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cakeId = btn.dataset.id;
      const cake = ALL_CAKES.find(c => c.id === cakeId);
      if (!cake) return;

      const weight = selectedWeights[cake.id] || '1.0 KG';
      const unitPrice = getPriceForWeight(cake, weight);

      cart.addItem({
        productId: cake.id,
        productName: `${cake.name} (${weight})`,
        weight: weight,
        unitPrice: unitPrice,
        productImage: cake.image,
        quantity: 1,
        isEggless: cake.isEggless
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.85 }
        });
      } catch (err) {}

      updateHeaderCartBadge();
      showToast(`🎂 Added ${cake.name} (${weight}) to your cart!`);
    };
  });

  // Open Modal trigger
  document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
    el.onclick = () => {
      const cakeId = el.dataset.id;
      const cake = ALL_CAKES.find(c => c.id === cakeId);
      if (cake) openCakeModal(cake);
    };
  });
}

// Open Quick View Modal
function openCakeModal(cake) {
  if (!cakeModalBackdrop || !cakeModalDialog || !cakeModalContent) return;

  const currentWeight = selectedWeights[cake.id] || '1.0 KG';
  const price = getPriceForWeight(cake, currentWeight);

  cakeModalContent.innerHTML = `
    <div class="cake-modal-grid">
      <div class="cake-modal-img-wrap">
        <img src="${cake.image}" alt="${cake.name}">
        <span class="card-badge ${cake.badgeClass}" style="position: absolute; top: 16px; left: 16px;">${cake.badge}</span>
      </div>
      <div class="cake-modal-content">
        <div style="font-size:0.75rem; font-weight:800; color:var(--gold-accent); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
          ${cake.eyebrow} • ${cake.categoryLabel}
        </div>
        <h2 style="font-family:var(--font-serif); font-size:1.85rem; color:var(--text-dark); margin-bottom:10px; line-height:1.2;">
          ${cake.name}
        </h2>
        <p style="color:var(--text-muted); font-size:0.92rem; line-height:1.6; margin-bottom:18px;">
          ${cake.description}
        </p>

        <div style="background:#fdfbf7; border:1px solid var(--border-cream); border-radius:12px; padding:14px 18px; margin-bottom:20px;">
          <div style="font-size:0.8rem; font-weight:700; color:var(--text-dark); margin-bottom:4px;">Ingredients:</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">${cake.ingredients}</div>
          <div style="margin-top:8px; display:flex; gap:14px; font-size:0.82rem; font-weight:700; color:#15803d;">
            <span><i class="ri-checkbox-circle-fill"></i> ${cake.isEggless ? '100% Pure Eggless' : 'Contains Farm Eggs'}</span>
            <span><i class="ri-checkbox-circle-fill"></i> Fresh Daily Bake</span>
          </div>
        </div>

        <!-- Weight Selection in Modal -->
        <div style="margin-bottom:20px;">
          <label style="font-size:0.82rem; font-weight:700; color:var(--text-dark); display:block; margin-bottom:8px;">Choose Cake Size:</label>
          <div style="display:flex; gap:10px;">
            <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '0.5 KG' ? 'selected' : ''}" data-weight="0.5 KG">0.5 KG (₹${cake.price05})</button>
            <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '1.0 KG' ? 'selected' : ''}" data-weight="1.0 KG">1.0 KG (₹${cake.price10})</button>
            <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '2.0 KG' ? 'selected' : ''}" data-weight="2.0 KG">2.0 KG (₹${cake.price20})</button>
          </div>
        </div>

        <!-- Custom Message -->
        <div style="margin-bottom:24px;">
          <label style="font-size:0.82rem; font-weight:700; color:var(--text-dark); display:block; margin-bottom:6px;">Message on Cake (Optional):</label>
          <input type="text" id="modalCakeMessage" placeholder="e.g., Happy Birthday Rahul 🎉" 
                 style="width:100%; padding:10px 14px; border:1.5px solid var(--border-subtle); border-radius:8px; font-size:0.9rem; outline:none;">
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:16px; border-top:1px solid #f1ece4;">
          <div style="font-family:var(--font-serif); font-size:1.6rem; font-weight:800; color:var(--text-dark);" id="modalLivePrice">
            ₹${price}
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" class="btn-shop-now" id="modalAddToCartBtn" style="padding:12px 22px;">
              <i class="ri-shopping-bag-3-line"></i> Add to Cart
            </button>
            <a href="https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery, I would like to order ${currentWeight} ${cake.name} (₹${price})`)}" 
               target="_blank" class="btn-custom-wa-order" style="padding:12px 18px;">
              <i class="ri-whatsapp-fill"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind modal weight buttons
  document.querySelectorAll('.modal-weight-btn').forEach(btn => {
    btn.onclick = () => {
      const w = btn.dataset.weight;
      selectedWeights[cake.id] = w;
      document.querySelectorAll('.modal-weight-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const newPrice = getPriceForWeight(cake, w);
      const priceEl = document.getElementById('modalLivePrice');
      if (priceEl) priceEl.textContent = `₹${newPrice}`;
      renderCakes();
    };
  });

  // Modal Add to cart
  const modalAddBtn = document.getElementById('modalAddToCartBtn');
  if (modalAddBtn) {
    modalAddBtn.onclick = () => {
      const w = selectedWeights[cake.id] || '1.0 KG';
      const msg = document.getElementById('modalCakeMessage')?.value || '';
      const unitPrice = getPriceForWeight(cake, w);

      cart.addItem({
        productId: cake.id,
        productName: `${cake.name} (${w})`,
        weight: w,
        unitPrice: unitPrice,
        productImage: cake.image,
        quantity: 1,
        messageOnCake: msg,
        isEggless: cake.isEggless
      });

      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      } catch (e) {}

      updateHeaderCartBadge();
      closeCakeModal();
      showToast(`🎂 Added ${cake.name} to cart!`);
    };
  }

  cakeModalBackdrop.classList.add('is-open');
  cakeModalDialog.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeCakeModal() {
  if (cakeModalBackdrop) cakeModalBackdrop.classList.remove('is-open');
  if (cakeModalDialog) cakeModalDialog.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Simple Toast Notification
function showToast(msg) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #1c110a;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    margin-bottom: 10px;
    border: 1px solid rgba(217,155,100,0.3);
    animation: fadeIn 0.3s ease;
  `;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  c.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  `;
  document.body.appendChild(c);
  return c;
}

// Attach Event Listeners
function init() {
  updateHeaderCartBadge();
  window.addEventListener('cart:updated', updateHeaderCartBadge);

  // Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderCakes();
    });
  });

  // Category Slice Cards (5 cards in "OUR CATEGORIES")
  document.querySelectorAll('.category-slice-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const cat = card.dataset.category;
      if (cat) {
        activeCategory = cat;
        filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === cat));
        renderCakes();
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderCakes();
    });
  }

  // Sort Select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCakes();
    });
  }

  // Close Modal
  if (cakeModalClose) cakeModalClose.addEventListener('click', closeCakeModal);
  if (cakeModalBackdrop) cakeModalBackdrop.addEventListener('click', closeCakeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCakeModal();
  });

  // Cart button opens drawer or links to main page cart
  const cartBtn = document.getElementById('cakeCartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'index.html#products';
    });
  }

  // Search button focuses search input
  const searchBtn = document.getElementById('cakeSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => searchInput?.focus(), 400);
    });
  }

  // Mobile drawer controls
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const cakeMobileDrawer = document.getElementById('cakeMobileDrawer');
  const cakeDrawerClose = document.getElementById('cakeDrawerClose');
  const cakeDrawerBackdrop = document.getElementById('cakeDrawerBackdrop');

  if (mobileMenuBtn && cakeMobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      cakeMobileDrawer.classList.add('is-open');
    });
    const closeDrawer = () => cakeMobileDrawer.classList.remove('is-open');
    cakeDrawerClose?.addEventListener('click', closeDrawer);
    cakeDrawerBackdrop?.addEventListener('click', closeDrawer);
    cakeMobileDrawer.querySelectorAll('.drawer-nav-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  renderCakes();
}

document.addEventListener('DOMContentLoaded', init);
