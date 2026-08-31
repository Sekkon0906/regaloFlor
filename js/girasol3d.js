/* ==========================================================================
   GIRASOL 3D — construye un girasol por geometría a partir de su tema.
   Cada recuerdo tiene forma y número de pétalos, tres colores y un adorno,
   así que no hay dos flores iguales.
   ========================================================================== */

const Girasol3D = (() => {

  const ALTURA_BASE = 1.7;      // el tallo canónico; cada flor se escala sobre esto
  const RADIO = 0.36;           // radio de la cabeza a escala 1

  /* ---- formas de pétalo, normalizadas: largo 1 hacia +Y ---------------- */
  function formaPetalo(tipo) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    switch (tipo) {
      case "punta":
        s.bezierCurveTo(0.19, 0.15, 0.21, 0.60, 0.02, 1.00);
        s.lineTo(-0.02, 1.00);
        s.bezierCurveTo(-0.21, 0.60, -0.19, 0.15, 0, 0);
        break;
      case "onda":
        s.bezierCurveTo(0.24, 0.12, 0.10, 0.34, 0.22, 0.52);
        s.bezierCurveTo(0.32, 0.68, 0.14, 0.84, 0.08, 0.98);
        s.bezierCurveTo(0.03, 1.04, -0.03, 1.04, -0.08, 0.98);
        s.bezierCurveTo(-0.14, 0.84, -0.32, 0.68, -0.22, 0.52);
        s.bezierCurveTo(-0.10, 0.34, -0.24, 0.12, 0, 0);
        break;
      case "corazon":
        s.bezierCurveTo(0.22, 0.16, 0.30, 0.62, 0.17, 0.93);
        s.bezierCurveTo(0.13, 1.03, 0.03, 1.01, 0, 0.87);
        s.bezierCurveTo(-0.03, 1.01, -0.13, 1.03, -0.17, 0.93);
        s.bezierCurveTo(-0.30, 0.62, -0.22, 0.16, 0, 0);
        break;
      case "estrella":
        s.lineTo(0.15, 0.42);
        s.lineTo(0, 1.00);
        s.lineTo(-0.15, 0.42);
        s.lineTo(0, 0);
        break;
      case "doble":
        s.bezierCurveTo(0.17, 0.10, 0.21, 0.56, 0.09, 0.95);
        s.bezierCurveTo(0.05, 1.02, -0.05, 1.02, -0.09, 0.95);
        s.bezierCurveTo(-0.21, 0.56, -0.17, 0.10, 0, 0);
        break;
      default: // redondo
        s.bezierCurveTo(0.20, 0.10, 0.25, 0.55, 0.11, 0.96);
        s.bezierCurveTo(0.06, 1.03, -0.06, 1.03, -0.11, 0.96);
        s.bezierCurveTo(-0.25, 0.55, -0.20, 0.10, 0, 0);
    }
    return s;
  }

  /* un pétalo plano queda muerto: lo curvamos a lo largo y a lo ancho */
  function curvar(geo, alaLargo, alaAncho) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, -alaLargo * y * y - alaAncho * x * x);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  /* ---- el corazón de la flor: espiral de semillas sobre un canvas ------- */
  function texturaCentro(tema) {
    const L = 512;
    const c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");

    g.fillStyle = tema.centro;
    g.fillRect(0, 0, L, L);

    const claro = tema.hondo;
    const total = 620;
    for (let i = 0; i < total; i++) {
      const ang = i * 2.39996;                        // ángulo áureo
      const r = (L * 0.47) * Math.sqrt(i / total);
      const x = L / 2 + Math.cos(ang) * r;
      const y = L / 2 + Math.sin(ang) * r;
      const s = 2.2 + 5.4 * (i / total);
      g.fillStyle = i % 3 === 0 ? claro : tema.centro;
      g.globalAlpha = 0.55 + 0.45 * (i / total);
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;

    // un anillo de flósculos jóvenes en el borde, como los de verdad
    g.strokeStyle = tema.claro;
    g.globalAlpha = 0.5;
    g.lineWidth = L * 0.045;
    g.beginPath();
    g.arc(L / 2, L / 2, L * 0.455, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* ---- textura de un adornito (chispa, nota, gota…) --------------------- */
  const CACHE_ADORNO = {};
  function texturaAdorno(tipo) {
    if (CACHE_ADORNO[tipo]) return CACHE_ADORNO[tipo];
    const L = 128, c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");
    g.translate(L / 2, L / 2);
    g.fillStyle = "#FFFFFF";
    const k = L / 26;

    const trazar = (d) => { g.fill(new Path2D(d)); };
    if (tipo === "estrellas") {
      g.scale(k, k);
      trazar("M0,-11 L3.2,-3.4 L11,-3.4 L4.8,1.4 L7.1,9 L0,4.4 L-7.1,9 L-4.8,1.4 L-11,-3.4 L-3.2,-3.4 Z");
    } else if (tipo === "notas") {
      g.scale(k, k);
      trazar("M-2,7 A4.2,3.4 0 1 0 2.2,9.4 L2.2,-8 L9,-10.4 L9,-6.6 L2.2,-4.2 Z");
    } else if (tipo === "gotas") {
      g.scale(k, k);
      trazar("M0,-11 C5,-4 8,-0.5 8,3 C8,7.4 4.4,10.6 0,10.6 C-4.4,10.6 -8,7.4 -8,3 C-8,-0.5 -5,-4 0,-11 Z");
    } else if (tipo === "corazones") {
      g.scale(k, k);
      trazar("M0,10 C-9,2.6 -11,-1.4 -11,-4.6 C-11,-9 -6.2,-11 -2.8,-8.6 C-1.4,-7.6 -0.4,-6.2 0,-5.2 C0.4,-6.2 1.4,-7.6 2.8,-8.6 C6.2,-11 11,-9 11,-4.6 C11,-1.4 9,2.6 0,10 Z");
    } else {  // chispas
      g.scale(k, k);
      trazar("M0,-11 L2.6,-2.6 L11,0 L2.6,2.6 L0,11 L-2.6,2.6 L-11,0 L-2.6,-2.6 Z");
    }
    const t = new THREE.CanvasTexture(c);
    CACHE_ADORNO[tipo] = t;
    return t;
  }

  /* ---- la hoja ---------------------------------------------------------- */
  function geometriaHoja() {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.30, 0.16, 0.46, 0.52, 0.30, 0.98);
    s.bezierCurveTo(0.14, 0.72, -0.14, 0.72, -0.30, 0.98);
    s.bezierCurveTo(-0.46, 0.52, -0.30, 0.16, 0, 0);
    const g = new THREE.ShapeGeometry(s, 14);
    return curvar(g, 0.30, 0.55);
  }

  /* ======================================================================
     CREAR UN GIRASOL
     Devuelve un Group con .cabeza (gira siguiendo al sol), .colision
     (caja invisible para el raycast) y .datos.
     ====================================================================== */
  function crear(tema) {
    const raiz = new THREE.Group();
    const escala = (tema.altura || ALTURA_BASE) / ALTURA_BASE;
    raiz.scale.setScalar(escala);
    raiz.escalaBase = escala;

    const bordeColor = new THREE.Color(tema.hondo).multiplyScalar(0.72);

    /* --- tallo --- */
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.04),
      new THREE.Vector3(-0.05, ALTURA_BASE * 0.34, 0.02),
      new THREE.Vector3(0.04, ALTURA_BASE * 0.70, -0.01),
      new THREE.Vector3(0, ALTURA_BASE, 0)
    ]);
    const tallo = new THREE.Mesh(
      new THREE.TubeGeometry(curva, 26, 0.038, 7, false),
      new THREE.MeshStandardMaterial({ color: 0x4C7C3B, roughness: 0.85 })
    );
    tallo.castShadow = true;
    raiz.add(tallo);

    /* --- hojas --- */
    const matHoja = new THREE.MeshStandardMaterial({
      color: 0x54873F, roughness: 0.8, side: THREE.DoubleSide
    });
    const geoHoja = geometriaHoja();
    [
      { y: 0.44, giro: 0.5, incl: -0.75, esc: 0.62 },
      { y: 0.74, giro: -2.4, incl: -0.62, esc: 0.52 },
      { y: 1.02, giro: 1.9, incl: -0.5, esc: 0.42 }
    ].forEach((h) => {
      const pivote = new THREE.Group();
      pivote.position.y = ALTURA_BASE * (h.y / 1.7);
      pivote.rotation.y = h.giro;
      const hoja = new THREE.Mesh(geoHoja, matHoja);
      hoja.rotation.x = h.incl;
      hoja.scale.setScalar(h.esc);
      hoja.castShadow = true;
      pivote.add(hoja);
      raiz.add(pivote);
    });

    /* --- cabeza --- */
    const cabeza = new THREE.Group();
    cabeza.position.y = ALTURA_BASE;
    raiz.add(cabeza);

    // el respaldo verde (los sépalos)
    const respaldo = new THREE.Mesh(
      new THREE.CircleGeometry(RADIO * 0.72, 26),
      new THREE.MeshStandardMaterial({ color: 0x497A38, roughness: 0.9, side: THREE.DoubleSide })
    );
    respaldo.position.z = -0.035;
    cabeza.add(respaldo);

    // pétalos: una corona de fondo en el tono hondo y otra encima en el claro
    const forma = formaPetalo(tema.petalo);
    const geoPetalo = curvar(new THREE.ShapeGeometry(forma, 16), 0.13, 0.20);
    const cuantos = tema.petalos || 12;

    const coronas = tema.petalo === "doble"
      ? [{ color: tema.hondo, esc: 1.00, giro: 0.5, incl: -0.11, z: -0.030 },
         { color: tema.claro, esc: 0.72, giro: 0.0, incl: -0.05, z: 0.055 }]
      : [{ color: tema.hondo, esc: 1.00, giro: 0.5, incl: -0.10, z: -0.028 },
         { color: tema.claro, esc: 0.86, giro: 0.0, incl: -0.04, z: 0.050 }];

    coronas.forEach((c) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(c.color), roughness: 0.62, metalness: 0.02,
        side: THREE.DoubleSide, emissive: new THREE.Color(c.color).multiplyScalar(0.02)
      });
      for (let i = 0; i < cuantos; i++) {
        const pivote = new THREE.Group();
        pivote.rotation.z = (i / cuantos) * Math.PI * 2 + (c.giro * Math.PI) / cuantos;
        const petalo = new THREE.Mesh(geoPetalo, mat);
        petalo.scale.setScalar(RADIO * 2.05 * c.esc);
        petalo.position.y = RADIO * 0.46;
        petalo.position.z = c.z;
        petalo.rotation.x = c.incl;
        petalo.castShadow = true;
        pivote.add(petalo);
        cabeza.add(pivote);
      }
    });

    // el domo de semillas, con UV planas para que la espiral caiga derecha
    const domo = new THREE.SphereGeometry(RADIO * 0.74, 34, 16, 0, Math.PI * 2, 0, Math.PI * 0.34);
    domo.rotateX(Math.PI / 2);
    domo.scale(1, 1, 0.24);
    const pos = domo.attributes.position, uv = domo.attributes.uv;
    const r2 = RADIO * 0.74 * 2;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / r2 + 0.5, pos.getY(i) / r2 + 0.5);
    }
    uv.needsUpdate = true;
    const centro = new THREE.Mesh(domo, new THREE.MeshStandardMaterial({
      map: texturaCentro(tema), roughness: 0.88, side: THREE.DoubleSide
    }));
    centro.position.z = 0.004;
    centro.castShadow = true;
    cabeza.add(centro);

    // el filo del disco
    const filo = new THREE.Mesh(
      new THREE.TorusGeometry(RADIO * 0.74, 0.016, 8, 40),
      new THREE.MeshStandardMaterial({ color: bordeColor, roughness: 0.8 })
    );
    cabeza.add(filo);

    /* --- adornitos flotando alrededor --- */
    if (tema.adorno && tema.adorno !== "ninguno") {
      const N = 7;
      const puntos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + Math.random();
        const r = RADIO * (1.35 + Math.random() * 0.75);
        puntos[i * 3] = Math.cos(a) * r;
        puntos[i * 3 + 1] = Math.sin(a) * r * 0.9;
        puntos[i * 3 + 2] = (Math.random() - 0.3) * 0.24;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(puntos, 3));
      const chispas = new THREE.Points(geo, new THREE.PointsMaterial({
        map: texturaAdorno(tema.adorno),
        color: new THREE.Color(tema.claro).lerp(new THREE.Color(0xffffff), 0.45),
        size: 0.15, transparent: true, opacity: 0.9,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
      }));
      cabeza.add(chispas);
      raiz.chispas = chispas;
    }

    /* --- caja invisible, para que el dedo tenga dónde pegarle --- */
    const colision = new THREE.Mesh(
      new THREE.BoxGeometry(RADIO * 2.4, ALTURA_BASE + RADIO, RADIO * 2.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    colision.position.y = (ALTURA_BASE + RADIO) / 2;
    raiz.add(colision);

    raiz.cabeza = cabeza;
    raiz.colision = colision;
    raiz.alturaCabeza = ALTURA_BASE * escala;
    raiz.tema = tema;
    return raiz;
  }

  return { crear, ALTURA_BASE, RADIO };
})();
