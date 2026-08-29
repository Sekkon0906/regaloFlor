/* ==========================================================================
   ESCENA — dibuja los girasoles, las macetas y los bichitos del campo.
   Todo se genera con código para que cada flor salga distinta según su tema.
   ========================================================================== */

const Escena = (() => {

  /* ---- utilidades de color ------------------------------------------- */
  const aRGB = (hex) => {
    const h = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const aHex = (rgb) =>
    "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  const mezcla = (a, b, t) => {
    const [ra, ga, ba] = aRGB(a);
    const [rb, gb, bb] = aRGB(b);
    return aHex([ra + (rb - ra) * t, ga + (gb - ga) * t, ba + (bb - ba) * t]);
  };

  /* ---- formas de pétalo ----------------------------------------------
     Todas apuntan hacia arriba desde el centro (0,0) del viewBox.       */
  const PETALOS = {
    redondo: "M0,-88 C22,-84 32,-60 30,-40 C28,-24 16,-16 0,-16 C-16,-16 -28,-24 -30,-40 C-32,-60 -22,-84 0,-88 Z",
    punta:   "M0,-98 C10,-70 24,-52 24,-38 C24,-22 13,-14 0,-14 C-13,-14 -24,-22 -24,-38 C-24,-52 -10,-70 0,-98 Z",
    onda:    "M0,-92 C14,-86 9,-73 21,-67 C33,-61 30,-45 26,-36 C22,-26 12,-14 0,-14 C-12,-14 -22,-26 -26,-36 C-30,-45 -33,-61 -21,-67 C-9,-73 -14,-86 0,-92 Z",
    corazon: "M0,-72 C7,-92 34,-88 32,-62 C30,-42 12,-26 0,-14 C-12,-26 -30,-42 -32,-62 C-34,-88 -7,-92 0,-72 Z",
    estrella:"M0,-98 L17,-54 L0,-14 L-17,-54 Z",
    doble:   "M0,-90 C18,-86 28,-62 26,-42 C24,-26 14,-16 0,-16 C-14,-16 -24,-26 -26,-42 C-28,-62 -18,-86 0,-90 Z"
  };

  /* ---- adornitos que aluden al recuerdo -------------------------------- */
  const ADORNOS = {
    chispas:   "M0,-11 L2.6,-2.6 L11,0 L2.6,2.6 L0,11 L-2.6,2.6 L-11,0 L-2.6,-2.6 Z",
    estrellas: "M0,-11 L3.2,-3.4 L11,-3.4 L4.8,1.4 L7.1,9 L0,4.4 L-7.1,9 L-4.8,1.4 L-11,-3.4 L-3.2,-3.4 Z",
    notas:     "M-2,7 A4.2,3.4 0 1 0 2.2,9.4 L2.2,-8 L9,-10.4 L9,-6.6 L2.2,-4.2 Z",
    gotas:     "M0,-11 C5,-4 8,-0.5 8,3 C8,7.4 4.4,10.6 0,10.6 C-4.4,10.6 -8,7.4 -8,3 C-8,-0.5 -5,-4 0,-11 Z",
    corazones: "M0,10 C-9,2.6 -11,-1.4 -11,-4.6 C-11,-9 -6.2,-11 -2.8,-8.6 C-1.4,-7.6 -0.4,-6.2 0,-5.2 C0.4,-6.2 1.4,-7.6 2.8,-8.6 C6.2,-11 11,-9 11,-4.6 C11,-1.4 9,2.6 0,10 Z",
    ninguno:   null
  };

  let secuencia = 0;

  /* ---- el corazón del girasol: espiral de semillas --------------------- */
  function semillas(tema, radio) {
    const claro = mezcla(tema.centro, tema.hondo, 0.45);
    let d = "";
    const total = 96;
    for (let i = 0; i < total; i++) {
      const ang = i * 2.39996;                       // ángulo áureo
      const r = radio * 0.94 * Math.sqrt(i / total);
      const x = (Math.cos(ang) * r).toFixed(2);
      const y = (Math.sin(ang) * r).toFixed(2);
      const s = (1.6 + 2.2 * (i / total)).toFixed(2);
      const c = i % 3 === 0 ? claro : tema.centro;
      d += `<circle cx="${x}" cy="${y}" r="${s}" fill="${c}"/>`;
    }
    return d;
  }

  /* ---- una corona de pétalos ------------------------------------------ */
  function corona(tema, cantidad, escala, giro, relleno, borde) {
    const forma = PETALOS[tema.petalo] || PETALOS.redondo;
    let d = "";
    for (let i = 0; i < cantidad; i++) {
      const ang = (360 / cantidad) * i + giro;
      d += `<path d="${forma}" fill="${relleno}" stroke="${borde}" stroke-width="2.5"
             stroke-linejoin="round" transform="rotate(${ang.toFixed(2)}) scale(${escala})"/>`;
    }
    return d;
  }

  /* ---- adornos alrededor de la flor ------------------------------------ */
  function adornos(tema) {
    const forma = ADORNOS[tema.adorno];
    if (!forma) return "";
    const color = mezcla(tema.claro, "#FFFFFF", 0.5);
    const sitios = [
      { x: -82, y: -62, s: 1.0, r: -18 },
      { x: 84, y: -46, s: 0.78, r: 22 },
      { x: 58, y: -92, s: 0.6, r: 8 }
    ];
    return sitios
      .map((p, i) => `<path d="${forma}" fill="${color}" opacity="${0.9 - i * 0.18}"
        transform="translate(${p.x},${p.y}) rotate(${p.r}) scale(${p.s})"/>`)
      .join("");
  }

  /* ======================================================================
     GIRASOL
     opciones: { tallo: true } dibuja tallo y hojas (para la maceta)
     ====================================================================== */
  function girasol(tema, opciones = {}) {
    const id = `g${++secuencia}`;
    const cantidad = tema.petalos || 12;
    const claro = tema.claro || "#FFD98A";
    const hondo = tema.hondo || "#E9A93C";
    const borde = mezcla(hondo, "#7A3E07", 0.35);
    const conTallo = !!opciones.tallo;

    const alto = conTallo ? 300 : 210;
    const vb = conTallo ? "-105 -110 210 300" : "-105 -105 210 210";

    let tallo = "";
    if (conTallo) {
      tallo = `
        <g class="girasol__tallo">
          <path d="M0,60 C-8,110 6,150 0,190" fill="none" stroke="#3F6B32" stroke-width="13" stroke-linecap="round"/>
          <path d="M-2,84 C-36,76 -54,88 -62,108 C-40,123 -12,114 -2,96 Z" fill="#4E7C3E"/>
          <path d="M2,126 C31,118 50,128 58,147 C37,162 12,153 2,138 Z" fill="#5C8C46"/>
        </g>`;
    }

    return `
<svg class="girasol" viewBox="${vb}" width="100%" height="100%" role="img"
     aria-label="Girasol: ${tema.titulo || "recuerdo"}" focusable="false">
  <defs>
    <radialGradient id="${id}-p" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${mezcla(claro, "#FFFFFF", 0.16)}"/>
      <stop offset="100%" stop-color="${claro}"/>
    </radialGradient>
    <radialGradient id="${id}-c" cx="38%" cy="34%" r="72%">
      <stop offset="0%" stop-color="${mezcla(tema.centro, hondo, 0.35)}"/>
      <stop offset="100%" stop-color="${tema.centro}"/>
    </radialGradient>
  </defs>
  ${tallo}
  <g class="girasol__cabeza">
    ${adornos(tema)}
    ${corona(tema, cantidad, 1, 360 / cantidad / 2, hondo, borde)}
    ${tema.petalo === "doble"
      ? corona(tema, cantidad, 0.66, 0, `url(#${id}-p)`, borde)
      : corona(tema, cantidad, 0.82, 0, `url(#${id}-p)`, borde)}
    <circle r="34" fill="url(#${id}-c)" stroke="${borde}" stroke-width="3"/>
    ${semillas(tema, 32)}
  </g>
</svg>`;
  }

  /* ---- la abeja y la mariposa que rondan el campo ---------------------- */
  function abeja() {
    return `
<svg viewBox="-30 -20 60 40" width="100%" height="100%" focusable="false">
  <ellipse cx="4" cy="0" rx="13" ry="9" fill="#F2B705"/>
  <path d="M-2,-8.6 L-2,8.6 M4,-9 L4,9 M10,-7.6 L10,7.6" stroke="#3A2A10" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="-11" cy="0" r="6.4" fill="#3A2A10"/>
  <path d="M-14,-5 L-19,-11 M-11,-6 L-13,-13" stroke="#3A2A10" stroke-width="1.6" stroke-linecap="round"/>
  <ellipse class="ala" cx="2" cy="-11" rx="10" ry="6" fill="#FFFFFF" opacity="0.72"/>
  <ellipse class="ala ala--b" cx="6" cy="-10" rx="8" ry="5" fill="#FFFFFF" opacity="0.55"/>
</svg>`;
  }

  function mariposa() {
    return `
<svg viewBox="-26 -22 52 44" width="100%" height="100%" focusable="false">
  <g class="ala-mar">
    <path d="M-1,0 C-13,-20 -26,-16 -23,-4 C-21,5 -9,8 -1,2 Z" fill="#E8705A"/>
    <path d="M-1,1 C-11,14 -22,13 -21,5 C-20,-1 -9,-3 -1,1 Z" fill="#F2A05C"/>
  </g>
  <g class="ala-mar ala-mar--b">
    <path d="M1,0 C13,-20 26,-16 23,-4 C21,5 9,8 1,2 Z" fill="#E8705A"/>
    <path d="M1,1 C11,14 22,13 21,5 C20,-1 9,-3 1,1 Z" fill="#F2A05C"/>
  </g>
  <ellipse cx="0" cy="0" rx="2.2" ry="9" fill="#3A2A10"/>
  <path d="M-1,-9 L-5,-16 M1,-9 L5,-16" stroke="#3A2A10" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;
  }

  return { girasol, abeja, mariposa, mezcla };
})();
