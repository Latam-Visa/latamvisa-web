import { StaffingHeader } from '../_components/StaffingHeader'
import { KitClient } from '../_components/KitClient'

export const dynamic = 'force-dynamic'

export default function KitPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-14 pb-24">
      <StaffingHeader
        kicker="Kit"
        title="Kit de reclutamiento"
        subtitle="Mensaje listo para pegar en grupos de Facebook y WhatsApp, y la guía de presentación para tus candidatos."
      />
      <KitClient />
    </div>
  )
}
