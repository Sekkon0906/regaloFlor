# El campo de girasoles

Una página de regalo de cumpleaños. Se abre con globos y confeti sobre un campo
en 3D, pasa por un guion de bienvenida y termina en un minijuego: hay cinco
girasoles y cada uno guarda un recuerdo. Hay que sembrarlos en las macetas en el
orden en que pasaron las cosas. Al sembrar uno, el sol le tira un haz de luz, la
flor proyecta su sombra sobre el pasto y de ahí sale el recuerdo que guarda.

Al acertar el orden llega la felicitación, la línea de recuerdos completa, los
datos que hacen falta para entregar el regalo y, al final, un girasol en blanco
por si quiere escribir algo de vuelta.

## Cómo verla

Necesita un servidor local (por los archivos de JavaScript). Abrir `index.html`
directamente con doble clic **no** funciona en todos los navegadores.

```bash
npx http-server -p 8080 .
```

Y entrar a `http://localhost:8080`.

Si prefieres un solo archivo que se abre con doble clic, mira más abajo.

## Cómo personalizarla

**Todo el contenido vive en `js/config.js`.** Es el único archivo que necesitas
tocar. Donde escribas `{nombre}` se pone solo el nombre de la persona.

| Qué | Dónde |
| --- | --- |
| El nombre | `nombre` |
| La pantalla de los globos | `bienvenida` |
| Los textos que pasan con cada toque | `intro` (uno por toque, agrega los que quieras) |
| Las frases del campo | `juego` |
| Los pasos de la guía | `guia` |
| **Los girasoles y sus recuerdos** | `girasoles` |
| La felicitación al ganar | `victoria` |
| El cierre y los datos que pides | `final` |
| El girasol en blanco y **el número de WhatsApp** | `blanco` |

### Los girasoles

Cada girasol del arreglo `girasoles` lleva:

- `orden` — el orden cronológico real. `1` es lo que pasó primero. Es la
  respuesta del juego.
- `titulo` — el encabezado del recuerdo.
- `texto` — el párrafo que sale en la luz. Con una línea en blanco (`\n\n`) se
  parte en párrafos.
- `pista` — la frase corta que se ve antes de sembrarlo. Es lo único que tiene
  para decidir dónde va, así que ahí está la gracia.

Y su estética, que se construye sola a partir de estos valores:

- `petalo` — `redondo`, `punta`, `onda`, `corazon`, `estrella` o `doble`
- `petalos` — cuántos pétalos (entre 8 y 16 se ven bien)
- `altura` — qué tan alto crece (1.5 a 2.0)
- `claro`, `hondo`, `centro` — los tres colores de la flor
- `adorno` — `chispas`, `estrellas`, `notas`, `gotas`, `corazones` o `ninguno`

Para tener cuatro girasoles en vez de cinco, borra uno del arreglo y ajusta los
`orden` para que queden seguidos. Las macetas se ajustan solas.

### El número de WhatsApp

Está en `blanco.numero`, con el indicativo del país y sin el `+`:

```js
numero: "573160480641"
```

## Un solo archivo

Si prefieres mandar la página como un archivo suelto, que se abre con doble clic
y funciona sin servidor y sin internet:

```bash
node herramientas/empaquetar.js
```

Deja todo junto en `dist/regalo.html`, con Three.js incluido dentro.

## Publicarla en internet

Con GitHub Pages: en el repositorio, **Settings → Pages**, elige la rama y la
carpeta raíz. La página queda en `https://<usuario>.github.io/<repositorio>/`.

## Los archivos

```
index.html              las seis escenas y la interfaz
css/estilos.css         la interfaz que va encima del 3D
js/config.js            ← el contenido: aquí escribes tú
js/vendor/three.min.js  Three.js r149 (incluido para que funcione sin internet)
js/girasol3d.js         construye cada girasol por geometría, según su tema
js/campo3d.js           el mundo: cielo, sol con sombras, viento, macetas, cámara
js/celebracion.js       el confeti
js/guia.js              la guía de cómo se juega y el aviso de reiniciar
js/juego.js             el hilo: escenas, arrastrar y soltar, comprobar el orden
```

## Detalles

- **3D de verdad** con Three.js: el sol es una luz direccional con sombras
  proyectadas, el pasto se mueve con el viento y los girasoles sembrados giran
  la cabeza siguiendo la luz, como los de verdad.
- Funciona con el dedo (tocar o arrastrar), con ratón y solo con teclado: con
  el tabulador aparece una lista con los girasoles y las macetas.
- Se adapta a pantallas verticales y horizontales: en vertical el campo se
  aprieta, la cámara se echa para atrás y las pistas se leen en la tira de
  abajo en vez de flotando sobre las flores.
- Respeta `prefers-reduced-motion`: con el movimiento reducido activado se
  quitan el viento, el vaivén de la cámara y las animaciones.
- Si el navegador no puede con WebGL, la página lo dice claro en vez de quedarse
  en blanco.
- La página no recoge ni envía ningún dato a ningún servidor. La lista del
  regalo es texto para copiar, y el girasol en blanco arma un mensaje de
  WhatsApp que la persona envía desde su propio teléfono.
