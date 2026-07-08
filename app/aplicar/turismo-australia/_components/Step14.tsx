import { DocumentUploader } from './DocumentUploader'

export function Step14() {
  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-6">
        <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Documentos de Soporte</h3>
        <p className="text-sm text-[#525252] mb-4">Evidencia para respaldar tu aplicación</p>

        <div className="space-y-8">

          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-4">Grupo 1: Arraigo (tus vínculos con tu país)</h4>
            <DocumentUploader
              name="step14.doc_group1_arraigo"
              label="Sube aquí todos los documentos de este grupo"
              multiple
              specsList={[
                'Certificado laboral o prueba de trabajo estable / independiente',
                'Prueba de estudios (si aplica)',
                'Certificados de propiedad (tradición y libertad / catastral)',
                'Tarjeta de propiedad de vehículo (si aplica)',
                'Registros civiles de vínculos familiares (hijos, hermanos, padres)',
              ]}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-4">Grupo 2: Evidencia de fondos y/o financiación</h4>
            <DocumentUploader
              name="step14.doc_group2_fondos"
              label="Sube aquí todos los documentos de este grupo"
              multiple
              specsList={[
                'Extractos bancarios (últimos 3–6 meses)',
                'Prueba de pensión o ingresos (si aplica)',
                'Si un patrocinador en Australia cubre el viaje, incluye también:',
                'Prueba de dirección del patrocinador',
                'Evidencia de relación con el patrocinador',
                'Payslips del patrocinador (últimos 3 meses)',
                'Contrato laboral del patrocinador',
                'Extractos bancarios del patrocinador (3 meses)',
                'Prueba de hospedaje',
                'Plan general de actividades / itinerario',
              ]}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E5E5]">
            <h4 className="font-bold text-[#0A0A0A] mb-4">Grupo 3: Evidencia de viajes anteriores</h4>
            <DocumentUploader
              name="step14.doc_group3_viajes"
              label="Sube aquí todos los documentos de este grupo"
              multiple
              specsList={[
                'Todas las páginas del pasaporte con sellos y visas',
                'Visas anteriores relevantes (ej. visa de EE. UU.)',
              ]}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
