'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, BedSingle, Map, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function GraciasPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <main className="relative w-full h-screen max-h-screen bg-[#050505] text-[#FAFAF7] flex flex-col items-center justify-center overflow-y-auto lg:overflow-hidden p-4 sm:p-8">
      
      {/* BACKGROUND ELEMENTS */}
      {/* Subtle global radial glow from top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.06)_0%,_rgba(5,5,5,0)_70%)] pointer-events-none" />

      {/* Very faint floating particle / subtle moving glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#C8FF00] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
      />

      <motion.div 
        className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-6 md:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* HERO / CONFIRMATION */}
        <motion.div variants={itemVariants} className="flex flex-col items-center space-y-3">
          <div className="relative">
            {/* Pulsing glow behind checkmark */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#C8FF00] rounded-full blur-xl opacity-50"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="relative z-10 bg-[#050505] rounded-full"
            >
              <CheckCircle2 className="w-14 h-14 md:w-16 md:h-16 text-[#C8FF00]" strokeWidth={1.5} />
            </motion.div>
          </div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-wide">
            ¡Gracias por confiar en LATAM VISA!
          </h1>
          <p className="text-base md:text-lg text-[#A3A3A3] max-w-2xl leading-relaxed">
            Recibimos tu pago correctamente. En breve recibirás un correo con el enlace de tu formulario para empezar tu solicitud.
          </p>
          <p className="text-xs md:text-sm text-[#777777]">
            Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso).
          </p>
        </motion.div>

        {/* PRÓXIMAMENTE TRAVEL TEASER SECTION */}
        <motion.div 
          variants={itemVariants} 
          className="w-full bg-[#111111]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 flex flex-col items-center text-center space-y-5 md:space-y-6 border border-white/5 shadow-2xl shadow-black/50"
        >
          <div className="bg-[#C8FF00] text-black text-[10px] md:text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
            Próximamente
          </div>
          
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-normal tracking-wide">
              Muy pronto: Viajes de turismo completos
            </h2>
            <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed px-4 md:px-12">
              Estamos preparando algo grande para ti: paquetes de viaje completos a tu destino, con estadía incluida, itinerarios y tips de expertos para que vivas la experiencia sin preocuparte por nada. Tu visa es solo el comienzo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 w-full pt-2">
            {/* Card 1 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center space-y-3 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <BedSingle className="w-5 h-5 text-[#C8FF00]" />
              </div>
              <h3 className="text-base font-medium">Estadía incluida</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Hoteles y hostales seleccionados en tu destino.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center space-y-3 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <Map className="w-5 h-5 text-[#C8FF00]" />
              </div>
              <h3 className="text-base font-medium">Itinerarios listos</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Rutas y experiencias armadas para aprovechar al máximo.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, borderColor: 'rgba(200, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(200, 255, 0, 0.15)' }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center space-y-3 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-[#050505] flex items-center justify-center border border-white/10">
                <Lightbulb className="w-5 h-5 text-[#C8FF00]" />
              </div>
              <h3 className="text-base font-medium">Tips de expertos</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Consejos prácticos de quienes ya conocen el camino.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* FOOTER LINK */}
        <motion.div variants={itemVariants} className="pt-2">
          <Link 
            href="https://latamvisatravel.com" 
            className="text-[#777777] hover:text-[#C8FF00] transition-colors text-xs md:text-sm tracking-wide"
          >
            Volver a latamvisatravel.com
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
