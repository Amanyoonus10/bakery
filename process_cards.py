import re

with open("apsarabakes.html") as f:
    html = f.read()

ul_match = re.search(r'<ul class="cards">(.*?)</ul>', html, re.DOTALL)
snacks_raw = ul_match.group(1).strip()

cake_match = re.search(r'cakeHtmlCards\s*=\s*`([^`]+)`', html)
cakes_raw = cake_match.group(1).strip()

def process_cards(raw):
    def img_repl(m):
        src = m.group(1)
        if "BANANA CHIPS-COCONUT OIL" in src:
            return 'src="/images/keerthi_banana_chips_pouch.jpg"'
        return f'src="/apsara_imgs/{src}"'
    
    res = re.sub(r'src=["\']([^"\']+\.(?:png|jpg|webp))["\']', img_repl, raw)

    def data_img_repl(m):
        src = m.group(1)
        if "BANANA CHIPS-COCONUT OIL" in src:
            return 'data-img="/images/keerthi_banana_chips_pouch.jpg"'
        return f'data-img="/apsara_imgs/{src}"'
    
    res = re.sub(r'data-img=["\']([^"\']+\.(?:png|jpg|webp))["\']', data_img_repl, res)
    return res

processed_snacks = process_cards(snacks_raw)
processed_cakes = process_cards(cakes_raw)

with open("public/processed_snacks.html", "w") as f:
    f.write(processed_snacks)

with open("public/processed_cakes.html", "w") as f:
    f.write(processed_cakes)

print("Saved processed_snacks.html (bytes:", len(processed_snacks), ") and processed_cakes.html (bytes:", len(processed_cakes), ")")
