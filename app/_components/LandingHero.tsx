"use client"

import Image from 'next/image'
import Link from 'next/link'
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

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 text-center sm:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col items-center gap-4 sm:gap-5"
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
            fontSize="clamp(3rem, 12vw, 11rem)"
            style={{ height: 'clamp(140px, 22vw, 340px)', width: '100%' }}
          />
          <p className="font-funnel max-w-xs text-sm text-white/80 sm:max-w-md sm:text-base md:text-lg">
            El puente entre tus raíces y el mundo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/visados"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#C8FF00] px-8 py-4 text-sm font-bold text-[#0d2b0d] shadow-[0_8px_30px_-8px_rgba(200,255,0,0.5)] transition-colors hover:bg-[#B5E600] sm:text-base"
          >
            Comienza tu viaje
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
