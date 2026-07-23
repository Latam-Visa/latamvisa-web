import type { Metadata } from 'next'
import localFont from 'next/font/local'
import PostcardHeader from '@/components/postcard/PostcardHeader'
import PostcardShowcase from '@/components/postcard/PostcardShowcase'
import PostcardDiagram from '@/components/postcard/PostcardDiagram'
import PostcardSteps from '@/components/postcard/PostcardSteps'
import PostcardFooter from '@/components/postcard/PostcardFooter'

const ppMonument = localFont({
  src: '../../public/fonts/PPMonument/PPMonumentCondensed-Black.otf',
  variable: '--font-monument',
  display: 'swap',
})

const funnelDisplay = localFont({
  src: '../../public/fonts/Funnel_Display/FunnelDisplay-VariableFont_wght.ttf',
  variable: '--font-funnel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Guía para enviar tu postal — LATAM VISA',
  description:
    'Guía para enviar tu postal a la persona que más amas, en el país que esté. Aprende cómo llenar tu postal física desde Australia cumpliendo con Australia Post.',
  openGraph: {
    title: 'Guía para enviar tu postal — LATAM VISA',
    description:
      'Guía para enviar tu postal a la persona que más amas, en el país que esté.',
    images: ['/logo.png'],
  },
}

export default function PostcardPage() {
  return (
    <main
      className={`${ppMonument.variable} ${funnelDisplay.variable} min-h-screen bg-[#C8FF00] text-[#0D2818] relative overflow-hidden font-funnel selection:bg-[#0D2818] selection:text-[#C8FF00] pb-12`}
    >
      {/* Paper Texture Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-20 mix-blend-multiply">
        <svg className="w-full h-full">
          <filter id="postcard-paper-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#postcard-paper-noise)"
          />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center min-h-screen">
        <PostcardHeader />
        <PostcardShowcase />
        <PostcardDiagram />
        <PostcardSteps />
        <PostcardFooter />
      </div>
    </main>
  )
}
