/**
 * mapa.js — la pantalla de campaña.
 *
 * Lee levels/index.json y dibuja la ruta de distritos. Para cambiar el mapa
 * (de Lima a Perú, a América Latina o a lo que sea) NO se toca este archivo:
 * basta con editar ese JSON. Los distritos sin nivel aún se muestran como
 * "próximamente" para que el estudiante vea hacia dónde va la campaña.
 *
 * Si un nivel trae "seccion" (por ejemplo "PC2"), se dibuja una banda cada
 * vez que ese valor cambia: así la campaña queda partida por práctica sin
 * tocar nada más. El texto chico de la banda sale de "seccionNota".
 */
import { Almacen } from "./almacen.js";

const ruta = document.getElementById("ruta");
const titulo = document.getElementById("mapa-titulo");
const totales = document.getElementById("mapa-totales");

const tiempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * @param {object} campana  contenido de levels/index.json
 * @param {function} alElegir  recibe la definición del nivel elegido
 */
export function pintarMapa(campana, alElegir) {
  const progreso = Almacen.cargar();
  titulo.textContent = campana.titulo;

  totales.innerHTML =
    `<span>⭐ ${progreso.xp} XP</span>` +
    `<span>🪙 ${progreso.monedas}</span>` +
    `<span>🏁 ${campana.niveles.filter((n) => Almacen.estaCompletado(n.id)).length}/${campana.niveles.length}</span>`;

  ruta.innerHTML = "";
  let anteriorCompletado = true;   // el primer distrito siempre está abierto
  let seccionActual = null;        // para saber cuándo toca una banda nueva
  let numeroSeccion = 0;           // le da su color a cada banda

  campana.niveles.forEach((nivel) => {
    // ¿arranca una práctica nueva? entonces va la banda antes del distrito
    if (nivel.seccion && nivel.seccion !== seccionActual) {
      seccionActual = nivel.seccion;
      numeroSeccion++;
      const dela = campana.niveles.filter((n) => n.seccion === seccionActual);
      const hechos = dela.filter((n) => Almacen.estaCompletado(n.id)).length;
      const banda = document.createElement("div");
      banda.className = `seccion s${numeroSeccion}`;
      banda.innerHTML = `
        <span class="etiqueta">${seccionActual}</span>
        <span class="nota">${nivel.seccionNota || ""}</span>
        <span class="linea"></span>
        <span class="cuenta">${hechos}/${dela.length}</span>`;
      ruta.appendChild(banda);
      anteriorCompletado = true;   // cada práctica arranca destrabada
    }

    const completado = Almacen.estaCompletado(nivel.id);
    // un distrito se puede jugar si tiene mapa y, o bien está marcado como
    // "abierto" en el JSON, o bien ya se terminó el distrito anterior
    const disponible = !!nivel.mapa && (nivel.abierto === true || anteriorCompletado);
    const marca = Almacen.marcaDe(nivel.id);

    const parada = document.createElement("div");
    parada.className = "parada" + (completado ? " hecha" : disponible ? " abierta" : "");
    parada.innerHTML = `
      <div class="pin">${completado ? "✅" : disponible ? nivel.icono || "📍" : "🔒"}</div>
      <button class="tarjeta-nivel${nivel.mapa ? "" : " proximo"}" ${disponible ? "" : "disabled"}>
        <span class="clase">${nivel.clase}</span>
        <span class="distrito">${nivel.distrito}</span>
        <span class="desc">${nivel.mapa ? nivel.titulo : "Próximamente"}</span>
        <span class="marcas">
          ${nivel.mapa ? `<span>👾 ${nivel.retos} bichos</span><span>⏱ ~${nivel.duracion}</span>` : "<span>En construcción</span>"}
          ${marca ? `<span>Mejor tiempo <b>${tiempo(marca.mejorTiempo)}</b></span><span>Aciertos <b>${marca.aciertos}</b></span>` : ""}
        </span>
      </button>`;

    if (disponible) {
      parada.querySelector("button").addEventListener("click", () => alElegir(nivel));
    }
    ruta.appendChild(parada);

    // el siguiente distrito se abre solo si este ya fue completado
    if (nivel.mapa) anteriorCompletado = completado;
  });
}
