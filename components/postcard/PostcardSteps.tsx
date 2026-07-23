'use client'

import React from 'react'

export default function PostcardSteps() {
  const steps = [
    {
      stepNumber: '01',
      title: 'El Mensaje (Lado Izquierdo)',
      emoji: '✍️',
      content:
        'Escribe lo que te dicte el corazón en la mitad izquierda de la postal, respetando la línea vertical que separa el área del mensaje de la zona de la dirección.',
      badge: 'Tip de Escritura',
      badgeType: 'tip',
      badgeText:
        'Usa un bolígrafo tradicional para que la tinta no se corra en el viaje.',
    },
    {
      stepNumber: '02',
      title: 'La Dirección (Lado Derecho)',
      emoji: '📍',
      content:
        'Escribe la dirección de tu familia en las líneas del lado derecho.',
      badge: 'Regla de Oro Australia Post',
      badgeType: 'golden',
      badgeText:
        'Debes dejar un margen inferior de al menos 15mm completamente limpio de escritura en el borde inferior de la tarjeta. Asegúrate de que la dirección no esté a menos de 15mm del borde derecho. Escribe la CIUDAD y el PAÍS en INGLÉS y MAYÚSCULAS al final.',
    },
    {
      stepNumber: '03',
      title: 'La Estampilla Mágica',
      emoji: '📯',
      content:
        'Pega la estampilla internacional en el recuadro superior derecho. Esta zona debe ocupar al menos los primeros 40mm desde el borde superior.',
      badge: 'Zona de Estampilla',
      badgeType: 'info',
      badgeText:
        'Asegúrate de adquirir una estampilla para International Postcard en la oficina de Australia Post.',
    },
    {
      stepNumber: '04',
      title: 'El Buzón Rojo',
      emoji: '📮',
      content:
        'Busca cualquier buzón rojo en la calle (Red Street Post Box de Australia Post) y déjala caer por la ranura. ¡Nosotros y el correo mundial haremos el resto!',
      badge: 'Envío Final',
      badgeType: 'success',
      badgeText:
        'Los buzones rojos aceptan envíos estándar e internacionales en toda Australia.',
    },
  ]

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="font-monument text-2xl sm:text-4xl text-[#0D2818] uppercase tracking-tight font-black mb-2">
          Guía Paso a Paso
        </h2>
        <p className="font-funnel text-base sm:text-lg text-[#0D2818]/80 max-w-xl mx-auto">
          Sigue estas instrucciones al pie de la letra para que tu postal llegue sin inconvenientes.
        </p>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="bg-[#FAF8F5] border-2 border-[#0D2818] rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
          >
            {/* Step Number Decorative Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-monument text-3xl sm:text-4xl text-[#0D2818] font-black opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                {step.stepNumber}
              </span>
              <span className="text-3xl sm:text-4xl p-2 bg-[#0D2818]/5 rounded-xl border border-[#0D2818]/10">
                {step.emoji}
              </span>
            </div>

            {/* Card Content */}
            <div className="mb-4">
              <h3 className="font-monument text-base sm:text-lg text-[#0D2818] uppercase font-bold tracking-tight mb-2 leading-snug">
                Paso {step.stepNumber}: {step.title}
              </h3>
              <p className="font-funnel text-sm sm:text-base text-[#0D2818]/90 leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Badge / Tip / Golden Rule */}
            <div
              className={`mt-2 p-3.5 rounded-xl border text-xs sm:text-sm font-funnel leading-normal ${
                step.badgeType === 'golden'
                  ? 'bg-amber-500/15 border-amber-700/40 text-amber-950 font-medium'
                  : step.badgeType === 'tip'
                  ? 'bg-[#0D2818]/10 border-[#0D2818]/20 text-[#0D2818]'
                  : step.badgeType === 'success'
                  ? 'bg-emerald-600/15 border-emerald-800/30 text-emerald-950 font-medium'
                  : 'bg-blue-500/10 border-blue-700/20 text-blue-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1 font-mono">
                {step.badgeType === 'golden' && <span>⭐ {step.badge}</span>}
                {step.badgeType === 'tip' && <span>💡 {step.badge}</span>}
                {step.badgeType === 'info' && <span>ℹ️ {step.badge}</span>}
                {step.badgeType === 'success' && <span>🚀 {step.badge}</span>}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{step.badgeText}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
