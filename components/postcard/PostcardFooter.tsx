'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowUpRight } from 'lucide-react'

export default function PostcardFooter() {
  return (
    <footer className="w-full max-w-4xl mx-auto px-4 py-12 mt-6 text-center border-t border-[#0D2818]/15">
      {/* Emotional Message Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FAF8F5] border border-[#0D2818]/15 rounded-3xl p-8 sm:p-10 max-w-xl mx-auto shadow-xl shadow-[#0D2818]/5 mb-10 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-[#0D2818]/10 text-[#0D2818] flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 fill-[#0D2818]" />
        </div>
        <p className="font-monument text-base sm:text-lg text-[#0D2818] uppercase tracking-wide leading-relaxed font-bold">
          Con amor y orgullo por tus logros,
        </p>
        <p className="font-funnel text-lg sm:text-xl text-[#0D2818]/90 font-medium mt-1">
          El equipo de LATAM VISA.
        </p>
      </motion.div>

      {/* Redesigned Primary Button - Deep Forest Green */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <a
          href="https://www.latamvisatravel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#0D2818] hover:bg-[#07170E] text-[#FAF8F5] font-monument text-sm sm:text-base uppercase tracking-wider py-5 px-8 sm:px-10 rounded-2xl shadow-xl shadow-[#0D2818]/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
        >
          <span>Visitar LATAM VISA Travel</span>
          <ArrowUpRight className="w-5 h-5" />
        </a>

        <p className="font-funnel text-sm text-[#0D2818]/70 mt-2">
          © {new Date().getFullYear()} LATAM VISA® — Asesoría Migratoria Premium. Todos los derechos reservados.
        </p>
      </motion.div>
    </footer>
  )
}
