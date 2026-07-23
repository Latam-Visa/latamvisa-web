import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Image from 'next/image'
import { MapPin, PenTool, Sparkles, Send } from 'lucide-react'

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
  description: 'Guía para enviar tu postal a la persona que más amas, en el país que esté.',
}

export default function PostcardPage() {
  const steps = [
    {
      number: '01',
      title: 'El Mensaje',
      icon: PenTool,
      desc: 'Escribe lo que te dicte el corazón en la mitad izquierda de la postal. Usa un bolígrafo tradicional para que la tinta no se corra.',
    },
    {
      number: '02',
      title: 'La Dirección',
      icon: MapPin,
      desc: 'Escribe la dirección en el lado derecho. REGLA DE ORO: Deja 15mm limpios en el borde inferior. Escribe CIUDAD y PAÍS en INGLÉS y MAYÚSCULAS.',
    },
    {
      number: '03',
      title: 'La Estampilla',
      icon: Sparkles,
      desc: 'Pega la estampilla internacional en el recuadro superior derecho. Esta zona debe ocupar los primeros 40mm desde el borde superior.',
    },
    {
      number: '04',
      title: 'El Buzón',
      icon: Send,
      desc: 'Déjala caer en cualquier buzón rojo de Australia Post en la calle. ¡Nosotros y el correo mundial haremos el resto!',
    },
  ]

  return (
    <main
      className={`${ppMonument.variable} ${funnelDisplay.variable} min-h-screen bg-[#C8FF00] text-[#0D2818] relative overflow-hidden font-funnel selection:bg-[#0D2818] selection:text-[#C8FF00]`}
    >
      {/* Paper Noise Filter */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-20 mix-blend-multiply">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative z-20 w-full max-w-5xl mx-auto px-5 py-12 flex flex-col items-center">
        
        {/* 1. MASSIVE LOGO (No top banner) */}
        <div className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-lg aspect-[3/1] mb-10">
          <Image
            src="/logo.png"
            alt="LATAM VISA"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* 2. HERO COPY */}
        <h1 className="font-monument text-3xl sm:text-5xl lg:text-6xl text-center uppercase leading-[1.05] tracking-tight font-black max-w-4xl mb-6">
          Guía para enviar tu postal a la persona que más amas, en el país que esté.
        </h1>
        <p className="font-funnel text-xl sm:text-2xl text-center opacity-90 max-w-3xl mb-16 leading-relaxed">
          Sigue estos rápidos pasos para garantizar que tu postal llegue desde Australia hasta la puerta de su casa.
        </p>

        {/* 3. REAL PNG SHOWCASE */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="flex flex-col items-center">
            <span className="font-monument text-sm tracking-widest uppercase mb-4 opacity-80">El Frente</span>
            <div className="relative w-full aspect-[1.48/1] rounded-3xl overflow-hidden shadow-2xl shadow-[#0D2818]/20 border border-[#0D2818]/10 bg-white">
              <Image src="/Postcards/postcard-frente.png" alt="Frente de la postal" fill className="object-contain p-2" priority />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-monument text-sm tracking-widest uppercase mb-4 opacity-80">El Reverso (Instrucciones)</span>
            <div className="relative w-full aspect-[1.48/1] rounded-3xl overflow-hidden shadow-2xl shadow-[#0D2818]/20 border border-[#0D2818]/10 bg-white">
              <Image src="/Postcards/postcard-back.png" alt="Dorso de la postal" fill className="object-contain p-2" priority />
            </div>
          </div>
        </div>

        {/* 4. PREMIUM UI STEPS (No emojis, soft rounded cards) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-[#0D2818]/10 border border-[#0D2818]/10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-monument text-5xl font-black text-[#0D2818]/20">
                    {step.number}
                  </span>
                  <div className="w-16 h-16 bg-[#0D2818] rounded-[20px] shadow-lg flex items-center justify-center text-white">
                    <Icon size={32} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="font-monument text-xl sm:text-2xl uppercase font-black mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="font-funnel text-lg sm:text-xl opacity-90 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* 5. PREMIUM BUTTON */}
        <div className="w-full flex justify-center mb-10">
          <a
            href="https://www.latamvisatravel.com"
            className="w-full sm:w-auto bg-[#0D2818] hover:bg-[#081b10] text-white text-lg sm:text-xl font-monument uppercase tracking-wider text-center py-6 px-12 rounded-3xl shadow-2xl shadow-[#0D2818]/30 transition-transform active:scale-95"
          >
            Visitar LATAM VISA
          </a>
        </div>
        
        <p className="font-funnel text-sm opacity-60">
          © {new Date().getFullYear()} LATAM VISA®. Todos los derechos reservados.
        </p>

      </div>
    </main>
  )
}
