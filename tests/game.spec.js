// Juega los tres niveles de punta a punta, como lo haría un chico.
const { test, expect } = require('@playwright/test');

// Atajo: abre el juego con niveles ya completados (lo que guarda el navegador).
async function openWith(page, { done = [], difficulty, path = '/' } = {}) {
  await page.addInitScript(([done, difficulty]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('bosque-done', JSON.stringify(done));
    if (difficulty) localStorage.setItem('bosque-difficulty', difficulty);
    localStorage.setItem('bosque-muted', '1'); // sin sonido durante las pruebas
  }, [done, difficulty]);
  await page.goto(path);
}

const skip = page => page.locator('#dlgSkip').click();

async function pickWolf(page, wolf = 'gaby') {
  await expect(page.locator('#choose')).toBeVisible();
  await page.locator(`#wolf-${wolf}`).click();
}

test('el menú arranca con solo el nivel 1 disponible', async ({ page }) => {
  await openWith(page);
  await expect(page.locator('#level-1')).toBeEnabled();
  await expect(page.locator('#level-2')).toBeDisabled();
  await expect(page.locator('#level-3')).toBeDisabled();
  await expect(page.locator('#progressValue')).toHaveText('0 / 3');
});

test('nivel 1: juntar las manzanas del 1 al 10 desbloquea el nivel 2', async ({ page }) => {
  await openWith(page);
  await page.locator('#level-1').click();
  await skip(page);                       // historia inicial
  await pickWolf(page, 'mary');
  await skip(page);                       // la loba acepta el desafío
  await expect(page.locator('.apple')).toHaveCount(10);

  await page.locator('.apple[aria-label="Manzana número 3"]').click();
  await expect(page.locator('#message')).toContainText('Buscá el número 1');

  for (let n = 1; n <= 10; n++) {
    await page.waitForFunction(() => !level1.locked);   // espera que termine la animación del número
    await page.locator(`.apple[aria-label="Manzana número ${n}"]`).click();
    await expect(page.locator('#progressValue')).toHaveText(`${n} / 10`);
  }
  await skip(page);                       // Kamy pide perdón
  await expect(page.locator('#completeTitle')).toHaveText('¡Nivel 1 completo!');

  await page.locator('#menuBtn').click();
  await expect(page.locator('#level-2')).toBeEnabled();
  await expect(page.locator('#progressValue')).toHaveText('1 / 3');
});

test('nivel 1 para grandes usa 20 manzanas', async ({ page }) => {
  await openWith(page, { difficulty: 'grandes' });
  await page.locator('#level-1').click();
  await skip(page);
  await pickWolf(page);
  await skip(page);
  await expect(page.locator('.apple')).toHaveCount(20);
  await expect(page.locator('#progressValue')).toHaveText('0 / 20');
});

test('nivel 2: escribir el nombre de los 6 amigos, con pista y sin tildes', async ({ page }) => {
  await openWith(page, { done: [1] });
  await page.locator('#level-2').click();
  await pickWolf(page, 'ely');
  await skip(page);

  for (let i = 0; i < 6; i++) {
    await page.waitForFunction(() => game.phase === 'name');
    const name = await page.evaluate(() => currentFriend().name);
    if (i === 0) {
      // Dos errores seguidos dan una pista automática con la primera letra.
      await page.fill('#nameInput', 'perro');
      await page.locator('#nameOk').click();
      await page.fill('#nameInput', 'gato');
      await page.locator('#nameOk').click();
      await expect(page.locator('#message')).toContainText(`Empieza con ${name[0].toUpperCase()}`);
    }
    await page.fill('#nameInput', name.toUpperCase());
    await page.locator('#nameOk').click();
    await expect(page.locator('#progressValue')).toHaveText(`${i + 1} / 6`);
    await skip(page);                     // el amigo saluda
  }
  await skip(page);                       // cierre del nivel
  await expect(page.locator('#completeTitle')).toHaveText('¡Nivel 2 completo!');
});

test('nivel 3: reconocer a cada amigo por su sonido', async ({ page }) => {
  await openWith(page, { done: [1, 2] });
  await page.locator('#level-3').click();
  await pickWolf(page, 'gaby');
  await skip(page);

  for (let i = 0; i < 6; i++) {
    await page.waitForFunction(() => game.phase === 'sound');   // ronda nueva lista
    const target = await page.evaluate(() => level3.rounds[level3.index].name);
    const wrong = page.locator('#choices .card-btn').filter({ hasNotText: target }).first();
    await wrong.click();
    await expect(wrong).toBeDisabled();
    await page.locator(`#choices .card-btn[aria-label="${target}"]`).click();
    await expect(page.locator('#progressValue')).toHaveText(`${i + 1} / 6`);
  }
  await expect(page.locator('#dialog')).toBeVisible();
  await skip(page);
  await expect(page.locator('#completeTitle')).toHaveText('¡Nivel 3 completo!');
  await expect(page.locator('#nextLevelBtn')).toBeHidden();
});

test('nivel 3 para grandes muestra 4 opciones y no escribe el sonido', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bosque-done', '[1,2]');
    localStorage.setItem('bosque-difficulty', 'grandes');
  });
  await page.goto('/');
  await page.locator('#level-3').click();
  await pickWolf(page);
  await skip(page);
  await expect(page.locator('#choices .card-btn')).toHaveCount(4);
  await expect(page.locator('#bubble')).toHaveText('¿Quién será?');
});

test('el botón de sonido se recuerda al volver a abrir', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#soundToggle')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#soundToggle').click();
  await expect(page.locator('#soundToggle')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('#soundToggle')).toHaveAttribute('aria-pressed', 'false');
});

test('el botón de inicio vuelve al menú en medio de un nivel', async ({ page }) => {
  await openWith(page);
  await page.locator('#level-1').click();
  await skip(page);
  await pickWolf(page);
  await skip(page);
  await page.locator('#homeBtn').click();
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator('.apple')).toHaveCount(10); // quedan en el DOM pero ocultas
  await expect(page.locator('#apples')).toBeHidden();
});

test('modo sala de espera: niveles abiertos y vuelta al menú por inactividad', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?sala');
  await expect(page.locator('#level-3')).toBeEnabled();
  await page.locator('#level-1').click();
  await expect(page.locator('#dialog')).toBeVisible();

  await page.clock.fastForward(91_000);
  await expect(page.locator('#idle')).toBeVisible();
  await page.clock.runFor(16_000);
  await expect(page.locator('#idle')).toBeHidden();
  await expect(page.locator('#menu')).toBeVisible();

  // El modo queda guardado en el dispositivo hasta abrir con ?casa.
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/kiosk/);
  await page.goto('/?casa');
  await expect(page.locator('body')).not.toHaveClass(/kiosk/);
});

test('el juego funciona sin conexión después de la primera visita', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#level-1')).toBeVisible();
  const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Press Start 2P"'); });
  expect(fontsOk).toBe(true);
  await context.setOffline(false);
});
