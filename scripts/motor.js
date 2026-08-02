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
    reaparicion: { ...nivel.inicio },
  };

  const jug = {
    x: nivel.inicio.x, y: nivel.inicio.y, vx: 0, vy: 0,
    enSuelo: false, izquierda: false, paso: 0,
    coyote: 0, buffer: 0, invulnerable: 0, saltando: false,
  };

  const teclas = { izquierda: false, derecha: false, saltar: false, correr: false };
  const particulas = [];
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

  /* ---------------- física ---------------- */
  function mover() {
    const objetivo = teclas.correr ? CFG.VEL_CORRE : CFG.VEL_CAMINA;
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

    // --- colisión horizontal ---
    jug.x += jug.vx;
    let c0 = Math.floor(jug.x / CFG.TILE), c1 = Math.floor((jug.x + CFG.ANCHO_JUGADOR - 1) / CFG.TILE);
    let f0 = Math.floor(jug.y / CFG.TILE), f1 = Math.floor((jug.y + CFG.ALTO_JUGADOR - 1) / CFG.TILE);
    for (let f = f0; f <= f1; f++) {
      if (jug.vx > 0 && esSolido(nivel, c1, f)) { jug.x = c1 * CFG.TILE - CFG.ANCHO_JUGADOR; jug.vx = 0; }
      else if (jug.vx < 0 && esSolido(nivel, c0, f)) { jug.x = (c0 + 1) * CFG.TILE; jug.vx = 0; }
    }

    // --- colisión vertical ---
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

    jug.paso = (jug.enSuelo && Math.abs(jug.vx) > 0.3) ? jug.paso + Math.abs(jug.vx) * 0.28 : 0;
    if (jug.invulnerable > 0) jug.invulnerable--;
  }

  /* ---------------- daño y reaparición ---------------- */
  function perderVida(motivo, reaparecer = true) {
    if (jug.invulnerable > 0 && reaparecer) return;
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

    // bloques sorpresa: se golpean desde abajo
    for (const b of nivel.bloques) {
      if (b.rebote > 0) b.rebote--;
      if (b.usado) continue;
      if (chocan(caja, { x: b.x, y: b.y, ancho: 24, alto: 24 }) && jug.vy < 0) {
        b.usado = true; b.rebote = 10;
        est.monedas += CFG.MONEDAS_BLOQUE;
        Audio.bloque(); chispas(b.x + 12, b.y, "#ffd166", 12);
        avisar(`+${CFG.MONEDAS_BLOQUE} monedas 🪙`, 80);
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

    // meta
    if (chocan(caja, { x: nivel.meta.x, y: nivel.meta.y, ancho: CFG.TILE, alto: CFG.TILE * 2 })) {
      if (est.resueltos >= nivel.totalRetos) terminar();
      else {
        jug.x = nivel.meta.x - 40; jug.vx = 0;
        avisar(`La meta está cerrada: te faltan ${nivel.totalRetos - est.resueltos} bichos 👾`, 150);
      }
    }
  }

  /* ---------------- preguntas ---------------- */
  function preguntar(entidad, esJefe) {
    if (est.pausa) return;
    est.pausa = true;
    Audio.golpe();

    const pregunta = esJefe ? entidad.preguntas[entidad.paso] : entidad.pregunta;
    const nombre = esJefe
      ? tema.nombreJefe
      : tema.nombresBichos[entidad.tipo % tema.nombresBichos.length];
    const sprite = esJefe ? tema.jefe : tema.bichos[entidad.tipo % tema.bichos.length];

    eventos.onPregunta({
      pregunta, nombre, sprite, esJefe,
      paso: esJefe ? entidad.paso + 1 : 0,
      total: esJefe ? entidad.preguntas.length : 0,
    }, (acerto) => {
      est.intentos++;
      if (acerto) {
        est.aciertos++;
        est.xp += CFG.XP[pregunta.nivel] || 10;
        est.monedas += CFG.MONEDAS_ACIERTO;
        Audio.acierto();

        if (esJefe) {
          entidad.paso++; entidad.golpes++;
          chispas(entidad.x + 20, entidad.y + 16, "#ffd166", 14);
          if (entidad.paso >= entidad.preguntas.length) {
            entidad.vivo = false; est.resueltos++;
            chispas(entidad.x + 20, entidad.y + 16, "#4ade80", 26);
            avisar(`¡${nombre} derrotado! La meta se abrió 🚩`, 200);
          }
        } else {
          entidad.vivo = false; est.resueltos++;
          chispas(entidad.x + 14, entidad.y + 12, "#4ade80", 16);
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

  /* ---------------- fin ---------------- */
  function terminar() {
    if (est.terminado) return;
    est.terminado = true; est.corriendo = false;
    cancelAnimationFrame(rafId);
    Audio.victoria(); Audio.pararMusica();
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
    const mx = nivel.meta.x - cam;
    if (mx > -80 && mx < 880) {
      const abierta = est.resueltos >= nivel.totalRetos;
      pintar(ctx, "meta", mx, nivel.meta.y);
      ctx.fillStyle = abierta ? "#4ade80" : "#5b5580";
      ctx.fillRect(mx + 6, nivel.meta.y + 34, 20, 30);
      ctx.fillStyle = "#12102a";
      ctx.font = "bold 9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(abierta ? "META" : "CERR", mx + 16, nivel.meta.y + 52);
      ctx.textAlign = "left";
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
      pintar(ctx, b.usado ? "bloque_usado" : "bloque", px, b.y - (b.rebote > 0 ? 6 : 0));
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

    // --- jefe ---
    const j = nivel.jefe;
    if (j && j.vivo) {
      const px = j.x - cam;
      if (px > -90 && px < 890) {
        const flota = Math.sin(reloj / 20) * 3;
        pintar(ctx, tema.jefe, px, j.y + flota);
        // barra de vida del jefe
        const total = j.preguntas.length;
        ctx.fillStyle = "rgba(18,16,42,.85)";
        ctx.fillRect(px - 4, j.y - 18 + flota, 48, 8);
        ctx.fillStyle = "#ff5470";
        ctx.fillRect(px - 2, j.y - 16 + flota, 44 * (1 - j.golpes / total), 4);
      }
    }

    // --- jugador ---
    if (!(jug.invulnerable > 0 && Math.floor(reloj / 4) % 2)) {
      let sprite = "jose_quieto";
      if (!jug.enSuelo) sprite = "jose_salta";
      else if (Math.abs(jug.vx) > 0.3) sprite = Math.floor(jug.paso) % 2 ? "jose_paso_a" : "jose_paso_b";
      const m = medida(sprite);
      pintar(ctx, sprite, jug.x - cam - (m.ancho - CFG.ANCHO_JUGADOR) / 2, jug.y, jug.izquierda);
    }

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
      mover();
      revisarObjetos();
      // cámara suave, siempre un poco adelante del jugador
      const objetivo = Math.max(0, Math.min(jug.x - 300, nivel.ancho * CFG.TILE - CFG.ANCHO_VISTA));
      cam += (objetivo - cam) * 0.12;
      // reloj de juego
      if (ultimo) est.tiempo += Math.min((ahora - ultimo) / 1000, 0.1);
      ultimo = ahora;
      if (reloj % 30 === 0) refrescar();
    } else {
      ultimo = ahora;   // el tiempo no corre mientras se responde
    }
    dibujar();
  }

  /* ---------------- API pública ---------------- */
  return {
    estado: est,
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
