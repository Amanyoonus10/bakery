import { ALL_CAKES } from '../data/all_cakes.js';
import { cart } from './cart.js';
import confetti from 'canvas-confetti';

export function initCakesCatalog() {
  const catalogGrid = document.getElementById('cakesCatalogGrid');
  if (!catalogGrid) return;

  let activeCategory = 'all';
  let currentSearch = '';
  let currentSort = 'recommended';
  let selectedWeights = {};

  ALL_CAKES.forEach(c => {
    selectedWeights[c.id] = '1.0 KG';
  });

  const filterPills = document.querySelectorAll('.filter-pill-btn');
  const searchInput = document.getElementById('cakeSearchInput');
  const sortSelect = document.getElementById('cakeSortSelect');
  const cakeModalBackdrop = document.getElementById('cakeModalBackdrop');
  const cakeModalDialog = document.getElementById('cakeModalDialog');
  const cakeModalContent = document.getElementById('cakeModalContent');
  const cakeModalClose = document.getElementById('cakeModalClose');

  function getPriceForWeight(cake, weight) {
    if (weight === '0.5 KG') return cake.price05;
    if (weight === '2.0 KG') return cake.price20;
    return cake.price10;
  }

  function getFilteredCakes() {
    let list = [...ALL_CAKES];

    if (activeCategory !== 'all') {
      if (activeCategory === 'eggless') {
        list = list.filter(c => c.isEggless);
      } else {
        list = list.filter(c => c.category === activeCategory);
      }
    }

    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.ingredients.toLowerCase().includes(q)
      );
    }

    if (currentSort === 'price-asc') {
      list.sort((a, b) => a.price10 - b.price10);
    } else if (currentSort === 'price-desc') {
      list.sort((a, b) => b.price10 - a.price10);
    } else if (currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  function renderCakes() {
    const cakes = getFilteredCakes();

    if (cakes.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted, #6b5d52);">
          <i class="ri-search-line" style="font-size: 3rem; color: #d99b64; margin-bottom: 12px; display: block;"></i>
          <h3 style="font-family: var(--font-serif, Georgia, serif); font-size: 1.5rem; margin-bottom: 8px; color:#20140c;">No cakes found matching your search</h3>
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

  function bindCardEvents() {
    // Weight Pill selection
    catalogGrid.querySelectorAll('.weight-pill').forEach(btn => {
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

          const waLink = parent.closest('.cake-grid-card').querySelector('.btn-card-wa');
          if (waLink) {
            waLink.href = `https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery, I would like to order ${weight} ${cake.name} (₹${getPriceForWeight(cake, weight)})`)}`;
          }
        }
      };
    });

    // Add to cart buttons
    catalogGrid.querySelectorAll('.btn-card-cart').forEach(btn => {
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

        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.85 }
          });
        } catch (err) {}

        if (window.showBakeryToast) {
          window.showBakeryToast(`🎂 Added ${cake.name} (${weight}) to your cart!`);
        }

        // Open cart drawer via standard event
        window.dispatchEvent(new CustomEvent("cart:open"));
      };
    });

    // Open Modal triggers
    catalogGrid.querySelectorAll('[data-action="open-modal"]').forEach(el => {
      el.onclick = () => {
        const cakeId = el.dataset.id;
        const cake = ALL_CAKES.find(c => c.id === cakeId);
        if (cake) openCakeModal(cake);
      };
    });
  }

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
          <div style="font-size:0.75rem; font-weight:800; color:#d99b64; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
            ${cake.eyebrow} • ${cake.categoryLabel}
          </div>
          <h2 style="font-family:var(--font-serif, Georgia, serif); font-size:1.85rem; color:#20140c; margin-bottom:10px; line-height:1.2;">
            ${cake.name}
          </h2>
          <p style="color:#6b5d52; font-size:0.92rem; line-height:1.6; margin-bottom:18px;">
            ${cake.description}
          </p>

          <div style="background:#fdfbf7; border:1px solid rgba(217, 155, 100, 0.25); border-radius:12px; padding:14px 18px; margin-bottom:20px;">
            <div style="font-size:0.8rem; font-weight:700; color:#20140c; margin-bottom:4px;">Ingredients:</div>
            <div style="font-size:0.85rem; color:#6b5d52;">${cake.ingredients}</div>
            <div style="margin-top:8px; display:flex; gap:14px; font-size:0.82rem; font-weight:700; color:#15803d;">
              <span><i class="ri-checkbox-circle-fill"></i> ${cake.isEggless ? '100% Pure Eggless' : 'Contains Farm Eggs'}</span>
              <span><i class="ri-checkbox-circle-fill"></i> Fresh Daily Bake</span>
            </div>
          </div>

          <!-- Weight Selection in Modal -->
          <div style="margin-bottom:20px;">
            <label style="font-size:0.82rem; font-weight:700; color:#20140c; display:block; margin-bottom:8px;">Choose Cake Size:</label>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '0.5 KG' ? 'selected' : ''}" data-weight="0.5 KG">0.5 KG (₹${cake.price05})</button>
              <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '1.0 KG' ? 'selected' : ''}" data-weight="1.0 KG">1.0 KG (₹${cake.price10})</button>
              <button type="button" class="weight-pill modal-weight-btn ${currentWeight === '2.0 KG' ? 'selected' : ''}" data-weight="2.0 KG">2.0 KG (₹${cake.price20})</button>
            </div>
          </div>

          <!-- Custom Message -->
          <div style="margin-bottom:24px;">
            <label style="font-size:0.82rem; font-weight:700; color:#20140c; display:block; margin-bottom:6px;">Message on Cake (Optional):</label>
            <input type="text" id="modalCakeMessage" placeholder="e.g., Happy Birthday Rahul 🎉" 
                   style="width:100%; padding:10px 14px; border:1.5px solid #eae3d9; border-radius:8px; font-size:0.9rem; outline:none; background:#fcf9f4;">
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:16px; border-top:1px solid #f1ece4; flex-wrap:wrap; gap:12px;">
            <div style="font-family:var(--font-serif, Georgia, serif); font-size:1.6rem; font-weight:800; color:#20140c;" id="modalLivePrice">
              ₹${price}
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
              <button type="button" class="btn-hero-primary" id="modalAddToCartBtn" style="padding:11px 22px; cursor:pointer;">
                <i class="ri-shopping-bag-3-line"></i> Add to Cart
              </button>
              <a href="https://wa.me/919447123450?text=${encodeURIComponent(`Hello Keerthi Bakery, I would like to order ${currentWeight} ${cake.name} (₹${price})`)}" 
                 target="_blank" class="btn-custom-wa-order" style="padding:11px 18px; text-decoration:none;">
                <i class="ri-whatsapp-fill"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

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

        closeCakeModal();
        if (window.showBakeryToast) {
          window.showBakeryToast(`🎂 Added ${cake.name} to cart!`);
        }
        // Open cart drawer via standard event
        window.dispatchEvent(new CustomEvent("cart:open"));
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

  // Filter Pills event listeners
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

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderCakes();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCakes();
    });
  }

  // Close Modal handlers
  if (cakeModalClose) cakeModalClose.addEventListener('click', closeCakeModal);
  if (cakeModalBackdrop) cakeModalBackdrop.addEventListener('click', closeCakeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCakeModal();
  });

  // Initial render
  renderCakes();
}
