// Nivel 1: Kamy desordenó las manzanas y hay que juntarlas en orden.
// Para chicos: del 1 al 10. Para grandes: del 1 al 20.

const APPLE_SPOTS_10 = [
  { x: 9, y: 30 }, { x: 22, y: 23 }, { x: 17, y: 42 }, { x: 27, y: 37 }, { x: 43, y: 22 },
  { x: 54, y: 30 }, { x: 61, y: 44 }, { x: 76, y: 28 }, { x: 87, y: 23 }, { x: 84, y: 43 },
];

// Para 20 manzanas: grilla de 5 × 4 con un poco de desorden para que no se vea rígida.
function appleSpots20() {
  const spots = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      spots.push({
        x: 10 + col * 20 + (row % 2 ? 4 : -4) + (Math.random() * 4 - 2),
        y: 17 + row * 11 + (Math.random() * 3 - 1.5),
      });
    }
  }
  return spots;
}

const level1 = { max: 10, expected: 1, locked: false };

const READY_LINES = {
  gaby: max => `¡Yo me encargo, Kamy! Las voy a juntar del 1 al ${max}, una por una.`,
  mary: () => 'Tranquilos, tengo buen olfato. ¡Empiezo por la manzana 1!',
  ely: () => '¡A contar se ha dicho! Uno, dos, tres… ¡vamos!',
};

function introLevel1() {
  const max = isHard() ? 20 : 10;
  return [
    { who: 'narr', text: `En el Bosque de números, los manzanos dan manzanas con números del 1 al ${max}. Cada mañana, los animales las juntan en orden.` },
    { who: 'narr', text: 'Pero esta mañana, entre los arbustos, se escuchó una risita…', fox: true },
    { who: 'fox', text: '¡Je, je! Soy Kamy. Anoche desordené todas las manzanas del bosque. ¡Nadie va a poder juntarlas en orden!' },
    { who: 'narr', text: 'Tres lobas escucharon el alboroto y vinieron corriendo. ¿Quién va a ayudar al bosque?' },
  ];
}

// Después de elegir loba: ella responde y Kamy la desafía.
function readyLevel1() {
  const max = isHard() ? 20 : 10;
  story([
    { who: 'wolf', text: READY_LINES[game.wolf](max) },
    { who: 'fox', text: '¡Ja! Eso quiero verlo. Las manzanas están todas mezcladas.' },
  ], startLevel1);
}

function startLevel1() {
  clearStage();
  game.level = 1;
  game.phase = 'play';
  level1.max = isHard() ? 20 : 10;
  level1.expected = 1;
  level1.locked = false;
  const { max } = level1;

  enter(ui.foxChar, foxSvg);
  ui.subtitle.textContent = `Ayudá a ${WOLVES[game.wolf].name} a juntar las manzanas del 1 al ${max}.`;
  setHud('Buscá el', '1', 'Encontradas', `0 / ${max}`);
  setMessage('Empezá buscando la manzana 1.');

  const spots = max === 20 ? appleSpots20() : APPLE_SPOTS_10;
  const numbers = shuffle(Array.from({ length: max }, (_, i) => i + 1));
  ui.apples.classList.toggle('many', max === 20);
  ui.apples.replaceChildren(...spots.map((spot, i) => {
    const n = numbers[i], btn = document.createElement('button');
    btn.className = 'apple';
    btn.style.left = spot.x + '%';
    btn.style.top = spot.y + '%';
    btn.setAttribute('aria-label', 'Manzana número ' + n);
    btn.innerHTML = appleSvg + '<b>' + n + '</b>';
    btn.addEventListener('click', () => pickApple(btn, n));
    return btn;
  }));
  ui.apples.hidden = false;
}

function pickApple(btn, n) {
  if (level1.locked || game.phase !== 'play') return;
  const { max } = level1;
  if (n !== level1.expected) {
    animate(btn, 'shake');
    sfx.bad();
    animate(ui.foxChar, 'laugh');
    setMessage(`¡Je, je! Ese no es. Buscá el número ${level1.expected}. ¡Vos podés!`, true);
    return;
  }
  level1.locked = true;
  sfx.good(Math.round((n - 1) * 9 / (max - 1)));
  btn.classList.add('picked');
  ui.numberPop.textContent = n;
  animate(ui.numberPop, 'play');
  animate(ui.wolfChar, 'hop');
  ui.progress.textContent = `${n} / ${max}`;
  setMessage(n === max ? '¡Encontraste todas!' : `¡Bien! Ahora buscá el ${n + 1}.`);
  level1.expected++;
  ui.counter.textContent = level1.expected <= max ? level1.expected : '✓';
  later(() => {
    level1.locked = false;
    if (level1.expected > max) finishLevel1();
  }, 700);
}

function finishLevel1() {
  story([
    { who: 'fox', text: '¡Uy! Juntaste todas las manzanas en orden… Perdón, bosque. No lo voy a hacer más.' },
    { who: 'wolf', text: `¡Gracias por ayudar! Ahora todos podemos contar del 1 al ${level1.max}.` },
  ], () => levelComplete(1, '¡Nivel 1 completo!', `${WOLVES[game.wolf].name} y vos ordenaron todas las manzanas del bosque.`));
}
