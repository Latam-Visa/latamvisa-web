'use client'

import React from 'react'

export default function PostcardDiagram() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-4 mb-4">
      {/* Container header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-monument text-lg sm:text-xl text-[#0D2818] uppercase tracking-wide flex items-center gap-2">
          <span>📮</span> Esquema de la Postal
        </h2>
        <span className="text-xs font-mono text-[#0D2818]/70 bg-[#0D2818]/10 px-2.5 py-1 rounded-full">
          Australia Post Standard
        </span>
      </div>

      {/* Postcard visual card */}
      <div className="relative w-full bg-[#FAF8F3] border-2 border-[#0D2818] rounded-xl p-4 sm:p-6 shadow-xl overflow-hidden text-[#0D2818]">
        {/* Air Mail Header Badge */}
        <div className="flex justify-between items-center border-b border-[#0D2818]/20 pb-3 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-[#0D2818] text-[#C8FF00] px-3 py-1 rounded text-xs font-mono font-bold tracking-widest uppercase">
            <span>✈️</span> PAR AVION / BY AIR MAIL
          </div>
          <span className="text-[11px] font-mono text-[#0D2818]/60 uppercase hidden sm:inline">
            Postal Card Size ~ 105 x 148 mm
          </span>
        </div>

        {/* Main Postcard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[260px] pb-10">
          {/* Left Column: Message Side */}
          <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-[#0D2818]/30 pr-0 md:pr-6 pb-6 md:pb-0">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-monument text-xs uppercase tracking-wider text-[#0D2818]/80 bg-[#0D2818]/10 px-2 py-0.5 rounded">
                  Lado Izquierdo
                </span>
                <span className="text-xs font-funnel text-[#0D2818]/70">✍️ Tu Mensaje</span>
              </div>
              <p className="font-funnel text-xs sm:text-sm text-[#0D2818]/70 italic leading-relaxed mb-4">
                "Querida familia, ¡un saludo enorme desde Australia! Todo ha sido una aventura increíble..."
              </p>
            </div>
            
            <div className="bg-[#0D2818]/5 rounded p-2.5 border border-[#0D2818]/10 text-[11px] font-funnel text-[#0D2818]/80 flex items-start gap-2">
              <span className="text-base leading-none">💡</span>
              <span>Usa bolígrafo tradicional de tinta seca para evitar borrones durante el viaje internacional.</span>
            </div>
          </div>

          {/* Right Column: Stamp & Address */}
          <div className="flex flex-col justify-between pl-0 md:pl-2 relative">
            {/* Top Right Stamp Zone (40mm indicator) */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="font-monument text-xs uppercase tracking-wider text-[#0D2818]/80 bg-[#0D2818]/10 px-2 py-0.5 rounded w-fit mb-1">
                  Lado Derecho
                </span>
                <span className="text-xs font-funnel text-[#0D2818]/70">📍 Datos de Destino</span>
              </div>

              {/* Stamp Box */}
              <div className="w-24 h-20 sm:w-28 sm:h-24 border-2 border-dashed border-[#0D2818]/60 rounded bg-[#0D2818]/5 flex flex-col items-center justify-center text-center p-1 relative shadow-inner">
                <span className="text-lg">📯</span>
                <span className="font-monument text-[9px] uppercase leading-tight font-bold text-[#0D2818]">
                  Estampilla
                </span>
                <span className="font-mono text-[9px] text-[#0D2818]/70 mt-0.5">
                  Top 40mm
                </span>
                {/* Visual dimension tag */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-[9px] font-mono text-[#0D2818]/70">
                  <span>≥ 40mm</span>
                  <span className="ml-1">➔</span>
                </div>
              </div>
            </div>

            {/* Address Lines */}
            <div className="space-y-2 font-mono text-xs text-[#0D2818]/80 my-2">
              <div className="border-b border-[#0D2818]/40 pb-1 flex justify-between items-center">
                <span className="text-[#0D2818]/50">Nombre:</span>
                <span className="font-semibold text-[#0D2818]">Familia Perez Gomez</span>
              </div>
              <div className="border-b border-[#0D2818]/40 pb-1 flex justify-between items-center">
                <span className="text-[#0D2818]/50">Calle:</span>
                <span>Calle 45 # 12 - 34, Apt 501</span>
              </div>
              <div className="border-b border-[#0D2818]/40 pb-1 flex justify-between items-center bg-[#0D2818]/10 px-1 py-0.5 rounded">
                <span className="text-[#0D2818]/70 font-bold">CIUDAD / PAÍS:</span>
                <span className="font-monument text-xs font-bold text-[#0D2818] uppercase">
                  BOGOTA, COLOMBIA
                </span>
              </div>
            </div>

            <p className="text-[10px] font-funnel text-[#0D2818]/70 text-right mt-1">
              ⚠️ Escribir siempre Ciudad y País en <strong>INGLÉS y MAYÚSCULAS</strong>.
            </p>
          </div>
        </div>

        {/* Golden Rule Bottom Margin Highlight (15mm) */}
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-red-500/10 border-t-2 border-red-500/40 flex items-center justify-between px-4 text-red-950 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span>🚫 MARGEN INFERIOR 15mm LIBRE (Regla de Oro Australia Post)</span>
          </div>
          <span className="font-bold hidden sm:inline text-red-700">Sin escrituras ni sellos aquí</span>
        </div>
      </div>
    </section>
  )
}
