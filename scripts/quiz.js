/**
 * quiz.js — la ventana de preguntas y los avisos.
 *
 * El motor congela el juego y llama a mostrarPregunta(); acá se arma la tarjeta,
 * se escucha la respuesta (mouse, dedo o teclado 1-4) y se devuelve si acertó.
 */
import { miniatura } from "./sprites.js";

const velo = document.getElementById("velo");
const tarjeta = document.getElementById("tarjeta");

const ETIQUETA_NIVEL = {
  reconocimiento: "Reconocimiento",
  comprension: "Comprensión",
  aplicacion: "Aplicación",
};
const PUNTOS_NIVEL = { reconocimiento: 1, comprension: 2, aplicacion: 3 };

let manejadorTeclas = null;

function escapar(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cerrar() {
  velo.hidden = true;
  tarjeta.className = "tarjeta";
  if (manejadorTeclas) { window.removeEventListener("keydown", manejadorTeclas, true); manejadorTeclas = null; }
}

function barraDificultad(nivel) {
  const n = PUNTOS_NIVEL[nivel] || 1;
  return `<span class="escala-dificultad" title="${ETIQUETA_NIVEL[nivel] || ""}">` +
    [1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("") + "</span>";
}

/**
 * Muestra una pregunta de opción múltiple.
 * @param {object} datos  { pregunta, nombre, sprite, esJefe, paso, total }
 * @param {function} alTerminar  recibe true si acertó
 */
export function mostrarPregunta(datos, alTerminar) {
  const { pregunta, nombre, sprite, esJefe, paso, total, pistas = 0, usarPista } = datos;
  const letras = ["A", "B", "C", "D", "E", "F"];
  let descartadas = [];

  tarjeta.className = "tarjeta";
  tarjeta.innerHTML = `
    <div class="encabezado">
      <span>${esJefe ? `Jefe · pregunta ${paso} de ${total}` : "Bicho de la clase"}</span>
      <span>${ETIQUETA_NIVEL[pregunta.nivel] || ""} ${barraDificultad(pregunta.nivel)}</span>
    </div>
    <div class="bicho-nombre"><span id="q-sprite"></span><b>${escapar(nombre)}</b></div>
    <p class="enunciado">${escapar(pregunta.enunciado)}</p>
    <div class="opciones">
      ${pregunta.opciones.map((o, i) => `
        <button class="opcion" data-i="${i}">
          <span class="letra">${letras[i]}</span><span>${escapar(o)}</span>
        </button>`).join("")}
    </div>
    <div class="fila-pista">
      <button class="btn-pista" id="q-pista" ${pistas > 0 ? "" : "disabled"}>
        💡 Usar pista <b>(${pistas})</b>
      </button>
      <span>Descarta dos alternativas. Los focos salen de los bloques del nivel.</span>
    </div>`;
  tarjeta.querySelector("#q-sprite").appendChild(miniatura(sprite, 3));
  velo.hidden = false;
  tarjeta.querySelector(".opcion")?.focus();

  // --- pista: apaga dos alternativas equivocadas ---
  tarjeta.querySelector("#q-pista").addEventListener("click", (e) => {
    if (!usarPista || !usarPista()) return;
    const malas = pregunta.opciones
      .map((_, i) => i)
      .filter((i) => i !== pregunta.correcta)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    descartadas = malas;
    malas.forEach((i) => {
      const b = tarjeta.querySelector(`.opcion[data-i="${i}"]`);
      b.disabled = true;
      b.classList.add("descartada");
    });
    e.currentTarget.disabled = true;
    e.currentTarget.innerHTML = "💡 Pista usada";
  });

  const responder = (elegida) => {
    const acerto = elegida === pregunta.correcta;
    const botones = [...tarjeta.querySelectorAll(".opcion")];
    botones.forEach((b, i) => {
      b.disabled = true;
      if (i === pregunta.correcta) b.classList.add("correcta");
      else if (i === elegida) b.classList.add("incorrecta");
    });
    if (manejadorTeclas) { window.removeEventListener("keydown", manejadorTeclas, true); manejadorTeclas = null; }

    tarjeta.classList.add(acerto ? "bien" : "mal");
    tarjeta.querySelector(".encabezado span").textContent = acerto ? "¡Correcto!" : "Incorrecto";
    tarjeta.insertAdjacentHTML("beforeend", `
      <div class="explicacion ${acerto ? "bien" : "mal"}">
        <span class="titulo">${acerto ? "Bien resuelto" : "Ojo con esto"}</span>
        ${escapar(pregunta.explicacion)}
      </div>
      ${acerto
        ? `<div class="premio">+${{ reconocimiento: 10, comprension: 15, aplicacion: 25 }[pregunta.nivel] || 10} XP ⭐ · +5 monedas 🪙</div>`
        : `<div class="premio">Pierdes una vida ❤️ · el bicho sigue ahí, puedes intentarlo de nuevo</div>`}
      <div class="acciones"><button class="btn" id="q-seguir">Continuar</button></div>`);

    const seguir = tarjeta.querySelector("#q-seguir");
    seguir.focus();
    seguir.addEventListener("click", () => { cerrar(); alTerminar(acerto); });
  };

  tarjeta.querySelectorAll(".opcion").forEach((b) =>
    b.addEventListener("click", () => responder(parseInt(b.dataset.i, 10))));

  manejadorTeclas = (e) => {
    const n = "1234".indexOf(e.key);
    const l = "abcd".indexOf(e.key.toLowerCase());
    const i = n >= 0 ? n : l;
    if (i >= 0 && i < pregunta.opciones.length && !descartadas.includes(i)) {
      e.preventDefault(); responder(i);
    }
  };
  window.addEventListener("keydown", manejadorTeclas, true);
}

/** Ventana simple de aviso (instrucciones, intro de nivel, confirmaciones). */
export function mostrarAviso({ titulo, cuerpo, boton = "Entendido", alCerrar }) {
  tarjeta.className = "tarjeta";
  tarjeta.innerHTML = `
    <div class="encabezado"><span>${escapar(titulo)}</span></div>
    <div class="enunciado">${cuerpo}</div>
    <div class="acciones"><button class="btn" id="a-ok">${escapar(boton)}</button></div>`;
  velo.hidden = false;
  const ok = tarjeta.querySelector("#a-ok");
  ok.focus();
  ok.addEventListener("click", () => { cerrar(); alCerrar?.(); });
}
