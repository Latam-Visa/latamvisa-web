'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, ShieldAlert, Sparkles } from 'lucide-react'

export default function PostcardShowcase() {
  const [activeTab, setActiveTab] = useState<'back' | 'front'>('back')

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto px-4 py-4 mb-8"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
        <div>
          <span className="font-mono text-xs text-[#0D2818]/70 uppercase tracking-widest block mb-1">
            Diseño Oficial LATAM VISA
          </span>
          <h2 className="font-monument text-xl sm:text-3xl text-[#0D2818] uppercase tracking-tight font-black">
            Vista Previa de tu Postal
          </h2>
        </div>

        {/* Interactive Tab Toggle */}
        <div className="inline-flex p-1.5 bg-[#0D2818]/10 rounded-2xl border border-[#0D2818]/15 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('back')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-monument uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'back'
                ? 'bg-[#0D2818] text-white shadow-md'
                : 'text-[#0D2818]/80 hover:text-[#0D2818]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Reverso (Instrucciones)</span>
          </button>
          <button
            onClick={() => setActiveTab('front')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-monument uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'front'
                ? 'bg-[#0D2818] text-white shadow-md'
                : 'text-[#0D2818]/80 hover:text-[#0D2818]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Frente</span>
          </button>
        </div>
      </div>

      {/* Canva Asset Display Frame */}
      <div className="bg-[#FAF8F5] border-2 border-[#0D2818]/15 rounded-3xl p-4 sm:p-8 shadow-2xl shadow-[#0D2818]/10 overflow-hidden relative">
        <div className="relative w-full aspect-[1.5/1] sm:aspect-[1.58/1] rounded-2xl overflow-hidden shadow-lg border border-[#0D2818]/10 bg-white">
          {activeTab === 'back' ? (
            <Image
              src="/Postcards/postcard-back.png"
              alt="Reverso de la postal LATAM VISA con guías"
              fill
              className="object-contain p-2"
              priority
            />
          ) : (
            <Image
              src="/Postcards/postcard-frente.png"
              alt="Frente ilustrado de la postal LATAM VISA"
              fill
              className="object-contain p-2"
              priority
            />
          )}
        </div>

        {/* Visual Callout for Australia Post Margin */}
        {activeTab === 'back' && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-700/30 rounded-2xl flex items-start gap-3 text-[#0D2818]">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-funnel text-sm sm:text-base leading-relaxed">
              <strong className="font-bold">Nota de Australia Post:</strong> Observa la franja blanca inferior en el reverso. Es vital dejar los últimos 15mm completamente libres de texto para que los escáneres postales procesen la entrega a Latinoamérica.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
