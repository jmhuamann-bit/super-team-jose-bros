/**
 * hud.js — la barra superior y el cartelito que aparece sobre el lienzo.
 * Solo toca el DOM; no sabe nada de la lógica del juego.
 */
const el = {
  vidas: document.querySelector("#hud-vidas b"),
  xp: document.querySelector("#hud-xp b"),
  monedas: document.querySelector("#hud-monedas b"),
  tiempo: document.querySelector("#hud-tiempo b"),
  pistas: document.querySelector("#hud-pistas b"),
  turbo: document.getElementById("hud-turbo"),
  turboVal: document.querySelector("#hud-turbo b"),
  estrella: document.getElementById("hud-estrella"),
  distrito: document.getElementById("hud-distrito"),
  bichos: document.getElementById("hud-bichos"),
  cartel: document.getElementById("cartel"),
};

let cartelTimer = null;

const reloj = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export const HUD = {
  distrito(nombre, clase) {
    el.distrito.textContent = `📍 ${nombre} · ${clase}`;
  },

  actualizar({ vidas, xp, monedas, tiempo, resueltos, total, pistas = 0, turbo = 0, grande = false }) {
    el.vidas.textContent = String(Math.max(0, vidas));
    el.xp.textContent = xp;
    el.monedas.textContent = monedas;
    el.tiempo.textContent = reloj(tiempo);
    el.pistas.textContent = pistas;
    el.bichos.textContent = `👾 ${resueltos}/${total}`;
    // los poderes solo se muestran mientras están activos
    el.turbo.classList.toggle("oculto", turbo <= 0);
    if (turbo > 0) el.turboVal.textContent = `${Math.ceil(turbo / 60)}s`;
    el.estrella.classList.toggle("oculto", !grande);
  },

  /** Pequeña animación para llamar la atención sobre un dato del HUD. */
  latir(cual) {
    const nodo = document.getElementById(`hud-${cual}`);
    if (!nodo) return;
    nodo.classList.remove("late");
    void nodo.offsetWidth;      // reinicia la animación
    nodo.classList.add("late");
  },

  /** Mensaje temporal sobre el lienzo. */
  cartel(texto, cuadros = 150) {
    el.cartel.textContent = texto;
    el.cartel.hidden = false;
    clearTimeout(cartelTimer);
    cartelTimer = setTimeout(() => { el.cartel.hidden = true; }, (cuadros / 60) * 1000);
  },

  limpiarCartel() {
    clearTimeout(cartelTimer);
    el.cartel.hidden = true;
  },
};
