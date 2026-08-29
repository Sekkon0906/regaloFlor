/* ==========================================================================
   CONFIGURACIÓN
   Este es el ÚNICO archivo que necesitas tocar para personalizar el regalo.
   Todo lo que está aquí es texto de ejemplo: reemplázalo por lo real.
   Donde escribas {nombre} se pondrá solo el nombre de abajo.
   ========================================================================== */

const CONFIG = {

  /* ---- 1. Quién ------------------------------------------------------- */
  nombre: "Flor",

  /* ---- 2. Pantalla de bienvenida (la de los globos) -------------------- */
  bienvenida: {
    etiqueta:  "29 de agosto",
    titulo:    "Feliz cumpleaños, {nombre}",
    subtitulo: "Antes del regalo hay una cosita que quiero que hagas.",
    pista:     "clic para continuar"
  },

  /* ---- 3. Los textos que van pasando con cada clic ---------------------
     Agrega o quita párrafos libremente: uno por cada clic.               */
  intro: [
    "Me acordé de que un día me dijiste que los girasoles eran tus flores favoritas, así que te sembré un campo entero.",
    "Son cinco girasoles y cada uno se quedó con un recuerdo nuestro adentro.",
    "El problema es que crecieron desordenados. Tienes que sembrarlos en las macetas en el orden en que pasaron las cosas: primero el recuerdo más viejo, al final el más reciente.",
    "Cuando el sol le pega a un girasol, la sombra que proyecta te cuenta su recuerdo. Léelos con calma, que ahí están las pistas.",
    "Ya. Al campo."
  ],

  /* ---- 4. El juego ----------------------------------------------------- */
  juego: {
    consigna:   "Siembra los girasoles del recuerdo más antiguo al más reciente",
    semillero:  "Girasoles por sembrar — arrástralos a una maceta",
    comprobar:  "Ver si quedaron en orden",
    ayudaInicio:"Toca un girasol y luego una maceta, o arrástralo hasta ella.",
    espera:     "Siembra un girasol y la luz del sol te contará el recuerdo que guarda.",
    /* {aciertos} y {total} se reemplazan por los números */
    casi:       "{aciertos} de {total} están en su lugar. Vuelve a leer los recuerdos y muévelos.",
    ninguno:    "Ninguno quedó en su sitio todavía. Fíjate bien en qué pasó primero.",
    unoSolo:    "Solo uno está en su lugar. Sigue intentando, que no hay afán."
  },

  /* ---- 5. LOS GIRASOLES ------------------------------------------------
     `orden` es el orden cronológico real (1 = lo que pasó primero).
     `titulo` es el encabezado del recuerdo.
     `texto`  es el párrafo que sale en la proyección de luz.
     `pista`  es la frase corta que se ve en el semillero antes de sembrarlo.

     La estética de cada girasol se arma con:
       petalo:  "redondo" | "punta" | "onda" | "corazon" | "estrella" | "doble"
       petalos: cuántos pétalos (8 a 16 se ven bien)
       claro / hondo / centro: los tres colores de la flor
       adorno:  "chispas" | "estrellas" | "notas" | "gotas" | "corazones" | "ninguno"
     ---------------------------------------------------------------------- */
  girasoles: [
    {
      orden: 1,
      titulo: "El día que te vi por primera vez",
      pista:  "Cuando todavía no sabía tu nombre",
      texto:  "Todavía no sabía nada de ti y ya estaba pendiente de a qué horas volvías a pasar. Me acuerdo perfecto de lo que llevabas puesto y de que no me atreví a decirte nada. Este girasol es el más chiquito porque en ese momento apenas era una semilla.",
      petalo: "redondo", petalos: 12,
      claro: "#FFD98A", hondo: "#E9A93C", centro: "#5B3A1B",
      adorno: "chispas"
    },
    {
      orden: 2,
      titulo: "La primera vez que hablamos de verdad",
      pista:  "Esa conversación que se alargó",
      texto:  "Se suponía que era un rato y terminamos hablando hasta que ya no había excusa para seguir ahí. Me fui pensando que quería que se repitiera. Se repitió.",
      petalo: "punta", petalos: 14,
      claro: "#FFC55C", hondo: "#DE8B22", centro: "#4E3116",
      adorno: "estrellas"
    },
    {
      orden: 3,
      titulo: "La canción",
      pista:  "La que ya no puedo oír igual",
      texto:  "Sonó de pura casualidad y desde ese día es tuya. La pongo y vuelvo a ese momento exacto, con todo y el ruido de fondo. Nunca te he dicho que la tengo guardada aparte.",
      petalo: "onda", petalos: 13,
      claro: "#FFE08A", hondo: "#D9902B", centro: "#5A3818",
      adorno: "notas"
    },
    {
      orden: 4,
      titulo: "El aguacero",
      pista:  "Cuando nos cogió la lluvia",
      texto:  "Nos mojamos enteros y en vez de rabia nos dio risa. Ese día entendí que contigo hasta lo que sale mal se vuelve un buen recuerdo. Todavía me río solo cuando me acuerdo de tu cara.",
      petalo: "doble", petalos: 16,
      claro: "#FFCF6E", hondo: "#C87A1E", centro: "#46290F",
      adorno: "gotas"
    },
    {
      orden: 5,
      titulo: "Hoy",
      pista:  "El más grande, el de ahora",
      texto:  "Y llegamos hasta acá, a tu cumpleaños, conmigo armándote un campo de girasoles en vez de dormir. Este es el más grande de todos porque es el que sigue creciendo. Feliz cumpleaños, {nombre}.",
      petalo: "corazon", petalos: 12,
      claro: "#FFC24D", hondo: "#D4661C", centro: "#4A2A12",
      adorno: "corazones"
    }
  ],

  /* ---- 6. Cuando gana --------------------------------------------------- */
  victoria: {
    etiqueta: "el campo quedó completo",
    titulo:   "¡Felicitaciones! Pudiste organizar los girasoles",
    texto:    "Quedaron exactamente en el orden en que pasaron. Así se ve todo junto:",
    boton:    "Y ahora sí, tu regalo"
  },

  /* ---- 7. El cierre y lo que necesitas que te mande ---------------------- */
  final: {
    etiqueta: "una última cosa",
    titulo:   "Espero que te haya gustado esta pequeña dinámica",
    texto:    "Tu regalo ya está listo, solo me falta poder mandártelo. Para eso necesito que me escribas con estos datos:",
    datos: [
      "Tu nombre completo",
      "El número de cuenta o la llave a la que te puedo transferir",
      "La dirección donde te llega todo bien",
      "Algo que te guste comer"
    ],
    nota:   "Me lo mandas por donde siempre y yo me encargo del resto.",
    boton:  "Copiar la lista",
    copiado:"Listo, copiado. Solo pégalo y mándamelo."
  }
};
