// Estado compartido, escenario y motor de diálogos.

const $ = id => document.getElementById(id);
const ui = {
  subtitle: $('subtitle'), message: $('message'),
  counterLabel: $('counterLabel'), counter: $('counterValue'), progressLabel: $('progressLabel'), progress: $('progressValue'),
  homeBtn: $('homeBtn'), soundBtn: $('soundToggle'),
  frame: $('frame'), forest: $('forest'),
  wolfChar: $('wolfChar'), foxChar: $('foxChar'), friendChar: $('friendChar'),
  dialog: $('dialog'), portrait: $('portrait'), speaker: $('speaker'), dlgText: $('dlgText'), dlgFull: $('dlgFull'), dlgNext: $('dlgNext'), dlgSkip: $('dlgSkip'),
  apples: $('apples'), numberPop: $('numberPop'),
  namer: $('namer'), slots: $('slots'), nameInput: $('nameInput'), hintBtn: $('hintBtn'),
  l3: $('l3'), bush: $('bush'), bubble: $('bubble'), listenBtn: $('listenBtn'), choices: $('choices'),
  menu: $('menu'), levels: $('levels'), diffBtns: [...document.querySelectorAll('[data-diff]')], fullscreenBtn: $('fullscreenBtn'),
  choose: $('choose'), chooseTitle: $('chooseTitle'), wolves: $('wolves'),
  complete: $('complete'), completeTitle: $('completeTitle'), completeText: $('completeText'), nextLevelBtn: $('nextLevelBtn'), replayBtn: $('replayBtn'), menuBtn: $('menuBtn'),
  idle: $('idle'), idleCount: $('idleCount'), idleStay: $('idleStay'),
};

const game = {
  phase: 'menu',      // menu | story | choose | play | name | sound | wait | done
  level: 1,
  wolf: 'gaby',
  difficulty: store.get('bosque-difficulty') === 'grandes' ? 'grandes' : 'chicos',
  run: 0,             // cambia en cada partida nueva; las demoras de una partida vieja se descartan
};

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isHard = () => game.difficulty === 'grandes';

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// setTimeout atado a la partida actual: si el jugador volvió al menú, no hace nada.
function later(fn, ms) {
  const run = game.run;
  return setTimeout(() => { if (run === game.run) fn(); }, ms);
}

function animate(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// Muestra un personaje con su animación de entrada (solo si cambió).
function enter(el, html, key = html) {
  if (!el.hidden && el.dataset.who === key) return;
  el.innerHTML = html;
  el.dataset.who = key;
  el.hidden = false;
  animate(el, 'enter');
}

function setHud(counterLabel, counter, progressLabel, progress) {
  ui.counterLabel.textContent = counterLabel;
  ui.counter.textContent = counter;
  ui.progressLabel.textContent = progressLabel;
  ui.progress.textContent = progress;
}

function setMessage(text, isError = false) {
  ui.message.textContent = text;
  ui.message.classList.toggle('error', isError);
}

// Deja el escenario vacío: oculta capas de juego y cancela lo pendiente de la partida anterior.
function clearStage() {
  game.run++;
  stopAnimalSounds();
  clearInterval(typingTimer);
  typingTimer = null;
  for (const el of [ui.dialog, ui.apples, ui.namer, ui.l3, ui.menu, ui.choose, ui.complete, ui.friendChar]) el.hidden = true;
  ui.numberPop.classList.remove('play');
}

// ---------- Diálogos ----------
let queue = [], lineIndex = 0, onStoryDone = null, typingTimer = null, fullText = '';

function speakerOf(line) {
  if (line.who === 'fox') return { name: 'Kamy', cls: 'fox', face: foxFace };
  if (line.who === 'wolf') return { name: WOLVES[game.wolf].name, cls: 'wolf', face: wolfFace(game.wolf) };
  if (line.who === 'animal') return { name: line.animal.name, cls: 'wolf', face: spriteSVG(line.animal.art, APAL) };
  return { name: 'Narrador', cls: '', face: appleSvg };
}

function story(lines, done) {
  game.phase = 'story';
  queue = lines;
  lineIndex = 0;
  onStoryDone = done;
  ui.apples.hidden = ui.namer.hidden = ui.l3.hidden = true;
  ui.dialog.hidden = false;
  setMessage('Tocá el cuadro de diálogo para seguir la historia.');
  showLine();
  ui.dlgNext.focus({ preventScroll: true });
}

function showLine() {
  const line = queue[lineIndex], who = speakerOf(line);
  if (line.fox || line.who === 'fox') enter(ui.foxChar, foxSvg);
  ui.speaker.textContent = who.name;
  ui.speaker.className = 'speaker ' + who.cls;
  ui.portrait.innerHTML = who.face;
  ui.dlgFull.textContent = who.name + ': ' + line.text;
  clearInterval(typingTimer);
  fullText = line.text;
  if (line.who === 'fox') animate(ui.foxChar, 'laugh');
  if (line.who === 'wolf') animate(ui.wolfChar, 'hop');
  if (line.who === 'animal') { animate(ui.friendChar, 'hop'); playAnimal(line.animal.id); }
  if (reducedMotion) { ui.dlgText.textContent = fullText; typingTimer = null; return; }
  let i = 0;
  ui.dlgText.textContent = '';
  typingTimer = setInterval(() => {
    i += 1;
    ui.dlgText.textContent = fullText.slice(0, i);
    if (i >= fullText.length) { clearInterval(typingTimer); typingTimer = null; }
  }, 26);
}

// Primer toque: completa el texto. Segundo toque: pasa a la línea siguiente.
function advance() {
  if (game.phase !== 'story') return;
  sfx.next();
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
    ui.dlgText.textContent = fullText;
    return;
  }
  lineIndex++;
  if (lineIndex < queue.length) showLine();
  else endStory();
}

function endStory() {
  clearInterval(typingTimer);
  typingTimer = null;
  ui.dialog.hidden = true;
  const done = onStoryDone;
  onStoryDone = null;
  if (done) done();
}

ui.dialog.addEventListener('click', e => { if (!e.target.closest('#dlgSkip')) advance(); });
ui.dlgSkip.addEventListener('click', () => { if (game.phase === 'story') endStory(); });
