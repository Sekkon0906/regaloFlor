/* ==========================================================================
   CAMPO 3D — el mundo: cielo, sol con sombras de verdad, pasto con viento,
   macetas, el semillero y los cinco girasoles.
   El texto NO se dibuja aquí: esto solo devuelve dónde cae cada cosa en la
   pantalla, y el HTML pone las palabras encima para que se lean nítidas.
   ========================================================================== */

const Campo = (() => {

  const CALMA = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SOL = new THREE.Vector3(7.5, 12, -5);
  // en vertical la fila no cabe: se aprieta y la cámara se echa para atrás
  let PASO_MACETA = 2.15;
  let PASO_SEMILLERO = 1.78;
  let Z_SEMILLERO = 4.0;
  let deLado = true;
    const ALTO_MACETA = 0.82;

  const CAMARAS_LADO = {
    lejos:    { pos: [0, 3.4, 17.5], mira: [0, 5.2, 0],    fov: 46 },
    guion:    { pos: [0, 3.3, 13.0], mira: [0, 3.4, 0],    fov: 46 },
    juego:    { pos: [0, 4.6, 9.1],  mira: [0, 0.8, 1.6],  fov: 50 },
    leyendo:  { pos: [0, 2.9, 4.9],  mira: [0, 1.45, 0],   fov: 44 },
    victoria: { pos: [0, 4.3, 8.6],  mira: [0, 1.7, 0],    fov: 50 }
  };
  const CAMARAS_ALTO = {
    lejos:    { pos: [0, 3.6, 19.0], mira: [0, 6.4, 0],    fov: 58 },
    guion:    { pos: [0, 3.6, 15.0], mira: [0, 4.6, 0],    fov: 58 },
    juego:    { pos: [0, 6.0, 16.2], mira: [0, 0.6, 2.0],  fov: 56 },
    leyendo:  { pos: [0, 3.2, 6.4],  mira: [0, 1.5, 0],    fov: 52 },
    victoria: { pos: [0, 5.4, 14.0], mira: [0, 1.5, 0],    fov: 56 }
  };
  let CAMARAS = CAMARAS_LADO;

  let escena, camara, render, reloj, lienzo;
  let sol, luzSol, pasto, macetas = [], flores = [], semillero;
  let haz, polvillo, charco, globos, lluvia;
  let uniformesViento = [];
  let camDestino = { pos: new THREE.Vector3(), mira: new THREE.Vector3(), fov: 48 };
  let miraActual = new THREE.Vector3();
  let paralaje = { x: 0, y: 0, ox: 0, oy: 0 };
  let activo = -1, corriendo = false;
  const rayo = new THREE.Raycaster();
  const v2 = new THREE.Vector2();
  const vAux = new THREE.Vector3();
  const qAux = new THREE.Quaternion();
  const objAux = new THREE.Object3D();
  const alturaDe = (f) => Girasol3D.ALTURA_BASE * f.scale.y;
  const vEsc = new THREE.Vector3();

  /* ====================================================================== */
  function hayWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  /* ---- texturas dibujadas al vuelo -------------------------------------- */
  function texturaCielo() {
    const c = document.createElement("canvas");
    c.width = 4; c.height = 256;
    const g = c.getContext("2d");
    const d = g.createLinearGradient(0, 0, 0, 256);
    d.addColorStop(0.00, "#4E86C4");
    d.addColorStop(0.34, "#7FA8D6");
    d.addColorStop(0.66, "#C6DAEA");
    d.addColorStop(1.00, "#FBD9A5");
    g.fillStyle = d;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.LinearFilter;
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function texturaPasto() {
    const L = 256, c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");
    g.fillStyle = "#4E7C3E";
    g.fillRect(0, 0, L, L);
    for (let i = 0; i < 2600; i++) {
      const v = Math.random();
      g.fillStyle = v > 0.66 ? "#5F9049" : v > 0.33 ? "#446E36" : "#578A41";
      g.fillRect(Math.random() * L, Math.random() * L, 2 + Math.random() * 5, 2 + Math.random() * 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(26, 26);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function texturaGirasolLejos() {
    const L = 128, c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");
    g.translate(L / 2, L / 2);
    g.fillStyle = "#E9A93C";
    for (let i = 0; i < 12; i++) {
      g.save();
      g.rotate((i / 12) * Math.PI * 2);
      g.beginPath();
      g.ellipse(0, -L * 0.28, L * 0.075, L * 0.17, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    g.fillStyle = "#4E3116";
    g.beginPath();
    g.arc(0, 0, L * 0.19, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function texturaMancha(dureza) {
    const L = 128, c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");
    const d = g.createRadialGradient(L / 2, L / 2, 0, L / 2, L / 2, L / 2);
    d.addColorStop(0, "rgba(255,255,255,1)");
    d.addColorStop(dureza, "rgba(255,255,255,0.55)");
    d.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, L, L);
    return new THREE.CanvasTexture(c);
  }

  function texturaPetalo() {
    const L = 64, c = document.createElement("canvas");
    c.width = c.height = L;
    const g = c.getContext("2d");
    g.fillStyle = "#FFCF6E";
    g.beginPath();
    g.ellipse(L / 2, L / 2, L * 0.2, L * 0.44, 0.5, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* ---- viento en el pasto: se inyecta en el shader ---------------------- */
  function conViento(material, fuerza) {
    material.onBeforeCompile = (sh) => {
      sh.uniforms.uTiempo = { value: 0 };
      sh.uniforms.uFuerza = { value: CALMA ? 0 : fuerza };
      sh.vertexShader = "uniform float uTiempo;\nuniform float uFuerza;\nattribute float aFase;\n" + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float alto = max(transformed.y, 0.0);
         transformed.x += sin(uTiempo * 1.7 + aFase) * alto * uFuerza;
         transformed.z += cos(uTiempo * 1.3 + aFase * 0.7) * alto * uFuerza * 0.6;`
      );
      uniformesViento.push(sh.uniforms);
    };
    return material;
  }

  /* ---- el pasto instanciado --------------------------------------------- */
  function sembrarPasto() {
    const brizna = new THREE.BufferGeometry();
    const v = new Float32Array([
      -0.022, 0, 0,  0.022, 0, 0,  0.011, 0.16, 0.006,
      -0.022, 0, 0,  0.011, 0.16, 0.006, -0.011, 0.17, 0.006,
      -0.011, 0.17, 0.006, 0.011, 0.16, 0.006, 0.000, 0.29, 0.018
    ]);
    brizna.setAttribute("position", new THREE.BufferAttribute(v, 3));
    brizna.computeVertexNormals();

    const cuantas = CALMA ? 1400 : 5200;
    const mat = conViento(new THREE.MeshLambertMaterial({
      color: 0x5E9247, side: THREE.DoubleSide
    }), 0.30);

    const malla = new THREE.InstancedMesh(brizna, mat, cuantas);
    const fases = new Float32Array(cuantas);
    for (let i = 0; i < cuantas; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.sqrt(Math.random()) * 13;
      objAux.position.set(Math.cos(a) * r, 0, Math.sin(a) * r + 1.5);
      objAux.rotation.set(0, Math.random() * Math.PI, 0);
      objAux.scale.setScalar(0.65 + Math.random() * 0.8);
      objAux.updateMatrix();
      malla.setMatrixAt(i, objAux.matrix);
      fases[i] = Math.random() * Math.PI * 2;
    }
    brizna.setAttribute("aFase", new THREE.InstancedBufferAttribute(fases, 1));
    malla.instanceMatrix.needsUpdate = true;
    malla.receiveShadow = true;
    return malla;
  }

  /* ---- el campo de girasoles del fondo ---------------------------------- */
  function campoLejano() {
    const cuantos = CALMA ? 70 : 240;
    const geo = new THREE.PlaneGeometry(1, 1.35);
    geo.translate(0, 0.675, 0);
    const mat = conViento(new THREE.MeshLambertMaterial({
      map: texturaGirasolLejos(), transparent: true, alphaTest: 0.45,
      side: THREE.DoubleSide, color: 0xE8DFA8
    }), 0.05);
    const malla = new THREE.InstancedMesh(geo, mat, cuantos);
    const fases = new Float32Array(cuantos);
    for (let i = 0; i < cuantos; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * 30;
      objAux.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 4);
      objAux.rotation.set(0, 0, 0);
      objAux.scale.setScalar(0.55 + Math.random() * 0.55);
      objAux.updateMatrix();
      malla.setMatrixAt(i, objAux.matrix);
      fases[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute("aFase", new THREE.InstancedBufferAttribute(fases, 1));
    malla.instanceMatrix.needsUpdate = true;
    return malla;
  }

  /* ---- una maceta de barro ---------------------------------------------- */
  function crearMaceta(indice) {
    const grupo = new THREE.Group();
    const perfil = [
      [0.00, 0.00], [0.30, 0.00], [0.33, 0.04], [0.46, 0.62],
      [0.48, 0.66], [0.56, 0.70], [0.56, 0.80], [0.48, 0.82], [0.46, 0.74], [0.00, 0.70]
    ].map((p) => new THREE.Vector2(p[0], p[1]));

    const barro = new THREE.Mesh(
      new THREE.LatheGeometry(perfil, 30),
      new THREE.MeshStandardMaterial({ color: 0xA85632, roughness: 0.95, side: THREE.DoubleSide })
    );
    barro.castShadow = true;
    barro.receiveShadow = true;
    grupo.add(barro);

    const tierra = new THREE.Mesh(
      new THREE.CircleGeometry(0.47, 26),
      new THREE.MeshStandardMaterial({ color: 0x3E2716, roughness: 1 })
    );
    tierra.rotation.x = -Math.PI / 2;
    tierra.position.y = 0.715;
    tierra.receiveShadow = true;
    grupo.add(tierra);

    // el aro punteado que dice "aquí va uno"
    const aro = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.024, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFF3C4, transparent: true, opacity: 0.5 })
    );
    aro.rotation.x = -Math.PI / 2;
    aro.position.y = 0.86;
    grupo.add(aro);
    grupo.aro = aro;

    const colision = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 2.4, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    colision.position.y = 1.0;
    grupo.add(colision);
    grupo.colision = colision;

    grupo.position.set((indice - 2) * PASO_MACETA, 0, 0);
    grupo.indice = indice;
    return grupo;
  }

  /* ---- el cajón del semillero -------------------------------------------- */
  function crearSemillero(n) {
    const ancho = n * PASO_SEMILLERO + 0.5;
    const g = new THREE.Group();
    const madera = new THREE.MeshStandardMaterial({ color: 0x6E4526, roughness: 1 });
    const oscura = new THREE.MeshStandardMaterial({ color: 0x4C2E17, roughness: 1 });

    const caja = new THREE.Mesh(new THREE.BoxGeometry(ancho, 0.30, 0.85), madera);
    caja.position.y = 0.15;
    caja.castShadow = true;
    caja.receiveShadow = true;
    g.add(caja);

    const relleno = new THREE.Mesh(new THREE.BoxGeometry(ancho - 0.14, 0.05, 0.72), oscura);
    relleno.position.y = 0.31;
    g.add(relleno);

    for (let i = 0; i <= n; i++) {
      const listón = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.9), oscura);
      listón.position.set(-ancho / 2 + (i * ancho) / n, 0.18, 0);
      g.add(listón);
    }
    g.position.set(0, 0, Z_SEMILLERO);
    return g;
  }

  /* ---- globos de cumpleaños, en 3D --------------------------------------- */
  function crearGlobos() {
    const g = new THREE.Group();
    const colores = [0xF2A93B, 0xE8705A, 0x7FB069, 0x6FA8DC, 0xE5B3D6, 0xFFD24A];
    const cuantos = CALMA ? 8 : 20;
    for (let i = 0; i < cuantos; i++) {
      const b = new THREE.Group();
      const color = colores[i % colores.length];
      const cuerpo = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 18, 14),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05 })
      );
      cuerpo.scale.set(0.88, 1, 0.88);
      b.add(cuerpo);
      const nudo = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.16, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
      );
      nudo.position.y = -0.46;
      nudo.rotation.x = Math.PI;
      b.add(nudo);
      const cuerda = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -0.52, 0), new THREE.Vector3(0.06, -1.2, 0.04),
          new THREE.Vector3(-0.04, -1.9, 0)
        ]),
        new THREE.LineBasicMaterial({ color: 0x5A4630, transparent: true, opacity: 0.6 })
      );
      b.add(cuerda);

      b.datos = {
        x: (Math.random() - 0.5) * 26,
        z: -8 + Math.random() * 18,
        y0: 0.6 + Math.random() * 16,
        vel: 1.1 + Math.random() * 1.8,
        fase: Math.random() * Math.PI * 2,
        vaiven: 0.5 + Math.random()
      };
      b.position.set(b.datos.x, b.datos.y0, b.datos.z);
      b.scale.setScalar(0.8 + Math.random() * 0.6);
      g.add(b);
    }
    g.visible = false;
    return g;
  }

  /* ---- lluvia de pétalos -------------------------------------------------- */
  function crearLluvia() {
    const n = CALMA ? 90 : 320;
    const pos = new Float32Array(n * 3);
    const datos = [];
    for (let i = 0; i < n; i++) {
      const d = {
        x: (Math.random() - 0.5) * 20, y: 4 + Math.random() * 14,
        z: -4 + Math.random() * 14, vel: 0.7 + Math.random() * 1.3,
        fase: Math.random() * Math.PI * 2
      };
      datos.push(d);
      pos[i * 3] = d.x; pos[i * 3 + 1] = d.y; pos[i * 3 + 2] = d.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({
      map: texturaPetalo(), size: 0.3, transparent: true,
      depthWrite: false, sizeAttenuation: true
    }));
    p.visible = false;
    p.datos = datos;
    return p;
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function iniciar(elemento) {
    if (!hayWebGL()) return false;
    lienzo = elemento;

    try {
      render = new THREE.WebGLRenderer({
        canvas: lienzo, antialias: window.devicePixelRatio < 2, alpha: false,
        powerPreference: "high-performance"
      });
    } catch (e) { return false; }

    if (THREE.ColorManagement) THREE.ColorManagement.enabled = true;
    render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.9));
    render.shadowMap.enabled = true;
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    render.outputEncoding = THREE.sRGBEncoding;

    escena = new THREE.Scene();
    escena.fog = new THREE.Fog(0xC4DAEC, 24, 62);

    camara = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    reloj = new THREE.Clock();

    // cielo
    const cupula = new THREE.Mesh(
      new THREE.SphereGeometry(90, 32, 20),
      new THREE.MeshBasicMaterial({ map: texturaCielo(), side: THREE.BackSide, fog: false })
    );
    escena.add(cupula);

    // luces
    escena.add(new THREE.HemisphereLight(0xA8C8E8, 0x5E7C3E, 0.36));
    luzSol = new THREE.DirectionalLight(0xFFEBB4, 1.55);
    luzSol.position.copy(SOL);
    luzSol.castShadow = true;
    const s = luzSol.shadow;
    s.mapSize.set(window.innerWidth < 700 ? 1024 : 2048, window.innerWidth < 700 ? 1024 : 2048);
    s.camera.left = -9; s.camera.right = 9;
    s.camera.top = 9; s.camera.bottom = -7;
    s.camera.near = 1; s.camera.far = 34;
    s.bias = -0.0016;
    s.normalBias = 0.02;
    escena.add(luzSol);
    escena.add(luzSol.target);

    const relleno = new THREE.DirectionalLight(0xFFEFCC, 0.40);
    relleno.position.set(-5, 6.5, 12);
    escena.add(relleno);
    luzSol.target.position.set(0, 0.8, 1);

    // el disco del sol en el cielo
    sol = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xFFF6D2, fog: false })
    );
    sol.position.set(15, 10.5, -30);
    escena.add(sol);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texturaMancha(0.3), color: 0xFFD24A, transparent: true,
      opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    }));
    halo.scale.setScalar(13);
    sol.add(halo);

    // suelo
    const suelo = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshStandardMaterial({ map: texturaPasto(), roughness: 1 })
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    escena.add(suelo);

    pasto = sembrarPasto();
    escena.add(pasto);
    escena.add(campoLejano());

    // el haz de luz y su polvillo
    const geoHaz = new THREE.CylinderGeometry(0.42, 1.15, 1, 22, 1, true);
    geoHaz.translate(0, -0.5, 0);
    const colores = [];
    const py = geoHaz.attributes.position;
    for (let i = 0; i < py.count; i++) {
      const t = 1 + py.getY(i);
      colores.push(1, 0.96, 0.78, t * 0.55);
    }
    geoHaz.setAttribute("color", new THREE.Float32BufferAttribute(colores, 4));
    haz = new THREE.Mesh(geoHaz, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide, fog: false
    }));
    haz.visible = false;
    escena.add(haz);

    const nPolvo = CALMA ? 40 : 160;
    const pPos = new Float32Array(nPolvo * 3);
    for (let i = 0; i < nPolvo; i++) pPos[i * 3 + 1] = Math.random();
    const geoPolvo = new THREE.BufferGeometry();
    geoPolvo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    polvillo = new THREE.Points(geoPolvo, new THREE.PointsMaterial({
      map: texturaMancha(0.2), color: 0xFFF3C4, size: 0.11, transparent: true,
      opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    polvillo.visible = false;
    escena.add(polvillo);

    // el charco de luz donde cae la sombra
    charco = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshBasicMaterial({
        map: texturaMancha(0.35), color: 0xFFE9A8, transparent: true,
        opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    charco.rotation.x = -Math.PI / 2;
    charco.position.y = 0.03;
    charco.visible = false;
    escena.add(charco);

    globos = crearGlobos();
    escena.add(globos);
    lluvia = crearLluvia();
    escena.add(lluvia);

    ajustarFormato();
    redimensionar();
    window.addEventListener("resize", redimensionar);
    window.addEventListener("orientationchange", () => setTimeout(redimensionar, 220));
    if (!CALMA) window.addEventListener("pointermove", (e) => {
      paralaje.ox = (e.clientX / window.innerWidth - 0.5) * 2;
      paralaje.oy = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    irCamara("lejos", true);
    corriendo = true;
    render.setAnimationLoop(cuadro);
    return true;
  }

  /* ---- poblar el campo con las flores y las macetas --------------------- */
  function poblar(temas) {
    macetas.forEach((m) => escena.remove(m));
    flores.forEach((f) => escena.remove(f));
    macetas = []; flores = [];

    temas.forEach((tema, i) => {
      const m = crearMaceta(i);
      escena.add(m);
      macetas.push(m);

      const f = Girasol3D.crear(tema);
      f.indiceFlor = i;
      f.sembradaEn = -1;
      f.destino = new THREE.Vector3();
      f.arrastrando = false;
      escena.add(f);
      flores.push(f);
    });

    semillero = crearSemillero(temas.length);
    escena.add(semillero);
    ajustarFormato();
  }

  /* ---- dónde va cada flor ------------------------------------------------ */
  function sitioSemillero(ranura, total) {
    return new THREE.Vector3((ranura - (total - 1) / 2) * PASO_SEMILLERO, 0.33, Z_SEMILLERO);
  }
  function sitioMaceta(pos) {
    return new THREE.Vector3((pos - 2) * PASO_MACETA, ALTO_MACETA * 0.88, 0);
  }

  function colocarFlor(id, sitio, sembrada, brincar, brotar) {
    const f = flores[id];
    f.sembradaEn = sembrada;
    f.destino.copy(sitio);
    if (brincar) f.position.copy(sitio);
    if (brotar) f.brotando = 1;
  }

  function marcarAros(mostrar) {
    macetas.forEach((m, i) => {
      m.aro.visible = mostrar[i];
    });
  }

  /* ---- el sol apunta a una flor ------------------------------------------ */
  function activar(pos) {
    activo = pos;
    if (pos < 0) {
      haz.visible = polvillo.visible = charco.visible = false;
      macetas.forEach((m) => m.escala = 1);
      return;
    }
    haz.visible = polvillo.visible = charco.visible = true;
  }

  function refrescarHaz() {
    if (activo < 0) return;
    const flor = flores.find((f) => f.sembradaEn === activo);
    if (!flor) { activar(-1); return; }

    const cabeza = vAux.set(0, alturaDe(flor), 0).add(flor.position);
    const desde = SOL.clone().multiplyScalar(0.92);
    const largo = desde.distanceTo(cabeza);

    haz.position.copy(desde);
    haz.scale.set(1, largo, 1);
    haz.lookAt(cabeza);
    haz.rotateX(-Math.PI / 2);

    polvillo.position.copy(haz.position);
    polvillo.quaternion.copy(haz.quaternion);
    polvillo.scale.set(1, largo, 1);

    // donde el sol tira la sombra de la cabeza
    const dir = cabeza.clone().sub(SOL).normalize();
    const t = -cabeza.y / dir.y;
    charco.position.set(cabeza.x + dir.x * t, 0.03, cabeza.z + dir.z * t);
  }

  function puntoEnPantalla(v) {
    const p = v.clone().project(camara);
    return {
      x: (p.x * 0.5 + 0.5) * lienzo.clientWidth,
      y: (-p.y * 0.5 + 0.5) * lienzo.clientHeight,
      visible: p.z < 1
    };
  }

  function puntoDeFlor(id, arriba) {
    const f = flores[id];
    return puntoEnPantalla(vAux.set(0, alturaDe(f) + (arriba || 0), 0).add(f.position));
  }

  function xDeMaceta(pos) { return (pos - 2) * PASO_MACETA; }

  function puntoDeCharco() {
    return puntoEnPantalla(charco.position);
  }

  /* ---- raycast: qué hay bajo el dedo -------------------------------------- */
  function aQueApunta(x, y) {
    v2.set((x / lienzo.clientWidth) * 2 - 1, -(y / lienzo.clientHeight) * 2 + 1);
    rayo.setFromCamera(v2, camara);

    const candidatas = flores.filter((f) => !f.arrastrando);
    const golpesFlor = rayo.intersectObjects(candidatas.map((f) => f.colision), false);
    if (golpesFlor.length) {
      const f = candidatas.find((x) => x.colision === golpesFlor[0].object);
      return { tipo: "girasol", id: f.indiceFlor, sembradaEn: f.sembradaEn };
    }
    const golpesMaceta = rayo.intersectObjects(macetas.map((m) => m.colision), false);
    if (golpesMaceta.length) {
      const m = macetas.find((x) => x.colision === golpesMaceta[0].object);
      return { tipo: "maceta", pos: m.indice };
    }
    return { tipo: "campo" };
  }

  const planoArrastre = new THREE.Plane(new THREE.Vector3(0, 1, 0), -ALTO_MACETA * 0.88);
  function puntoEnCampo(x, y) {
    v2.set((x / lienzo.clientWidth) * 2 - 1, -(y / lienzo.clientHeight) * 2 + 1);
    rayo.setFromCamera(v2, camara);
    const p = new THREE.Vector3();
    return rayo.ray.intersectPlane(planoArrastre, p) ? p : null;
  }

  function tomarFlor(id) { flores[id].arrastrando = true; }
  function moverFlor(id, punto) {
    if (!punto) return;
    flores[id].position.set(
      THREE.MathUtils.clamp(punto.x, -8, 8),
      ALTO_MACETA * 0.88,
      THREE.MathUtils.clamp(punto.z, -1.4, Z_SEMILLERO + 1.2));
  }

  /* La maceta más cercana a donde quedó la flor. Da un margen generoso para
     que soltar cerca cuente como acertar, en vez de exigir puntería. */
  function macetaCercana(id, margen) {
    const p = flores[id].position;
    let mejor = -1, dist = margen === undefined ? PASO_MACETA * 0.85 : margen;
    macetas.forEach((m, i) => {
      const d = Math.hypot(p.x - m.position.x, p.z - m.position.z);
      if (d < dist) { dist = d; mejor = i; }
    });
    return mejor;
  }
  function soltarFlor(id) { flores[id].arrastrando = false; }

  function resaltarMaceta(pos) {
    macetas.forEach((m, i) => {
      const q = i === pos ? 1.09 : 1;
      m.scale.lerp(vAux.set(q, q, q), 0.35);
      m.aro.material.opacity = i === pos ? 0.95 : 0.5;
    });
  }

  /* ---- cámara ------------------------------------------------------------- */
  function irCamara(nombre, deInmediato, dx) {
    ultimoNombreCam = CAMARAS[nombre] ? nombre : "juego";
    const c = CAMARAS[nombre] || CAMARAS.juego;
    const x = THREE.MathUtils.clamp(dx || 0, -2.6, 2.6);
    camDestino.pos.set(c.pos[0] + x * 0.55, c.pos[1], c.pos[2]);
    camDestino.mira.set(c.mira[0] + x * 0.85, c.mira[1], c.mira[2]);
    camDestino.fov = c.fov;
    if (deInmediato || CALMA) {
      camara.position.copy(camDestino.pos);
      miraActual.copy(camDestino.mira);
      camara.fov = camDestino.fov;
      camara.updateProjectionMatrix();
      camara.lookAt(miraActual);
    }
  }

  function mostrarGlobos(si) {
    globos.visible = si;
    if (si) globos.children.forEach((b) => { b.position.y = b.datos.y0; });
    if (!si) globos.children.forEach((b) => { b.position.y = b.datos.y0; });
  }
  function mostrarLluvia(si) { lluvia.visible = si; }

  let ultimoNombreCam = "lejos";
  let alRedimensionar = null;

  function ajustarFormato() {
    const nuevoDeLado = window.innerWidth >= window.innerHeight * 0.95;
    if (nuevoDeLado === deLado && macetas.length) return false;
    deLado = nuevoDeLado;
    CAMARAS = deLado ? CAMARAS_LADO : CAMARAS_ALTO;
    PASO_MACETA = deLado ? 2.15 : 1.42;
    PASO_SEMILLERO = deLado ? 1.78 : 1.16;
    Z_SEMILLERO = deLado ? 4.0 : 5.1;

    macetas.forEach((m, i) => m.position.set((i - 2) * PASO_MACETA, 0, 0));
    if (semillero) {
      escena.remove(semillero);
      semillero = crearSemillero(macetas.length);
      escena.add(semillero);
    }
    return true;
  }

  function redimensionar() {
    if (!render) return;
    const a = window.innerWidth, h = window.innerHeight;
    render.setSize(a, h, false);
    camara.aspect = a / h;
    camara.updateProjectionMatrix();
    if (ajustarFormato()) {
      irCamara(ultimoNombreCam, true);
      if (alRedimensionar) alRedimensionar();
    }
  }

  /* ---- el bucle ------------------------------------------------------------ */
  let alPintar = null;
  function cuadro() {
    if (!corriendo) return;
    const dt = Math.min(reloj.getDelta(), 0.05);
    const t = reloj.elapsedTime;

    uniformesViento.forEach((u) => { if (u.uTiempo) u.uTiempo.value = t; });

    // cámara: se acerca suave y respira un poquito con el puntero
    paralaje.x += (paralaje.ox - paralaje.x) * 0.05;
    paralaje.y += (paralaje.oy - paralaje.y) * 0.05;
    const vaiven = CALMA ? 0 : Math.sin(t * 0.22) * 0.16;
    vAux.copy(camDestino.pos).add(
      new THREE.Vector3(paralaje.x * 0.75 + vaiven, -paralaje.y * 0.32, 0)
    );
    const kCam = CALMA ? 1 : Math.min(1, dt * 4.2);
    camara.position.lerp(vAux, kCam);
    miraActual.lerp(camDestino.mira, CALMA ? 1 : Math.min(1, dt * 4.8));
    camara.lookAt(miraActual);
    if (Math.abs(camara.fov - camDestino.fov) > 0.05) {
      camara.fov += (camDestino.fov - camara.fov) * Math.min(1, dt * 5);
      camara.updateProjectionMatrix();
    }

    // las flores: van a su sitio, brotan al sembrarse y giran hacia el sol
    flores.forEach((f) => {
      if (!f.arrastrando) {
        f.position.lerp(f.destino, CALMA ? 1 : Math.min(1, dt * 8.5));
      }
      const meta = f.escalaBase * (f.sembradaEn >= 0 ? 1 : 0.46);
      if (f.brotando > 0) {
        f.brotando = Math.max(0, f.brotando - dt * 1.5);
        const k = 1 - f.brotando;
        const rebote = 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.18;
        f.scale.setScalar(meta * Math.min(1, k * 1.6) * rebote);
      } else {
        vEsc.set(meta, meta, meta);
        f.scale.lerp(vEsc, CALMA ? 1 : Math.min(1, dt * 6.5));
      }

      // heliotropismo: mira al sol, pero sin darle la espalda a quien juega
      const cabezaPos = vAux.set(0, alturaDe(f), 0).add(f.position);
      const haciaSol = SOL.clone().sub(cabezaPos).normalize();
      haciaSol.y = Math.min(haciaSol.y, 0.30);
      haciaSol.normalize();
      const haciaOjo = camara.position.clone().sub(cabezaPos).normalize();
      haciaOjo.y = Math.min(haciaOjo.y, 0.30);
      haciaOjo.normalize();
      const mezcla = f.sembradaEn >= 0
        ? haciaSol.multiplyScalar(0.38).add(haciaOjo.multiplyScalar(0.62))
        : haciaOjo.multiplyScalar(0.88).add(haciaSol.multiplyScalar(0.12));
      objAux.position.copy(cabezaPos);
      objAux.lookAt(cabezaPos.clone().add(mezcla.normalize()));
      qAux.copy(objAux.quaternion);
      f.cabeza.quaternion.slerp(qAux, CALMA ? 1 : Math.min(1, dt * 4));

      if (f.chispas && !CALMA) f.chispas.rotation.z = t * 0.35;
    });

    if (activo >= 0) {
      refrescarHaz();
      charco.material.opacity = 0.42 + Math.sin(t * 1.6) * 0.07;
      const p = polvillo.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) - dt * 0.06;
        if (y < 0) y = 1;
        p.setY(i, y);
        p.setX(i, Math.sin(t * 0.5 + i) * 0.22);
        p.setZ(i, Math.cos(t * 0.4 + i) * 0.22);
      }
      p.needsUpdate = true;
    }

    if (globos.visible) {
      globos.children.forEach((b) => {
        const d = b.datos;
        b.position.y += d.vel * dt * (CALMA ? 0.4 : 1);
        b.position.x = d.x + Math.sin(t * 0.6 * d.vaiven + d.fase) * 0.55;
        b.rotation.z = Math.sin(t * 0.5 + d.fase) * 0.12;
        if (b.position.y > 21) b.position.y = -1.5;
      });
    }

    if (lluvia.visible) {
      const p = lluvia.geometry.attributes.position;
      lluvia.datos.forEach((d, i) => {
        d.y -= d.vel * dt * (CALMA ? 0.3 : 1);
        if (d.y < -0.5) d.y = 12 + Math.random() * 6;
        p.setXYZ(i, d.x + Math.sin(t * 0.8 + d.fase) * 0.5, d.y, d.z);
      });
      p.needsUpdate = true;
    }

    if (alPintar) alPintar();
    render.render(escena, camara);
  }

  function alCadaCuadro(fn) { alPintar = fn; }

  return {
    hayWebGL, iniciar, poblar, colocarFlor, sitioSemillero, sitioMaceta,
    activar, refrescarHaz, puntoDeFlor, puntoDeCharco, puntoEnPantalla,
    aQueApunta, puntoEnCampo, tomarFlor, moverFlor, soltarFlor, resaltarMaceta, macetaCercana,
    irCamara, xDeMaceta, mostrarGlobos,
    alRedimensionar: (fn) => { alRedimensionar = fn; }, mostrarLluvia, marcarAros, alCadaCuadro,
    get flores() { return flores; }, CALMA
  };
})();
