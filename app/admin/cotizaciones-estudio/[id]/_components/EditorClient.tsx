"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  RotateCw, Plus, Trash2, ArrowUp, ArrowDown, Download, MessageCircle, Check, AlertTriangle, Loader2,
} from 'lucide-react'
import {
  calcMatriculaNeta, calcMateriales, calcComisionAud, calcTotal, matriculaParaTotalObjetivo,
  generarPlanElicos, generarPlanVet, planSuma, planParaArrancar, planAcumulado, nextOrden, filaPlanVacia,
  cuandoLabel, mapToQuoteBody, buildWhatsapp, fmtMiles, n,
  ESTADOS_ESTUDIO,
  type CotizacionEstudio, type EstadoEstudio, type PlanPagoRow, type CuandoTipo, type StudentType, type TipoCurso,
} from '@/lib/cotizaciones-estudio'
import { guardarEstudio, eliminarEstudio, type GuardarPayload } from '../../_actions/actions'
import { EstadoBadgeEstudio } from '../../_components/EstadoBadgeEstudio'

type Manual = { materiales: boolean; matricula_neta: boolean; comision_aud: boolean; total: boolean }
const DERIVADOS: (keyof Manual)[] = ['materiales', 'matricula_neta', 'comision_aud', 'total']

function toPayload(c: CotizacionEstudio): GuardarPayload {
  const { id, created_at, updated_at, ...rest } = c
  void id; void created_at; void updated_at
  return rest
}

// Recalcula los derivados que NO han sido tocados a mano.
function derivar(state: CotizacionEstudio, manual: Manual): CotizacionEstudio {
  const next = { ...state }
  if (!manual.matricula_neta) next.matricula_neta = calcMatriculaNeta(next)
  if (!manual.materiales) next.materiales = calcMateriales(next)
  if (!manual.comision_aud) next.comision_aud = calcComisionAud(next)
  if (!manual.total) next.total = calcTotal(next)
  return next
}

export function EditorClient({ inicial }: { inicial: CotizacionEstudio }) {
  const router = useRouter()
  const [c, setC] = useState<CotizacionEstudio>(inicial)
  const [manual, setManual] = useState<Manual>(() => ({
    matricula_neta: inicial.matricula_neta != null && inicial.matricula_neta !== calcMatriculaNeta(inicial),
    materiales: inicial.materiales !== calcMateriales(inicial),
    comision_aud: inicial.comision_aud != null && inicial.comision_aud !== calcComisionAud(inicial),
    total: inicial.total !== calcTotal(inicial),
  }))

  const [guardState, setGuardState] = useState<'idle' | 'guardando' | 'guardado' | 'error'>('idle')
  const [toast, setToast] = useState<string | null>(null)
  const [xWeeks, setXWeeks] = useState<number>(Math.max(1, Math.ceil(n(inicial.semanas_pagas) / 2) || 1))
  const [nWeeks, setNWeeks] = useState<number>(Math.max(1, Math.ceil(n(inicial.semanas_pagas) / 2) || 1))
  const [terms, setTerms] = useState<number>(Math.max(1, Math.round(n(inicial.semanas_enrolment) / 13) || 1))
  const [objetivo, setObjetivo] = useState<number>(n(inicial.total) || 12000)

  // --- Edición de campos -----------------------------------------------------
  const setCampo = useCallback(<K extends keyof CotizacionEstudio>(key: K, value: CotizacionEstudio[K]) => {
    setC((prev) => derivar({ ...prev, [key]: value }, manualRef.current))
  }, [])

  // Un derivado editado a mano: fija su flag y guarda el valor tal cual.
  const setDerivado = useCallback((key: keyof Manual, value: number | null) => {
    setManual((m) => ({ ...m, [key]: true }))
    setC((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetDerivado = useCallback((key: keyof Manual) => {
    setManual((m) => {
      const nm = { ...m, [key]: false }
      setC((prev) => derivar({ ...prev }, nm))
      return nm
    })
  }, [])

  // manualRef para leer el estado actual dentro de setCampo sin recrearlo.
  const manualRef = useRef(manual)
  useEffect(() => { manualRef.current = manual }, [manual])

  // --- Autosave (debounce) ---------------------------------------------------
  const primera = useRef(true)
  useEffect(() => {
    if (primera.current) { primera.current = false; return }
    setGuardState('guardando')
    const t = setTimeout(async () => {
      const res = await guardarEstudio(c.id, toPayload(c))
      setGuardState(res.success ? 'guardado' : 'error')
      if (!res.success && res.error) setToast(res.error)
    }, 900)
    return () => clearTimeout(t)
  }, [c])

  const guardarYa = useCallback(async () => {
    setGuardState('guardando')
    const res = await guardarEstudio(c.id, toPayload(c))
    setGuardState(res.success ? 'guardado' : 'error')
    return res.success
  }, [c])

  // --- Plan de pagos ---------------------------------------------------------
  const suma = planSuma(c.plan_pagos)
  const paraArrancar = planParaArrancar(c.plan_pagos)
  const acumulado = planAcumulado(c.plan_pagos)
  const cuadra = suma === Math.round(n(c.total))
  const descuadre = suma - Math.round(n(c.total))

  const setPlan = (rows: PlanPagoRow[]) => setC((prev) => ({ ...prev, plan_pagos: rows }))
  const setFila = (i: number, patch: Partial<PlanPagoRow>) =>
    setPlan(c.plan_pagos.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addFila = () => setPlan([...c.plan_pagos, filaPlanVacia(nextOrden(c.plan_pagos))])
  const delFila = (i: number) => setPlan(c.plan_pagos.filter((_, idx) => idx !== i))
  const moveFila = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= c.plan_pagos.length) return
    const rows = [...c.plan_pagos]
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
    setPlan(rows.map((r, idx) => ({ ...r, orden: idx + 1 })))
  }

  // --- Estado ----------------------------------------------------------------
  const setEstado = (estado: EstadoEstudio) => {
    if (estado === 'enviada' && !cuadra) {
      setToast('El plan no cuadra con el total: no se puede marcar como enviada.')
      return
    }
    setCampo('estado', estado)
  }

  // --- Acciones de cabecera --------------------------------------------------
  const descargarPDF = async () => {
    const w = window.open('', '_blank')
    const ok = await guardarYa()
    if (w) {
      if (ok) w.location.href = `/admin/cotizaciones-estudio/${c.id}/print`
      else { w.close(); setToast('No pudimos guardar antes de generar el PDF.') }
    }
  }

  const copiarWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsapp(c))
      setToast('Mensaje de WhatsApp copiado ✓')
    } catch {
      setToast('No pudimos copiar; revisa permisos del navegador.')
    }
  }

  const borrar = async () => {
    if (!confirm('¿Eliminar esta cotización? No se puede deshacer.')) return
    const res = await eliminarEstudio(c.id)
    if (res.success) router.push('/admin/cotizaciones-estudio')
    else setToast(res.error || 'No pudimos eliminar.')
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      {/* ================= Formulario ================= */}
      <div className="space-y-6">
        {/* Barra de acciones */}
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#E5E5E5] bg-white p-3">
          <EstadoBadgeEstudio estado={c.estado} />
          <select
            value={c.estado}
            onChange={(e) => setEstado(e.target.value as EstadoEstudio)}
            className="rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-2 text-sm text-[#0A0A0A] focus:border-[#2F4A00] focus:outline-none"
          >
            {ESTADOS_ESTUDIO.map((e) => (
              <option key={e} value={e}>{e[0].toUpperCase() + e.slice(1)}</option>
            ))}
          </select>

          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#6B6B6B]">
            {guardState === 'guardando' && (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando…</>)}
            {guardState === 'guardado' && (<><Check className="h-3.5 w-3.5 text-[#2F4A00]" /> Guardado</>)}
            {guardState === 'error' && (<span className="text-red-600">Error al guardar</span>)}
          </span>

          <button onClick={copiarWhatsapp} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-semibold text-[#0A0A0A] transition-colors hover:border-[#2F4A00]">
            <MessageCircle className="h-4 w-4" /> Copiar WhatsApp
          </button>
          <button onClick={descargarPDF} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#C8FF00] px-3 py-2 text-sm font-bold text-[#2F4A00] transition-colors hover:bg-[#b8ef00]">
            <Download className="h-4 w-4" /> Descargar PDF
          </button>
        </div>

        {/* Cliente */}
        <Seccion titulo="Cliente">
          <Grid>
            <TextField label="Nombre" value={c.nombre} onChange={(v) => setCampo('nombre', v)} />
            <NumField label="Edad" value={c.edad} onChange={(v) => setCampo('edad', v)} />
            <TextField label="País" value={c.pais} onChange={(v) => setCampo('pais', v)} />
            <TextField label="Nivel de inglés" value={c.nivel_ingles} onChange={(v) => setCampo('nivel_ingles', v)} />
            <TextField label="Pasaporte" value={c.pasaporte} onChange={(v) => setCampo('pasaporte', v)} />
            <TextField label="Ciudad de llegada" value={c.ciudad_llegada} onChange={(v) => setCampo('ciudad_llegada', v)} />
            <TextField label="Teléfono" value={c.telefono} onChange={(v) => setCampo('telefono', v)} />
            <TextField label="Email" value={c.email} onChange={(v) => setCampo('email', v)} />
            <SelectField label="Tipo de estudiante" value={c.student_type} onChange={(v) => setCampo('student_type', v as StudentType)} options={[['offshore', 'Offshore'], ['onshore', 'Onshore']]} />
          </Grid>
        </Seccion>

        {/* Curso y promo */}
        <Seccion titulo="Curso y promo">
          <Grid>
            <TextField label="Colegio (código)" value={c.colegio} onChange={(v) => setCampo('colegio', v)} />
            <TextField label="Colegio (nombre completo)" value={c.colegio_nombre_completo} onChange={(v) => setCampo('colegio_nombre_completo', v)} />
            <SelectField label="Tipo" value={c.tipo || ''} onChange={(v) => setCampo('tipo', (v || null) as TipoCurso | null)} options={[['', '—'], ['ELICOS', 'ELICOS'], ['VET', 'VET']]} />
            <TextField label="Curso" value={c.curso} onChange={(v) => setCampo('curso', v)} />
            <TextField label="CRICOS" value={c.cricos} onChange={(v) => setCampo('cricos', v)} />
            <NumField label="Semanas enrolment" value={c.semanas_enrolment} onChange={(v) => setCampo('semanas_enrolment', v)} />
            <NumField label="Semanas pagas" value={c.semanas_pagas} onChange={(v) => setCampo('semanas_pagas', v)} />
            <NumField label="Semanas gratis" value={c.semanas_gratis} onChange={(v) => setCampo('semanas_gratis', v)} />
            <NumField label="Precio/semana neto (AUD)" value={c.precio_semana_neto} onChange={(v) => setCampo('precio_semana_neto', v)} />
            <NumField label="Materiales por semana paga (AUD)" value={c.materiales_por_semana_paga} onChange={(v) => setCampo('materiales_por_semana_paga', v)} />
            <TextField label="Duración (texto)" value={c.duracion_texto} onChange={(v) => setCampo('duracion_texto', v)} placeholder="≈9 meses" />
            <NumField label="Vacaciones (semanas)" value={c.vacaciones_semanas} onChange={(v) => setCampo('vacaciones_semanas', v)} />
            <TextField label="Fecha de inicio" type="date" value={c.fecha_inicio} onChange={(v) => setCampo('fecha_inicio', v || null)} />
          </Grid>
          <div className="mt-4 space-y-3">
            <TextArea label="Promo banner (se muestra al cliente)" value={c.promo_banner} onChange={(v) => setCampo('promo_banner', v)} placeholder="🎁 Promoción incluida: …" />
            <ListaChips label="Extras gratis" items={c.extras_gratis} onChange={(arr) => setCampo('extras_gratis', arr)} />
          </div>
        </Seccion>

        {/* Montos */}
        <Seccion titulo="Montos al cliente (AUD)">
          <Grid>
            <NumField label="Matrícula al cliente" value={c.matricula_cliente} onChange={(v) => setCampo('matricula_cliente', v ?? 0)} />
            <DerivedField label="Materiales" value={c.materiales} manual={manual.materiales} onChange={(v) => setDerivado('materiales', v ?? 0)} onReset={() => resetDerivado('materiales')} />
            <NumField label="Reserva + inscripción" value={c.inscripcion} onChange={(v) => setCampo('inscripcion', v ?? 0)} />
            <NumField label="OSHC" value={c.oshc} onChange={(v) => setCampo('oshc', v ?? 0)} />
            <NumField label="Visa Subclass 500" value={c.visa} onChange={(v) => setCampo('visa', v ?? 0)} />
            <DerivedField label="TOTAL" value={c.total} manual={manual.total} onChange={(v) => setDerivado('total', v ?? 0)} onReset={() => resetDerivado('total')} />
          </Grid>

          <div className="mt-4 flex flex-wrap items-end gap-2.5 rounded-xl bg-[#F7FBED] p-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-xs font-semibold text-[#2F4A00]">Ajustar a total objetivo</label>
              <input
                type="number"
                value={Number.isFinite(objetivo) ? objetivo : ''}
                onChange={(e) => setObjetivo(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D9EFB0] bg-white px-3 py-2 text-sm focus:border-[#2F4A00] focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                const nuevaMat = matriculaParaTotalObjetivo(c, objetivo)
                setManual((m) => ({ ...m, total: true }))
                setC((prev) => ({ ...prev, matricula_cliente: nuevaMat, total: Math.round(n(objetivo)) }))
              }}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2F4A00] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#263c00]"
            >
              Ajustar matrícula
            </button>
          </div>

          <Grid className="mt-4">
            <NumField label="Solvencia (AUD)" value={c.solvencia_aud} onChange={(v) => setCampo('solvencia_aud', v)} />
            <NumField label="Biometría (COP)" value={c.biometria_cop} onChange={(v) => setCampo('biometria_cop', v)} />
            <NumField label="Examen médico (COP)" value={c.medico_cop} onChange={(v) => setCampo('medico_cop', v)} />
          </Grid>
        </Seccion>

        {/* Plan de pagos */}
        <Seccion titulo="Plan de pagos" destacado>
          <div className="flex flex-wrap items-end gap-2.5">
            <SmallNum label="Semanas CoE (X)" value={xWeeks} onChange={setXWeeks} />
            <SmallNum label="Última cuota: semana (N)" value={nWeeks} onChange={setNWeeks} />
            <button onClick={() => setPlan(generarPlanElicos(c, xWeeks, nWeeks))} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#C8FF00] px-3 py-2 text-sm font-bold text-[#2F4A00] hover:bg-[#b8ef00]">
              Generar plan ELICOS
            </button>
            <SmallNum label="Terms" value={terms} onChange={setTerms} />
            <button onClick={() => setPlan(generarPlanVet(c, terms))} className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-bold text-[#2F4A00] hover:border-[#2F4A00]">
              Generar plan VET
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {c.plan_pagos.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#E5E5E5] p-4 text-center text-sm text-[#6B6B6B]">
                Aún no hay cuotas. Genera un plan o agrega filas.
              </p>
            )}
            {c.plan_pagos.map((r, i) => (
              <FilaPlan
                key={i}
                row={r}
                index={i}
                total={c.plan_pagos.length}
                acumulado={acumulado[i]}
                preview={cuandoLabel(r, c.fecha_inicio)}
                onChange={(patch) => setFila(i, patch)}
                onUp={() => moveFila(i, -1)}
                onDown={() => moveFila(i, 1)}
                onDelete={() => delFila(i)}
              />
            ))}
          </div>

          <button onClick={addFila} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-semibold text-[#0A0A0A] hover:border-[#2F4A00]">
            <Plus className="h-4 w-4" /> Agregar cuota
          </button>

          {/* Resumen del plan */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResumenBox etiqueta="Para arrancar necesitas" valor={paraArrancar} tono="neon" />
            <ResumenBox etiqueta="Suma del plan" valor={suma} tono={cuadra ? 'ok' : 'warn'} />
            <ResumenBox etiqueta="Total cotización" valor={Math.round(n(c.total))} tono="plain" />
          </div>
          {!cuadra && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-[#FEF2F2] p-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              El plan {descuadre > 0 ? 'se pasa' : 'queda corto'} por AUD {fmtMiles(Math.abs(descuadre))}. No se puede marcar como “enviada” hasta que cuadre con el total.
            </div>
          )}
        </Seccion>

        {/* Interno */}
        <Seccion titulo="Interno (nunca sale al PDF ni al WhatsApp)" tono="interno">
          <Grid>
            <DerivedField label="Matrícula neta" value={c.matricula_neta} manual={manual.matricula_neta} onChange={(v) => setDerivado('matricula_neta', v)} onReset={() => resetDerivado('matricula_neta')} />
            <NumField label="Comisión (%)" value={c.comision_pct == null ? null : c.comision_pct * 100} onChange={(v) => setCampo('comision_pct', v == null ? null : v / 100)} placeholder="ej. 30" />
            <DerivedField label="Comisión (AUD)" value={c.comision_aud} manual={manual.comision_aud} onChange={(v) => setDerivado('comision_aud', v)} onReset={() => resetDerivado('comision_aud')} />
          </Grid>
          <div className="mt-3">
            <TextArea label="Notas internas" value={c.notas_internas} onChange={(v) => setCampo('notas_internas', v)} />
          </div>
        </Seccion>

        <button onClick={borrar} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-[#FEF2F2]">
          <Trash2 className="h-4 w-4" /> Eliminar cotización
        </button>
      </div>

      {/* ================= Vista previa en vivo ================= */}
      <div className="lg:sticky lg:top-20 lg:h-fit">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Vista previa</p>
        <VistaPrevia cotizacion={c} />
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#0d2b0d] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Vista previa: iframe con el HTML real de /api/quote-html, escalado al ancho.
// ============================================================================
function VistaPrevia({ cotizacion }: { cotizacion: CotizacionEstudio }) {
  const [html, setHtml] = useState<string>('')
  const [cargando, setCargando] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  const bodyKey = useMemo(() => JSON.stringify(mapToQuoteBody(cotizacion)), [cotizacion])

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/quote-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyKey,
        })
        const txt = await res.text()
        if (!cancelado) setHtml(txt)
      } catch {
        /* preview es best-effort */
      } finally {
        if (!cancelado) setCargando(false)
      }
    }, 700)
    return () => { cancelado = true; clearTimeout(t) }
  }, [bodyKey])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1123))
    ro.observe(el)
    setScale(el.clientWidth / 1123)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#f7faf2]" style={{ height: 794 * scale }}>
      {cargando && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-[#6B6B6B] shadow">
          <Loader2 className="h-3 w-3 animate-spin" /> actualizando
        </div>
      )}
      <iframe
        title="Vista previa de la cotización"
        srcDoc={html}
        sandbox="allow-same-origin"
        className="origin-top-left border-0 bg-white"
        style={{ width: 1123, height: 794, transform: `scale(${scale})` }}
      />
    </div>
  )
}

// ============================================================================
// Fila del plan de pagos
// ============================================================================
function FilaPlan({
  row, index, total, acumulado, preview, onChange, onUp, onDown, onDelete,
}: {
  row: PlanPagoRow; index: number; total: number; acumulado: number; preview: string
  onChange: (patch: Partial<PlanPagoRow>) => void
  onUp: () => void; onDown: () => void; onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-3">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="w-full sm:w-[150px]">
          <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Cuándo</label>
          <select
            value={row.cuando_tipo}
            onChange={(e) => onChange({ cuando_tipo: e.target.value as CuandoTipo })}
            className="w-full rounded-lg border border-[#E5E5E5] bg-white px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none"
          >
            <option value="dia_relativo">Día relativo</option>
            <option value="fecha">Fecha exacta</option>
            <option value="semana_curso">Semana de clases</option>
          </select>
        </div>

        {row.cuando_tipo === 'dia_relativo' && (
          <div className="w-[90px]">
            <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Día</label>
            <input type="number" value={row.dias ?? ''} onChange={(e) => onChange({ dias: e.target.value === '' ? null : Number(e.target.value) })} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
          </div>
        )}
        {row.cuando_tipo === 'fecha' && (
          <div className="w-[160px]">
            <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Fecha</label>
            <input type="date" value={row.fecha ?? ''} onChange={(e) => onChange({ fecha: e.target.value || null })} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
          </div>
        )}
        {row.cuando_tipo === 'semana_curso' && (
          <div className="w-[110px]">
            <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Semana</label>
            <input type="number" value={row.semana ?? ''} onChange={(e) => onChange({ semana: e.target.value === '' ? null : Number(e.target.value) })} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
          </div>
        )}

        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Concepto</label>
          <input value={row.concepto} onChange={(e) => onChange({ concepto: e.target.value })} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
        </div>

        <div className="w-[120px]">
          <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">Monto (AUD)</label>
          <input type="number" value={row.monto ?? ''} onChange={(e) => onChange({ monto: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onUp} disabled={index === 0} aria-label="Subir" className="rounded-lg border border-[#E5E5E5] p-2 text-[#6B6B6B] disabled:opacity-30 hover:enabled:border-[#2F4A00]"><ArrowUp className="h-4 w-4" /></button>
          <button onClick={onDown} disabled={index === total - 1} aria-label="Bajar" className="rounded-lg border border-[#E5E5E5] p-2 text-[#6B6B6B] disabled:opacity-30 hover:enabled:border-[#2F4A00]"><ArrowDown className="h-4 w-4" /></button>
          <button onClick={onDelete} aria-label="Eliminar" className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-[#FEF2F2]"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#6B6B6B]">
        <span>Cliente verá: <b className="text-[#2F4A00]">{preview || '—'}</b></span>
        <span>Acumulado: AUD {fmtMiles(acumulado)}</span>
        <label className="ml-auto inline-flex items-center gap-1.5">
          <input type="checkbox" checked={row.por_confirmar} onChange={(e) => onChange({ por_confirmar: e.target.checked })} className="accent-[#2F4A00]" />
          Por confirmar (interno)
        </label>
      </div>
    </div>
  )
}

// ============================================================================
// Helpers de UI
// ============================================================================
function Seccion({ titulo, children, destacado, tono }: { titulo: string; children: React.ReactNode; destacado?: boolean; tono?: 'interno' }) {
  return (
    <section className={`rounded-2xl border bg-white p-5 ${destacado ? 'border-[#D9EFB0]' : 'border-[#E5E5E5]'}`}>
      <h3 className={`mb-4 font-[PPMonumentExtended] text-sm ${tono === 'interno' ? 'text-[#92400E]' : 'text-[#0d2b0d]'}`}>{titulo}</h3>
      {children}
    </section>
  )
}

function Grid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`}>{children}</div>
}

const labelCls = 'mb-1 block text-xs font-semibold text-[#2F4A00]'
const inputCls = 'w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#2F4A00] focus:outline-none'

function TextField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </div>
  )
}

function NumField({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} placeholder={placeholder} className={inputCls} />
    </div>
  )
}

function DerivedField({ label, value, manual, onChange, onReset }: { label: string; value: number | null; manual: boolean; onChange: (v: number | null) => void; onReset: () => void }) {
  return (
    <div>
      <label className={labelCls}>
        {label}{' '}
        <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${manual ? 'bg-[#FFFBEB] text-[#92400E]' : 'bg-[#F2FBDD] text-[#2F4A00]'}`}>{manual ? 'manual' : 'auto'}</span>
      </label>
      <div className="flex items-center gap-1.5">
        <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className={inputCls} />
        <button onClick={onReset} title="Recalcular" aria-label={`Recalcular ${label}`} className="shrink-0 rounded-lg border border-[#E5E5E5] p-2 text-[#2F4A00] hover:border-[#2F4A00]">
          <RotateCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
      </select>
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={`${inputCls} resize-y`} />
    </div>
  )
}

function SmallNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="w-[130px]">
      <label className="mb-1 block text-[11px] font-semibold text-[#6B6B6B]">{label}</label>
      <input type="number" value={Number.isFinite(value) ? value : ''} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-lg border border-[#E5E5E5] px-2 py-2 text-sm focus:border-[#2F4A00] focus:outline-none" />
    </div>
  )
}

function ListaChips({ label, items, onChange }: { label: string; items: string[]; onChange: (arr: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft('')
  }
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#F2FBDD] px-3 py-1 text-xs font-semibold text-[#2F4A00]">
            {it}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label={`Quitar ${it}`} className="text-[#2F4A00]/60 hover:text-[#2F4A00]">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} placeholder="Agregar extra gratis…" className={inputCls} />
        <button onClick={add} className="shrink-0 rounded-lg border border-[#E5E5E5] px-3 text-sm font-semibold text-[#2F4A00] hover:border-[#2F4A00]">Añadir</button>
      </div>
    </div>
  )
}

function ResumenBox({ etiqueta, valor, tono }: { etiqueta: string; valor: number; tono: 'neon' | 'ok' | 'warn' | 'plain' }) {
  const clase =
    tono === 'neon' ? 'bg-[#C8FF00] text-[#2F4A00] border-[#C8FF00]'
      : tono === 'ok' ? 'bg-[#F2FBDD] text-[#2F4A00] border-[#D9EFB0]'
        : tono === 'warn' ? 'bg-[#FEF2F2] text-[#B91C1C] border-red-200'
          : 'bg-white text-[#0d2b0d] border-[#E5E5E5]'
  return (
    <div className={`rounded-xl border p-3 ${clase}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{etiqueta}</p>
      <p className="mt-0.5 font-[PPMonumentExtended] text-lg">AUD {fmtMiles(valor)}</p>
    </div>
  )
}
