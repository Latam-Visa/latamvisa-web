'use client'

import React from 'react'

export default function PostcardFooter() {
  return (
    <footer className="w-full max-w-4xl mx-auto px-4 py-12 mt-6 text-center border-t border-[#0D2818]/15">
      {/* Emotional Message */}
      <div className="bg-[#FAF8F5] border border-[#0D2818]/20 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-md mb-8">
        <span className="text-3xl mb-3 block">💚</span>
        <p className="font-monument text-sm sm:text-base text-[#0D2818] uppercase tracking-wide leading-relaxed font-bold">
          Con amor y orgullo por tus logros,
        </p>
        <p className="font-funnel text-base sm:text-lg text-[#0D2818]/90 font-medium mt-1">
          El equipo de LATAM VISA.
        </p>
      </div>

      {/* Return Link Button */}
      <div className="flex flex-col items-center gap-3">
        <a
          href="https://www.latamvisatravel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#0D2818] hover:bg-[#0D2818]/90 text-[#C8FF00] font-monument text-xs sm:text-sm uppercase tracking-widest px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span>Visitar LATAM VISA Travel</span>
          <span>➔</span>
        </a>
        
        <p className="font-funnel text-xs text-[#0D2818]/60 mt-2">
          © {new Date().getFullYear()} LATAM VISA® — Asesoría Migratoria Premium. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
