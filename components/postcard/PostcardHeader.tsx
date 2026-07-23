'use client'

import Image from 'next/image'

export default function PostcardHeader() {
  return (
    <header className="w-full pt-8 pb-6 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
      {/* Brand Badge & Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#0D2818] text-[#C8FF00] px-3.5 py-1 rounded-full text-xs font-mono tracking-wider uppercase mb-5 shadow-sm inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse"></span>
          Guía de Envío Postal • Australia Post
        </div>
        
        <div className="relative w-44 h-14 sm:w-52 sm:h-16 mb-2">
          <Image
            src="/logo.png"
            alt="LATAM VISA Logo"
            fill
            className="object-contain filter drop-shadow-sm"
            priority
          />
        </div>
      </div>

      {/* Main Title H1 */}
      <h1 className="font-monument text-3xl sm:text-5xl md:text-6xl text-[#0D2818] uppercase tracking-tight leading-[1.05] font-black mb-4 max-w-3xl">
        Tu abrazo en papel está a punto de viajar.
      </h1>

      {/* Subtitle */}
      <p className="font-funnel text-lg sm:text-xl md:text-2xl text-[#0D2818]/90 font-normal leading-relaxed max-w-2xl">
        Sigue estos 4 pasos rápidos para enviar tu postal desde Australia hasta la puerta de tu casa.
      </p>

      {/* Quick Visual Bar */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-funnel uppercase tracking-widest text-[#0D2818]/70 bg-[#0D2818]/5 px-4 py-2 rounded-full border border-[#0D2818]/10">
        <span>🇦🇺 Australia</span>
        <span>➔</span>
        <span>🌎 Latinoamérica</span>
      </div>
    </header>
  )
}
