import type { Metadata } from 'next'
import localFont from 'next/font/local'
import PostcardShowcase from '@/components/postcard/PostcardShowcase'

// Loaded locally (Condensed/variable-weight variants, not the site-wide
// Extended/static weights from app/fonts.ts) for this page's specific design.
const ppMonument = localFont({
  src: '../../public/fonts/PPMonument/PPMonumentCondensed-Black.otf',
  display: 'swap',
})
const funnelDisplay = localFont({
  src: '../../public/fonts/Funnel_Display/FunnelDisplay-VariableFont_wght.ttf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Guía para enviar tu postal — LATAM VISA',
  description: 'Cuatro pasos para enviar tu postal desde Australia hasta la puerta de la persona que más amas, cumpliendo las reglas de Australia Post.',
  openGraph: {
    title: 'Guía para enviar tu postal — LATAM VISA',
    description: 'Cuatro pasos para enviar tu postal desde Australia hasta la puerta de la persona que más amas.',
    images: [{ url: '/postcard-frente.png', width: 1748, height: 1240, alt: 'Postal de LATAM VISA' }],
    locale: 'es_LA',
    type: 'website',
  },
}

export default function PostcardPage() {
  return (
    <main className="relative min-h-screen bg-[#b5e533] text-[#006837] selection:bg-[#006837] selection:text-[#b5e533]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
        }}
      />
      <PostcardShowcase monumentClassName={ppMonument.className} funnelClassName={funnelDisplay.className} />
    </main>
  )
}
