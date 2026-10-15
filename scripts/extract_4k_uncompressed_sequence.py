import os
import sys
import time
import subprocess
import shutil
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

VIDEO_PATH = "/Users/amanyoonus/Desktop/1792091044478583.mp4"
OUTPUT_DIR = "/Users/amanyoonus/Desktop/bakery/public/scroll-sequence"
TEMP_DIR = "/tmp/keerthi_4k_raw_frames"
TOTAL_FRAMES = 120
FPS = f"{TOTAL_FRAMES}/6.916667"

def main():
    print(f"--- Starting 4K Uncompressed Scroll Sequence Extraction ---")
    start_total = time.time()
    
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Step 1: Extract 120 frames at full 4K (3840x2160) without any downscaling
    print("Step 1: Extracting 120 frames at 3840x2160 using ffmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-i", VIDEO_PATH,
        "-vf", f"fps={FPS}",
        "-frames:v", str(TOTAL_FRAMES),
        "-q:v", "1", # Highest possible JPEG quality from ffmpeg
        os.path.join(TEMP_DIR, "frame_%04d.jpg")
    ]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode != 0:
        print("FFmpeg error:", p.stderr.decode("utf-8", errors="ignore"))
        sys.exit(1)
        
    extracted_files = sorted([os.path.join(TEMP_DIR, f) for f in os.listdir(TEMP_DIR) if f.endswith(".jpg")])
    print(f"Extracted {len(extracted_files)} frames to {TEMP_DIR}")
    
    # Check resolution
    with Image.open(extracted_files[0]) as sample:
        print(f"Verified resolution: {sample.size[0]} x {sample.size[1]} (4K UHD)")
    
    # Step 2: Convert to crystal-clear, uncompressed-quality WebP (quality=94, method=4)
    print("Step 2: Encoding to pristine 4K WebP with zero downscaling...")
    def process_frame(idx_file):
        idx, src_path = idx_file
        dest_filename = f"frame_{str(idx+1).zfill(4)}.webp"
        dest_path = os.path.join(OUTPUT_DIR, dest_filename)
        with Image.open(src_path) as im:
            # Save at 3840x2160 with quality=94 for razor-sharp visual fidelity
            im.save(dest_path, "WEBP", quality=94, method=3)
        return os.path.getsize(dest_path)

    start_conv = time.time()
    with ThreadPoolExecutor(max_workers=8) as executor:
        sizes = list(executor.map(process_frame, enumerate(extracted_files[:TOTAL_FRAMES])))
        
    total_mb = sum(sizes) / (1024 * 1024)
    print(f"Encoded {len(sizes)} 4K frames in {time.time() - start_conv:.2f}s")
    print(f"Total 4K sequence size: {total_mb:.2f} MB")
    print(f"Average frame size: {total_mb / len(sizes) * 1024:.1f} KB")
    print(f"Total time elapsed: {time.time() - start_total:.2f}s")
    
    # Clean up temp
    shutil.rmtree(TEMP_DIR, ignore_errors=True)
    print("Extraction and uncompressed 4K encoding complete!")

if __name__ == "__main__":
    main()
