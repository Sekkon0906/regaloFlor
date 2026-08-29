/* ==========================================================================
   JUEGO — el hilo de la página: bienvenida, guion, el campo y el cierre.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const texto = (cadena = "") => String(cadena).replaceAll("{nombre}", CONFIG.nombre);

  const FLORES = CONFIG.girasoles.map((g, i) => ({ ...g, id: i }));
  const TOTAL = FLORES.length;
  const porId = (id) => FLORES.find((f) => f.id === id);

  /* ---- estado ---------------------------------------------------------- */
  let macetas = new Array(TOTAL).fill(null);   // posición -> id de girasol
  let semilleroIds = [];                       // ids todavía sin sembrar
  let seleccion = null;                        // id levantado con un toque
  let activo = null;                           // id cuyo recuerdo se está leyendo
  let arrastre = null;
  let recienSembrado = null;

  /* ======================================================================
     ESCENAS
     ====================================================================== */
  function irA(nombre) {
    document.querySelectorAll(".escena").forEach((s) => {
      s.classList.toggle("escena--activa", s.dataset.escena === nombre);
    });
    document.body.dataset.escena = nombre;
    const viva = document.querySelector(".escena--activa");
    if (viva) { viva.scrollTop = 0; viva.focus({ preventScroll: true }); }
  }

  /* ======================================================================
     1. BIENVENIDA
     ====================================================================== */
  function montarBienvenida() {
    document.body.dataset.escena = "bienvenida";
    $("#bv-saludo").textContent = texto(CONFIG.bienvenida.etiqueta);
    $("#bv-titulo").textContent = texto(CONFIG.bienvenida.titulo);
    $("#bv-subtitulo").textContent = texto(CONFIG.bienvenida.subtitulo);
    $("#bv-continuar").textContent = texto(CONFIG.bienvenida.pista);

    Fiesta.globos(18);
    setTimeout(() => Fiesta.confeti(110), 320);

    const seguir = () => { Fiesta.limpiar(); irA("intro"); pintarIntro(); };
    $("#escena-bienvenida").addEventListener("click", seguir, { once: true });
  }

  /* ======================================================================
     2. GUION DE ENTRADA
     ====================================================================== */
  let pasoIntro = 0;

  function pintarIntro() {
    const total = CONFIG.intro.length;
    const p = $("#intro-texto");
    p.classList.remove("texto-guion--entra");
    void p.offsetWidth;                       // reinicia la animación
    p.textContent = texto(CONFIG.intro[pasoIntro]);
    p.classList.add("texto-guion--entra");

    $("#intro-cuenta").textContent = `${pasoIntro + 1} / ${total}`;
    $("#intro-continuar").textContent =
      pasoIntro === total - 1 ? "entrar al campo" : texto(CONFIG.bienvenida.pista);
  }

  function avanzarIntro() {
    pasoIntro += 1;
    if (pasoIntro >= CONFIG.intro.length) {
      irA("juego");
      montarCampo();
    } else {
      pintarIntro();
    }
  }

  /* ======================================================================
     3. EL CAMPO
     ====================================================================== */
  function barajar(lista) {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // que no arranque ya resuelto
    if (a.every((id, i) => porId(id).orden === i + 1) && a.length > 1) {
      [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]];
    }
    return a;
  }

  let campoMontado = false;

  function montarCampo() {
    $("#consigna").textContent = texto(CONFIG.juego.consigna);
    $("#semillero-titulo").textContent = texto(CONFIG.juego.semillero);
    $("#btn-comprobar").textContent = texto(CONFIG.juego.comprobar);
    $("#aviso").textContent = texto(CONFIG.juego.ayudaInicio);
    $("#proy-espera").textContent = texto(CONFIG.juego.espera);
    $("#abeja").innerHTML = Escena.abeja();
    $("#mariposa").innerHTML = Escena.mariposa();

    if (!campoMontado) {
      semilleroIds = barajar(FLORES.map((f) => f.id));
      campoMontado = true;
    }
    pintarMacetas();
    pintarSemillero();
  }

  /* ---- macetas ---------------------------------------------------------- */
  function pintarMacetas() {
    const cont = $("#macetas");
    cont.innerHTML = macetas.map((id, pos) => {
      const flor = id === null ? null : porId(id);
      const sembrada = flor
        ? `<span class="maceta__planta ${recienSembrado === id ? "maceta__planta--brota" : ""}"
                 data-arrastrable data-id="${flor.id}">${Escena.girasol(flor, { tallo: true })}</span>`
        : `<span class="maceta__planta maceta__planta--vacia" aria-hidden="true"></span>`;

      return `
        <div class="maceta ${flor ? "maceta--llena" : ""} ${activo === id && flor ? "maceta--activa" : ""}"
             data-pos="${pos}">
          ${sembrada}
          <button class="maceta__base" type="button" data-pos="${pos}"
                  aria-label="${flor ? `Maceta ${pos + 1}, sembrada: ${flor.titulo}` : `Maceta ${pos + 1}, vacía`}">
            <span class="maceta__barro"></span>
            <span class="maceta__cinta">${pos + 1}</span>
          </button>
        </div>`;
    }).join("");

    recienSembrado = null;
    const lleno = !macetas.some((id) => id === null);
    $("#btn-comprobar").disabled = !lleno;
    if (lleno && !$("#aviso").dataset.fallo) {
      $("#aviso").textContent = "Ya están los cinco sembrados. ¿Quedaron en orden?";
    }
    if (activo !== null && macetas.includes(activo)) {
      requestAnimationFrame(() => trazarHaz(macetas.indexOf(activo)));
    }
  }

  /* ---- semillero -------------------------------------------------------- */
  function pintarSemillero() {
    const cont = $("#semillero");
    const titulo = $("#semillero-titulo");
    if (!semilleroIds.length) {
      titulo.textContent = "El semillero quedó vacío";
      cont.innerHTML = `<p class="semillero__vacio">Puedes seguir moviéndolos entre las macetas.</p>`;
      return;
    }
    titulo.textContent = texto(CONFIG.juego.semillero);
    cont.innerHTML = semilleroIds.map((id) => {
      const f = porId(id);
      return `
        <button class="ficha ${seleccion === id ? "ficha--alzada" : ""}" type="button"
                data-arrastrable data-id="${f.id}"
                aria-label="Girasol: ${f.pista}. Selecciónalo para sembrarlo.">
          <span class="ficha__flor">${Escena.girasol(f)}</span>
          <span class="ficha__pista">${texto(f.pista)}</span>
        </button>`;
    }).join("");
  }

  /* ---- colocar / devolver ------------------------------------------------ */
  function sembrar(id, pos) {
    const origen = macetas.indexOf(id);
    const ocupante = macetas[pos];

    if (origen !== -1) {
      macetas[origen] = ocupante;              // intercambio entre macetas
    } else {
      semilleroIds = semilleroIds.filter((x) => x !== id);
      if (ocupante !== null) semilleroIds.push(ocupante);
    }
    macetas[pos] = id;

    recienSembrado = id;
    seleccion = null;
    delete $("#aviso").dataset.fallo;
    activar(id);
    pintarMacetas();
    pintarSemillero();
  }

  function devolver(id) {
    const origen = macetas.indexOf(id);
    if (origen === -1) return;
    macetas[origen] = null;
    if (!semilleroIds.includes(id)) semilleroIds.push(id);
    if (activo === id) cerrarProyeccion();
    seleccion = null;
    pintarMacetas();
    pintarSemillero();
  }

  /* ---- la luz del sol y la proyección ------------------------------------ */
  function activar(id) {
    activo = id;
    const flor = porId(id);
    const proy = $("#proyeccion");

    $("#proy-marca").textContent = "el recuerdo que guarda";
    $("#proy-titulo").textContent = texto(flor.titulo);
    $("#proy-texto").textContent = texto(flor.texto);
    proy.style.setProperty("--tinte-claro", flor.claro);
    proy.style.setProperty("--tinte-hondo", flor.hondo);
    proy.classList.remove("proyeccion--dormida", "proyeccion--abre");
    void proy.offsetWidth;
    proy.classList.add("proyeccion--abre");

    requestAnimationFrame(() => trazarHaz(macetas.indexOf(id)));
  }

  function cerrarProyeccion() {
    activo = null;
    $("#proyeccion").classList.add("proyeccion--dormida");
    $("#proyeccion").classList.remove("proyeccion--abre");
    $("#haz").innerHTML = "";
  }

  function trazarHaz(pos) {
    const haz = $("#haz");
    const campo = $("#escena-juego");
    const sol = $("#sol");
    const planta = document.querySelector(`.maceta[data-pos="${pos}"] .maceta__planta`);
    if (!planta || !sol || pos < 0) { haz.innerHTML = ""; return; }

    const base = campo.getBoundingClientRect();
    const s = sol.getBoundingClientRect();
    const f = planta.getBoundingClientRect();

    haz.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);
    haz.style.setProperty("--foco", `${(((f.left + f.width / 2) - base.left) / base.width) * 100}%`);
    $("#proyeccion").style.setProperty("--foco", `${(((f.left + f.width / 2) - base.left) / base.width) * 100}%`);

    const sx = s.left + s.width / 2 - base.left;
    const sy = s.top + s.height / 2 - base.top;
    const hx = f.left + f.width / 2 - base.left;
    const hy = f.top + f.width * 0.42 - base.top;
    const w = Math.max(f.width * 0.46, 26);

    haz.innerHTML = `
      <defs>
        <linearGradient id="haz-grad" x1="0" y1="0" x2="0" y2="1"
                        gradientUnits="objectBoundingBox">
          <stop offset="0%" stop-color="#FFF0BC" stop-opacity="0.62"/>
          <stop offset="100%" stop-color="#FFD24A" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <polygon points="${sx - 12},${sy} ${sx + 12},${sy} ${hx + w},${hy + w * 0.5} ${hx - w},${hy + w * 0.5}"
               fill="url(#haz-grad)"/>`;
  }

  window.addEventListener("resize", () => {
    if (activo !== null && macetas.includes(activo)) trazarHaz(macetas.indexOf(activo));
  });

  /* ---- arrastrar y soltar (ratón, dedo y lápiz) -------------------------- */
  function alBajarPuntero(e) {
    const origen = e.target.closest("[data-arrastrable]");
    if (!origen || (e.pointerType === "mouse" && e.button !== 0)) return;

    const id = Number(origen.dataset.id);
    const flor = origen.querySelector("svg").getBoundingClientRect();

    arrastre = {
      id,
      x0: e.clientX, y0: e.clientY,
      dx: e.clientX - (flor.left + flor.width / 2),
      dy: e.clientY - (flor.top + flor.height / 2),
      lado: Math.min(Math.max(flor.width * 1.5, 88), 150),
      movido: false,
      fantasma: null,
      origen
    };

    window.addEventListener("pointermove", alMoverPuntero);
    window.addEventListener("pointerup", alSoltarPuntero);
    window.addEventListener("pointercancel", cancelarArrastre);
  }

  function alMoverPuntero(e) {
    if (!arrastre) return;
    const dist = Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0);
    if (!arrastre.movido && dist < 7) return;

    if (!arrastre.movido) {
      arrastre.movido = true;
      const f = porId(arrastre.id);
      const g = document.createElement("div");
      g.className = "fantasma";
      g.style.width = arrastre.lado + "px";
      g.style.height = arrastre.lado + "px";
      g.innerHTML = Escena.girasol(f);
      document.body.appendChild(g);
      arrastre.fantasma = g;
      arrastre.origen.classList.add("se-va");
      document.body.classList.add("arrastrando");
    }

    e.preventDefault();
    arrastre.fantasma.style.transform =
      `translate(${e.clientX - arrastre.dx}px, ${e.clientY - arrastre.dy}px) translate(-50%, -50%) rotate(-4deg)`;

    const bajo = document.elementFromPoint(e.clientX, e.clientY);
    const maceta = bajo && bajo.closest(".maceta");
    document.querySelectorAll(".maceta").forEach((m) =>
      m.classList.toggle("maceta--diana", m === maceta));
  }

  function alSoltarPuntero(e) {
    if (!arrastre) return;
    const { id, movido, fantasma } = arrastre;

    if (fantasma) fantasma.remove();
    document.querySelectorAll(".maceta--diana").forEach((m) => m.classList.remove("maceta--diana"));
    document.body.classList.remove("arrastrando");
    if (arrastre.origen) arrastre.origen.classList.remove("se-va");
    limpiarEscuchas();

    if (!movido) { arrastre = null; return; }   // fue un toque, lo maneja el clic

    const bajo = document.elementFromPoint(e.clientX, e.clientY);
    const maceta = bajo && bajo.closest(".maceta");
    const canasta = bajo && bajo.closest(".semillero");

    if (maceta) sembrar(id, Number(maceta.dataset.pos));
    else if (canasta) devolver(id);
    else { pintarMacetas(); pintarSemillero(); }

    arrastre = null;
  }

  function cancelarArrastre() {
    if (arrastre && arrastre.fantasma) arrastre.fantasma.remove();
    if (arrastre && arrastre.origen) arrastre.origen.classList.remove("se-va");
    document.body.classList.remove("arrastrando");
    document.querySelectorAll(".maceta--diana").forEach((m) => m.classList.remove("maceta--diana"));
    limpiarEscuchas();
    arrastre = null;
    pintarMacetas();
    pintarSemillero();
  }

  function limpiarEscuchas() {
    window.removeEventListener("pointermove", alMoverPuntero);
    window.removeEventListener("pointerup", alSoltarPuntero);
    window.removeEventListener("pointercancel", cancelarArrastre);
  }

  /* ---- tocar para levantar, tocar para sembrar ---------------------------- */
  function alHacerClic(e) {
    const ficha = e.target.closest(".ficha");
    const planta = e.target.closest(".maceta__planta[data-id]");
    const base = e.target.closest(".maceta__base");

    if (ficha) {
      const id = Number(ficha.dataset.id);
      seleccion = seleccion === id ? null : id;
      $("#aviso").textContent = seleccion === null
        ? texto(CONFIG.juego.ayudaInicio)
        : "Ahora toca la maceta donde va.";
      pintarSemillero();
      return;
    }

    if (planta) {
      const id = Number(planta.dataset.id);
      seleccion = seleccion === id ? null : id;
      activar(id);
      pintarMacetas();
      pintarSemillero();
      return;
    }

    if (base) {
      const pos = Number(base.dataset.pos);
      if (seleccion !== null) {
        sembrar(seleccion, pos);
        $("#aviso").textContent = texto(CONFIG.juego.ayudaInicio);
      } else if (macetas[pos] !== null) {
        activar(macetas[pos]);
        pintarMacetas();
      }
    }
  }

  /* ---- comprobar el orden -------------------------------------------------- */
  function comprobar() {
    if (macetas.some((id) => id === null)) return;
    const aciertos = macetas.reduce(
      (n, id, pos) => n + (porId(id).orden === pos + 1 ? 1 : 0), 0);

    if (aciertos === TOTAL) { ganar(); return; }

    const plantilla =
      aciertos === 0 ? CONFIG.juego.ninguno :
      aciertos === 1 ? CONFIG.juego.unoSolo :
      CONFIG.juego.casi;

    const aviso = $("#aviso");
    aviso.dataset.fallo = "1";
    aviso.textContent = texto(plantilla)
      .replaceAll("{aciertos}", aciertos)
      .replaceAll("{total}", TOTAL);

    const fila = $("#macetas");
    fila.classList.remove("macetas--tiembla");
    void fila.offsetWidth;
    fila.classList.add("macetas--tiembla");
  }

  /* ======================================================================
     4. VICTORIA
     ====================================================================== */
  function ganar() {
    $("#aviso").textContent = "";
    document.querySelectorAll(".maceta").forEach((m, i) => {
      setTimeout(() => m.classList.add("maceta--gana"), i * 130);
    });

    setTimeout(() => {
      irA("victoria");
      montarVictoria();
      Fiesta.confeti(150);
      Fiesta.petalos(40);
    }, TOTAL * 130 + 620);
  }

  function montarVictoria() {
    $("#vic-etiqueta").textContent = texto(CONFIG.victoria.etiqueta);
    $("#vic-titulo").textContent = texto(CONFIG.victoria.titulo);
    $("#vic-texto").textContent = texto(CONFIG.victoria.texto);
    $("#vic-continuar").textContent = texto(CONFIG.victoria.boton);

    const enOrden = [...FLORES].sort((a, b) => a.orden - b.orden);
    $("#linea-tiempo").innerHTML = enOrden.map((f) => `
      <li class="hito">
        <span class="hito__flor">${Escena.girasol(f)}</span>
        <div class="hito__cuerpo">
          <h3 class="hito__titulo">${texto(f.titulo)}</h3>
          <p class="hito__texto">${texto(f.texto)}</p>
        </div>
      </li>`).join("");
  }

  /* ======================================================================
     5. CIERRE
     ====================================================================== */
  function montarFinal() {
    $("#fin-etiqueta").textContent = texto(CONFIG.final.etiqueta);
    $("#fin-titulo").textContent = texto(CONFIG.final.titulo);
    $("#fin-texto").textContent = texto(CONFIG.final.texto);
    $("#fin-nota").textContent = texto(CONFIG.final.nota);
    $("#btn-copiar").textContent = texto(CONFIG.final.boton);
    $("#lista-datos").innerHTML = CONFIG.final.datos
      .map((d) => `<li class="dato">${texto(d)}</li>`).join("");
    Fiesta.confeti(70);
  }

  async function copiarLista() {
    const cuerpo = CONFIG.final.datos.map((d, i) => `${i + 1}. ${texto(d)}`).join("\n");
    const todo = `${texto(CONFIG.final.texto)}\n\n${cuerpo}`;
    try {
      await navigator.clipboard.writeText(todo);
    } catch {
      const area = document.createElement("textarea");
      area.value = todo;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    $("#fin-copiado").textContent = texto(CONFIG.final.copiado);
  }

  /* ======================================================================
     CABLEADO
     ====================================================================== */
  function iniciar() {
    montarBienvenida();

    $("#escena-intro").addEventListener("click", avanzarIntro);
    $("#escena-juego").addEventListener("pointerdown", alBajarPuntero);
    $("#escena-juego").addEventListener("click", alHacerClic);
    $("#btn-comprobar").addEventListener("click", (e) => { e.stopPropagation(); comprobar(); });
    $("#vic-continuar").addEventListener("click", () => { irA("final"); montarFinal(); });
    $("#btn-copiar").addEventListener("click", copiarLista);

    document.addEventListener("keydown", (e) => {
      const escena = document.body.dataset.escena;
      if (e.key === "Escape" && escena === "juego" && activo !== null) { cerrarProyeccion(); return; }
      if (e.key !== "Enter" && e.key !== " ") return;
      // si el foco está en un botón, su propio clic ya se encarga
      if (e.target.closest && e.target.closest("button")) return;
      if (escena === "intro") { e.preventDefault(); avanzarIntro(); }
      else if (escena === "bienvenida") { e.preventDefault(); $("#bv-continuar").click(); }
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
