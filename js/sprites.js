// Sprites pixel art: cada dibujo es una grilla de caracteres y cada carácter es un color de la paleta.
// "." es transparente. M() espeja la mitad izquierda para armar dibujos simétricos.

const M = half => half.map(r => r + [...r].reverse().join(''));

function overlay(base, layer, dx, dy) {
  const out = base.map(r => [...r]);
  layer.forEach((r, y) => [...r].forEach((c, x) => {
    if (c !== '.' && out[y + dy] && x + dx < out[y + dy].length) out[y + dy][x + dx] = c;
  }));
  return out.map(r => r.join(''));
}

function pad(rows, left, w) {
  return rows.map(r => ('.'.repeat(left) + r).padEnd(w, '.'));
}

const crop = (rows, y0, y1, x0, x1) => rows.slice(y0, y1).map(r => r.slice(x0, x1));

// Convierte una grilla en un SVG nítido; agrupa píxeles contiguos del mismo color en un solo path.
function spriteSVG(rows, pal) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const d = {};
  rows.forEach((r, y) => {
    let x = 0;
    while (x < r.length) {
      const c = r[x];
      let n = 1;
      while (r[x + n] === c) n++;
      if (c !== '.' && pal[c]) (d[c] = d[c] || []).push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">` +
    Object.entries(d).map(([c, p]) => `<path fill="${pal[c]}" d="${p.join('')}"/>`).join('') + '</svg>';
}

// ---------- Kamy (zorro) y las lobas ----------
const FOX_BODY=M([
"...k......",
"..krk.....",
"..krrk....",
"..krrok...",
".krroookkk",
".koooooooo",
".klooooooo",
".kooookkoo",
".kooookeoo",
".kwwoooooo",
".kwwwwoook",
"..kwwwwwkw",
"...kkwwwww",
"....kowwww",
"...kooowww",
"...kooowww",
"...kooowww",
"...kOoowww",
"...kOooggw",
"...kOOoggg",
"...kbbbkbb",
"...kbbbkbb",
"....kkkkkk"]);
const FOX_TAIL=[
"..kk.......",
".kwwk......",
"kwwwwk.....",
"kwwwwwk....",
"kgwwwok....",
"kooooook...",
".kooooook..",
".kOoooooo..",
"..kOoooooo.",
"..kOOooooo.",
"...kOOOooo.",
"....kkOOoo.",
"......kkkk."];
const FOX=overlay(pad(FOX_BODY,8,28),FOX_TAIL,0,8);
const WOLF_BODY=M([
"..kk.......",
".kik.......",
".kiik......",
".kiiik.....",
"kfiiifkkkkk",
"kffffffffff",
"kffffffffff",
"kffffffffww",
"kfffkkffwww",
"kfffkeffwww",
"kfppffwwwwk",
"kffffwwwwkw",
".kfffwwwwww",
"..kkfwwwwww",
"...kffffwww",
"...kfffffww",
"..kffffwwww",
"..kfffffwww",
"..kfFfffwww",
"..kfFfffkww",
"..kwwkfkwww",
"...kkkkkkkk"]);
const WOLF_TAIL=[
"....kk.",
"...kwwk",
"...kwwk",
"..kfffk",
".kffffk",
"kfFffk.",
"kfFfk..",
"kFFk...",
".kk...."];
const WOLF=overlay(pad(WOLF_BODY,0,28),WOLF_TAIL,19,10);
// Paleta de Kamy; las lobas la combinan con su propio pelaje (f, F) e interior de orejas (i).
const PAL={k:'#22161b',r:'#9a2f34',o:'#ec7a33',O:'#b9521f',l:'#ffa461',w:'#fff4e2',g:'#d8cdbb',e:'#fff4e2',b:'#4a2b20',p:'#f2948a'};

const WOLVES={
 gaby:{name:'Gaby',color:'loba gris',pal:{f:'#7b8597',F:'#59627a',i:'#e6a989'}},
 mary:{name:'Mary',color:'loba negra',pal:{f:'#3a3646',F:'#26222f',i:'#c47a7e'}},
 ely:{name:'Ely',color:'loba marrón',pal:{f:'#9a6338',F:'#714526',i:'#f0b07c'}}};

const wolfPal = k => ({ ...PAL, ...WOLVES[k].pal });
const foxSvg = spriteSVG(FOX, PAL);
const foxFace = spriteSVG(crop(FOX, 0, 14, 8, 28), PAL);
const wolfSvg = k => spriteSVG(WOLF, wolfPal(k));
const wolfFace = k => spriteSVG(crop(WOLF, 0, 14, 0, 22), wolfPal(k));

// ---------- Amigos del bosque ----------
const VACA=overlay(M([
"....kk......",
"....kyk.....",
"....kykkkkkk",
"...kwwwwwwww",
"kk.kwwwwwwww",
"kpkkwwwwwwww",
"kppkwwkkwwww",
".kkkwwkewwww",
"...kwwwwwwww",
"...kpppppppp",
"...kppkppppp",
"...kpppppppp",
"....kkkkkkkk",
"....kwwwwwww",
"...kwwbbwwww",
"...kwwbbbwww",
"...kwwwwwwww",
"...kwwkwwwww",
"...khhkwwwww",
"....kkkkkkkk"]),["bbbb","bbbbb",".bbb"],15,3);
const GALLINA=[
"..............kk......",
".............krrk.....",
"............krrrk.....",
"...........kwwwwk.....",
"..........kwwwkwwk....",
"..........kwwwwwwyyk..",
"..........kwwwwwkyk...",
"....kk.....kwwrrk.....",
"...kwwk....kwwrk......",
"..kwwwwkkkkwwwwk......",
"..kwwwwwwwwwwwwwk.....",
"..kwwgwwwwwwwwwwk.....",
"...kwgggwwwwwwwwk.....",
"...kwwgggggwwwwwk.....",
"....kwwwwwwwwwwk......",
".....kkwwwwwwkk.......",
".......kkkkkk.........",
"........o..o..........",
"........o..o..........",
".......oo.oo.........."];
const PATO=[
"........kkkk..........",
".......kyyyyk.........",
"......kyyyyyyk........",
"......kyyykeyk........",
"......kyyyyyyoook.....",
"......kyyyyyyooook....",
".......kyyyyykkkk.....",
"........kyyyyk........",
".kk.....kyyyyk........",
"kyyk...kyyyyyyk.......",
"kyyykkkyyyyyyyyk......",
".kyyyyyyyyyyyyyk......",
".kyyYYYYyyyyyyyk......",
"..kyyYYYYYyyyyk.......",
"...kyyyyyyyyyk........",
"....kkkkkkkkk.........",
"......oo..oo..........",
".....ooo.ooo.........."];
const CERDO=M([
".kk........",
".kPk.......",
".kPPk......",
".kpPPkkkkkk",
"kpppppppppp",
"kpppppppppp",
"kpppkkppppp",
"kpppkeppppp",
"kpqqppkkkkk",
"kpppppkPPPP",
"kpppppkPkPP",
"kpppppkPPPP",
".kpppppkkkk",
"..kkppppppp",
"..kpppppppp",
".kppppppppp",
".kppppppppp",
".kpppkppppp",
".kPPk.kPPkk",
"..kk...kk.."]);
const CONEJO=M([
"....kk.....",
"...kuuk....",
"...kuik....",
"...kuik....",
"...kuik....",
"...kuik....",
"..kkuukkkkk",
".kuuuuuuuuu",
"kuuuuuuuuuu",
"kuuukkuuuuu",
"kuuukeuuuuu",
"kuqquuuuwwi",
".kuuuuuwkwk",
"..kkuuuwwww",
"..kuuuwwwww",
".kuuuuwwwww",
".kuuuuwwwww",
".kuuuuwwkww",
"..kkkkkkkkk"]);
const OVEJA=M([
"...kkk.kkk..",
"..kwwwkwwwkk",
".kwwwwwwwwww",
"kwwwwwkkkkkk",
"kwkkkkdddddd",
"kdddddddwkdd",
".kkkkkddwkdd",
"..kwwkdddddd",
"..kwwkdddddd",
"..kwwwkddddk",
"..kwwwwkkkkk",
".kwwwwwwwwww",
"kwwwwwwwwwww",
"kwwwwwwwwwww",
".kwwwwwwwwww",
"..kkkkkkkkkk",
"...kdk..kdk.",
"...kkk..kkk."]);
// Paleta compartida por los amigos del bosque.
const APAL={k:'#22161b',w:'#fff4e2',g:'#d8cdbb',b:'#2b2530',y:'#ffd54a',Y:'#e9a92a',o:'#f08a2c',r:'#d9473b',p:'#f6a6b2',P:'#e07b8f',q:'#ef7f86',h:'#5b4136',e:'#fff4e2',u:'#c9b8a0',i:'#f2a0a8',d:'#3a2f36'};
// "article" es el artículo para armar frases como "la vaca" o "el pato".
const ANIMALS = [
  { id: 'vaca', name: 'Vaca', art: VACA, article: 'la' },
  { id: 'gallina', name: 'Gallina', art: GALLINA, article: 'la' },
  { id: 'pato', name: 'Pato', art: PATO, article: 'el' },
  { id: 'cerdo', name: 'Cerdo', art: CERDO, article: 'el' },
  { id: 'conejo', name: 'Conejo', art: CONEJO, article: 'el' },
  { id: 'oveja', name: 'Oveja', art: OVEJA, article: 'la' },
];

// ---------- Objetos e íconos ----------
const appleSvg = '<svg viewBox="0 0 48 48" aria-hidden="true" shape-rendering="crispEdges"><path fill="#714631" d="M23 2h4v10h-4z"/><path fill="#61b454" d="M27 5h11v4h-4v4h-9V9h2z"/><path fill="#a73532" d="M9 13h9v-3h12v3h9v5h4v19h-5v5H10v-5H5V18h4z"/><path fill="#e55a42" d="M9 15h9v-3h12v3h9v5h3v14h-5v5H11v-5H7V20h2z"/><path fill="#ff8960" d="M12 18h8v4h-8zM10 22h5v7h-5z"/><path fill="#c84237" d="M32 18h7v18h-5v4H15v-3h17z"/></svg>';

const BUSH = M(["...kkkkk", "..kgggGg", ".kgGgggg", "kggggGgg", "kgGggggg", "kggggggG", "kgGggggg", ".kgggGgg", "..kkkkkk"]);
const bushSvg = spriteSVG(BUSH, { k: '#173c2a', g: '#3f8f55', G: '#6cbf65' });

const ICONS = {
  soundOn: ["...k.....", "..kk..k..", "kkkk...k.", "kkkk.k.k.", "kkkk.k.k.", "kkkk...k.", "..kk..k..", "...k....."],
  soundOff: ["...k.....", "..kk.....", "kkkk.k.k.", "kkkk..k..", "kkkk.k.k.", "kkkk.....", "..kk.....", "...k....."],
  home: ["....k....", "...kkk...", "..kkkkk..", ".kkkkkkk.", "kkkkkkkkk", ".k.....k.", ".k..k..k.", ".k..k..k.", ".kkkkkkk."],
  fullscreen: ["kkk...kkk", "k.......k", "k.......k", ".........", ".........", ".........", "k.......k", "k.......k", "kkk...kkk"],
};
const icon = (name, color) => spriteSVG(ICONS[name], { k: color });
