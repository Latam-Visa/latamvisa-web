import RouteAdvisorForm from '@/components/RouteAdvisorForm'

export const metadata = {
  title: 'Asesor de Estrategia de Ruta | LATAM VISA',
  description: 'Obtén recomendaciones estratégicas personalizadas para tu ruta de vuelo hacia Australia, Europa y más.',
}

export default function AsesorVuelosPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative pt-32 pb-20 selection:bg-[#C8FF00]/30 flex items-center justify-center overflow-hidden">
      {/* Light sky/cloud-like background accents */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#C8FF00]/10 via-white/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-multiply"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <RouteAdvisorForm />

        <div className="max-w-4xl mx-auto mt-12 text-center pt-8">
          <p className="text-xs text-gray-500 font-sans max-w-3xl mx-auto leading-relaxed">
            LATAM VISA es una consultora especializada en viajes y educación internacional. No somos Agentes Migratorios Registrados (OMARA). Nuestras sugerencias de ruta son estratégicas, basadas en experiencia general, y no constituyen consejo legal migratorio. Es tu responsabilidad verificar los requisitos actualizados de visas de tránsito y salud con las autoridades competentes.
          </p>
        </div>
      </div>
    </div>
  )
}
