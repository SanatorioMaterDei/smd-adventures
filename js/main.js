// Menú de niveles, elección de loba, progreso guardado, modo sala de espera y arranque.

const LEVELS = [
  { n: 1, title: 'Manzanas', desc: () => `Ordená del 1 al ${isHard() ? 20 : 10}`, pic: () => appleSvg, start: () => story(introLevel1(), () => openChoose()) },
  { n: 2, title: 'Amigos', desc: () => 'Escribí sus nombres', pic: () => spriteSVG(VACA, APAL), start: () => openChoose() },
  { n: 3, title: 'Sonidos', desc: () => '¿Quién hace ese ruido?', pic: () => icon('soundOn', '#2c8558'), start: () => openChoose() },
];

// ---------- Progreso (se guarda en este navegador) ----------
const KIOSK_IDLE_MS = 90_000;   // sin tocar nada durante 90 s aparece "¿Seguís jugando?"
const KIOSK_COUNTDOWN = 15;     // segundos antes de volver al menú

const params = new URLSearchParams(location.search);
if (location.hash === '#sala' || params.has('sala')) store.set('bosque-kiosk', '1');
if (location.hash === '#casa' || params.has('casa')) store.set('bosque-kiosk', '0');
const kiosk = store.get('bosque-kiosk') === '1';

function loadDone() {
  try { return new Set(JSON.parse(store.get('bosque-done') || '[]')); } catch { return new Set(); }
}
const done = loadDone();
const isUnlocked = n => kiosk || n === 1 || done.has(n - 1);

function levelComplete(n, title, text) {
  done.add(n);
  store.set('bosque-done', JSON.stringify([...done]));
  game.phase = 'done';
  sfx.win();
  ui.completeTitle.textContent = title;
  ui.completeText.textContent = text;
  ui.nextLevelBtn.hidden = n === LEVELS.length;
  ui.complete.hidden = false;
  (ui.nextLevelBtn.hidden ? ui.replayBtn : ui.nextLevelBtn).focus({ preventScroll: true });
}

// ---------- Menú ----------
function openMenu() {
  clearStage();
  game.phase = 'menu';
  ui.wolfChar.hidden = true;
  enter(ui.foxChar, foxSvg);
  ui.homeBtn.hidden = true;
  ui.subtitle.textContent = 'Elegí un nivel para jugar.';
  setHud('Nivel', '–', 'Completados', `${[...done].filter(n => n <= LEVELS.length).length} / ${LEVELS.length}`);
  setMessage(kiosk ? '¡Hola! Tocá un nivel para empezar.' : 'Tocá un nivel para empezar. Los niveles se desbloquean al completar el anterior.');
  renderMenu();
  ui.menu.hidden = false;
  ui.levels.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
}

function renderMenu() {
  ui.levels.replaceChildren(...LEVELS.map(level => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'card-btn level-btn';
    b.id = 'level-' + level.n;
    const open = isUnlocked(level.n);
    b.disabled = !open;
    b.innerHTML = `<span class="pic">${level.pic()}</span><strong>Nivel ${level.n}</strong><small>${level.title}</small>` +
      (open ? `<small>${level.desc()}</small>` : '<span class="lock">Bloqueado</span>');
    b.setAttribute('aria-label', `Nivel ${level.n}: ${level.title}` + (open ? '' : ' (bloqueado)'));
    b.addEventListener('click', () => {
      sfx.select();
      game.level = level.n;
      ui.menu.hidden = true;
      ui.homeBtn.hidden = false;
      level.start();
    });
    return b;
  }));
  ui.diffBtns.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.diff === game.difficulty)));
}

ui.diffBtns.forEach(btn => btn.addEventListener('click', () => {
  game.difficulty = btn.dataset.diff;
  store.set('bosque-difficulty', game.difficulty);
  renderMenu();
}));

// ---------- Elegir loba ----------
function openChoose() {
  game.phase = 'choose';
  ui.dialog.hidden = true;
  enter(ui.foxChar, foxSvg);
  ui.chooseTitle.textContent = game.level === 1 ? '¿Quién ayuda al bosque?' : '¿Con quién jugás?';
  ui.choose.hidden = false;
  setMessage('Elegí una loba.');
  ui.wolves.querySelector('button')?.focus({ preventScroll: true });
}

ui.wolves.replaceChildren(...Object.entries(WOLVES).map(([k, w]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'card-btn';
  b.id = 'wolf-' + k;
  b.innerHTML = `<span class="pic">${wolfSvg(k)}</span><strong>${w.name}</strong><small>${w.color[0].toUpperCase() + w.color.slice(1)}</small>`;
  b.addEventListener('click', () => {
    sfx.select();
    game.wolf = k;
    ui.choose.hidden = true;
    ui.wolfChar.dataset.who = '';
    enter(ui.wolfChar, wolfSvg(k), k);
    if (game.level === 1) readyLevel1();
    else if (game.level === 2) startLevel2();
    else startLevel3();
  });
  return b;
}));

// ---------- Nivel completo ----------
const START = { 1: startLevel1, 2: startLevel2, 3: startLevel3 };

ui.nextLevelBtn.addEventListener('click', () => START[game.level + 1]());
ui.replayBtn.addEventListener('click', () => {
  if (game.level === 1) {
    clearStage();
    story([{ who: 'fox', text: '¡Je, je! Las volví a mezclar. ¿Podrás ordenarlas otra vez?' }], startLevel1);
  } else START[game.level]();
});
ui.menuBtn.addEventListener('click', openMenu);
ui.homeBtn.addEventListener('click', openMenu);

// ---------- Sonido ----------
function renderSoundBtn() {
  ui.soundBtn.innerHTML = icon(sound.muted ? 'soundOff' : 'soundOn', sound.muted ? '#9a8f7a' : '#28543d');
  ui.soundBtn.setAttribute('aria-pressed', String(!sound.muted));
  ui.soundBtn.setAttribute('aria-label', sound.muted ? 'Sonido desactivado' : 'Sonido activado');
}
ui.soundBtn.addEventListener('click', () => {
  sound.setMuted(!sound.muted);
  renderSoundBtn();
  sfx.click();
});

// "Blip" para los botones comunes; los de respuesta tienen su propio sonido.
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled || b === ui.soundBtn) return;
  if (b.matches('.apple, .card-btn, #nameOk, #hintBtn, .dlg-next')) return;
  sfx.click();
}, true);

// ---------- Pantalla completa ----------
const canFullscreen = !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
ui.fullscreenBtn.hidden = !canFullscreen;
ui.fullscreenBtn.addEventListener('click', () => {
  const req = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  Promise.resolve(req).catch(() => setMessage('Este navegador no permite pantalla completa acá.'));
});

// ---------- Modo sala de espera ----------
// Abrir el juego con #sala (o ?sala) lo activa en este dispositivo; #casa lo desactiva.
// Desbloquea todos los niveles, oculta los créditos, evita el menú del toque largo,
// mantiene la pantalla encendida y vuelve al menú si nadie juega por un rato.
let lastActivity = Date.now(), idleTimer = null;

function startIdleCountdown() {
  let left = KIOSK_COUNTDOWN;
  ui.idleCount.textContent = left;
  ui.idle.hidden = false;
  ui.idleStay.focus({ preventScroll: true });
  idleTimer = setInterval(() => {
    left--;
    ui.idleCount.textContent = left;
    if (left <= 0) {
      clearInterval(idleTimer);
      ui.idle.hidden = true;
      openMenu();
    }
  }, 1000);
}

function keepPlaying() {
  clearInterval(idleTimer);
  ui.idle.hidden = true;
  lastActivity = Date.now();
}

let wakeLock = null;
async function keepScreenOn() {
  if (wakeLock || !('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch { /* el navegador no lo permite */ }
}

if (kiosk) {
  document.body.classList.add('kiosk');
  for (const type of ['pointerdown', 'keydown', 'input']) {
    document.addEventListener(type, () => { if (ui.idle.hidden) lastActivity = Date.now(); keepScreenOn(); }, true);
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepScreenOn(); });
  ui.idleStay.addEventListener('click', keepPlaying);
  setInterval(() => {
    if (game.phase !== 'menu' && ui.idle.hidden && Date.now() - lastActivity > KIOSK_IDLE_MS) startIdleCountdown();
  }, 1000);
}

// ---------- Sin conexión ----------
// El service worker guarda el juego en el dispositivo para que funcione aunque se caiga el wifi.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin soporte en este contexto */ });
}

// ---------- Herramienta para asistentes (WebMCP) ----------
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  try {
    Promise.resolve(modelContext.registerTool({
      name: 'choose_apple',
      title: 'Elegir manzana',
      description: 'Elige una manzana numerada del nivel 1 y muestra el resultado en el juego.',
      inputSchema: { type: 'object', properties: { number: { type: 'integer', minimum: 1, maximum: 20 } }, required: ['number'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const n = input?.number;
        if (!Number.isInteger(n) || n < 1 || n > level1.max) throw new Error(`El número debe estar entre 1 y ${level1.max}.`);
        if (game.phase !== 'play') throw new Error('Primero entrá al nivel 1 y elegí una loba.');
        if (level1.locked || level1.expected > level1.max) throw new Error('Esperá a que termine la animación o reiniciá la partida.');
        const button = [...ui.apples.querySelectorAll('.apple')].find(el => el.getAttribute('aria-label') === 'Manzana número ' + n);
        if (!button || button.classList.contains('picked')) throw new Error('Esa manzana ya fue elegida.');
        button.click();
        return { chosen: n, correct: n === level1.expected - 1, next: level1.expected <= level1.max ? level1.expected : null, completed: level1.expected > level1.max };
      },
    })).catch(() => {});
  } catch { /* sin soporte */ }
}

// ---------- Arranque ----------
mountForest(ui.forest);
ui.bush.innerHTML = bushSvg;
ui.homeBtn.innerHTML = icon('home', '#28543d');

renderSoundBtn();
openMenu();
