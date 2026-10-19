import { describe, expect, it } from 'vitest'
import { hashEnLista, resumenCarga, siguientesASubir, type EstadoCarga, type ItemCarga } from './cola-carga'

const item = (key: string, estado: EstadoCarga, hash?: string): ItemCarga => ({ key, nombre: `${key}.pdf`, bytes: 1, estado, hash, progreso: 0 })

describe('siguientesASubir', () => {
  it('30 en cola: arrancan solo 3', () => {
    const items = Array.from({ length: 30 }, (_, i) => item(`f${i}`, 'en_cola'))
    expect(siguientesASubir(items)).toEqual(['f0', 'f1', 'f2'])
  })

  it('con 2 subiendo queda 1 cupo, en orden de llegada', () => {
    const items = [item('a', 'subiendo'), item('b', 'subiendo'), item('c', 'cargado'), item('d', 'en_cola'), item('e', 'en_cola')]
    expect(siguientesASubir(items)).toEqual(['d'])
  })

  it('cupos llenos: no arranca nada', () => {
    expect(siguientesASubir([item('a', 'subiendo'), item('b', 'subiendo'), item('c', 'subiendo'), item('d', 'en_cola')])).toEqual([])
  })

  it('un error no ocupa cupo ni bloquea a los demás', () => {
    expect(siguientesASubir([item('a', 'error'), item('b', 'en_cola')])).toEqual(['b'])
  })

  it('los que todavía se revisan no se suben', () => {
    expect(siguientesASubir([item('a', 'revisando'), item('b', 'en_cola')])).toEqual(['b'])
  })
})

describe('hashEnLista', () => {
  it('detecta el mismo contenido en otro archivo de la lista', () => {
    expect(hashEnLista([item('a', 'cargado', 'h1'), item('b', 'revisando', 'h1')], 'h1', 'b')).toBe('a.pdf')
  })

  it('ignora el propio archivo, los repetidos y los errores', () => {
    const items = [item('a', 'repetido', 'h1'), item('b', 'error', 'h1'), item('c', 'revisando', 'h1')]
    expect(hashEnLista(items, 'h1', 'c')).toBeNull()
  })
})

describe('resumenCarga', () => {
  it('cuenta solo los cargados de verdad; repetidos y errores no suman', () => {
    const items = [
      item('a', 'cargado'), item('b', 'cargado'), item('c', 'cargado'), item('d', 'cargado'),
      item('e', 'subiendo'), item('f', 'en_cola'),
      item('g', 'repetido'), item('h', 'error'),
    ]
    expect(resumenCarga(items)).toEqual({ cargados: 4, enCurso: 2, total: 6 })
  })

  it('sin nada cargado', () => {
    expect(resumenCarga([item('a', 'repetido')])).toEqual({ cargados: 0, enCurso: 0, total: 0 })
  })
})
