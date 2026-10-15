import re

with open("index.html") as f:
    html = f.read()

with open("public/processed_snacks.html") as f:
    snacks_cards = f.read().strip()

# 1. Update <head> to include GSAP, ScrollTrigger, Draggable
gsap_scripts = """  <!-- GSAP 3 & Plugins for Coverflow & Animations -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js"></script>
"""
if "gsap.min.js" not in html:
    html = html.replace('<link rel="stylesheet" href="/src/style.css">', gsap_scripts + '\n  <link rel="stylesheet" href="/src/style.css">')

# 2. Exact Hero Section matching Screenshot 2
hero_markup = """  <!-- ==========================================================================
       HERO SECTION (#home, .hero) — EXACT APSARA BAKES LAYOUT (SCREENSHOT 2)
       ========================================================================== -->
  <section class="hero" id="home">
    <!-- Top-Left Animated Text Loader ("Taste the Best" - Equalizer bar animation) -->
    <div class="loader-wrapper top-left-loader">
      <span class="loader-letter">T</span>
      <span class="loader-letter">a</span>
      <span class="loader-letter">s</span>
      <span class="loader-letter">t</span>
      <span class="loader-letter">e</span>
      <span class="loader-letter">&nbsp;</span>
      <span class="loader-letter">t</span>
      <span class="loader-letter">h</span>
      <span class="loader-letter">e</span>
      <span class="loader-letter">&nbsp;</span>
      <span class="loader-letter">B</span>
      <span class="loader-letter">e</span>
      <span class="loader-letter">s</span>
      <span class="loader-letter">t</span>
      <div class="loader"></div>
    </div>

    <div class="container hero-container">
      <!-- Left Column: Mayan/Peekay Brand Logo Display -->
      <div class="hero-logo-wrap">
        <img src="/keerthi_hero_logo.png" alt="Peekay's Keerthi Bakes Logo" class="hero-logo-img" id="heroLogoImg" />
      </div>

      <!-- Right Column: Product Pouch Presentation (User Uploaded Pouch) -->
      <div class="hero-product-wrap" id="heroProductWrap" title="Click to celebrate fresh Kerala bakes!">
        <div class="hero-click-me-callout">
          <div class="uiverse-btn-container">
            <label class="uiverse-label" for="uiverseSwitchInput">
              <input type="checkbox" class="uiverse-input" id="uiverseSwitchInput" />
              <span class="uiverse-circle">
                <svg class="uiverse-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19V5m0 14-4-4m4 4 4-4"></path>
                </svg>
                <div class="uiverse-square"></div>
              </span>
              <p class="uiverse-title">Click Me</p>
              <p class="uiverse-title">Fresh Bakes 🎉</p>
            </label>
          </div>
        </div>

        <img src="/images/keerthi_banana_chips_pouch.jpg" alt="Keerthi Authentic Kerala Banana Chips" class="hero-product-img" id="heroProductImg" />
      </div>
    </div>

    <!-- Interactive Welcome & Scroll Down Button -->
    <div class="hero-scroll-btn-wrap">
      <button class="button hero-welcome-btn" id="heroWelcomeBtn" aria-label="Welcome - Scroll Down to Explore">
        <span class="hero-pulse-dot"></span>
        <span class="svgIcon-wrap">
          <svg class="svgIcon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
          </svg>
        </span>
        <span class="hero-btn-content" id="heroBtnContent">
          <span class="hero-btn-state state-welcome">
            <i class="ri-hand-heart-line"></i> Hai, Welcome!
            <svg class="svgBestSymbol" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
            </svg>
          </span>
          <span class="hero-btn-state state-scroll" style="display:none;">
            <i class="ri-arrow-down-line"></i> Scroll Down ★
          </span>
        </span>
      </button>
    </div>
  </section>"""

html = re.sub(r'<!-- ===+\s*HERO SECTION.*?<!-- ===+\s*TRUST & HYGIENE BAR', hero_markup + '\n\n  <!-- ==========================================================================\n       TRUST & HYGIENE BAR', html, flags=re.DOTALL)

# 3. Exact Products Section matching Screenshot 1
products_markup = f"""  <!-- ==========================================================================
       PRODUCTS SECTION (#products, .products-section) — 3D COVERFLOW (SCREENSHOT 1)
       ========================================================================== -->
  <section class="products-section" id="products">
    <!-- Bouncy SVG Section Divider -->
    <div class="bouncy-divider-wrap">
      <svg class="bouncy-svg" preserveAspectRatio="none" viewBox="0 0 2278 683">
        <path class="bouncy-path" fill="currentColor" d="M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z"/>
      </svg>
    </div>

    <div class="container">
      <!-- Section Header -->
      <div class="section-header">
        <p class="section-eyebrow">OUR PRODUCTS</p>
        <h2>Crispy. Natural. <em>Irresistible.</em></h2>
        <p class="section-sub">Handcrafted in small batches for maximum freshness and flavour.</p>

        <!-- Category Switcher Bar (Savouries & Snacks vs Artisanal Cakes) -->
        <div class="category-switcher-bar" id="catalogCategorySwitcher">
          <button class="category-tab-btn active" data-cat="snacks" id="catBtnSnacks">
            <div class="tab-thumb-wrap">
              <img src="/apsara_imgs/BANANA CHIPS-COCONUT OIL.png" alt="Savouries &amp; Snacks" onerror="this.src='/images/keerthi_banana_chips_pouch.jpg'" />
            </div>
            <div class="tab-text-wrap">
              <span class="tab-title">Savouries &amp; Snacks</span>
              <span class="tab-subtitle">48 Malabar Products</span>
            </div>
          </button>

          <button class="category-tab-btn" data-cat="cakes" id="catBtnCakes">
            <div class="tab-thumb-wrap">
              <img src="/apsara_imgs/CHOCO TRUFFLE.png" alt="Artisanal Cakes" onerror="this.src='/images/tender_coconut_cake.jpg'" />
            </div>
            <div class="tab-text-wrap">
              <span class="tab-title">Artisanal Cakes</span>
              <span class="tab-subtitle">20 Gourmet Flavours</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Product Description Modal -->
      <div class="product-modal-overlay" id="productModal" role="dialog" aria-modal="true" aria-label="Product details">
        <div class="product-modal">
          <button class="product-modal-close" id="productModalClose" aria-label="Close"><i class="ri-close-line"></i></button>
          <div class="product-modal-img-wrap">
            <img src="" alt="" class="product-modal-img" id="productModalImg" />
            <span class="product-modal-badge" id="productModalBadge"></span>
          </div>
          <div class="product-modal-body">
            <p class="product-modal-eyebrow" id="productModalEyebrow"></p>
            <h2 class="product-modal-name" id="productModalName"></h2>
            <p class="product-modal-tagline" id="productModalTagline"></p>
            <div class="product-modal-desc" id="productModalDesc"></div>
            <div class="product-modal-footer">
              <span class="product-modal-price" id="productModalPrice"></span>
              <button type="button" class="btn-modal-order" id="productModalAddToCart" style="margin-left:auto; background:#12002e; color:#fff; padding:10px 22px; border-radius:50px; font-weight:800; font-size:0.9rem; cursor:pointer;">
                Add to Bag <i class="ri-shopping-bag-3-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3D Coverflow Gallery Container -->
      <div class="gallery-container">
        <div class="gallery">
          <ul class="cards" id="coverflowCards">
{snacks_cards}
          </ul>
          <div class="actions">
            <button class="prev" id="carouselPrev" aria-label="Previous"><i class="ri-arrow-left-s-line"></i></button>
            <button class="next" id="carouselNext" aria-label="Next"><i class="ri-arrow-right-s-line"></i></button>
          </div>
          <div class="drag-proxy"></div>
        </div>
      </div>
    </div>
  </section>"""

html = re.sub(r'<!-- ===+\s*PRODUCTS SECTION.*?<!-- ===+\s*OUR OUTLETS SECTION', products_markup + '\n\n  <!-- ==========================================================================\n       OUR OUTLETS SECTION', html, flags=re.DOTALL)

# 4. Social Circular Floating Widget
social_markup = """  <!-- ==========================================================================
       INTERACTIVE 4-QUADRANT CIRCULAR SOCIAL WIDGET (Praashoo7 Uiverse)
       ========================================================================== -->
  <div class="social-circular-widget" id="socialCircularWidget">
    <div class="main">
      <div class="up">
        <button class="card1" aria-label="Instagram" onclick="window.open('https://www.instagram.com/keerthibakery/', '_blank')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="instagram"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </button>
        <button class="card2" aria-label="Facebook" onclick="window.open('https://www.facebook.com/keerthibakery/', '_blank')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </button>
      </div>
      <div class="down">
        <button class="card3" aria-label="WhatsApp" onclick="window.open('https://wa.me/919447123450?text=Hello%20Keerthi%20Bakery', '_blank')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="whatsapp"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </button>
        <button class="card4" aria-label="YouTube" onclick="window.open('https://www.youtube.com/@keerthibakery', '_blank')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="youtube"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </button>
      </div>
    </div>
  </div>
"""

if "social-circular-widget" not in html:
    html = html.replace('</body>', social_markup + '\n</body>')

with open("index.html", "w") as f:
    f.write(html)

print("Updated index.html successfully! New size:", len(html))
