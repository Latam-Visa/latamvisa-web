import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  TRADUCCION_LISTA_POR_PERSONA,
  WHATSAPP_LATAM,
  estadoEfectivo,
  formatFecha,
  formatMoney,
  isUuid,
  labelPaisCotizacion,
  normalizarCotizacion,
  type Cotizacion,
} from '@/lib/cotizaciones'
import { ContenidoCanada } from '@/components/cotizacion/contenido-canada'
import { BotonPagar } from '@/components/cotizacion/BotonPagar'
import { NotaSeguridad } from '@/components/cotizacion/NotaSeguridad'
import { RefrescoPago } from '@/components/cotizacion/RefrescoPago'
import { createCotizacionCheckout } from './actions'

export const dynamic = 'force-dynamic'
// Igual que en el admin: sin esto supabase-js puede servir un snapshot viejo
// desde el Data Cache y la página no reflejaría el pago.
export const fetchCache = 'force-no-store'

// Se sobrescriben description/OG/Twitter del layout raíz: WhatsApp arma la
// vista previa del link con estas etiquetas.
const DESCRIPCION = 'Revisa tu cotización y paga de forma segura.'

export const metadata: Metadata = {
  title: 'Tu cotización | LATAM VISA',
  description: DESCRIPCION,
  keywords: null,
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Tu cotización | LATAM VISA',
    description: DESCRIPCION,
    siteName: 'LATAM VISA',
    images: [{ url: 'https://www.latamvisatravel.com/logo.png', width: 800, height: 400, alt: 'LATAM VISA' }],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Tu cotización | LATAM VISA', description: DESCRIPCION, images: ['https://www.latamvisatravel.com/logo.png'] },
  alternates: { canonical: null },
}

// Solo las columnas que el cliente puede ver: convenio, comisión y notas
// internas ni siquiera salen de la base de datos.
const COLUMNAS_PUBLICAS =
  'id, numero, token, cliente_nombre, pais_destino, personas, moneda, asesoria_total, traducciones_total, monto, gobierno_estimado, estado, vence_el, created_at'

type CotizacionPublica = Omit<Cotizacion, 'convenio_id' | 'comision_total' | 'notas' | 'comision_pagada_el'>

const CONTENIDO_POR_PAIS: Record<string, () => JSX.Element> = {
  canada: ContenidoCanada,
}

export default async function PagarCotizacionPage({
  params,
  searchParams,
}: {
  params: { token: string }
  searchParams: { estado?: string }
}) {
  if (!isUuid(params.token)) notFound()

  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .select(COLUMNAS_PUBLICAS)
    .eq('token', params.token)
    .maybeSingle()

  if (error) console.error('[PAGAR] Error leyendo cotización:', error)
  if (!data) notFound()

  const cot = normalizarCotizacion(data) as CotizacionPublica
  const estado = estadoEfectivo(cot)
  const volvioDeStripe = searchParams.estado === 'exito'
  const errorPago = searchParams.estado === 'error'

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#0d2b0d] font-funnel selection:bg-[#0d2b0d] selection:text-[#C8FF00]">
      <header className="w-full bg-white border-b border-[#0d2b0d]/10 px-4 py-5 flex justify-center">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="LATAM VISA" className="h-[64px] sm:h-[80px] w-auto object-contain" />
        </Link>
      </header>

      <div className="w-full max-w-[640px] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-8">
        {volvioDeStripe && estado !== 'pagada' && (
          <div role="status" className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-5 text-[#0d2b0d]">
            <span className="inline-block bg-[#C8FF00] text-[#0d2b0d] font-iceland font-bold text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-sm mb-3">
              Pago exitoso
            </span>
            <p className="font-monument text-sm uppercase">¡Gracias por tu pago!</p>
            <p className="text-sm mt-1">Lo estamos confirmando. Esta página se actualizará en unos segundos.</p>
            <RefrescoPago />
          </div>
        )}

        {errorPago && estado === 'pendiente' && (
          <div role="alert" className="rounded-2xl bg-white border border-red-200 p-5 text-sm text-red-700">
            No pudimos abrir el pago seguro. Intenta de nuevo en un momento o escríbenos por WhatsApp.
          </div>
        )}

        {estado === 'pagada' ? (
          <EstadoPagada cot={cot} mostrarBanner={volvioDeStripe} />
        ) : estado === 'pendiente' ? (
          <EstadoPagable cot={cot} ocultarBoton={volvioDeStripe} />
        ) : (
          <EstadoNoVigente cot={cot} />
        )}
      </div>

      <footer className="py-6 border-t border-[#0d2b0d]/10 flex flex-wrap justify-center gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#0d2b0d]/60">
        <span>© {new Date().getFullYear()} LATAM VISA</span>
        <span>·</span>
        <span>Procesado seguro por Stripe</span>
      </footer>
    </main>
  )
}

function Encabezado({ cot }: { cot: CotizacionPublica }) {
  return (
    <div>
      <span className="inline-block bg-[#C8FF00] text-[#0d2b0d] font-iceland font-bold text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-sm mb-4">
        Cotización {cot.numero}
      </span>
      <h1 className="font-monument font-black text-[22px] sm:text-[28px] uppercase leading-[1.1] tracking-tight">
        Propuesta de visa de turismo {cot.pais_destino === 'canada' ? 'canadiense' : `a ${labelPaisCotizacion(cot.pais_destino)}`}
      </h1>
      <p className="mt-2 text-base text-[#2F4A00] font-semibold">
        Grupo de {cot.personas} {cot.personas === 1 ? 'persona' : 'personas'}
      </p>
      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
          <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">Para</dt>
          <dd className="font-semibold break-words">{cot.cliente_nombre}</dd>
        </div>
        <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
          <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">Emitida</dt>
          <dd className="font-semibold">{formatFecha(cot.created_at)}</dd>
        </div>
        <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
          <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">Válida hasta</dt>
          <dd className="font-semibold">{formatFecha(cot.vence_el)}</dd>
        </div>
      </dl>
    </div>
  )
}

function FilaPrecio({
  concepto,
  detalle,
  cuando,
  monto,
}: {
  concepto: string
  detalle?: React.ReactNode
  cuando: string
  monto: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[#0d2b0d]/10">
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{concepto}</p>
        {detalle && <p className="text-sm text-[#0d2b0d]/70 mt-0.5">{detalle}</p>}
        <p className="text-xs uppercase tracking-wider text-[#2F4A00] font-semibold mt-1.5">{cuando}</p>
      </div>
      <p className="shrink-0 font-semibold tabular-nums">{monto}</p>
    </div>
  )
}

function TablaPrecios({ cot }: { cot: CotizacionPublica }) {
  const fmt = (n: number) => formatMoney(n, cot.moneda)
  const porPersona = cot.personas > 0 ? Math.round(cot.asesoria_total / cot.personas) : cot.asesoria_total
  const traduccionLista = cot.personas * TRADUCCION_LISTA_POR_PERSONA
  const ahorro = traduccionLista - cot.traducciones_total

  return (
    <section aria-labelledby="inversion" className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-5 sm:p-6">
      <h2 id="inversion" className="font-monument text-sm uppercase tracking-wide mb-1">Inversión</h2>

      <FilaPrecio
        concepto="Asesoría LATAM VISA"
        detalle={`${fmt(porPersona)} por persona`}
        cuando="Al iniciar"
        monto={fmt(cot.asesoria_total)}
      />
      <FilaPrecio
        concepto="Traducciones"
        detalle={
          ahorro > 0 ? (
            <>
              Antes <span className="line-through">{fmt(traduccionLista)}</span>,{' '}
              <span className="font-semibold text-[#2F4A00]">¡ahorran {fmt(ahorro)}!</span>
            </>
          ) : undefined
        }
        cuando="Al iniciar"
        monto={fmt(cot.traducciones_total)}
      />
      <FilaPrecio
        concepto={
          cot.pais_destino === 'canada'
            ? 'Derechos del gobierno de Canadá (visa + huellas y foto, estimado)'
            : 'Derechos del gobierno (estimado)'
        }
        cuando="Al enviar la solicitud"
        monto={fmt(cot.gobierno_estimado)}
      />

      <div className="flex items-center justify-between gap-4 pt-4">
        <p className="font-monument text-sm uppercase">Total</p>
        <p className="font-bold text-lg tabular-nums">{fmt(cot.monto + cot.gobierno_estimado)}</p>
      </div>
    </section>
  )
}

function EstadoPagable({ cot, ocultarBoton }: { cot: CotizacionPublica; ocultarBoton: boolean }) {
  const Contenido = CONTENIDO_POR_PAIS[cot.pais_destino]
  const montoHoy = formatMoney(cot.monto, cot.moneda)
  const pagar = createCotizacionCheckout.bind(null, cot.token)

  return (
    <>
      <Encabezado cot={cot} />

      {Contenido && <Contenido />}

      <TablaPrecios cot={cot} />

      <section className="rounded-2xl bg-[#0d2b0d] text-[#FAFAF7] p-6 sm:p-7 space-y-5">
        <div>
          <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#FAFAF7]/70">Para empezar hoy</p>
          <p className="font-monument font-black text-[34px] sm:text-[44px] leading-none mt-2 tabular-nums break-words">
            {montoHoy}
          </p>
          <p className="text-sm text-[#FAFAF7]/80 mt-3 leading-relaxed">
            Los derechos del gobierno se pagan después, al enviar la solicitud, y pueden variar según la tasa de
            cambio.
          </p>
        </div>

        {!ocultarBoton && <BotonPagar action={pagar} label={`Pagar ${montoHoy}`} />}
      </section>

      <NotaSeguridad />
    </>
  )
}

function EstadoPagada({ cot, mostrarBanner }: { cot: CotizacionPublica; mostrarBanner: boolean }) {
  return (
    <section className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-6 sm:p-8 text-center space-y-4">
      {mostrarBanner && (
        <span className="inline-block bg-[#C8FF00] text-[#0d2b0d] font-iceland font-bold text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-sm">
          Pago exitoso
        </span>
      )}
      <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#2F4A00] font-bold">
        Cotización {cot.numero}
      </p>
      <h1 className="font-monument font-black text-2xl sm:text-3xl uppercase leading-tight">¡Pago recibido!</h1>
      <p className="text-base">Nuestro equipo se pondrá en contacto contigo.</p>
    </section>
  )
}

function EstadoNoVigente({ cot }: { cot: CotizacionPublica }) {
  const texto = encodeURIComponent(`Hola, quiero actualizar mi cotización ${cot.numero}`)

  return (
    <section className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-6 sm:p-8 text-center space-y-5">
      <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#2F4A00] font-bold">
        Cotización {cot.numero}
      </p>
      <h1 className="font-monument font-black text-xl sm:text-2xl uppercase leading-tight">
        Esta cotización ya no está vigente.
      </h1>
      <p className="text-base text-[#0d2b0d]/80">Escríbenos y te enviamos una actualizada.</p>
      <a
        href={`https://wa.me/${WHATSAPP_LATAM}?text=${texto}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full sm:w-auto min-h-[52px] px-6 rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-monument uppercase text-sm tracking-wide hover:bg-[#b8ef00] transition-colors"
      >
        Escribir por WhatsApp
      </a>
    </section>
  )
}
