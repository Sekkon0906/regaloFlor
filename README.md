# El campo de girasoles

Una página de regalo de cumpleaños. Se abre con globos y confeti, pasa por un
guion de bienvenida y termina en un minijuego: hay cinco girasoles y cada uno
guarda un recuerdo. Hay que sembrarlos en las macetas en el orden en que
pasaron las cosas. Cuando el sol le pega a un girasol sembrado, la luz que
proyecta sobre el pasto cuenta su recuerdo.

Al acertar el orden aparece la felicitación, la línea de recuerdos completa y,
al final, la lista de datos que hace falta para entregar el regalo.

## Cómo verla

Abre `index.html` en cualquier navegador. No hace falta instalar nada ni
compilar: es HTML, CSS y JavaScript a secas.

Si quieres un servidor local:

```bash
npx http-server -p 8080 .
```

## Cómo personalizarla

**Todo el contenido vive en `js/config.js`.** Es el único archivo que necesitas
tocar. Donde escribas `{nombre}` se pone solo el nombre de la persona.

| Qué | Dónde |
| --- | --- |
| El nombre | `nombre` |
| La pantalla de los globos | `bienvenida` |
| Los textos que pasan con cada clic | `intro` (uno por clic, agrega los que quieras) |
| Las frases del juego | `juego` |
| **Los girasoles y sus recuerdos** | `girasoles` |
| La felicitación al ganar | `victoria` |
| El cierre y los datos que pides | `final` |

### Los girasoles

Cada girasol del arreglo `girasoles` lleva:

- `orden` — el orden cronológico real. `1` es lo que pasó primero. Es la
  respuesta del juego.
- `titulo` — el encabezado del recuerdo.
- `texto` — el párrafo que sale en la proyección de luz.
- `pista` — la frase corta que se ve en el semillero, antes de sembrarlo. Es lo
  único que tiene para decidir dónde va, así que ahí está la gracia.

Y su estética, que se dibuja sola a partir de estos valores:

- `petalo` — `redondo`, `punta`, `onda`, `corazon`, `estrella` o `doble`
- `petalos` — cuántos pétalos (entre 8 y 16 se ven bien)
- `claro`, `hondo`, `centro` — los tres colores de la flor
- `adorno` — `chispas`, `estrellas`, `notas`, `gotas`, `corazones` o `ninguno`

Para tener cuatro girasoles en vez de cinco, borra uno del arreglo y ajusta los
`orden` para que queden seguidos (1, 2, 3, 4). Las macetas se ajustan solas.

## Un solo archivo

Si prefieres mandar la página como un archivo suelto, en vez de la carpeta:

```bash
node herramientas/empaquetar.js
```

Deja todo junto en `dist/regalo.html`.

## Publicarla en internet

Con GitHub Pages: en el repositorio, **Settings → Pages**, elige la rama y la
carpeta raíz. La página queda en `https://<usuario>.github.io/<repositorio>/`.

## Los archivos

```
index.html              la estructura de las cinco escenas
css/estilos.css         el campo, las macetas, la luz y las animaciones
js/config.js            ← el contenido: aquí escribes tú
js/escena.js            dibuja los girasoles, la abeja y la mariposa
js/celebracion.js       globos, confeti y pétalos sobre un canvas
js/juego.js             el hilo: escenas, arrastrar y soltar, comprobar el orden
```

## Detalles

- Funciona con ratón, con el dedo y solo con el teclado (tabulador y Enter).
- Se adapta de 320 px a pantallas anchas.
- Respeta `prefers-reduced-motion`: con el movimiento reducido activado se
  quitan las nubes, los bichitos y las animaciones.
- La página no recoge ni envía ningún dato. La lista del final es solo texto,
  para que la persona te escriba por donde ustedes hablen.
