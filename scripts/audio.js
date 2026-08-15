/**
 * audio.js — música y efectos generados por código (chiptune).
 * No hay archivos de sonido: todo se sintetiza con la Web Audio API, así que
 * el juego pesa lo mismo con o sin música y no depende de ningún recurso externo.
 *
 * Para darle música propia a un distrito nuevo, agrega una entrada en TEMAS_MUSICA
 * y referencia su nombre desde el JSON del nivel ("musica": "...").
 */
import { Almacen } from "./almacen.js";

let ctx = null;
let maestro = null;
let activo = Almacen.audioActivo();
let bucle = null;      // id del temporizador de la música
let temaActual = null;

/** Frecuencias de una octava base; se transponen con octavas. */
const NOTA = { C:261.63, D:293.66, E:329.63, F:349.23, G:392.0, A:440.0, B:493.88 };
function f(nombre) {
  if (nombre === "-") return 0;                       // silencio
  const oct = parseInt(nombre.slice(-1), 10);
  const base = NOTA[nombre[0]] * (nombre[1] === "#" ? 1.0595 : 1);
  return base * Math.pow(2, oct - 4);
}

/**
 * Cada tema define melodía y bajo como pares [nota, tiempos].
 * Un "tiempo" son 0.15 s, así que el bucle completo dura unos 5 segundos.
 */
const TEMAS_MUSICA = {
  puerto: { // Callao: marcha portuaria, tranquila y con niebla
    tempo: 0.17, onda: "square",
    melodia: ["E4",2,"G4",2,"A4",2,"-",1,"A4",1,"G4",2,"E4",2,"D4",4,
              "C4",2,"E4",2,"G4",2,"-",1,"G4",1,"A4",4,"G4",4],
    bajo:    ["A2",4,"A2",4,"F2",4,"G2",4,"A2",4,"A2",4,"F2",4,"G2",4],
  },
  parque: { // San Miguel: soleado, saltarín
    tempo: 0.15, onda: "square",
    melodia: ["C5",1,"E5",1,"G5",2,"E5",1,"C5",1,"D5",2,"F5",1,"A5",1,"G5",2,"E5",2,
              "C5",1,"E5",1,"G5",2,"A5",2,"G5",2,"E5",2,"C5",2],
    bajo:    ["C3",4,"G2",4,"F2",4,"G2",4,"C3",4,"G2",4,"A2",4,"G2",4],
  },
  campo: { // Jesús María: tarde en el Campo de Marte, paseo tranquilo
    tempo: 0.16, onda: "triangle",
    melodia: ["A4",2,"C5",1,"E5",1,"D5",2,"C5",2,"A4",2,"G4",2,"E4",4,
              "F4",2,"A4",1,"C5",1,"B4",2,"A4",2,"G4",4,"A4",4],
    bajo:    ["A2",4,"E2",4,"F2",4,"C3",4,"D3",4,"A2",4,"E2",4,"A2",4],
  },
  feria: { // Lince: vals de feria, juguetón y un poco circense
    tempo: 0.13, onda: "square",
    melodia: ["G4",1,"C5",1,"E5",1,"G5",2,"E5",1,"C5",1,"D5",2,"F5",2,"E5",2,
              "G4",1,"C5",1,"F5",1,"A5",2,"G5",1,"E5",1,"C5",2,"G4",2],
    bajo:    ["C3",2,"G2",2,"C3",2,"G2",2,"F2",2,"C3",2,"G2",2,"C3",2,
              "C3",2,"G2",2,"A2",2,"E2",2,"F2",2,"G2",2,"C3",4],
  },
  torres: { // San Isidro: oficinista, ordenado y con paso firme
    tempo: 0.15, onda: "triangle",
    melodia: ["D4",2,"F4",2,"A4",2,"D5",2,"C5",2,"A4",2,"F4",2,"D4",2,
              "E4",2,"G4",2,"B4",2,"E5",2,"D5",4,"A4",4],
    bajo:    ["D3",4,"D3",4,"A2",4,"A2",4,"E3",4,"E3",4,"D3",4,"D3",4],
  },
  acantilado: { // Miraflores: atardecer en el malecón, amplio y de cierre
    tempo: 0.18, onda: "triangle",
    melodia: ["C5",2,"E5",2,"G5",4,"F5",2,"E5",2,"D5",4,
              "A4",2,"C5",2,"E5",4,"D5",2,"C5",2,"C5",4],
    bajo:    ["F2",4,"C3",4,"G2",4,"A2",4,"F2",4,"G2",4,"C3",8],
  },
  barranco: { // Barranco: vals criollo de peña, lento y con swing
    tempo: 0.19, onda: "triangle",
    melodia: ["A4",2,"B4",1,"C5",3,"B4",2,"A4",2,"G4",4,
              "E4",2,"G4",1,"A4",3,"G4",2,"E4",2,"A4",4],
    bajo:    ["A2",3,"E3",3,"A2",2,"D3",3,"A2",3,"E2",2,
              "A2",3,"C3",3,"E3",2,"A2",4,"E2",4],
  },
};

function arrancarCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    maestro = ctx.createGain();
    maestro.gain.value = 0.5;
    maestro.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function nota(freq, cuando, dur, onda = "square", vol = 0.07) {
  if (!ctx || !freq) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = onda;
  o.frequency.setValueAtTime(freq, cuando);
  g.gain.setValueAtTime(0.0001, cuando);
  g.gain.exponentialRampToValueAtTime(vol, cuando + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
  o.connect(g); g.connect(maestro);
  o.start(cuando); o.stop(cuando + dur + 0.02);
}

/** Programa una pasada completa del tema y se vuelve a llamar sola. */
function programar(tema) {
  if (!activo || !ctx) return;
  const t = TEMAS_MUSICA[tema] || TEMAS_MUSICA.puerto;
  const t0 = ctx.currentTime + 0.08;
  let cursor = 0;
  for (let i = 0; i < t.melodia.length; i += 2) {
    const dur = t.melodia[i + 1] * t.tempo;
    nota(f(t.melodia[i]), t0 + cursor, dur * 0.9, t.onda, 0.05);
    cursor += dur;
  }
  const largo = cursor;
  cursor = 0;
  for (let i = 0; i < t.bajo.length; i += 2) {
    const dur = t.bajo[i + 1] * t.tempo;
    nota(f(t.bajo[i]), t0 + cursor, dur * 0.85, "triangle", 0.06);
    cursor += dur;
  }
  bucle = setTimeout(() => programar(tema), largo * 1000);
}

export const Audio = {
  get activo() { return activo; },

  alternar() {
    activo = !activo;
    Almacen.cambiarAudio(activo);
    if (!activo) this.pararMusica();
    else if (temaActual) this.musica(temaActual);
    return activo;
  },

  musica(tema) {
    temaActual = tema;
    if (!activo) return;
    arrancarCtx();
    this.pararMusica(true);
    programar(tema);
  },

  pararMusica(conservarTema = false) {
    clearTimeout(bucle); bucle = null;
    if (!conservarTema) temaActual = null;
  },

  // ---- efectos ----
  salto() { this.tono(430, 0.1, "square", 0.05); this.tono(650, 0.09, "square", 0.04, 0.05); },
  moneda() { this.tono(988, 0.06); this.tono(1319, 0.11, "square", 0.05, 0.06); },
  bloque() { this.tono(330, 0.08, "square", 0.06); },
  golpe() { this.tono(150, 0.2, "sawtooth", 0.06); },
  daño() { [330, 262, 196].forEach((n, i) => this.tono(n, 0.15, "triangle", 0.06, i * 0.1)); },
  acierto() { [660, 880, 1175].forEach((n, i) => this.tono(n, 0.14, "square", 0.05, i * 0.09)); },
  error() { this.tono(200, 0.18, "sawtooth", 0.05); this.tono(140, 0.28, "sawtooth", 0.05, 0.15); },
  checkpoint() { [523, 784].forEach((n, i) => this.tono(n, 0.12, "square", 0.05, i * 0.1)); },
  victoria() { [523, 659, 784, 1047, 1319].forEach((n, i) => this.tono(n, 0.18, "square", 0.06, i * 0.11)); },

  tono(freq, dur, onda = "square", vol = 0.05, retraso = 0) {
    if (!activo) return;
    if (!arrancarCtx()) return;
    nota(freq, ctx.currentTime + retraso, dur, onda, vol);
  },
};
