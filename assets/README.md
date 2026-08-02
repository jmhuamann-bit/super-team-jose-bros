# assets/

Esta carpeta está lista para cuando quieras usar archivos externos, pero **hoy el
juego no necesita ninguno**:

- **Sprites** → se dibujan desde `scripts/sprites.js`, donde el pixel art está escrito
  como texto (cada letra es un color). Se editan en cualquier editor, se ven en el
  diff de Git y no hay que abrir un programa de dibujo.
- **Fondos y decorados** → se generan por código en `scripts/temas.js` (grúas,
  contenedores, cometas, arboleda, garúa, sol…). Así cada distrito puede tener su
  propio clima y animaciones sin peso extra.
- **Audio** → se sintetiza en el navegador con la Web Audio API desde
  `scripts/audio.js`. Cada tema tiene su melodía y su bajo escritos como notas.

Ventaja: el juego pesa pocos kilobytes, carga al instante en el celular de cualquier
alumno y no depende de recursos con licencia.

## Si más adelante quieres usar imágenes reales

1. Guarda los PNG en `assets/sprites/`.
2. En `scripts/sprites.js`, reemplaza el contenido de `prepararSprites()` por una
   carga de imágenes que llene el objeto `cocidos` con `{ canvas, ancho, alto }`.
3. El resto del juego no cambia: `pintar()` y `medida()` siguen funcionando igual.

Estructura sugerida para ese caso:

```
assets/
  sprites/   jose.png, bichos_callao.png, …
  images/    fondos, logos
  audio/     música y efectos (.ogg / .mp3)
```
