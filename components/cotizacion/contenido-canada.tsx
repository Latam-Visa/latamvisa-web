// Contenido fijo de la cotización para pais_destino = 'canada'. Reemplaza la
// parte narrativa del PDF que enviábamos antes; los montos van aparte, en la
// tabla dinámica de /pagar/[token].

const requisitos = [
  'Pasaportes vigentes (con más de 6 meses de vigencia) y copia de la visa americana.',
  'Formularios IMM 5257 e IMM 5707 (los diligenciamos nosotros con su borrador).',
  'Extractos bancarios de 3 a 6 meses, declaración de renta y comprobantes de ingresos.',
  'Certificados laborales y de propiedades o vehículos.',
  'Itinerario tentativo del viaje.',
]

const pasos = [
  { titulo: 'Documentos', detalle: '1 a 2 semanas para reunir y revisar todo.' },
  {
    titulo: 'Radicación y biométricos',
    detalle: 'Cita en VFS Global (Bogotá, Medellín o Cali). Hay 30 días para asistir.',
  },
  { titulo: 'Estudio', detalle: 'Unas 4 semanas de referencia (estimado, no garantía).' },
  { titulo: 'Estampado', detalle: 'Se estampa la visa en el pasaporte.' },
]

const bonos = ['Checklist exacta de documentos', 'Plantilla de carta de motivos']

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

export function ContenidoCanada() {
  return (
    <div className="space-y-7 font-funnel text-[15px] leading-relaxed text-[#0d2b0d]">
      <Seccion n={1} titulo="Viabilidad">
        <p>
          Tener visa americana es el mejor punto de partida posible: el oficial canadiense sabe que ya
          pasaron los filtros de EE. UU., lo que fortalece su solicitud. Colombia no está en la lista de
          países que pueden entrar solo con eTA, por eso los acompañamos con la solicitud de visa de
          visitante (turismo), que permite estadías de hasta 6 meses.
        </p>
      </Seccion>

      <Seccion n={2} titulo="Requisitos">
        <p className="mb-4">Canadá no hace entrevista; el proceso es 100% documental.</p>
        <ul className="space-y-2.5">
          {requisitos.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="shrink-0 mt-[9px] w-1.5 h-1.5 rounded-full bg-[#2F4A00]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion n={3} titulo="Tiempos">
        <ol className="space-y-3">
          {pasos.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#C8FF00] text-[#0d2b0d] font-monument text-[11px] flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">Paso {i + 1}: {paso.titulo}</p>
                <p className="text-[#0d2b0d]/75">{paso.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl bg-white border border-[#0d2b0d]/10 p-4 text-sm">
          <span className="font-semibold text-[#2F4A00]">Recomendación:</span> iniciar 2 a 3 meses antes del
          viaje y no comprar tiquetes antes de la aprobación.
        </p>
      </Seccion>

      <Seccion n={4} titulo="Bonos incluidos">
        <ul className="flex flex-wrap gap-2">
          {bonos.map((bono) => (
            <li
              key={bono}
              className="rounded-full bg-[#C8FF00] text-[#0d2b0d] text-sm font-semibold px-4 py-1.5"
            >
              {bono}
            </li>
          ))}
        </ul>
      </Seccion>
    </div>
  )
}
