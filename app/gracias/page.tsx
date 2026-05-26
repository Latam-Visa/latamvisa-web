'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, BedSingle, Map, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function GraciasPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#FAFAF7] flex flex-col items-center justify-center p-6 sm:p-12">
      <motion.div 
        className="max-w-3xl w-full flex flex-col items-center text-center space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* HERO / CONFIRMATION */}
        <motion.div variants={itemVariants} className="flex flex-col items-center space-y-6 mt-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.1 }}
          >
            <CheckCircle2 className="w-20 h-20 text-[#C8FF00]" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-normal tracking-wide">
            ¡Gracias por confiar en LATAM VISA!
          </h1>
          <p className="text-lg md:text-xl text-[#A3A3A3] max-w-2xl leading-relaxed">
            Recibimos tu pago correctamente. En breve recibirás un correo con el enlace de tu formulario para empezar tu solicitud.
          </p>
          <p className="text-sm text-[#777777]">
            Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso).
          </p>
        </motion.div>

        {/* PRÓXIMAMENTE TRAVEL TEASER SECTION */}
        <motion.div 
          variants={itemVariants} 
          className="w-full bg-[#111111] rounded-3xl p-8 md:p-12 flex flex-col items-center text-center space-y-8 border border-white/5"
        >
          <div className="bg-[#C8FF00] text-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
            Próximamente
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-normal tracking-wide">
              Muy pronto: Viajes de turismo completos
            </h2>
            <p className="text-[#A3A3A3] leading-relaxed">
              Estamos preparando algo grande para ti: paquetes de viaje completos a tu destino, con estadía incluida, itinerarios y tips de expertos para que vivas la experiencia sin preocuparte por nada. Tu visa es solo el comienzo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-4">
            {/* Card 1 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -5, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <BedSingle className="w-6 h-6 text-[#C8FF00]" />
              </div>
              <h3 className="text-lg font-medium">Estadía incluida</h3>
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                Hoteles y hostales seleccionados en tu destino.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -5, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <Map className="w-6 h-6 text-[#C8FF00]" />
              </div>
              <h3 className="text-lg font-medium">Itinerarios listos</h3>
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                Rutas y experiencias armadas para aprovechar al máximo.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -5, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <Lightbulb className="w-6 h-6 text-[#C8FF00]" />
              </div>
              <h3 className="text-lg font-medium">Tips de expertos</h3>
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                Consejos prácticos de quienes ya conocen el camino.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* FOOTER LINK */}
        <motion.div variants={itemVariants} className="pt-8 pb-12">
          <Link 
            href="https://latamvisatravel.com" 
            className="text-[#777777] hover:text-[#C8FF00] transition-colors text-sm tracking-wide"
          >
            Volver a latamvisatravel.com
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
