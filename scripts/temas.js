/**
 * temas.js — la identidad visual de cada distrito.
 *
 * Un tema decide TODO lo que hace que un distrito se sienta distinto:
 * cielo, arquitectura de fondo, vegetación, clima, colores del suelo,
 * qué bichos aparecen y cómo se llaman.
 *
 * Para crear un distrito nuevo: agrega una entrada acá y apunta a ella
 * desde el JSON del nivel con "tema": "nombreDelTema".
 */
import { CFG } from "./config.js";

const T = CFG.TILE;

/* Utilidad: repite un elemento de fondo a lo largo del nivel con parallax. */
function repetir(ctx, cam, paso, factor, dibujo) {
  const desfase = (cam * factor) % paso;
  for (let i = -1; i < Math.ceil(CFG.ANCHO_VISTA / paso) + 2; i++) {
    dibujo(i * paso - desfase, i);
  }
}

export const TEMAS = {
  /* =========================================================
     CALLAO — puerto al amanecer, garúa fina, grúas y contenedores
     ========================================================= */
  puerto: {
    nombre: "Puerto",
    cielo: [[0, "#1b2b52"], [0.45, "#3f5f8f"], [0.75, "#c98a5e"], [1, "#f2c078"]],
    suelo: { cara: "#5d6b78", borde: "#8fa3b0", tierra: "#3b4650", plataforma: "#c96a3c", plataformaBorde: "#e89a63" },
    acento: "#38bdf8",
    bichos: ["gaviota", "ancla", "contenedor"],
    nombresBichos: ["Gaviota Regatona", "Ancla Terca", "Contenedor Colado"],
    jefe: "pulpo",
    nombreJefe: "El Pulpo Sumador",

    fondo(ctx, cam, t) {
      // mar al fondo
      ctx.fillStyle = "#20406b";
      ctx.fillRect(0, 300, CFG.ANCHO_VISTA, 84);
      for (let i = 0; i < 26; i++) {
        const x = (i * 63 - (cam * 0.12) % 63 + 800) % 860 - 30;
        const y = 312 + ((i * 17) % 60);
        ctx.fillStyle = "rgba(255,255,255,.18)";
        ctx.fillRect(x, y, 16, 2);
      }
      // barcos lejanos
      repetir(ctx, cam, 420, 0.18, (x) => {
        ctx.fillStyle = "#16233d";
        ctx.fillRect(x + 40, 292, 78, 14);
        ctx.fillRect(x + 62, 274, 10, 18);
        ctx.fillRect(x + 82, 280, 6, 12);
      });
      // grúas del puerto
      repetir(ctx, cam, 260, 0.42, (x) => {
        ctx.fillStyle = "#243b56";
        ctx.fillRect(x + 30, 232, 9, 152);
        ctx.fillRect(x + 30, 226, 104, 8);
        ctx.fillRect(x + 124, 234, 6, 30);
        ctx.fillStyle = "#ff9f45";
        ctx.fillRect(x + 26, 220, 17, 8);
      });
      // faro (queda al fondo, sobre la línea del horizonte)
      repetir(ctx, cam, 900, 0.3, (x) => {
        ctx.fillStyle = "#f2f6ff"; ctx.fillRect(x + 700, 244, 16, 92);
        ctx.fillStyle = "#ff5470";
        ctx.fillRect(x + 700, 262, 16, 9); ctx.fillRect(x + 700, 286, 16, 9);
        ctx.fillStyle = "#ffd166"; ctx.fillRect(x + 702, 234, 12, 10);
      });
      // pila de contenedores
      repetir(ctx, cam, 190, 0.62, (x, i) => {
        const cols = ["#2f6b8f", "#c14a22", "#3f7d5c", "#8f5da8"];
        for (let k = 0; k < 4; k++) {
          const cx = x + 20 + (k % 2) * 52, cy = 336 - Math.floor(k / 2) * 26;
          ctx.fillStyle = cols[(i + k) % cols.length];
          ctx.fillRect(cx, cy, 48, 24);
          ctx.fillStyle = "rgba(0,0,0,.25)";
          ctx.fillRect(cx, cy + 20, 48, 4);
        }
      });
    },

    clima(ctx, t) {
      // garúa chalaca: líneas finas y diagonales
      ctx.strokeStyle = "rgba(200,225,255,.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 70; i++) {
        const x = (i * 137 + t * 2.2) % 860 - 30;
        const y = (i * 71 + t * 6.5) % 500;
        ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 9);
      }
      ctx.stroke();
      // banda de neblina
      ctx.fillStyle = "rgba(226,236,255,.10)";
      ctx.fillRect(0, 250 + Math.sin(t / 90) * 6, CFG.ANCHO_VISTA, 60);
    },
  },

  /* =========================================================
     SAN MIGUEL — parque frente al mar, sol, cometas y áreas verdes
     ========================================================= */
  parque: {
    nombre: "Parque",
    cielo: [[0, "#2f8fd6"], [0.5, "#6cc4ec"], [0.82, "#bfe8f7"], [1, "#e8f6c9"]],
    suelo: { cara: "#8a6a48", borde: "#5ec46a", tierra: "#5f452e", plataforma: "#9aa7c7", plataformaBorde: "#d8e2ff" },
    acento: "#4ade80",
    bichos: ["paloma", "cometa", "cono"],
    nombresBichos: ["Paloma Presumida", "Cometa Enredada", "Cono Mandón"],
    jefe: "combi",
    nombreJefe: "La Combi Indecisa",

    fondo(ctx, cam, t) {
      // sol
      ctx.fillStyle = "rgba(255,231,150,.95)";
      ctx.beginPath(); ctx.arc(690, 92, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,231,150,.18)";
      ctx.beginPath(); ctx.arc(690, 92, 54, 0, Math.PI * 2); ctx.fill();
      // mar al fondo
      ctx.fillStyle = "#2f8fd6";
      ctx.fillRect(0, 296, CFG.ANCHO_VISTA, 30);
      // cometas en el cielo
      repetir(ctx, cam, 340, 0.15, (x, i) => {
        const cy = 70 + ((i * 53) % 90) + Math.sin(t / 40 + i) * 8;
        const cx = x + 120;
        ctx.fillStyle = ["#ff5470", "#ffd166", "#4ade80"][i % 3];
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10); ctx.lineTo(cx + 10, cy); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx - 10, cy);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.quadraticCurveTo(cx - 14, cy + 34, cx + 4, cy + 52); ctx.stroke();
      });
      // edificios del malecón
      repetir(ctx, cam, 200, 0.45, (x, i) => {
        const alto = 90 + ((i * 37) % 60);
        ctx.fillStyle = ["#e8e2d2", "#f4d9c0", "#dce6ef"][i % 3];
        ctx.fillRect(x + 24, 326 - alto, 96, alto);
        ctx.fillStyle = "rgba(90,110,130,.55)";
        for (let fy = 326 - alto + 12; fy < 316; fy += 20)
          for (let fx = x + 34; fx < x + 112; fx += 20) ctx.fillRect(fx, fy, 10, 12);
        ctx.fillStyle = "#c9553f";
        ctx.fillRect(x + 20, 326 - alto - 8, 104, 8);
      });
      // arboleda del parque
      repetir(ctx, cam, 150, 0.68, (x, i) => {
        const bx = x + 40, by = 350 - (i % 2) * 8;
        ctx.fillStyle = "#6b4a2c"; ctx.fillRect(bx + 12, by, 8, 34);
        ctx.fillStyle = i % 2 ? "#3f9d55" : "#4fbb63";
        ctx.beginPath(); ctx.arc(bx + 16, by - 6, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.15)";
        ctx.beginPath(); ctx.arc(bx + 9, by - 13, 9, 0, Math.PI * 2); ctx.fill();
      });
    },

    clima(ctx, t) {
      // hojitas y destellos que cruzan la pantalla
      for (let i = 0; i < 22; i++) {
        const x = (i * 191 - t * 1.4) % 860 - 30;
        const y = 60 + ((i * 83) % 300) + Math.sin(t / 30 + i) * 14;
        ctx.fillStyle = i % 3 ? "rgba(120,220,140,.55)" : "rgba(255,240,170,.65)";
        ctx.fillRect(x, y, 5, 4);
      }
    },
  },
};

/** Pinta el cielo del tema (degradado vertical). */
export function pintarCielo(ctx, tema) {
  const g = ctx.createLinearGradient(0, 0, 0, CFG.ALTO_VISTA);
  (TEMAS[tema] || TEMAS.puerto).cielo.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CFG.ANCHO_VISTA, CFG.ALTO_VISTA);
}

/** Dibuja un bloque de suelo o plataforma con los colores del tema. */
export function pintarTile(ctx, tema, tipo, px, py) {
  const p = (TEMAS[tema] || TEMAS.puerto).suelo;
  if (tipo === "suelo") {
    ctx.fillStyle = p.cara; ctx.fillRect(px, py, T, T);
    ctx.fillStyle = p.borde; ctx.fillRect(px, py, T, 6);
    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.fillRect(px + 4, py + 12, 8, 5); ctx.fillRect(px + 20, py + 21, 7, 5);
  } else if (tipo === "tierra") {
    ctx.fillStyle = p.tierra; ctx.fillRect(px, py, T, T);
    ctx.fillStyle = "rgba(0,0,0,.14)";
    ctx.fillRect(px + 6, py + 7, 6, 5); ctx.fillRect(px + 19, py + 18, 6, 5);
  } else { // plataforma
    ctx.fillStyle = p.plataforma; ctx.fillRect(px, py, T, T);
    ctx.fillStyle = p.plataformaBorde; ctx.fillRect(px, py, T, 5);
    ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(px, py + T - 4, T, 4);
  }
}
