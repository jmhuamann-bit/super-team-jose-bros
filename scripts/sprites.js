/**
 * sprites.js — pixel art original, escrito como texto.
 *
 * Cada sprite es una lista de filas donde cada letra es un color de su paleta
 * y el punto "." es transparente. Se puede editar en cualquier editor de texto:
 * cambia una letra y cambia el dibujo. Todas las filas de un sprite deben medir
 * lo mismo (hay una comprobación automática al cargar).
 *
 * Al iniciar, cada sprite se "cocina" una sola vez en un lienzo fuera de pantalla
 * y luego se dibuja con drawImage, que es muchísimo más rápido que pintar
 * píxel por píxel en cada cuadro.
 */

/* ---------------------------------------------------------------
   PALETAS
   --------------------------------------------------------------- */
const P_JOSE = {
  p: "#ff5470", P: "#c2264a",           // gorra y visera
  s: "#ffd9a0", o: "#2b1b3d",           // piel y ojos
  c: "#38bdf8", C: "#0e7fb8",           // polo
  b: "#2c2a6b", z: "#171533",           // pantalón y zapatos
  m: "#ffd166",                          // mochila
};
const P_GAVIOTA = { w: "#f2f6ff", g: "#b9c6da", y: "#ffb020", k: "#241a2e" };
const P_ANCLA   = { a: "#9fb4c7", A: "#6c8195", r: "#e8654f", k: "#241a2e", w: "#ffffff" };
const P_CONTE   = { c: "#ff7847", C: "#c14a22", k: "#241a2e", w: "#ffffff", y: "#ffd166" };
const P_PULPO   = { p: "#a45cff", P: "#6b2fb5", w: "#ffffff", k: "#241a2e", y: "#ffd166" };
const P_PALOMA  = { g: "#9aa7c7", G: "#6b769a", w: "#eef2ff", y: "#ffb020", k: "#241a2e", v: "#67e8c3" };
const P_COMETA  = { r: "#ff5470", y: "#ffd166", c: "#38bdf8", k: "#241a2e", w: "#ffffff" };
const P_CONO    = { n: "#ff9f45", N: "#d96a1c", w: "#ffffff", k: "#241a2e" };
const P_COMBI   = { c: "#4ade80", C: "#1f9d5a", v: "#bde8ff", k: "#241a2e", y: "#ffd166", w: "#ffffff", r: "#ff5470" };
const P_OBJ     = { y: "#ffd166", Y: "#c9922a", w: "#fff6d8", k: "#241a2e",
                    r: "#ff5470", g: "#4ade80", c: "#38bdf8", s: "#f2f6ff", b: "#2c2a6b" };

/* ---------------------------------------------------------------
   PERSONAJE — José, el cachimbo economista (11 × 15)
   --------------------------------------------------------------- */
const JOSE_QUIETO = [
  "...ppppp...",
  "..ppppppp..",
  ".PPPPPPPPP.",
  "..sssssss..",
  "..sosssos..",
  "..sssssss..",
  "...sssss...",
  ".mcccccccm.",
  ".mcccccccm.",
  ".mcccccccm.",
  "..CCCCCCC..",
  "..bbbbbbb..",
  "..bbb.bbb..",
  "..bbb.bbb..",
  ".zzz...zzz.",
];
const JOSE_PASO_A = [
  "...ppppp...",
  "..ppppppp..",
  ".PPPPPPPPP.",
  "..sssssss..",
  "..sosssos..",
  "..sssssss..",
  "...sssss...",
  ".mcccccccm.",
  ".mcccccccm.",
  ".mcccccccm.",
  "..CCCCCCC..",
  "..bbbbbbb..",
  "..bbbbbb...",
  "...bb.bbb..",
  "..zzz..zzz.",
];
const JOSE_PASO_B = [
  "...ppppp...",
  "..ppppppp..",
  ".PPPPPPPPP.",
  "..sssssss..",
  "..sosssos..",
  "..sssssss..",
  "...sssss...",
  ".mcccccccm.",
  ".mcccccccm.",
  ".mcccccccm.",
  "..CCCCCCC..",
  "..bbbbbbb..",
  "...bbbbbb..",
  "..bbb.bb...",
  ".zzz..zzz..",
];
const JOSE_SALTA = [
  "...ppppp...",
  "..ppppppp..",
  ".PPPPPPPPP.",
  "..sssssss..",
  "..sosssos..",
  "..sssssss..",
  "s..sssss..s",
  "smcccccccms",
  ".mcccccccm.",
  ".mcccccccm.",
  "..CCCCCCC..",
  "..bbbbbbb..",
  ".bbb...bbb.",
  ".bb.....bb.",
  "zzz.....zzz",
];

/* ---------------------------------------------------------------
   BICHOS DEL CALLAO (14 × 12)
   --------------------------------------------------------------- */
const GAVIOTA = [
  "....wwwww.....",
  "...wwwwwww....",
  "..wwkwwwwww...",
  "..wwwwwwwwyy..",
  ".wwwwwwwwwy...",
  ".gwwwwwwww....",
  ".ggwwwwww.....",
  "..gggwww......",
  "...gggg.......",
  "....y..y......",
  "....y..y......",
  "...yy..yy.....",
];
const ANCLA = [
  "....aaaa......",
  "...akkkka.....",
  "...akwwka.....",
  "....aaaa......",
  "..aaaaaaaa....",
  "....aAAa......",
  "....aAAa......",
  "..r.aAAa.r....",
  ".rrraAAarrr...",
  ".rraaAAaarr...",
  "..raaaaaar....",
  "...aa..aa.....",
];
const CONTENEDOR = [
  "..cccccccccc..",
  ".cCCCCCCCCCCc.",
  ".cwkcccccckwc.",
  ".cCCCCCCCCCCc.",
  ".cyyccccccyyc.",
  ".cCCCCCCCCCCc.",
  ".ccccwwwwcccc.",
  ".cCCCCCCCCCCc.",
  ".cccccccccccc.",
  "..CCCCCCCCCC..",
  "...cc....cc...",
  "...cc....cc...",
];
const PULPO = [  // jefe del Callao (20 × 16)
  ".....pppppppp.......",
  "...pppppppppppp.....",
  "..pppppppppppppp....",
  "..ppwwwppppwwwpp....",
  "..ppwkwppppwkwpp....",
  "..ppwwwppppwwwpp....",
  "..pppppppppppppp....",
  "..ppppyyyyyypppp....",
  "..pppppppppppppp....",
  "...pppppppppppp.....",
  "..PppPppPppPppP.....",
  ".PpP.PpP.PpP.PpP....",
  ".Pp...Pp...Pp..P....",
  ".P.....P....P.......",
  "....................",
  "....................",
];

/* ---------------------------------------------------------------
   BICHOS DE SAN MIGUEL (14 × 12)
   --------------------------------------------------------------- */
const PALOMA = [
  "....gggg......",
  "...ggggggg....",
  "..ggkgggggg...",
  "..gggggggyy...",
  ".Gggggggg.....",
  ".GGgggggg.....",
  ".GGGwwwgg.....",
  "..GGGwwg......",
  "...GGGg.......",
  "....y..y......",
  "....y..y......",
  "...vv..vv.....",
];
const COMETA = [
  "......r.......",
  ".....rrr......",
  "....rryyr.....",
  "...rryyyyr....",
  "..rryyccyyr...",
  ".rryycckcyyr..",
  "..ryycccyyr...",
  "...ryyyyyr....",
  "....ryyyr.....",
  ".....rwr......",
  "......w.......",
  ".....w.w......",
];
const CONO = [
  "......nn......",
  "......nn......",
  ".....nnnn.....",
  ".....nwwn.....",
  "....nnwwnn....",
  "....nkkkkn....",
  "...nnnnnnnn...",
  "...nwwwwwwn...",
  "..nnnnnnnnnn..",
  "..NNNNNNNNNN..",
  ".NNNNNNNNNNNN.",
  ".NNNNNNNNNNNN.",
];
const COMBI = [  // jefe de San Miguel (20 × 16)
  "....cccccccccccc....",
  "...ccccccccccccccc..",
  "..cvvvvcccvvvvcccc..",
  "..cvvvvcccvvvvcccc..",
  "..cccccccccccccccc..",
  "..cyycccccccccyycc..",
  "..cccccccccccccccc..",
  "..crrccccccccccrcc..",
  "..cccccccccccccccc..",
  "..CCCCCCCCCCCCCCCC..",
  "..CCwwCCCCCCCwwCCC..",
  "...CkkkC....CkkkC...",
  "...CkkkC....CkkkC...",
  "....kkk......kkk....",
  "....................",
  "....................",
];

/* ---------------------------------------------------------------
   OBJETOS (12 × 12)
   --------------------------------------------------------------- */
const MONEDA_A = [
  "....yyyy....",
  "..yyYYYYyy..",
  "..yYwwwwYy..",
  ".yYwwYYwwYy.",
  ".yYwYYYYwYy.",
  ".yYwYYYYwYy.",
  ".yYwYYYYwYy.",
  ".yYwYYYYwYy.",
  ".yYwwYYwwYy.",
  "..yYwwwwYy..",
  "..yyYYYYyy..",
  "....yyyy....",
];
const MONEDA_B = [
  ".....yy.....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  "....yYYy....",
  ".....yy.....",
];
const BLOQUE = [
  "YYYYYYYYYYYY",
  "YyyyyyyyyyyY",
  "YyykkkkkyyyY",
  "YyykkykkyyyY",
  "YyyyyykkyyyY",
  "YyyyykkyyyyY",
  "YyyykkyyyyyY",
  "YyyyyyyyyyyY",
  "YyyykkyyyyyY",
  "YyyykkyyyyyY",
  "YyyyyyyyyyyY",
  "YYYYYYYYYYYY",
];
const BLOQUE_USADO = [
  "kkkkkkkkkkkk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kYYYYYYYYYYk",
  "kkkkkkkkkkkk",
];
const PUA = [
  "............",
  "............",
  "............",
  "............",
  "..s......s..",
  "..ss....ss..",
  ".sss.s..sss.",
  ".sss.ss.sss.",
  "ssssssssssss",
  "ssssssssssss",
  "bbbbbbbbbbbb",
  "bbbbbbbbbbbb",
];
const ITEM_VIDA = [   // 1-UP que sale de un bloque
  "............",
  "..rr....rr..",
  ".rrrr..rrrr.",
  "rrrrrrrrrrrr",
  "rrrrrrrrrrrr",
  "rrrrrrrrrrrr",
  ".rrrrrrrrrr.",
  "..rrrrrrrr..",
  "...rrrrrr...",
  "....rrrr....",
  ".....rr.....",
  "............",
];
const ITEM_ESTRELLA = [   // vuelve grande a José
  ".....yy.....",
  "....yyyy....",
  "....yyyy....",
  "yyyyyyyyyyyy",
  ".yyyyyyyyyy.",
  "..yyyyyyyy..",
  "..yyywwyyy..",
  "..yyyyyyyy..",
  ".yyyy..yyyy.",
  ".yyy....yyy.",
  "..y......y..",
  "............",
];
/* ---------------------------------------------------------------
   BICHOS DE PUEBLO LIBRE (14 × 12)
   --------------------------------------------------------------- */
const CUY = [
  "..............",
  "...bbbbbb.....",
  "..bbbbbbbb....",
  ".bbkbbbbbbb...",
  ".bbbbbbbbbbb..",
  ".wwbbbbbbbbb..",
  ".wwwbbbbbbbb..",
  "..wwbbbbbbb...",
  "...wwwbbbb....",
  "....y..y......",
  "....y..y......",
  "...yy..yy.....",
];
const P_CUY = { b: "#a8703f", k: "#241a2e", w: "#f2f6ff", y: "#ffb020" };

const FAROL = [   // farol colonial que se apagó de tanto discutir
  ".....kk.....",
  "....kkkk....",
  "...kyyyyk...",
  "..kyyyyyyk..",
  "..kyywwyyk..",
  "..kyywwyyk..",
  "..kyyyyyyk..",
  "...kyyyyk...",
  "....kkkk....",
  ".....kk.....",
  ".....kk.....",
  "....kkkk....",
];
const P_FAROL = { k: "#3b2a1a", y: "#ffd166", w: "#fff6d8" };

const TORITO = [  // Torito de Pucará: jefe de Pueblo Libre (20 × 16)
  "....................",
  "...cc..........cc...",
  "..cccc........cccc..",
  "...rrrrrrrrrrrrrr...",
  "..rrwwrrrrrrwwrrrr..",
  "..rrwkrrrrrrwkrrrr..",
  "..rrrrrrrrrrrrrrrr..",
  "..rryyrrrrrryyrrrr..",
  "..rrrrrrrrrrrrrrrr..",
  "..rrrggrrrrggrrrrr..",
  "..rrrrrrrrrrrrrrrr..",
  "..rrrrrrrrrrrrrrrr..",
  "...kk..kk..kk..kk...",
  "...kk..kk..kk..kk...",
  "....................",
  "....................",
];
const P_TORITO = { r: "#d9552f", c: "#f2e2c4", w: "#ffffff", k: "#241a2e", y: "#ffd166", g: "#4ade80" };

const ITEM_CEVICHE = [   // plato de ceviche: una vida más
  "............",
  "....gg......",
  "...ggg......",
  "..wwwwwwww..",
  ".wwrrwwrrww.",
  "wwwwwwwwwwww",
  "wwwwwwwwwwww",
  ".wwwwwwwwww.",
  "..wwwwwwww..",
  "...YYYYYY...",
  "............",
  "............",
];
const ITEM_RAYO = [      // chicha energética: velocidad por unos segundos
  "......yy....",
  ".....yyy....",
  "....yyy.....",
  "...yyyy.....",
  "..yyyyyyy...",
  ".....yyy....",
  "....yyy.....",
  "...yyy......",
  "..yyy.......",
  ".yy.........",
  "............",
  "............",
];
const ITEM_FOCO = [      // pista para usar en una pregunta
  "....wwww....",
  "..wwyyyyww..",
  ".wyyyyyyyyw.",
  ".wyyyyyyyyw.",
  ".wyyyyyyyyw.",
  "..wyyyyyyw..",
  "...wyyyyw...",
  "....kkkk....",
  "....wwww....",
  "....kkkk....",
  ".....kk.....",
  "............",
];
const MOTOTAXI = [   // torito: el vehículo del primer distrito (24 × 14)
  ".......rrrrrrrrrr.......",
  "......rrrrrrrrrrrr......",
  "......RRRRRRRRRRRR......",
  "......r..........r......",
  "...mmmm..........r......",
  "..mvvvm..........r......",
  "..mvvvmmmmmmmmmmmm......",
  "..mmmmmmmmmmmmmmmm......",
  "..mmmmmmmmmmmmmmmm......",
  "...kk........kk.........",
  "..kkkk......kkkk........",
  "..kkkk......kkkk........",
  "...kk........kk.........",
  "........................",
];
const P_MOTO = { r: "#ff5470", R: "#c2264a", m: "#4a5568", v: "#dff4ff", k: "#241a2e", y: "#ffd166" };

const LIMOSINA = [   // para los distritos más pitucos (32 × 12)
  "........kkkkkkkkkkkkkk..........",
  "......kkvvkkvvkkvvkkkk..........",
  "....kkkkkkkkkkkkkkkkkkkk........",
  "..kkkkkkkkkkkkkkkkkkkkkkkkkk....",
  ".kkkkkkkkkkkkkkkkkkkkkkkkkkkky..",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKy..",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKK...",
  "..nnn................nnn........",
  ".nnnnn..............nnnnn.......",
  ".nnwnn..............nnwnn.......",
  ".nnnnn..............nnnnn.......",
  "..nnn................nnn........",
];
const P_LIMO = { k: "#20202e", K: "#12121c", v: "#9fd6f5", y: "#ffd166", w: "#ffffff", n: "#2c2c3a" };

const TAXI = [   // el taxi amarillo de toda la vida (22 × 12)
  "......yyyyyyy.........",
  ".....yvvvvvvy.........",
  "....yyvvvvvvyy........",
  "..yyyyyyyyyyyyyyyy....",
  ".yyyyyyyyyyyyyyyyyy...",
  ".yyyyyyyyyyyyyyyyyy...",
  ".kyyyyyyyyyyyyyyyyk...",
  "..kkk........kkk......",
  ".kkkkk......kkkkk.....",
  ".kkwkk......kkwkk.....",
  ".kkkkk......kkkkk.....",
  "..kkk........kkk......",
];
const P_TAXI = { y: "#ffc93c", v: "#dff4ff", k: "#241a2e", w: "#ffffff" };

const BUS = [   // la combi que se lo lleva al siguiente distrito (24 × 14)
  "...cccccccccccccccccc...",
  "..cccccccccccccccccccc..",
  "..cvvvvcvvvvcvvvvcvvvc..",
  "..cvvvvcvvvvcvvvvcvvvc..",
  "..cccccccccccccccccccc..",
  "..cyyccccccccccccccyyc..",
  "..cccccccccccccccccccc..",
  "..crrccccccccccccccrrc..",
  "..CCCCCCCCCCCCCCCCCCCC..",
  "..CCwwCCCCCCCCCCwwCCCC..",
  "...kkk........kkk.......",
  "...kkk........kkk.......",
  "....k..........k........",
  "........................",
];
const P_BUS = { c: "#38bdf8", C: "#0e7fb8", v: "#dff4ff", k: "#241a2e", y: "#ffd166", w: "#ffffff", r: "#ff5470" };

const BANDERA = [   // checkpoint (12 × 16)
  "..bggggggg..",
  "..bgggggg...",
  "..bggggg....",
  "..bgggg.....",
  "..bggg......",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  "..b.........",
  ".bbb........",
  "bbbbb.......",
];
const META = [      // arco de meta (16 × 16)
  "rrrrrrrrrrrrrrrr",
  "rwwwwwwwwwwwwwwr",
  "rwrrrrrrrrrrrrwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
  "rwr..........rwr",
];

/* ---------------------------------------------------------------
   REGISTRO Y COCINADO
   --------------------------------------------------------------- */
const DEFINICIONES = {
  jose_quieto:  [JOSE_QUIETO, P_JOSE],
  jose_paso_a:  [JOSE_PASO_A, P_JOSE],
  jose_paso_b:  [JOSE_PASO_B, P_JOSE],
  jose_salta:   [JOSE_SALTA, P_JOSE],
  gaviota:      [GAVIOTA, P_GAVIOTA],
  ancla:        [ANCLA, P_ANCLA],
  contenedor:   [CONTENEDOR, P_CONTE],
  pulpo:        [PULPO, P_PULPO],
  paloma:       [PALOMA, P_PALOMA],
  cometa:       [COMETA, P_COMETA],
  cono:         [CONO, P_CONO],
  combi:        [COMBI, P_COMBI],
  moneda_a:     [MONEDA_A, P_OBJ],
  moneda_b:     [MONEDA_B, P_OBJ],
  bloque:       [BLOQUE, P_OBJ],
  bloque_usado: [BLOQUE_USADO, P_OBJ],
  pua:          [PUA, P_OBJ],
  bandera:      [BANDERA, P_OBJ],
  meta:         [META, P_OBJ],
  item_vida:    [ITEM_VIDA, P_OBJ],
  item_estrella:[ITEM_ESTRELLA, P_OBJ],
  item_ceviche: [ITEM_CEVICHE, P_OBJ],
  item_rayo:    [ITEM_RAYO, P_OBJ],
  item_foco:    [ITEM_FOCO, P_OBJ],
  bus:          [BUS, P_BUS],
  mototaxi:     [MOTOTAXI, P_MOTO],
  limosina:     [LIMOSINA, P_LIMO],
  taxi:         [TAXI, P_TAXI],
  cuy:          [CUY, P_CUY],
  farol:        [FAROL, P_FAROL],
  torito:       [TORITO, P_TORITO],
};

const cocidos = {};   // nombre -> { canvas, ancho, alto } (ya escalados)
const espejos = {};   // versiones volteadas horizontalmente

/** Pinta una definición en un lienzo fuera de pantalla. */
function cocinar(filas, paleta, escala) {
  const ancho = filas[0].length, alto = filas.length;
  const c = document.createElement("canvas");
  c.width = ancho * escala; c.height = alto * escala;
  const g = c.getContext("2d");
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < filas[y].length; x++) {
      const color = paleta[filas[y][x]];
      if (!color) continue;                    // "." o letra no definida = transparente
      g.fillStyle = color;
      g.fillRect(x * escala, y * escala, escala, escala);
    }
  }
  return { canvas: c, ancho: c.width, alto: c.height };
}

function voltear(sprite) {
  const c = document.createElement("canvas");
  c.width = sprite.ancho; c.height = sprite.alto;
  const g = c.getContext("2d");
  g.translate(sprite.ancho, 0); g.scale(-1, 1);
  g.drawImage(sprite.canvas, 0, 0);
  return { canvas: c, ancho: c.width, alto: c.height };
}

/** Cocina todos los sprites. Devuelve la lista de problemas encontrados (vacía si todo bien). */
export function prepararSprites(escala = 2) {
  const problemas = [];
  for (const [nombre, [filas, paleta]] of Object.entries(DEFINICIONES)) {
    const ancho = filas[0].length;
    filas.forEach((f, i) => {
      if (f.length !== ancho) problemas.push(`${nombre}: la fila ${i} mide ${f.length} y debería medir ${ancho}`);
    });
    cocidos[nombre] = cocinar(filas, paleta, escala);
    espejos[nombre] = voltear(cocidos[nombre]);
  }
  return problemas;
}

/**
 * Dibuja un sprite con su esquina superior izquierda en (x, y).
 * Con `escala` se puede agrandar (por ejemplo, José en modo grande).
 */
export function pintar(ctx, nombre, x, y, mirandoIzquierda = false, escala = 1) {
  const s = (mirandoIzquierda ? espejos : cocidos)[nombre];
  if (!s) return;
  if (escala === 1) {
    ctx.drawImage(s.canvas, Math.round(x), Math.round(y));
  } else {
    ctx.drawImage(s.canvas, Math.round(x), Math.round(y),
      Math.round(s.ancho * escala), Math.round(s.alto * escala));
  }
}

/** Tamaño ya escalado de un sprite, útil para centrarlo sobre una caja. */
export function medida(nombre) {
  const s = cocidos[nombre];
  return s ? { ancho: s.ancho, alto: s.alto } : { ancho: 0, alto: 0 };
}

/** Copia de un sprite en un canvas suelto (para mostrarlo dentro del HTML). */
export function miniatura(nombre, escala = 3) {
  const [filas, paleta] = DEFINICIONES[nombre] || DEFINICIONES.gaviota;
  return cocinar(filas, paleta, escala).canvas;
}
