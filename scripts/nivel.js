/**
 * nivel.js — convierte los archivos JSON en algo que el motor pueda jugar.
 *
 * El JSON de un nivel trae el mapa dibujado con letras (ver SIMBOLOS en config.js).
 * Acá se traduce ese dibujo a bloques sólidos y a la lista de objetos del nivel,
 * y se reparten las preguntas entre los bichos EN ORDEN DE APARICIÓN, de modo que
 * la dificultad sube sola conforme el estudiante avanza.
 */
import { CFG, SIMBOLOS as S } from "./config.js";

/** Tipos de bloque sólido que entiende el motor. */
export const TILE = { VACIO: 0, SUELO: 1, TIERRA: 2, PLATAFORMA: 3 };

async function traerJSON(ruta) {
  const r = await fetch(ruta, { cache: "no-cache" });
  if (!r.ok) throw new Error(`No se pudo cargar ${ruta} (${r.status})`);
  return r.json();
}

/** Descarga el mapa y las preguntas de un nivel y arma el objeto jugable. */
export async function cargarNivel(definicion) {
  const [mapa, banco] = await Promise.all([
    traerJSON(definicion.mapa),
    traerJSON(definicion.preguntas),
  ]);
  return construir(definicion, mapa, banco);
}

function construir(definicion, mapa, banco) {
  const filas = mapa.mapa;
  const alto = filas.length;
  const ancho = Math.max(...filas.map((f) => f.length));

  const tiles = new Uint8Array(alto * ancho);
  const monedas = [], bloques = [], bichos = [], peligros = [], checkpoints = [];
  let inicio = { x: 2 * CFG.TILE, y: 8 * CFG.TILE };
  let meta = { x: (ancho - 4) * CFG.TILE, y: 9 * CFG.TILE };
  let jefe = null;

  const px = (c) => c * CFG.TILE;

  for (let f = 0; f < alto; f++) {
    for (let c = 0; c < ancho; c++) {
      const ch = filas[f][c] || " ";
      switch (ch) {
        case S.SUELO:
          // la primera fila sólida de una columna es "cara"; lo de abajo es tierra
          tiles[f * ancho + c] = (f > 0 && filas[f - 1][c] === S.SUELO) ? TILE.TIERRA : TILE.SUELO;
          break;
        case S.PLATAFORMA:
          tiles[f * ancho + c] = TILE.PLATAFORMA;
          break;
        case S.MONEDA:
          monedas.push({ x: px(c) + 10, y: px(f) + 8, tomada: false, fase: (c * 7) % 60 });
          break;
        case S.BLOQUE:
          bloques.push({ x: px(c) + 4, y: px(f) + 4, usado: false, rebote: 0, premio: "monedas" });
          break;
        case S.BLOQUE_VIDA:
          bloques.push({ x: px(c) + 4, y: px(f) + 4, usado: false, rebote: 0, premio: "vida" });
          break;
        case S.BLOQUE_ESTRELLA:
          bloques.push({ x: px(c) + 4, y: px(f) + 4, usado: false, rebote: 0, premio: "estrella" });
          break;
        case S.BLOQUE_TURBO:
          bloques.push({ x: px(c) + 4, y: px(f) + 4, usado: false, rebote: 0, premio: "turbo" });
          break;
        case S.BLOQUE_PISTA:
          bloques.push({ x: px(c) + 4, y: px(f) + 4, usado: false, rebote: 0, premio: "pista" });
          break;
        case S.BICHO:
          bichos.push({ col: c, x: px(c), y: px(f) + 8, origen: px(c), dir: c % 2 ? 1 : -1, vivo: true, fase: c });
          break;
        case S.JEFE:
          jefe = { x: px(c), y: px(f) + 4, vivo: true, fase: c, golpes: 0 };
          break;
        case S.PELIGRO:
          peligros.push({ x: px(c), y: px(f) + 8, ancho: CFG.TILE, alto: CFG.TILE - 8 });
          break;
        case S.CHECKPOINT:
          checkpoints.push({ x: px(c), y: px(f) - CFG.TILE, activo: false });
          break;
        case S.META:
          meta = { x: px(c), y: px(f) - CFG.TILE };
          break;
        case S.INICIO:
          inicio = { x: px(c), y: px(f) };
          break;
      }
    }
  }

  // --- reparto de preguntas: en orden de aparición ---
  bichos.sort((a, b) => a.x - b.x);
  const preguntas = [...banco.preguntas];
  const paraJefe = jefe ? (banco.preguntasJefe || 3) : 0;
  const normales = preguntas.slice(0, preguntas.length - paraJefe);
  const delJefe = preguntas.slice(preguntas.length - paraJefe);

  bichos.forEach((b, i) => {
    b.pregunta = normales[i % normales.length];
    b.tipo = i % 3;                    // qué sprite del tema le toca
    b.resuelto = false;
  });
  if (jefe) {
    jefe.preguntas = delJefe;
    jefe.paso = 0;
  }

  return {
    id: definicion.id,
    distrito: mapa.distrito,
    clase: mapa.clase,
    titulo: mapa.titulo,
    intro: mapa.intro || "",
    repaso: mapa.repaso || [],
    tema: mapa.tema,
    musica: mapa.musica || mapa.tema,
    // el vehículo que lo lleva al siguiente distrito: mototaxi, bus o limosina
    vehiculo: mapa.vehiculo || "bus",
    ancho, alto, tiles,
    inicio, meta, monedas, bloques, bichos, peligros, checkpoints, jefe,
    totalRetos: bichos.length + (jefe ? 1 : 0),
  };
}

/** ¿Hay bloque sólido en esta casilla? Fuera del mapa por los lados = sí (paredes invisibles). */
export function esSolido(nivel, col, fila) {
  if (col < 0 || col >= nivel.ancho) return true;
  if (fila < 0 || fila >= nivel.alto) return false;
  return nivel.tiles[fila * nivel.ancho + col] !== TILE.VACIO;
}
