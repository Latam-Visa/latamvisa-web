import { describe, expect, it } from 'vitest'
import { construirCorreoActivacion } from './portal'
import { estadoEnPalabras, esTokenValido, mensajeErrorAuth, rutaSegura } from '@/lib/portal/textos'

const TOKEN = 'a'.repeat(64)

describe('construirCorreoActivacion', () => {
  const { asunto, html } = construirCorreoActivacion({
    nombre: 'MARÍA fernanda López',
    pais: 'Japón',
    link: `https://www.latamvisatravel.com/activar/${TOKEN}`,
  })

  it('lleva el link de activación y el país', () => {
    expect(html).toContain(`https://www.latamvisatravel.com/activar/${TOKEN}`)
    expect(html).toContain('Japón')
    expect(asunto).toMatch(/pago/i)
  })

  it('saluda con el primer nombre', () => {
    expect(html).toContain('Hola, María')
  })

  it('no usa fondos negros', () => {
    expect(html).not.toMatch(/background-color:\s*#(000|050505|111111|0A0A0A)/i)
  })

  it('escapa el nombre', () => {
    const { html } = construirCorreoActivacion({ nombre: '<script>x</script>', pais: 'USA', link: 'https://x' })
    expect(html).not.toContain('<script>')
  })
})

describe('textos del portal', () => {
  it('estado en palabras, nunca el valor interno', () => {
    expect(estadoEnPalabras('activa')).toBe('Falta llenar tu formulario')
    expect(estadoEnPalabras('raro')).toBe('En proceso')
  })

  it('token: solo 64 hex', () => {
    expect(esTokenValido(TOKEN)).toBe(true)
    expect(esTokenValido('abc')).toBe(false)
    expect(esTokenValido(`${TOKEN.slice(1)}z`)).toBe(false)
  })

  it.each([
    [null, '/mi-cuenta'],
    ['/activar/x/completar', '/activar/x/completar'],
    ['https://malo.com', '/mi-cuenta'],
    ['//malo.com', '/mi-cuenta'],
    ['/\\malo.com', '/mi-cuenta'],
  ])('rutaSegura(%s) → %s', (entrada, esperado) => {
    expect(rutaSegura(entrada)).toBe(esperado)
  })

  it('errores de Supabase en español', () => {
    expect(mensajeErrorAuth({ code: 'invalid_credentials' })).toMatch(/no coinciden/)
    expect(mensajeErrorAuth({ code: 'algo_nuevo', status: 500 })).not.toMatch(/algo_nuevo/)
  })
})
