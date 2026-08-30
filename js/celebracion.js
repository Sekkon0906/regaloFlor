/* ==========================================================================
   CELEBRACIÓN — el confeti. Los globos y los pétalos ahora viven en el 3D;
   aquí solo queda el papelito de colores, que se ve mejor plano y encima.
   ========================================================================== */

const Fiesta = (() => {

  const lienzo = document.getElementById("lienzo-fiesta");
  const ctx = lienzo.getContext("2d");
  const calmado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORES = ["#FFD24A", "#F5A623", "#E8705A", "#7FB069", "#6FA8DC", "#FFF6E3", "#E5B3D6"];

  let ancho = 0, alto = 0, piezas = [], corriendo = false;

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    lienzo.width = Math.floor(ancho * dpr);
    lienzo.height = Math.floor(alto * dpr);
    lienzo.style.width = ancho + "px";
    lienzo.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  medir();
  window.addEventListener("resize", medir);

  const azar = (a, b) => a + Math.random() * (b - a);

  function confeti(cantidad = 90, origen = null) {
    const n = calmado ? Math.ceil(cantidad / 4) : cantidad;
    for (let i = 0; i < n; i++) {
      const estallido = !!origen;
      const ang = azar(0, Math.PI * 2);
      const fuerza = azar(3, 11);
      piezas.push({
        x: estallido ? origen.x : azar(0, ancho),
        y: estallido ? origen.y : azar(-alto * 0.6, -10),
        vx: estallido ? Math.cos(ang) * fuerza : azar(-0.9, 0.9),
        vy: estallido ? Math.sin(ang) * fuerza - 3 : azar(1.6, 4),
        w: azar(6, 12), h: azar(8, 16),
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
        giro: azar(0, Math.PI * 2), vgiro: azar(-0.16, 0.16),
        roce: estallido ? 0.972 : 1
      });
    }
    arrancar();
  }

  function limpiar() { piezas = []; ctx.clearRect(0, 0, ancho, alto); }

  function paso() {
    ctx.clearRect(0, 0, ancho, alto);
    for (let i = piezas.length - 1; i >= 0; i--) {
      const p = piezas[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy = p.vy * p.roce + 0.09;
      p.vx *= p.roce;
      p.giro += p.vgiro;
      if (p.y > alto + 30) { piezas.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.giro * 1.4)));
      ctx.restore();
    }
    if (piezas.length) requestAnimationFrame(paso);
    else { corriendo = false; ctx.clearRect(0, 0, ancho, alto); }
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(paso);
  }

  return { confeti, limpiar, calmado };
})();
