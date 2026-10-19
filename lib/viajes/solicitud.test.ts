import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MENSAJE_SIN_RANGO, procesarSolicitud } from './solicitud'
import { solicitudSchema } from './schema'

// Base, datos y correo simulados: estos tests no tocan Supabase ni Resend.
const { insert, enviarCorreo, getConfig } = vi.hoisted(() => ({ insert: vi.fn(), enviarCorreo: vi.fn(), getConfig: vi.fn() }))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: { from: () => ({ insert: (fila: unknown) => ({ select: () => ({ single: () => insert(fila) }) }) }) },
}))
vi.mock('@/lib/resend', () => ({ resend: { emails: { send: (...a: unknown[]) => enviarCorreo(...a) } } }))
vi.mock('./data', () => ({
  getConfig: () => getConfig(),
  getHotelesConTarifas: async () => [],
  getRutasVuelo: async () => [],
  getGuias: async () => [{ id: 'g1', is_active: true, ciudad: 'Barcelona', pais: 'España', desde_aeropuerto: 'Aerobús', como_moverse: null, donde_quedarse: null, imperdibles: null, tip_parcero: null, comunidad_latina: null }],
}))

const valido = {
  nombre: 'Prueba', email: 'prueba@example.com', celular: '+61 426 779 734', ciudad_salida: 'BNE', pais_latam: 'Colombia',
  fecha_ida: '2026-12-01', fecha_vuelta: '2026-12-20', europa_momento: 'vuelta', adultos: 2, ninos: 0, pasaporte: 'Colombia',
  visa_usa: true, ciudades_europa: ['Barcelona'], sorprendanme: false, dias_europa: 4, estilo: [],
}

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ data: { id: 'sol-1' }, error: null })
  enviarCorreo.mockReset().mockResolvedValue({ error: null })
  getConfig.mockReset().mockResolvedValue({ id: 1, eur_aud: 1.7, margen_pct: 15, traslados_aud_por_persona_ciudad: 40, colchon_rango_pct: 10, actualizado_en: null })
})

describe('procesarSolicitud', () => {
  it('si falla el cálculo, guarda el lead sin rango y responde amable', async () => {
    getConfig.mockRejectedValue(new Error('config caída'))
    const r = await procesarSolicitud(solicitudSchema.parse(valido))
    expect(r).toEqual({ ok: true, solicitud_id: 'sol-1', publico: null, guias: [], mensaje: MENSAJE_SIN_RANGO })
    expect(insert).toHaveBeenCalledOnce()
    expect(insert.mock.calls[0][0]).toMatchObject({ nombre: 'Prueba', rango_min_aud: null, rango_max_aud: null, estado: 'nueva', desglose_interno: { error_calculo: 'config caída' } })
  })

  it('si falla el insert, el correo interno sale igual marcado SIN GUARDAR y con todos los datos', async () => {
    insert.mockResolvedValue({ data: null, error: { message: 'tabla caída' } })
    const r = await procesarSolicitud(solicitudSchema.parse(valido))
    expect(r.solicitud_id).toBeNull()
    expect(enviarCorreo).toHaveBeenCalledTimes(2)
    const interno = enviarCorreo.mock.calls.map((c) => c[0]).find((m) => m.subject.includes('Nuevo lead'))
    expect(interno.subject).toMatch(/^⚠️ SIN GUARDAR — Nuevo lead Dos Vacaciones — Prueba/)
    expect(interno.html).toContain('prueba@example.com')
    expect(interno.html).toContain('+61 426 779 734')
  })

  it('manda el correo al cliente y el interno; si Resend falla, el flujo sigue', async () => {
    enviarCorreo.mockRejectedValue(new Error('resend caído'))
    const r = await procesarSolicitud(solicitudSchema.parse(valido))
    expect(r.ok).toBe(true)
    expect(r.solicitud_id).toBe('sol-1')
    const [cliente, interno] = enviarCorreo.mock.calls.map((c) => c[0])
    expect(cliente).toMatchObject({ to: 'prueba@example.com', subject: 'Tu Euro Trip antes de Latam — ya lo estamos armando ✈️' })
    expect(interno).toMatchObject({ to: 'future@latamvisas.com.au', subject: 'Nuevo lead Dos Vacaciones — Prueba — Barcelona' })
  })

  it('lo que vuelve al cliente no trae desglose ni netas', async () => {
    const r = await procesarSolicitud(solicitudSchema.parse(valido))
    expect(Object.keys(r).sort()).toEqual(['guias', 'ok', 'publico', 'solicitud_id'])
    expect(JSON.stringify(r)).not.toMatch(/desglose|tarifa_|_neta|margen|hotel_|eur_aud/)
    expect(r.guias[0]).not.toHaveProperty('id')
    // En la base sí va el desglose completo.
    expect(insert.mock.calls[0][0].desglose_interno).toHaveProperty('ciudades')
  })
})

describe('solicitudSchema', () => {
  it('nombre, email y celular son obligatorios', () => {
    const r = solicitudSchema.safeParse({ ...valido, nombre: '', email: 'no-es-correo', celular: '' })
    expect(r.success).toBe(false)
    const campos = r.success ? [] : r.error.issues.map((i) => i.path[0])
    expect(campos).toEqual(expect.arrayContaining(['nombre', 'email', 'celular']))
  })

  it.each(['+61 426 779 734', '+57 300-123-4567', '0426 779 734', '+1 (415) 555-0123'])('celular internacional %s es válido', (cel) => {
    expect(solicitudSchema.safeParse({ ...valido, celular: cel }).success).toBe(true)
  })

  it.each(['abc', '+12', '12345', '+57 300 123 4567 8901 234'])('celular %s es inválido', (cel) => {
    expect(solicitudSchema.safeParse({ ...valido, celular: cel }).success).toBe(false)
  })

  it('la vuelta debe ser después de la ida, y sin ciudades hay que marcar sorpréndanme', () => {
    expect(solicitudSchema.safeParse({ ...valido, fecha_vuelta: '2026-11-30' }).success).toBe(false)
    expect(solicitudSchema.safeParse({ ...valido, ciudades_europa: [] }).success).toBe(false)
    expect(solicitudSchema.safeParse({ ...valido, ciudades_europa: [], sorprendanme: true, estilo: ['rumba'] }).success).toBe(true)
  })
})
