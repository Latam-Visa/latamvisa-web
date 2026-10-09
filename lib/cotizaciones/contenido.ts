// Fuente ÚNICA del texto de las cotizaciones, por tipo de visa + destino +
// país de origen. La usan /pagar/[token] (todo el texto), el PDF (lo que no
// viene impreso en los fondos de Canva) y el correo. Así la web y el PDF
// nunca dicen cosas distintas.

import { formatMoney } from '.'

export interface PasoTiempo {
  titulo: string
  detalle: string
}

export interface ContenidoCotizacion {
  // "Propuesta de visa de turismo canadiense"
  titulo: string
  // "Visa de turismo Canadá" (asunto del correo)
  nombreVisa: string
  viabilidad: (tieneVisaUsa: boolean | null) => string
  requisitos: {
    intro: string
    items: (tieneVisaUsa: boolean | null) => string[]
  }
  tiempos: {
    pasos: PasoTiempo[]
    recomendacion: string
  }
  bonos: string[]
  precios: {
    asesoria: string
    traducciones: string
    gobierno: string
    alIniciar: string
    alEnviar: string
    // Nota bajo "Para empezar hoy" (web y PDF).
    pagosDespues: (gobiernoEstimado: number, moneda: string) => string
    tasaDeCambio: string
  }
}

const turismoCanadaColombia: ContenidoCotizacion = {
  titulo: 'Propuesta de visa de turismo canadiense',
  nombreVisa: 'Visa de turismo Canadá',

  viabilidad: (tieneVisaUsa) =>
    tieneVisaUsa
      ? 'Tener visa americana es el mejor punto de partida posible: el oficial canadiense sabe que ya pasaron los filtros de EE. UU., lo que fortalece su solicitud. Colombia no está en la lista de países que pueden entrar solo con eTA, por eso los acompañamos con la solicitud de visa de visitante (turismo), que permite estadías de hasta 6 meses.'
      : 'No tener visa americana no impide aplicar a Canadá. En este caso el oficial se enfoca aún más en la solvencia económica y el arraigo en Colombia, por eso preparamos los soportes con especial cuidado. La visa de visitante (turismo) permite estadías de hasta 6 meses.',

  requisitos: {
    intro: 'Canadá no hace entrevista; el proceso es 100% documental.',
    items: (tieneVisaUsa) => [
      tieneVisaUsa
        ? 'Pasaportes vigentes (con más de 6 meses de vigencia) y copia de la visa americana.'
        : 'Pasaportes vigentes (con más de 6 meses de vigencia).',
      'Formularios IMM 5257 e IMM 5707 (los diligenciamos nosotros con su borrador).',
      'Extractos bancarios de 3 a 6 meses, declaración de renta y comprobantes de ingresos.',
      'Certificados laborales y de propiedades o vehículos.',
      'Itinerario tentativo del viaje.',
    ],
  },

  tiempos: {
    pasos: [
      { titulo: 'Documentos', detalle: '1 a 2 semanas para reunir y revisar todo.' },
      { titulo: 'Radicación y biométricos', detalle: 'Cita en VFS Global (Bogotá, Medellín o Cali). Hay 30 días para asistir.' },
      { titulo: 'Estudio', detalle: 'Unas 4 semanas de referencia (estimado, no garantía).' },
      { titulo: 'Estampado', detalle: 'Se estampa la visa en el pasaporte.' },
    ],
    recomendacion: 'iniciar 2 a 3 meses antes del viaje y no comprar tiquetes antes de la aprobación.',
  },

  bonos: ['Checklist exacta de documentos', 'Plantilla de carta de motivos'],

  precios: {
    asesoria: 'Asesoría LATAM VISA',
    traducciones: 'Traducciones',
    gobierno: 'Derechos del gobierno de Canadá (visa + huellas y foto, estimado)',
    alIniciar: 'Al iniciar',
    alEnviar: 'Al enviar la solicitud',
    pagosDespues: (gobierno, moneda) =>
      `Los pagos a Canadá (${formatMoney(gobierno, moneda)}) se hacen después, cuando enviemos la solicitud.`,
    tasaDeCambio: 'Pueden variar según la tasa de cambio.',
  },
}

const CONTENIDOS: Record<string, ContenidoCotizacion> = {
  'turismo:canada:colombia': turismoCanadaColombia,
}

export function getContenido(tipoVisa: string, paisDestino: string, paisOrigen: string): ContenidoCotizacion | null {
  return CONTENIDOS[`${tipoVisa}:${paisDestino}:${paisOrigen}`] ?? null
}

// Textos fijos de la página pública /pagar/[token].
export const COPY_PAGINA = {
  metaTitulo: 'Tu cotización | LATAM VISA',
  metaDescripcion: 'Revisa tu cotización y paga de forma segura.',
  etiquetaCotizacion: 'Cotización',
  grupo: (personas: number) => `Grupo de ${personas} ${personas === 1 ? 'persona' : 'personas'}`,
  para: 'Para',
  emitida: 'Emitida',
  validaHasta: 'Válida hasta',
  secciones: { viabilidad: 'Viabilidad', requisitos: 'Requisitos', tiempos: 'Tiempos', bonos: 'Bonos incluidos' },
  paso: (n: number) => `Paso ${n}`,
  recomendacion: 'Recomendación:',
  inversion: 'Inversión',
  porPersona: (valor: string) => `${valor} por persona`,
  antes: 'Antes',
  ahorran: (valor: string) => `¡ahorran ${valor}!`,
  total: 'Total',
  valorRealPorPersona: 'Valor real por persona',
  paraEmpezarHoy: 'Para empezar hoy',
  pagar: (monto: string) => `Pagar ${monto}`,
  conectando: 'Conectando checkout seguro…',
  pagoExitosoBadge: 'Pago exitoso',
  graciasPago: '¡Gracias por tu pago!',
  confirmandoPago: 'Lo estamos confirmando. Esta página se actualizará en unos segundos.',
  errorPago: 'No pudimos abrir el pago seguro. Intenta de nuevo en un momento o escríbenos por WhatsApp.',
  pagoRecibido: '¡Pago recibido!',
  contacto: 'Nuestro equipo se pondrá en contacto contigo.',
  noVigente: 'Esta cotización ya no está vigente.',
  noVigenteDetalle: 'Escríbenos y te enviamos una actualizada.',
  whatsappActualizar: (numero: string) => `Hola, quiero actualizar mi cotización ${numero}`,
  escribirWhatsApp: 'Escribir por WhatsApp',
  seguridad: ['Encriptación de grado militar SSL', 'No procesamos números de tarjetas'],
  procesadoPor: 'Procesado seguro por Stripe',
}
