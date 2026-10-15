import os
import glob
import json
import re
from PIL import Image
import pytesseract

BLUM_DIR = "/Users/amanyoonus/Desktop/bakery/blum"
files = sorted(glob.glob(os.path.join(BLUM_DIR, "*.jpg")))

results = []
print(f"Total files found: {len(files)}")

for idx, file_path in enumerate(files):
    filename = os.path.basename(file_path)
    try:
        img = Image.open(file_path)
        w, h = img.size
        
        # Crop center region where pouch label usually is
        # Pouches usually take up center 70% width and 70% height
        box = (int(w * 0.15), int(h * 0.15), int(w * 0.85), int(h * 0.85))
        crop_img = img.crop(box)
        
        # Run OCR
        text = pytesseract.image_to_string(crop_img)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        clean_text = " | ".join(lines)
        
        results.append({
            "index": idx + 1,
            "filename": filename,
            "path": file_path,
            "width": w,
            "height": h,
            "ocr_sample": clean_text[:200],
            "raw_text": clean_text
        })
        print(f"[{idx+1}/{len(files)}] {filename} ({w}x{h}): {clean_text[:80]}")
    except Exception as e:
        print(f"Error {filename}: {e}")

out_path = "/Users/amanyoonus/Desktop/bakery/scripts/blum_analysis.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nWrote analysis to {out_path}")
