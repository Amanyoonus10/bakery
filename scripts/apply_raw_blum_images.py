import glob
import os
import json
import re
import shutil

BLUM_SRC = "/Users/amanyoonus/Desktop/bakery/blum"
PUBLIC_BLUM = "/Users/amanyoonus/Desktop/bakery/public/images/blum"
os.makedirs(PUBLIC_BLUM, exist_ok=True)

# 1. Copy all 55 original images into public/images/blum/
raw_files = sorted(glob.glob(os.path.join(BLUM_SRC, "*.jpg")))
print(f"Found {len(raw_files)} raw images in {BLUM_SRC}")

for f in raw_files:
    dest = os.path.join(PUBLIC_BLUM, os.path.basename(f))
    shutil.copy2(f, dest)

print(f"Copied all {len(raw_files)} raw unedited images to {PUBLIC_BLUM}")

# 2. Update blum_products_data.json with raw image paths
with open('/Users/amanyoonus/Desktop/bakery/src/data/blum_products_data.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for idx, p in enumerate(products):
    if idx < len(raw_files):
        fname = os.path.basename(raw_files[idx])
        p['image'] = f"/images/blum/{fname}"
        p['imageWebp'] = f"/images/blum/{fname}"
        p['rawFileName'] = fname

with open('/Users/amanyoonus/Desktop/bakery/src/data/blum_products_data.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)
print("Updated blum_products_data.json")

# 3. Update src/data/products.js
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
print("Updated src/data/products.js")

# 4. Update index.html coverflow cards
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

with open('/Users/amanyoonus/Desktop/bakery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'(<ul class="cards" id="coverflowCards">)(.*?)(</ul>)'
match = re.search(pattern, html, flags=re.DOTALL)
if match:
    html = html[:match.start(2)] + new_cards_inner_html + html[match.end(2):]
    print("Replaced coverflow cards in index.html with raw blum images")
else:
    print("ERROR: coverflowCards not found in index.html")

with open('/Users/amanyoonus/Desktop/bakery/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")
