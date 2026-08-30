/* Mete el CSS y el JS dentro del HTML y deja todo en dist/regalo.html,
   por si quieres mandar la página como un solo archivo.
   Uso: node herramientas/empaquetar.js                                    */

const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const leer = (p) => fs.readFileSync(path.join(raiz, p), "utf8");

let html = leer("index.html");

html = html.replace(
  /<link rel="stylesheet" href="css\/estilos\.css">/,
  `<style>\n${leer("css/estilos.css")}\n</style>`
);

const guiones = [
  "js/vendor/three.min.js", "js/config.js", "js/girasol3d.js",
  "js/campo3d.js", "js/celebracion.js", "js/guia.js", "js/juego.js"
];

for (const archivo of guiones) {
  html = html.replace(
    new RegExp(`<script src="${archivo}"></script>`),
    `<script>\n${leer(archivo)}\n</script>`
  );
}

fs.mkdirSync(path.join(raiz, "dist"), { recursive: true });
fs.writeFileSync(path.join(raiz, "dist/regalo.html"), html);
console.log("Listo: dist/regalo.html (" + Math.round(html.length / 1024) + " KB)");
