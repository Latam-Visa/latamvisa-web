'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PostcardHeader() {
  return (
    <header className="w-full pt-10 sm:pt-14 pb-8 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
      {/* Massive Centered Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-64 h-24 sm:w-80 sm:h-28 md:w-[380px] md:h-32 mb-8 mx-auto"
      >
        <Image
          src="/logo.png"
          alt="LATAM VISA Logo"
          fill
          className="object-contain filter drop-shadow-md"
          priority
        />
      </motion.div>

      {/* Hero Title H1 - PPMonument Font */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-monument text-3xl sm:text-5xl md:text-6xl text-[#0D2818] uppercase tracking-tight leading-[1.08] font-black mb-6 max-w-3xl"
      >
        Guía para enviar tu postal a la persona que más amas, en el país que esté.
      </motion.h1>

      {/* Subtitle - Large & Readable for Mobile */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-funnel text-xl sm:text-2xl text-[#0D2818]/90 font-normal leading-relaxed max-w-2xl"
      >
        Sigue estos 4 pasos rápidos para enviar tu postal desde Australia hasta la puerta de tu casa.
      </motion.p>
    </header>
  )
}
