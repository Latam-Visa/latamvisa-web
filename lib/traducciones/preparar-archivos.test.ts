import { describe, expect, it } from 'vitest'
import { prepararArchivo, separarTanda, sha256Hex, type ArchivoPreparado } from './preparar-archivos'

const pdf = (texto: string, prefijo = '') =>
  new File([prefijo + '%PDF-1.4\n' + texto + '\n%%EOF'], 'x.pdf', { type: 'application/pdf' })

const prep = (nombre: string, hash: string): ArchivoPreparado => ({
  archivo: new File(['x'], nombre),
  nombre,
  bytes: 1,
  hash,
})

describe('sha256Hex', () => {
  it('da el hash hex conocido', async () => {
    const buf = new TextEncoder().encode('abc').buffer as ArrayBuffer
    expect(await sha256Hex(buf)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('prepararArchivo', () => {
  it('el mismo contenido con distinto nombre da el mismo hash', async () => {
    const a = await prepararArchivo(new File([await pdf('extracto').arrayBuffer()], 'extracto julio.pdf', { type: 'application/pdf' }))
    const b = await prepararArchivo(new File([await pdf('extracto').arrayBuffer()], 'CamScanner-12-10-26.pdf', { type: 'application/pdf' }))
    expect(a.hash).toBe(b.hash)
    expect(a.nombre).not.toBe(b.nombre)
  })

  it('hashea el archivo saneado: basura antes de %PDF no cambia el hash', async () => {
    const limpio = await prepararArchivo(pdf('cedula'))
    const conBasura = await prepararArchivo(pdf('cedula', '﻿\r\n\r\n'))
    expect(conBasura.hash).toBe(limpio.hash)
    expect(conBasura.bytes).toBe(limpio.bytes)
    expect(new TextDecoder().decode(await conBasura.archivo.arrayBuffer()).startsWith('%PDF')).toBe(true)
  })

  it('contenido distinto da hash distinto', async () => {
    expect((await prepararArchivo(pdf('a'))).hash).not.toBe((await prepararArchivo(pdf('b'))).hash)
  })
})

describe('separarTanda', () => {
  it('lote nuevo: todo entra como nuevo', () => {
    const r = separarTanda([prep('a.pdf', 'h1'), prep('b.pdf', 'h2')], [], new Map())
    expect(r.nuevos.map((x) => x.nombre)).toEqual(['a.pdf', 'b.pdf'])
    expect(r.omitidos).toEqual([])
  })

  it('el mismo archivo dos veces en la misma tanda se sube una vez', () => {
    const r = separarTanda([prep('a.pdf', 'h1'), prep('a (copia).pdf', 'h1')], [], new Map())
    expect(r.nuevos).toHaveLength(1)
    expect(r.omitidos).toEqual([{ nombre: 'a (copia).pdf', bytes: 1, hash: 'h1', motivo: 'tanda' }])
  })

  it('lo que ya está en la lista de la pantalla no se repite', () => {
    const r = separarTanda([prep('a.pdf', 'h1')], ['h1'], new Map())
    expect(r.nuevos).toHaveLength(0)
    expect(r.omitidos[0].motivo).toBe('tanda')
  })

  it('5 archivos, 2 ya estaban en el lote (renombrados): 3 nuevos, 2 omitidos con su nombre anterior', () => {
    const enLote = new Map([['h1', 'extracto_cuenta julio.pdf'], ['h2', 'Cedula de ciudadania.pdf']])
    const r = separarTanda(
      [prep('CamScanner-1.pdf', 'h1'), prep('Cedula.pdf', 'h2'), prep('n1.pdf', 'h3'), prep('n2.pdf', 'h4'), prep('n3.pdf', 'h5')],
      [],
      enLote,
    )
    expect(r.nuevos.map((x) => x.hash)).toEqual(['h3', 'h4', 'h5'])
    expect(r.omitidos).toEqual([
      { nombre: 'CamScanner-1.pdf', bytes: 1, hash: 'h1', motivo: 'lote', nombreAnterior: 'extracto_cuenta julio.pdf' },
      { nombre: 'Cedula.pdf', bytes: 1, hash: 'h2', motivo: 'lote', nombreAnterior: 'Cedula de ciudadania.pdf' },
    ])
  })

  it('solo repetidos: no queda nada nuevo', () => {
    const r = separarTanda([prep('a.pdf', 'h1')], [], new Map([['h1', 'a.pdf']]))
    expect(r.nuevos).toHaveLength(0)
    expect(r.omitidos).toHaveLength(1)
  })
})
