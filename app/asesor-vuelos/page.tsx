import RouteAdvisorForm from '@/components/RouteAdvisorForm'
import { Plane } from 'lucide-react'

export const metadata = {
  title: 'Asesor de Estrategia de Ruta | LATAM VISA',
  description: 'Obtén recomendaciones estratégicas personalizadas para tu ruta de vuelo hacia Australia, Europa y más.',
}

export default function AsesorVuelosPage() {
  return (
    <div className="min-h-screen bg-[#050505] relative pt-32 pb-20 selection:bg-[#C8FF00]/30">
      {/* Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#C8FF00]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C8FF00] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#C8FF00] text-xs uppercase tracking-widest font-medium mb-6">
            <Plane className="w-4 h-4" /> Inteligencia Estratégica
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-[PPMonumentExtended] mb-6">
            Planea tu ruta <br/><span className="text-[#C8FF00]">como un experto</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light font-sans max-w-2xl mx-auto leading-relaxed">
            Sin trucos, sin riesgos. Basados en tu perfil migratorio, analizaremos las rutas más lógicas y eficientes para tu viaje internacional.
          </p>
        </div>

        <RouteAdvisorForm />

        <div className="max-w-4xl mx-auto mt-20 text-center border-t border-white/10 pt-10">
          <p className="text-xs text-gray-500 font-sans max-w-3xl mx-auto leading-relaxed">
            LATAM VISA es una consultora especializada en viajes y educación internacional. No somos Agentes Migratorios Registrados (OMARA). Nuestras sugerencias de ruta son estratégicas, basadas en experiencia general, y no constituyen consejo legal migratorio. Es tu responsabilidad verificar los requisitos actualizados de visas de tránsito y salud con las autoridades competentes.
          </p>
        </div>
      </div>
    </div>
  )
}
