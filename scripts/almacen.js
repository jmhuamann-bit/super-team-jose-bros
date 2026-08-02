/**
 * almacen.js — progreso del estudiante en el navegador (sin login, sin servidor).
 * Guarda: niveles completados, mejor puntaje por nivel, monedas y XP acumulados.
 * Si más adelante hay cuentas reales, solo hay que reemplazar leer() y escribir().
 */
const CLAVE = "superteamjosebros.v1";

const VACIO = {
  xp: 0,
  monedas: 0,
  audio: true,
  niveles: {}, // { level1: { completado:true, mejorTiempo:123, aciertos:9, intentos:11 } }
};

function leer() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? { ...VACIO, ...JSON.parse(crudo) } : { ...VACIO };
  } catch (e) {
    return { ...VACIO };
  }
}

function escribir(datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* modo privado */ }
}

export const Almacen = {
  /** Estado completo del progreso. */
  cargar: leer,

  /** Suma monedas y XP al total histórico. */
  acumular(xp, monedas) {
    const d = leer();
    d.xp += xp; d.monedas += monedas;
    escribir(d);
  },

  /** Marca un nivel como completado y guarda su mejor marca. */
  completarNivel(idNivel, { tiempo, aciertos, intentos, monedas, xp }) {
    const d = leer();
    const previo = d.niveles[idNivel] || {};
    d.niveles[idNivel] = {
      completado: true,
      mejorTiempo: previo.mejorTiempo ? Math.min(previo.mejorTiempo, tiempo) : tiempo,
      aciertos: Math.max(previo.aciertos || 0, aciertos),
      intentos, monedas, xp,
    };
    escribir(d);
  },

  estaCompletado(idNivel) {
    return !!(leer().niveles[idNivel] || {}).completado;
  },

  marcaDe(idNivel) {
    return leer().niveles[idNivel] || null;
  },

  audioActivo() { return leer().audio !== false; },
  cambiarAudio(v) { const d = leer(); d.audio = !!v; escribir(d); },

  borrarTodo() { escribir({ ...VACIO }); },
};
