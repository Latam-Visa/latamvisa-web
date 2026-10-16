import { describe, expect, it } from 'vitest'
import { categoriaPorTexto, normalizar, resolverCarpeta } from './categorias'
import { CARPETAS_AUSTRALIA } from '@/lib/traducciones/shared'

const [TRAVEL, NATIONAL_ID, FINANCIAL, TOURISM, FAMILY, OTHER] = CARPETAS_AUSTRALIA

describe('categoriaPorTexto', () => {
  it('Income_Tax_Return_Clara_Gonzalez_2025.pdf → financial', () => {
    expect(categoriaPorTexto('Income_Tax_Return_Clara_Gonzalez_2025.pdf')).toBe(FINANCIAL)
  })

  it.each([
    'RENTA 2025 CLARA EUGENIA GONZALEZ.pdf',
    'declaración de renta',
    'Extracto bancario Bancolombia',
    'extracto bancario',
    'Bank_Statement_Francia_Arbelaez_2025_12_to_2026_06.pdf',
    'bank statement',
    'certificado de ingresos y retenciones',
    'desprendible',
    'Desprendible de nómina marzo',
    'CDT Bancolombia',
    'certificado de tradición y libertad',
    'Certificado de tradicion',
    'Pension_Retirement_Certificate_Francia_Arbelaez_2026_07.pdf',
    'Colpensiones',
    'Property_Sale_Deed_Francia_Arbelaez_2016_03.pdf',
    'payslip',
    'employment letter',
    'certificado laboral',
  ])('%s → financial', (texto) => {
    expect(categoriaPorTexto(texto)).toBe(FINANCIAL)
  })

  it.each(['pasaporte', 'passport', 'Passport_Francia_Arbelaez_2025_03.pdf', 'PASAPORTE Juan.pdf'])(
    '%s → travel document',
    (texto) => expect(categoriaPorTexto(texto)).toBe(TRAVEL),
  )

  it.each(['cédula', 'CEDULA de ciudadania', 'National_ID_Francia_Arbelaez.pdf', 'identity card'])(
    '%s → national identity',
    (texto) => expect(categoriaPorTexto(texto)).toBe(NATIONAL_ID),
  )

  it.each(['registro civil', 'Registro Civil de Nacimiento', 'birth certificate', 'marriage certificate'])(
    '%s → family register',
    (texto) => expect(categoriaPorTexto(texto)).toBe(FAMILY),
  )

  it.each(['itinerary', 'Flight booking Avianca', 'reserva hotel'])('%s → tourism', (texto) => {
    expect(categoriaPorTexto(texto)).toBe(TOURISM)
  })

  it.each(['USA_Tourist_Visa_Estrella_Rodriguez_2025_02.pdf', 'Others_06.pdf'])('%s → other documents', (texto) => {
    expect(categoriaPorTexto(texto)).toBe(OTHER)
  })

  it.each(['c5ab703d-9e9f-4287-b3e2-3568e225254b.pdf', 'scan0001.pdf', 'IMG_2231.jpg', '', null])(
    '%s → sin clasificar (null)',
    (texto) => expect(categoriaPorTexto(texto)).toBeNull(),
  )

  it('no confunde palabras que solo empiezan igual', () => {
    expect(categoriaPorTexto('rentabilidad fondo')).toBeNull()
    expect(categoriaPorTexto('rental agreement')).toBeNull()
  })

  it('ignora tildes y mayúsculas', () => {
    expect(normalizar('DECLARACIÓN_de-Renta.PDF')).toBe('declaracion de renta pdf')
    expect(categoriaPorTexto('DECLARACIÓN DE RENTA')).toBe(FINANCIAL)
    expect(categoriaPorTexto('declaracion de renta')).toBe(FINANCIAL)
    expect(categoriaPorTexto('CéDuLa')).toBe(NATIONAL_ID)
    expect(categoriaPorTexto('PaSaPoRtE')).toBe(TRAVEL)
  })
})

describe('resolverCarpeta', () => {
  const clara = {
    pais: 'australia',
    nombre_archivo: 'Income_Tax_Return_Clara_Gonzalez_2025.pdf',
    nombre_original: 'RENTA 2025 CLARA EUGENIA GONZALEZ.pdf',
    carpeta: null,
  }

  it('la fila real de Clara (carpeta NULL) cae en financial por mapeo', () => {
    expect(resolverCarpeta(clara)).toEqual({ carpeta: FINANCIAL, origen: 'mapeo' })
  })

  it('carpeta_manual siempre gana sobre n8n y sobre el mapeo', () => {
    expect(resolverCarpeta({ ...clara, carpeta: TRAVEL, carpeta_manual: OTHER })).toEqual({
      carpeta: OTHER,
      origen: 'manual',
    })
    expect(resolverCarpeta({ ...clara, carpeta_manual: FAMILY })).toEqual({ carpeta: FAMILY, origen: 'manual' })
  })

  it('una carpeta válida de n8n gana sobre el mapeo', () => {
    expect(resolverCarpeta({ ...clara, carpeta: TOURISM })).toEqual({ carpeta: TOURISM, origen: 'n8n' })
  })

  it('una carpeta rara de n8n o un manual inválido no se usan: decide el mapeo', () => {
    expect(resolverCarpeta({ ...clara, carpeta: 'Evidence of finances', carpeta_manual: 'cualquier cosa' })).toEqual({
      carpeta: FINANCIAL,
      origen: 'mapeo',
    })
  })

  it('si nombre_archivo no dice nada, prueba con nombre_original', () => {
    expect(resolverCarpeta({ pais: 'australia', nombre_archivo: 'doc_001.pdf', nombre_original: 'Pasaporte Juan.pdf' }))
      .toEqual({ carpeta: TRAVEL, origen: 'mapeo' })
  })

  it('sin ninguna coincidencia queda sin clasificar', () => {
    expect(resolverCarpeta({ pais: 'australia', nombre_archivo: 'scan0001.pdf', nombre_original: 'IMG_2231.jpg' }))
      .toEqual({ carpeta: null, origen: null })
  })

  it('países sin carpetas no se tocan', () => {
    expect(resolverCarpeta({ pais: 'canada', nombre_archivo: 'Passport_X.pdf' })).toEqual({ carpeta: null, origen: null })
  })

  it('usa el país por defecto cuando la fila no lo trae', () => {
    expect(resolverCarpeta({ nombre_archivo: 'Passport_X.pdf' }, 'australia').carpeta).toBe(TRAVEL)
  })
})
