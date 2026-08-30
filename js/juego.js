/* ==========================================================================
   JUEGO — el hilo de todo: bienvenida, guion, el campo, la victoria,
   el regalo y el girasol en blanco.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const texto = (c = "") => String(c).replaceAll("{nombre}", CONFIG.nombre);

  const FLORES = CONFIG.girasoles.map((g, i) => ({ ...g, id: i }));
  const TOTAL = FLORES.length;
  const porId = (id) => FLORES[id];

  /* ---- estado ---------------------------------------------------------- */
  let macetas = new Array(TOTAL).fill(null);   // posición -> id
  let semillero = [];                          // ids sin sembrar, en su ranura
  let seleccion = null;
  let activo = null;
  let campoListo = false;
  let hayFallo = false;

  /* ======================================================================
     ESCENAS
     ====================================================================== */
  const CAMARA_DE = { bienvenida: "lejos", intro: "guion", juego: "juego",
                      victoria: "victoria", final: "victoria", blanco: "victoria" };

  function irA(nombre) {
    document.querySelectorAll(".escena").forEach((s) =>
      s.classList.toggle("escena--activa", s.dataset.escena === nombre));
    document.body.dataset.escena = nombre;
    const viva = $(".escena--activa");
    if (viva) { viva.scrollTop = 0; viva.focus({ preventScroll: true }); }
    Campo.irCamara(CAMARA_DE[nombre] || "juego");
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

    Campo.mostrarGlobos(true);
    setTimeout(() => Fiesta.confeti(120), 400);

    $("#escena-bienvenida").addEventListener("click", () => {
      Fiesta.limpiar();
      Campo.mostrarGlobos(false);
      irA("intro");
      pintarIntro();
    }, { once: true });
  }

  /* ======================================================================
     2. GUION
     ====================================================================== */
  let pasoIntro = 0;

  function pintarIntro() {
    const p = $("#intro-texto");
    p.classList.remove("texto-guion--entra");
    void p.offsetWidth;
    p.textContent = texto(CONFIG.intro[pasoIntro]);
    p.classList.add("texto-guion--entra");
    $("#intro-cuenta").textContent = `${pasoIntro + 1} / ${CONFIG.intro.length}`;
    $("#intro-continuar").textContent =
      pasoIntro === CONFIG.intro.length - 1 ? "entrar al campo" : texto(CONFIG.bienvenida.pista);
  }

  function avanzarIntro() {
    pasoIntro += 1;
    if (pasoIntro >= CONFIG.intro.length) { irA("juego"); montarCampo(); }
    else pintarIntro();
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
    if (a.every((id, i) => porId(id).orden === i + 1) && a.length > 1) {
      [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]];
    }
    return a;
  }

  function montarCampo() {
    $("#consigna").textContent = texto(CONFIG.juego.consigna);
    $("#btn-comprobar").textContent = texto(CONFIG.juego.comprobar);
    $("#btn-reiniciar").textContent = texto(CONFIG.juego.reiniciar);
    $("#proy-espera").textContent = texto(CONFIG.juego.espera);
    avisar(CONFIG.juego.ayudaInicio);

    if (!campoListo) {
      semillero = barajar(FLORES.map((f) => f.id));
      Campo.poblar(FLORES);
      construirRotulos();
      construirTira();
      construirListaTeclado();
      semillero.forEach((id, ranura) =>
        Campo.colocarFlor(id, Campo.sitioSemillero(ranura, TOTAL), -1, true, false));
      Campo.alCadaCuadro(refrescarRotulos);
      Campo.alRedimensionar(() => refrescarTodo());
      campoListo = true;
      Guia.abrirSiEsLaPrimera();
    }
    refrescarTodo();
  }

  function avisar(plantilla, extra) {
    let t = texto(plantilla);
    if (extra) Object.keys(extra).forEach((k) => { t = t.replaceAll(`{${k}}`, extra[k]); });
    $("#aviso").textContent = t;
  }

  /* ---- dónde debe estar cada flor ---------------------------------------- */
  function ubicar(id, brotar, brincar) {
    const pos = macetas.indexOf(id);
    const sitio = pos >= 0
      ? Campo.sitioMaceta(pos)
      : Campo.sitioSemillero(Math.max(0, semillero.indexOf(id)), TOTAL);
    if (seleccion === id) sitio.y += 0.5;
    Campo.colocarFlor(id, sitio, pos, !!brincar, !!brotar);
  }

  function refrescarTodo(reciente) {
    FLORES.forEach((f) => ubicar(f.id, f.id === reciente));
    Campo.marcarAros(macetas.map((id) => id === null));

    const lleno = !macetas.some((id) => id === null);
    $("#btn-comprobar").disabled = !lleno;
    if (lleno && !hayFallo) avisar(CONFIG.juego.lleno);
    if (!lleno && !hayFallo && seleccion === null) avisar(CONFIG.juego.ayudaInicio);
    refrescarTira();
    refrescarListaTeclado();
  }

  /* ---- sembrar, sacar, mirar ---------------------------------------------- */
  function sembrar(id, pos) {
    const origen = macetas.indexOf(id);
    const ocupante = macetas[pos];

    if (origen !== -1) {
      macetas[origen] = ocupante;                      // se cambian de maceta
      if (ocupante !== null) quitarDelSemillero(ocupante);
    } else {
      quitarDelSemillero(id);
      if (ocupante !== null) semillero.push(ocupante);
    }
    macetas[pos] = id;

    seleccion = null;
    hayFallo = false;
    activar(id);
    refrescarTodo(id);
  }

  function quitarDelSemillero(id) {
    const i = semillero.indexOf(id);
    if (i >= 0) semillero.splice(i, 1);
  }

  function devolver(id) {
    const pos = macetas.indexOf(id);
    if (pos === -1) return;
    macetas[pos] = null;
    if (!semillero.includes(id)) semillero.push(id);
    if (activo === id) cerrarProyeccion();
    seleccion = null;
    hayFallo = false;
    refrescarTodo();
  }

  function activar(id) {
    activo = id;
    const flor = porId(id);
    const proy = $("#proyeccion");

    $("#proy-marca").textContent = "el recuerdo que guarda";
    $("#proy-titulo").textContent = texto(flor.titulo);
    $("#proy-texto").innerHTML = texto(flor.texto)
      .split("\n\n").map((p) => `<p>${p}</p>`).join("");
    proy.style.setProperty("--tinte-claro", flor.claro);
    proy.style.setProperty("--tinte-hondo", flor.hondo);
    proy.classList.remove("proyeccion--dormida", "proyeccion--abre");
    void proy.offsetWidth;
    proy.classList.add("proyeccion--abre");
    document.body.dataset.leyendo = "1";

    const pos = macetas.indexOf(id);
    Campo.activar(pos);
    Campo.irCamara("leyendo", false, Campo.xDeMaceta(pos));
  }

  function cerrarProyeccion() {
    activo = null;
    delete document.body.dataset.leyendo;
    $("#proyeccion").classList.add("proyeccion--dormida");
    $("#proyeccion").classList.remove("proyeccion--abre");
    Campo.activar(-1);
    if (document.body.dataset.escena === "juego") Campo.irCamara("juego");
  }

  /* ---- la tira de pistas (la que manda en el celular) ----------------------- */
  function construirTira() {
    $("#tira").innerHTML = FLORES.map((f) => `
      <button class="chapa" type="button" data-id="${f.id}">
        <span class="chapa__punto" style="--tinte:${f.hondo}"></span>
        <span class="chapa__texto">${texto(f.pista)}</span>
      </button>`).join("");

    $("#tira").addEventListener("click", (e) => {
      const b = e.target.closest(".chapa");
      if (!b) return;
      const id = Number(b.dataset.id);
      seleccion = seleccion === id ? null : id;
      if (macetas.indexOf(id) >= 0) activar(id);
      avisar(seleccion === null ? CONFIG.juego.ayudaInicio : "Ahora toca la maceta donde va.");
      refrescarTodo();
    });
  }

  function refrescarTira() {
    for (const b of $("#tira").children) {
      const id = Number(b.dataset.id);
      const sembrada = macetas.indexOf(id);
      b.classList.toggle("chapa--sembrada", sembrada >= 0);
      b.classList.toggle("chapa--alzada", seleccion === id);
      b.setAttribute("aria-pressed", String(seleccion === id));
      b.title = sembrada >= 0 ? `Sembrado en la maceta ${sembrada + 1}` : "Sin sembrar";
    }
  }

  /* ---- rótulos pegados a las flores y a las macetas ------------------------ */
  function construirRotulos() {
    $("#rotulos").innerHTML =
      FLORES.map((f) => `<span class="rotulo rotulo--flor" data-id="${f.id}">${texto(f.pista)}</span>`).join("") +
      macetas.map((_, i) => `<span class="rotulo rotulo--maceta" data-pos="${i}">${i + 1}</span>`).join("");
  }

  function refrescarRotulos() {
    const cont = $("#rotulos");
    if (!cont.children.length) return;
    for (const el of cont.children) {
      let p, mostrar;
      if (el.dataset.id !== undefined) {
        const id = Number(el.dataset.id);
        mostrar = macetas.indexOf(id) === -1;
        p = mostrar ? Campo.puntoDeFlor(id, 0.28) : null;
        if (p) p.y -= (semillero.indexOf(id) % 2) * 30;
      } else {
        const pos = Number(el.dataset.pos);
        mostrar = true;
        p = Campo.puntoEnPantalla(Campo.sitioMaceta(pos).setY(0.34));
      }
      if (!mostrar || !p || !p.visible) { el.style.opacity = "0"; continue; }
      el.style.opacity = "1";
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) translate(-50%, ${el.dataset.id !== undefined ? '-118%' : '-50%'})`;
    }
    if (activo !== null) {
      const c = Campo.puntoDeCharco();
      if (c) $("#proyeccion").style.setProperty("--foco",
        `${Math.max(8, Math.min(92, (c.x / window.innerWidth) * 100))}%`);
    }
  }

  /* ---- el dedo y el ratón sobre el campo ----------------------------------- */
  let gesto = null;

  function alBajar(e) {
    if (document.body.dataset.escena !== "juego") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const q = Campo.aQueApunta(e.clientX, e.clientY);

    if (q.tipo === "girasol") {
      gesto = { id: q.id, x0: e.clientX, y0: e.clientY, movido: false };
      window.addEventListener("pointermove", alMover);
      window.addEventListener("pointerup", alSoltar);
      window.addEventListener("pointercancel", alCancelar);
    } else if (q.tipo === "maceta") {
      gesto = { maceta: q.pos, x0: e.clientX, y0: e.clientY, movido: false };
      window.addEventListener("pointerup", alSoltar);
      window.addEventListener("pointercancel", alCancelar);
    }
  }

  function alMover(e) {
    if (!gesto || gesto.id === undefined) return;
    if (!gesto.movido && Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0) < 9) return;
    if (!gesto.movido) {
      gesto.movido = true;
      seleccion = null;
      Campo.tomarFlor(gesto.id);
      document.body.classList.add("arrastrando");
    }
    e.preventDefault();
    Campo.moverFlor(gesto.id, Campo.puntoEnCampo(e.clientX, e.clientY));
    const q = Campo.aQueApunta(e.clientX, e.clientY);
    Campo.resaltarMaceta(q.tipo === "maceta" ? q.pos : -1);
  }

  function alSoltar(e) {
    if (!gesto) return;
    const g = gesto;
    limpiarGesto();

    if (g.id !== undefined && g.movido) {
      Campo.soltarFlor(g.id);
      const q = Campo.aQueApunta(e.clientX, e.clientY);
      if (q.tipo === "maceta") sembrar(g.id, q.pos);
      else if (macetas.indexOf(g.id) >= 0) devolver(g.id);
      else refrescarTodo();
      return;
    }

    // fue un toque, no un arrastre
    if (g.id !== undefined) {
      const sembrada = macetas.indexOf(g.id) >= 0;
      seleccion = seleccion === g.id ? null : g.id;
      if (sembrada) activar(g.id);
      avisar(seleccion === null ? CONFIG.juego.ayudaInicio : "Ahora toca la maceta donde va.");
      refrescarTodo();
    } else if (g.maceta !== undefined) {
      if (seleccion !== null) sembrar(seleccion, g.maceta);
      else if (macetas[g.maceta] !== null) { activar(macetas[g.maceta]); refrescarTodo(); }
    }
  }

  function alCancelar() {
    if (gesto && gesto.id !== undefined && gesto.movido) {
      Campo.soltarFlor(gesto.id);
      refrescarTodo();
    }
    limpiarGesto();
  }

  function limpiarGesto() {
    gesto = null;
    document.body.classList.remove("arrastrando");
    Campo.resaltarMaceta(-1);
    window.removeEventListener("pointermove", alMover);
    window.removeEventListener("pointerup", alSoltar);
    window.removeEventListener("pointercancel", alCancelar);
  }

  /* ---- el mismo juego, pero solo con teclado -------------------------------- */
  function construirListaTeclado() {
    $("#lista-teclado").innerHTML =
      FLORES.map((f) => `<button type="button" class="tecla" data-id="${f.id}"></button>`).join("") +
      macetas.map((_, i) => `<button type="button" class="tecla" data-pos="${i}"></button>`).join("");

    $("#lista-teclado").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.id !== undefined) {
        const id = Number(b.dataset.id);
        seleccion = seleccion === id ? null : id;
        if (macetas.indexOf(id) >= 0) activar(id);
        avisar(seleccion === null ? CONFIG.juego.ayudaInicio : "Ahora elige la maceta donde va.");
        refrescarTodo();
      } else {
        const pos = Number(b.dataset.pos);
        if (seleccion !== null) sembrar(seleccion, pos);
        else if (macetas[pos] !== null) { activar(macetas[pos]); refrescarTodo(); }
      }
    });
  }

  function refrescarListaTeclado() {
    for (const b of $("#lista-teclado").children) {
      if (b.dataset.id !== undefined) {
        const f = porId(Number(b.dataset.id));
        const pos = macetas.indexOf(f.id);
        b.textContent = pos >= 0
          ? `Girasol «${texto(f.pista)}», sembrado en la maceta ${pos + 1}`
          : `Girasol «${texto(f.pista)}», sin sembrar`;
        b.setAttribute("aria-pressed", String(seleccion === f.id));
      } else {
        const pos = Number(b.dataset.pos);
        const id = macetas[pos];
        b.textContent = id === null
          ? `Maceta ${pos + 1}, vacía`
          : `Maceta ${pos + 1}, con «${texto(porId(id).pista)}»`;
      }
    }
  }

  /* ---- comprobar ------------------------------------------------------------ */
  function comprobar() {
    if (macetas.some((id) => id === null)) return;
    const aciertos = macetas.reduce((n, id, pos) => n + (porId(id).orden === pos + 1 ? 1 : 0), 0);
    if (aciertos === TOTAL) { ganar(); return; }

    hayFallo = true;
    avisar(aciertos === 0 ? CONFIG.juego.ninguno
         : aciertos === 1 ? CONFIG.juego.unoSolo
         : CONFIG.juego.casi, { aciertos, total: TOTAL });

    const b = $(".banca");
    b.classList.remove("tiembla");
    void b.offsetWidth;
    b.classList.add("tiembla");
  }

  function reiniciar() {
    macetas = new Array(TOTAL).fill(null);
    semillero = barajar(FLORES.map((f) => f.id));
    seleccion = null;
    hayFallo = false;
    cerrarProyeccion();
    refrescarTodo();
    avisar(CONFIG.juego.ayudaInicio);
  }

  /* ======================================================================
     4. VICTORIA
     ====================================================================== */
  function ganar() {
    cerrarProyeccion();
    Campo.mostrarLluvia(true);
    setTimeout(() => {
      irA("victoria");
      montarVictoria();
      Fiesta.confeti(160);
    }, 900);
  }

  function montarVictoria() {
    $("#vic-etiqueta").textContent = texto(CONFIG.victoria.etiqueta);
    $("#vic-titulo").textContent = texto(CONFIG.victoria.titulo);
    $("#vic-texto").textContent = texto(CONFIG.victoria.texto);
    $("#vic-continuar").textContent = texto(CONFIG.victoria.boton);

    const enOrden = [...FLORES].sort((a, b) => a.orden - b.orden);
    $("#linea-tiempo").innerHTML = enOrden.map((f) => `
      <li class="hito" style="--tinte:${f.hondo}">
        <div class="hito__cuerpo">
          <h3 class="hito__titulo">${texto(f.titulo)}</h3>
          ${texto(f.texto).split("\n\n").map((p) => `<p class="hito__texto">${p}</p>`).join("")}
        </div>
      </li>`).join("");
  }

  /* ======================================================================
     5. EL REGALO
     ====================================================================== */
  function montarFinal() {
    Campo.mostrarLluvia(false);
    $("#fin-etiqueta").textContent = texto(CONFIG.final.etiqueta);
    $("#fin-titulo").textContent = texto(CONFIG.final.titulo);
    $("#fin-texto").textContent = texto(CONFIG.final.texto);
    $("#fin-nota").textContent = texto(CONFIG.final.ayuda);
    $("#btn-enviar").textContent = texto(CONFIG.final.whatsapp);
    $("#btn-copiar").textContent = texto(CONFIG.final.copiar);
    $("#btn-seguir").textContent = texto(CONFIG.final.seguir);

    if (!$("#fin-campos").children.length) {
      $("#fin-campos").innerHTML = CONFIG.final.campos.map((c, i) => `
        <label class="campo">
          <span class="campo__nombre">${texto(c.llave)}</span>
          <input class="campo__caja" type="text" id="dato-${i}"
                 autocomplete="off" placeholder="${texto(c.marcador)}">
        </label>`).join("");
      $("#fin-campos").addEventListener("input", revisarFinal);
    }
    revisarFinal();
    Fiesta.confeti(70);
  }

  /* qué escribió y qué le falta */
  function datosDelRegalo() {
    return CONFIG.final.campos.map((c, i) => ({
      llave: texto(c.llave),
      enMensaje: texto(c.enMensaje || c.llave),
      valor: ($(`#dato-${i}`) || { value: "" }).value.trim()
    }));
  }

  function revisarFinal() {
    const datos = datosDelRegalo();
    const faltan = datos.filter((d) => !d.valor);
    $("#btn-enviar").disabled = faltan.length > 0;
    $("#btn-copiar").hidden = faltan.length > 0;
    $("#fin-estado").textContent = faltan.length === 0
      ? texto(CONFIG.final.listo)
      : texto(CONFIG.final.falta).replace("{campos}",
          faltan.map((d) => d.llave.toLowerCase()).join(", "));
  }

  function mensajeDelRegalo() {
    const cuerpo = datosDelRegalo().map((d) => `${d.enMensaje}: ${d.valor}`).join("\n");
    return `${texto(CONFIG.final.saludo)}\n\n${cuerpo}`;
  }

  function enviarRegalo() {
    if ($("#btn-enviar").disabled) return;
    abrirWhatsApp(mensajeDelRegalo());
    $("#fin-estado").textContent = texto(CONFIG.final.enviado);
  }

  function abrirWhatsApp(mensaje) {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`,
                "_blank", "noopener");
  }

  async function copiar(cadena, dondeAvisar, mensaje) {
    try {
      await navigator.clipboard.writeText(cadena);
    } catch (e) {
      const a = document.createElement("textarea");
      a.value = cadena;
      a.setAttribute("readonly", "");
      a.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(a);
      a.select();
      try { document.execCommand("copy"); } catch (e2) { /* nada que hacer */ }
      a.remove();
    }
    $(dondeAvisar).textContent = texto(mensaje);
  }

  /* ======================================================================
     6. EL GIRASOL EN BLANCO
     ====================================================================== */
  const LLAVE = "girasolEnBlanco";

  function montarBlanco() {
    $("#bl-etiqueta").textContent = texto(CONFIG.blanco.etiqueta);
    $("#bl-titulo").textContent = texto(CONFIG.blanco.titulo);
    $("#bl-texto").textContent = texto(CONFIG.blanco.texto);
    $("#bl-ayuda").textContent = texto(CONFIG.blanco.ayuda);
    $("#bl-whatsapp").textContent = texto(CONFIG.blanco.whatsapp);
    $("#bl-copiar").textContent = texto(CONFIG.blanco.copiar);
    $("#bl-saltar").textContent = texto(CONFIG.blanco.saltar);
    const area = $("#bl-area");
    area.placeholder = texto(CONFIG.blanco.marcador);
    try { area.value = localStorage.getItem(LLAVE) || ""; } catch (e) { /* modo privado */ }
    revisarBlanco();
  }

  function revisarBlanco() {
    const hay = $("#bl-area").value.trim().length > 0;
    $("#bl-whatsapp").disabled = !hay;
    $("#bl-copiar").disabled = !hay;
    const estado = $("#bl-estado");
    if (!hay) estado.textContent = texto(CONFIG.blanco.vacio);
    else if (estado.textContent === texto(CONFIG.blanco.vacio)) estado.textContent = "";
  }

  function mandarPorWhatsApp() {
    const t = $("#bl-area").value.trim();
    if (!t) return;
    abrirWhatsApp(t);
    $("#bl-estado").textContent = texto(CONFIG.blanco.despedida);
  }

  /* ======================================================================
     CABLEADO
     ====================================================================== */
  function iniciar() {
    if (!Campo.iniciar($("#lienzo3d"))) {
      $("#sin3d").hidden = false;
      $("#app").hidden = true;
      $("#lienzo3d").hidden = true;
      return;
    }

    Guia.montar(texto);
    montarBienvenida();

    $("#escena-intro").addEventListener("click", avanzarIntro);
    $("#lienzo3d").addEventListener("pointerdown", alBajar);
    $("#btn-comprobar").addEventListener("click", comprobar);
    $("#proy-cerrar").addEventListener("click", cerrarProyeccion);
    $("#btn-reiniciar").addEventListener("click", () => Guia.preguntar(texto, reiniciar));
    $("#vic-continuar").addEventListener("click", () => { irA("final"); montarFinal(); });
    $("#btn-seguir").addEventListener("click", () => { irA("blanco"); montarBlanco(); });
    $("#bl-saltar").addEventListener("click", () => { irA("final"); });

    $("#btn-enviar").addEventListener("click", enviarRegalo);
    $("#btn-copiar").addEventListener("click", () =>
      copiar(mensajeDelRegalo(), "#fin-estado", CONFIG.final.copiado));

    $("#bl-area").addEventListener("input", () => {
      revisarBlanco();
      try { localStorage.setItem(LLAVE, $("#bl-area").value); } catch (e) { /* modo privado */ }
    });
    $("#bl-whatsapp").addEventListener("click", mandarPorWhatsApp);
    $("#bl-copiar").addEventListener("click", () =>
      copiar($("#bl-area").value.trim(), "#bl-estado", CONFIG.blanco.copiado));

    document.addEventListener("keydown", (e) => {
      const escena = document.body.dataset.escena;
      if (e.key === "Escape" && escena === "juego" && activo !== null) { cerrarProyeccion(); return; }
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest && e.target.closest("button, textarea, a")) return;
      if (escena === "intro") { e.preventDefault(); avanzarIntro(); }
      else if (escena === "bienvenida") { e.preventDefault(); $("#bv-continuar").click(); }
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
