// High-Fidelity Web Audio Mechanical Tick Synthesizer
let audioCtx = null;
let tickBuffer = null;
let lastTickTimestamp = 0;

export function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      tickBuffer = generateTickBuffer(audioCtx);
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// Generate realistic acoustic mechanical pawl click buffer (28ms)
function generateTickBuffer(ctx) {
  const sampleRate = ctx.sampleRate;
  const duration = 0.028; // 28ms
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Exponential damp envelope
    const env = Math.exp(-t * 260);
    // Transient metallic/plastic pip (1900Hz decaying rapidly to 300Hz)
    const freq = 1900 * Math.exp(-t * 220) + 260;
    const tone = Math.sin(2 * Math.PI * freq * t);
    // Resonant wooden / mechanical chamber body
    const body = Math.sin(2 * Math.PI * 480 * t) * Math.exp(-t * 140);
    // Subtle friction noise
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 400) * 0.28;
    
    channel[i] = (tone * 0.65 + body * 0.35 + noise) * env;
  }
  return buffer;
}

export function playTickSound(volume = 0.38) {
  try {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    // Debounce slightly to prevent audio artifacting if called multiple times in same frame
    if (now - lastTickTimestamp < 0.025) return;
    lastTickTimestamp = now;

    if (!tickBuffer) {
      tickBuffer = generateTickBuffer(audioCtx);
    }

    const source = audioCtx.createBufferSource();
    source.buffer = tickBuffer;
    // Organic pitch variation (+/- 4%) so every tick feels tactile and non-robotic
    source.playbackRate.value = 0.98 + (Math.random() * 0.06 - 0.03);

    // Filter to keep the click crisp and avoid low rumble
    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 180;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.start(now);
  } catch (e) {
    // Graceful fallback if audio is blocked
  }
}

// Ensure audio context is unblocked on first user gesture
if (typeof window !== "undefined") {
  const unlockEvents = ["pointerdown", "click", "touchstart", "wheel", "keydown"];
  const unlockHandler = () => {
    initAudioContext();
    unlockEvents.forEach(evt => window.removeEventListener(evt, unlockHandler));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, unlockHandler, { passive: true }));
}
