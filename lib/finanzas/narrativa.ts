// "Tu análisis": datos que se le pasan al modelo y validación de su respuesta.
// El modelo recibe SOLO esta vista del plan (nunca los extractos) y cada
// número de su respuesta tiene que aparecer en ella; si no, se rechaza.

import { z } from 'zod'
import type { Plan } from './plan'
import { dinero, fechaLarga } from './formato'

const RAZON: Record<Plan['deudas'][number]['razon'], string> = {
  cuotas_con_multa: 'cuotas con multa por atraso',
  compromiso_personal: 'compromiso personal',
  tarjeta_con_interes: 'tarjeta con interés',
  tarjeta_0: 'tarjeta al 0%',
}

// Vista compacta y ya formateada: el modelo copia los textos tal cual.
export function datosNarrativa(plan: Plan) {
  const r = plan.resumen
  return {
    semanas_del_plan: plan.semanas.length,
    hoy: fechaLarga(plan.desde),
    saldo_hoy: dinero(r.saldoInicial),
    cuenta_intocable: r.intocable > 0 ? dinero(r.intocable) : null,
    saldo_minimo: { monto: dinero(r.saldoMinimo.monto), fecha: fechaLarga(r.saldoMinimo.fecha) },
    dia_critico: r.diaCritico ? { fecha: fechaLarga(r.diaCritico.fecha), faltante: dinero(r.diaCritico.faltante) } : null,
    costo_base_semanal: dinero(r.costoBaseSemanal),
    proximas_semanas: plan.semanas.slice(0, 4).map((s) => ({
      semana_del: fechaLarga(s.lunes),
      entra: dinero(s.ingresos),
      sale: dinero(s.pagos + s.costoBase),
      cierra_en: dinero(s.cierre),
      pagos: s.movimientos.filter((m) => m.tipo !== 'ingreso').map((m) => `${m.concepto} ${dinero(m.monto)} (${fechaLarga(m.fecha)})`),
    })),
    alertas: plan.flags.map((f) => {
      switch (f.tipo) {
        case 'dia_corto':
          return {
            tipo: 'día corto',
            fecha: fechaLarga(f.fecha),
            faltan: dinero(f.faltante),
            pagos: f.pagos.map((m) => `${m.concepto} ${dinero(m.monto)}`),
            respaldo: f.respaldo ? `${f.respaldo.cuenta} (intocable)` : null,
          }
        case 'semana_cargada':
          return { tipo: 'semana cargada', semana_del: fechaLarga(f.lunes), pagos: f.pagos.map((m) => `${m.concepto} ${dinero(m.monto)}`), total: dinero(f.total) }
        case 'saldo_negativo':
          return { tipo: 'saldo negativo', semana_del: fechaLarga(f.lunes), cierra_en: dinero(f.cierre) }
        case 'cuota_vencida':
          return { tipo: 'cuota vencida', de: f.concepto, fecha: fechaLarga(f.fecha), monto: dinero(f.monto) }
      }
    }),
    orden_de_deudas: plan.deudas.map((d) => ({
      orden: d.orden,
      deuda: d.acreedor,
      saldo: dinero(d.saldo),
      por_que: RAZON[d.razon],
      proxima_cuota: d.proximaCuota ? `${dinero(d.proximaCuota.monto)} el ${fechaLarga(d.proximaCuota.fecha)}` : null,
    })),
    sugerencias: plan.sugerencias.map((s) =>
      s.tipo === 'alternar_pagos' && s.mover
        ? `Alternar: mover ${s.mover.concepto} a la semana del ${fechaLarga(s.mover.aSemana)}`
        : s.deuda
          ? `Adelantar ${dinero(s.deuda.monto)} a ${s.deuda.acreedor}`
          : '',
    ),
    reservas: plan.reservas.slice(0, 4).map((x) => `${x.concepto}: ${dinero(x.monto)} el ${fechaLarga(x.fecha)}; separar ${dinero(x.porSemana)} por semana durante ${x.semanas} semanas`),
    meta: plan.meta
      ? {
          nombre: plan.meta.nombre,
          monto: dinero(plan.meta.monto),
          separar_por_semana: plan.meta.porSemana != null ? dinero(plan.meta.porSemana) : null,
          alcanza: plan.meta.alcanza,
        }
      : null,
  }
}

// Números en un texto, normalizados: "$1.200,50" -> 1200.5, "19" -> 19.
export function numerosEn(texto: string): number[] {
  const encontrados = texto.match(/\d+(?:[.,]\d+)*/g) || []
  return encontrados.map((t) => {
    // Agrupación es-CO: puntos de miles y coma decimal.
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'))
    if (/^\d+,\d+$/.test(t)) return Number(t.replace(',', '.'))
    return Number(t.replace(/,/g, ''))
  })
}

export const narrativaSchema = z.object({
  esta_semana: z.string().min(1).max(400),
  riesgos: z.array(z.string().min(1).max(300)).min(1).max(4),
  mensajes: z.array(z.object({ para: z.string().min(1).max(80), texto: z.string().min(1).max(600) })).max(3),
  recomendacion: z.string().min(1).max(400),
})
export type Narrativa = z.infer<typeof narrativaSchema>

export function textosDe(n: Narrativa): string[] {
  return [n.esta_semana, ...n.riesgos, ...n.mensajes.flatMap((m) => [m.para, m.texto]), n.recomendacion]
}

// Devuelve los números que el modelo escribió y que NO están en los datos.
export function numerosInventados(n: Narrativa, datos: unknown): number[] {
  const permitidos = new Set(numerosEn(JSON.stringify(datos)).map((x) => x.toFixed(2)))
  return Array.from(new Set(textosDe(n).flatMap(numerosEn))).filter((x) => !permitidos.has(x.toFixed(2)))
}

// Palabras que la copia nunca debe mostrar al usuario.
export function mencionaIA(n: Narrativa): boolean {
  return textosDe(n).some((t) => /\bIA\b|inteligencia artificial|\bAI\b|Claude/i.test(t))
}
