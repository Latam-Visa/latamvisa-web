// Secciones de texto de la cotización en /pagar/[token]. El texto viene de
// lib/cotizaciones/contenido.ts (la misma fuente que usa el PDF).

import { COPY_PAGINA, type ContenidoCotizacion as Contenido } from '@/lib/cotizaciones/contenido'

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#0d2b0d]/10 pt-7">
      <h2 className="flex items-baseline gap-3 font-monument text-[13px] sm:text-sm uppercase tracking-wide text-[#0d2b0d] mb-4">
        <span className="text-[#2F4A00]">{String(n).padStart(2, '0')}</span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export function ContenidoCotizacion({ contenido, tieneVisaUsa }: { contenido: Contenido; tieneVisaUsa: boolean | null }) {
  const s = COPY_PAGINA.secciones
  return (
    <div className="space-y-7 font-funnel text-[15px] leading-relaxed text-[#0d2b0d]">
      <Seccion n={1} titulo={s.viabilidad}>
        <p>{contenido.viabilidad(tieneVisaUsa)}</p>
      </Seccion>

      <Seccion n={2} titulo={s.requisitos}>
        <p className="mb-4">{contenido.requisitos.intro}</p>
        <ul className="space-y-2.5">
          {contenido.requisitos.items(tieneVisaUsa).map((item) => (
            <li key={item} className="flex gap-3">
              <span className="shrink-0 mt-[9px] w-1.5 h-1.5 rounded-full bg-[#2F4A00]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion n={3} titulo={s.tiempos}>
        <ol className="space-y-3">
          {contenido.tiempos.pasos.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#C8FF00] text-[#0d2b0d] font-monument text-[11px] flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{COPY_PAGINA.paso(i + 1)}: {paso.titulo}</p>
                <p className="text-[#0d2b0d]/75">{paso.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl bg-white border border-[#0d2b0d]/10 p-4 text-sm">
          <span className="font-semibold text-[#2F4A00]">{COPY_PAGINA.recomendacion}</span> {contenido.tiempos.recomendacion}
        </p>
      </Seccion>

      <Seccion n={4} titulo={s.bonos}>
        <ul className="flex flex-wrap gap-2">
          {contenido.bonos.map((bono) => (
            <li key={bono} className="rounded-full bg-[#C8FF00] text-[#0d2b0d] text-sm font-semibold px-4 py-1.5">
              {bono}
            </li>
          ))}
        </ul>
      </Seccion>
    </div>
  )
}
