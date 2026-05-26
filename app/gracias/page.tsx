'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import confetti from 'canvas-confetti'
import bgImage from './bg.jpg'

export default function GraciasPage() {
  useEffect(() => {
    const fireConfetti = () => {
      const colors = ['#C8FF00', '#FFFFFF', '#E8FF7A']
      
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.35 },
        colors: colors,
        disableForReducedMotion: true
      })

      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.4 },
          colors: colors,
          disableForReducedMotion: true
        })
      }, 400)
    }

    fireConfetti()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center text-[#FAFAF7]">
      
      {/* BACKGROUND IMAGE & TINT OVERLAYS */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage}
          alt="Paisaje de fondo LATAM VISA"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Darkening base layer to ensure contrast */}
        <div className="absolute inset-0 bg-[#050505]/60" />
        {/* Neon green tint */}
        <div className="absolute inset-0 bg-[#C8FF00]/15 mix-blend-color" />
        {/* Radial vignette drawing focus to center text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(5,5,5,0)_0%,_rgba(5,5,5,0.85)_100%)]" />
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.1 }}
          className="relative mb-4"
        >
          {/* Subtle glow behind the checkmark */}
          <div className="absolute inset-0 bg-[#C8FF00] rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="relative z-10 bg-[#050505]/40 rounded-full p-1 backdrop-blur-sm border border-white/10">
            <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-[#C8FF00]" strokeWidth={1.5} />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-wide leading-tight drop-shadow-lg">
            ¡Gracias por confiar en LATAM VISA!
          </h1>
          
          <p className="text-lg md:text-xl text-[#E5E5E5] leading-relaxed max-w-lg mx-auto font-light drop-shadow-md">
            Recibimos tu pago. En breve te llega un correo con el enlace de tu formulario.
          </p>
          
          <p className="text-sm md:text-base text-[#A3A3A3] font-light">
            Revisa tu bandeja de entrada (y spam, por si acaso).
          </p>
        </motion.div>

        {/* FOOTER LINK */}
        <motion.div variants={itemVariants} className="pt-16">
          <Link 
            href="https://latamvisatravel.com" 
            className="group flex flex-col items-center gap-1 text-sm text-[#A3A3A3] hover:text-[#FAFAF7] transition-colors tracking-wide"
          >
            <span>Volver a latamvisatravel.com</span>
            <span className="w-0 h-[1px] bg-[#C8FF00] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
