import { useFormContext } from 'react-hook-form'
import { DocumentUploader } from './DocumentUploader'

export function Step9({ passportFileUrl }: { passportFileUrl: string | null }) {
  const { setValue, watch, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-2">Paso 9: Documentos</h2>
        <p className="text-[#525252]">Sube los documentos requeridos para armar tu expediente Schengen.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-4">
          <div className="w-10 h-10 bg-[#C8FF00] rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-xl">
            ✓
          </div>
          <div>
            <p className="font-bold text-[#0A0A0A]">Pasaporte (Escaneado en el Paso 0)</p>
            <p className="text-sm text-[#525252]">Tu pasaporte ya ha sido adjuntado a la solicitud de forma automática.</p>
          </div>
        </div>

        <DocumentUploader
          label="Foto Tipo Pasaporte (Estándar ICAO)"
          description="A color, fondo blanco, 35x45mm, tomada en los últimos 6 meses."
          accept="image/*"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.photo_file_url', url)}
        />

        <DocumentUploader
          label="Seguro Médico de Viaje"
          description="Póliza con cobertura mínima de 30.000 EUR."
          accept=".pdf,image/*"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.travel_insurance_url', url)}
        />

        <DocumentUploader
          label="Extractos Bancarios (Últimos 3 o 6 meses)"
          description="Puedes subir un solo PDF que contenga todos los meses."
          accept=".pdf"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.bank_statements_url', [url])}
        />

        <DocumentUploader
          label="Reserva de Vuelos (Ida y Vuelta)"
          description="Itinerario confirmado con PNR."
          accept=".pdf,image/*"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.flight_itinerary_url', url)}
        />

        <DocumentUploader
          label="Reserva de Hotel / Alojamiento"
          description="Reservas confirmadas para todas las noches en espacio Schengen."
          accept=".pdf,image/*"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.accommodation_url', url)}
        />

        <DocumentUploader
          label="Certificado de Trabajo / Estudios"
          description="Carta membretada indicando cargo, salario y tiempo de servicio o matrícula."
          accept=".pdf,image/*"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.employment_proof_url', url)}
        />

        <DocumentUploader
          label="Comprobantes de Arraigo Adicionales (Opcional)"
          description="Escrituras de propiedades, pago de impuestos, etc."
          accept=".pdf"
          bucketFolder="schengen"
          onUploadComplete={(url) => setValue('step9.ties_proof_url', url)}
        />
      </div>
    </div>
  )
}
