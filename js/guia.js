/* ==========================================================================
   GUÍA — la explicación de cómo se juega y el aviso de reiniciar.
   Pensado para que no haya que saber nada de tecnología: se abre sola la
   primera vez y siempre queda el botón «¿Cómo se juega?» a la mano.
   ========================================================================== */

const Guia = (() => {

  const $ = (s) => document.querySelector(s);
  let ultimoFoco = null;

  function abrirCaja(caja) {
    ultimoFoco = document.activeElement;
    caja.hidden = false;
    requestAnimationFrame(() => {
      caja.classList.add("guia--abierta");
      const primero = caja.querySelector("button");
      if (primero) primero.focus();
    });
  }

  function cerrarCaja(caja) {
    caja.classList.remove("guia--abierta");
    setTimeout(() => { caja.hidden = true; }, 220);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
  }

  /* ---- la guía de cómo se juega ---------------------------------------- */
  function montar(texto) {
    $("#guia-titulo").textContent = texto(CONFIG.guia.titulo);
    $("#guia-cerrar").textContent = texto(CONFIG.guia.cerrar);
    $("#btn-guia").textContent = texto(CONFIG.guia.boton);
    $("#guia-pasos").innerHTML = CONFIG.guia.pasos
      .map((p) => `<li>${texto(p)}</li>`).join("");

    $("#btn-guia").addEventListener("click", abrir);
    $("#guia-cerrar").addEventListener("click", cerrar);
    $("#guia").addEventListener("click", (e) => {
      if (e.target === $("#guia")) cerrar();
    });
  }

  function abrir() { abrirCaja($("#guia")); }
  function cerrar() { cerrarCaja($("#guia")); }

  /* la primera vez se abre sola, para que nadie se quede mirando la pantalla */
  function abrirSiEsLaPrimera() {
    let vista = false;
    try { vista = sessionStorage.getItem("guiaVista") === "1"; } catch (e) { /* modo privado */ }
    if (vista) return;
    try { sessionStorage.setItem("guiaVista", "1"); } catch (e) { /* da igual */ }
    setTimeout(abrir, 700);
  }

  /* ---- el aviso de «¿seguro que quieres empezar de nuevo?» -------------- */
  function preguntar(texto, alAceptar) {
    const caja = $("#confirmar");
    $("#conf-texto").textContent = texto(CONFIG.juego.confirmar);
    $("#conf-si").textContent = texto(CONFIG.juego.si);
    $("#conf-no").textContent = texto(CONFIG.juego.no);

    const no = () => { cerrarCaja(caja); limpiar(); };
    const si = () => { cerrarCaja(caja); limpiar(); alAceptar(); };
    const fuera = (e) => { if (e.target === caja) no(); };
    const tecla = (e) => { if (e.key === "Escape") no(); };
    function limpiar() {
      $("#conf-si").removeEventListener("click", si);
      $("#conf-no").removeEventListener("click", no);
      caja.removeEventListener("click", fuera);
      document.removeEventListener("keydown", tecla);
    }
    $("#conf-si").addEventListener("click", si);
    $("#conf-no").addEventListener("click", no);
    caja.addEventListener("click", fuera);
    document.addEventListener("keydown", tecla);
    abrirCaja(caja);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#guia").hidden) cerrar();
  });

  return { montar, abrir, cerrar, abrirSiEsLaPrimera, preguntar };
})();
