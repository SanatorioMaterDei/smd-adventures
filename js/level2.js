// Nivel 2: la loba presenta a sus amigos y el jugador escribe el nombre de cada uno.
// Para chicos: casillas con la cantidad de letras y pista automática al segundo error.
// Para grandes: sin casillas ni pista automática (la pista sigue disponible con el botón).

const GREETINGS = {
  vaca: '¡Muuu! Hola, soy la vaca. Doy leche y me encanta comer pasto.',
  gallina: '¡Co, co, co! Soy la gallina. Cada mañana pongo huevos en mi nido.',
  pato: '¡Cuac, cuac! Soy el pato. Me encanta nadar en la laguna.',
  cerdo: '¡Oink, oink! Soy el cerdo. Me gusta jugar en el barro.',
  conejo: '¡Hola! Soy el conejo. Salto muy alto y como zanahorias.',
  oveja: '¡Beee! Soy la oveja. Con mi lana se hacen abrigos calentitos.',
};

// Compara sin mayúsculas ni tildes: "Pato", "PATO" y "patò" valen igual.
const normalize = t => t.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const level2 = { friends: [], index: 0, hints: 0, misses: 0 };

function startLevel2() {
  clearStage();
  game.level = 2;
  ui.subtitle.textContent = `Escribí el nombre de cada amigo de ${WOLVES[game.wolf].name}.`;
  setHud('Nivel', '2', 'Amigos', `0 / ${ANIMALS.length}`);
  enter(ui.foxChar, foxSvg);
  story([
    { who: 'wolf', text: '¡Hola otra vez! Hoy quiero presentarte a mis amigos del bosque.' },
    { who: 'fox', text: '¿Amigos? ¡Je, je! Yo no tengo ninguno… Bueno, ¿puedo ir con ustedes?' },
    { who: 'wolf', text: '¡Claro, Kamy! Cada amigo va a salir a saludar. ¿Me ayudás a escribir su nombre?' },
    { who: 'narr', text: 'Mirá bien al animal y escribí cómo se llama. Si no te sale, tocá Pista.' },
  ], () => {
    level2.friends = shuffle(ANIMALS.slice());
    level2.index = 0;
    showFriend();
  });
}

const currentFriend = () => level2.friends[level2.index];

function showFriend() {
  game.phase = 'name';
  const a = currentFriend();
  level2.hints = 0;
  level2.misses = 0;
  ui.friendChar.dataset.who = '';
  enter(ui.friendChar, spriteSVG(a.art, APAL), a.id);
  ui.nameInput.value = '';
  ui.slots.hidden = isHard();
  renderSlots();
  ui.namer.hidden = false;
  setMessage(isHard() ? '¿Quién es este amigo?' : `¿Quién es este amigo? Tiene ${a.name.length} letras.`);
  ui.nameInput.focus({ preventScroll: true });
}

// Una casilla por letra: muestra lo que se va escribiendo y, en gris, las letras de pista.
function renderSlots(solved = false) {
  const answer = currentFriend().name.toUpperCase(), typed = ui.nameInput.value.toUpperCase();
  ui.slots.replaceChildren(...[...answer].map((ch, i) => {
    const box = document.createElement('span');
    box.className = 'slot' + (solved ? ' ok' : '');
    if (typed[i]) box.textContent = typed[i];
    else if (i < level2.hints) { box.textContent = ch; box.classList.add('hint'); }
    return box;
  }));
}

function giveHint() {
  sfx.hint();
  const answer = currentFriend().name;
  if (level2.hints < answer.length - 1) level2.hints++;
  renderSlots();
  setMessage(`Empieza con ${answer.slice(0, level2.hints).toUpperCase()}…`);
  ui.nameInput.focus({ preventScroll: true });
}

ui.nameInput.addEventListener('input', () => { if (game.phase === 'name') renderSlots(); });
ui.hintBtn.addEventListener('click', () => { if (game.phase === 'name') giveHint(); });

ui.namer.addEventListener('submit', e => {
  e.preventDefault();
  if (game.phase !== 'name') return;
  const a = currentFriend(), guess = normalize(ui.nameInput.value);
  if (!guess) { setMessage('Escribí el nombre del animal y tocá Listo.'); return; }

  if (guess !== normalize(a.name)) {
    level2.misses++;
    sfx.bad();
    animate(ui.namer, 'shake');
    animate(ui.foxChar, 'laugh');
    const autoHint = !isHard() && level2.misses >= 2;
    setMessage('¡Je, je! Ese no es. Mirá bien al animal.' + (autoHint ? ' Te doy una pista.' : ''), true);
    if (autoHint) giveHint(); else ui.nameInput.select();
    return;
  }

  sfx.good(4);
  game.phase = 'wait';
  ui.nameInput.value = a.name.toUpperCase();
  ui.slots.hidden = false;
  renderSlots(true);
  ui.progress.textContent = `${level2.index + 1} / ${level2.friends.length}`;
  setMessage(`¡Muy bien! Es ${a.article} ${a.name.toLowerCase()}.`);
  later(() => story([{ who: 'animal', animal: a, text: GREETINGS[a.id] }], () => {
    level2.index++;
    if (level2.index < level2.friends.length) showFriend();
    else finishLevel2();
  }), 700);
});

function finishLevel2() {
  story([
    { who: 'fox', text: '¡Cuántos amigos! Ahora yo también quiero ser amigo de todos.' },
    { who: 'wolf', text: '¡Bienvenido, Kamy! Pero nada de travesuras, ¿eh?' },
  ], () => levelComplete(2, '¡Nivel 2 completo!', `Conociste a los ${level2.friends.length} amigos del bosque de ${WOLVES[game.wolf].name}.`));
}
