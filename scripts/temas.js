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

  /* =========================================================
     PUEBLO LIBRE — plaza colonial al mediodía, casonas y palmeras
     ========================================================= */
  plaza: {
    nombre: "Plaza",
    cielo: [[0, "#5fb2e8"], [0.55, "#9ad6f2"], [0.85, "#ffe9c2"], [1, "#f7d9a0"]],
    suelo: { cara: "#c9a877", borde: "#e8cfa0", tierra: "#8f7448", plataforma: "#b8543f", plataformaBorde: "#e08f74" },
    acento: "#ff9f45",
    bichos: ["cuy", "farol", "paloma"],
    nombresBichos: ["Cuy Regateador", "Farol Apagado", "Paloma de la Plaza"],
    jefe: "torito",
    nombreJefe: "El Torito de Pucará",

    fondo(ctx, cam, t) {
      // sol de mediodía bien alto
      ctx.fillStyle = "rgba(255,244,200,.95)";
      ctx.beginPath(); ctx.arc(120, 62, 30, 0, Math.PI * 2); ctx.fill();
      // cerros secos al fondo
      for (let i = 0; i < 10; i++) {
        const hx = i * 300 - (cam * 0.2) % 3000;
        ctx.fillStyle = "#c2a882";
        ctx.beginPath();
        ctx.moveTo(hx, 330); ctx.lineTo(hx + 130, 214); ctx.lineTo(hx + 260, 330);
        ctx.closePath(); ctx.fill();
      }
      // casonas coloniales con balcones y teja
      repetir(ctx, cam, 210, 0.45, (x, i) => {
        const alto = 110 + ((i * 41) % 46);
        const cuerpo = ["#f4e7d2", "#f2d6b8", "#e8dcc0"][i % 3];
        ctx.fillStyle = cuerpo;
        ctx.fillRect(x + 20, 330 - alto, 118, alto);
        ctx.fillStyle = "#a8452c";                       // techo de teja
        ctx.fillRect(x + 12, 330 - alto - 12, 134, 12);
        ctx.fillStyle = "#7a5c3a";                       // balcón de madera
        ctx.fillRect(x + 36, 330 - alto + 30, 86, 26);
        ctx.fillStyle = "#3d2c1a";
        for (let bx = x + 40; bx < x + 118; bx += 10) ctx.fillRect(bx, 330 - alto + 34, 4, 18);
        ctx.fillStyle = "#5b7d99";                       // portón
        ctx.fillRect(x + 62, 330 - 42, 34, 42);
      });
      // palmeras de la plaza
      repetir(ctx, cam, 160, 0.66, (x, i) => {
        const px = x + 50, py = 352 - (i % 2) * 6;
        ctx.fillStyle = "#8a6a3f";
        ctx.fillRect(px + 8, py - 46, 7, 46);
        ctx.fillStyle = i % 2 ? "#3f9d55" : "#4fbb63";
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.ellipse(px + 11 + k * 13, py - 50, 15, 6, k * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      // banderitas de fiesta cruzando la plaza
      repetir(ctx, cam, 240, 0.55, (x) => {
        ctx.strokeStyle = "rgba(60,40,20,.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 150); ctx.quadraticCurveTo(x + 120, 178, x + 240, 150); ctx.stroke();
        for (let k = 1; k < 8; k++) {
          const bx = x + k * 30, by = 150 + Math.sin((k / 8) * Math.PI) * 26;
          ctx.fillStyle = ["#ff5470", "#ffd166", "#4ade80", "#38bdf8"][k % 4];
          ctx.beginPath();
          ctx.moveTo(bx, by); ctx.lineTo(bx + 9, by); ctx.lineTo(bx + 4, by + 12);
          ctx.closePath(); ctx.fill();
        }
      });
    },

    clima(ctx, t) {
      // polvillo dorado flotando en el aire caliente
      for (let i = 0; i < 26; i++) {
        const x = (i * 173 + t * 0.6) % 860 - 30;
        const y = 90 + ((i * 97) % 280) + Math.sin(t / 40 + i) * 10;
        ctx.fillStyle = "rgba(255,226,160,.55)";
        ctx.fillRect(x, y, 3, 3);
      }
    },
  },

  /* =========================================================
     JESÚS MARÍA — Campo de Marte por la tarde: jacarandás en flor,
     las torres de la Residencial San Felipe y jardines geométricos
     ========================================================= */
  campo: {
    nombre: "Campo",
    cielo: [[0, "#3d5a9e"], [0.42, "#7f8fd0"], [0.78, "#e2a6c8"], [1, "#ffd9b0"]],
    suelo: { cara: "#6f8f4a", borde: "#9ed46b", tierra: "#4a5b30", plataforma: "#8f7bbd", plataformaBorde: "#c9b6ef" },
    acento: "#c084fc",
    bichos: ["flor", "banca", "ardilla"],
    nombresBichos: ["La Flor Paradita", "La Banca Echada", "La Ardilla Curvilínea"],
    jefe: "monumento",
    nombreJefe: "El Monumento Inamovible",

    fondo(ctx, cam, t) {
      // sol bajo de la tarde
      ctx.fillStyle = "rgba(255,214,170,.95)";
      ctx.beginPath(); ctx.arc(610, 150, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,196,150,.16)";
      ctx.beginPath(); ctx.arc(610, 150, 66, 0, Math.PI * 2); ctx.fill();

      // torres de la Residencial San Felipe: bloques altos y parejos
      repetir(ctx, cam, 260, 0.32, (x, i) => {
        const alto = 150 + ((i * 53) % 70);
        ctx.fillStyle = ["#b9b0a4", "#a8a396", "#c6bcae"][i % 3];
        ctx.fillRect(x + 30, 330 - alto, 78, alto);
        // ventanas en rejilla, algunas ya encendidas
        for (let fy = 330 - alto + 14; fy < 318; fy += 18) {
          for (let fx = x + 38; fx < x + 102; fx += 16) {
            const encendida = ((fx + fy + i * 7) % 5) === 0;
            ctx.fillStyle = encendida ? "rgba(255,214,140,.9)" : "rgba(70,80,96,.6)";
            ctx.fillRect(fx, fy, 9, 11);
          }
        }
      });

      // jacarandás en flor: copa morada y tronco delgado
      repetir(ctx, cam, 145, 0.66, (x, i) => {
        const bx = x + 36, by = 352 - (i % 2) * 10;
        ctx.fillStyle = "#5b4630"; ctx.fillRect(bx + 13, by - 34, 6, 34);
        ctx.fillStyle = i % 2 ? "#8b5cf6" : "#a678f0";
        ctx.beginPath(); ctx.arc(bx + 16, by - 42, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + 3, by - 34, 13, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + 29, by - 34, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.16)";
        ctx.beginPath(); ctx.arc(bx + 9, by - 50, 8, 0, Math.PI * 2); ctx.fill();
      });

      // jardines geométricos del parque, en franjas horizontales
      repetir(ctx, cam, 96, 0.82, (x, i) => {
        ctx.fillStyle = ["#e05f8f", "#ffd166", "#f2f6ff"][i % 3];
        for (let k = 0; k < 4; k++) ctx.fillRect(x + 10 + k * 18, 362 - (i % 2) * 4, 9, 5);
        ctx.fillStyle = "#4c6b33";
        ctx.fillRect(x + 6, 368 - (i % 2) * 4, 82, 4);
      });
    },

    clima(ctx, t) {
      // pétalos de jacarandá cayendo en diagonal
      for (let i = 0; i < 24; i++) {
        const x = (i * 167 - t * 0.9) % 860 - 30;
        const y = (50 + i * 89 + t * 0.7) % 380;
        ctx.fillStyle = i % 4 ? "rgba(168,120,240,.6)" : "rgba(255,214,180,.65)";
        ctx.fillRect(x, y, 4, 6);
      }
    },
  },

  /* =========================================================
     LINCE — feria de noche: carpa de circo, rueda de la fortuna,
     guirnaldas de focos y confeti en el aire
     ========================================================= */
  feria: {
    nombre: "Feria",
    cielo: [[0, "#140d2e"], [0.45, "#2b1b58"], [0.8, "#5b2a72"], [1, "#a3486b"]],
    suelo: { cara: "#7a4a8f", borde: "#c98adf", tierra: "#3f2455", plataforma: "#e0b23c", plataformaBorde: "#ffe28a" },
    acento: "#ffd166",
    bichos: ["globo", "diana", "algodon"],
    nombresBichos: ["El Globo Invertido", "La Diana sin Punto", "El Algodón Volteado"],
    jefe: "payaso",
    nombreJefe: "El Payaso de las Máximas",

    fondo(ctx, cam, t) {
      // luna y estrellas
      ctx.fillStyle = "rgba(255,247,214,.95)";
      ctx.beginPath(); ctx.arc(690, 74, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1b1240";
      ctx.beginPath(); ctx.arc(700, 66, 22, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 40; i++) {
        const x = (i * 197 - (cam * 0.05)) % 900 - 20;
        const y = 20 + ((i * 71) % 200);
        const brillo = 0.35 + 0.45 * Math.abs(Math.sin(t / 30 + i));
        ctx.fillStyle = `rgba(255,255,255,${brillo.toFixed(2)})`;
        ctx.fillRect(x, y, 2, 2);
      }

      // rueda de la fortuna al fondo
      repetir(ctx, cam, 520, 0.22, (x) => {
        const cx = x + 150, cy = 208, r = 72;
        ctx.strokeStyle = "rgba(255,209,102,.75)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + t / 120;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
          ctx.fillStyle = ["#ff5470", "#ffd166", "#4ade80", "#38bdf8"][k % 4];
          ctx.fillRect(cx + Math.cos(a) * r - 5, cy + Math.sin(a) * r - 5, 10, 10);
        }
        ctx.strokeStyle = "rgba(200,160,90,.6)";
        ctx.beginPath(); ctx.moveTo(cx - 26, 330); ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 26, 330); ctx.stroke();
      });

      // carpas de circo a rayas
      repetir(ctx, cam, 230, 0.48, (x, i) => {
        const bx = x + 30, base = 330, alto = 96 + ((i * 29) % 26);
        ctx.fillStyle = i % 2 ? "#d94f6b" : "#e0396b";
        ctx.beginPath();
        ctx.moveTo(bx + 62, base - alto - 26);
        ctx.lineTo(bx + 124, base); ctx.lineTo(bx, base);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,245,225,.85)";
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(bx + 62, base - alto - 26);
          ctx.lineTo(bx + 20 + k * 34, base); ctx.lineTo(bx + 32 + k * 34, base);
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = "#ffd166";
        ctx.beginPath(); ctx.arc(bx + 62, base - alto - 30, 5, 0, Math.PI * 2); ctx.fill();
      });

      // guirnaldas de focos cruzando la feria
      repetir(ctx, cam, 250, 0.7, (x) => {
        ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 172); ctx.quadraticCurveTo(x + 125, 214, x + 250, 172); ctx.stroke();
        for (let k = 1; k < 9; k++) {
          const p = k / 9;
          const fx = x + 250 * p;
          const fy = 172 + Math.sin(p * Math.PI) * 40;
          const on = ((k + Math.floor(t / 18)) % 3) !== 0;
          ctx.fillStyle = on ? ["#ffd166", "#ff8fab", "#8ef2c0"][k % 3] : "rgba(120,110,150,.5)";
          ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI * 2); ctx.fill();
        }
      });
    },

    clima(ctx, t) {
      // confeti cayendo y girando
      for (let i = 0; i < 30; i++) {
        const x = (i * 149 + Math.sin(t / 40 + i) * 22) % 860 - 20;
        const y = (i * 73 + t * 1.1) % 400;
        ctx.fillStyle = ["rgba(255,209,102,.75)", "rgba(255,143,171,.75)", "rgba(142,242,192,.7)", "rgba(139,180,255,.7)"][i % 4];
        const ancho = 3 + (i % 2) * 2;
        ctx.fillRect(x, y, ancho, 5);
      }
    },
  },

  /* =========================================================
     SAN ISIDRO — el distrito financiero al mediodía: torres de
     vidrio, los olivos del Olivar y garúa fina de Lima
     ========================================================= */
  torres: {
    nombre: "Torres",
    cielo: [[0, "#8fa8c4"], [0.45, "#b6c8db"], [0.8, "#d8e3ec"], [1, "#eef3f7"]],
    suelo: { cara: "#8d99a6", borde: "#5f8f52", tierra: "#5b6470", plataforma: "#3f6f9e", plataformaBorde: "#8fc4ea" },
    acento: "#2f7fc4",
    bichos: ["maletin", "corbata", "cafe"],
    nombresBichos: ["El Maletín Deslizado", "La Corbata Sustituta", "El Café Inferior"],
    jefe: "ejecutivo",
    nombreJefe: "El Ejecutivo de las Expectativas",

    fondo(ctx, cam, t) {
      // sol tapado por la garúa limeña
      ctx.fillStyle = "rgba(255,255,240,.45)";
      ctx.beginPath(); ctx.arc(560, 88, 40, 0, Math.PI * 2); ctx.fill();

      // torres de vidrio, altas y de distinto tono
      repetir(ctx, cam, 190, 0.3, (x, i) => {
        const alto = 170 + ((i * 61) % 90);
        const tono = ["#6f8ba8", "#7e99b4", "#607d9b"][i % 3];
        ctx.fillStyle = tono;
        ctx.fillRect(x + 24, 330 - alto, 92, alto);
        // franjas de vidrio con reflejo
        for (let fy = 330 - alto + 10; fy < 322; fy += 14) {
          ctx.fillStyle = "rgba(200,226,245,.55)";
          ctx.fillRect(x + 30, fy, 80, 7);
        }
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.fillRect(x + 30, 330 - alto, 18, alto);
        // antena
        ctx.fillStyle = "#4a5b6b";
        ctx.fillRect(x + 68, 330 - alto - 18, 3, 18);
      });

      // torres bajas de segunda fila
      repetir(ctx, cam, 120, 0.5, (x, i) => {
        const alto = 70 + ((i * 37) % 40);
        ctx.fillStyle = ["#93a7ba", "#a4b5c5"][i % 2];
        ctx.fillRect(x + 14, 330 - alto, 62, alto);
        ctx.fillStyle = "rgba(70,90,110,.45)";
        for (let fy = 330 - alto + 8; fy < 324; fy += 12)
          for (let fx = x + 20; fx < x + 70; fx += 12) ctx.fillRect(fx, fy, 7, 7);
      });

      // los olivos del Olivar
      repetir(ctx, cam, 132, 0.7, (x, i) => {
        const bx = x + 40, by = 354 - (i % 2) * 8;
        ctx.fillStyle = "#6b5a3f"; ctx.fillRect(bx + 12, by - 30, 7, 30);
        ctx.fillStyle = i % 2 ? "#6f9a5c" : "#7fae6a";
        ctx.beginPath(); ctx.ellipse(bx + 15, by - 38, 22, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.18)";
        ctx.beginPath(); ctx.ellipse(bx + 8, by - 43, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
      });
    },

    clima(ctx, t) {
      // garúa fina: hilitos verticales muy tenues
      for (let i = 0; i < 34; i++) {
        const x = (i * 131 - t * 0.5) % 860 - 20;
        const y = (i * 97 + t * 2.6) % 400;
        ctx.fillStyle = "rgba(226,238,248,.35)";
        ctx.fillRect(x, y, 1, 9);
      }
    },
  },

  /* =========================================================
     MIRAFLORES — el malecón al atardecer: acantilado sobre el
     Pacífico, parapentes en el cielo y el sol metiéndose al mar
     ========================================================= */
  acantilado: {
    nombre: "Acantilado",
    cielo: [[0, "#1f3a6e"], [0.4, "#5a6fae"], [0.72, "#e8896b"], [1, "#ffd39b"]],
    suelo: { cara: "#9a7f5e", borde: "#7fae5c", tierra: "#6b563c", plataforma: "#2f7fc4", plataformaBorde: "#93cdf2" },
    acento: "#ff9f45",
    bichos: ["parapente", "tabla", "cangrejo"],
    nombresBichos: ["El Parapente sin Ajuste", "La Tabla Escasa", "El Cangrejo Legalista"],
    jefe: "gato",
    nombreJefe: "El Gato del Desequilibrio",

    fondo(ctx, cam, t) {
      // sol metiéndose al mar
      ctx.fillStyle = "rgba(255,214,140,.95)";
      ctx.beginPath(); ctx.arc(600, 240, 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,180,120,.20)";
      ctx.beginPath(); ctx.arc(600, 240, 74, 0, Math.PI * 2); ctx.fill();

      // el Pacífico, con el reflejo del sol
      ctx.fillStyle = "#274a80";
      ctx.fillRect(0, 258, CFG.ANCHO_VISTA, 76);
      for (let i = 0; i < 30; i++) {
        const x = (i * 61 - (cam * 0.08)) % 880 - 30;
        const y = 268 + ((i * 23) % 56);
        const cerca = Math.abs(x - 600) < 110;
        ctx.fillStyle = cerca ? "rgba(255,214,150,.45)" : "rgba(255,255,255,.16)";
        ctx.fillRect(x, y, 18, 2);
      }

      // parapentes cruzando el cielo
      repetir(ctx, cam, 300, 0.12, (x, i) => {
        const px = x + 90;
        const py = 80 + ((i * 47) % 70) + Math.sin(t / 50 + i) * 10;
        ctx.fillStyle = ["#e0562f", "#ffd166", "#4ade80"][i % 3];
        ctx.beginPath();
        ctx.moveTo(px - 22, py); ctx.quadraticCurveTo(px, py - 14, px + 22, py);
        ctx.quadraticCurveTo(px, py + 5, px - 22, py);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 14, py + 2); ctx.lineTo(px, py + 18);
        ctx.moveTo(px + 14, py + 2); ctx.lineTo(px, py + 18); ctx.stroke();
        ctx.fillStyle = "#2f3a56";
        ctx.fillRect(px - 3, py + 18, 6, 8);
      });

      // edificios del malecón, en el borde del acantilado
      repetir(ctx, cam, 165, 0.42, (x, i) => {
        const alto = 96 + ((i * 43) % 54);
        ctx.fillStyle = ["#e6ddd0", "#d8cfc2", "#efe6da"][i % 3];
        ctx.fillRect(x + 18, 334 - alto, 74, alto);
        ctx.fillStyle = "rgba(90,110,140,.5)";
        for (let fy = 334 - alto + 10; fy < 328; fy += 15)
          for (let fx = x + 24; fx < x + 86; fx += 14) ctx.fillRect(fx, fy, 8, 9);
        ctx.fillStyle = "rgba(255,200,150,.5)";
        ctx.fillRect(x + 18, 334 - alto, 74, 4);
      });

      // la baranda del malecón y el pasto del borde
      repetir(ctx, cam, 64, 0.72, (x) => {
        ctx.fillStyle = "#5f7a4a";
        ctx.fillRect(x, 356, 64, 8);
        ctx.strokeStyle = "rgba(240,240,235,.55)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, 348); ctx.lineTo(x + 64, 348); ctx.stroke();
        ctx.fillStyle = "rgba(240,240,235,.55)";
        ctx.fillRect(x + 8, 348, 3, 10);
        ctx.fillRect(x + 44, 348, 3, 10);
      });
    },

    clima(ctx, t) {
      // brisa del mar: motitas claras cruzando en horizontal
      for (let i = 0; i < 22; i++) {
        const x = (i * 179 - t * 2.2) % 900 - 30;
        const y = 70 + ((i * 89) % 260) + Math.sin(t / 26 + i) * 6;
        ctx.fillStyle = "rgba(255,236,210,.4)";
        ctx.fillRect(x, y, 9, 1);
      }
    },
  },

  /* =========================================================
     BARRANCO — la bohemia de noche: casonas de colores, murales,
     el Puente de los Suspiros y guirnaldas sobre la bajada
     ========================================================= */
  barranco: {
    nombre: "Barranco",
    cielo: [[0, "#160f33"], [0.4, "#33205c"], [0.75, "#7a3f76"], [1, "#c9705f"]],
    suelo: { cara: "#7b6b8f", borde: "#c9a4d6", tierra: "#3d3350", plataforma: "#e07a3f", plataformaBorde: "#ffbc82" },
    acento: "#ff8fab",
    bichos: ["guitarra", "aerosol", "cajon"],
    nombresBichos: ["La Guitarra Multiplicada", "El Aerosol Individual", "El Cajón Partido"],
    jefe: "bohemio",
    nombreJefe: "El Bohemio de los Suspiros",

    fondo(ctx, cam, t) {
      // luna llena sobre el mar
      ctx.fillStyle = "rgba(255,246,222,.92)";
      ctx.beginPath(); ctx.arc(650, 84, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,230,190,.14)";
      ctx.beginPath(); ctx.arc(650, 84, 52, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 34; i++) {
        const x = (i * 173 - (cam * 0.04)) % 900 - 20;
        const y = 18 + ((i * 67) % 170);
        ctx.fillStyle = `rgba(255,255,255,${(0.3 + 0.4 * Math.abs(Math.sin(t / 34 + i))).toFixed(2)})`;
        ctx.fillRect(x, y, 2, 2);
      }

      // el mar al fondo, con el reflejo de la luna
      ctx.fillStyle = "#1d2b52";
      ctx.fillRect(0, 250, CFG.ANCHO_VISTA, 52);
      for (let i = 0; i < 24; i++) {
        const x = (i * 71 - (cam * 0.07)) % 880 - 30;
        const y = 258 + ((i * 19) % 38);
        ctx.fillStyle = Math.abs(x - 650) < 90 ? "rgba(255,240,200,.4)" : "rgba(255,255,255,.12)";
        ctx.fillRect(x, y, 14, 2);
      }

      // el Puente de los Suspiros, en silueta
      repetir(ctx, cam, 430, 0.26, (x) => {
        const bx = x + 60, base = 302;
        ctx.fillStyle = "#2c2140";
        ctx.fillRect(bx, base - 8, 150, 10);
        // arco
        ctx.beginPath();
        ctx.moveTo(bx + 30, base + 2);
        ctx.quadraticCurveTo(bx + 75, base - 34, bx + 120, base + 2);
        ctx.lineTo(bx + 120, base + 26); ctx.lineTo(bx + 30, base + 26);
        ctx.closePath(); ctx.fill();
        // barandas
        ctx.fillStyle = "#3d2f56";
        for (let k = 0; k < 10; k++) ctx.fillRect(bx + 6 + k * 15, base - 22, 3, 14);
        ctx.fillRect(bx, base - 24, 150, 3);
        // farolitos
        ctx.fillStyle = "rgba(255,209,120,.9)";
        ctx.beginPath(); ctx.arc(bx + 8, base - 30, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + 142, base - 30, 3.5, 0, Math.PI * 2); ctx.fill();
      });

      // casonas de colores con murales
      repetir(ctx, cam, 158, 0.48, (x, i) => {
        const alto = 104 + ((i * 47) % 44);
        const cuerpo = ["#e0568f", "#f0a03c", "#4fb0a8", "#8f6fd0"][i % 4];
        ctx.fillStyle = cuerpo;
        ctx.fillRect(x + 16, 334 - alto, 78, alto);
        // teja
        ctx.fillStyle = "#8f3b2c";
        ctx.fillRect(x + 10, 334 - alto - 9, 90, 9);
        // ventanas encendidas
        ctx.fillStyle = "rgba(255,220,150,.85)";
        for (let fy = 334 - alto + 16; fy < 322; fy += 22)
          for (let fx = x + 24; fx < x + 86; fx += 22) ctx.fillRect(fx, fy, 11, 13);
        // mural en la pared
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.arc(x + 55, 334 - 30, 13, 0, Math.PI * 2); ctx.fill();
      });

      // guirnaldas de foquitos sobre la bajada
      repetir(ctx, cam, 220, 0.72, (x) => {
        ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 190); ctx.quadraticCurveTo(x + 110, 228, x + 220, 190); ctx.stroke();
        for (let k = 1; k < 8; k++) {
          const p = k / 8;
          const fx = x + 220 * p, fy = 190 + Math.sin(p * Math.PI) * 36;
          ctx.fillStyle = ["#ffd166", "#ff8fab", "#8ef2c0", "#9fc4ff"][k % 4];
          ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
        }
      });
    },

    clima(ctx, t) {
      // luciérnagas tibias flotando entre las casonas
      for (let i = 0; i < 20; i++) {
        const x = (i * 157 + Math.sin(t / 50 + i) * 30) % 880 - 20;
        const y = 120 + ((i * 83) % 230) + Math.cos(t / 38 + i) * 12;
        const brillo = 0.25 + 0.5 * Math.abs(Math.sin(t / 22 + i * 1.7));
        ctx.fillStyle = `rgba(255,214,140,${brillo.toFixed(2)})`;
        ctx.fillRect(x, y, 3, 3);
      }
    },
  },

  /* =========================================================
     CHORRILLOS — el muelle de pescadores al amanecer: el Morro
     Solar atrás, los botes amarrados y los pelícanos en fila
     ========================================================= */
  muelle: {
    nombre: "Chorrillos",
    cielo: [[0, "#1d3a5c"], [0.34, "#4a6c96"], [0.7, "#e8a06a"], [1, "#ffd9a0"]],
    suelo: { cara: "#8a6a48", borde: "#c49a68", tierra: "#4a3826", plataforma: "#5b4630", plataformaBorde: "#e0a03c" },
    acento: "#ffb04a",
    bichos: ["bote", "red", "pelicano"],
    nombresBichos: ["El Bote Multiplicado", "La Red sin Tramos", "El Pelícano Madrugador"],
    jefe: "pescador",
    nombreJefe: "El Pescador de los Tramos",

    fondo(ctx, cam, t) {
      // el sol saliendo, todavía bajo y anaranjado
      ctx.fillStyle = "rgba(255,214,140,.16)";
      ctx.beginPath(); ctx.arc(178, 206, 76, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,196,110,.95)";
      ctx.beginPath(); ctx.arc(178, 206, 38, 0, Math.PI * 2); ctx.fill();

      // el Morro Solar en silueta, con la cruz en la cumbre
      repetir(ctx, cam, 620, 0.16, (x) => {
        const bx = x + 380;
        ctx.fillStyle = "#3b4d6b";
        ctx.beginPath();
        ctx.moveTo(bx - 160, 262);
        ctx.lineTo(bx - 44, 148);
        ctx.lineTo(bx + 12, 170);
        ctx.lineTo(bx + 126, 262);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#2c3a52";
        ctx.fillRect(bx - 46, 126, 5, 24);
        ctx.fillRect(bx - 54, 134, 21, 4);
      });

      // el mar, con el camino del sol encima
      ctx.fillStyle = "#2f5b78";
      ctx.fillRect(0, 258, CFG.ANCHO_VISTA, 48);
      for (let i = 0; i < 28; i++) {
        const x = (i * 63 - (cam * 0.08)) % 880 - 30;
        const y = 264 + ((i * 23) % 38);
        ctx.fillStyle = Math.abs(x - 178) < 100 ? "rgba(255,206,140,.5)" : "rgba(255,255,255,.13)";
        ctx.fillRect(x, y, 13, 2);
      }

      // botes amarrados, meciéndose con el oleaje
      repetir(ctx, cam, 196, 0.4, (x, i) => {
        const bx = x + 28, mece = Math.sin(t / 26 + i) * 2.5;
        ctx.fillStyle = "#5b4630";
        ctx.fillRect(bx + 20, 246 + mece, 3, 26);
        ctx.fillStyle = "rgba(255,250,240,.9)";
        ctx.beginPath();
        ctx.moveTo(bx + 23, 246 + mece);
        ctx.lineTo(bx + 44, 262 + mece);
        ctx.lineTo(bx + 23, 268 + mece);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = ["#c9553f", "#e0a03c", "#4f8fa8", "#d8d2c4"][i % 4];
        ctx.beginPath();
        ctx.moveTo(bx, 270 + mece);
        ctx.lineTo(bx + 54, 270 + mece);
        ctx.lineTo(bx + 44, 282 + mece);
        ctx.lineTo(bx + 10, 282 + mece);
        ctx.closePath(); ctx.fill();
      });

      // el muelle de madera, adelante, con las cajas de pescado apiladas encima
      repetir(ctx, cam, 132, 0.66, (x) => {
        ctx.fillStyle = "#6b5236";
        ctx.fillRect(x + 12, 336, 108, 7);
        ctx.fillStyle = "#5a4229";
        for (let k = 0; k < 4; k++) ctx.fillRect(x + 20 + k * 30, 343, 6, 41);
        ctx.fillStyle = "#a8b8c4"; ctx.fillRect(x + 70, 320, 24, 16);
        ctx.fillStyle = "#8a9aa8"; ctx.fillRect(x + 75, 306, 20, 14);
      });

      // pelícanos cruzando en fila, esperando su turno
      repetir(ctx, cam, 340, 0.9, (x, i) => {
        const y = 94 + ((i * 37) % 46) + Math.sin(t / 30 + i) * 5;
        ctx.strokeStyle = "rgba(40,52,70,.55)"; ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const px = x + k * 28, py = y + k * 9;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + 7, py - 6, px + 14, py);
          ctx.stroke();
        }
      });
    },

    clima(ctx, t) {
      // salpicadura salada: la reventazón levanta gotitas contra el muelle
      for (let i = 0; i < 22; i++) {
        const ciclo = (t / 2 + i * 17) % 120;
        const x = (i * 137) % 880 - 20;
        const y = 300 - ciclo * 0.9;
        const alfa = Math.max(0, 0.42 - ciclo / 290);
        ctx.fillStyle = `rgba(226,240,250,${alfa.toFixed(2)})`;
        ctx.fillRect(x, y, 2, 3);
      }
    },
  },

  /* =========================================================
     VILLA EL SALVADOR — mediodía en los arenales: las dunas del
     Lomo de Corvina, las torres de alta tensión y los talleres
     del parque industrial con sus techos de calamina
     ========================================================= */
  arenal: {
    nombre: "Villa El Salvador",
    cielo: [[0, "#4a8fc4"], [0.42, "#8fc0dd"], [0.78, "#e8d3a8"], [1, "#f0dcb4"]],
    suelo: { cara: "#c9a86a", borde: "#e8d09a", tierra: "#8a6f42", plataforma: "#5f5348", plataformaBorde: "#e8823c" },
    acento: "#e8823c",
    bichos: ["carretilla", "ladrillo", "casco"],
    nombresBichos: ["La Carretilla Amontonada", "El Ladrillo de un Solo Tramo", "El Casco sin Comprobar"],
    jefe: "capataz",
    nombreJefe: "El Capataz de los Dos Frentes",

    fondo(ctx, cam, t) {
      // el sol del mediodía, blanco y sin piedad
      ctx.fillStyle = "rgba(255,250,225,.20)";
      ctx.beginPath(); ctx.arc(600, 66, 62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,252,238,.95)";
      ctx.beginPath(); ctx.arc(600, 66, 30, 0, Math.PI * 2); ctx.fill();

      // las dunas del fondo, una detrás de otra
      repetir(ctx, cam, 520, 0.14, (x) => {
        ctx.fillStyle = "#c2a173";
        ctx.beginPath();
        ctx.moveTo(x - 60, 300);
        ctx.quadraticCurveTo(x + 130, 176, x + 330, 300);
        ctx.closePath(); ctx.fill();
      });
      repetir(ctx, cam, 380, 0.24, (x) => {
        ctx.fillStyle = "#d4b585";
        ctx.beginPath();
        ctx.moveTo(x - 40, 308);
        ctx.quadraticCurveTo(x + 100, 216, x + 250, 308);
        ctx.closePath(); ctx.fill();
      });

      // torres de alta tensión cruzando el arenal
      repetir(ctx, cam, 300, 0.36, (x) => {
        const bx = x + 40, base = 306, alto = 118;
        ctx.strokeStyle = "#6b6357"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 14, base); ctx.lineTo(bx, base - alto);
        ctx.moveTo(bx + 14, base); ctx.lineTo(bx, base - alto);
        for (let k = 1; k <= 4; k++) {
          const y = base - (alto / 5) * k, w = 13 - k * 2.4;
          ctx.moveTo(bx - w, y); ctx.lineTo(bx + w, y);
        }
        ctx.moveTo(bx - 22, base - alto + 16); ctx.lineTo(bx + 22, base - alto + 16);
        ctx.stroke();
        // los cables colgando hacia la siguiente torre
        ctx.strokeStyle = "rgba(70,66,58,.55)";
        ctx.beginPath();
        ctx.moveTo(bx + 22, base - alto + 16);
        ctx.quadraticCurveTo(bx + 150, base - alto + 46, bx + 300 - 22, base - alto + 16);
        ctx.stroke();
      });

      // los talleres del parque industrial, con techo de calamina
      repetir(ctx, cam, 176, 0.52, (x, i) => {
        const bx = x + 18, alto = 62 + ((i * 29) % 26), base = 336;
        ctx.fillStyle = ["#d9d2c4", "#e0c9a8", "#cfd6d2", "#e8d2b0"][i % 4];
        ctx.fillRect(bx, base - alto, 96, alto);
        // techo de calamina en dientes de sierra
        ctx.fillStyle = "#8a9098";
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          ctx.moveTo(bx + k * 16, base - alto);
          ctx.lineTo(bx + k * 16 + 8, base - alto - 11);
          ctx.lineTo(bx + k * 16 + 16, base - alto);
          ctx.closePath(); ctx.fill();
        }
        // portón del taller y ventanitas
        ctx.fillStyle = "#6b6357";
        ctx.fillRect(bx + 12, base - 30, 30, 30);
        ctx.fillStyle = "rgba(90,120,140,.55)";
        for (let fx = bx + 54; fx < bx + 90; fx += 16) ctx.fillRect(fx, base - alto + 22, 11, 13);
      });
    },

    clima(ctx, t) {
      // la arena que levanta el viento, de costado
      for (let i = 0; i < 26; i++) {
        const x = (i * 149 - t * 3.1) % 880 - 20;
        const y = 150 + ((i * 61) % 200) + Math.sin(t / 18 + i) * 7;
        ctx.fillStyle = `rgba(232,214,168,${(0.16 + 0.2 * Math.abs(Math.sin(t / 26 + i))).toFixed(2)})`;
        ctx.fillRect(x, y, 9, 2);
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
