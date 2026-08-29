import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import TravelHeroScroll from '@/components/TravelHeroScroll'
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

export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <TravelHeroScroll />
      <DestinosSection />
    </main>
  )
}
