import { describe, expect, it } from 'vitest'
import { construirCorreoPagoAdmin, formatearMonto, normalizarTelefonoWa, nombrePais } from './pago-admin'

describe('normalizarTelefonoWa', () => {
  it.each([
    // Australia
    ['+61 426 779 734', '61426779734'],
    ['+61426779734', '61426779734'],
    ['0426 779 734', '61426779734'],
    ['0426-779-734', '61426779734'],
    ['(04) 2677 9734', '61426779734'],
    // Colombia
    ['+57 300 123 4567', '573001234567'],
    ['+57-300-123-4567', '573001234567'],
    ['0057 300 123 4567', '573001234567'],
    // Estados Unidos
    ['+1 (415) 555-0123', '14155550123'],
    ['+1 415.555.0123', '14155550123'],
  ])('%s → %s', (entrada, esperado) => {
    expect(normalizarTelefonoWa(entrada)).toBe(esperado)
  })

  it.each([null, undefined, '', '   ', 'sin número', '+12', '+1234567890123456'])('%s → null', (entrada) => {
    expect(normalizarTelefonoWa(entrada as any)).toBeNull()
  })
})

describe('formatearMonto', () => {
  it('usa la moneda real de la sesión', () => {
    expect(formatearMonto(19000, 'aud')).toBe('$190.00 AUD')
    expect(formatearMonto(19000, 'usd')).toBe('$190.00 USD')
    expect(formatearMonto(123456, 'aud')).toBe('$1,234.56 AUD')
  })

  it('respeta monedas sin decimales', () => {
    expect(formatearMonto(15000, 'jpy')).toBe('$15,000 JPY')
  })

  it('no revienta sin monto', () => {
    expect(formatearMonto(null, 'aud')).toBe('$0.00 AUD')
  })
})

describe('construirCorreoPagoAdmin', () => {
  const base = {
    sessionId: 'cs_live_test_123',
    paymentIntentId: 'pi_123',
    nombre: 'Hernandez Gutierrez',
    email: 'cliente@example.com',
    montoTotal: 19000,
    moneda: 'aud',
    destino: 'usa',
    metadata: {
      destino: 'usa',
      aplicantes: '1',
      precio_original: '190',
      descuento_aplicado: '0',
      porcentaje_descuento: '0',
      total_pagado: '190',
    },
  }

  it('arma el asunto con país, monto, moneda y nombre', () => {
    expect(construirCorreoPagoAdmin(base).asunto).toBe('Nuevo pago USA — $190.00 AUD · Hernandez Gutierrez')
  })

  it('con teléfono: botón de WhatsApp con número normalizado y saludo con el nombre', () => {
    const { html } = construirCorreoPagoAdmin({ ...base, telefono: '+61 426 779 734' })
    expect(html).toContain('https://wa.me/61426779734?text=')
    expect(html).toContain(encodeURIComponent('Hola Hernandez,'))
    expect(html).not.toContain('Sin teléfono')
  })

  it('sin teléfono: no hay botón de WhatsApp, sí el aviso con mailto', () => {
    const { html } = construirCorreoPagoAdmin({ ...base, telefono: null })
    expect(html).not.toContain('wa.me')
    expect(html).toContain('Sin teléfono — responder por email')
    expect(html).toContain('mailto:cliente@example.com')
  })

  it('teléfono inválido se trata como sin teléfono', () => {
    const { html } = construirCorreoPagoAdmin({ ...base, telefono: '123' })
    expect(html).not.toContain('wa.me')
    expect(html).toContain('Sin teléfono')
  })

  it('muestra la metadata real y no muestra Edad ni [object Object]', () => {
    const { html } = construirCorreoPagoAdmin(base)
    expect(html).toContain('Aplicantes')
    expect(html).toContain('190 AUD')
    expect(html).toContain('Sin descuento')
    expect(html).not.toContain('Edad')
    expect(html).not.toContain('[object Object]')
  })

  it('descuento con porcentaje', () => {
    const { html } = construirCorreoPagoAdmin({
      ...base,
      metadata: { ...base.metadata, aplicantes: '2', precio_original: '380', descuento_aplicado: '38', porcentaje_descuento: '10' },
    })
    expect(html).toContain('38 AUD (10%)')
  })

  it('los botones llevan texto blanco y nunca fondo negro', () => {
    const { html } = construirCorreoPagoAdmin({ ...base, telefono: '+61426779734' })
    const botones = html.match(/<a [^>]*display:inline-block[^>]*>/g) || []
    expect(botones.length).toBeGreaterThan(0)
    for (const b of botones) {
      expect(b).toContain('color:#FFFFFF')
      expect(b).not.toMatch(/background:#(000|000000|050505|0A0A0A|111111|1A1A1A)\b/i)
    }
  })

  it('escapa el nombre del cliente', () => {
    const { html } = construirCorreoPagoAdmin({ ...base, nombre: '<script>x</script>' })
    expect(html).not.toContain('<script>x</script>')
  })

  it('país desconocido o vacío no rompe', () => {
    expect(nombrePais('usa')).toBe('USA')
    expect(nombrePais(null)).toBe('Sin destino')
    expect(nombrePais('marte')).toBe('marte')
  })
})
