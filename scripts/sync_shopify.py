import json
import re

with open('src/data/shopify_products.json') as f:
    sh_products = json.load(f)['products']

def get_category(title):
    t = title.lower()
    if 'chip' in t or 'kadukka' in t:
        return 'chips'
    elif 'mixture' in t or 'idiyunni' in t:
        return 'mixtures'
    elif 'muruk' in t or 'chukkappam' in t or 'kozhiyada' in t or 'olavada' in t or 'pottiyappam' in t or 'flaim' in t or 'kadala' in t:
        return 'murukku'
    elif 'upperi' in t or 'kaja' in t or 'sweet' in t or 'manda' in t or 'ghoonthi' in t or 'kari' in t:
        return 'sweets'
    elif 'cake' in t or 'muffin' in t:
        return 'cakes'
    elif 'biscuit' in t or 'rusk' in t or 'burkey' in t or 'cookie' in t or 'kajoor' in t:
        return 'biscuits'
    return 'mixtures'

def get_badge(title, price):
    t = title.lower()
    if 'banana' in t:
        return ('Best Seller 🍌', 'bestseller')
    elif 'special' in t:
        return ('Special Choice ⭐', 'bestseller')
    elif 'ghee' in t or 'royal' in t:
        return ('Ghee Rich 🧈', 'royal')
    elif 'masala' in t or 'spicy' in t:
        return ('Spicy Kick 🌶️', 'spicy')
    elif price <= 40:
        return ('Everyday Snack ✨', 'daily')
    return ('Fresh Made 🌿', 'fresh')

def get_clean_weight(variant, title):
    t = title.lower()
    if 'kozhiyada' in t:
        return '250g'
    w = variant.get('weight', 0)
    u = (variant.get('weight_unit') or 'g').lower()
    if w and w > 0:
        if u in ('kg', 'kilogram', 'kilograms'):
            if w < 1.0:
                return f"{int(round(w * 1000))}g"
            elif w == int(w):
                return f"{int(w)} kg"
            else:
                return f"{w} kg"
        else:
            return f"{int(round(w))}g"
    m = re.search(r'(\d+)\s*(g|gm|kg)\b', t)
    if m:
        num = m.group(1)
        unit = m.group(2).lower()
        if 'k' in unit:
            return f"{num} kg"
        return f"{num}g"
    return '200g'

CUSTOM_VARIANTS = {
    'keerthi-banana-chips': [
        {'label': '200g', 'weight': '200g', 'price': 100, 'shopify_variant_id': 50103692558595, 'default': True},
        {'label': '450g', 'weight': '450g', 'price': 225, 'shopify_variant_id': 50103692558595, 'default': False}
    ],
    'keerthi-tomato-muruk': [
        {'label': '200g', 'weight': '200g', 'price': 48, 'shopify_variant_id': 50161903370499, 'default': True},
        {'label': '500g', 'weight': '500g', 'price': 160, 'shopify_variant_id': 50161903370499, 'default': False}
    ]
}

OPTIMIZED_IMAGES = {
    'keerthi-banana-chips': {
        'image': '/images/products/keerthi_kerala_banana_chips.webp',
        'imageWebp': '/images/products/keerthi_kerala_banana_chips.webp',
        'imageCutout': '/images/products_blum/keerthi_kerala_banana_chips_transparent.png'
    },
    'keerthi-potato-chips': {
        'image': '/images/products/keerthi_potato_chips.webp',
        'imageWebp': '/images/products/keerthi_potato_chips.webp',
        'imageCutout': '/images/products/keerthi_potato_chips.png'
    }
}

new_products = []
new_mapping = {}

def sort_key(p):
    t = p['title'].lower()
    if 'banana chips' in t: return (0, t)
    if 'upperi sweet' in t: return (1, t)
    if 'potato chips' in t: return (2, t)
    if 'butter muruk' in t: return (3, t)
    if 'special mixture' in t: return (4, t)
    if 'jackfruit' in t: return (5, t)
    if 'tapioca' in t: return (6, t)
    return (10, t)

sorted_products = sorted(sh_products, key=sort_key)

for p in sorted_products:
    title = p['title'].strip()
    handle = p.get('handle', re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-'))
    pid = f'keerthi-{handle}'
    
    variant = p['variants'][0]
    vid = variant['id']
    price = int(float(variant['price']))
    
    img = p['images'][0]['src'] if p.get('images') else '/images/card_banana_chips_clean.jpg'
    category = get_category(title)
    badge, badgeClass = get_badge(title, price)
    weight_label = get_clean_weight(variant, title)

    if pid in CUSTOM_VARIANTS:
        prod_variants = CUSTOM_VARIANTS[pid]
        weight_label = prod_variants[0]['label']
        price = prod_variants[0]['price']
    else:
        prod_variants = [
            {
                'label': weight_label,
                'weight': weight_label,
                'price': price,
                'shopify_variant_id': vid,
                'default': True
            }
        ]
    
    opt_img = OPTIMIZED_IMAGES.get(pid, {})
    img_main = opt_img.get('image', img)
    img_webp = opt_img.get('imageWebp', img)
    img_cutout = opt_img.get('imageCutout', img)

    prod_obj = {
        'id': pid,
        'shopify_id': p['id'],
        'shopify_variant_id': vid,
        'slug': handle.replace('-', '_'),
        'name': f'KEERTHI {title.upper()}',
        'title': title,
        'category': category,
        'badge': badge,
        'badgeClass': badgeClass,
        'price': price,
        'unit': weight_label,
        'variants': prod_variants,
        'eyebrow': 'AUTHENTIC MALABAR SPECIALTY',
        'tagline': f'Pure Quality Ingredients • 100% Authentic • {title}',
        'ingredients': 'Selected premium ingredients, cold-pressed oil, aromatic spices, and natural sea salt',
        'description': f'Freshly handcrafted Keerthi {title} prepared with pure ingredients and traditional Malabar craftsmanship.',
        'nutrition': 'Energy: 480 kcal, Protein: 8.5g, Carbohydrates: 54g, Fat: 22g (Per 100g)',
        'tags': [category, handle, 'authentic', 'kerala-bakery', 'malabar'],
        'image': img_main,
        'imageWebp': img_webp,
        'imageCutout': img_cutout,
        'priceText': f'₹{price} / {weight_label}',
        'rating': round(4.82 + ((p['id'] % 17) * 0.01), 2),
        'reviewCount': int(120 + (p['id'] % 280))
    }
    new_products.append(prod_obj)
    
    new_mapping[pid] = {
        'site_name': prod_obj['name'],
        'shopify_title': title,
        'shopify_product_id': p['id'],
        'shopify_variant_id': vid,
        'shopify_price': price,
        'handle': handle
    }

    for v in prod_variants:
        w_slug = re.sub(r'[^a-z0-9]+', '', v['label'].lower())
        new_mapping[f'{pid}-{w_slug}'] = {
            'site_name': f"{prod_obj['name']} ({v['label']})",
            'shopify_title': f"{title} ({v['label']})",
            'shopify_product_id': p['id'],
            'shopify_variant_id': v.get('shopify_variant_id', vid),
            'shopify_price': v['price'],
            'handle': handle
        }

# Also ensure legacy IDs map to their new counterparts so existing links don't break
legacy_aliases = {
    'keerthi-banana-chips': 'keerthi-banana-chips',
    'keerthi-potato-chips': 'keerthi-potato-chips',
    'keerthi-chakka-chips': 'keerthi-jackfruit-chips',
    'keerthi-kolli-chips': 'keerthi-tapioca-chips',
    'keerthi-kolli-chips-masala': 'keerthi-tapioca-chips',
    'keerthi-finger-chips': 'keerthi-potato-chips',
    'keerthi-mixture': 'keerthi-special-mixture',
    'keerthi-sp-mixture': 'keerthi-special-mixture',
    'keerthi-avil-mixture': 'keerthi-avil-mixture',
    'keerthi-butter-murk': 'keerthi-butter-muruk',
    'keerthi-piece-murk': 'keerthi-butter-muruk',
    'keerthi-ring-murk': 'keerthi-ring-muruk',
    'keerthi-masala-murk': 'keerthi-masala-muruk',
    'keerthi-tomato-murk': 'keerthi-tomato-muruk',
    'keerthi-garlic-murk': 'keerthi-dal-muruk',
    'keerthi-upperi-sweet': 'keerthi-upperi-sweet',
    'keerthi-idiyunni': 'keerthi-idiyunni-roasted',
    'keerthi-rusk': 'keerthi-classic-rusk',
    'keerthi-sp-rusk': 'keerthi-special-rusk',
    'keerthi-burkey': 'keerthi-burkey'
}

for old_id, new_id in legacy_aliases.items():
    if new_id in new_mapping and old_id not in new_mapping:
        new_mapping[old_id] = new_mapping[new_id]

products_code = 'export const PRODUCTS = ' + json.dumps(new_products, indent=2) + ';\n\n'
products_code += '''export const ADDONS = [
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
'''

with open('src/data/products.js', 'w') as f:
    f.write(products_code)

with open('src/data/shopify_mapping.json', 'w') as f:
    json.dump(new_mapping, f, indent=2)

with open('src/data/shopify_mapping.js', 'w') as f:
    f.write('export const shopifyMapping = ' + json.dumps(new_mapping, indent=2) + ';\nexport default shopifyMapping;\n')

print(f'Sync complete! {len(new_products)} products saved to products.js and shopify_mapping.js.')

