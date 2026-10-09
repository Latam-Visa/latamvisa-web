// Posiciones y tamaños del PDF de cotización de Canadá.
//
// UNIDAD: píxeles de los PNG de Canva (public/cotizacion/canada/pagina-N.png,
// 1414 x 2000). Para mover algo, mide en el PNG y cambia el número aquí; el
// componente convierte a puntos de PDF (A4 = 595.28 x 841.89 pt).
// Tamaños de letra (`size`) en puntos de PDF.

export const PNG_ANCHO = 1414
export const PNG_ALTO = 2000

export const COLORES = {
  tinta: '#141414',
  neon: '#C8FF00',
  borde: '#000000',
}

// Retoques sobre los fondos (se aplican a la imagen con sharp, no al texto):
// - pagina-1 no deja espacio para el párrafo de Viabilidad: el bloque de
//   Requisitos se baja `desplazamiento` px y el hueco se rellena con textura
//   tomada de una franja vacía de la misma página.
// - Sin visa americana, se tapa "y copia de la visa americana de cada uno."
// - pagina-2: se borra la tabla de Canva para dibujar la de la cotización.
export const RETOQUES = {
  pagina1: {
    // Requisitos: texto de 961 a 1623; se toma con margen para que los bordes
    // fundidos (24 px) caigan sobre papel y no sobre letras.
    bloqueRequisitos: { y: 950, alto: 700 },
    desplazamiento: 170,
    // Hueco que queda arriba al bajar el bloque (empieza bajo "1. VIABILIDAD:").
    hueco: { y: 928, alto: 192 },
    // Franja sin texto (bajo Requisitos, sobre la línea inferior) usada de relleno.
    franjaRelleno: { y: 1626 },
    // "y copia de la visa americana de cada uno." (coordenadas ANTES de bajar el bloque)
    fraseVisaUsa: { x: 458, y: 1199, ancho: 690, alto: 34 },
  },
  pagina2: {
    // Tabla de Canva: bordes en x 105-1309, y 870-1399. Se borra con margen
    // para que los bordes fundidos caigan sobre papel.
    tabla: { x: 60, y: 840, ancho: 1300, alto: 590 },
    franjaRelleno: { y: 1410, alto: 165 },
  },
}

export const PAGINA_1 = {
  numero: { right: 1050, y: 334, size: 8.5 },
  grupo: { x: 126, y: 442, size: 12.5 },
  fechas: { x: 126, y: 494, size: 11 },
  cliente: { x: 126, y: 532, size: 11 },
  viabilidad: { x: 120, y: 948, ancho: 1150, size: 11.2, interlineado: 1.18 },
  // Punto final de "...6 meses de vigencia)" cuando se tapa la frase de la visa americana.
  puntoSinVisa: { x: 457, y: 1199 + 170, size: 11.4 },
}

export const PAGINA_2 = {
  tabla: {
    // Bordes verticales de las 3 columnas (los mismos de la tabla de Canva).
    columnas: [105, 697, 982, 1308],
    y: 870,
    altoEncabezado: 74,
    altoFila: 76,
    padding: 15,
    sizeEncabezado: 11.5,
    sizeConcepto: 9.2,
    sizeMonto: 11.5,
    sizeCuando: 9.2,
  },
  // "PARA EMPEZAR HOY:" ya viene impreso en el fondo (x 107-451, y 1584-1604).
  paraEmpezar: { x: 465, y: 1576, size: 11.6 },
  pagosDespues: { x: 107, y: 1640, ancho: 1200, size: 11.6, interlineado: 1.2 },
}

export const PAGINA_3 = {
  titulo: { x: 130, y: 170, size: 22 },
  texto: { x: 130, y: 270, ancho: 1150, size: 11.6, interlineado: 1.25 },
  link: { x: 130, y: 372, ancho: 1150, size: 10.5 },
  // QR de 35 x 35 mm.
  qr: { x: 130, y: 440, mm: 35 },
  notaQr: { x: 400, y: 470, ancho: 880, size: 11 },
}
