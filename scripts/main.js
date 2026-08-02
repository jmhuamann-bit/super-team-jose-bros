/**
 * main.js — pega todas las piezas: pantallas, controles y arranque de niveles.
 *
 * Flujo: portada → mapa de distritos → nivel → resumen → mapa.
 */
import { prepararSprites } from "./sprites.js";
import { cargarNivel } from "./nivel.js";
import { crearJuego } from "./motor.js";
import { mostrarPregunta, mostrarAviso } from "./quiz.js";
import { introJefe, animarPortada, galeriaPersonajes } from "./escena.js";
import { pintarMapa } from "./mapa.js";
import { HUD } from "./hud.js";
import { Almacen } from "./almacen.js";
import { Audio } from "./audio.js";

const lienzo = document.getElementById("lienzo");
const pantallas = ["p-portada", "p-mapa", "p-juego", "p-fin"];

let campana = null;     // contenido de levels/index.json
let juego = null;       // instancia del motor
let nivelActual = null;
let pararPortada = null;   // detiene la animación de la pantalla de inicio

/* ------------------------------------------------------------------
   Pantallas
   ------------------------------------------------------------------ */
function ver(id) {
  pantallas.forEach((p) => document.getElementById(p).classList.toggle("activa", p === id));
  // la escena de la portada solo corre mientras se ve la portada
  if (id === "p-portada" && !pararPortada) {
    pararPortada = animarPortada(document.getElementById("portada-lienzo"));
  } else if (id !== "p-portada" && pararPortada) {
    pararPortada(); pararPortada = null;
  }
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function irAlMapa() {
  if (juego) { juego.detener(); juego = null; }
  HUD.limpiarCartel();
  pintarMapa(campana, empezarNivel);
  ver("p-mapa");
}

/* ------------------------------------------------------------------
   Nivel
   ------------------------------------------------------------------ */
async function empezarNivel(definicion) {
  try {
    nivelActual = await cargarNivel(definicion);
  } catch (e) {
    mostrarAviso({
      titulo: "No se pudo cargar el nivel",
      cuerpo: `<p>${e.message}</p><p>Revisa que existan los archivos <b>${definicion.mapa}</b> y <b>${definicion.preguntas}</b>.</p>`,
    });
    return;
  }

  ver("p-juego");
  HUD.distrito(nivelActual.distrito, nivelActual.clase);

  mostrarAviso({
    titulo: `${nivelActual.clase} · ${nivelActual.distrito}`,
    cuerpo: `
      <p style="font-family:var(--display);font-size:26px;letter-spacing:.02em;text-transform:uppercase;margin:0 0 8px">
        ${nivelActual.titulo}</p>
      <p>${nivelActual.intro}</p>
      <p style="color:var(--tinta-2);font-size:14px">
        Muévete con <b>← →</b>, salta con <b>espacio</b> o <b>↑</b> y corre con <b>Shift</b>.
        En celular usa los botones de abajo.<br>
        Toca a los bichos para que aparezca su pregunta: si aciertas, desaparecen.
      </p>`,
    boton: "¡Vamos!",
    alCerrar: () => {
      juego = crearJuego(lienzo, nivelActual, {
        onHUD: (d) => HUD.actualizar(d),
        onCartel: (t, d) => HUD.cartel(t, d),
        onLatido: (q) => HUD.latir(q),
        onPregunta: (datos, listo) => mostrarPregunta(datos, listo),
        onIntroJefe: (datos, listo) => introJefe(datos, listo),
        onFin: (resumen) => terminarNivel(resumen),
      });
      juego.iniciar();
    },
  });
}

function terminarNivel(r) {
  Almacen.completarNivel(nivelActual.id, r);
  Almacen.acumular(r.xp, r.monedas);

  const precision = r.intentos ? Math.round((r.aciertos / r.intentos) * 100) : 100;
  document.getElementById("p-fin").innerHTML = `
    <div class="resumen">
      <p class="eyebrow">${nivelActual.clase} · ${nivelActual.distrito}</p>
      <h2>¡Distrito liberado!</h2>
      <div class="marcador">
        <div>Tiempo<span>${Math.floor(r.tiempo / 60)}:${String(r.tiempo % 60).padStart(2, "0")}</span></div>
        <div>XP<span>${r.xp}</span></div>
        <div>Monedas<span>${r.monedas}</span></div>
        <div>Precisión<span>${precision}%</span></div>
      </div>
      <div class="repaso">
        <p><b>Lo que acabas de practicar:</b></p>
        ${nivelActual.repaso.map((t) => `<p>• ${t}</p>`).join("")}
      </div>
      <div class="acciones" style="justify-content:center">
        <button class="btn" id="fin-mapa">Ir al mapa</button>
        <button class="btn fantasma" id="fin-repetir">Repetir distrito</button>
      </div>
    </div>`;
  ver("p-fin");
  document.getElementById("fin-mapa").onclick = irAlMapa;
  document.getElementById("fin-repetir").onclick = () => {
    const def = campana.niveles.find((n) => n.id === nivelActual.id);
    empezarNivel(def);
  };
}

/* ------------------------------------------------------------------
   Controles
   ------------------------------------------------------------------ */
const TECLAS = {
  ArrowLeft: "izquierda", KeyA: "izquierda",
  ArrowRight: "derecha", KeyD: "derecha",
  Space: "saltar", ArrowUp: "saltar", KeyW: "saltar",
  ShiftLeft: "correr", ShiftRight: "correr",
};

window.addEventListener("keydown", (e) => {
  const t = TECLAS[e.code];
  if (t && juego) { juego.teclas[t] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const t = TECLAS[e.code];
  if (t && juego) juego.teclas[t] = false;
});
// si la pestaña pierde el foco, se sueltan las teclas (evita que el personaje siga corriendo)
window.addEventListener("blur", () => {
  if (juego) Object.keys(juego.teclas).forEach((k) => (juego.teclas[k] = false));
});

document.querySelectorAll("#mandos button").forEach((b) => {
  const t = b.dataset.tecla;
  const on = (e) => { e.preventDefault(); if (juego) juego.teclas[t] = true; };
  const off = (e) => { e.preventDefault(); if (juego) juego.teclas[t] = false; };
  b.addEventListener("pointerdown", on);
  b.addEventListener("pointerup", off);
  b.addEventListener("pointerleave", off);
  b.addEventListener("pointercancel", off);
});
if (matchMedia("(pointer:coarse)").matches) document.body.classList.add("tactil");

/* ------------------------------------------------------------------
   Botones de la interfaz
   ------------------------------------------------------------------ */
document.getElementById("btn-jugar").onclick = irAlMapa;
document.getElementById("btn-portada").onclick = () => ver("p-portada");
document.getElementById("btn-salir").onclick = () => {
  if (confirm("¿Salir al mapa? Perderás el avance de este distrito.")) irAlMapa();
};
document.getElementById("btn-borrar").onclick = () => {
  if (confirm("¿Borrar todo tu progreso guardado en este navegador?")) {
    Almacen.borrarTodo();
    irAlMapa();
  }
};
document.getElementById("btn-ayuda").onclick = () => mostrarAviso({
  titulo: "Cómo se juega",
  cuerpo: `
    <p><b>Muévete:</b> ← → · <b>Salta:</b> espacio o ↑ · <b>Corre:</b> Shift.<br>
    En celular aparecen los botones abajo del juego.</p>
    <p><b>Los bichos son preguntas.</b> Al tocarlos el juego se pausa y aparecen cuatro alternativas.
    Si aciertas, el bicho desaparece y ganas XP y monedas. Si fallas, pierdes una vida y el bicho
    se queda: puedes volver a intentarlo.</p>
    <p><b>Los bloques amarillos se rompen de cabezazo</b> saltando desde abajo. Cada uno guarda
    algo distinto:</p>
    <p style="margin-left:8px">
      🪙 <b>Monedas</b> · 🐟 <b>Ceviche:</b> una vida más ·
      ⭐ <b>Estrella:</b> José crece y aguanta un golpe ·
      ⚡ <b>Chicha energética:</b> corres mucho más rápido unos segundos ·
      💡 <b>Foco:</b> una pista que puedes gastar en cualquier pregunta para descartar
      dos alternativas.</p>
    <p><b>Las preguntas se ponen más difíciles</b> conforme avanzas en el distrito, y al final
    te espera un jefe con tres preguntas seguidas.</p>
    <p><b>❤️ Vidas:</b> empiezas con 3. Si se acaban, reapareces en el último checkpoint con
    las 3 de vuelta. Nunca vuelves al inicio del nivel.</p>
    <p><b>El final:</b> subes la escalera y te lanzas al mástil. Mientras <b>más alto</b> lo
    agarres, más monedas de bonus. Después te recoge el transporte del distrito
    (mototaxi, combi o hasta limosina) y te lleva al siguiente.</p>`,
});

/* ------------------------------------------------------------------
   Arranque
   ------------------------------------------------------------------ */
async function arrancar() {
  const problemas = prepararSprites(2);
  if (problemas.length) console.warn("Sprites con filas desparejas:\n" + problemas.join("\n"));

  galeriaPersonajes(document.getElementById("galeria"));
  pararPortada = animarPortada(document.getElementById("portada-lienzo"));

  try {
    campana = await (await fetch("levels/index.json", { cache: "no-cache" })).json();
  } catch (e) {
    document.getElementById("p-portada").innerHTML =
      `<div class="portada"><h1 class="logo">Ups</h1><p class="lema">No se pudo cargar levels/index.json.</p></div>`;
    return;
  }

  const p = Almacen.cargar();
  const hechos = campana.niveles.filter((n) => Almacen.estaCompletado(n.id)).length;
  document.getElementById("nota-progreso").textContent = hechos
    ? `Llevas ${hechos} distrito(s) · ⭐ ${p.xp} XP · 🪙 ${p.monedas}`
    : "Tu progreso se guarda solo en este navegador.";
}

arrancar();
