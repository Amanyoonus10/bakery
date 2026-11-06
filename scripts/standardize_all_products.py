import json
import urllib.request
import io
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFilter
import rembg

OUT_DIR = "public/images/products_standardized"
os.makedirs(OUT_DIR, exist_ok=True)

CANVAS_W = 900
CANVAS_H = 1200
TARGET_MAX_W = 720
TARGET_MAX_H = 920

with open("src/data/shopify_products.json") as f:
    products = json.load(f)["products"]

print(f"Total products to process: {len(products)}")

# Single shared ONNX session
session = rembg.new_session("u2net")

def process_product(p):
    handle = p.get("handle") or f"prod-{p['id']}"
    title = p.get("title", handle)
    out_name = f"keerthi-{handle}.webp"
    out_path = os.path.join(OUT_DIR, out_name)
    
    imgs = p.get("images", [])
    if not imgs:
        print(f"[WARN] No image for {title}")
        return None
    
    url = imgs[0]["src"]
    t0 = time.time()
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        )
        data = urllib.request.urlopen(req, timeout=25).read()
        im = Image.open(io.BytesIO(data)).convert("RGB")
        
        # Remove background
        out = rembg.remove(im, session=session)
        bbox = out.getbbox()
        if not bbox:
            print(f"[WARN] Empty bbox for {title}")
            return None
        
        cropped = out.crop(bbox)
        cw, ch = cropped.size
        
        # Scale to standard bounding box
        scale = min(TARGET_MAX_W / cw, TARGET_MAX_H / ch)
        nw = max(10, int(cw * scale))
        nh = max(10, int(ch * scale))
        scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        
        # Pure White Studio Canvas (900x1200, 3:4 aspect ratio)
        canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), (255, 255, 255))
        
        # Perfectly centered
        px = (CANVAS_W - nw) // 2
        py = (CANVAS_H - nh) // 2
        
        # Realistic ground contact shadow
        shadow_w = int(nw * 0.74)
        shadow_h = max(14, int(nh * 0.07))
        shadow = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_x0 = px + (nw - shadow_w) // 2
        s_y0 = py + nh - shadow_h // 2
        s_draw.ellipse([s_x0, s_y0, s_x0 + shadow_w, s_y0 + shadow_h], fill=(0, 0, 0, 42))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=16))
        
        # Composite
        canvas.paste(shadow, (0, 0), shadow)
        canvas.paste(scaled, (px, py), scaled)
        
        # Save high quality WebP
        canvas.save(out_path, "WEBP", quality=92)
        dur = round(time.time() - t0, 1)
        print(f"[OK] {title} -> {out_name} (scaled {nw}x{nh}) in {dur}s", flush=True)
        return handle, out_name
    except Exception as e:
        print(f"[ERR] Failed {title}: {e}", flush=True)
        return None

if __name__ == "__main__":
    t_start = time.time()
    # 4 parallel worker threads
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(process_product, products))
    
    success = [r for r in results if r is not None]
    print(f"\nDone! Standardized {len(success)}/{len(products)} products in {round(time.time() - t_start, 1)}s.", flush=True)
