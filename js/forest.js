// Fondo del bosque dibujado en un canvas de baja resolución que el CSS agranda sin suavizar.
// Hay dos composiciones: apaisada (pantallas anchas) y vertical (celular), para que los píxeles nunca se estiren.

const FOREST_LAYOUTS = {
  wide: {
    w: 480, h: 270,
    clouds: [[30, 24], [183, 42], [380, 18]],
    pines: { count: 12, gap: 48, jitter: 28, y: 100, spread: 34, scale: .65 },
    trees: [[76, 88, 1.05], [246, 83, 1.12], [410, 91, 1.03]],
  },
  tall: {
    w: 240, h: 300,
    clouds: [[12, 30], [150, 52]],
    pines: { count: 7, gap: 36, jitter: 16, y: 148, spread: 22, scale: .6 },
    trees: [[52, 134, .82], [190, 128, .88]],
  },
};

function drawForest(canvas, layoutName) {
  const L = FOREST_LAYOUTS[layoutName];
  const { w: W, h: H } = L;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Semilla fija: el bosque se ve igual cada vez que se dibuja.
  let seed = 17;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const y = f => H * f; // alturas como fracción del alto, iguales en ambas composiciones

  function cloud(x, cy) {
    rect(x + 8, cy, 38, 10, '#e6fbec');
    rect(x, cy + 8, 65, 12, '#e6fbec');
    rect(x + 14, cy - 5, 24, 6, '#e6fbec');
    rect(x + 4, cy + 18, 56, 4, '#c5e9d4');
  }

  function pine(x, py, s) {
    rect(x - 3 * s, py, 6 * s, 75 * s, '#41664b');
    for (let i = 0; i < 3; i++) {
      const yy = py + i * 15 * s;
      rect(x - (18 - i * 3) * s, yy + 15 * s, (36 - i * 6) * s, 9 * s, '#397a55');
      rect(x - (13 - i * 3) * s, yy + 5 * s, (26 - i * 6) * s, 13 * s, '#4d9462');
      rect(x - 5 * s, yy, 10 * s, 8 * s, '#5ca36b');
    }
  }

  function tree(x, ty, s) {
    const t = Math.round(14 * s);
    rect(x - t / 2, ty, t, 105 * s, '#744a2f');
    rect(x - t / 2 + 3 * s, ty, 3 * s, 105 * s, '#9e6b3d');
    rect(x - 14 * s, ty + 37 * s, 28 * s, 8 * s, '#744a2f');
    rect(x - 31 * s, ty + 26 * s, 28 * s, 7 * s, '#744a2f');
    rect(x + 4 * s, ty + 22 * s, 27 * s, 7 * s, '#744a2f');
    const blobs = [[-26, 11, 37, 31], [-6, -7, 43, 42], [23, 10, 36, 34], [-41, 29, 37, 29], [-5, 22, 55, 35], [30, 33, 34, 26]];
    blobs.forEach(([bx, by, bw, bh], i) => {
      rect(x + bx * s, ty + by * s, bw * s, bh * s, i % 2 ? '#257d48' : '#2e8b4e');
      rect(x + (bx + 4) * s, ty + (by + 3) * s, (bw - 8) * s, 6 * s, '#48a960');
      rect(x + (bx + 7) * s, ty + (by + bh - 8) * s, (bw - 12) * s, 5 * s, '#1f6a42');
    });
  }

  // Cielo y nubes
  rect(0, 0, W, H, '#82cbcb');
  rect(0, 0, W, y(.333), '#91d7d1');
  L.clouds.forEach(([cx, cy]) => cloud(cx, cy));

  // Lomas y pinos del fondo
  rect(0, y(.504), W, y(.241), '#5da377');
  const P = L.pines;
  for (let i = 0; i < P.count; i++) pine(i * P.gap + rand() * P.jitter, P.y + rand() * P.spread, P.scale + rand() * .2);

  // Pasto en franjas
  rect(0, y(.674), W, H, '#4a9a58');
  rect(0, y(.744), W, H, '#3a854c');
  rect(0, y(.915), W, H, '#377a42');
  const tufts = Math.round(W * H / 1620);
  for (let i = 0; i < tufts; i++) {
    const x = rand() * W, gy = y(.707) + rand() * y(.293);
    rect(x, gy, 4, 2, rand() > .5 ? '#6cbf65' : '#2c7144');
  }

  // Manzanos al frente
  L.trees.forEach(([tx, ty, s]) => tree(tx, ty, s));

  // Florcitas y borde inferior
  const flowers = Math.round(W * H / 4630);
  for (let i = 0; i < flowers; i++) {
    const x = rand() * W, fy = y(.796) + rand() * y(.185);
    rect(x, fy, 2, 5, '#72bc66');
    rect(x - 2, fy + 2, 6, 2, '#80ca72');
    if (i % 4 === 0) rect(x, fy - 2, 3, 3, '#f2d383');
  }
  rect(0, y(.963), W, H, '#326f40');
}

// Redibuja cuando el marco pasa de apaisado a vertical (mismo corte que el CSS).
function mountForest(canvas) {
  const narrow = matchMedia('(max-width: 720px)');
  const paint = () => drawForest(canvas, narrow.matches ? 'tall' : 'wide');
  paint();
  narrow.addEventListener('change', paint);
}
