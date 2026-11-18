import { StaffingHeader } from '../_components/StaffingHeader'
import { KitClient } from '../_components/KitClient'

export const dynamic = 'force-dynamic'

export default function KitPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-16">
      <StaffingHeader
        kicker="Kit"
        title="Kit de reclutamiento"
        subtitle="Mensajes listos para pegar en grupos de Facebook y WhatsApp, y la guía de presentación para tus candidatos."
      />
      <KitClient />
    </div>
  )
}
