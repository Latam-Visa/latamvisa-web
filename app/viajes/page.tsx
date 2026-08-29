import type { Metadata } from 'next'
import DestinosSection from '@/components/travel/DestinosSection'

export const metadata: Metadata = {
  title: 'Viajes | LATAM VISA Travel — dos mundos en un solo viaje',
  description: 'Planea tu escala en Europa antes de llegar a casa. Itinerario, vuelos y hospedaje en un solo lugar, con claridad de principio a fin.',
  openGraph: {
    title: 'Viajes | LATAM VISA Travel',
    description: 'Planea tu escala en Europa antes de llegar a casa.',
    url: 'https://www.latamvisatravel.com/viajes',
    siteName: 'LATAM VISA Travel',
    locale: 'es_LA',
    type: 'website',
  },
}

// The scroll-scrub hero (components/TravelHeroScroll.tsx) is intentionally no
// longer rendered here — this page moved to the simpler white editorial layout.
// The component is left in the repo so the previous treatment can be restored.
export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-white">
      <DestinosSection />
    </main>
  )
}
