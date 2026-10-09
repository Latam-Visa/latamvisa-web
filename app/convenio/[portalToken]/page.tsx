import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isUuid, normalizarCotizacion, type ConvenioTarifa } from '@/lib/cotizaciones'
import { GeneradorCotizacion } from '@/components/cotizacion/GeneradorCotizacion'
import { generarCotizacionConvenio, enviarEmailConvenio } from './actions'
import { MisCotizaciones, type FilaPortal } from './_components/MisCotizaciones'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'Portal de convenios | LATAM VISA',
  description: 'Genera cotizaciones para tus clientes.',
  keywords: null,
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
  alternates: { canonical: null },
}

export default async function PortalConvenioPage({ params }: { params: { portalToken: string } }) {
  if (!isUuid(params.portalToken)) notFound()

  const { data: convenio } = await supabaseAdmin
    .from('convenios')
    .select('id, nombre')
    .eq('portal_token', params.portalToken)
    .eq('activo', true)
    .maybeSingle()
  if (!convenio) notFound()

  // Todo filtrado por el convenio del token: nunca datos de otros convenios.
  const [{ data: tarifas }, { data: filas }] = await Promise.all([
    supabaseAdmin
      .from('convenio_tarifas')
      .select('convenio_id, tipo_visa, pais_destino, pais_origen, moneda, asesoria_por_persona, traduccion_por_persona, traduccion_grupo_plana, grupo_minimo, gobierno_por_persona')
      .eq('convenio_id', convenio.id),
    supabaseAdmin
      .from('cotizaciones')
      .select('id, numero, token, cliente_nombre, personas, monto, moneda, estado, vence_el, comision_total, comision_pagada_el, email_enviado_a, created_at')
      .eq('convenio_id', convenio.id)
      .order('created_at', { ascending: false }),
  ])

  const cotizaciones: FilaPortal[] = (filas || []).map((f) => normalizarCotizacion(f) as FilaPortal)
  const token = params.portalToken

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#0d2b0d] font-funnel">
      <header className="bg-white border-b border-[#0d2b0d]/10">
        <div className="max-w-[720px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="font-monument font-black text-lg sm:text-xl uppercase leading-tight break-words">Hola, {convenio.nombre}</h1>
          <img src="/logo.png" alt="LATAM VISA" className="h-10 sm:h-12 w-auto object-contain shrink-0" />
        </div>
      </header>

      <div className="max-w-[720px] mx-auto px-4 py-6 sm:py-8 space-y-10">
        <section aria-labelledby="generar" className="space-y-3">
          <h2 id="generar" className="font-monument text-sm uppercase tracking-wide">Nueva cotización</h2>
          <GeneradorCotizacion
            modo="convenio"
            tarifas={(tarifas || []) as ConvenioTarifa[]}
            generar={generarCotizacionConvenio.bind(null, token)}
            enviarEmail={enviarEmailConvenio.bind(null, token)}
          />
        </section>

        <MisCotizaciones cotizaciones={cotizaciones} enviarEmail={enviarEmailConvenio.bind(null, token)} />
      </div>
    </main>
  )
}
