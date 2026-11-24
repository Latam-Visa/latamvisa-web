import { StaffingHeader } from '../_components/StaffingHeader'
import { MisionesClient } from '../_components/MisionesClient'

export const dynamic = 'force-dynamic'

export default function MisionesPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-14 pb-24">
      <StaffingHeader
        kicker="Misiones"
        title="Tareas y misiones"
        subtitle="Lo que hay que resolver ahora: contactos, correos ya redactados y avisos listos para enviar."
      />
      <MisionesClient />
    </div>
  )
}
