"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

export function LandingHero() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0d2b0d]">
      <Image
        src="/toto-la-momposina.jpg"
        alt="Totó la Momposina"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />

      {/* Strong dark scrim — photo reads as a moody near-black backdrop so the neon wordmark pops */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <h1
            className="w-full text-center font-black uppercase text-[#C8FF00]"
            style={{
              fontFamily: 'var(--font-monument-black)',
              fontSize: 'clamp(2.75rem, 13vw, 11rem)',
              letterSpacing: '-0.05em',
              lineHeight: 0.85,
            }}
          >
            LATINOAMÉRICA
          </h1>
        </motion.div>
      </div>

      {/* Bottom-left credit, like a magazine photo caption */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-6 left-6 z-10 max-w-[200px] text-left sm:bottom-8 sm:left-8 sm:max-w-[260px]"
      >
        <p className="font-funnel text-xs leading-snug text-white/70 sm:text-sm">
          El puente entre tus raíces y el mundo
        </p>
        <p className="font-funnel mt-1.5 text-[10px] uppercase tracking-widest text-white/45 sm:text-xs">
          Totó la Momposina
        </p>
      </motion.div>
    </main>
  )
}
