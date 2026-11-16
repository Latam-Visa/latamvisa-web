import type { EstadoEstudio } from '@/lib/cotizaciones-estudio'

const ESTILOS: Record<EstadoEstudio, { label: string; clase: string }> = {
  borrador: { label: 'Borrador', clase: 'bg-[#F5F5F0] text-[#6B6B6B] border-[#E5E5E5]' },
  enviada: { label: 'Enviada', clase: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' },
  aceptada: { label: 'Aceptada', clase: 'bg-[#C8FF00] text-[#2F4A00] border-[#C8FF00]' },
  perdida: { label: 'Perdida', clase: 'bg-[#FEF2F2] text-[#B91C1C] border-red-200' },
}

export function EstadoBadgeEstudio({ estado }: { estado: EstadoEstudio }) {
  const { label, clase } = ESTILOS[estado] || ESTILOS.borrador
  return (
    <span className={`inline-flex items-center font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${clase}`}>
      {label}
    </span>
  )
}
