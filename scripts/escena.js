/**
 * escena.js — las partes cinematográficas del juego.
 *
 *  - introJefe(): viñetas estilo manga antes de pelear con el jefe del distrito.
 *  - animarPortada(): la escena que corre sola en la pantalla de inicio.
 *  - galeriaPersonajes(): las tarjetas con los bichos que el alumno va a encontrar.
 *
 * Nada de esto afecta a la lógica del juego: si se quita, el juego sigue andando.
 */
import { pintar, miniatura, medida } from "./sprites.js";
import { Audio } from "./audio.js";

/* ==============================================================
   1. VIÑETAS DEL JEFE
   ============================================================== */
const capa = document.getElementById("manga");

export function introJefe({ nombre, sprite, distrito, retos }, alTerminar) {
  let cerrado = false;
  const cerrar = () => {
    if (cerrado) return;
    cerrado = true;
    capa.classList.remove("visible");
    capa.hidden = true;
    capa.innerHTML = "";
    clearTimeout(temporizador);
    alTerminar();
  };

  capa.innerHTML = `
    <div class="manga-tiras">
      <div class="vineta v1">
        <div class="lineas"></div>
        <span class="texto">Algo grande se mueve al final de ${distrito}…</span>
      </div>
      <div class="vineta v2">
        <div class="lineas rapidas"></div>
        <span class="retrato" id="manga-jefe"></span>
        <span class="nombre">${nombre}</span>
      </div>
      <div class="vineta v3">
        <span class="retrato chico" id="manga-jose"></span>
        <span class="texto">«${retos} preguntas y cae.»</span>
      </div>
      <div class="estampa">¡A PELEAR!</div>
    </div>
    <button class="saltar">Saltar ▸</button>`;

  capa.querySelector("#manga-jefe").appendChild(miniatura(sprite, 5));
  capa.querySelector("#manga-jose").appendChild(miniatura("jose_quieto", 5));
  capa.hidden = false;
  setTimeout(() => capa.classList.add("visible"), 16);   // deja que aplique la transición

  // golpes de sonido acompañando cada viñeta
  [0, 550, 1100].forEach((ms, i) => setTimeout(() => Audio.tono(160 + i * 90, 0.18, "square", 0.05), ms));
  setTimeout(() => Audio.golpe(), 1750);

  capa.addEventListener("click", cerrar, { once: true });
  const temporizador = setTimeout(cerrar, 2900);
}

/* ==============================================================
   2. ESCENA ANIMADA DE LA PORTADA
   ============================================================== */
export function animarPortada(lienzo) {
  const ctx = lienzo.getContext("2d");
  const A = lienzo.width, H = lienzo.height;
  const SUELO = H - 26;
  let t = 0, corriendo = true;

  // objetos que cruzan la escena
  const monedas = [0, 1, 2].map((i) => ({ x: 180 + i * 260, y: SUELO - 74 }));
  const bichos = [
    { x: 320, sprite: "gaviota" },
    { x: 700, sprite: "cono" },
  ];

  function cuadro() {
    if (!corriendo) return;
    t++;
    const desp = t * 1.7;   // la escena se desplaza sola

    // cielo del amanecer
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1b2b52"); g.addColorStop(0.6, "#4a6ea8"); g.addColorStop(1, "#f0b26b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, A, H);

    // cerros y grúas al fondo
    for (let i = 0; i < 8; i++) {
      const x = (i * 190 - (desp * 0.25) % 190 + A + 190) % (A + 380) - 190;
      ctx.fillStyle = "#243b56";
      ctx.fillRect(x + 30, SUELO - 96, 7, 96);
      ctx.fillRect(x + 30, SUELO - 100, 74, 6);
      ctx.fillStyle = "#2f6b8f";
      ctx.fillRect(x + 110, SUELO - 34, 40, 20);
      ctx.fillStyle = "#c14a22";
      ctx.fillRect(x + 110, SUELO - 54, 40, 20);
    }

    // piso
    ctx.fillStyle = "#5d6b78"; ctx.fillRect(0, SUELO, A, H - SUELO);
    ctx.fillStyle = "#8fa3b0"; ctx.fillRect(0, SUELO, A, 5);
    for (let i = 0; i < 30; i++) {
      const x = (i * 61 - desp % 61 + A) % (A + 61) - 30;
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(x, SUELO + 12, 9, 5);
    }

    // monedas girando
    monedas.forEach((m, i) => {
      const x = (m.x - desp % (A + 300) + A + 300) % (A + 300) - 60;
      const gira = Math.floor((t + i * 9) / 9) % 4;
      pintar(ctx, gira === 2 ? "moneda_b" : "moneda_a", x, m.y + Math.sin((t + i * 20) / 20) * 3);
    });

    // bichos con su globito
    bichos.forEach((b, i) => {
      const x = (b.x - desp % (A + 400) + A + 400) % (A + 400) - 60;
      const flota = Math.sin((t + i * 30) / 16) * 2;
      pintar(ctx, b.sprite, x, SUELO - 26 + flota, true);
      ctx.fillStyle = "rgba(18,16,42,.85)";
      ctx.fillRect(x + 8, SUELO - 44 + flota, 14, 12);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("?", x + 15, SUELO - 34 + flota);
      ctx.textAlign = "left";
    });

    // José corriendo en el sitio, con saltitos cada cierto rato
    const cicloSalto = t % 200;
    const salto = cicloSalto < 40 ? -Math.sin((cicloSalto / 40) * Math.PI) * 54 : 0;
    const enAire = salto < -1;
    const sprite = enAire ? "jose_salta" : (Math.floor(t / 6) % 2 ? "jose_paso_a" : "jose_paso_b");
    const m = medida(sprite);
    pintar(ctx, sprite, 96, SUELO - m.alto + salto);

    // garúa
    ctx.strokeStyle = "rgba(200,225,255,.30)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const x = (i * 137 + t * 2.4) % (A + 40) - 20;
      const y = (i * 71 + t * 7) % H;
      ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 9);
    }
    ctx.stroke();

    requestAnimationFrame(cuadro);
  }
  cuadro();

  return () => { corriendo = false; };
}

/* ==============================================================
   3. TARJETAS DE PERSONAJES
   ============================================================== */
const FICHAS = [
  { sprite: "jose_quieto", nombre: "José", texto: "Tú. Corre, salta y responde." },
  { sprite: "gaviota", nombre: "Gaviota Regatona", texto: "Quiere llevarse todas las alternativas a la vez." },
  { sprite: "contenedor", nombre: "Contenedor Colado", texto: "Cree que lo que más entra es lo que más deja." },
  { sprite: "pulpo", nombre: "El Pulpo Sumador", texto: "Jefe del puerto: suma todo lo que dejaste de lado." },
  { sprite: "paloma", nombre: "Paloma Presumida", texto: "Confunde ingresos con beneficios." },
  { sprite: "combi", nombre: "La Combi Indecisa", texto: "Jefa del malecón: nunca escoge su ruta." },
  { sprite: "cuy", nombre: "Cuy Regateador", texto: "Confunde la demanda con la cantidad demandada." },
  { sprite: "torito", nombre: "El Torito de Pucará", texto: "Jefe de la plaza: no sabe igualar oferta con demanda." },
  { sprite: "flor", nombre: "La Flor Paradita", texto: "Vertical y orgullosa: pase lo que pase, la cantidad no se mueve." },
  { sprite: "ardilla", nombre: "La Ardilla Curvilínea", texto: "Jura que si no es recta, no es demanda." },
  { sprite: "monumento", nombre: "El Monumento Inamovible", texto: "Jefe de Jesús María: pendiente infinita y cero ganas de moverse." },
  { sprite: "globo", nombre: "El Globo Invertido", texto: "Confunde la pendiente con la pendiente inversa." },
  { sprite: "diana", nombre: "La Diana sin Punto", texto: "Tiene la pendiente lista, pero nunca encuentra el punto." },
  { sprite: "payaso", nombre: "El Payaso de las Máximas", texto: "Jefe de Lince: no distingue la máxima de las máximas disposiciones a pagar." },
  { sprite: "maletin", nombre: "El Maletín Deslizado", texto: "Cree que la curva se desplaza cuando solo cambia el precio." },
  { sprite: "corbata", nombre: "La Corbata Sustituta", texto: "Confunde los bienes sustitutos con los complementarios." },
  { sprite: "ejecutivo", nombre: "El Ejecutivo de las Expectativas", texto: "Jefe de San Isidro: olvida que las expectativas mueven las dos curvas." },
  { sprite: "parapente", nombre: "El Parapente sin Ajuste", texto: "Cree que del viejo equilibrio se salta al nuevo de un tirón." },
  { sprite: "tabla", nombre: "La Tabla Escasa", texto: "Confunde la escasez con la sobreproducción." },
  { sprite: "gato", nombre: "El Gato del Desequilibrio", texto: "Jefe de Miraflores: jura que la ley de la demanda dejó de cumplirse." },
];

export function galeriaPersonajes(contenedor) {
  contenedor.innerHTML = "";
  FICHAS.forEach((f, i) => {
    const t = document.createElement("figure");
    t.className = "ficha";
    t.style.animationDelay = `${i * 90}ms`;
    t.appendChild(miniatura(f.sprite, 3));
    t.insertAdjacentHTML("beforeend",
      `<figcaption><b>${f.nombre}</b><span>${f.texto}</span></figcaption>`);
    contenedor.appendChild(t);
  });
}
