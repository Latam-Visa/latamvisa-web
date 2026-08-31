import type { Metadata } from 'next'
import { viajesDisplay } from './fonts'
import ViajesShell from '@/components/viajes/ViajesShell'
import HeroViajes from '@/components/viajes/HeroViajes'
import LaIdea from '@/components/viajes/LaIdea'
import ComparativoVuelos from '@/components/viajes/ComparativoVuelos'
import DestinosEuropa from '@/components/viajes/DestinosEuropa'
import CotizaTuTrip from '@/components/viajes/CotizaTuTrip'
import CTAWhatsApp from '@/components/viajes/CTAWhatsApp'

export const metadata: Metadata = {
  title: 'Dos Vacaciones | Haz escala en Europa camino a Latam — LATAM VISA',
  description:
    'Si vuelves de Australia a Latinoamérica entre diciembre y febrero, tu vuelo puede hacer escala en Europa. Te ayudamos a planear las dos: rutas, fechas e itinerario, sin letra pequeña.',
  openGraph: {
    title: 'Dos Vacaciones — una pa’ Europa, otra pa’ Latam',
    description:
      'Haz escala en Europa camino a Latinoamérica. Planeamos rutas, fechas e itinerario contigo.',
    url: 'https://www.latamvisatravel.com/viajes',
    siteName: 'LATAM VISA',
    locale: 'es_LA',
    type: 'website',
  },
  alternates: { canonical: 'https://www.latamvisatravel.com/viajes' },
}

/* Campaña "Dos Vacaciones" (LATAM VISA x Europa).
   La página corre en su propio sistema de diseño (.viajes-root en
   globals.css) y sin el Navbar del sitio: cada sección es una pantalla con
   una sola idea, y una barra fija encima rompería esa regla. La navegación
   de vuelta al sitio vive en el link "Viajes" del nav principal. */
export default function ViajesPage() {
  return (
    <main className={`viajes-root ${viajesDisplay.variable}`}>
      <ViajesShell>
        <HeroViajes />
        <LaIdea />
        <ComparativoVuelos />
        <DestinosEuropa />
        <CotizaTuTrip />
        <CTAWhatsApp />
      </ViajesShell>
    </main>
  )
}
