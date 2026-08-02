/**
 * config.js — todos los números que definen la sensación del juego.
 * Si algo se siente lento, pesado o resbaloso, se ajusta AQUÍ y en ningún otro lado.
 */
export const CFG = {
  // --- lienzo y rejilla ---
  TILE: 32,          // lado de cada bloque, en píxeles
  FILAS: 15,         // alto del nivel en bloques (15 × 32 = 480)
  ANCHO_VISTA: 800,  // ancho visible del lienzo
  ALTO_VISTA: 480,

  // --- física del personaje ---
  GRAVEDAD: 0.62,
  VEL_MAX_CAIDA: 15,
  FUERZA_SALTO: -11.8,
  SALTO_CORTO: 0.45,   // al soltar el botón, la subida se corta (salto variable)
  ACELERACION: 0.78,
  FRICCION: 0.80,
  VEL_CAMINA: 3.3,
  VEL_CORRE: 5.4,
  COYOTE: 6,           // frames de gracia para saltar tras salir de una plataforma
  BUFFER_SALTO: 7,     // frames de gracia si se presiona saltar justo antes de caer

  // --- personaje ---
  ANCHO_JUGADOR: 20,
  ALTO_JUGADOR: 30,
  INVULNERABLE: 90,    // frames de invulnerabilidad tras recibir daño

  // --- reglas ---
  VIDAS: 3,
  MONEDAS_ACIERTO: 5,
  MONEDAS_BLOQUE: 3,
  XP: { reconocimiento: 10, comprension: 15, aplicacion: 25 },
  VEL_TURBO: 7.2,      // velocidad con la chicha energética
  DURA_TURBO: 420,     // cuadros que dura (unos 7 segundos)

  // --- enemigos ---
  VEL_BICHO: 0.75,
  RADIO_PATRULLA: 72,  // píxeles a cada lado de su punto de origen
};

/** Símbolos que se usan en el arreglo "mapa" de cada nivel JSON. */
export const SIMBOLOS = {
  VACIO: " ",
  SUELO: "#",
  PLATAFORMA: "=",
  BLOQUE: "?",           // bloque sorpresa: suelta monedas
  BLOQUE_VIDA: "1",      // ceviche: una vida más
  BLOQUE_ESTRELLA: "G",  // estrella: José crece y aguanta un golpe
  BLOQUE_TURBO: "V",     // chicha energética: corre más rápido un rato
  BLOQUE_PISTA: "L",     // foco: una pista para usar en cualquier pregunta
  MONEDA: "o",
  BICHO: "E",    // enemigo con pregunta
  JEFE: "B",     // jefe final del distrito
  PELIGRO: "X",  // obstáculo que quita una vida
  CHECKPOINT: "C",
  META: "M",
  INICIO: "P",
};
