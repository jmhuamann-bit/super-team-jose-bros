# 🎮 Súper Team José Bros — Economía 1

Juego de plataformas para enseñar Economía General I. Cada **clase del curso es un
distrito de Lima**, y cada enemigo es una pregunta de opción múltiple que sube de
dificultad conforme el estudiante avanza.

Hecho con HTML, CSS y JavaScript puro: **sin frameworks, sin instalar nada y sin
imágenes ni audio externos** (los sprites son pixel art escrito en texto y la música
se sintetiza en el navegador).

---

## Cómo se juega

| Acción | Teclado | Celular |
|---|---|---|
| Caminar | ← → | botones ◀ ▶ |
| Correr | mantener **Shift** | botón **B** |
| Saltar | **Espacio**, **↑** o **W** | botón **A** |
| Responder | teclas **1-4** o **A-D** | tocar la alternativa |

Al chocar con un bicho el juego se pausa y aparece la pregunta. Si aciertas, el bicho
desaparece y ganas XP y monedas; si fallas, pierdes una vida y el bicho se queda para
que lo intentes de nuevo. Al final de cada distrito hay un **jefe** con tres preguntas
seguidas, y la meta solo se abre cuando todos los bichos fueron resueltos.

Con 0 vidas se reaparece en el **último checkpoint** con las 3 vidas de vuelta: nunca
se vuelve al inicio del nivel.

Al chocar por primera vez con el jefe aparecen unas **viñetas estilo manga** que lo
presentan. El nivel termina como en los clásicos: se sube una **escalera**, se salta al
**mástil de la bandera** (mientras más alto lo agarres, más monedas de bonus) y, en vez
de entrar a un castillo, llega el **transporte del distrito** —mototaxi en el Callao,
combi en San Miguel, limosina donde corresponda— que se lleva a José al siguiente.

El vehículo se elige con el campo `"vehiculo"` del JSON del nivel: `mototaxi`, `bus`
o `limosina`.

Reglas de diseño de los niveles (las revisa el validador antes de publicar):
el salto sube **3 bloques** y cruza huecos de hasta **4 bloques**, así que ninguna
plataforma puede estar a más de 3 bloques de un piso, y los bloques sorpresa van
siempre 3 o 4 filas encima de un piso para poder cabecearlos.

---

## Estructura del proyecto

```
index.html                 una sola página; el resto se carga solo
styles/main.css            todos los estilos
scripts/
  config.js                números del juego (gravedad, salto, vidas, XP…)
  sprites.js               pixel art escrito como texto + paletas
  temas.js                 identidad visual de cada distrito
  nivel.js                 traduce el JSON del nivel a algo jugable
  motor.js                 física, colisiones, cámara y dibujo
  quiz.js                  ventana de preguntas
  escena.js                viñetas manga del jefe, portada animada y galería
  hud.js                   barra superior y cartelitos
  mapa.js                  pantalla del mapa de distritos
  almacen.js               progreso en LocalStorage
  audio.js                 música y efectos sintetizados
  main.js                  une todo
levels/
  index.json               LISTA DE DISTRITOS (el mapa de campaña)
  level1.json              mapa dibujado con letras
  level2.json
questions/
  level1_questions.json    banco de preguntas
  level2_questions.json
assets/                    ver assets/README.md
```

---

## Agregar una clase nueva (3 pasos, sin tocar el motor)

### 1. Crear el mapa `levels/level3.json`

```json
{
  "id": "level3",
  "distrito": "Pueblo Libre",
  "clase": "Clase 03",
  "titulo": "El nombre del nivel",
  "tema": "puerto",
  "intro": "Dos líneas que explican la misión.",
  "repaso": ["Idea 1 que se practicó", "Idea 2"],
  "mapa": [
    "                    ",
    "         ?          ",
    "                    ",
    "   P        E      M",
    "####################"
  ]
}
```

El mapa se dibuja con letras, **15 filas** de alto:

| Letra | Significa |
|---|---|
| `#` | suelo sólido |
| `=` | plataforma flotante |
| `?` | bloque sorpresa: monedas |
| `1` | bloque con **ceviche**: una vida más |
| `G` | bloque con la **estrella**: José crece y aguanta un golpe |
| `V` | bloque con **chicha energética**: velocidad por unos segundos |
| `L` | bloque con un **foco**: una pista para gastar en cualquier pregunta |
| `o` | moneda |
| `E` | bicho con pregunta |
| `B` | jefe del distrito |
| `X` | obstáculo (quita una vida) |
| `C` | checkpoint |
| `M` | meta |
| `P` | dónde empieza el jugador |
| espacio | aire |

Las preguntas se reparten entre los bichos **de izquierda a derecha**, así que basta
con ordenar el banco de fácil a difícil para que la dificultad suba sola.

### 2. Crear el banco `questions/level3_questions.json`

```json
{
  "preguntasJefe": 3,
  "preguntas": [
    {
      "id": "l3-q1",
      "nivel": "reconocimiento",
      "enunciado": "La pregunta…",
      "opciones": ["A", "B", "C", "D"],
      "correcta": 2,
      "explicacion": "Por qué esa es la respuesta."
    }
  ]
}
```

- `nivel` puede ser `reconocimiento` (10 XP), `comprension` (15 XP) o `aplicacion` (25 XP).
- `correcta` es la posición de la respuesta, **empezando en 0**.
- Las últimas `preguntasJefe` preguntas del banco se le asignan al jefe.
- Con 7 bichos + 1 jefe de 3 preguntas, el banco tiene 10 preguntas.

### 3. Registrarlo en `levels/index.json`

```json
{
  "id": "level3",
  "clase": "Clase 03",
  "distrito": "Pueblo Libre",
  "titulo": "El nombre del nivel",
  "icono": "🏛",
  "retos": 8,
  "duracion": "3 min",
  "mapa": "levels/level3.json",
  "preguntas": "questions/level3_questions.json"
}
```

Listo. El distrito aparece en el mapa y se desbloquea al terminar el anterior.

---

## Crear un distrito con identidad visual propia

En `scripts/temas.js` cada tema define cielo, arquitectura de fondo, vegetación,
clima, colores del suelo, qué bichos aparecen, cómo se llaman y quién es el jefe.
Se copia un tema, se cambian los colores y los dibujos, y se apunta a él desde el
JSON del nivel con `"tema": "miTemaNuevo"`.

Los bichos nuevos se dibujan en `scripts/sprites.js` escribiendo el pixel art como
texto: cada letra es un color de la paleta y el punto es transparente.

---

## Cambiar el mapa de Lima por otro

`levels/index.json` es el mapa de campaña. Cambia los nombres de los distritos por
regiones del Perú, países de América Latina o lo que necesite el curso: la pantalla
del mapa se arma sola con esa lista.

---

## Publicar

El proyecto es estático: se puede subir tal cual a GitHub Pages, Netlify o Vercel.

Para probarlo en la computadora hace falta un servidor local (los navegadores no
dejan cargar módulos ni JSON con doble clic):

```bash
python -m http.server 8000
```

y entrar a `http://localhost:8000`.

---

Contenido de las clases: apuntes propios del curso de Economía General I.
Código y gráficos originales; no se usa ningún recurso de terceros.
