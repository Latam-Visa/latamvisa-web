// lib/destinos.ts

export type DestinoSlug =
  | 'turismo-usa'
  | 'turismo-australia'
  | 'turismo-canada'
  | 'turismo-japon'
  | 'turismo-nz'
  | 'turismo-uk';

export interface DestinoConfig {
  slug: DestinoSlug;
  pais: string;
  paisCorto: string;
  bandera: string;
  codigo: string;
  visaType: string;
  visaTypeFull: string;
  tieneTraduccion: boolean;
  precios: {
    sinTraduccion: {
      monto: number;
      priceId: string;
    };
    conTraduccion?: {
      monto: number;
      priceId: string;
    };
  };
  currency: 'AUD' | 'USD';
  currencySymbol: string;
  duracionEstimada: string;
  incluye: string[];
  procesoPasos: string[];
  descripcionCorta: string;
  notaImportante?: string;
  colores: {
    primarySecondary: string;
    primarySecondaryRgb: string;
    bulletColor: string;
    bulletShadow: string;
    badgeBg: string;
    badgeBorder: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

export const DESTINOS: Record<DestinoSlug, DestinoConfig> = {
  'turismo-usa': {
    slug: 'turismo-usa',
    pais: 'Estados Unidos',
    paisCorto: 'USA',
    bandera: '🇺🇸',
    codigo: 'USA',
    visaType: 'B1/B2',
    visaTypeFull: 'Visa de Turismo B1/B2',
    tieneTraduccion: false,
    precios: {
      sinTraduccion: {
        monto: 190,
        priceId: 'price_1TPDKNJ9ezpBcyYb3x9Hob5B', // USA - verificar si está en AUD
      },
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '2-4 semanas',
    incluye: [
      'Llenado completo del formulario DS-160',
      'Agendamiento de cita consular',
      'Preparación detallada para entrevista',
      'Soporte personalizado vía WhatsApp',
      'Revisión de documentos de soporte',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Envío de cuestionario de información',
      'Llenado del DS-160 por nuestro equipo',
      'Agendamiento de cita en embajada',
      'Sesión de preparación para entrevista',
    ],
    descripcionCorta: 'Tramita tu visa de turismo a Estados Unidos con la guía profesional de LATAM VISA.',
    notaImportante: 'USA no requiere traducciones de documentos. El proceso es 100% digital con entrevista presencial.',
    colores: {
      primarySecondary: '#E0162B',
      primarySecondaryRgb: '224,22,43',
      bulletColor: '#E0162B',
      bulletShadow: '0_0_4px_rgba(224,22,43,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-[#3C3B6E]/15',
      gradientTo: 'to-[#B22234]/20',
    },
  },

  'turismo-australia': {
    slug: 'turismo-australia',
    pais: 'Australia',
    paisCorto: 'Australia',
    bandera: '🇦🇺',
    codigo: 'AUS',
    visaType: 'Subclass 600',
    visaTypeFull: 'Visitor Visa Subclass 600',
    tieneTraduccion: true,
    precios: {
      sinTraduccion: {
        monto: 250,
        priceId: 'price_1TQd8QJ9ezpBcyYbWD74OnCT',
      },
      conTraduccion: {
        monto: 290,
        priceId: 'price_1TQdAAJ9ezpBcyYbGWrzdGvP',
      },
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '4-8 semanas',
    incluye: [
      'Aplicación completa Subclass 600',
      'Carta de invitación y soporte familiar',
      'Revisión de soportes financieros',
      'Preparación de documentos requeridos',
      'Soporte durante todo el proceso',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Recolección de documentos del aplicante',
      'Preparación de carta de invitación',
      'Aplicación oficial en ImmiAccount',
      'Seguimiento hasta resolución',
    ],
    descripcionCorta: 'Trae a tu familia a Australia con una visa de turismo bien preparada.',
    colores: {
      primarySecondary: '#012169',
      primarySecondaryRgb: '1,33,105',
      bulletColor: '#012169',
      bulletShadow: '0_0_4px_rgba(1,33,105,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-[#012169]/20',
      gradientTo: 'to-[#E4002B]/15',
    },
  },

  'turismo-canada': {
    slug: 'turismo-canada',
    pais: 'Canadá',
    paisCorto: 'Canadá',
    bandera: '🇨🇦',
    codigo: 'CAN',
    visaType: 'TRV',
    visaTypeFull: 'Temporary Resident Visa (TRV)',
    tieneTraduccion: false,
    precios: {
      sinTraduccion: {
        monto: 290,
        priceId: 'price_1TQdBmJ9ezpBcyYbYSWQwrM3',
      }
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '4-12 semanas',
    incluye: [
      'Formulario IMM 5257 completo',
      'Carta de propósito personalizada',
      'Revisión de soportes financieros',
      'Preparación para biométricos',
      'Soporte hasta resolución',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Recolección de documentos',
      'Preparación de IMM 5257',
      'Aplicación en línea IRCC',
      'Agendamiento de biométricos',
    ],
    descripcionCorta: 'Visita Canadá con tu visa de turismo profesionalmente preparada.',
    colores: {
      primarySecondary: '#D52B1E',
      primarySecondaryRgb: '213,43,30',
      bulletColor: '#D52B1E',
      bulletShadow: '0_0_4px_rgba(213,43,30,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-white/70',
      gradientTo: 'to-[#D52B1E]/25',
    },
  },

  'turismo-japon': {
    slug: 'turismo-japon',
    pais: 'Japón',
    paisCorto: 'Japón',
    bandera: '🇯🇵',
    codigo: 'JPN',
    visaType: 'Temporary Visitor',
    visaTypeFull: 'Temporary Visitor Visa',
    tieneTraduccion: true,
    precios: {
      sinTraduccion: {
        monto: 150,
        priceId: 'price_1TQdDDJ9ezpBcyYbXGm8dnbE',
      },
      conTraduccion: {
        monto: 190,
        priceId: 'price_1TQdDYJ9ezpBcyYbk0EF8rku',
      },
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '5-7 días hábiles',
    incluye: [
      'Formulario de aplicación completo',
      'Itinerario detallado del viaje',
      'Carta de propósito',
      'Revisión de soportes financieros',
      'Guía para embajada japonesa',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Recolección de información de viaje',
      'Preparación del itinerario',
      'Llenado del formulario',
      'Cita en embajada de Japón',
    ],
    descripcionCorta: 'Descubre Japón con tu visa de turismo bien tramitada y aprobada.',
    colores: {
      primarySecondary: '#BC002D',
      primarySecondaryRgb: '188,0,45',
      bulletColor: '#BC002D',
      bulletShadow: '0_0_4px_rgba(188,0,45,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-white/70',
      gradientTo: 'to-[#BC002D]/20',
    },
  },

  'turismo-nz': {
    slug: 'turismo-nz',
    pais: 'Nueva Zelanda',
    paisCorto: 'NZ',
    bandera: '🇳🇿',
    codigo: 'NZL',
    visaType: 'Visitor Visa',
    visaTypeFull: 'Visitor Visa New Zealand',
    tieneTraduccion: true,
    precios: {
      sinTraduccion: {
        monto: 250,
        priceId: 'price_1TQdEBJ9ezpBcyYbE6CymGNz',
      },
      conTraduccion: {
        monto: 290,
        priceId: 'price_1TQdEwJ9ezpBcyYbQOhNVHDN',
      },
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '3-6 semanas',
    incluye: [
      'Aplicación completa Visitor Visa',
      'NZeTA si aplica',
      'Itinerario detallado',
      'Soportes financieros revisados',
      'Soporte durante todo el proceso',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Recolección de documentos',
      'Verificación NZeTA o Visitor Visa',
      'Aplicación en línea Immigration NZ',
      'Seguimiento hasta aprobación',
    ],
    descripcionCorta: 'Visita Nueva Zelanda con tu visa de turismo correctamente tramitada.',
    colores: {
      primarySecondary: '#00247D',
      primarySecondaryRgb: '0,36,125',
      bulletColor: '#CC142B',
      bulletShadow: '0_0_4px_rgba(204,20,43,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-[#00247D]/20',
      gradientTo: 'to-[#CC142B]/20',
    },
  },

  'turismo-uk': {
    slug: 'turismo-uk',
    pais: 'Reino Unido',
    paisCorto: 'UK',
    bandera: '🇬🇧',
    codigo: 'GBR',
    visaType: 'Standard Visitor',
    visaTypeFull: 'Standard Visitor Visa UK',
    tieneTraduccion: true,
    precios: {
      sinTraduccion: {
        monto: 250,
        priceId: 'price_1TQdFyJ9ezpBcyYb8LOFImAq',
      },
      conTraduccion: {
        monto: 290,
        priceId: 'price_1TQdGKJ9ezpBcyYb9TVMWZ8i',
      },
    },
    currency: 'AUD',
    currencySymbol: 'A$',
    duracionEstimada: '3-8 semanas',
    incluye: [
      'Formulario de aplicación en línea',
      'Carta de propósito personalizada',
      'Revisión de soportes financieros',
      'Preparación para biométricos',
      'Soporte hasta resolución',
    ],
    procesoPasos: [
      'Pago confirmado y bienvenida',
      'Recolección de documentos',
      'Preparación de aplicación',
      'Aplicación oficial UKVI',
      'Agendamiento de biométricos',
    ],
    descripcionCorta: 'Visita el Reino Unido con tu Standard Visitor Visa profesionalmente tramitada.',
    colores: {
      primarySecondary: '#012169',
      primarySecondaryRgb: '1,33,105',
      bulletColor: '#C8102E',
      bulletShadow: '0_0_4px_rgba(200,16,46,0.3)',
      badgeBg: 'bg-[#C8FF00]/20',
      badgeBorder: 'border-[#5B6A00]/30',
      gradientFrom: 'from-[#012169]/20',
      gradientTo: 'to-[#C8102E]/20',
    },
  },
};

// Helpers útiles para usar en componentes
export function getDestino(slug: string): DestinoConfig | null {
  return DESTINOS[slug as DestinoSlug] || null;
}

export function getAllDestinos(): DestinoConfig[] {
  return Object.values(DESTINOS);
}

export function formatPrecio(monto: number, currencySymbol: string = 'A$'): string {
  return `${currencySymbol}${monto.toLocaleString('en-AU')}`;
}
