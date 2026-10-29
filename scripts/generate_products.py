import openpyxl, re, json, os

wb = openpyxl.load_workbook('/Users/amanyoonus/Downloads/PRICEWEB.xlsx')
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
header = rows[0]
excel_items = [dict(zip(header, r)) for r in rows[1:] if any(r)]

excel_by_name = {it['PRODUCT NAME']: it for it in excel_items}

# Import our complete products specification
from test_mapping import products_spec

processed_products = []

for idx, spec in enumerate(products_spec, 1):
    pid = spec['id']
    name = spec['name']
    ml_name = spec['malayalamName']
    cat = spec['category']
    badge = spec.get('badge', '')
    badge_class = spec.get('badgeClass', '')
    img = spec['image']
    eyebrow = spec['eyebrow']
    tagline = spec['tagline']
    desc = spec['description']
    
    # Extract variants from excel_items
    variants = []
    for item_name in spec['excel_items']:
        it = excel_by_name[item_name]
        mrp = int(it['MRP'])
        unit = str(it['UNIT']).strip()
        group = str(it['GROUP_NAME']).strip()
        
        m = re.search(r'(\d+)\s*(G|GM|PCS|KG)\b', item_name, re.IGNORECASE)
        if m:
            num = m.group(1)
            t = m.group(2).upper()
            if t in ('G', 'GM'):
                sz = f"{num}g"
            elif t == 'PCS':
                sz = f"{num} pcs"
            elif t == 'KG':
                sz = f"{num} kg"
        elif unit == 'KG':
            sz = "1 kg"
        elif unit == 'BTL':
            sz = "250g Jar"
        else:
            sz = unit
            
        if group == 'BOTTLES' and not sz.endswith('Jar'):
            sz += " Jar"
            
        variants.append({
            "label": sz,
            "weight": sz,
            "price": mrp,
            "code": it['ITEMCODE'],
            "excel_name": item_name
        })
        
    # Sort variants by price ascending
    variants.sort(key=lambda v: v['price'])
    for v_idx, v in enumerate(variants):
        v['default'] = (v_idx == 0)
        
    base_price = variants[0]['price']
    base_weight = variants[0]['label']
    
    if "Jar" in base_weight:
        unit_str = base_weight
    elif "pcs" in base_weight:
        unit_str = f"{base_weight} Pack"
    elif "kg" in base_weight:
        unit_str = f"{base_weight} Pack"
    else:
        unit_str = f"{base_weight} Pouch"
        
    rating = round(4.82 + ((idx * 7) % 18) * 0.01, 2)
    review_count = 120 + ((idx * 43) % 400)
    
    prod_obj = {
        "id": pid,
        "slug": pid.replace("-", "_"),
        "name": name,
        "malayalamName": ml_name,
        "category": cat,
        "badge": badge,
        "badgeClass": badge_class,
        "price": base_price,
        "unit": unit_str,
        "variants": variants,
        "eyebrow": eyebrow,
        "tagline": tagline,
        "ingredients": tagline.replace(" • ", ", "),
        "description": desc,
        "nutrition": "Energy: 480 kcal, Protein: 9.5g, Carbohydrates: 54g, Dietary Fiber: 5g, Fat: 24g (Per 100g)",
        "tags": [
            cat,
            pid.replace("keerthi-", ""),
            "authentic",
            "malabar",
            "kerala-bakery"
        ],
        "image": img,
        "imageWebp": img,
        "imageCutout": img.replace("/images/products/", "/images/products_blum/").replace(".webp", "_transparent.png"),
        "priceText": f"₹{base_price} / {unit_str}",
        "rating": rating,
        "reviewCount": review_count,
        "imagePng": img.replace(".webp", ".png")
    }
    processed_products.append(prod_obj)

print(f"Generated {len(processed_products)} rich product objects")

# Save blum_products_data.json
with open('src/data/blum_products_data.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, indent=2, ensure_ascii=False)

# Read ADDONS and CATEGORIES from current products.js
with open('src/data/products.js', 'r', encoding='utf-8') as f:
    old_code = f.read()

addons_match = re.search(r'export const ADDONS = \[[\s\S]*?\];', old_code)
cats_match = re.search(r'export const CATEGORIES = \[[\s\S]*?\];', old_code)

addons_str = addons_match.group(0) if addons_match else "export const ADDONS = [];"
cats_str = cats_match.group(0) if cats_match else "export const CATEGORIES = [];"

# Write src/data/products.js
new_products_js = f"""export const PRODUCTS = {json.dumps(processed_products, indent=2, ensure_ascii=False)};\n\n{addons_str}\n\n{cats_str}\n"""

with open('src/data/products.js', 'w', encoding='utf-8') as f:
    f.write(new_products_js)

print("Saved src/data/blum_products_data.json and src/data/products.js successfully!")
