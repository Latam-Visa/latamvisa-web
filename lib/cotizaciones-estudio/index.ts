// Lógica pura (sin React, sin servidor) de las Cotizaciones de VISA DE
// ESTUDIANTE (Subclass 500). Se usa en el cliente (editor/preview) y en el
// servidor (print → /api/quote-html). Nada de aquí toca Supabase ni el DOM.

import { isUuid } from '@/lib/cotizaciones'
export { isUuid }

export type EstadoEstudio = 'borrador' | 'enviada' | 'aceptada' | 'perdida'
export type StudentType = 'offshore' | 'onshore'
export type TipoCurso = 'ELICOS' | 'VET'
export type CuandoTipo = 'dia_relativo' | 'fecha' | 'semana_curso'

export const ESTADOS_ESTUDIO: EstadoEstudio[] = ['borrador', 'enviada', 'aceptada', 'perdida']

export interface PlanPagoRow {
  orden: number
  cuando_tipo: CuandoTipo
  dias: number | null
  fecha: string | null // 'YYYY-MM-DD'
  semana: number | null
  concepto: string
  monto: number
  por_confirmar: boolean
}

export interface CotizacionEstudio {
  id: string
  created_at: string
  updated_at: string
  estado: EstadoEstudio
  // Cliente
  nombre: string
  edad: number | null
  pais: string | null
  nivel_ingles: string | null
  pasaporte: string | null
  ciudad_llegada: string | null
  telefono: string | null
  email: string | null
  student_type: StudentType
  // Curso
  colegio: string | null
  colegio_nombre_completo: string | null
  tipo: TipoCurso | null
  curso: string | null
  cricos: string | null
  semanas_enrolment: number | null
  semanas_pagas: number | null
  semanas_gratis: number | null
  precio_semana_neto: number | null
  materiales_por_semana_paga: number | null
  duracion_texto: string | null
  vacaciones_semanas: number | null
  fecha_inicio: string | null
  // Promo
  promo_banner: string | null
  extras_gratis: string[]
  // Montos al cliente (AUD)
  matricula_cliente: number
  materiales: number
  inscripcion: number
  oshc: number
  visa: number
  total: number
  // Interno (nunca al cliente)
  matricula_neta: number | null
  comision_pct: number | null
  comision_aud: number | null
  notas_internas: string | null
  // Solvencia / costos locales
  solvencia_aud: number | null
  biometria_cop: number | null
  medico_cop: number | null
  // Plan
  plan_pagos: PlanPagoRow[]
}

// ---------------------------------------------------------------------------
// Utilidades numéricas y de formato
// ---------------------------------------------------------------------------
export function n(v: unknown): number {
  const x = typeof v === 'string' ? Number(v) : (v as number)
  return Number.isFinite(x) ? (x as number) : 0
}

/** Miles con punto, estilo LATAM (12000 → "12.000"). Sin decimales. */
export function fmtMiles(v: unknown): string {
  return Math.round(n(v)).toLocaleString('de-DE')
}

export function fmtAUD(v: unknown): string {
  return `AUD ${fmtMiles(v)}`
}

/** "lun 7 dic 2026" a partir de un ISO 'YYYY-MM-DD'. */
export function formatFechaEs(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  const s = new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
  return s.replace(/\./g, '').replace(/,/g, '')
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + Math.round(days))
  return d.toISOString().slice(0, 10)
}

export function addWeeksISO(iso: string, weeks: number): string {
  return addDaysISO(iso, Math.round(weeks) * 7)
}

// ---------------------------------------------------------------------------
// Cálculos (todos "sugeridos"; en el editor se pueden sobreescribir a mano)
// ---------------------------------------------------------------------------
export function calcMatriculaNeta(c: Pick<CotizacionEstudio, 'semanas_pagas' | 'precio_semana_neto'>): number {
  return Math.round(n(c.semanas_pagas) * n(c.precio_semana_neto))
}

export function calcMateriales(c: Pick<CotizacionEstudio, 'semanas_pagas' | 'materiales_por_semana_paga'>): number {
  return Math.round(n(c.semanas_pagas) * n(c.materiales_por_semana_paga))
}

/** La comisión va sobre el valor de las semanas (neto), no sobre materiales. */
export function calcComisionAud(c: Pick<CotizacionEstudio, 'matricula_neta' | 'comision_pct'>): number {
  return Math.round(n(c.matricula_neta) * n(c.comision_pct))
}

export function calcTotal(c: Pick<CotizacionEstudio, 'matricula_cliente' | 'materiales' | 'inscripcion' | 'oshc' | 'visa'>): number {
  return Math.round(n(c.matricula_cliente) + n(c.materiales) + n(c.inscripcion) + n(c.oshc) + n(c.visa))
}

/** Ajustar la matrícula para cuadrar a un total objetivo (ej. 12.000). */
export function matriculaParaTotalObjetivo(
  c: Pick<CotizacionEstudio, 'materiales' | 'inscripcion' | 'oshc' | 'visa'>,
  objetivo: number,
): number {
  return Math.round(n(objetivo) - (n(c.materiales) + n(c.inscripcion) + n(c.oshc) + n(c.visa)))
}

// ---------------------------------------------------------------------------
// Plan de pagos
// ---------------------------------------------------------------------------
export function planSuma(rows: PlanPagoRow[]): number {
  return Math.round((rows || []).reduce((s, r) => s + n(r.monto), 0))
}

/** Lo que se paga ANTES de viajar = las cuotas "dia_relativo" (Día 0/15/20…). */
export function planParaArrancar(rows: PlanPagoRow[]): number {
  return Math.round((rows || []).filter((r) => r.cuando_tipo === 'dia_relativo').reduce((s, r) => s + n(r.monto), 0))
}

/** Acumulado corrido por cuota (mismo orden del array). */
export function planAcumulado(rows: PlanPagoRow[]): number[] {
  let acc = 0
  return (rows || []).map((r) => {
    acc += n(r.monto)
    return Math.round(acc)
  })
}

export function nextOrden(rows: PlanPagoRow[]): number {
  return (rows || []).reduce((m, r) => Math.max(m, n(r.orden)), 0) + 1
}

export function filaPlanVacia(orden: number): PlanPagoRow {
  return {
    orden,
    cuando_tipo: 'dia_relativo',
    dias: 0,
    fecha: null,
    semana: null,
    concepto: '',
    monto: 0,
    por_confirmar: false,
  }
}

/**
 * Plan ELICOS por defecto:
 *  Día 0  → reserva + inscripción
 *  Día 15 → X semanas (matrícula proporcional) + materiales → CoE
 *  Día 20 → OSHC + Visa 500
 *  Ya en Australia → semanas restantes; fecha real si hay fecha_inicio,
 *                    si no "semana N de clases" (por confirmar).
 * X = semanas para el CoE (default mitad del curso hacia arriba).
 * N = semana del curso en que cae la última cuota (default = X).
 */
export function generarPlanElicos(c: CotizacionEstudio, X?: number, N?: number): PlanPagoRow[] {
  const pagas = n(c.semanas_pagas)
  const xWeeks = Math.min(Math.max(1, Math.round(X || Math.ceil(pagas / 2) || 1)), Math.max(1, pagas))
  const nWeeks = Math.max(1, Math.round(N || xWeeks))
  const matricula = n(c.matricula_cliente)
  const matX = pagas > 0 ? Math.round((matricula * xWeeks) / pagas) : 0
  const resto = matricula - matX
  const restoSemanas = Math.max(0, pagas - xWeeks)

  const rows: PlanPagoRow[] = [
    { orden: 1, cuando_tipo: 'dia_relativo', dias: 0, fecha: null, semana: null, concepto: 'Reserva de cupo + inscripción', monto: n(c.inscripcion), por_confirmar: false },
    { orden: 2, cuando_tipo: 'dia_relativo', dias: 15, fecha: null, semana: null, concepto: `${xWeeks} semanas + materiales → se emite tu CoE`, monto: matX + n(c.materiales), por_confirmar: false },
    { orden: 3, cuando_tipo: 'dia_relativo', dias: 20, fecha: null, semana: null, concepto: 'OSHC + Visa 500 (con CoE)', monto: n(c.oshc) + n(c.visa), por_confirmar: false },
  ]

  if (c.fecha_inicio) {
    rows.push({ orden: 4, cuando_tipo: 'fecha', dias: null, fecha: addWeeksISO(c.fecha_inicio, nWeeks), semana: null, concepto: `${restoSemanas} semanas restantes (ya en Australia)`, monto: resto, por_confirmar: false })
  } else {
    rows.push({ orden: 4, cuando_tipo: 'semana_curso', dias: null, fecha: null, semana: nWeeks, concepto: `${restoSemanas} semanas restantes (ya en Australia)`, monto: resto, por_confirmar: true })
  }
  return rows
}

/**
 * Plan VET: cuotas por term pagadas por adelantado (4 terms/año, ~13 semanas).
 * El primer term va al Día 15 (para el CoE); el resto, ya en Australia.
 */
export function generarPlanVet(c: CotizacionEstudio, nTerms?: number): PlanPagoRow[] {
  const enrol = n(c.semanas_enrolment) || n(c.semanas_pagas)
  const terms = Math.max(1, Math.round(nTerms || Math.max(1, Math.round(enrol / 13))))
  const matricula = n(c.matricula_cliente)
  const perTerm = Math.round(matricula / terms)

  const rows: PlanPagoRow[] = [
    { orden: 1, cuando_tipo: 'dia_relativo', dias: 0, fecha: null, semana: null, concepto: 'Reserva de cupo + inscripción', monto: n(c.inscripcion), por_confirmar: false },
    { orden: 2, cuando_tipo: 'dia_relativo', dias: 15, fecha: null, semana: null, concepto: `Term 1 + materiales → se emite tu CoE`, monto: perTerm + n(c.materiales), por_confirmar: false },
    { orden: 3, cuando_tipo: 'dia_relativo', dias: 20, fecha: null, semana: null, concepto: 'OSHC + Visa 500 (con CoE)', monto: n(c.oshc) + n(c.visa), por_confirmar: false },
  ]

  let orden = 4
  for (let k = 2; k <= terms; k++) {
    const esUltimo = k === terms
    const monto = esUltimo ? matricula - perTerm * (terms - 1) : perTerm
    const offsetSemanas = (k - 1) * 13
    if (c.fecha_inicio) {
      rows.push({ orden, cuando_tipo: 'fecha', dias: null, fecha: addWeeksISO(c.fecha_inicio, offsetSemanas), semana: null, concepto: `Term ${k} (pago por adelantado)`, monto, por_confirmar: false })
    } else {
      rows.push({ orden, cuando_tipo: 'semana_curso', dias: null, fecha: null, semana: offsetSemanas, concepto: `Term ${k} (pago por adelantado)`, monto, por_confirmar: true })
    }
    orden++
  }
  return rows
}

/** Texto de "cuándo" de cara al cliente. NUNCA incluye marca de por_confirmar. */
export function cuandoLabel(row: PlanPagoRow, fechaInicio: string | null): string {
  if (row.cuando_tipo === 'fecha' && row.fecha) return formatFechaEs(row.fecha)
  if (row.cuando_tipo === 'semana_curso') {
    if (fechaInicio) return formatFechaEs(addWeeksISO(fechaInicio, n(row.semana)))
    return `Semana ${n(row.semana)} de clases`
  }
  // dia_relativo
  const d = n(row.dias)
  return d === 0 ? 'Día 0' : `Día ${d}`
}

// ---------------------------------------------------------------------------
// Mapeo al body que ya acepta /api/quote-html (mismo PDF, sin duplicar diseño)
// ---------------------------------------------------------------------------
export interface QuoteBody {
  profile: { nombre: string; edad: number | string; pais: string; nivelIngles: string; pasaporte: string; ciudadLlegada: string }
  studentType: StudentType
  opciones: Array<{
    label: string
    stages: Array<{ tag: string; name: string; cricos: string | null; duration: string; extra: string }>
    promoBanner?: string
    extrasGratis?: string[]
    planPagosCustom?: Array<{ cuando: string; concepto: string; monto: number }>
    cotizacion: {
      blockA: { tuition: number; material: number; enrolment: number; oshcTotal: number; visaTotal: number; subtotalAUD: number }
      blockB?: { subtotalAUD: number }
      localCostsCOP?: { biometrics: number; medical: number }
    }
  }>
}

export function mapToQuoteBody(c: CotizacionEstudio): QuoteBody {
  const curso = c.curso || (c.tipo === 'VET' ? 'Vocacional' : 'Inglés General')
  const label = `VISA SUBCLASS 500 · ${curso.toUpperCase()}`

  const extra = [
    c.semanas_enrolment != null ? `${c.semanas_enrolment} semanas` : null,
    c.semanas_pagas != null && c.semanas_gratis != null ? `(${c.semanas_pagas} pagas · ${c.semanas_gratis} gratis)` : null,
    c.vacaciones_semanas ? `${c.vacaciones_semanas} de vacaciones` : null,
  ].filter(Boolean).join(' · ')

  const planOrdenado = [...(c.plan_pagos || [])].sort((a, b) => n(a.orden) - n(b.orden))

  const localCostsCOP =
    c.student_type === 'offshore' && (n(c.biometria_cop) > 0 || n(c.medico_cop) > 0)
      ? { biometrics: n(c.biometria_cop), medical: n(c.medico_cop) }
      : undefined

  return {
    profile: {
      nombre: c.nombre || 'Estudiante',
      edad: c.edad ?? '',
      pais: c.pais || 'LATAM',
      nivelIngles: c.nivel_ingles || 'No especificado',
      pasaporte: c.pasaporte || 'No especificado',
      ciudadLlegada: c.ciudad_llegada || 'Australia',
    },
    studentType: c.student_type,
    opciones: [
      {
        label,
        stages: [
          {
            tag: c.tipo || 'ELICOS',
            name: curso,
            cricos: c.cricos || null,
            duration: c.duracion_texto || '',
            extra,
          },
        ],
        promoBanner: c.promo_banner || undefined,
        extrasGratis: (c.extras_gratis || []).filter(Boolean),
        planPagosCustom: planOrdenado.map((r) => ({
          cuando: cuandoLabel(r, c.fecha_inicio),
          concepto: r.concepto,
          monto: n(r.monto),
        })),
        cotizacion: {
          blockA: {
            tuition: n(c.matricula_cliente),
            material: n(c.materiales),
            enrolment: n(c.inscripcion),
            oshcTotal: n(c.oshc),
            visaTotal: n(c.visa),
            subtotalAUD: n(c.total),
          },
          blockB: n(c.solvencia_aud) > 0 ? { subtotalAUD: n(c.solvencia_aud) } : undefined,
          localCostsCOP,
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Mensaje de WhatsApp (español colombiano, cercano, usando "tú").
// Nunca incluye datos internos (neto, comisión, notas).
// ---------------------------------------------------------------------------
export function buildWhatsapp(c: CotizacionEstudio): string {
  const primer = (c.nombre || '').trim().split(/\s+/)[0] || ''
  const saludo = primer ? `¡Hola ${primer}! 😊` : '¡Hola! 😊'
  const planOrdenado = [...(c.plan_pagos || [])].sort((a, b) => n(a.orden) - n(b.orden))

  const lineas: string[] = []
  lineas.push(`${saludo} Te paso el resumen de tu plan de estudio en Australia 🇦🇺`)
  if (c.promo_banner) lineas.push('', c.promo_banner)
  lineas.push('', 'Plan de pagos:')
  for (const r of planOrdenado) {
    lineas.push(`• ${cuandoLabel(r, c.fecha_inicio)} — ${r.concepto}: AUD ${fmtMiles(r.monto)}`)
  }
  lineas.push('')
  lineas.push(`Para arrancar necesitas: AUD ${fmtMiles(planParaArrancar(c.plan_pagos))}`)
  lineas.push(`Total del plan: AUD ${fmtMiles(c.total)}`)
  lineas.push('', 'Cualquier duda me escribes y lo ajustamos. 🙌')
  return lineas.join('\n')
}

// ---------------------------------------------------------------------------
// Normalización desde Supabase (numeric llega como number, arrays pueden venir
// null). Deja el objeto listo para el editor.
// ---------------------------------------------------------------------------
function normRow(r: Partial<PlanPagoRow>, i: number): PlanPagoRow {
  return {
    orden: r.orden != null ? n(r.orden) : i + 1,
    cuando_tipo: (r.cuando_tipo as CuandoTipo) || 'dia_relativo',
    dias: r.dias == null ? null : n(r.dias),
    fecha: r.fecha || null,
    semana: r.semana == null ? null : n(r.semana),
    concepto: r.concepto || '',
    monto: n(r.monto),
    por_confirmar: Boolean(r.por_confirmar),
  }
}

export function normalizarEstudio(row: Record<string, unknown>): CotizacionEstudio {
  const planRaw = Array.isArray(row.plan_pagos) ? (row.plan_pagos as Partial<PlanPagoRow>[]) : []
  return {
    id: String(row.id),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    estado: (row.estado as EstadoEstudio) || 'borrador',
    nombre: (row.nombre as string) || '',
    edad: row.edad == null ? null : n(row.edad),
    pais: (row.pais as string) ?? null,
    nivel_ingles: (row.nivel_ingles as string) ?? null,
    pasaporte: (row.pasaporte as string) ?? null,
    ciudad_llegada: (row.ciudad_llegada as string) ?? null,
    telefono: (row.telefono as string) ?? null,
    email: (row.email as string) ?? null,
    student_type: (row.student_type as StudentType) || 'offshore',
    colegio: (row.colegio as string) ?? null,
    colegio_nombre_completo: (row.colegio_nombre_completo as string) ?? null,
    tipo: (row.tipo as TipoCurso) ?? null,
    curso: (row.curso as string) ?? null,
    cricos: (row.cricos as string) ?? null,
    semanas_enrolment: row.semanas_enrolment == null ? null : n(row.semanas_enrolment),
    semanas_pagas: row.semanas_pagas == null ? null : n(row.semanas_pagas),
    semanas_gratis: row.semanas_gratis == null ? null : n(row.semanas_gratis),
    precio_semana_neto: row.precio_semana_neto == null ? null : n(row.precio_semana_neto),
    materiales_por_semana_paga: row.materiales_por_semana_paga == null ? null : n(row.materiales_por_semana_paga),
    duracion_texto: (row.duracion_texto as string) ?? null,
    vacaciones_semanas: row.vacaciones_semanas == null ? null : n(row.vacaciones_semanas),
    fecha_inicio: (row.fecha_inicio as string) ?? null,
    promo_banner: (row.promo_banner as string) ?? null,
    extras_gratis: Array.isArray(row.extras_gratis) ? (row.extras_gratis as string[]) : [],
    matricula_cliente: n(row.matricula_cliente),
    materiales: n(row.materiales),
    inscripcion: n(row.inscripcion),
    oshc: n(row.oshc),
    visa: n(row.visa),
    total: n(row.total),
    matricula_neta: row.matricula_neta == null ? null : n(row.matricula_neta),
    comision_pct: row.comision_pct == null ? null : n(row.comision_pct),
    comision_aud: row.comision_aud == null ? null : n(row.comision_aud),
    notas_internas: (row.notas_internas as string) ?? null,
    solvencia_aud: row.solvencia_aud == null ? null : n(row.solvencia_aud),
    biometria_cop: row.biometria_cop == null ? null : n(row.biometria_cop),
    medico_cop: row.medico_cop == null ? null : n(row.medico_cop),
    plan_pagos: planRaw.map(normRow),
  }
}

/** Validación para poder marcar "enviada": el plan debe cuadrar con el total. */
export function planCuadra(c: Pick<CotizacionEstudio, 'plan_pagos' | 'total'>): boolean {
  return planSuma(c.plan_pagos) === Math.round(n(c.total))
}
