import type { EstadoCotizacion } from '@/lib/cotizaciones'

const ESTILOS: Record<EstadoCotizacion, { label: string; clase: string }> = {
  pendiente: { label: 'Pendiente', clase: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' },
  pagada: { label: 'Pagada', clase: 'bg-[#C8FF00] text-[#2F4A00] border-[#C8FF00]' },
  vencida: { label: 'Vencida', clase: 'bg-[#F5F5F0] text-[#6B6B6B] border-[#E5E5E5]' },
  anulada: { label: 'Anulada', clase: 'bg-[#FEF2F2] text-[#B91C1C] border-red-200' },
}

// Recibe el estado efectivo (una pendiente expirada se muestra como vencida).
export function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  const { label, clase } = ESTILOS[estado]
  return (
    <span className={`inline-flex items-center font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${clase}`}>
      {label}
    </span>
  )
}
