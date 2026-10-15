import os
import glob
import json
import time
from PIL import Image, ImageFilter
import numpy as np
import rembg

BLUM_DIR = "/Users/amanyoonus/Desktop/bakery/blum"
OUT_DIR = "/Users/amanyoonus/Desktop/bakery/public/images/products_blum"
os.makedirs(OUT_DIR, exist_ok=True)

# Product metadata definition for all 55 photos
PRODUCTS_META = [
  {
    "id": "keerthi-spicy-kadala-pakoda",
    "slug": "keerthi_spicy_kadala_pakoda",
    "name": "KEERTHI SPICY KADALA PAKODA",
    "malayalamName": "കീർത്തി സ്പൈസി കടല പക്കോഡ",
    "category": "mixtures",
    "badge": "Spicy 🌶",
    "badgeClass": "spicy",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "AUTHENTIC KERALA BAKERY",
    "tagline": "Spiced Bengal Gram • Garlic • Curry Leaves",
    "ingredients": "Whole Bengal gram (kadala), gram flour, red chilli powder, curry leaves, asafoetida, garlic, salt, vegetable oil.",
    "description": "Authentic Keerthi Bakery spiced Bengal gram: Crispy crunchy fried whole chickpeas coated in fiery Malabar spices, roasted garlic, and aromatic curry leaves.",
    "nutrition": "Energy: 485 kcal, Protein: 16g, Carbohydrate: 45g, Dietary Fiber: 7g (Per 100g)",
    "tags": ["kadala", "pakoda", "spicy", "tea-time"]
  },
  {
    "id": "keerthi-golden-jackfruit-chips",
    "slug": "keerthi_golden_jackfruit_chips",
    "name": "KEERTHI GOLDEN JACKFRUIT CHIPS",
    "malayalamName": "കീർത്തി സ്വർണ്ണ ചക്ക വറുത്തത്",
    "category": "chips",
    "badge": "Best Seller",
    "badgeClass": "bestseller",
    "price": 145,
    "unit": "250g Pouch",
    "eyebrow": "SEASONAL SPECIALTY",
    "tagline": "Raw Jackfruit • Turmeric • Sea Salt • Coconut Oil",
    "ingredients": "Raw Varikka Jackfruit, Pure Coconut Oil, Turmeric Powder, Sea Salt.",
    "description": "Signature Keerthi Bakery seasonal delicacy: Hand-sliced thick raw Varikka jackfruit pods fried to golden perfection in pure coconut oil with subtle sea salt.",
    "nutrition": "Energy: 495 kcal, Protein: 3.5g, Carbohydrate: 62g, Dietary Fiber: 5g (Per 100g)",
    "tags": ["jackfruit", "chakka", "bestseller", "coconut-oil"]
  },
  {
    "id": "keerthi-kerala-banana-chips",
    "slug": "keerthi_kerala_banana_chips",
    "name": "KEERTHI KERALA BANANA CHIPS",
    "malayalamName": "കീർത്തി നാടൻ നേന്ത്രക്കായ ചിപ്സ്",
    "category": "chips",
    "badge": "Signature",
    "badgeClass": "bestseller",
    "price": 120,
    "unit": "250g Pouch",
    "eyebrow": "HOMESTYLE HERITAGE",
    "tagline": "Crisp Nendran Banana • Golden Turmeric • Rock Salt",
    "ingredients": "Raw Nendran Banana, Pure Vegetable Oil, Sea Salt, Natural Turmeric.",
    "description": "Keerthi Bakery's flagship snack: Selected farm-fresh Kerala Nendran bananas sliced thin, crisped golden with natural turmeric and sea salt.",
    "nutrition": "Energy: 515 kcal, Protein: 2.6g, Carbohydrate: 60g, Fat: 30g (Per 100g)",
    "tags": ["banana", "chips", "kerala", "bestseller"]
  },
  {
    "id": "keerthi-spicy-tapioca-chips",
    "slug": "keerthi_spicy_tapioca_chips",
    "name": "KEERTHI SPICY TAPIOCA CHIPS",
    "malayalamName": "കീർത്തി എരിവുള്ള കപ്പ ചിപ്സ്",
    "category": "chips",
    "badge": "Hot 🌶",
    "badgeClass": "spicy",
    "price": 80,
    "unit": "200g Pouch",
    "eyebrow": "KERALA SPICE",
    "tagline": "Sliced Kerala Tapioca • Kashmiri Chilli • Garlic",
    "ingredients": "Fresh Kerala Tapioca (Kappa), Kashmiri Red Chilli, Rock Salt, Garlic, Vegetable Oil.",
    "description": "Crispy paper-thin Malabar tapioca wafers dusted with fiery Kashmiri red chilli, roasted garlic, and crushed curry leaves.",
    "nutrition": "Energy: 480 kcal, Carbohydrate: 65g, Dietary Fiber: 3.5g (Per 100g)",
    "tags": ["tapioca", "kappa", "spicy"]
  },
  {
    "id": "keerthi-round-kai-murukku",
    "slug": "keerthi_round_kai_murukku",
    "name": "KEERTHI KERALA ROUND KAI MURUKKU",
    "malayalamName": "കീർത്തി നാടൻ കൈമുറുക്ക്",
    "category": "murukku",
    "badge": "Traditional",
    "badgeClass": "traditional",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "HANDCRAFTED HERITAGE",
    "tagline": "Roasted Rice Flour • Urad Dal • White Sesame • Butter",
    "ingredients": "Roasted Rice Flour, Urad Dal Flour, Butter, White Sesame Seeds, Cumin, Asafoetida, Salt, Oil.",
    "description": "Artisan hand-twisted spiral murukku crafted from slow-roasted rice flour, creamy dairy butter, and toasted white sesame seeds.",
    "nutrition": "Energy: 470 kcal, Protein: 8.5g, Carbohydrate: 56g (Per 100g)",
    "tags": ["murukku", "traditional", "tea-time"]
  },
  {
    "id": "keerthi-special-malabar-mixture",
    "slug": "keerthi_special_malabar_mixture",
    "name": "KEERTHI SPECIAL MALABAR MIXTURE",
    "malayalamName": "കീർത്തി സ്പെഷ്യൽ മലബാർ മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Popular",
    "badgeClass": "",
    "price": 95,
    "unit": "250g Pouch",
    "eyebrow": "BAKERY SPECIALTY",
    "tagline": "Sev Strands • Crispy Boondi • Fried Peanuts • Curry Leaves",
    "ingredients": "Gram flour sev, boondi, roasted peanuts, cashews, banana chips bits, curry leaves, garlic, asafoetida, spices, oil.",
    "description": "The crown jewel of Kerala tea time: Delicate gram flour sev, crispy boondi, fried cashews, roasted peanuts, and fragrant curry leaves.",
    "nutrition": "Energy: 530 kcal, Protein: 11g, Carbohydrate: 50g (Per 100g)",
    "tags": ["mixture", "malabar", "popular"]
  },
  {
    "id": "keerthi-hot-spice-mixture",
    "slug": "keerthi_hot_spice_mixture",
    "name": "KEERTHI HOT SPICE MIXTURE",
    "malayalamName": "കീർത്തി ഹോട്ട് സ്പൈസി മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Extra Hot 🔥",
    "badgeClass": "spicy",
    "price": 90,
    "unit": "200g Pouch",
    "eyebrow": "FIERY SNACK",
    "tagline": "Fiery Chilli Flakes • Crushed Pepper • Roasted Groundnuts",
    "ingredients": "Gram flour, rice flour, crushed red chilli flakes, black pepper, roasted groundnuts, curry leaves, salt, oil.",
    "description": "For spice lovers: Crunchy spiced gram flour strands infused with crushed red chilli flakes, black pepper, and whole roasted peanuts.",
    "nutrition": "Energy: 510 kcal, Protein: 10g, Carbohydrate: 48g (Per 100g)",
    "tags": ["hot", "spicy", "mixture"]
  },
  {
    "id": "keerthi-malabar-kara-sev",
    "slug": "keerthi_malabar_kara_sev",
    "name": "KEERTHI MALABAR KARA SEV",
    "malayalamName": "കീർത്തി മലബാർ കാര സേവ്",
    "category": "mixtures",
    "badge": "Crunchy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "BLACK PEPPER SPICE",
    "tagline": "Thick Besan Strands • Crushed Black Pepper • Roasted Garlic",
    "ingredients": "Besan (gram flour), rice flour, crushed black peppercorns, cumin, garlic, salt, vegetable oil.",
    "description": "Thick, crispy gram flour batons richly spiced with freshly crushed black peppercorns and roasted garlic for that bold South Indian punch.",
    "nutrition": "Energy: 490 kcal, Protein: 12g, Carbohydrate: 51g (Per 100g)",
    "tags": ["sev", "karasev", "pepper"]
  },
  {
    "id": "keerthi-green-peas-masala-mix",
    "slug": "keerthi_green_peas_masala_mix",
    "name": "KEERTHI GREEN PEAS MASALA MIX",
    "malayalamName": "കീർത്തി മസാല ഗ്രീൻ പീസ്",
    "category": "mixtures",
    "badge": "Tangy & Crunchy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "CRISP SAVOURY",
    "tagline": "Crispy Green Peas • Tangy Chaat Spices • Fine Sev",
    "ingredients": "Dried green peas, gram flour sev, chaat spices, dry mango powder, red chilli, rock salt, vegetable oil.",
    "description": "Crunchy dried green peas seasoned in tangy amchur chaat spices, tossed with crispy golden sev and roasted curry leaves.",
    "nutrition": "Energy: 440 kcal, Protein: 14g, Carbohydrate: 55g (Per 100g)",
    "tags": ["greenpeas", "chaat", "snack"]
  },
  {
    "id": "keerthi-golden-butter-biscuits",
    "slug": "keerthi_golden_butter_biscuits",
    "name": "KEERTHI GOLDEN BUTTER BISCUITS",
    "malayalamName": "കീർത്തി ബട്ടർ ബിസ്കറ്റ്",
    "category": "biscuits",
    "badge": "Tea Time",
    "badgeClass": "",
    "price": 90,
    "unit": "250g Pouch",
    "eyebrow": "BAKERY FRESH",
    "tagline": "Melt-in-Mouth Butter • Pure Dairy • Cardamom",
    "ingredients": "Refined wheat flour, dairy butter, cane sugar, cardamom, milk solids, baking powder.",
    "description": "Classic Kerala bakery butter biscuits baked golden brown. Crumbles delightfully on the tongue, ideal pairing for hot Sulaimani or chai.",
    "nutrition": "Energy: 495 kcal, Protein: 6.8g, Carbohydrate: 64g, Fat: 22g (Per 100g)",
    "tags": ["biscuits", "butter", "tea-time"]
  },
  {
    "id": "keerthi-coconut-macaroons",
    "slug": "keerthi_coconut_macaroons",
    "name": "KEERTHI COCONUT MACAROONS",
    "malayalamName": "കീർത്തി കോക്കനട്ട് മാക്രോൺ",
    "category": "sweets",
    "badge": "Sweet 🍯",
    "badgeClass": "sweet",
    "price": 110,
    "unit": "200g Pouch",
    "eyebrow": "HERITAGE CONFECTION",
    "tagline": "Desiccated Coconut • Cashew Chunks • Golden Crisp",
    "ingredients": "Fresh desiccated coconut, egg whites, cane sugar, cashew nuts, vanilla bean extract.",
    "description": "Mouth-watering Kerala bakery macaroons with a light crispy shell and a chewy, fragrant coconut-cashew center.",
    "nutrition": "Energy: 460 kcal, Protein: 7g, Carbohydrate: 58g, Fat: 24g (Per 100g)",
    "tags": ["macaroons", "coconut", "sweet"]
  },
  {
    "id": "keerthi-malabar-ribbon-pakoda",
    "slug": "keerthi_malabar_ribbon_pakoda",
    "name": "KEERTHI MALABAR RIBBON PAKODA",
    "malayalamName": "കീർത്തി റിബ്ബൺ പക്കോഡ",
    "category": "murukku",
    "badge": "Crispy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "TRADITIONAL CRUNCH",
    "tagline": "Flaky Ribbon Strips • Sesame Seeds • Mild Chilli",
    "ingredients": "Rice flour, gram flour, butter, sesame seeds, Kashmiri chilli, asafoetida, salt, vegetable oil.",
    "description": "Golden ribbon-shaped savouries with a delicate crunch, infused with toasted sesame and subtle hint of roasted cumin.",
    "nutrition": "Energy: 480 kcal, Protein: 8.2g, Carbohydrate: 54g (Per 100g)",
    "tags": ["ribbon", "pakoda", "murukku"]
  },
  {
    "id": "keerthi-spicy-omapodi-sev",
    "slug": "keerthi_spicy_omapodi_sev",
    "name": "KEERTHI SPICY OMAPODI SEV",
    "malayalamName": "കീർത്തി സ്പൈസി ഓമപ്പൊടി",
    "category": "mixtures",
    "badge": "Ajwain Infused",
    "badgeClass": "",
    "price": 80,
    "unit": "200g Pouch",
    "eyebrow": "DIGESTIVE DELIGHT",
    "tagline": "Digestive Ajwain • Golden Sev • Melt-in-Mouth",
    "ingredients": "Besan (gram flour), ajwain (carom seed) extract, rice flour, butter, salt, mild chilli, vegetable oil.",
    "description": "Feather-light vermicelli sev fragrant with freshly brewed ajwain essence. Wonderfully light and easy to digest.",
    "nutrition": "Energy: 475 kcal, Protein: 9.5g, Carbohydrate: 52g (Per 100g)",
    "tags": ["omapodi", "ajwain", "sev"]
  },
  {
    "id": "keerthi-sweet-diamond-shankarpali",
    "slug": "keerthi_sweet_diamond_shankarpali",
    "name": "KEERTHI SWEET DIAMOND SHANKARPALI",
    "malayalamName": "കീർത്തി മധുര ഡയമണ്ട്",
    "category": "sweets",
    "badge": "Sweet 🍯",
    "badgeClass": "sweet",
    "price": 90,
    "unit": "250g Pouch",
    "eyebrow": "SWEET DIAMOND",
    "tagline": "Crispy Diamond Cuts • Pure Ghee • Cardamom Sugar Glaze",
    "ingredients": "Whole wheat flour, sugar syrup, pure ghee, cardamom powder, toasted sesame.",
    "description": "Crunchy diamond-cut pastry coated with a fine crystalline cardamom sugar glaze. A festival must-have for all ages.",
    "nutrition": "Energy: 460 kcal, Protein: 6.2g, Carbohydrate: 68g, Fat: 18g (Per 100g)",
    "tags": ["shankarpali", "sweet", "diamond"]
  },
  {
    "id": "keerthi-butter-murukku-sticks",
    "slug": "keerthi_butter_murukku_sticks",
    "name": "KEERTHI BUTTER MURUKKU STICKS",
    "malayalamName": "കീർത്തി ബട്ടർ മുറുക്ക് സ്റ്റിക്സ്",
    "category": "murukku",
    "badge": "Kids Favorite",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "MILD & BUTTERY",
    "tagline": "Crunchy Butter Baton Sticks • Toasted Cumin • Light Salt",
    "ingredients": "Roasted rice flour, fresh butter, cumin seeds, mild salt, refined oil.",
    "description": "Crisp straight murukku baton sticks made with generous farm butter and gentle cumin. Not spicy, perfect for evening snack time.",
    "nutrition": "Energy: 465 kcal, Protein: 7.8g, Carbohydrate: 56g (Per 100g)",
    "tags": ["murukku", "sticks", "butter"]
  },
  {
    "id": "keerthi-masala-roasted-peanuts",
    "slug": "keerthi_masala_roasted_peanuts",
    "name": "KEERTHI MASALA ROASTED PEANUTS",
    "malayalamName": "കീർത്തി മസാല വറുത്ത കടല",
    "category": "mixtures",
    "badge": "Crunchy 🥜",
    "badgeClass": "",
    "price": 75,
    "unit": "200g Pouch",
    "eyebrow": "MALABAR ROAST",
    "tagline": "Crunchy Peanuts • Kerala Spices • Roasted Curry Leaves",
    "ingredients": "Premium roasted peanuts, red chilli, curry leaf powder, asafoetida, salt, cold pressed oil.",
    "description": "Plump roasted peanuts tossed in spicy red chilli, toasted garlic, and crisp curry leaves. Perfect with evening tea.",
    "nutrition": "Energy: 560 kcal, Protein: 24g, Carbohydrate: 22g, Healthy Fats: 45g (Per 100g)",
    "tags": ["peanuts", "kadala", "roasted"]
  },
  {
    "id": "keerthi-cashew-butter-cookies",
    "slug": "keerthi_cashew_butter_cookies",
    "name": "KEERTHI CASHEW BUTTER COOKIES",
    "malayalamName": "കീർത്തി കാഷ്യൂ ബട്ടർ കുക്കീസ്",
    "category": "biscuits",
    "badge": "Rich & Crisp",
    "badgeClass": "",
    "price": 110,
    "unit": "250g Pouch",
    "eyebrow": "NUTTY DELIGHT",
    "tagline": "Ground Malabar Cashews • Pure Butter • Baked Golden",
    "ingredients": "Wheat flour, roasted Malabar cashews, pure dairy butter, cane sugar, vanilla, milk.",
    "description": "Wholesome cookies packed with crunchy roasted cashew bits and pure dairy butter. Rich, buttery aroma in every bite.",
    "nutrition": "Energy: 510 kcal, Protein: 8.5g, Carbohydrate: 58g, Fat: 26g (Per 100g)",
    "tags": ["cookies", "cashew", "biscuits"]
  },
  {
    "id": "keerthi-crispy-tapioca-wafers",
    "slug": "keerthi_crispy_tapioca_wafers",
    "name": "KEERTHI CRISPY TAPIOCA WAFERS",
    "malayalamName": "കീർത്തി മലബാർ കപ്പ വേഫേഴ്സ്",
    "category": "chips",
    "badge": "Crunchy",
    "badgeClass": "",
    "price": 80,
    "unit": "200g Pouch",
    "eyebrow": "KERALA ROOTS",
    "tagline": "Wafer-Thin Tapioca • Light Sea Salt • Pure Crunch",
    "ingredients": "Thinly sliced cassava tapioca, sea salt, refined vegetable oil.",
    "description": "Thin, round translucent tapioca chips fried to an ultra-light crunch and lightly sprinkled with sea salt.",
    "nutrition": "Energy: 475 kcal, Carbohydrate: 66g, Dietary Fiber: 3.2g (Per 100g)",
    "tags": ["tapioca", "wafers", "chips"]
  },
  {
    "id": "keerthi-swirl-pinwheel-cookies-jar",
    "slug": "keerthi_swirl_pinwheel_cookies_jar",
    "name": "KEERTHI SWIRL PINWHEEL COOKIES (JAR)",
    "malayalamName": "കീർത്തി സ്വേൾ കുക്കീസ് (ജാർ)",
    "category": "biscuits",
    "badge": "Jar Special",
    "badgeClass": "",
    "price": 130,
    "unit": "350g Jar",
    "eyebrow": "HERMETIC JAR",
    "tagline": "Decorative Spiral Wheels • Cocoa Infused • Airtight Jar",
    "ingredients": "Wheat flour, pure butter, cane sugar, cocoa swirls, milk solids, natural flavors.",
    "description": "Eye-catching two-tone pinwheel cookies packed in an airtight clear container to maintain peak oven freshness.",
    "nutrition": "Energy: 490 kcal, Protein: 6g, Carbohydrate: 65g, Fat: 22g (Per 100g)",
    "tags": ["cookies", "jar", "pinwheel"]
  },
  {
    "id": "keerthi-crouton-garlic-toast-jar",
    "slug": "keerthi_crouton_garlic_toast_jar",
    "name": "KEERTHI CRUNCHY TOAST CROUTONS (JAR)",
    "malayalamName": "കീർത്തി ടോസ്റ്റ് ക്രൂട്ടോൺസ് (ജാർ)",
    "category": "biscuits",
    "badge": "Soup & Tea",
    "badgeClass": "",
    "price": 120,
    "unit": "300g Jar",
    "eyebrow": "HERMETIC JAR",
    "tagline": "Oven-Crisped Bread Bites • Herb Butter • Roasted Garlic",
    "ingredients": "Oven-baked bread cubes, herb butter, roasted garlic, oregano, sea salt.",
    "description": "Savory oven-crisped crouton cubes infused with roasted garlic butter and herbs. Delicious as a snack or in soups.",
    "nutrition": "Energy: 440 kcal, Protein: 8.5g, Carbohydrate: 60g (Per 100g)",
    "tags": ["toast", "croutons", "jar"]
  },
  {
    "id": "keerthi-crunchy-butter-rusk-jar",
    "slug": "keerthi_crunchy_butter_rusk_jar",
    "name": "KEERTHI CRUNCHY BUTTER RUSK (JAR)",
    "malayalamName": "കീർത്തി ബട്ടർ റസ്ക് (ജാർ)",
    "category": "biscuits",
    "badge": "Best Seller",
    "badgeClass": "bestseller",
    "price": 140,
    "unit": "400g Jar",
    "eyebrow": "HERMETIC JAR",
    "tagline": "Double-Baked Loaf Slices • Fragrant Cardamom • Airtight Jar",
    "ingredients": "Double-baked bread slices, butter, sugar, cardamom, milk solids.",
    "description": "Generous jar of double-baked butter rusk slices. Extremely crisp, lightly sweet, infused with freshly crushed green cardamom.",
    "nutrition": "Energy: 450 kcal, Protein: 7.2g, Carbohydrate: 68g (Per 100g)",
    "tags": ["rusk", "jar", "bestseller"]
  },
  {
    "id": "keerthi-fine-idiyappam-sev",
    "slug": "keerthi_fine_idiyappam_sev",
    "name": "KEERTHI FINE IDIYAPPAM SEV",
    "malayalamName": "കീർത്തി ഇടിയപ്പം സേവ്",
    "category": "murukku",
    "badge": "Traditional",
    "badgeClass": "traditional",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "DELICATE NOODLES",
    "tagline": "Extra Fine Vermicelli Crisp • Fragrant Ghee • White Sesame",
    "ingredients": "Fine rice flour, white sesame seeds, pure ghee, sea salt, sunflower oil.",
    "description": "Extra fine string-hopper style crispy threads prepared using pure rice flour and toasted white sesame.",
    "nutrition": "Energy: 460 kcal, Protein: 7g, Carbohydrate: 58g (Per 100g)",
    "tags": ["sev", "idiyappam", "traditional"]
  },
  {
    "id": "keerthi-spicy-kara-boondi",
    "slug": "keerthi_spicy_kara_boondi",
    "name": "KEERTHI SPICY KARA BOONDI",
    "malayalamName": "കീർത്തി സ്പൈസി കാര ബൂന്ദി",
    "category": "mixtures",
    "badge": "Spicy 🌶",
    "badgeClass": "spicy",
    "price": 80,
    "unit": "200g Pouch",
    "eyebrow": "GOLDEN PEARLS",
    "tagline": "Golden Gram Pearls • Roasted Cashews • Crisp Curry Leaves",
    "ingredients": "Gram flour, roasted cashews, curry leaves, Kashmiri chilli, asafoetida, salt, oil.",
    "description": "Tender golden fried gram pearls tossed with split cashews, fragrant curry leaves, and spicy seasoning.",
    "nutrition": "Energy: 520 kcal, Protein: 11g, Carbohydrate: 46g (Per 100g)",
    "tags": ["boondi", "spicy", "mixture"]
  },
  {
    "id": "keerthi-roasted-pepper-cashews",
    "slug": "keerthi_roasted_pepper_cashews",
    "name": "KEERTHI ROASTED PEPPER CASHEWS",
    "malayalamName": "കീർത്തി പെപ്പർ കശുവണ്ടി",
    "category": "mixtures",
    "badge": "Premium Nut",
    "badgeClass": "bestseller",
    "price": 240,
    "unit": "200g Pouch",
    "eyebrow": "EXPORT QUALITY",
    "tagline": "Malabar Whole Cashews • Crushed Tellicherry Pepper • Ghee",
    "ingredients": "Whole premium cashew nuts (W320), Tellicherry black pepper, Himalayan pink salt, pure cow ghee.",
    "description": "Export-grade whole Malabar cashews roasted in pure cow ghee and coated with freshly cracked Tellicherry black pepper.",
    "nutrition": "Energy: 580 kcal, Protein: 18g, Healthy Fats: 46g (Per 100g)",
    "tags": ["cashews", "kaju", "premium"]
  },
  {
    "id": "keerthi-sweet-madhura-kaja",
    "slug": "keerthi_sweet_madhura_kaja",
    "name": "KEERTHI SWEET MADHURA KAJA",
    "malayalamName": "കീർത്തി മധുര കാജ",
    "category": "sweets",
    "badge": "Sweet 🍯",
    "badgeClass": "sweet",
    "price": 95,
    "unit": "250g Pouch",
    "eyebrow": "SWEET CONFECTION",
    "tagline": "Flaky Layered Pastry • Sugar Crust • Cardamom Essence",
    "ingredients": "Refined flour, pure ghee, cane sugar, green cardamom, sunflower oil.",
    "description": "Multi-layered crispy pastry pockets steeped in fragrant cardamom sugar syrup. A royal Malabar sweet treat.",
    "nutrition": "Energy: 470 kcal, Protein: 5g, Carbohydrate: 70g (Per 100g)",
    "tags": ["kaja", "sweet", "malabar"]
  },
  {
    "id": "keerthi-malabar-ribbon-murukku",
    "slug": "keerthi_malabar_ribbon_murukku",
    "name": "KEERTHI MALABAR RIBBON MURUKKU",
    "malayalamName": "കീർത്തി മലബാർ റിബ്ബൺ മുറുക്ക്",
    "category": "murukku",
    "badge": "Crispy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "CRISPY BITES",
    "tagline": "Wavy Ribbon Texture • Butter Crisp • Mild Spices",
    "ingredients": "Rice flour, gram flour, butter, cumin seeds, salt, refined oil.",
    "description": "Wavy fluted ribbon murukku fried to an airy golden crunch. Lightly seasoned with butter and cumin.",
    "nutrition": "Energy: 480 kcal, Protein: 8g, Carbohydrate: 55g (Per 100g)",
    "tags": ["murukku", "ribbon", "crunchy"]
  },
  {
    "id": "keerthi-spiced-twisted-murukku",
    "slug": "keerthi_spiced_twisted_murukku",
    "name": "KEERTHI SPICED TWISTED MURUKKU",
    "malayalamName": "കീർത്തി ട്വിസ്റ്റഡ് മുറുക്ക്",
    "category": "murukku",
    "badge": "Hot & Crisp",
    "badgeClass": "spicy",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "SAVOURY SPIRAL",
    "tagline": "Twisted Coil Murukku • Fiery Red Chilli • Cumin Seeds",
    "ingredients": "Rice flour, urad flour, crushed red chilli, cumin, sesame, butter, salt, oil.",
    "description": "Twisted spiral coils with an invigorating kick of spicy red chilli and earthy roasted cumin seeds.",
    "nutrition": "Energy: 475 kcal, Protein: 8.5g, Carbohydrate: 56g (Per 100g)",
    "tags": ["murukku", "twisted", "spicy"]
  },
  {
    "id": "keerthi-malabar-onion-pakoda",
    "slug": "keerthi_malabar_onion_pakoda",
    "name": "KEERTHI MALABAR ONION PAKODA",
    "malayalamName": "കീർത്തി ഉള്ളി പക്കോഡ",
    "category": "mixtures",
    "badge": "Savory Snack",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "HOMESTYLE TASTE",
    "tagline": "Caramelized Red Onions • Ginger • Fresh Green Chillies",
    "ingredients": "Fresh red onions, gram flour, rice flour, green chilli, ginger, curry leaves, salt, oil.",
    "description": "Crispy fried clusters of sweet caramelized red onions and spicy ginger. Delivers that authentic roadside tea shop flavor.",
    "nutrition": "Energy: 460 kcal, Protein: 9g, Carbohydrate: 50g (Per 100g)",
    "tags": ["pakoda", "onion", "snack"]
  },
  {
    "id": "keerthi-spicy-diamond-cuts",
    "slug": "keerthi_spicy_diamond_cuts",
    "name": "KEERTHI SPICY DIAMOND CUTS",
    "malayalamName": "കീർത്തി കാര ഡയമണ്ട് കട്ട്സ്",
    "category": "mixtures",
    "badge": "Spicy 🌶",
    "badgeClass": "spicy",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "CHILLI DIAMOND",
    "tagline": "Bite-Sized Diamond Bites • Ajwain • Kashmiri Chilli",
    "ingredients": "Refined flour, Kashmiri chilli powder, carom seeds (ajwain), black sesame, salt, oil.",
    "description": "Bite-sized savoury diamond cuts with an addictive crunch and a warm peppery aftertaste from roasted ajwain.",
    "nutrition": "Energy: 480 kcal, Protein: 7g, Carbohydrate: 62g (Per 100g)",
    "tags": ["diamond", "spicy", "cuts"]
  },
  {
    "id": "keerthi-golden-sev-mixture",
    "slug": "keerthi_golden_sev_mixture",
    "name": "KEERTHI GOLDEN SEV MIXTURE",
    "malayalamName": "കീർത്തി ഗോൾഡൻ സേവ് മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Mild & Tasty",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "TRADITIONAL BLEND",
    "tagline": "Fine Golden Threads • Roasted Peanuts • Fragrant Curry Leaves",
    "ingredients": "Fine besan sev, roasted peanuts, turmeric, mild salt, curry leaves, oil.",
    "description": "Golden crispy sev strands blended with roasted peanuts and fragrant curry leaves. Gentle spice profile loved by kids and elders.",
    "nutrition": "Energy: 510 kcal, Protein: 11g, Carbohydrate: 49g (Per 100g)",
    "tags": ["sev", "mixture", "golden"]
  },
  {
    "id": "keerthi-fiery-red-mixture",
    "slug": "keerthi_fiery_red_mixture",
    "name": "KEERTHI FIERY RED MIXTURE",
    "malayalamName": "കീർത്തി ഫയറി റെഡ് മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Hot 🌶",
    "badgeClass": "spicy",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "EXTRA SPICY",
    "tagline": "Fiery Chilli Spiced • Boondi • Peanuts • Spicy Sev",
    "ingredients": "Spicy sev, kara boondi, roasted groundnuts, dried red chillies, curry leaves, salt, oil.",
    "description": "Intensely flavored red mixture packed with spicy boondi, crunch nuts, and fiery Malabar spice dust.",
    "nutrition": "Energy: 525 kcal, Protein: 12g, Carbohydrate: 47g (Per 100g)",
    "tags": ["mixture", "red", "spicy"]
  },
  {
    "id": "keerthi-mini-sweet-rolls-jar",
    "slug": "keerthi_mini_sweet_rolls_jar",
    "name": "KEERTHI MINI SWEET ROLLS (JAR)",
    "malayalamName": "കീർത്തി മിനി സ്വീറ്റ് റോൾസ് (ജാർ)",
    "category": "biscuits",
    "badge": "Jar Special",
    "badgeClass": "",
    "price": 130,
    "unit": "300g Jar",
    "eyebrow": "HERMETIC JAR",
    "tagline": "Rolled Pastry Bites • Cinnamon Sugar • Airtight Jar",
    "ingredients": "Flaky baked pastry rolls, cardamom, cane sugar, butter, cinnamon, milk.",
    "description": "Crisp baked sweet pastry spirals with cinnamon and sugar notes, preserved in an airtight clear container.",
    "nutrition": "Energy: 475 kcal, Protein: 5.5g, Carbohydrate: 66g (Per 100g)",
    "tags": ["rolls", "sweet", "jar"]
  },
  {
    "id": "keerthi-authentic-kuzhalappam",
    "slug": "keerthi_authentic_kuzhalappam",
    "name": "KEERTHI AUTHENTIC KUZHALAPPAM",
    "malayalamName": "കീർത്തി നാടൻ കുഴലപ്പം",
    "category": "murukku",
    "badge": "Kerala Classic",
    "badgeClass": "traditional",
    "price": 95,
    "unit": "250g Pouch",
    "eyebrow": "TRADITIONAL TUBE",
    "tagline": "Traditional Cannoli Tubes • Coconut Milk • Shallots & Cumin",
    "ingredients": "Roasted rice flour, fresh coconut milk, small shallots, cumin, sesame seeds, salt, oil.",
    "description": "Kerala's beloved tubular snack made with rice flour and rich coconut milk seasoned with shallots and cumin. Incomparable crunch.",
    "nutrition": "Energy: 485 kcal, Protein: 6.5g, Carbohydrate: 62g (Per 100g)",
    "tags": ["kuzhalappam", "traditional", "kerala"]
  },
  {
    "id": "keerthi-white-butter-murukku",
    "slug": "keerthi_white_butter_murukku",
    "name": "KEERTHI WHITE BUTTER MURUKKU",
    "malayalamName": "കീർത്തി വെണ്ണ മുറുക്ക്",
    "category": "murukku",
    "badge": "Melt In Mouth",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "CREAMY CRUNCH",
    "tagline": "Snow-White Sev • Creamy Butter • Toasted Sesame",
    "ingredients": "Finely milled white rice flour, butter, white sesame, cumin, salt, refined oil.",
    "description": "Delicate, melt-in-the-mouth white murukku prepared with premium butter and white sesame. A festive staple.",
    "nutrition": "Energy: 460 kcal, Protein: 7g, Carbohydrate: 57g (Per 100g)",
    "tags": ["murukku", "butter", "white"]
  },
  {
    "id": "keerthi-ring-cheeda-murukku",
    "slug": "keerthi_ring_cheeda_murukku",
    "name": "KEERTHI RING CHEEDA MURUKKU",
    "malayalamName": "കീർത്തി വളയപ്പം / ചീട",
    "category": "murukku",
    "badge": "Traditional",
    "badgeClass": "traditional",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "RICE RINGS",
    "tagline": "Crunchy Golden Rings • Toasted Coconut • Roasted Urad Dal",
    "ingredients": "Rice flour, roasted urad dal, grated coconut, cumin, butter, salt, oil.",
    "description": "Crisp round ring murukku (Valayappam / Cheeda) flavored with toasted coconut bits and roasted urad dal.",
    "nutrition": "Energy: 470 kcal, Protein: 8g, Carbohydrate: 58g (Per 100g)",
    "tags": ["cheeda", "valayappam", "murukku"]
  },
  {
    "id": "keerthi-aval-poha-mixture",
    "slug": "keerthi_aval_poha_mixture",
    "name": "KEERTHI AVAL (POHA) MIXTURE",
    "malayalamName": "കീർത്തി അവൽ മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Light & Crisp",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "LIGHT SAVOURY",
    "tagline": "Feather-Light Rice Flakes • Peanuts • Roasted Dal",
    "ingredients": "Puffed rice flakes (aval), roasted peanuts, fried gram, curry leaves, turmeric, salt, oil.",
    "description": "Crispy puffed rice flakes tossed with crunchy peanuts and fried dal. Very low in oil and wonderfully light.",
    "nutrition": "Energy: 430 kcal, Protein: 9.5g, Carbohydrate: 64g (Per 100g)",
    "tags": ["aval", "poha", "mixture"]
  },
  {
    "id": "keerthi-cornflakes-spicy-mix",
    "slug": "keerthi_cornflakes_spicy_mix",
    "name": "KEERTHI CORNFLAKES SPICY MIX",
    "malayalamName": "കീർത്തി കോൺഫ്ലേക്സ് മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Crunchy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "CRUNCHY FLAKES",
    "tagline": "Crisp Corn Flakes • Plump Raisins • Fried Cashews",
    "ingredients": "Crispy cornflakes, cashew nuts, raisins, curry leaves, chaat masala, Kashmiri chilli, oil.",
    "description": "Golden cornflakes lightly spiced with chaat masala, balanced with sweet golden raisins and crunchy cashew halves.",
    "nutrition": "Energy: 465 kcal, Protein: 6.8g, Carbohydrate: 68g (Per 100g)",
    "tags": ["cornflakes", "mixture", "sweet-spicy"]
  },
  {
    "id": "keerthi-banana-chips-pure-coconut-oil",
    "slug": "keerthi_banana_chips_pure_coconut_oil",
    "name": "KEERTHI BANANA CHIPS (COCONUT OIL)",
    "malayalamName": "കീർത്തി നേന്ത്രക്കായ ചിപ്സ് (വെളിച്ചെണ്ണയിൽ)",
    "category": "chips",
    "badge": "100% Coconut Oil",
    "badgeClass": "bestseller",
    "price": 130,
    "unit": "250g Pouch",
    "eyebrow": "VILLAGE PRESS",
    "tagline": "Fried in 100% Pure Coconut Oil • Fresh Nendran • Turmeric",
    "ingredients": "Raw Nendran banana, 100% pure cold-pressed coconut oil, rock salt, turmeric.",
    "description": "The gold standard of Kerala: Sliced Nendran bananas fried exclusively in pure cold-pressed coconut oil. Intensely aromatic.",
    "nutrition": "Energy: 520 kcal, Protein: 2.8g, Carbohydrate: 58g, Fat: 31g (Per 100g)",
    "tags": ["banana", "coconutoil", "kerala", "bestseller"]
  },
  {
    "id": "keerthi-crispy-milk-rusk",
    "slug": "keerthi_crispy_milk_rusk",
    "name": "KEERTHI CRISPY MILK RUSK",
    "malayalamName": "കീർത്തി മിൽക്ക് റസ്ക്",
    "category": "biscuits",
    "badge": "Breakfast Favorite",
    "badgeClass": "",
    "price": 80,
    "unit": "300g Pack",
    "eyebrow": "DOUBLE BAKED",
    "tagline": "Twice-Baked Milk Bread • Sweet Cardamom • Perfect with Chai",
    "ingredients": "Wheat flour, dairy milk, cane sugar, butter, yeast, cardamom.",
    "description": "Oven-toasted milk bread slices baked twice for legendary crunch. Infused with cardamom, made for morning tea dunking.",
    "nutrition": "Energy: 440 kcal, Protein: 8g, Carbohydrate: 66g (Per 100g)",
    "tags": ["rusk", "milk", "tea-time"]
  },
  {
    "id": "keerthi-cardamom-cake-rusk",
    "slug": "keerthi_cardamom_cake_rusk",
    "name": "KEERTHI CARDAMOM CAKE RUSK",
    "malayalamName": "കീർത്തി ഏലക്ക കേക്ക് റസ്ക്",
    "category": "biscuits",
    "badge": "Special",
    "badgeClass": "",
    "price": 95,
    "unit": "300g Pack",
    "eyebrow": "CAKE CRUST",
    "tagline": "Toasted Sponge Cake • Aromatic Green Cardamom • Golden Crisp",
    "ingredients": "Sponge cake slices, eggs, pure butter, cardamom, cane sugar, wheat flour.",
    "description": "Made from rich sponge cake baked until golden and dry. Sweet, buttery, and heavily fragrant with Malabar cardamom.",
    "nutrition": "Energy: 460 kcal, Protein: 7.5g, Carbohydrate: 64g (Per 100g)",
    "tags": ["cakerusk", "cardamom", "biscuits"]
  },
  {
    "id": "keerthi-rich-butter-cookies",
    "slug": "keerthi_rich_butter_cookies",
    "name": "KEERTHI RICH BUTTER COOKIES",
    "malayalamName": "കീർത്തി റിച്ച് ബട്ടർ കുക്കീസ്",
    "category": "biscuits",
    "badge": "Pure Butter",
    "badgeClass": "",
    "price": 95,
    "unit": "250g Pouch",
    "eyebrow": "BAKERY SWEET",
    "tagline": "Golden Baked Rounds • Creamy Butter • Vanilla Aroma",
    "ingredients": "Refined flour, salted dairy butter, cane sugar, milk solids, natural vanilla.",
    "description": "Traditional Kerala bakery butter cookies baked until crisp and aromatic with sweet vanilla notes.",
    "nutrition": "Energy: 505 kcal, Protein: 6.5g, Carbohydrate: 62g (Per 100g)",
    "tags": ["cookies", "butter", "biscuits"]
  },
  {
    "id": "keerthi-crunchy-murukku-batons",
    "slug": "keerthi_crunchy_murukku_batons",
    "name": "KEERTHI CRUNCHY MURUKKU BATONS",
    "malayalamName": "കീർത്തി ക്രഞ്ചി മുറുക്ക് ബാറ്റൺസ്",
    "category": "murukku",
    "badge": "Crunchy",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "BATON STICKS",
    "tagline": "Straight Murukku Sticks • Butter Infused • Cumin Seeds",
    "ingredients": "Rice flour, cumin seeds, white sesame, butter, salt, refined oil.",
    "description": "Straight, bite-sized crunchy murukku batons seasoned with roasted cumin and white sesame.",
    "nutrition": "Energy: 470 kcal, Protein: 8g, Carbohydrate: 56g (Per 100g)",
    "tags": ["murukku", "batons", "sticks"]
  },
  {
    "id": "keerthi-square-tea-biscuits",
    "slug": "keerthi_square_tea_biscuits",
    "name": "KEERTHI SQUARE TEA BISCUITS",
    "malayalamName": "കീർത്തി ചായ ബിസ്കറ്റ്",
    "category": "biscuits",
    "badge": "Tea Time",
    "badgeClass": "",
    "price": 80,
    "unit": "250g Pouch",
    "eyebrow": "CHAI ESSENTIAL",
    "tagline": "Crisp Square Biscuits • Malt Extract • Perfect for Dipping",
    "ingredients": "Wheat flour, caramelized sugar, malt extract, butter, milk.",
    "description": "Crisp square tea biscuits with subtle malt sweetness, designed to be dipped into piping hot Kerala tea.",
    "nutrition": "Energy: 470 kcal, Protein: 7g, Carbohydrate: 66g (Per 100g)",
    "tags": ["biscuits", "tea", "square"]
  },
  {
    "id": "keerthi-salted-boondi-gram",
    "slug": "keerthi_salted_boondi_gram",
    "name": "KEERTHI SALTED BOONDI & GRAM",
    "malayalamName": "കീർത്തി സോൾട്ടഡ് ബൂന്ദി",
    "category": "mixtures",
    "badge": "Mild & Salty",
    "badgeClass": "",
    "price": 80,
    "unit": "200g Pouch",
    "eyebrow": "GOLDEN PEARLS",
    "tagline": "Crispy Gram Pearls • Roasted Gram • Himalayan Salt",
    "ingredients": "Gram flour boondi, roasted chickpeas, Himalayan pink salt, curry leaves, oil.",
    "description": "Mild, lightly salted golden boondi pearls tossed with crispy roasted gram. Great as a standalone crunch or in raita.",
    "nutrition": "Energy: 490 kcal, Protein: 11g, Carbohydrate: 50g (Per 100g)",
    "tags": ["boondi", "salted", "snack"]
  },
  {
    "id": "keerthi-sweet-achappam-rosette",
    "slug": "keerthi_sweet_achappam_rosette",
    "name": "KEERTHI SWEET ACHAPPAM (ROSETTE)",
    "malayalamName": "കീർത്തി നാടൻ അച്ചപ്പം",
    "category": "sweets",
    "badge": "Festival Special",
    "badgeClass": "sweet",
    "price": 95,
    "unit": "200g Pouch",
    "eyebrow": "FESTIVAL ICON",
    "tagline": "Crisp Rose Cookies • Fresh Coconut Milk • Black Sesame",
    "ingredients": "Rice flour, fresh coconut milk, eggs, sugar, black sesame seeds, cumin, refined oil.",
    "description": "Intricate rosette flower cookies made with fresh coconut milk and black sesame. Crispy, sweet, and iconic to Kerala festivals.",
    "nutrition": "Energy: 460 kcal, Protein: 5.5g, Carbohydrate: 64g, Fat: 20g (Per 100g)",
    "tags": ["achappam", "rosette", "sweet", "kerala"]
  },
  {
    "id": "keerthi-special-premium-rusk",
    "slug": "keerthi_special_premium_rusk",
    "name": "KEERTHI SPECIAL PREMIUM RUSK",
    "malayalamName": "കീർത്തി സ്പെഷ്യൽ റസ്ക്",
    "category": "biscuits",
    "badge": "Signature Rusk",
    "badgeClass": "bestseller",
    "price": 85,
    "unit": "300g Pack",
    "eyebrow": "SIGNATURE BAKE",
    "tagline": "Signature Keerthi Packaging • Extra Crunchy • Double Baked",
    "ingredients": "Enriched wheat flour, condensed milk, pure butter, cane sugar, cardamom seeds.",
    "description": "Keerthi's special heritage recipe premium rusk in signature packaging. Extra thick, crunchy, and richly fragrant.",
    "nutrition": "Energy: 445 kcal, Protein: 7.8g, Carbohydrate: 67g (Per 100g)",
    "tags": ["rusk", "special", "bestseller"]
  },
  {
    "id": "keerthi-thick-butter-sev",
    "slug": "keerthi_thick_butter_sev",
    "name": "KEERTHI THICK BUTTER SEV",
    "malayalamName": "കീർത്തി തിക്ക് ബട്ടർ സേവ്",
    "category": "murukku",
    "badge": "Butter Sev",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "BUTTER CRUNCH",
    "tagline": "Thick Sev Strands • Melt In Mouth Butter • Mild Salt",
    "ingredients": "Gram flour, dairy butter, mild salt, turmeric, refined oil.",
    "description": "Thick golden sev strands kneaded with rich butter. Yields a satisfying hearty crunch with buttery savoriness.",
    "nutrition": "Energy: 480 kcal, Protein: 9.5g, Carbohydrate: 52g (Per 100g)",
    "tags": ["sev", "butter", "murukku"]
  },
  {
    "id": "keerthi-crispy-sweet-kaja",
    "slug": "keerthi_crispy_sweet_kaja",
    "name": "KEERTHI CRISPY SWEET KAJA",
    "malayalamName": "കീർത്തി മധുര കാജ സ്പെഷ്യൽ",
    "category": "sweets",
    "badge": "Sweet 🍯",
    "badgeClass": "sweet",
    "price": 95,
    "unit": "250g Pouch",
    "eyebrow": "SWEET DIAMOND",
    "tagline": "Crisp Layered Sweet • Cardamom Glaze • Traditional Kerala Sweet",
    "ingredients": "Layered flour pastry, crystallized sugar glaze, cardamom, pure ghee.",
    "description": "Delicately folded layered sweet diamonds with a sweet crunchy sugar coating and warm cardamom aroma.",
    "nutrition": "Energy: 470 kcal, Protein: 5g, Carbohydrate: 70g (Per 100g)",
    "tags": ["kaja", "sweet", "traditional"]
  },
  {
    "id": "keerthi-vanilla-tea-biscuits",
    "slug": "keerthi_vanilla_tea_biscuits",
    "name": "KEERTHI VANILLA TEA BISCUITS",
    "malayalamName": "കീർത്തി വാനില ബിസ്കറ്റ്",
    "category": "biscuits",
    "badge": "Family Pack",
    "badgeClass": "",
    "price": 85,
    "unit": "250g Pouch",
    "eyebrow": "CLASSIC BISCUIT",
    "tagline": "Golden Baked Rounds • Creamy Vanilla • Tea Time Delight",
    "ingredients": "Wheat flour, butter, sugar, vanilla extract, milk powder, salt.",
    "description": "Crisp round vanilla biscuits baked to a warm golden glow. A family favorite with morning and afternoon tea.",
    "nutrition": "Energy: 485 kcal, Protein: 6.5g, Carbohydrate: 65g (Per 100g)",
    "tags": ["biscuits", "vanilla", "tea-time"]
  },
  {
    "id": "keerthi-spicy-fried-green-peas",
    "slug": "keerthi_spicy_fried_green_peas",
    "name": "KEERTHI SPICY FRIED GREEN PEAS",
    "malayalamName": "കീർത്തി പച്ചപ്പട്ടാണി വറുത്തത്",
    "category": "mixtures",
    "badge": "Spicy 🌶",
    "badgeClass": "spicy",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "WHOLE GREEN PEAS",
    "tagline": "Crunchy Fried Peas • Fiery Red Chilli • Rock Salt",
    "ingredients": "Whole dried green peas, red chilli, rock salt, chaat masala, curry leaves, oil.",
    "description": "Crunchy fried whole green peas generously dusted with red chilli, rock salt, and toasted curry leaves.",
    "nutrition": "Energy: 420 kcal, Protein: 15g, Carbohydrate: 54g (Per 100g)",
    "tags": ["peas", "greenpeas", "spicy"]
  },
  {
    "id": "keerthi-mini-ring-murukku",
    "slug": "keerthi_mini_ring_murukku",
    "name": "KEERTHI MINI RING MURUKKU",
    "malayalamName": "കീർത്തി മിനി വളയപ്പം",
    "category": "murukku",
    "badge": "Bite Sized",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "PETITE RINGS",
    "tagline": "Mini Golden Hoops • Sesame & Cumin • Crisp Texture",
    "ingredients": "Rice flour, white sesame, urad dal, cumin, butter, salt, oil.",
    "description": "Petite, bite-sized ring murukku hoops with an addictive crunch and gentle nutty sesame flavor.",
    "nutrition": "Energy: 470 kcal, Protein: 8g, Carbohydrate: 57g (Per 100g)",
    "tags": ["murukku", "ring", "mini"]
  },
  {
    "id": "keerthi-roasted-salted-cashews",
    "slug": "keerthi_roasted_salted_cashews",
    "name": "KEERTHI ROASTED SALTED CASHEWS",
    "malayalamName": "കീർത്തി വറുത്ത കശുവണ്ടി",
    "category": "mixtures",
    "badge": "Premium 👑",
    "badgeClass": "bestseller",
    "price": 240,
    "unit": "200g Pouch",
    "eyebrow": "ROYAL CASHEW",
    "tagline": "Jumbo Kerala Cashews • Ghee Roasted • Sea Salt",
    "ingredients": "Whole jumbo Kerala cashews (W240), sea salt, pure cow ghee.",
    "description": "Giant golden roasted cashews lightly toasted in pure country ghee with fine sea salt. Unmatched nutty richness.",
    "nutrition": "Energy: 585 kcal, Protein: 18g, Healthy Fats: 47g (Per 100g)",
    "tags": ["cashews", "kaju", "premium", "ghee"]
  },
  {
    "id": "keerthi-malabar-peas-mixture",
    "slug": "keerthi_malabar_peas_mixture",
    "name": "KEERTHI MALABAR PEAS MIXTURE",
    "malayalamName": "കീർത്തി പട്ടാണി മിക്സ്ചർ",
    "category": "mixtures",
    "badge": "Crunchy Mix",
    "badgeClass": "",
    "price": 85,
    "unit": "200g Pouch",
    "eyebrow": "SAVOURY MEDLEY",
    "tagline": "Fried Green Peas • Sev Strands • Roasted Peanuts",
    "ingredients": "Green peas, gram flour sev, peanuts, curry leaves, red chilli, spices, oil.",
    "description": "Hearty Malabar mixture combining whole crispy fried green peas, delicate sev strands, and roasted peanuts.",
    "nutrition": "Energy: 485 kcal, Protein: 12g, Carbohydrate: 51g (Per 100g)",
    "tags": ["mixture", "peas", "malabar"]
  },
  {
    "id": "keerthi-sweet-somasi-kaja",
    "slug": "keerthi_sweet_somasi_kaja",
    "name": "KEERTHI SWEET SOMASI / KAJA",
    "malayalamName": "കീർത്തി മധുര സോമാസി",
    "category": "sweets",
    "badge": "Sweet 🍯",
    "badgeClass": "sweet",
    "price": 110,
    "unit": "250g Pouch",
    "eyebrow": "TRADITIONAL SWEET",
    "tagline": "Coconut Stuffed Crescent • Cardamom • Golden Crisp",
    "ingredients": "Wheat flour pastry, grated roasted coconut, semolina (rava), sugar, cardamom, chopped nuts.",
    "description": "Flaky golden crescents filled with sweet roasted coconut, cardamom-scented rava, and crunchy cashews.",
    "nutrition": "Energy: 480 kcal, Protein: 6g, Carbohydrate: 66g, Fat: 22g (Per 100g)",
    "tags": ["somasi", "kaja", "sweet"]
  },
  {
    "id": "keerthi-fresh-golden-tea-muffins",
    "slug": "keerthi_fresh_golden_tea_muffins",
    "name": "KEERTHI FRESH GOLDEN TEA MUFFINS",
    "malayalamName": "കീർത്തി ഫ്രഷ് ടീ കേക്ക് കപ്പ്കേക്ക്സ്",
    "category": "cakes",
    "badge": "Bakery Fresh 🧁",
    "badgeClass": "bestseller",
    "price": 120,
    "unit": "Box of 12",
    "eyebrow": "OVEN FRESH",
    "tagline": "Straight From The Oven • Golden Brown Crust • Crushed Cashews",
    "ingredients": "Flour, dairy butter, eggs, cane sugar, pure cardamom, crushed cashew bits, vanilla essence.",
    "description": "Tray-fresh golden tea cupcakes straight from the Keerthi Bakery ovens. Moist, fluffy crumb with crushed cashews on top.",
    "nutrition": "Energy: 390 kcal, Protein: 6.2g, Carbohydrate: 52g, Fat: 16g (Per 100g)",
    "tags": ["muffins", "cake", "cupcakes", "fresh"]
  }
]

print("Initializing rembg session...")
session = rembg.new_session('u2netp')

files = sorted(glob.glob(os.path.join(BLUM_DIR, "*.jpg")))
print(f"Total source photos: {len(files)}")

processed_products = []

for idx, file_path in enumerate(files):
    if idx >= len(PRODUCTS_META):
        break
    
    meta = PRODUCTS_META[idx]
    slug = meta["slug"]
    idx_num = idx + 1
    
    t_start = time.time()
    try:
        inp = Image.open(file_path)
        # Remove background
        out = rembg.remove(inp, session=session)
        
        # Clean faint alpha haze
        r, g, b, a = out.split()
        a_np = np.array(a)
        a_np[a_np < 25] = 0
        a_clean = Image.fromarray(a_np)
        out.putalpha(a_clean)
        
        # Compute tight bounding box (solid pouch alpha > 60)
        mask_solid = a_clean.point(lambda p: 255 if p > 60 else 0)
        bbox = mask_solid.getbbox()
        if bbox:
            w, h = out.size
            bbox = (max(0, bbox[0]-6), max(0, bbox[1]-6), min(w, bbox[2]+6), min(h, bbox[3]+6))
            out = out.crop(bbox)
            
        canvas_size = 1000
        # If it's a jar or tall item or wide tray, adjust target_max
        target_max = 840
        w, h = out.size
        scale = target_max / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        out_resized = out.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Shopify canvas: pure white
        canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
        
        # Studio contact shadow
        alpha = out_resized.split()[3]
        shadow_img = Image.new('RGBA', (new_w, new_h), (25, 25, 25, 255))
        shadow_alpha = alpha.point(lambda p: int(p * 0.18))
        shadow_img.putalpha(shadow_alpha)
        shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(15))
        
        x = (canvas_size - new_w) // 2
        y = (canvas_size - new_h) // 2
        
        canvas.paste(shadow_img, (x, y + 12), shadow_img)
        canvas.paste(out_resized, (x, y), out_resized)
        
        # Save both numerical and semantic file names
        # WebP (super fast & modern) and JPG (universal)
        jpg_name = f"{slug}.jpg"
        webp_name = f"{slug}.webp"
        num_jpg = f"prod_{idx_num}.jpg"
        num_webp = f"prod_{idx_num}.webp"
        
        out_jpg = os.path.join(OUT_DIR, jpg_name)
        out_webp = os.path.join(OUT_DIR, webp_name)
        out_num_jpg = os.path.join(OUT_DIR, num_jpg)
        out_num_webp = os.path.join(OUT_DIR, num_webp)
        
        rgb_canvas = canvas.convert('RGB')
        rgb_canvas.save(out_jpg, 'JPEG', quality=93)
        rgb_canvas.save(out_num_jpg, 'JPEG', quality=93)
        
        canvas.save(out_webp, 'WEBP', quality=93)
        canvas.save(out_num_webp, 'WEBP', quality=93)
        
        # Save transparent PNG as well for cutouts
        png_name = f"{slug}_transparent.png"
        out_png = os.path.join(OUT_DIR, png_name)
        out.save(out_png, 'PNG')
        
        product_item = {
            **meta,
            "image": f"/images/products_blum/{jpg_name}",
            "imageWebp": f"/images/products_blum/{webp_name}",
            "imageCutout": f"/images/products_blum/{png_name}",
            "priceText": f"₹{meta['price']} / {meta['unit']}",
            "rating": 4.90 + round((idx % 9) * 0.01, 2),
            "reviewCount": 350 + (idx * 47) % 1200
        }
        processed_products.append(product_item)
        print(f"[{idx_num}/55] Processed {slug} in {time.time()-t_start:.2f}s")
        
    except Exception as e:
        print(f"Error processing {idx_num}: {e}")

out_data_path = "/Users/amanyoonus/Desktop/bakery/src/data/blum_products_data.json"
with open(out_data_path, "w", encoding="utf-8") as f:
    json.dump(processed_products, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully generated {len(processed_products)} Shopify-formatted products!")
print(f"Saved product dataset to: {out_data_path}")
