import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import TravelHeroScroll from '@/components/TravelHeroScroll'

export const metadata: Metadata = {
  title: 'LATAM TRAVELING — Un viaje, dos mundos',
  description: 'Escala en Europa antes de llegar a casa. Dos vacaciones en un solo viaje con LATAM TRAVELING.',
}

export default function ViajesPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <TravelHeroScroll />
    </main>
  )
}
