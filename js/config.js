/* ==========================================================================
   CONFIGURACIÓN — el único archivo que necesitas tocar.
   Donde escribas {nombre} se pone solo el nombre de abajo.
   ========================================================================== */

const CONFIG = {

  nombre: "Jess",

  /* El número al que llegan los mensajes (país + número, sin el +).
     Lo usan tanto la pantalla del regalo como el girasol en blanco. */
  whatsapp: "573160480641",

  /* ---- 1. La pantalla de los globos ------------------------------------ */
  bienvenida: {
    etiqueta:  "29 de agosto",
    titulo:    "Feliz cumpleaños, {nombre}",
    subtitulo: "Espero que te la pases muy bien hoy. Antes del regalo hay una cosita.",
    pista:     "toca la pantalla para seguir"
  },

  /* ---- 2. Los textos que pasan con cada toque -------------------------- */
  intro: [
    "Hola, {nombre}. Feliz cumpleaños. En serio, espero que hoy te traten como te mereces.",
    "Te armé esto porque me dijiste que los girasoles eran tus flores favoritas. Son cinco y cada uno se quedó con un recuerdo de estas semana y media.",
    "Lo único que tienes que hacer es sembrarlos en las macetas en el orden en que pasaron las cosas: primero lo más viejito, de último lo más reciente.",
    "Cuando siembres uno, el sol le pega y la luz que proyecta te cuenta lo que guarda. Léelos con calma, que ahí están las pistas.",
    "Y cuando queden los cinco en su orden, te llega tu regalo. Vamos."
  ],

  /* ---- 3. Las frases del campo ----------------------------------------- */
  juego: {
    consigna:   "Siembra los girasoles del recuerdo más antiguo al más reciente",
    semillero:  "Girasoles por sembrar",
    comprobar:  "Ver si quedaron en orden",
    ayudaInicio:"Toca un girasol de abajo y después la maceta donde va.",
    espera:     "Siembra un girasol y la luz del sol te contará el recuerdo que guarda.",
    lleno:      "Ya están los cinco sembrados. ¿Quedaron en orden?",
    casi:       "{aciertos} de {total} están en su lugar. Vuelve a leer los recuerdos y muévelos.",
    ninguno:    "Ninguno quedó en su sitio todavía. Fíjate bien en qué pasó primero.",
    unoSolo:    "Solo uno está en su lugar. Sigue intentando, que no hay afán.",
    reiniciar:  "Volver a empezar",
    confirmar:  "¿Saco todos los girasoles y empezamos de cero?",
    si:         "Sí, empezar de nuevo",
    no:         "No, dejarlos así"
  },

  /* ---- 4. La guía, para que nadie se pierda ----------------------------- */
  guia: {
    boton:  "¿Cómo se juega?",
    titulo: "Cómo se juega",
    pasos: [
      "Abajo están los cinco girasoles. Toca uno para levantarlo.",
      "Después toca la maceta donde crees que va. También puedes arrastrarlo con el dedo.",
      "Al sembrarlo, el sol lo alumbra y abajo aparece el recuerdo que guarda. Léelo.",
      "Si te equivocaste, toca el girasol sembrado y llévalo a otra maceta. Puedes moverlos las veces que quieras.",
      "Cuando estén los cinco, dale a «Ver si quedaron en orden»."
    ],
    cerrar: "Ya entendí"
  },

  /* ---- 5. LOS GIRASOLES -------------------------------------------------
     orden  = el orden cronológico real (1 = lo que pasó primero)
     pista  = lo que se ve antes de sembrarlo, en el semillero
     texto  = el párrafo que sale en la luz
     petalo = redondo | punta | onda | corazon | estrella | doble
     ---------------------------------------------------------------------- */
  girasoles: [
    {
      orden: 1,
      titulo: "El almuerzo",
      pista:  "El primer día",
      texto:  "El primer día que nos vimos me llevaste almuerzo. Así, sin que yo pidiera nada, " +
              "porque te diste cuenta de que entre mis cosas ni tiempo de cocinarme tenía.\n\n" +
              "Te vas a reír, pero me quedé callado un buen rato. Aparte de mi mamá, nadie había " +
              "hecho algo así por mí, y no estoy acostumbrado a que la gente me tenga en cuenta " +
              "de esa forma.\n\n" +
              "Para ti fue un almuerzo. Para mí fue bastante más que un almuerzo.",
      petalo: "redondo", petalos: 12, altura: 1.55,
      claro: "#FFD98A", hondo: "#E9A93C", centro: "#5B3A1B",
      adorno: "chispas"
    },
    {
      orden: 2,
      titulo: "La noche que me contaste tu vida",
      pista:  "Cuando me tocó solo escuchar",
      texto:  "Esa noche en tu casa me pusiste a escuchar. Me contaste lo que te ha tocado: la " +
              "universidad, el arriendo, los dos negocios, todo saliendo de tus propias manos.\n\n" +
              "Y yo ahí callado pensando: esta persona está haciendo lo imposible y ni se queja.\n\n" +
              "Me vi reflejado, {nombre}. Esa terquedad de salir adelante, de responder por los " +
              "tuyos, de no quedarte quieta. No sabes lo raro que es encontrarse a alguien que " +
              "entienda eso sin que uno tenga que explicárselo.",
      petalo: "punta", petalos: 14, altura: 1.72,
      claro: "#FFC55C", hondo: "#DE8B22", centro: "#4E3116",
      adorno: "estrellas"
    },
    {
      orden: 3,
      titulo: "En lo que no nos parecemos",
      pista:  "Lo que nos ha costado",
      texto:  "No somos iguales y no me voy a hacer el que no lo ve. A mí la vida me hizo " +
              "independiente a las malas: me acostumbré a resolver solo y a no pedir nada.\n\n" +
              "Y hay algo que casi nunca digo. Llevo años tratando de demostrar que valgo la pena, " +
              "porque casi siempre me han puesto por debajo. Por eso vivo metido en mis proyectos " +
              "como si se me fuera la vida en eso.\n\n" +
              "Sé que eso nos ha quitado tiempo y sé que lo has sentido. No te lo voy a maquillar: " +
              "ahorita tengo la cabeza puesta ahí y no me da para mucho más. Que ande metido en lo " +
              "mío no le quita nada a lo que hiciste por mí, pero tampoco te quiero prometer algo " +
              "que hoy no puedo sostener.",
      petalo: "onda", petalos: 13, altura: 1.62,
      claro: "#F6C56A", hondo: "#C9791F", centro: "#4A2E13",
      adorno: "gotas"
    },
    {
      orden: 4,
      titulo: "Esta página",
      pista:  "Lo que estoy haciendo ahora",
      texto:  "Hoy es 25 de agosto y estoy terminando esto en vez de dormir.\n\n" +
              "La idea salió de algo mínimo: me dijiste que te encantaban los girasoles. Se me " +
              "quedó dando vueltas y pensé que era mejor sembrarte un campo entero que mandarte " +
              "un mensaje de feliz cumpleaños y ya.\n\n" +
              "Cada flor que has ido sembrando tiene un pedazo de estas semana y media. No es " +
              "mucho tiempo, ya sé. Pero alcanzó para que me pasaran cosas que no me pasaban " +
              "hace rato.\n\n" +
              "Spoiler: el que sigue es el último.",
      petalo: "doble", petalos: 16, altura: 1.80,
      claro: "#FFCF6E", hondo: "#C87A1E", centro: "#46290F",
      adorno: "notas"
    },
    {
      orden: 5,
      titulo: "Lo que te deseo",
      pista:  "El último, el más grande",
      texto:  "Feliz cumpleaños, {nombre}.\n\n" +
              "Te deseo que la carrera te salga, que los dos negocios te crezcan, y que la gente " +
              "a la que ayudas te devuelva aunque sea la mitad de lo que tú das. Porque tú vives " +
              "tendiéndole la mano a todo el mundo y eso no lo hace cualquiera.\n\n" +
              "Y sobre nosotros: si quieres espacio, lo entiendo, de pronto no soy lo que estás " +
              "buscando. Y si quieres que sigamos hablando despacio, sin afán, sabiendo lo que soy " +
              "y lo que te puedo dar, por mí seguimos.\n\n" +
              "La ventana la dejo entreabierta, y siempre desde el respeto y la admiración.",
      petalo: "corazon", petalos: 12, altura: 1.95,
      claro: "#FFC24D", hondo: "#D4661C", centro: "#4A2A12",
      adorno: "corazones"
    }
  ],

  /* ---- 6. Cuando gana ---------------------------------------------------- */
  victoria: {
    etiqueta: "el campo quedó completo",
    titulo:   "¡Felicitaciones! Pudiste organizar los girasoles",
    texto:    "Quedaron exactamente en el orden en que pasaron. Así se ve todo junto:",
    boton:    "Y ahora sí, tu regalo"
  },

  /* ---- 7. El regalo -----------------------------------------------------
     Ella llena los campos y el botón abre WhatsApp con todo escrito.
     Nada de esto se guarda ni se manda a ningún servidor.                */
  final: {
    etiqueta: "una última cosa",
    titulo:   "Espero que te haya gustado esta pequeña dinámica",
    texto:    "Tu regalo ya está listo, solo me falta poder mandártelo. Llena esto y con un toque me llega todo:",
    /* `llave` es el rótulo del formulario (le habla a ella);
       `enMensaje` es como sale en el WhatsApp (lo escribe ella).      */
    campos: [
      { llave: "Nombre completo",          enMensaje: "Nombre completo",
        marcador: "Como aparece en tu cédula" },
      { llave: "Número de cuenta o llave", enMensaje: "Cuenta o llave",
        marcador: "Nequi, Bancolombia, lo que uses" },
      { llave: "Dirección",                enMensaje: "Dirección",
        marcador: "Donde te llega todo bien" },
      { llave: "Algo que te guste comer",  enMensaje: "Algo que me gusta comer",
        marcador: "Lo que sea, yo anoto" }
    ],
    saludo:   "¡Ya organicé los girasoles! Estos son mis datos:",
    falta:    "Te falta llenar: {campos}.",
    listo:    "Ya está todo. Dale al botón y se abre WhatsApp con el mensaje escrito.",
    whatsapp: "Enviármelo por WhatsApp",
    ayuda:    "Al tocar el botón se abre WhatsApp con todo ya escrito. Solo le das enviar.",
    copiar:   "o copiar el texto",
    copiado:  "Copiado. Pégamelo por donde quieras.",
    enviado:  "Se abrió WhatsApp con todo listo. Solo dale enviar.",
    seguir:   "Falta un girasol"
  },

  /* ---- 8. El girasol en blanco (opcional) --------------------------------
     El botón abre WhatsApp con el texto ya escrito.
     Cambia el número aquí si algún día lo necesitas (país + número, sin +). */
  blanco: {
    etiqueta:    "opcional, solo si te provoca",
    titulo:      "Te dejo un girasol sin escribir",
    texto:       "Este quedó en blanco a propósito. Si quieres llenarlo con algo, lo que sea, " +
                 "escríbelo aquí. Lo voy a leer, te lo prometo.",
    marcador:    "Escribe aquí lo que quieras…",
    whatsapp:    "Mandármelo por WhatsApp",
    copiar:      "O copiar el texto",
    copiado:     "Copiado. Pégamelo por donde quieras.",
    vacio:       "Escribe algo primero y el botón se activa.",
    ayuda:       "Al tocar el botón se te abre WhatsApp con el mensaje ya escrito. Solo le das enviar.",
    saltar:      "Dejarlo en blanco",
    despedida:   "Gracias por jugar, {nombre}. Feliz cumpleaños."
  }
};
