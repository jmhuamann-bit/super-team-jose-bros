/**
 * motor.js — el corazón del juego: física, colisiones, cámara y dibujo.
 *
 * No sabe nada de preguntas ni de pantallas HTML: cuando el jugador toca un bicho
 * avisa hacia afuera con onPregunta() y se queda congelado hasta que le respondan.
 * Así el motor sirve igual para cualquier curso o cualquier banco de preguntas.
 */
import { CFG } from "./config.js";
import { TILE, esSolido } from "./nivel.js";
import { TEMAS, pintarCielo, pintarTile } from "./temas.js";
import { pintar, medida } from "./sprites.js";
import { Audio } from "./audio.js";

export function crearJuego(lienzo, nivel, eventos) {
  const ctx = lienzo.getContext("2d");
  const tema = TEMAS[nivel.tema] || TEMAS.puerto;

  /* ---------------- estado ---------------- */
  const est = {
    vidas: CFG.VIDAS, monedas: 0, xp: 0,
    aciertos: 0, intentos: 0, resueltos: 0,
    tiempo: 0,            // segundos jugados (no corre durante las preguntas)
    corriendo: false, pausa: false, terminado: false,
    grande: false,        // con la estrella aguanta un golpe sin perder vida
    turbo: 0,             // cuadros que le quedan a la chicha energética
    pistas: 0,            // focos guardados para usar en las preguntas
    reaparicion: { ...nivel.inicio },
    salida: null,         // animación del mástil y el vehículo al terminar
  };

  const jug = {
    x: nivel.inicio.x, y: nivel.inicio.y, vx: 0, vy: 0,
    enSuelo: false, izquierda: false, paso: 0,
    coyote: 0, buffer: 0, invulnerable: 0, saltando: false,
  };

  const teclas = { izquierda: false, derecha: false, saltar: false, correr: false };
  const particulas = [];   // chispas
  const premios = [];      // objetos que salen de los bloques y suben flotando
  const textos = [];       // textos que suben y se desvanecen ("+1 VIDA")
  const derrotados = [];   // bichos girando por los aires tras responder bien
  let cam = 0, reloj = 0, rafId = 0, ultimo = 0;

  /* ---------------- utilidades ---------------- */
  const chocan = (a, b) =>
    a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y;

  const cajaJugador = () => ({ x: jug.x, y: jug.y, ancho: CFG.ANCHO_JUGADOR, alto: CFG.ALTO_JUGADOR });

  function chispas(x, y, color, cantidad = 8) {
    for (let i = 0; i < cantidad; i++) {
      particulas.push({
        x, y, vx: (Math.random() - 0.5) * 3.4, vy: -Math.random() * 3.2 - 0.6,
        vida: 26 + Math.random() * 16, color,
      });
    }
  }

  function avisar(texto, duracion = 150) {
    eventos.onCartel?.(texto, duracion);
  }

  /** Texto que sube flotando desde un punto del mapa. */
  function flotar(x, y, texto, color = "#ffd166") {
    textos.push({ x, y, texto, color, vida: 70 });
  }

  /* ---------------- física ---------------- */
  function mover() {
    // con la chicha energética corre más rápido y deja un rastro de colores
    if (est.turbo > 0) {
      est.turbo--;
      if (est.turbo === 0) flotar(jug.x, jug.y - 12, "se acabó la chicha", "#8fb4cb");
      if (Math.abs(jug.vx) > 1 && reloj % 3 === 0) {
        particulas.push({
          x: jug.x + 10, y: jug.y + 20, vx: -jug.vx * 0.25, vy: -0.3,
          vida: 14, color: reloj % 6 ? "#38bdf8" : "#ffd166",
        });
      }
    }
    const objetivo = est.turbo > 0 ? CFG.VEL_TURBO : (teclas.correr ? CFG.VEL_CORRE : CFG.VEL_CAMINA);
    let dir = 0;
    if (teclas.izquierda) dir = -1;
    if (teclas.derecha) dir = 1;

    if (dir !== 0) {
      jug.vx += dir * CFG.ACELERACION;
      jug.vx = Math.max(-objetivo, Math.min(objetivo, jug.vx));
      jug.izquierda = dir < 0;
    } else {
      jug.vx *= CFG.FRICCION;
      if (Math.abs(jug.vx) < 0.06) jug.vx = 0;
    }

    // salto con "coyote time" y "buffer": perdona los milisegundos de más o de menos
    if (teclas.saltar) jug.buffer = CFG.BUFFER_SALTO; else if (jug.buffer > 0) jug.buffer--;
    if (jug.enSuelo) jug.coyote = CFG.COYOTE; else if (jug.coyote > 0) jug.coyote--;

    if (jug.buffer > 0 && jug.coyote > 0) {
      jug.vy = CFG.FUERZA_SALTO;
      jug.enSuelo = false; jug.saltando = true;
      jug.buffer = 0; jug.coyote = 0;
      Audio.salto();
    }
    // salto variable: si suelta el botón mientras sube, el salto se acorta
    if (!teclas.saltar && jug.saltando && jug.vy < 0) {
      jug.vy *= CFG.SALTO_CORTO;
      jug.saltando = false;
    }

    jug.vy = Math.min(jug.vy + CFG.GRAVEDAD, CFG.VEL_MAX_CAIDA);
    colisionar();

    jug.paso = (jug.enSuelo && Math.abs(jug.vx) > 0.3) ? jug.paso + Math.abs(jug.vx) * 0.28 : 0;
    if (jug.invulnerable > 0) jug.invulnerable--;
  }

  /**
   * Aplica la velocidad actual y resuelve los choques contra el mapa,
   * primero en horizontal y luego en vertical (así no se traba en las esquinas).
   */
  function colisionar() {
    // --- horizontal ---
    jug.x += jug.vx;
    let c0 = Math.floor(jug.x / CFG.TILE), c1 = Math.floor((jug.x + CFG.ANCHO_JUGADOR - 1) / CFG.TILE);
    let f0 = Math.floor(jug.y / CFG.TILE), f1 = Math.floor((jug.y + CFG.ALTO_JUGADOR - 1) / CFG.TILE);
    for (let f = f0; f <= f1; f++) {
      if (jug.vx > 0 && esSolido(nivel, c1, f)) { jug.x = c1 * CFG.TILE - CFG.ANCHO_JUGADOR; jug.vx = 0; }
      else if (jug.vx < 0 && esSolido(nivel, c0, f)) { jug.x = (c0 + 1) * CFG.TILE; jug.vx = 0; }
    }

    // --- vertical ---
    jug.y += jug.vy;
    jug.enSuelo = false;
    c0 = Math.floor(jug.x / CFG.TILE); c1 = Math.floor((jug.x + CFG.ANCHO_JUGADOR - 1) / CFG.TILE);
    f0 = Math.floor(jug.y / CFG.TILE); f1 = Math.floor((jug.y + CFG.ALTO_JUGADOR - 1) / CFG.TILE);
    for (let c = c0; c <= c1; c++) {
      if (jug.vy > 0 && esSolido(nivel, c, f1)) {
        jug.y = f1 * CFG.TILE - CFG.ALTO_JUGADOR; jug.vy = 0; jug.enSuelo = true; jug.saltando = false;
      } else if (jug.vy < 0 && esSolido(nivel, c, f0)) {
        jug.y = (f0 + 1) * CFG.TILE; jug.vy = 0;
      }
    }
  }

  /* ---------------- daño y reaparición ---------------- */
  function perderVida(motivo, reaparecer = true) {
    if (jug.invulnerable > 0 && reaparecer) return;

    // con la estrella, José aguanta un golpe: se encoge en vez de perder vida
    if (est.grande && reaparecer) {
      est.grande = false;
      jug.invulnerable = CFG.INVULNERABLE;
      chispas(jug.x + 10, jug.y + 10, "#ffd166", 18);
      flotar(jug.x, jug.y - 10, "¡UF! Perdiste la estrella", "#ffd166");
      Audio.daño();
      return;
    }

    est.vidas--;
    jug.invulnerable = CFG.INVULNERABLE;
    Audio.daño();
    eventos.onLatido?.("vidas");

    if (est.vidas <= 0) {
      est.vidas = CFG.VIDAS;
      avisar("Te quedaste sin vidas: vuelves al último checkpoint con 3 ❤️", 210);
    } else if (motivo) {
      avisar(motivo, 150);
    }
    if (reaparecer) {
      jug.x = est.reaparicion.x; jug.y = est.reaparicion.y;
      jug.vx = 0; jug.vy = 0;
    }
    refrescar();
  }

  /* ---------------- objetos del nivel ---------------- */
  function revisarObjetos() {
    const caja = cajaJugador();

    // monedas
    for (const m of nivel.monedas) {
      if (m.tomada) continue;
      if (chocan(caja, { x: m.x - 4, y: m.y - 4, ancho: 28, alto: 28 })) {
        m.tomada = true; est.monedas++; Audio.moneda();
        chispas(m.x + 10, m.y + 10, "#ffd166", 6);
        refrescar();
      }
    }

    // bloques sorpresa: se golpean desde abajo y sueltan un premio
    for (const b of nivel.bloques) {
      if (b.rebote > 0) b.rebote--;
      if (b.usado) continue;
      if (chocan(caja, { x: b.x, y: b.y, ancho: 24, alto: 24 }) && jug.vy < 0) {
        b.usado = true;
        b.rebote = 14;        // el bloque salta hacia arriba y vuelve
        b.destello = 14;      // anillo blanco que se expande
        jug.vy = 1.4;         // el cabezazo corta el salto, como en los clásicos
        Audio.bloque();
        chispas(b.x + 12, b.y - 2, "#ffd166", 16);

        if (b.premio === "vida") {
          est.vidas++;
          premios.push({ x: b.x + 2, y: b.y - 24, vy: -4.2, gravedad: 0.11, sprite: "item_ceviche", vida: 78, gira: false });
          flotar(b.x - 16, b.y - 34, "CEVICHE: +1 VIDA", "#ff5470");
          eventos.onLatido?.("vidas");
          Audio.victoria();
        } else if (b.premio === "turbo") {
          est.turbo = CFG.DURA_TURBO;
          premios.push({ x: b.x + 2, y: b.y - 24, vy: -4.6, gravedad: 0.12, sprite: "item_rayo", vida: 70, gira: false });
          flotar(b.x - 22, b.y - 34, "CHICHA ENERGÉTICA: ¡VELOCIDAD!", "#ffd166");
          chispas(jug.x + 10, jug.y + 14, "#38bdf8", 20);
          eventos.onLatido?.("turbo");
          Audio.victoria();
        } else if (b.premio === "pista") {
          est.pistas++;
          premios.push({ x: b.x + 2, y: b.y - 24, vy: -4.4, gravedad: 0.12, sprite: "item_foco", vida: 74, gira: false });
          flotar(b.x - 18, b.y - 34, "PISTA GUARDADA", "#38bdf8");
          eventos.onLatido?.("pistas");
          Audio.victoria();
        } else if (b.premio === "estrella") {
          est.grande = true;
          premios.push({ x: b.x + 2, y: b.y - 24, vy: -4.2, gravedad: 0.11, sprite: "item_estrella", vida: 78, gira: false });
          flotar(b.x - 14, b.y - 34, "CRECISTE", "#ffd166");
          chispas(jug.x + 10, jug.y + 10, "#ffd166", 26);
          Audio.victoria();
        } else {
          est.monedas += CFG.MONEDAS_BLOQUE;
          // la moneda sale disparada, llega a su punto más alto y desaparece
          premios.push({ x: b.x + 2, y: b.y - 20, vy: -6.4, gravedad: 0.34, sprite: "moneda_a", vida: 40, gira: true });
          flotar(b.x - 4, b.y - 40, `+${CFG.MONEDAS_BLOQUE}`);
          Audio.moneda();
        }
        refrescar();
      }
    }

    // obstáculos
    for (const p of nivel.peligros) {
      if (chocan(caja, p)) perderVida("¡Ay! Ese obstáculo te costó una vida ❤️");
    }

    // checkpoints
    for (const cp of nivel.checkpoints) {
      if (cp.activo) continue;
      if (chocan(caja, { x: cp.x, y: cp.y, ancho: CFG.TILE, alto: CFG.TILE * 2 })) {
        cp.activo = true;
        est.reaparicion = { x: cp.x, y: cp.y };
        Audio.checkpoint();
        avisar("✅ Checkpoint guardado", 120);
      }
    }

    // caída al vacío
    if (jug.y > nivel.alto * CFG.TILE + 60) perderVida("Te caíste. Vuelves al último checkpoint.");

    // bichos
    for (const b of nivel.bichos) {
      if (!b.vivo) continue;
      // patrulla sencilla: camina y se voltea en bordes y paredes
      b.x += b.dir * CFG.VEL_BICHO;
      const colFrente = Math.floor((b.x + (b.dir > 0 ? 30 : -2)) / CFG.TILE);
      const filaPie = Math.floor((b.y + 30) / CFG.TILE);
      if (Math.abs(b.x - b.origen) > CFG.RADIO_PATRULLA ||
          esSolido(nivel, colFrente, filaPie - 1) ||
          !esSolido(nivel, colFrente, filaPie)) {
        b.dir *= -1;
        b.x += b.dir * 2;
      }
      if (chocan(caja, { x: b.x, y: b.y, ancho: 28, alto: 24 })) preguntar(b, false);
    }

    // jefe
    const j = nivel.jefe;
    if (j && j.vivo && chocan(caja, { x: j.x, y: j.y, ancho: 40, alto: 32 })) preguntar(j, true);

    // mástil de la meta: se puede agarrar a cualquier altura
    if (chocan(caja, { x: nivel.meta.x - 2, y: TOPE_MASTIL, ancho: 26, alto: ALTO_MASTIL })) {
      if (est.resueltos >= nivel.totalRetos) iniciarSalida();
      else {
        jug.x = nivel.meta.x - 44; jug.vx = 0;
        avisar(`El mástil está bloqueado: te faltan ${nivel.totalRetos - est.resueltos} bichos 👾`, 150);
      }
    }
  }

  /* ---------------- preguntas ---------------- */
  function preguntar(entidad, esJefe) {
    if (est.pausa || est.salida) return;
    est.pausa = true;
    Audio.golpe();

    const pregunta = esJefe ? entidad.preguntas[entidad.paso] : entidad.pregunta;
    const nombre = esJefe
      ? tema.nombreJefe
      : tema.nombresBichos[entidad.tipo % tema.nombresBichos.length];
    const sprite = esJefe ? tema.jefe : tema.bichos[entidad.tipo % tema.bichos.length];

    // la primera vez que se topa con el jefe, se muestra la viñeta estilo manga
    if (esJefe && !entidad.presentado && eventos.onIntroJefe) {
      entidad.presentado = true;
      eventos.onIntroJefe(
        { nombre, sprite, distrito: nivel.distrito, retos: entidad.preguntas.length },
        () => lanzarPregunta(entidad, esJefe, pregunta, nombre, sprite));
      return;
    }
    lanzarPregunta(entidad, esJefe, pregunta, nombre, sprite);
  }

  function lanzarPregunta(entidad, esJefe, pregunta, nombre, sprite) {
    eventos.onPregunta({
      pregunta, nombre, sprite, esJefe,
      paso: esJefe ? entidad.paso + 1 : 0,
      total: esJefe ? entidad.preguntas.length : 0,
      pistas: est.pistas,
      // gastar un foco descarta dos alternativas equivocadas
      usarPista: () => {
        if (est.pistas <= 0) return false;
        est.pistas--; refrescar();
        return true;
      },
    }, (acerto) => {
      est.intentos++;
      if (acerto) {
        est.aciertos++;
        est.xp += CFG.XP[pregunta.nivel] || 10;
        est.monedas += CFG.MONEDAS_ACIERTO;
        Audio.acierto();

        flotar(entidad.x, entidad.y - 14, `+${CFG.XP[pregunta.nivel] || 10} XP`, "#4ade80");

        if (esJefe) {
          entidad.paso++; entidad.golpes++;
          entidad.sacudida = 18;                      // el jefe se remece con cada acierto
          chispas(entidad.x + 20, entidad.y + 16, "#ffd166", 16);
          if (entidad.paso >= entidad.preguntas.length) {
            entidad.vivo = false; est.resueltos++;
            chispas(entidad.x + 20, entidad.y + 16, "#4ade80", 30);
            derrotados.push({ x: entidad.x, y: entidad.y, sprite, vy: -7, vx: 1.2, giro: 0, vida: 90 });
            avisar(`¡${nombre} derrotado! Corre al mástil 🚩`, 200);
          }
        } else {
          entidad.vivo = false; est.resueltos++;
          chispas(entidad.x + 14, entidad.y + 12, "#4ade80", 18);
          // el bicho sale volando dando vueltas antes de desaparecer
          derrotados.push({
            x: entidad.x, y: entidad.y, sprite,
            vy: -6.2, vx: (jug.x < entidad.x ? 1.6 : -1.6), giro: 0, vida: 70,
          });
        }
      } else {
        Audio.error();
        // el bicho se queda; el jugador retrocede un poco y puede reintentar
        jug.x += jug.izquierda ? 46 : -46;
        jug.vy = -5;
        perderVida(null, false);
      }
      est.pausa = false;
      refrescar();
      // si el jefe sigue vivo, hay que volver a chocarlo para la siguiente pregunta
      jug.invulnerable = Math.max(jug.invulnerable, 40);
    });
  }

  /* ---------------- final del nivel: mástil y vehículo ---------------- */
  const SUELO_META = nivel.meta.y + CFG.TILE * 2;   // altura del piso junto al mástil
  const ALTO_MASTIL = 232;
  const TOPE_MASTIL = SUELO_META - ALTO_MASTIL;

  /**
   * Como en los clásicos: José se agarra del mástil, baja deslizándose con la
   * bandera, se despide y sube al vehículo del distrito (mototaxi, combi o
   * limosina). Mientras más alto agarre el mástil, más monedas de bonus.
   */
  function iniciarSalida() {
    if (est.salida) return;
    const agarre = Math.max(TOPE_MASTIL, Math.min(jug.y, SUELO_META - 40));
    const altura = SUELO_META - agarre;
    const bonus = Math.max(1, Math.round((altura / ALTO_MASTIL) * 20));

    est.salida = { t: 0, y: agarre, bonus, vehiculoX: nivel.meta.x + 520, subio: false };
    est.monedas += bonus;
    jug.x = nivel.meta.x + 2; jug.vx = 0; jug.vy = 0;
    flotar(nivel.meta.x - 10, agarre - 16, `+${bonus} POR LA ALTURA`, "#ffd166");
    Audio.pararMusica();
    Audio.victoria();
    avisar("¡Distrito liberado!", 220);
    refrescar();
  }

  function animarSalida() {
    const s = est.salida;
    s.t++;

    if (s.t < 55) {                         // baja deslizándose por el mástil
      s.y = Math.min(SUELO_META - 30, s.y + 5.2);
      jug.y = s.y;
      if (s.t % 9 === 0) Audio.tono(500 + s.t * 6, 0.06, "square", 0.04);
    } else if (s.t < 78) {                  // salta del mástil hacia la derecha
      if (s.t === 55) { jug.vy = -6.5; jug.izquierda = false; Audio.salto(); }
      jug.vx = 2.2;
      jug.vy = Math.min(jug.vy + CFG.GRAVEDAD, CFG.VEL_MAX_CAIDA);
      colisionar();
    } else if (!s.subio) {                  // el vehículo llega y José se sube
      s.vehiculoX += ((nivel.meta.x + 150) - s.vehiculoX) * 0.08;
      jug.vx = s.t > 100 ? 2.6 : 0;
      jug.vy = Math.min(jug.vy + CFG.GRAVEDAD, CFG.VEL_MAX_CAIDA);
      colisionar();
      if (jug.x > s.vehiculoX - 10) {
        s.subio = true; jug.vx = 0;
        chispas(jug.x + 10, jug.y + 10, "#ffd166", 16);
      }
    } else {                                // arranca rumbo al siguiente distrito
      s.vehiculoX += Math.min((s.t - 110) * 0.3, 8.5);
      jug.x = s.vehiculoX + 6;
    }

    cam += (Math.max(0, Math.min(jug.x - 300, nivel.ancho * CFG.TILE - CFG.ANCHO_VISTA)) - cam) * 0.1;
    if (s.t > 200) terminar();
  }

  /* ---------------- fin ---------------- */
  function terminar() {
    if (est.terminado) return;
    est.terminado = true; est.corriendo = false;
    cancelAnimationFrame(rafId);
    Audio.pararMusica();
    eventos.onFin({
      tiempo: Math.round(est.tiempo),
      monedas: est.monedas, xp: est.xp,
      aciertos: est.aciertos, intentos: est.intentos,
      vidas: est.vidas,
    });
  }

  function refrescar() {
    eventos.onHUD?.({
      vidas: est.vidas, xp: est.xp, monedas: est.monedas,
      tiempo: est.tiempo, resueltos: est.resueltos, total: nivel.totalRetos,
      pistas: est.pistas, turbo: est.turbo, grande: est.grande,
    });
  }

  /* ---------------- dibujo ---------------- */
  function dibujar() {
    reloj++;
    pintarCielo(ctx, nivel.tema);
    tema.fondo(ctx, cam, reloj);

    // --- bloques del mapa ---
    const desde = Math.floor(cam / CFG.TILE), hasta = desde + Math.ceil(CFG.ANCHO_VISTA / CFG.TILE) + 1;
    for (let c = desde; c <= hasta; c++) {
      for (let f = 0; f < nivel.alto; f++) {
        const t = c >= 0 && c < nivel.ancho ? nivel.tiles[f * nivel.ancho + c] : 0;
        if (!t) continue;
        const px = c * CFG.TILE - cam, py = f * CFG.TILE;
        pintarTile(ctx, nivel.tema, t === TILE.SUELO ? "suelo" : t === TILE.TIERRA ? "tierra" : "plataforma", px, py);
      }
    }

    // --- checkpoints y meta ---
    for (const cp of nivel.checkpoints) {
      const px = cp.x - cam; if (px < -60 || px > 860) continue;
      pintar(ctx, "bandera", px + 4, cp.y + 32);
      if (cp.activo) {
        ctx.fillStyle = "rgba(74,222,128,.85)";
        ctx.fillRect(px + 2, cp.y + 26, 26, 5);
      }
    }
    // --- mástil de la meta, con su bandera ---
    const mx = nivel.meta.x - cam;
    if (mx > -120 && mx < 900) {
      const abierto = est.resueltos >= nivel.totalRetos;
      ctx.fillStyle = "#3b3480";                                   // base
      ctx.fillRect(mx + 2, SUELO_META - 16, 24, 16);
      ctx.fillStyle = abierto ? "#eae7ff" : "#5b5580";             // mástil
      ctx.fillRect(mx + 11, TOPE_MASTIL, 6, ALTO_MASTIL - 12);
      ctx.fillStyle = abierto ? "#ffd166" : "#5b5580";             // bola de arriba
      ctx.beginPath(); ctx.arc(mx + 14, TOPE_MASTIL - 2, 7, 0, Math.PI * 2); ctx.fill();

      // la bandera baja junto con José mientras se desliza
      const alturaBandera = est.salida
        ? Math.min(SUELO_META - 42, est.salida.y + 6)
        : TOPE_MASTIL + 14;
      ctx.fillStyle = abierto ? "#ff5470" : "#4a4470";
      ctx.beginPath();
      ctx.moveTo(mx + 11, alturaBandera);
      ctx.lineTo(mx - 26, alturaBandera + 12);
      ctx.lineTo(mx + 11, alturaBandera + 24);
      ctx.closePath(); ctx.fill();
      if (!abierto) {
        ctx.fillStyle = "#12102a";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("🔒", mx + 14, SUELO_META - 4);
        ctx.textAlign = "left";
      }
    }

    // --- monedas y bloques ---
    for (const m of nivel.monedas) {
      if (m.tomada) continue;
      const px = m.x - cam; if (px < -40 || px > 840) continue;
      const gira = Math.floor((reloj + m.fase) / 9) % 4;
      pintar(ctx, gira === 2 ? "moneda_b" : "moneda_a", px, m.y + Math.sin((reloj + m.fase) / 22) * 2);
    }
    for (const b of nivel.bloques) {
      const px = b.x - cam; if (px < -40 || px > 840) continue;
      // el rebote sube y baja en vez de saltar de golpe
      const alto = b.rebote > 0 ? Math.sin((b.rebote / 14) * Math.PI) * 9 : 0;
      pintar(ctx, b.usado ? "bloque_usado" : "bloque", px, b.y - alto);
      if (b.destello > 0) {                       // anillo blanco al golpearlo
        b.destello--;
        const r = (14 - b.destello) * 2.6;
        ctx.strokeStyle = `rgba(255,246,216,${b.destello / 16})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px + 12, b.y + 12, r, 0, Math.PI * 2); ctx.stroke();
      }
    }
    for (const p of nivel.peligros) {
      const px = p.x - cam; if (px < -40 || px > 840) continue;
      pintar(ctx, "pua", px + 4, p.y);
    }

    // --- bichos ---
    for (const b of nivel.bichos) {
      if (!b.vivo) continue;
      const px = b.x - cam; if (px < -60 || px > 860) continue;
      const flota = Math.sin((reloj + b.fase * 9) / 16) * 2;
      pintar(ctx, tema.bichos[b.tipo % tema.bichos.length], px, b.y + flota, b.dir > 0);
      // globito de pregunta
      ctx.fillStyle = "rgba(18,16,42,.85)";
      ctx.fillRect(px + 8, b.y - 16 + flota, 14, 12);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("?", px + 15, b.y - 6 + flota);
      ctx.textAlign = "left";
    }

    // --- bichos derrotados dando vueltas por los aires ---
    for (let i = derrotados.length - 1; i >= 0; i--) {
      const d = derrotados[i];
      d.x += d.vx; d.y += d.vy; d.vy += 0.28; d.giro += 0.22; d.vida--;
      if (d.vida <= 0) { derrotados.splice(i, 1); continue; }
      const m = medida(d.sprite);
      ctx.save();
      ctx.globalAlpha = Math.min(1, d.vida / 25);
      ctx.translate(d.x - cam + m.ancho / 2, d.y + m.alto / 2);
      ctx.rotate(d.giro);
      pintar(ctx, d.sprite, -m.ancho / 2, -m.alto / 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // --- jefe ---
    const j = nivel.jefe;
    if (j && j.vivo) {
      const px = j.x - cam;
      if (px > -90 && px < 890) {
        const flota = Math.sin(reloj / 20) * 3;
        const temblor = j.sacudida > 0 ? (j.sacudida-- % 4 < 2 ? -3 : 3) : 0;
        pintar(ctx, tema.jefe, px + temblor, j.y + flota);
        // barra de vida del jefe
        const total = j.preguntas.length;
        ctx.fillStyle = "rgba(18,16,42,.85)";
        ctx.fillRect(px - 4, j.y - 18 + flota, 48, 8);
        ctx.fillStyle = "#ff5470";
        ctx.fillRect(px - 2, j.y - 16 + flota, 44 * (1 - j.golpes / total), 4);
      }
    }

    // --- premios que salen de los bloques (salen disparados y caen un poco) ---
    for (let i = premios.length - 1; i >= 0; i--) {
      const p = premios[i];
      p.y += p.vy; p.vy += p.gravedad; p.vida--;
      if (p.vida <= 0) { premios.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.vida / 16);
      const sprite = p.gira && Math.floor(p.vida / 5) % 3 === 1 ? "moneda_b" : p.sprite;
      pintar(ctx, sprite, p.x - cam, p.y);
      ctx.globalAlpha = 1;
    }

    // --- el vehículo que se lo lleva (según el distrito) ---
    if (est.salida && est.salida.t > 60) {
      const vx = est.salida.vehiculoX - cam;
      const brinca = est.salida.subio ? Math.abs(Math.sin(est.salida.t / 3)) * 2 : 0;
      const alto = medida(nivel.vehiculo).alto;
      pintar(ctx, nivel.vehiculo, vx, SUELO_META - alto + brinca, true);
      if (est.salida.subio && reloj % 8 < 4) {              // humito del tubo de escape
        ctx.fillStyle = "rgba(200,210,230,.5)";
        ctx.beginPath(); ctx.arc(vx + 54, SUELO_META - 8, 5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // --- jugador ---
    const escondido = est.salida && est.salida.subio;
    if (!escondido && !(jug.invulnerable > 0 && Math.floor(reloj / 4) % 2)) {
      let sprite = "jose_quieto";
      if (!jug.enSuelo) sprite = "jose_salta";
      else if (Math.abs(jug.vx) > 0.3) sprite = Math.floor(jug.paso) % 2 ? "jose_paso_a" : "jose_paso_b";
      const escala = est.grande ? 1.35 : 1;
      const m = medida(sprite);
      const ancho = m.ancho * escala, alto = m.alto * escala;
      if (est.grande) {   // aura dorada mientras dura la estrella
        ctx.fillStyle = `rgba(255,209,102,${0.16 + Math.sin(reloj / 9) * 0.06})`;
        ctx.beginPath();
        ctx.arc(jug.x - cam + 10, jug.y + 15, 26, 0, Math.PI * 2);
        ctx.fill();
      }
      pintar(ctx, sprite, jug.x - cam - (ancho - CFG.ANCHO_JUGADOR) / 2,
             jug.y + CFG.ALTO_JUGADOR - alto, jug.izquierda, escala);
    }

    // --- textos flotantes ---
    ctx.textAlign = "center";
    for (let i = textos.length - 1; i >= 0; i--) {
      const t = textos[i];
      t.y -= 0.55; t.vida--;
      if (t.vida <= 0) { textos.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, t.vida / 22);
      ctx.font = "bold 13px ui-monospace, monospace";
      ctx.fillStyle = "rgba(18,16,42,.85)";
      ctx.fillText(t.texto, t.x - cam + 13, t.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.texto, t.x - cam + 12, t.y);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";

    // --- partículas ---
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.14; p.vida--;
      if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cam, p.y, 4, 4);
    }

    // --- clima encima de todo ---
    tema.clima(ctx, reloj);
  }

  /* ---------------- bucle ---------------- */
  function paso(ahora) {
    rafId = requestAnimationFrame(paso);
    if (!est.corriendo) return;
    if (!est.pausa) {
      if (est.salida) {
        animarSalida();
      } else {
        mover();
        revisarObjetos();
        // cámara suave, siempre un poco adelante del jugador
        const objetivo = Math.max(0, Math.min(jug.x - 300, nivel.ancho * CFG.TILE - CFG.ANCHO_VISTA));
        cam += (objetivo - cam) * 0.12;
        // reloj de juego
        if (ultimo) est.tiempo += Math.min((ahora - ultimo) / 1000, 0.1);
        if (reloj % 30 === 0) refrescar();
      }
      ultimo = ahora;
    } else {
      ultimo = ahora;   // el tiempo no corre mientras se responde
    }
    dibujar();
  }

  /* ---------------- API pública ---------------- */
  return {
    estado: est,
    jugador: jug,      // expuesto para poder inspeccionarlo en las pruebas
    get camara() { return cam; },
    teclas,
    iniciar() {
      est.corriendo = true; ultimo = 0;
      refrescar();
      Audio.musica(nivel.musica);
      rafId = requestAnimationFrame(paso);
    },
    detener() {
      est.corriendo = false;
      cancelAnimationFrame(rafId);
      Audio.pararMusica();
    },
  };
}
