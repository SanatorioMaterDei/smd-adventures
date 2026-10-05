// Sonido: efectos 8-bit sintetizados con Web Audio y grabaciones reales de los animales.
// Un único interruptor (muted) silencia todo y se recuerda en este navegador.

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* sin almacenamiento: no pasa nada */ } },
};

const sound = {
  muted: store.get('bosque-muted') === '1',
  setMuted(value) {
    this.muted = value;
    store.set('bosque-muted', value ? '1' : '0');
    if (value) stopAnimalSounds();
  },
};

// ---------- Efectos sintetizados ----------
let audioCtx = null;

function getAudioCtx() {
  if (sound.muted) return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try { audioCtx = new Ctx(); } catch { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, { type = 'square', vol = .07, at = 0, to = 0 } = {}) {
  const c = getAudioCtx();
  if (!c) return;
  const t = c.currentTime + at, osc = c.createOscillator(), gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.linearRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + .02);
}

const sfx = {
  click: () => tone(740, .05, { vol: .05 }),
  next: () => tone(520, .035, { vol: .04 }),
  select: () => { tone(523, .08); tone(784, .12, { at: .08 }); },
  // step sube el tono en semitonos: cada manzana suena un poco más aguda que la anterior.
  good: (step = 0) => {
    const k = Math.pow(2, step / 12);
    tone(523 * k, .07, { vol: .06 });
    tone(784 * k, .12, { at: .07, vol: .06 });
  },
  bad: () => { tone(196, .12, { type: 'sawtooth', vol: .05 }); tone(147, .2, { type: 'sawtooth', vol: .05, at: .11 }); },
  hint: () => tone(880, .15, { type: 'triangle', vol: .08, to: 1175 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? .4 : .11, { at: i * .11, vol: .06 })),
};

// ---------- Grabaciones de animales (ver CREDITS.md) ----------
const SOUND_WORDS = { vaca: '¡Muuu!', gallina: '¡Co, co, co!', pato: '¡Cuac, cuac!', cerdo: '¡Oink, oink!', oveja: '¡Beee!', loba: '¡Auuuu!' };
const REPEAT = { cerdo: 2 }; // el gruñido del cerdo es muy corto: suena dos veces
const audioCache = {};
let repeatTimer;

function stopAnimalSounds() {
  clearTimeout(repeatTimer);
  Object.values(audioCache).forEach(a => a.pause());
  try { speechSynthesis.cancel(); } catch { /* sin voz */ }
}

function playAnimal(id) {
  if (sound.muted || !SOUND_WORDS[id]) return;
  stopAnimalSounds();
  const au = audioCache[id] || (audioCache[id] = new Audio(`sounds/${id}.mp3`));
  let times = REPEAT[id] || 1;
  const once = () => {
    au.currentTime = 0;
    au.onended = () => { if (--times > 0) repeatTimer = setTimeout(once, 150); };
    au.play().catch(() => say(SOUND_WORDS[id]));
  };
  once();
}

// Respaldo: si el audio no se puede reproducir, el navegador lee la onomatopeya en voz alta.
function say(text) {
  if (sound.muted || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[¡!]/g, ''));
    u.lang = 'es-AR';
    u.rate = .85;
    speechSynthesis.speak(u);
  } catch { /* sin voz */ }
}
