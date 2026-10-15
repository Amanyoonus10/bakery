/**
 * KEERTHI BAKERY - SCROLL-DRIVEN VIDEO HERO SEQUENCE
 * Apple-style GPU-accelerated canvas scrubbing with inertia physics
 * Zero-lag asset preloader with real-time percentage counter
 */

import { playTickSound } from "./tick-sound.js";

const FRAME_COUNT = 120;
const FRAME_WIDTH = 3840;
const FRAME_HEIGHT = 2160;

export function initScrollVideoHero() {
  const preloader = document.getElementById("keerthiPreloader");
  const preloaderPercent = document.getElementById("preloaderPercent");
  const preloaderBarFill = document.getElementById("preloaderBarFill");
  const preloaderStatus = document.getElementById("preloaderStatus");

  const heroContainer = document.getElementById("scrollVideoHero");
  const canvas = document.getElementById("scrollVideoCanvas");
  const skipBtn = document.getElementById("btnSkipScrollIntro");
  const enterStoreBtn = document.getElementById("btnEnterStoreCta");
  const endAction = document.getElementById("scrollEndAction");
  const mainSiteStart = document.getElementById("site-main-start");

  if (!heroContainer || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let targetFrameIndex = 0;
  let actualFrameIndex = 0;
  let animFrameId = null;
  let isIntersecting = true;
  let lastSoundTickIndex = -1;

  // 1. Resize canvas to exact viewport device pixels with Retina resolution
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // Immediate draw on resize
    drawFrame(Math.round(actualFrameIndex));
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

// Pre-computed ambient edge palette for the 120 frames to ensure zero harsh borders on any aspect ratio
const FRAME_BG_COLORS = [
  "#504732", "#514833", "#514833", "#524934", "#524934", "#524934", "#524934", "#524834", "#544a35", "#544a35",
  "#544b36", "#534935", "#544a35", "#544a35", "#544a35", "#544a35", "#544a35", "#544a35", "#544a36", "#554b36",
  "#544b36", "#544b35", "#544a35", "#544a35", "#534935", "#866b48", "#876c48", "#856b49", "#856b4a", "#876b46",
  "#876b46", "#866a46", "#876c48", "#866b49", "#856a49", "#866a48", "#866b48", "#886d49", "#866c49", "#866b49",
  "#846a49", "#856a49", "#856a49", "#846a48", "#856946", "#876b46", "#896c47", "#866a48", "#866a47", "#866946",
  "#876a45", "#856c47", "#876e48", "#876e49", "#88704a", "#89714b", "#8e754f", "#8f764f", "#907750", "#8f7751",
  "#8f7751", "#8f7852", "#907853", "#907853", "#907853", "#8f7853", "#8f7852", "#8e7752", "#8e7752", "#8d7752",
  "#8d7652", "#8c7652", "#8c7551", "#8b7551", "#8a7450", "#89734f", "#88724e", "#87714d", "#87714d", "#87714e",
  "#87714d", "#86704c", "#866f4b", "#856f4b", "#bfaf95", "#beac92", "#beac92", "#beac91", "#bead92", "#bfad92",
  "#bfad92", "#bfae93", "#c0ae93", "#c0ae93", "#c0ae93", "#c0ae93", "#c0ae93", "#c0ae93", "#c0ae93", "#c0ae93",
  "#c0ae93", "#c0af93", "#c1af93", "#c1af93", "#c1af93", "#c1af93", "#c0ae93", "#c0ae92", "#c0ae92", "#c0ae92",
  "#c0ae92", "#c0ae92", "#c0ad92", "#bfad91", "#bfad91", "#bfad91", "#bfad91", "#bfad91", "#bfad91", "#bfad91"
];

  // Helper to guarantee a frame is always drawn without blank flicker even while streaming in background
  function getNearestLoadedFrame(targetIdx) {
    if (frames[targetIdx] && frames[targetIdx].complete && frames[targetIdx].naturalWidth > 0) {
      return frames[targetIdx];
    }
    // Search backwards for the closest loaded frame
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
        return frames[i];
      }
    }
    // Search forwards
    for (let i = targetIdx + 1; i < FRAME_COUNT; i++) {
      if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
        return frames[i];
      }
    }
    return frames[0] || null;
  }

  // 2. Draw Frame in FULL VIEW (Zero Cropping, complete 16:9 4K frame visible)
  function drawFrame(index) {
    if (!ctx) return;
    const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
    const img = getNearestLoadedFrame(clampedIndex);

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || FRAME_WIDTH;
    const ih = img.naturalHeight || FRAME_HEIGHT;

    // Full View Math: Math.min guarantees the entire 4K frame is visible without cutting off any text or edges
    const scale = Math.min(cw / iw, ch / ih);
    const sw = Math.round(iw * scale);
    const sh = Math.round(ih * scale);
    const sx = Math.round((cw - sw) / 2);
    const sy = Math.round((ch - sh) / 2);

    // Seamless ambient background matching the exact frame tone across screen aspect ratios
    ctx.fillStyle = FRAME_BG_COLORS[clampedIndex] || "#504732";
    ctx.fillRect(0, 0, cw, ch);

    ctx.drawImage(img, sx, sy, sw, sh);
  }

  // 3. Progressive High-Speed Preloader (Ready in ~1s without hanging)
  const BUFFER_FRAMES = 24; // Initial interactive buffer to immediately unlock scrolling
  const MAX_WAIT_MS = 2200;  // Safety timeout: never block user for more than 2.2s
  const startTime = Date.now();
  let displayedPercent = 0;

  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const bufferProgress = Math.min(100, Math.floor((loadedCount / BUFFER_FRAMES) * 100));
    const timeProgress = Math.min(100, Math.floor((elapsed / MAX_WAIT_MS) * 100));
    const targetProgress = Math.max(bufferProgress, timeProgress);

    if (displayedPercent < targetProgress) {
      const step = Math.max(2, Math.ceil((targetProgress - displayedPercent) * 0.28));
      displayedPercent = Math.min(targetProgress, displayedPercent + step);
    }

    if (preloaderPercent) {
      preloaderPercent.textContent = `${displayedPercent}%`;
    }
    if (preloaderBarFill) {
      preloaderBarFill.style.width = `${displayedPercent}%`;
    }

    if (preloaderStatus) {
      if (displayedPercent < 45) {
        preloaderStatus.textContent = "Curating Malabar Heritage Bakes...";
      } else if (displayedPercent < 85) {
        preloaderStatus.textContent = "Preparing 4K Visual Experience...";
      } else if (displayedPercent < 100) {
        preloaderStatus.textContent = "Crisping To Perfection...";
      }
    }

    // Dismiss as soon as interactive buffer is ready and counter finishes
    if ((loadedCount >= BUFFER_FRAMES || elapsed >= MAX_WAIT_MS) && displayedPercent >= 100) {
      clearInterval(progressInterval);
      dismissPreloader();
    }
  }, 25);

  function dismissPreloader() {
    if (preloaderStatus) {
      preloaderStatus.textContent = "Welcome to Keerthi Bakery";
    }
    if (preloaderPercent) {
      preloaderPercent.textContent = "100%";
    }
    if (preloaderBarFill) {
      preloaderBarFill.style.width = "100%";
    }

    // Draw frame 0 immediately
    drawFrame(0);

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add("loaded");
      }
      startRenderLoop();
    }, 200);
  }

  // Skip button on preloader for instant entry
  const preloaderSkipBtn = document.getElementById("preloaderSkipBtn");
  if (preloaderSkipBtn) {
    preloaderSkipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearInterval(progressInterval);
      if (preloader) {
        preloader.classList.add("loaded");
      }
      dismissScrollVideoHero(true);
    });
  }

  // Progressive Frame Loader:
  function loadFrame(i) {
    const img = new Image();
    const frameNum = i.toString().padStart(4, "0");
    img.src = `/scroll-sequence/frame_${frameNum}.webp`;

    img.onload = () => {
      loadedCount++;
      if (i === 1) {
        drawFrame(0);
      }
    };

    img.onerror = () => {
      loadedCount++;
    };

    frames[i - 1] = img;
  }

  // 1. Immediately load the interactive buffer (frames 1 to 24)
  for (let i = 1; i <= Math.min(BUFFER_FRAMES, FRAME_COUNT); i++) {
    loadFrame(i);
  }

  // 2. Stream remaining frames in background after initial buffer starts
  setTimeout(() => {
    for (let i = BUFFER_FRAMES + 1; i <= FRAME_COUNT; i++) {
      loadFrame(i);
    }
  }, 120);

  let isDismissed = false;
  let autoDismissTimer = null;

  function dismissScrollVideoHero(immediate = false) {
    if (isDismissed) return;
    isDismissed = true;

    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }

    // Stop tracking listeners
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("wheel", handleEndWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleEndTouch);
    cancelAnimationFrame(animFrameId);
    if (observer) {
      observer.disconnect();
    }

    if (immediate) {
      heroContainer.classList.add("disappeared");
      heroContainer.style.display = "none";
      heroContainer.style.height = "0";
      window.scrollTo(0, 0);
      return;
    }

    // 1. Lock hero to fixed full-screen overlay so document scroll resets to 0 with zero visible jump
    heroContainer.classList.add("is-finishing");
    window.scrollTo({ top: 0, behavior: "instant" });

    // 2. Smoothly fade out, soft blur, and remove from document flow
    setTimeout(() => {
      heroContainer.classList.add("disappeared");
      heroContainer.style.display = "none";
      heroContainer.style.height = "0";
      heroContainer.style.pointerEvents = "none";
    }, 650);
  }

  // 4. Scroll Tracking
  function handleScroll() {
    if (isDismissed) return;
    const rect = heroContainer.getBoundingClientRect();
    const scrollableDist = rect.height - window.innerHeight;

    if (scrollableDist <= 0) return;

    let progress = -rect.top / scrollableDist;
    progress = Math.max(0, Math.min(1, progress));

    targetFrameIndex = progress * (FRAME_COUNT - 1);

    // Show Enter Store CTA only at the end of the video
    if (endAction) {
      if (progress > 0.86) {
        endAction.classList.add("visible");
      } else {
        endAction.classList.remove("visible");
      }
    }

    // Hide scroll down mouse indicator as user scrolls
    const indicator = document.querySelector(".scroll-video-indicator");
    if (indicator) {
      indicator.style.opacity = progress > 0.15 ? "0" : "1";
    }

    // Auto-disappear once the video finishes playing to the end
    if (progress >= 0.98) {
      if (!autoDismissTimer) {
        autoDismissTimer = setTimeout(() => {
          dismissScrollVideoHero();
        }, 1200);
      }
    } else {
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
        autoDismissTimer = null;
      }
    }
  }

  // If user is at or near the end and rolls mouse wheel down, dismiss immediately
  function handleEndWheel(e) {
    if (isDismissed) return;
    const rect = heroContainer.getBoundingClientRect();
    const scrollableDist = rect.height - window.innerHeight;
    const progress = scrollableDist > 0 ? -rect.top / scrollableDist : 0;
    if (progress >= 0.92 && e.deltaY > 5) {
      dismissScrollVideoHero();
    }
  }

  // Touch swipe support for mobile
  let touchStartY = 0;
  function handleTouchStart(e) {
    if (e.touches && e.touches[0]) {
      touchStartY = e.touches[0].clientY;
    }
  }
  function handleEndTouch(e) {
    if (isDismissed) return;
    const rect = heroContainer.getBoundingClientRect();
    const scrollableDist = rect.height - window.innerHeight;
    const progress = scrollableDist > 0 ? -rect.top / scrollableDist : 0;
    if (e.touches && e.touches[0]) {
      const touchDeltaY = touchStartY - e.touches[0].clientY;
      if (progress >= 0.92 && touchDeltaY > 15) {
        dismissScrollVideoHero();
      }
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("wheel", handleEndWheel, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleEndTouch, { passive: true });

  // 5. Inertia Render Loop (Apple Physics: 60fps smooth interpolation)
  function renderLoop() {
    if (!isIntersecting || isDismissed) return;

    const diff = targetFrameIndex - actualFrameIndex;
    actualFrameIndex += diff * 0.14; // Buttery inertia smoothing

    if (actualFrameIndex < 0) actualFrameIndex = 0;
    if (actualFrameIndex > FRAME_COUNT - 1) actualFrameIndex = FRAME_COUNT - 1;

    const frameToDraw = Math.round(actualFrameIndex);
    drawFrame(frameToDraw);

    // Subtle haptic tick sound on frame scrubs
    if (Math.abs(diff) > 0.8 && Math.abs(frameToDraw - lastSoundTickIndex) >= 4) {
      lastSoundTickIndex = frameToDraw;
      try {
        playTickSound(0.12);
      } catch (err) {}
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }

  function startRenderLoop() {
    cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(renderLoop);
  }

  // 6. IntersectionObserver to free CPU/GPU when user scrolls deeper into store
  const observer = new IntersectionObserver(
    ([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting && !isDismissed) {
        startRenderLoop();
      } else {
        cancelAnimationFrame(animFrameId);
      }
    },
    { threshold: 0.01 }
  );

  observer.observe(heroContainer);

  // 7. Skip to Store / Enter Store: trigger smooth disappearance
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dismissScrollVideoHero();
    });
  }
  if (enterStoreBtn) {
    enterStoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dismissScrollVideoHero();
    });
  }

  // Expose global replay trigger for user convenience
  window.dismissScrollVideoHero = dismissScrollVideoHero;
  window.replayScrollVideoHero = function() {
    isDismissed = false;
    heroContainer.classList.remove("disappeared", "is-finishing");
    heroContainer.style.display = "";
    heroContainer.style.height = "";
    heroContainer.style.pointerEvents = "";
    heroContainer.style.opacity = "";
    heroContainer.style.transform = "";
    heroContainer.style.filter = "";
    targetFrameIndex = 0;
    actualFrameIndex = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
    drawFrame(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleEndWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleEndTouch, { passive: true });
    observer.observe(heroContainer);
    startRenderLoop();
  };

  // Initial trigger
  handleScroll();
}
