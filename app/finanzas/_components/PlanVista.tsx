'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, Copy, Settings, Upload } from 'lucide-react'
import { dinero, fechaCorta, fechaLarga } from '@/lib/finanzas/formato'
import type { Plan } from '@/lib/finanzas/plan'
import type { Narrativa } from '@/lib/finanzas/narrativa'
import { generarNarrativa } from '../actions'
import { btnSecundario, foco, tarjeta, titulo } from './ui'

const RAZON: Record<Plan['deudas'][number]['razon'], string> = {
  cuotas_con_multa: 'Tiene multa si te atrasas',
  compromiso_personal: 'Compromiso personal',
  tarjeta_con_interes: 'Tarjeta con interés',
  tarjeta_0: 'Tarjeta al 0%: va de última',
}

function Monto({ n, className = '' }: { n: number; className?: string }) {
  return <span className={`tabular-nums ${n < 0 ? 'text-red-700' : ''} ${className}`}>{dinero(n)}</span>
}

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto)
          setOk(true)
          setTimeout(() => setOk(false), 2000)
        } catch {}
      }}
      className={btnSecundario}
    >
      {ok ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {ok ? 'Copiado' : 'Copiar mensaje'}
    </button>
  )
}

export function PlanVista({ plan, hash, narrativaInicial, nombre }: { plan: Plan; hash: string; narrativaInicial: Narrativa | null; nombre: string | null }) {
  const [narrativa, setNarrativa] = useState<Narrativa | null>(narrativaInicial)
  const [estado, setEstado] = useState<'listo' | 'cargando' | 'no_disponible'>(narrativaInicial ? 'listo' : 'cargando')

  useEffect(() => {
    if (narrativaInicial) return
    let vivo = true
    generarNarrativa(hash).then((r) => {
      if (!vivo) return
      if (r.ok && r.narrativa) {
        setNarrativa(r.narrativa)
        setEstado('listo')
      } else setEstado('no_disponible')
    })
    return () => {
      vivo = false
    }
  }, [hash, narrativaInicial])

  const r = plan.resumen
  const corto = plan.flags.find((f) => f.tipo === 'dia_corto' && f.fecha === r.diaCritico?.fecha)
  const estaSemana = plan.semanas.find((s) => s.lunes <= plan.desde && s.domingo >= plan.desde) ?? plan.semanas[0]

  return (
    <div className="space-y-6">
      {/* 1. Día crítico: lo primero en pantalla */}
      {r.diaCritico && (
        <section aria-labelledby="critico" className="rounded-2xl border-2 border-red-300 bg-white p-5 space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
            <AlertTriangle className="w-4 h-4" /> Día crítico
          </p>
          <h1 id="critico" className={`${titulo} text-xl sm:text-2xl`}>
            {fechaLarga(r.diaCritico.fecha)}: te faltan <Monto n={r.diaCritico.faltante} />
          </h1>
          {corto?.tipo === 'dia_corto' && (
            <>
              <p className="text-[15px]">
                Ese día salen {corto.pagos.map((m) => `${m.concepto} (${dinero(m.monto)})`).join(' y ')} y solo tendrías <Monto n={corto.saldoDisponible} />.
              </p>
              {corto.respaldo && (
                <p className="text-sm text-[#0d2b0d]/70">Último recurso: {corto.respaldo.cuenta} (tu plata intocable) alcanza a cubrirlo.</p>
              )}
            </>
          )}
        </section>
      )}

      {/* 2. Resumen */}
      <section aria-labelledby="resumen" className={`${tarjeta} p-5`}>
        <h2 id="resumen" className={`${titulo} text-sm mb-3`}>{nombre ? `${nombre}, así vas` : 'Así vas'}</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-[#0d2b0d]/60">Tienes hoy</dt>
            <dd className="text-xl font-bold"><Monto n={r.saldoInicial} /></dd>
          </div>
          <div>
            <dt className="text-xs text-[#0d2b0d]/60">Punto más bajo</dt>
            <dd className="text-xl font-bold"><Monto n={r.saldoMinimo.monto} /></dd>
            <dd className="text-xs text-[#0d2b0d]/60 tabular-nums">{fechaLarga(r.saldoMinimo.fecha)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#0d2b0d]/60">En {plan.semanas.length} semanas</dt>
            <dd className="text-lg font-semibold"><Monto n={r.saldoFinal} /></dd>
          </div>
          {r.intocable > 0 && (
            <div>
              <dt className="text-xs text-[#0d2b0d]/60">Intocable (no se cuenta)</dt>
              <dd className="text-lg font-semibold"><Monto n={r.intocable} /></dd>
            </div>
          )}
        </dl>
      </section>

      {/* 3. Esta semana */}
      <section aria-labelledby="semana" className={`${tarjeta} p-5 space-y-3`}>
        <h2 id="semana" className={`${titulo} text-sm`}>Esta semana</h2>
        {estado === 'cargando' && <p className="text-sm text-[#0d2b0d]/60">Preparando tu análisis…</p>}
        {narrativa && <p className="text-[15px] font-semibold">{narrativa.esta_semana}</p>}
        <ul className="text-sm tabular-nums">
          {estaSemana.movimientos.map((m, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-[#0d2b0d]/5 py-1.5">
              <span className="min-w-0 truncate">{fechaCorta(m.fecha)} · {m.concepto}</span>
              <Monto n={m.tipo === 'ingreso' ? m.monto : -m.monto} className={m.tipo === 'ingreso' ? 'text-[#2F4A00] font-semibold' : ''} />
            </li>
          ))}
          {!estaSemana.movimientos.length && <li className="text-[#0d2b0d]/60">Sin pagos con fecha esta semana.</li>}
        </ul>
      </section>

      {/* 4. Semana a semana */}
      <section aria-labelledby="tabla" className={`${tarjeta} p-5`}>
        <h2 id="tabla" className={`${titulo} text-sm mb-3`}>Semana a semana</h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-[560px] w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs text-[#0d2b0d]/60">
                <th className="py-2 pr-3 font-semibold">Semana</th>
                <th className="py-2 pr-3 font-semibold text-right">Abre</th>
                <th className="py-2 pr-3 font-semibold text-right">Entra</th>
                <th className="py-2 pr-3 font-semibold text-right">Pagos</th>
                <th className="py-2 pr-3 font-semibold text-right">Base</th>
                <th className="py-2 font-semibold text-right">Cierra</th>
              </tr>
            </thead>
            <tbody>
              {plan.semanas.map((s) => (
                <tr key={s.lunes} className="border-t border-[#0d2b0d]/5">
                  <td className="py-2 pr-3 whitespace-nowrap">{fechaCorta(s.lunes)}</td>
                  <td className="py-2 pr-3 text-right"><Monto n={s.apertura} /></td>
                  <td className="py-2 pr-3 text-right text-[#2F4A00]">{dinero(s.ingresos)}</td>
                  <td className="py-2 pr-3 text-right">{dinero(s.pagos)}</td>
                  <td className="py-2 pr-3 text-right">{dinero(s.costoBase)}</td>
                  <td className="py-2 text-right font-semibold"><Monto n={s.cierre} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Deudas en orden */}
      {plan.deudas.length > 0 && (
        <section aria-labelledby="deudas" className={`${tarjeta} p-5 space-y-2`}>
          <h2 id="deudas" className={`${titulo} text-sm`}>Orden para pagar deudas</h2>
          <ol className="space-y-2">
            {plan.deudas.map((d) => (
              <li key={d.id} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#C8FF00] text-[#0d2b0d] text-xs font-bold flex items-center justify-center tabular-nums">{d.orden}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{d.acreedor} · <Monto n={d.saldo} /></p>
                  <p className="text-xs text-[#0d2b0d]/70 tabular-nums">
                    {RAZON[d.razon]}
                    {d.proximaCuota ? ` · próxima cuota ${dinero(d.proximaCuota.monto)} el ${fechaCorta(d.proximaCuota.fecha)}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 6. Alertas, sugerencias y reservas */}
      {(plan.flags.length > 0 || plan.sugerencias.length > 0 || plan.reservas.length > 0) && (
        <section aria-labelledby="alertas" className={`${tarjeta} p-5 space-y-3`}>
          <h2 id="alertas" className={`${titulo} text-sm`}>Ojo con esto</h2>
          <ul className="space-y-2 text-sm">
            {plan.flags.map((f, i) => (
              <li key={i} className="flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                <span className="tabular-nums">
                  {f.tipo === 'dia_corto' && `${fechaLarga(f.fecha)}: faltan ${dinero(f.faltante)} para los pagos del día.`}
                  {f.tipo === 'semana_cargada' && `Semana del ${fechaCorta(f.lunes)}: chocan ${f.pagos.map((m) => m.concepto).join(' y ')} (${dinero(f.total)}).`}
                  {f.tipo === 'saldo_negativo' && `Semana del ${fechaCorta(f.lunes)}: cierras en ${dinero(f.cierre)}.`}
                  {f.tipo === 'cuota_vencida' && `${f.concepto}: cuota de ${dinero(f.monto)} vencida el ${fechaCorta(f.fecha)}.`}
                </span>
              </li>
            ))}
            {plan.sugerencias.map((s, i) => (
              <li key={`s${i}`} className="flex gap-2 text-[#2F4A00] font-semibold">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="tabular-nums">
                  {s.tipo === 'alternar_pagos' && s.mover && `Alterna: pasa ${s.mover.concepto} a la semana del ${fechaCorta(s.mover.aSemana)}.`}
                  {s.tipo === 'adelantar_deuda' && s.deuda && `Puedes adelantar ${dinero(s.deuda.monto)} a ${s.deuda.acreedor} sin quedarte corto.`}
                </span>
              </li>
            ))}
            {plan.reservas.slice(0, 3).map((x, i) => (
              <li key={`r${i}`} className="flex gap-2">
                <span aria-hidden className="w-4 shrink-0" />
                <span className="tabular-nums">Para {x.concepto} ({dinero(x.monto)} el {fechaCorta(x.fecha)}) separa {dinero(x.porSemana)} por semana.</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. Tu análisis: riesgos, mensajes y una recomendación */}
      {narrativa && (
        <section aria-labelledby="analisis" className={`${tarjeta} p-5 space-y-4`}>
          <h2 id="analisis" className={`${titulo} text-sm`}>Tu análisis</h2>
          <ul className="space-y-1.5 text-[15px] list-disc pl-5">
            {narrativa.riesgos.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <div className="rounded-xl bg-[#FAFAF7] border border-[#0d2b0d]/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2F4A00] mb-1">Mi recomendación</p>
            <p className="text-[15px] font-semibold">{narrativa.recomendacion}</p>
          </div>
          {narrativa.mensajes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Mensajes listos para enviar</h3>
              {narrativa.mensajes.map((m, i) => (
                <div key={i} className="rounded-xl border border-[#0d2b0d]/10 p-4 space-y-2">
                  <p className="text-xs text-[#0d2b0d]/60">Para: {m.para}</p>
                  <p className="text-[15px] whitespace-pre-wrap">{m.texto}</p>
                  <Copiar texto={m.texto} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {estado === 'no_disponible' && <p className="text-sm text-[#0d2b0d]/60">Tu análisis no está disponible en este momento. Los números de arriba sí están al día.</p>}

      {plan.avisos.length > 0 && (
        <ul className="text-xs text-[#0d2b0d]/60 space-y-1">{plan.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Más">
        <Link href="/finanzas/subir" className={btnSecundario}><Upload className="w-4 h-4" /> Subir pantallazo</Link>
        <Link href="/finanzas/ajustes" className={btnSecundario}><Settings className="w-4 h-4" /> Ajustes</Link>
        <Link href="/finanzas/empezar?paso=1" className={`${btnSecundario} ${foco}`}>Editar mis datos</Link>
      </nav>
    </div>
  )
}
