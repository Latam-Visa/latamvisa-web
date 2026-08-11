"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import WarpText from '@/components/WarpText'

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

      {/* Scrim so the title stays readable without hiding the photo */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35" />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <WarpText
            text="LATINOAMÉRICA"
            color="#FFFFFF"
            fontFamily="var(--font-monument)"
            fontWeight={800}
            warpStrength={0.14}
            warpScale={1.7}
            speed={0.5}
            pointerInfluence={0.45}
            pointerStrength={0.55}
            refraction={0.035}
            ripple
            letterSpacing="-0.04em"
            lineHeight={0.9}
            fontSize="clamp(5rem, 24vw, 26rem)"
            style={{ height: 'clamp(180px, 30vw, 480px)', width: '100%' }}
          />
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
