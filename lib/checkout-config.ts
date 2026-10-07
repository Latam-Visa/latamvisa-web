// Configuración centralizada de los checkouts de /agendar/[country].
// Cada país define sus precios base y contenido — la lógica de descuento
// por volumen (10% desde 2 personas, 15% desde 3) vive en cada route.ts
// y se calcula siempre en el servidor, nunca a partir de estos valores
// tal cual lleguen del cliente.

export type CheckoutCountryConfig = {
  // Precio por persona sin traducción de documentos (AUD)
  precioSin: number
  // Precio por persona con traducción incluida (AUD). null = el país no ofrece esa opción.
  precioCon: number | null
  // Si el país tiene el stepper doble (Sin/Con traducción) o uno solo
  traduccion: boolean
  // Título del panel derecho (ej: "Temporary Resident Visa")
  titulo: string
  // Subtítulo / tipo de visa (ej: "Asesoría Visa Canadá")
  subtitulo: string
  currency: 'aud'
  // Items del "Resumen de inclusión"
  bullets: string[]
}

export const CHECKOUT_CONFIG: Record<string, CheckoutCountryConfig> = {
  canada: {
    precioSin: 250,
    precioCon: 290,
    traduccion: true,
    titulo: 'Temporary Resident Visa',
    subtitulo: 'Asesoría Visa Canadá',
    currency: 'aud',
    bullets: [
      'Aplicación profesional',
      'Traducción de documentos incluida',
      'Organización de biométricos',
      'Carta de intención profesional',
      'Soporte personalizado',
    ],
  },
  japon: {
    precioSin: 150,
    precioCon: 190,
    traduccion: true,
    titulo: 'Temporary Visitor Visa',
    subtitulo: 'Asesoría Visa Japón',
    currency: 'aud',
    bullets: [
      'Formulario de aplicación completo',
      'Itinerario detallado del viaje',
      'Carta de propósito',
      'Revisión de soportes financieros',
      'Guía para embajada japonesa',
    ],
  },
  nz: {
    precioSin: 250,
    precioCon: 290,
    traduccion: true,
    titulo: 'Visitor Visa New Zealand',
    subtitulo: 'Asesoría Visa Nueva Zelanda',
    currency: 'aud',
    bullets: [
      'Aplicación completa Visitor Visa',
      'NZeTA si aplica',
      'Itinerario detallado',
      'Soportes financieros revisados',
      'Soporte durante todo el proceso',
    ],
  },
  uk: {
    precioSin: 250,
    precioCon: 290,
    traduccion: true,
    titulo: 'Standard Visitor Visa UK',
    subtitulo: 'Asesoría Visa Reino Unido',
    currency: 'aud',
    bullets: [
      'Formulario de aplicación en línea',
      'Carta de propósito personalizada',
      'Revisión de soportes financieros',
      'Preparación para biométricos',
      'Soporte hasta resolución',
    ],
  },
  usa: {
    precioSin: 190,
    precioCon: null,
    traduccion: false,
    titulo: 'Asesoría Visado USA',
    subtitulo: 'Asesoría Visa USA',
    currency: 'aud',
    bullets: [
      'Evaluación estratégica de perfil',
      'Creación de perfil consular',
      'Llenado completo del formulario DS-160',
      'Guía de pago de aranceles (MRV)',
      'Agendamiento de citas consulares',
      'Sesión de preparación para entrevista',
    ],
  },
}
