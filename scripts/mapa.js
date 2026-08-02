/**
 * mapa.js — la pantalla de campaña.
 *
 * Lee levels/index.json y dibuja la ruta de distritos. Para cambiar el mapa
 * (de Lima a Perú, a América Latina o a lo que sea) NO se toca este archivo:
 * basta con editar ese JSON. Los distritos sin nivel aún se muestran como
 * "próximamente" para que el estudiante vea hacia dónde va la campaña.
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

  campana.niveles.forEach((nivel) => {
    const completado = Almacen.estaCompletado(nivel.id);
    const disponible = !!nivel.mapa && anteriorCompletado;
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
