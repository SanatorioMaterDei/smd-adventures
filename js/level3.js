// Nivel 3: Kamy esconde a los amigos detrás de un arbusto y el jugador los reconoce por su sonido.
// Para chicos: 3 opciones y el globo muestra la onomatopeya.
// Para grandes: 4 opciones y solo se escucha (si el sonido está apagado, el globo vuelve a mostrar el texto).

const level3 = { rounds: [], index: 0 };

const lobaFriend = () => ({ id: 'loba', name: WOLVES[game.wolf].name, art: WOLF, pal: wolfPal(game.wolf), article: '' });
const plainWord = id => SOUND_WORDS[id].replace(/[¡!]/g, '').toLowerCase();

function startLevel3() {
  clearStage();
  game.level = 3;
  ui.subtitle.textContent = 'Escuchá el sonido y encontrá al amigo escondido.';
  // El conejo no hace un sonido reconocible: solo aparece como opción. La loba siempre cierra el nivel.
  level3.rounds = [...shuffle(ANIMALS.filter(a => SOUND_WORDS[a.id])), lobaFriend()];
  level3.index = 0;
  setHud('Nivel', '3', 'Encontrados', `0 / ${level3.rounds.length}`);
  enter(ui.foxChar, foxSvg);
  story([
    { who: 'fox', text: '¡Je, je! Tengo un juego nuevo: escondí a todos los amigos detrás de los arbustos.' },
    { who: 'wolf', text: '¡Kamy! Bueno… los vamos a encontrar por cómo suenan.' },
    { who: 'narr', text: 'Escuchá el sonido que sale del arbusto y tocá al animal que lo hace. Con Escuchar lo oís otra vez.' },
  ], showRound);
}

function showRound() {
  game.phase = 'sound';
  const target = level3.rounds[level3.index];
  const optionCount = isHard() ? 4 : 3;
  const others = shuffle([...ANIMALS, lobaFriend()].filter(x => x.id !== target.id)).slice(0, optionCount - 1);
  const options = shuffle([target, ...others]);
  const showText = !isHard() || sound.muted;

  ui.bubble.textContent = showText ? SOUND_WORDS[target.id] : '¿Quién será?';
  animate(ui.bush, 'rustle');
  ui.l3.hidden = false;
  setMessage(showText ? `¿Quién hace ${plainWord(target.id)}?` : 'Escuchá bien: ¿quién está detrás del arbusto?');

  ui.choices.classList.toggle('four', optionCount === 4);
  ui.choices.replaceChildren(...options.map(o => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'card-btn';
    b.setAttribute('aria-label', o.name);
    b.innerHTML = `<span class="pic">${spriteSVG(o.art, o.pal || APAL)}</span><strong>${o.name}</strong>`;
    b.addEventListener('click', () => guessSound(b, o, target));
    return b;
  }));
  playAnimal(target.id);
  ui.choices.querySelector('button')?.focus({ preventScroll: true });
}

ui.listenBtn.addEventListener('click', () => {
  if (game.phase !== 'sound') return;
  animate(ui.bush, 'rustle');
  playAnimal(level3.rounds[level3.index].id);
});

function guessSound(btn, option, target) {
  if (game.phase !== 'sound') return;
  if (option.id !== target.id) {
    sfx.bad();
    btn.disabled = true;
    animate(btn, 'shake');
    animate(ui.foxChar, 'laugh');
    setMessage(`¡Je, je! ${option.name} no hace ${plainWord(target.id)}. Probá otra vez.`, true);
    return;
  }
  sfx.good(4);
  game.phase = 'wait';
  btn.classList.add('ok');
  animate(btn, 'bounce');
  if (target.id === 'loba') animate(ui.wolfChar, 'hop');
  ui.progress.textContent = `${level3.index + 1} / ${level3.rounds.length}`;
  ui.bubble.textContent = SOUND_WORDS[target.id];
  setMessage(target.id === 'loba'
    ? `¡Era ${target.name}! ¡Auuuu!`
    : `¡Sí! ${target.article === 'el' ? 'El' : 'La'} ${target.name.toLowerCase()} dice ${plainWord(target.id)}.`);
  later(() => {
    level3.index++;
    if (level3.index < level3.rounds.length) showRound();
    else finishLevel3();
  }, 1100);
}

function finishLevel3() {
  story([
    { who: 'wolf', text: '¡Encontramos a todos! Y el último aullido era mío. ¡Auuuu!' },
    { who: 'fox', text: 'Ustedes ganan. ¡Qué buen equipo hacemos todos juntos!' },
  ], () => levelComplete(3, '¡Nivel 3 completo!', 'Encontraste a todos los amigos por su sonido.'));
}
