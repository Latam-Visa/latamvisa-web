import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import TravelHeroScroll from '@/components/TravelHeroScroll'

export const metadata: Metadata = {
  title: 'Viajes | LATAM VISA Travel — dos mundos en un solo viaje',
  description: 'Aprovecha tu escala en Europa antes de llegar a casa. Nosotros nos encargamos de todo — visas, vuelos y el itinerario.',
}

export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <TravelHeroScroll />
    </main>
  )
}
