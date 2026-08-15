# Integrar los juegos a una plataforma

Guía para el desarrollador que va a embeber estos juegos en otra plataforma y
mantenerla al día cuando se publique una clase nueva.

> Este archivo es **el mismo en los cuatro repos** del proyecto. Si lo cambias,
> cámbialo en los cuatro.

---

## Los cuatro juegos

Cada curso es un repositorio independiente publicado con GitHub Pages. El sitio y el
repo comparten nombre.

| Curso | Sitio publicado | Repositorio |
|---|---|---|
| Economía General I | https://jmhuamann-bit.github.io/super-team-jose-bros/ | `jmhuamann-bit/super-team-jose-bros` |
| Economía General II | https://jmhuamann-bit.github.io/super-team-jose-macroeconomia/ | `jmhuamann-bit/super-team-jose-macroeconomia` |
| Estadística 1 | https://jmhuamann-bit.github.io/super-team-jose-estadistica/ | `jmhuamann-bit/super-team-jose-estadistica` |
| Estadística 2 | https://jmhuamann-bit.github.io/super-team-jose-probabilidades/ | `jmhuamann-bit/super-team-jose-probabilidades` |

Los cuatro son públicos: se leen sin token.

---

## Cómo está hecho

- HTML, CSS y **módulos ES nativos**. No hay bundler, ni npm, ni paso de compilación:
  lo que está en el repo es exactamente lo que se sirve.
- El motor (`scripts/`) es idéntico en los cuatro repos **salvo `temas.js`, `escena.js`
  e `index.html`**, donde cambian los nombres de los personajes y el título del curso.
  No los copies entre repos a ciegas.
- Todo el contenido vive en JSON. Agregar una clase es agregar dos archivos y una
  entrada en un índice; el motor no se toca.
- Se puede embeber en un `<iframe>` tal cual. Usa canvas y teclado, así que dale foco
  y no le pongas `sandbox` sin `allow-scripts`.

---

## Contrato de datos

Tres archivos por curso. Si la plataforma solo quiere mostrar el temario sin abrir el
juego, con el primero le basta.

### `levels/index.json` — el temario

Es el único que necesitas leer para saber qué clases existen y cuáles están
disponibles. Un distrito solo es jugable si trae `mapa` **y** tiene `abierto: true`.

```json
{
  "titulo": "Lima",
  "descripcion": "Cada distrito es una clase del curso…",
  "niveles": [
    {
      "id":        "level1",
      "clase":     "Clase 01",
      "distrito":  "Callao",
      "titulo":    "El puerto de las decisiones",
      "icono":     "⚓",
      "retos":     8,
      "duracion":  "3 min",
      "abierto":   true,
      "mapa":      "levels/level1.json",
      "preguntas": "questions/level1_questions.json"
    }
  ]
}
```

`retos` son 7 enemigos + 1 jefe.

### `questions/levelN_questions.json` — el banco de preguntas

Diez preguntas por clase. Las últimas `preguntasJefe` se reservan para el jefe final;
las demás se reparten entre los enemigos en orden de aparición, de menor a mayor
dificultad. `correcta` es el índice dentro de `opciones`, **empezando en cero**.

```json
{
  "nivel":         "level1",
  "clase":         "Clase 01 · Medición del PBI",
  "fuente":        "Apuntes de la 1era clase",
  "preguntasJefe": 3,
  "preguntas": [
    {
      "id":          "m1-q1",
      "nivel":       "reconocimiento",
      "enunciado":   "¿Cuál es la definición del PBI?",
      "opciones":    ["…", "…", "…", "…"],
      "correcta":    2,
      "explicacion": "…"
    }
  ]
}
```

`nivel` es `reconocimiento`, `comprension` o `aplicacion`, y define cuánta experiencia
otorga la pregunta.

### `levels/levelN.json` — el mapa

Trae la ambientación (`tema`, `musica`, `vehiculo`), el texto de intro, el repaso y el
mapa dibujado con letras. Salvo que quieras un editor de niveles, la plataforma no
necesita leerlo.

---

## Detectar que se publicó una clase nueva

El sitio se actualiza solo cuando se hace push. Lo que falta es que la plataforma
**se entere y lo registre**. Dos caminos, de mejor a más simple.

### 1. Lo ideal: un webhook

En cada repo, *Settings → Webhooks → Add webhook*. Apunta a un endpoint tuyo, content
type `application/json`, evento **Just the push event**. GitHub avisa en segundos, sin
que consultes nada.

Al recibirlo: valida la firma `X-Hub-Signature-256`, saca el repo del payload y salta
al paso 3 para leer qué cambió.

### 2. Si prefieres no exponer un endpoint: consulta cada tanto

La API pública de GitHub da el último commit sin token. Con `If-None-Match` las
respuestas sin cambios devuelven `304` y **no consumen cuota**, así que revisar los
cuatro repos cada 15 minutos sobra (el límite sin token es de 60 consultas por hora).

```js
const REPOS = {
  'economia-1':    'jmhuamann-bit/super-team-jose-bros',
  'economia-2':    'jmhuamann-bit/super-team-jose-macroeconomia',
  'estadistica-1': 'jmhuamann-bit/super-team-jose-estadistica',
  'estadistica-2': 'jmhuamann-bit/super-team-jose-probabilidades',
};

// Devuelve null si no hubo cambios desde la última revisión.
async function revisarCurso(repo, etagGuardado) {
  const r = await fetch(`https://api.github.com/repos/${repo}/commits/main`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'plataforma-team-jose',
      ...(etagGuardado ? { 'If-None-Match': etagGuardado } : {}),
    },
  });

  if (r.status === 304) return null;   // sin novedades

  const commit = await r.json();
  return {
    sha:     commit.sha,
    fecha:   commit.commit.committer.date,
    mensaje: commit.commit.message.split('\n')[0],
    etag:    r.headers.get('etag'),    // guárdalo para la próxima
  };
}
```

### 3. Ya sabes que cambió: ahora lee qué cambió

El commit dice *cuándo*, pero no *qué*. Para eso lee el temario y compáralo con lo que
tengas guardado. Esta es la cifra que de verdad le importa a la plataforma.

```js
async function leerTemario(slug) {
  const url = `https://jmhuamann-bit.github.io/${slug}/levels/index.json`;
  const r = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
  const { niveles } = await r.json();

  const abiertas = niveles.filter(n => n.abierto === true && n.mapa);

  return {
    totalDistritos: niveles.length,
    clasesAbiertas: abiertas.length,
    ultimaClase:    abiertas.at(-1)?.clase    ?? null,
    ultimoDistrito: abiertas.at(-1)?.distrito ?? null,
    temario: abiertas.map(n => ({
      id: n.id, clase: n.clase, distrito: n.distrito, titulo: n.titulo,
    })),
  };
}
```

### 4. Registra el evento, no solo el estado

Guarda una fila por actualización, no un contador que pisas. Con eso puedes mostrar
«3 clases nuevas este mes», avisar a los alumnos del curso que cambió, y reconstruir
el historial si algo se rompe.

```
curso            texto      -- economia-1, estadistica-2, …
sha              texto      -- único junto con curso
fecha_commit     timestamp
mensaje          texto
clases_antes     entero
clases_despues   entero
distrito_nuevo   texto null -- si clases_despues > clases_antes
detectado_en     timestamp
```

Pon un índice único en `(curso, sha)`: así, si el webhook y el sondeo llegan los dos,
no cuentas la misma actualización dos veces.

---

## Dos advertencias

### La caché tarda

GitHub Pages sirve con `Cache-Control: max-age=600`. Entre que se hace push y que el
CDN sirve lo nuevo pueden pasar **hasta unos 10 minutos**, más medio minuto de
compilación. Si el webhook avisa y el JSON todavía viene viejo, no es tu código:
reintenta a los cinco minutos.

Para tus propias consultas usa siempre un parámetro nuevo en la URL, como en el ejemplo
de arriba. El juego ya lo hace por su cuenta con `cache: "no-cache"`, así que al alumno
le llega lo último apenas el CDN lo suelta.

### El progreso hoy no sale del navegador

El avance del alumno (XP, monedas, mejores tiempos, aciertos) se guarda en
`localStorage` y **nunca viaja a ningún servidor**. Hoy no se puede saber quién jugó ni
cuánto avanzó, y si un alumno entra desde otro dispositivo empieza de cero.

Si la plataforma necesita calificar o llevar seguimiento, hay que agregarlo: lo más
simple es que el juego mande un `postMessage` al contenedor al terminar cada distrito y
que la plataforma lo persista. Es un cambio chico en el motor, pero es un cambio: hoy
no existe.

---

Si en algún momento hacen falta más de 60 consultas por hora a la API, un token
personal de solo lectura sube el límite a 5 000 sin cambiar nada más del código.
