/* ==========================================================================
   CELEBRACIÓN — globos, confeti y pétalos. Todo sobre un <canvas> a
   pantalla completa que no intercepta clics.
   ========================================================================== */

const Fiesta = (() => {

  const lienzo = document.getElementById("lienzo-fiesta");
  const ctx = lienzo.getContext("2d");
  const calmado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ancho = 0, alto = 0, dpr = 1;
  let piezas = [];
  let corriendo = false;

  const COLORES_GLOBO = ["#F2A93B", "#E8705A", "#7FB069", "#6FA8DC", "#E5B3D6", "#FFD24A"];
  const COLORES_CONFETI = ["#FFD24A", "#F5A623", "#E8705A", "#7FB069", "#6FA8DC", "#FFF6E3", "#E5B3D6"];

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = Math.floor(ancho * dpr);
    lienzo.height = Math.floor(alto * dpr);
    lienzo.style.width = ancho + "px";
    lienzo.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  medir();
  window.addEventListener("resize", medir);

  const azar = (a, b) => a + Math.random() * (b - a);
  const elige = (lista) => lista[Math.floor(Math.random() * lista.length)];

  /* ---- globos que suben ------------------------------------------------ */
  function globos(cantidad = 16) {
    const n = calmado ? Math.ceil(cantidad / 3) : cantidad;
    for (let i = 0; i < n; i++) {
      const r = azar(20, 38);
      piezas.push({
        tipo: "globo",
        x: azar(r, ancho - r),
        y: azar(alto * 0.35, alto + r * 3.5),
        r,
        color: elige(COLORES_GLOBO),
        vy: azar(0.55, 1.35) * (calmado ? 0.5 : 1),
        fase: azar(0, Math.PI * 2),
        vaiven: azar(0.4, 1.2),
        brillo: azar(-0.35, -0.15)
      });
    }
    arrancar();
  }

  /* ---- confeti: lluvia desde arriba o estallido desde un punto --------- */
  function confeti(cantidad = 90, origen = null) {
    const n = calmado ? Math.ceil(cantidad / 4) : cantidad;
    for (let i = 0; i < n; i++) {
      const estallido = !!origen;
      const ang = azar(0, Math.PI * 2);
      const fuerza = azar(3, 11);
      piezas.push({
        tipo: "confeti",
        x: estallido ? origen.x : azar(0, ancho),
        y: estallido ? origen.y : azar(-alto * 0.5, -10),
        vx: estallido ? Math.cos(ang) * fuerza : azar(-0.9, 0.9),
        vy: estallido ? Math.sin(ang) * fuerza - 3 : azar(1.6, 4),
        w: azar(6, 12),
        h: azar(8, 16),
        color: elige(COLORES_CONFETI),
        giro: azar(0, Math.PI * 2),
        vgiro: azar(-0.16, 0.16),
        roce: estallido ? 0.972 : 1
      });
    }
    arrancar();
  }

  /* ---- pétalos de girasol cayendo -------------------------------------- */
  function petalos(cantidad = 34) {
    const n = calmado ? Math.ceil(cantidad / 3) : cantidad;
    for (let i = 0; i < n; i++) {
      piezas.push({
        tipo: "petalo",
        x: azar(0, ancho),
        y: azar(-alto, -20),
        vy: azar(0.9, 2.1),
        r: azar(9, 17),
        color: elige(["#FFD98A", "#F5A623", "#E9A93C", "#FFC24D"]),
        giro: azar(0, Math.PI * 2),
        vgiro: azar(-0.05, 0.05),
        fase: azar(0, Math.PI * 2),
        vaiven: azar(0.8, 1.9)
      });
    }
    arrancar();
  }

  function limpiar() {
    piezas = [];
    ctx.clearRect(0, 0, ancho, alto);
  }

  /* ---- dibujo ----------------------------------------------------------- */
  function pintarGlobo(p) {
    const bal = Math.sin(p.fase) * 14;
    const x = p.x + bal;
    ctx.save();
    ctx.translate(x, p.y);
    ctx.rotate(Math.sin(p.fase) * 0.12);

    ctx.strokeStyle = "rgba(70,52,30,0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, p.r * 1.28);
    ctx.quadraticCurveTo(bal * 0.6, p.r * 2.4, -bal * 0.5, p.r * 3.4);
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 0.86, p.r, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-p.r * 0.16, p.r * 0.98);
    ctx.lineTo(p.r * 0.16, p.r * 0.98);
    ctx.lineTo(0, p.r * 1.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.ellipse(-p.r * 0.3, -p.r * 0.36, p.r * 0.19, p.r * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function pintarConfeti(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.giro);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.giro * 1.4)));
    ctx.restore();
  }

  function pintarPetalo(p) {
    ctx.save();
    ctx.translate(p.x + Math.sin(p.fase) * 22, p.y);
    ctx.rotate(p.giro);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 0.42, p.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function paso() {
    ctx.clearRect(0, 0, ancho, alto);

    for (let i = piezas.length - 1; i >= 0; i--) {
      const p = piezas[i];

      if (p.tipo === "globo") {
        p.y -= p.vy;
        p.fase += 0.012 * p.vaiven;
        if (p.y < -p.r * 4) { piezas.splice(i, 1); continue; }
        pintarGlobo(p);

      } else if (p.tipo === "confeti") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy = p.vy * p.roce + 0.09;
        p.vx *= p.roce;
        p.giro += p.vgiro;
        if (p.y > alto + 30) { piezas.splice(i, 1); continue; }
        pintarConfeti(p);

      } else {
        p.y += p.vy;
        p.fase += 0.016 * p.vaiven;
        p.giro += p.vgiro;
        if (p.y > alto + 30) { piezas.splice(i, 1); continue; }
        pintarPetalo(p);
      }
    }

    if (piezas.length) {
      requestAnimationFrame(paso);
    } else {
      corriendo = false;
      ctx.clearRect(0, 0, ancho, alto);
    }
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(paso);
  }

  return { globos, confeti, petalos, limpiar, calmado };
})();
