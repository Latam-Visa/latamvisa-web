import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroViajes from '@/components/viajes/HeroViajes'
import LaIdea from '@/components/viajes/LaIdea'
import ComparativoVuelos from '@/components/viajes/ComparativoVuelos'
import DestinosEuropa from '@/components/viajes/DestinosEuropa'
import CotizaTuTrip from '@/components/viajes/CotizaTuTrip'
import CTAWhatsApp from '@/components/viajes/CTAWhatsApp'

export const metadata: Metadata = {
  title: 'Dos Vacaciones | Haz escala en Europa camino a Latam — LATAM VISA',
  description:
    'Si viajas de Australia a Latinoamérica en diciembre, tu vuelo puede hacer escala en Europa. Te ayudamos a planear las dos: rutas, fechas e itinerario, sin letra pequeña.',
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
   The previous editorial treatment lives on in components/travel/, just no
   longer rendered here, so it can be restored if this campaign wraps. */
export default function ViajesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <HeroViajes />
        {/* Navbar watches this marker to switch from its transparent-over-hero
            state to the solid bar. Without it the bar stays translucent with
            white text over the white sections below — unreadable. */}
        <div id="viajes-hero-end" style={{ height: 0 }} aria-hidden />
        <LaIdea />
        <ComparativoVuelos />
        <DestinosEuropa />
        <CotizaTuTrip />
        <CTAWhatsApp />
      </main>
      <Footer />
    </>
  )
}
