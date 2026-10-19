import { describe, expect, it } from 'vitest'
import { calcularCotizacion } from '@/lib/viajes/cotizador'
import type { HotelConTarifas } from '@/lib/viajes/types'
import { NOTA_RANGO, correoCliente, correoInterno, fechaCorta, type DatosLead } from './dos-vacaciones'

const lead: DatosLead = {
  solicitud_id: 'sol-1', guardado: true, nombre: 'Ana <b>Pérez</b>', email: 'ana@example.com', celular: '+61 426 779 734',
  ciudad_salida: 'BNE', pais_latam: 'Colombia', fecha_ida: '2026-12-01', fecha_vuelta: '2026-12-05', europa_momento: 'vuelta',
  adultos: 2, ninos: 1, pasaporte: 'Colombia', visa_usa: true, ciudades_europa: ['Barcelona'], sorprendanme: false, dias_europa: 4, estilo: ['rumba'],
}
const hotel: HotelConTarifas = {
  id: 'h', chain_id: null, name: 'Acta Sant Just', city: 'Barcelona', country: 'España', neighborhood: null, tagline: null, description: null,
  perk: null, hero_image: null, gallery: null, booking_url: null, price_from: null, currency: null, sort_order: null, is_active: true, created_at: '',
  chain: { id: 'c', name: 'Acta Hotels', slug: '' }, fechas_cerradas: [],
  tarifas: [{ id: 't', property_id: 'h', temporada: 'dic-feb', fecha_inicio: '2026-12-01', fecha_fin: '2027-02-28', tarifa_neta: 87, moneda: 'EUR', noches_min: 1, noches_max: null, ocupacion: 3, desayuno_incluido: true, impuesto_ciudad_incluido: false, tipo_tarifa: 'neta', notas: null, created_at: '' }],
}
const cot = calcularCotizacion({ ...lead, ciudad_salida: 'BNE' }, { config: { id: 1, eur_aud: 1.7, margen_pct: 15, traslados_aud_por_persona_ciudad: 40, colchon_rango_pct: 10, actualizado_en: null }, hoteles: [hotel], rutas: [] })

const botones = (html: string) => html.match(/<a [^>]*display:inline-block[^>]*>/g) || []

describe('correo al cliente', () => {
  const { asunto, html } = correoCliente(lead, cot.publico)

  it('asunto, saludo, resumen, rango y nota', () => {
    expect(asunto).toBe('Tu Euro Trip antes de Latam — ya lo estamos armando ✈️')
    expect(html).toContain('¡Hola, Ana!')
    expect(html).toContain('Barcelona (4 noches)')
    expect(html).toContain('2 adultos y 1 niño')
    expect(html).toContain(`${fechaCorta('2026-12-01')} – ${fechaCorta('2026-12-05')}`)
    expect(html).toContain(`$${cot.publico.rango_min_aud} AUD – $${cot.publico.rango_max_aud.toLocaleString('en-US')} AUD`)
    expect(html).toContain(NOTA_RANGO)
  })

  it('botón de WhatsApp a wa.me/61426779734, con texto blanco y sin fondo negro', () => {
    expect(html).toContain('https://wa.me/61426779734?text=')
    for (const b of botones(html)) {
      expect(b).toContain('color:#FFFFFF')
      expect(b).not.toMatch(/background:#(000|000000|050505|0A0A0A|111|111111|1A1A1A)\b/i)
    }
  })

  it('no lleva tarifas netas, hoteles ni el desglose', () => {
    expect(html).not.toMatch(/\bActa\b|\b87\b|\bnetas?\b|margen|eur_aud/i)
  })

  it('escapa los datos del usuario', () => {
    expect(html).not.toContain('<b>Pérez</b>')
  })

  it('sin rango: mensaje de 24 horas, sin cifras', () => {
    const sinRango = correoCliente(lead, null).html
    expect(sinRango).toContain('Tu cotización exacta te llega en las próximas 24 horas.')
    expect(sinRango).not.toContain('AUD')
  })
})

describe('correo interno', () => {
  it('asunto con nombre y ciudades; trae netas, hotel, conversión, margen y vuelos', () => {
    const { asunto, html } = correoInterno({ ...lead, nombre: 'Ana Pérez' }, cot.publico, cot.interno)
    expect(asunto).toBe('Nuevo lead Dos Vacaciones — Ana Pérez — Barcelona')
    for (const t of ['Acta Sant Just', '87 EUR/noche', 'tasa EUR→AUD 1.7', 'Con margen 15 %', 'por_confirmar', 'ana@example.com', '+61 426 779 734', 'Vuelos por confirmar']) {
      expect(html).toContain(t)
    }
  })

  it('sin cálculo: lo dice y trae los datos del lead', () => {
    const { html } = correoInterno(lead, null, null, 'config caída')
    expect(html).toContain('No se pudo calcular el rango: config caída')
    expect(html).toContain('ana@example.com')
  })
})
