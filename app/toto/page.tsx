import type { Metadata } from 'next'
import { LandingHero } from './_components/LandingHero'

export const metadata: Metadata = {
  title: 'LATAM VISA — Latinoamérica',
  description: 'El puente entre tus raíces y el mundo. Visas y asesoría migratoria premium para latinoamericanos.',
  openGraph: {
    title: 'LATAM VISA — Latinoamérica',
    description: 'El puente entre tus raíces y el mundo.',
    url: 'https://www.latamvisatravel.com/toto',
    siteName: 'LATAM VISA',
    images: [{ url: '/toto-la-momposina.jpg', width: 1200, height: 1200, alt: 'Totó la Momposina — LATAM VISA' }],
    locale: 'es_LA',
    type: 'website',
  },
}

export default function LandingPage() {
  return <LandingHero />
}
