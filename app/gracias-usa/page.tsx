import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function GraciasUsa() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-32 pb-20 px-4 flex items-center justify-center selection:bg-[#C8FF00]/30">
      <div className="max-w-xl w-full bg-white border border-[#E5E5E5] rounded-2xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#C8FF00]/10 blur-[60px] rounded-full pointer-events-none" />

        <CheckCircle className="w-20 h-20 text-[#C8FF00] mx-auto mb-6" />
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-3 font-[PPMonumentExtended]">
          ¡Aplicación recibida!
        </h1>
        
        <h2 className="text-[#C8FF00] font-bold text-lg mb-6">
          Hemos recibido tu información correctamente.
        </h2>
        
        <p className="text-[#525252] leading-relaxed mb-10">
          Te enviamos a tu email un PDF con todos los datos que llenaste. Nuestro equipo va a revisar tu información y te contactaremos por WhatsApp en menos de 24 horas con los siguientes pasos para tu DS-160.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {/* PLACEHOLDER: Change to +61426779731 when ready */}
          <a 
            href="https://wa.me/61450000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 bg-[#C8FF00] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#B5E600] transition-colors shadow-[0_4px_0_0_rgba(0,0,0,0.05)]"
          >
            Contactar por WhatsApp
          </a>
          
          <Link 
            href="/visados"
            className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="text-[#A3A3A3] text-xs max-w-sm mx-auto">
          LATAM VISA es una consultora de planeación de viaje y estudio. No somos agentes registrados de migración.
        </p>
      </div>
    </div>
  )
}