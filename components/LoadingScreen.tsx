'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function LoadingScreen() {
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setDone(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center gap-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src="/logo.png" alt="LATAM VISA" width={160} height={48} className="h-12 w-auto object-contain" priority />
          </motion.div>

          {/* Progress bar */}
          <div className="w-32 h-px bg-[#1A1A1A] relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#C8FF00]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
            />
          </div>

          {/* Tag */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-monument font-light text-[10px] tracking-[0.4em] uppercase text-[#8A8A8A]"
          >
            Asesoría Migratoria Premium
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
