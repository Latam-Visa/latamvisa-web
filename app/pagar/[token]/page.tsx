import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  WHATSAPP_LATAM,
  desglosePrecios,
  estadoEfectivo,
  formatFecha,
  formatMoney,
  isUuid,
  normalizarCotizacion,
  type Cotizacion,
} from '@/lib/cotizaciones'
import { COPY_PAGINA as T, getContenido, type ContenidoCotizacion } from '@/lib/cotizaciones/contenido'
import { traduccionPorPersonaDe } from '@/lib/cotizaciones/tarifas'
import { ContenidoCotizacion as Secciones } from '@/components/cotizacion/ContenidoCotizacion'
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
export const metadata: Metadata = {
  title: T.metaTitulo,
  description: T.metaDescripcion,
  keywords: null,
  robots: { index: false, follow: false },
  openGraph: {
    title: T.metaTitulo,
    description: T.metaDescripcion,
    siteName: 'LATAM VISA',
    images: [{ url: 'https://www.latamvisatravel.com/logo.png', width: 800, height: 400, alt: 'LATAM VISA' }],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: { card: 'summary', title: T.metaTitulo, description: T.metaDescripcion, images: ['https://www.latamvisatravel.com/logo.png'] },
  alternates: { canonical: null },
}

// Solo columnas públicas. convenio_id se lee aparte únicamente para buscar el
// precio de lista de traducción; convenio, comisión y notas nunca se muestran.
const COLUMNAS_PUBLICAS =
  'id, numero, token, cliente_nombre, tipo_visa, pais_destino, pais_origen, tiene_visa_usa, personas, moneda, asesoria_total, traducciones_total, monto, gobierno_estimado, estado, vence_el, created_at'

type CotizacionPublica = Pick<
  Cotizacion,
  | 'id'
  | 'numero'
  | 'token'
  | 'cliente_nombre'
  | 'tipo_visa'
  | 'pais_destino'
  | 'pais_origen'
  | 'tiene_visa_usa'
  | 'personas'
  | 'moneda'
  | 'asesoria_total'
  | 'traducciones_total'
  | 'monto'
  | 'gobierno_estimado'
  | 'estado'
  | 'vence_el'
  | 'created_at'
>

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
    .select(`${COLUMNAS_PUBLICAS}, convenio_id`)
    .eq('token', params.token)
    .maybeSingle()

  if (error) console.error('[PAGAR] Error leyendo cotización:', error)
  if (!data) notFound()

  const { convenio_id, ...publica } = data as typeof data & { convenio_id: string | null }
  const cot = normalizarCotizacion(publica) as CotizacionPublica
  const estado = estadoEfectivo(cot)
  const contenido = getContenido(cot.tipo_visa, cot.pais_destino, cot.pais_origen)
  const traduccionPorPersona =
    estado === 'pendiente' ? await traduccionPorPersonaDe({ convenio_id, tipo_visa: cot.tipo_visa, pais_destino: cot.pais_destino, pais_origen: cot.pais_origen }) : null
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
              {T.pagoExitosoBadge}
            </span>
            <p className="font-monument text-sm uppercase">{T.graciasPago}</p>
            <p className="text-sm mt-1">{T.confirmandoPago}</p>
            <RefrescoPago />
          </div>
        )}

        {errorPago && estado === 'pendiente' && (
          <div role="alert" className="rounded-2xl bg-white border border-red-200 p-5 text-sm text-red-700">
            {T.errorPago}
          </div>
        )}

        {estado === 'pagada' ? (
          <EstadoPagada cot={cot} mostrarBanner={volvioDeStripe} />
        ) : estado === 'pendiente' ? (
          <EstadoPagable cot={cot} contenido={contenido} traduccionPorPersona={traduccionPorPersona} ocultarBoton={volvioDeStripe} />
        ) : (
          <EstadoNoVigente cot={cot} />
        )}
      </div>

      <footer className="py-6 border-t border-[#0d2b0d]/10 flex flex-wrap justify-center gap-4 text-[11px] uppercase font-iceland tracking-widest text-[#0d2b0d]/60">
        <span>© {new Date().getFullYear()} LATAM VISA</span>
        <span>·</span>
        <span>{T.procesadoPor}</span>
      </footer>
    </main>
  )
}

function Encabezado({ cot, contenido }: { cot: CotizacionPublica; contenido: ContenidoCotizacion | null }) {
  return (
    <div>
      <span className="inline-block bg-[#C8FF00] text-[#0d2b0d] font-iceland font-bold text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-sm mb-4">
        {T.etiquetaCotizacion} {cot.numero}
      </span>
      {contenido && (
        <h1 className="font-monument font-black text-[22px] sm:text-[28px] uppercase leading-[1.1] tracking-tight">{contenido.titulo}</h1>
      )}
      <p className="mt-2 text-base text-[#2F4A00] font-semibold">{T.grupo(cot.personas)}</p>
      <dl className={`mt-5 grid grid-cols-1 ${cot.cliente_nombre ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 text-sm`}>
        {cot.cliente_nombre && (
          <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
            <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">{T.para}</dt>
            <dd className="font-semibold break-words">{cot.cliente_nombre}</dd>
          </div>
        )}
        <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
          <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">{T.emitida}</dt>
          <dd className="font-semibold">{formatFecha(cot.created_at)}</dd>
        </div>
        <div className="rounded-xl bg-white border border-[#0d2b0d]/10 p-3">
          <dt className="text-[#0d2b0d]/60 text-xs uppercase tracking-wider">{T.validaHasta}</dt>
          <dd className="font-semibold">{formatFecha(cot.vence_el)}</dd>
        </div>
      </dl>
    </div>
  )
}

function FilaPrecio({ concepto, detalle, cuando, monto }: { concepto: string; detalle?: React.ReactNode; cuando?: string; monto: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[#0d2b0d]/10">
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{concepto}</p>
        {detalle && <p className="text-sm text-[#0d2b0d]/70 mt-0.5">{detalle}</p>}
        {cuando && <p className="text-xs uppercase tracking-wider text-[#2F4A00] font-semibold mt-1.5">{cuando}</p>}
      </div>
      <p className="shrink-0 font-semibold tabular-nums">{monto}</p>
    </div>
  )
}

function TablaPrecios({
  cot,
  contenido,
  traduccionPorPersona,
}: {
  cot: CotizacionPublica
  contenido: ContenidoCotizacion | null
  traduccionPorPersona: number | null
}) {
  const fmt = (n: number) => formatMoney(n, cot.moneda)
  const d = desglosePrecios(cot, traduccionPorPersona)
  const p = contenido?.precios

  return (
    <section aria-labelledby="inversion" className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-5 sm:p-6">
      <h2 id="inversion" className="font-monument text-sm uppercase tracking-wide mb-1">{T.inversion}</h2>

      <FilaPrecio concepto={p?.asesoria ?? 'Asesoría LATAM VISA'} detalle={T.porPersona(fmt(d.asesoriaPorPersona))} cuando={p?.alIniciar} monto={fmt(cot.asesoria_total)} />
      <FilaPrecio
        concepto={p?.traducciones ?? 'Traducciones'}
        detalle={
          d.traduccionAntes != null ? (
            <>
              {T.antes} <span className="line-through">{fmt(d.traduccionAntes)}</span>,{' '}
              <span className="font-semibold text-[#2F4A00]">{T.ahorran(fmt(d.ahorroTraduccion))}</span>
            </>
          ) : undefined
        }
        cuando={p?.alIniciar}
        monto={fmt(cot.traducciones_total)}
      />
      <FilaPrecio concepto={p?.gobierno ?? 'Derechos del gobierno (estimado)'} cuando={p?.alEnviar} monto={fmt(cot.gobierno_estimado)} />

      <div className="flex items-center justify-between gap-4 py-4 border-b border-[#0d2b0d]/10">
        <p className="font-monument text-sm uppercase">{T.total}</p>
        <p className="font-bold text-lg tabular-nums">{fmt(d.totalConGobierno)}</p>
      </div>
      <div className="flex items-center justify-between gap-4 pt-4">
        <p className="font-semibold">{T.valorRealPorPersona}</p>
        <p className="font-bold tabular-nums">{fmt(d.valorRealPorPersona)}</p>
      </div>
    </section>
  )
}

function EstadoPagable({
  cot,
  contenido,
  traduccionPorPersona,
  ocultarBoton,
}: {
  cot: CotizacionPublica
  contenido: ContenidoCotizacion | null
  traduccionPorPersona: number | null
  ocultarBoton: boolean
}) {
  const montoHoy = formatMoney(cot.monto, cot.moneda)
  const pagar = createCotizacionCheckout.bind(null, cot.token)

  return (
    <>
      <Encabezado cot={cot} contenido={contenido} />

      {contenido && <Secciones contenido={contenido} tieneVisaUsa={cot.tiene_visa_usa} />}

      <TablaPrecios cot={cot} contenido={contenido} traduccionPorPersona={traduccionPorPersona} />

      <section className="rounded-2xl bg-[#0d2b0d] text-[#FAFAF7] p-6 sm:p-7 space-y-5">
        <div>
          <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#FAFAF7]/70">{T.paraEmpezarHoy}</p>
          <p className="font-monument font-black text-[34px] sm:text-[44px] leading-none mt-2 tabular-nums break-words">{montoHoy}</p>
          {contenido && (
            <p className="text-sm text-[#FAFAF7]/80 mt-3 leading-relaxed">
              {contenido.precios.pagosDespues(cot.gobierno_estimado, cot.moneda)} {contenido.precios.tasaDeCambio}
            </p>
          )}
        </div>

        {!ocultarBoton && <BotonPagar action={pagar} label={T.pagar(montoHoy)} />}
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
          {T.pagoExitosoBadge}
        </span>
      )}
      <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#2F4A00] font-bold">
        {T.etiquetaCotizacion} {cot.numero}
      </p>
      <h1 className="font-monument font-black text-2xl sm:text-3xl uppercase leading-tight">{T.pagoRecibido}</h1>
      <p className="text-base">{T.contacto}</p>
    </section>
  )
}

function EstadoNoVigente({ cot }: { cot: CotizacionPublica }) {
  const texto = encodeURIComponent(T.whatsappActualizar(cot.numero))

  return (
    <section className="rounded-2xl bg-white border border-[#0d2b0d]/10 p-6 sm:p-8 text-center space-y-5">
      <p className="font-iceland text-xs tracking-[0.2em] uppercase text-[#2F4A00] font-bold">
        {T.etiquetaCotizacion} {cot.numero}
      </p>
      <h1 className="font-monument font-black text-xl sm:text-2xl uppercase leading-tight">{T.noVigente}</h1>
      <p className="text-base text-[#0d2b0d]/80">{T.noVigenteDetalle}</p>
      <a
        href={`https://wa.me/${WHATSAPP_LATAM}?text=${texto}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full sm:w-auto min-h-[52px] px-6 rounded-xl bg-[#C8FF00] text-[#0d2b0d] font-monument uppercase text-sm tracking-wide hover:bg-[#b8ef00] transition-colors"
      >
        {T.escribirWhatsApp}
      </a>
    </section>
  )
}
