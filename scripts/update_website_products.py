import json
import re

# Load all 55 processed products
with open('/Users/amanyoonus/Desktop/bakery/src/data/blum_products_data.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from blum_products_data.json")

# 1. Generate src/data/products.js
products_js_content = "export const PRODUCTS = " + json.dumps(products, indent=2, ensure_ascii=False) + ";\n\n"

products_js_content += """export const ADDONS = [
  { id: "keerthi-spicy-tapioca", name: "Crispy Masala Tapioca Chips (100g)", price: 45, icon: "🌶️" },
  { id: "keerthi-sweet-kaja", name: "Sweet Marayoor Kaja Diamond (120g)", price: 49, icon: "🍯" },
  { id: "keerthi-kai-murukku", name: "Handcrafted Rice Kai Murukku (100g)", price: 40, icon: "🥨" },
  { id: "keerthi-butter-rusk", name: "Keerthi Malabar Cardamom Rusk (120g)", price: 45, icon: "☕" }
];

export const CATEGORIES = [
  { id: "all", name: "All Products", icon: "✨" },
  { id: "chips", name: "Banana & Tapioca Chips", icon: "🍌" },
  { id: "mixtures", name: "Kerala Mixtures & Sev", icon: "🔥" },
  { id: "murukku", name: "Murukku & Savouries", icon: "🥨" },
  { id: "sweets", name: "Traditional Sweets", icon: "🍯" },
  { id: "biscuits", name: "Biscuits & Rusks", icon: "🍪" },
  { id: "cakes", name: "Oven Fresh Bakes", icon: "🧁" }
];
"""

with open('/Users/amanyoonus/Desktop/bakery/src/data/products.js', 'w', encoding='utf-8') as f:
    f.write(products_js_content)
print("Updated /Users/amanyoonus/Desktop/bakery/src/data/products.js")

# 2. Generate coverflow cards HTML for index.html
cards_html_parts = []
for p in products:
    badge_html = f'<span class="badge {p["badgeClass"]}">{p["badge"]}</span>' if p["badge"] else ''
    card_html = f'''            <!-- {p["name"]} -->
            <li class="product-carousel-item" data-id="{p["id"]}" data-name="{p["name"]}" data-ingredients="{p["ingredients"]}" data-eyebrow="{p["eyebrow"]}" data-tagline="{p["tagline"]}" data-price="₹{p["price"]}" data-badge="{p["badge"]}" data-badge-class="{p["badgeClass"]}" data-category="{p["category"]}" data-img="{p["image"]}">
              <article class="product-card" tabindex="0" role="button" aria-label="View {p["name"]} details">
                <div class="product-img-wrap">
                  <img src="{p["image"]}" alt="{p["name"]}" loading="lazy" />
                  {badge_html}
                </div>
                <div class="product-info">
                  <h3>{p["name"]}</h3>
                  <p><strong>Ingredients:</strong> {p["ingredients"]}</p>
                  <div class="product-footer">
                    <span class="price">₹{p["price"]}</span>
                    <span class="tap-hint"><i class="ri-hand-coin-line"></i> Tap to explore</span>
                  </div>
                </div>
              </article>
            </li>'''
    cards_html_parts.append(card_html)

new_cards_inner_html = "\n" + "\n".join(cards_html_parts) + "\n          "

# Read index.html
with open('/Users/amanyoonus/Desktop/bakery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace <ul class="cards" id="coverflowCards">...</ul>
pattern = r'(<ul class="cards" id="coverflowCards">)(.*?)(</ul>)'
match = re.search(pattern, html, flags=re.DOTALL)
if match:
    html = html[:match.start(2)] + new_cards_inner_html + html[match.end(2):]
    print("Replaced coverflow cards in index.html")
else:
    print("ERROR: Could not find coverflowCards ul in index.html")

# Update 47 counts to 55 in index.html
html = html.replace('All Snacks (47)', 'All Snacks (55)')
html = html.replace('Search 47 snacks...', 'Search 55 snacks...')
html = html.replace('47 items', '55 items')
html = html.replace('47 Snacks', '55 Snacks')
html = html.replace('47 freshly prepared', '55 freshly prepared')
html = html.replace('all 47 Kerala snacks', 'all 55 Kerala snacks')
html = html.replace('All 47 Products', 'All 55 Products')
html = html.replace('all 47 authentic Kerala snacks', 'all 55 authentic Kerala snacks')

# Add "Oven Fresh Bakes" category chip if not present
if 'data-category="cakes"' not in html:
    html = html.replace(
        '<button type="button" class="category-chip" data-category="biscuits">Biscuits &amp; Rusks</button>',
        '<button type="button" class="category-chip" data-category="biscuits">Biscuits &amp; Rusks</button>\n            <button type="button" class="category-chip" data-category="cakes">Oven Fresh Bakes</button>'
    )
    print("Added cakes category chip to index.html")

with open('/Users/amanyoonus/Desktop/bakery/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated /Users/amanyoonus/Desktop/bakery/index.html")

# 3. Update src/js/all-products-view.js
with open('/Users/amanyoonus/Desktop/bakery/src/js/all-products-view.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Make sure all-products-view reads data-category directly if available
js = js.replace(
    'const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");\n\n    // Category detection heuristic',
    'const id = li.dataset.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");\n    const explicitCat = li.dataset.category;\n\n    // Category detection heuristic'
)

js = js.replace(
    'let category = "murukku";',
    'let category = explicitCat || "murukku";\n    if (!explicitCat) {'
)

js = js.replace(
    'category = "biscuits";\n    }',
    'category = "biscuits";\n    }\n    }'
)

# Replace 47 text references with 55
js = js.replace('47 products', '55 products')
js = js.replace('47 Products', '55 Products')
js = js.replace('47 Snacks', '55 Snacks')
js = js.replace('47 authentic Kerala snacks', '55 authentic Kerala snacks')
js = js.replace('47 freshly prepared', '55 freshly prepared')

with open('/Users/amanyoonus/Desktop/bakery/src/js/all-products-view.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated /Users/amanyoonus/Desktop/bakery/src/js/all-products-view.js")
print("All updates applied successfully!")
