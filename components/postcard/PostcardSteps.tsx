'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PenTool, MapPin, Stamp, Mail, Sparkles, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

export default function PostcardSteps() {
  const steps = [
    {
      stepNumber: '01',
      title: 'El Mensaje (Lado Izquierdo)',
      Icon: PenTool,
      content:
        'Escribe lo que te dicte el corazón en la mitad izquierda de la postal, respetando la línea vertical que separa el área del mensaje de la zona de la dirección.',
      badgeTitle: 'Consejo de Escritura',
      badgeType: 'tip',
      badgeIcon: Info,
      badgeText:
        'Usa un bolígrafo tradicional para que la tinta no se corra en el viaje.',
    },
    {
      stepNumber: '02',
      title: 'La Dirección (Lado Derecho)',
      Icon: MapPin,
      content:
        'Escribe la dirección de tu familia en las líneas del lado derecho.',
      badgeTitle: 'Regla de Oro Australia Post',
      badgeType: 'golden',
      badgeIcon: AlertTriangle,
      badgeText:
        'Debes dejar un margen inferior de al menos 15mm completamente limpio de escritura en el borde inferior de la tarjeta. Asegúrate de que la dirección no esté a menos de 15mm del borde derecho. Escribe la CIUDAD y el PAÍS en INGLÉS y MAYÚSCULAS al final.',
    },
    {
      stepNumber: '03',
      title: 'La Estampilla Mágica',
      Icon: Stamp,
      content:
        'Pega la estampilla internacional en el recuadro superior derecho. Esta zona debe ocupar al menos los primeros 40mm desde el borde superior.',
      badgeTitle: 'Estampilla Internacional',
      badgeType: 'info',
      badgeIcon: Sparkles,
      badgeText:
        'Pide en el mostrador de Australia Post una estampilla para International Postcard.',
    },
    {
      stepNumber: '04',
      title: 'El Buzón Rojo',
      Icon: Mail,
      content:
        'Busca cualquier buzón rojo en la calle (Red Street Post Box de Australia Post) y déjala caer por la ranura. ¡Nosotros y el correo mundial haremos el resto!',
      badgeTitle: '¡Listo para Volar!',
      badgeType: 'success',
      badgeIcon: CheckCircle2,
      badgeText:
        'Los buzones rojos de calle procesan todo el correo postal hacia el exterior.',
    },
  ]

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <span className="font-mono text-xs text-[#0D2818]/70 uppercase tracking-widest block mb-2">
          Instrucciones Claras
        </span>
        <h2 className="font-monument text-2xl sm:text-4xl text-[#0D2818] uppercase tracking-tight font-black mb-3">
          4 Pasos Sencillos
        </h2>
        <p className="font-funnel text-lg sm:text-xl text-[#0D2818]/85 max-w-xl mx-auto leading-relaxed">
          Sigue estas indicaciones al pie de la letra para garantizar que tu postal llegue a las manos correctas.
        </p>
      </motion.div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {steps.map((step, idx) => {
          const Icon = step.Icon
          const BadgeIcon = step.badgeIcon

          return (
            <motion.div
              key={step.stepNumber}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#FAF8F5] border border-[#0D2818]/15 rounded-3xl p-7 sm:p-9 shadow-xl shadow-[#0D2818]/5 flex flex-col justify-between hover:shadow-2xl hover:shadow-[#0D2818]/10 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
            >
              {/* Header inside Card */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-monument text-4xl sm:text-5xl text-[#0D2818]/25 group-hover:text-[#0D2818]/40 transition-colors duration-300 font-black">
                    {step.stepNumber}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-[#0D2818] text-[#C8FF00] flex items-center justify-center shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Card Title & Content */}
                <h3 className="font-monument text-lg sm:text-xl text-[#0D2818] uppercase font-bold tracking-tight mb-3 leading-snug">
                  Paso {step.stepNumber}: {step.title}
                </h3>
                <p className="font-funnel text-base sm:text-lg text-[#0D2818]/90 leading-relaxed mb-6">
                  {step.content}
                </p>
              </div>

              {/* Styled Badge Component */}
              <div
                className={`p-4 rounded-2xl border text-sm sm:text-base font-funnel leading-relaxed ${
                  step.badgeType === 'golden'
                    ? 'bg-amber-500/15 border-amber-700/40 text-amber-950 font-medium'
                    : step.badgeType === 'tip'
                    ? 'bg-[#0D2818]/10 border-[#0D2818]/20 text-[#0D2818]'
                    : step.badgeType === 'success'
                    ? 'bg-emerald-600/15 border-emerald-800/30 text-emerald-950 font-medium'
                    : 'bg-blue-500/10 border-blue-700/20 text-blue-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-1.5 font-mono">
                  <BadgeIcon className="w-4 h-4 shrink-0" />
                  <span>{step.badgeTitle}</span>
                </div>
                <p className="text-sm sm:text-base leading-normal">{step.badgeText}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
