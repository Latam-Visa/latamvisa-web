'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 600
      const form = document.getElementById('evaluacion')
      if (form) {
        const rect = form.getBoundingClientRect()
        setFormVisible(rect.top < window.innerHeight && rect.bottom > 0)
      }
      setShow(scrolled)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && !formVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#050505]/95 backdrop-blur-md border-t border-[#1A1A1A] px-4 py-3 safe-area-pb"
        >
          <Link
            href="#evaluacion"
            className="block w-full py-3.5 bg-[#C8FF00] text-black text-center font-monument font-light text-sm tracking-widest uppercase hover:bg-[#A8D900] transition-colors"
          >
            Evalúa tu perfil gratis →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
