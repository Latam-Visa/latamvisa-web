import { useFormContext } from 'react-hook-form'
import { DocumentUploader } from './DocumentUploader'

export function Step10() {
  const { formState } = useFormContext()

  return (
    <div className="space-y-8">
      <div className="bg-[#F5F5F0] p-6 rounded-xl border border-[#E5E5E5] space-y-8">
        <div>
          <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">Carga de Documentos</h3>
          <p className="text-sm text-[#525252]">
            Sube tus documentos en formato PDF, Word o imagen. Entre más completos, mayores serán tus posibilidades de aprobación. Tu pasaporte ya fue cargado al inicio del proceso.
          </p>
        </div>

        <DocumentUploader
          name="step10.photo_file_url"
          label="Fotografía estilo pasaporte"
          required
          specsList={[
            'Fondo blanco o gris muy claro, sin lentes, rostro despejado.',
            'Debe ser reciente (tomada en los últimos 6 meses).'
          ]}
        />

        <DocumentUploader
          name="step10.bank_statements_url"
          label="Extractos bancarios (3 a 6 meses)"
          multiple
          specsList={[
            'PDFs descargados directamente de tu banco mostrando el historial de transacciones.',
            'Debe coincidir con los ingresos que declaraste en el Paso 5.'
          ]}
        />

        <DocumentUploader
          name="step10.employment_proof_url"
          label="Prueba de empleo o estudio"
          specsList={[
            'Si eres empleado: Carta laboral indicando salario, cargo, antigüedad y aprobación de vacaciones.',
            'Si eres independiente: Certificado de contador, cámara de comercio o RUT.',
            'Si eres estudiante: Certificado de estudios actual confirmando tus fechas.'
          ]}
        />

        <DocumentUploader
          name="step10.ties_proof_url"
          label="Prueba de lazos con el país de origen"
          specsList={[
            'Demuestra que vas a regresar. Puede ser: escrituras de propiedades, tarjetas de propiedad de vehículos, contratos de arrendamiento a largo plazo o carta de tu empleador/universidad confirmando tu retorno.'
          ]}
        />

        <DocumentUploader
          name="step10.other_visa_url"
          label="Visas anteriores (Opcional pero muy recomendado)"
          multiple
          specsList={[
            'Si tienes visa vigente o anterior de USA, Canadá, Australia, Nueva Zelanda o Schengen, súbela. Esto aumenta la confianza del cónsul.'
          ]}
        />

        <DocumentUploader
          name="step10.itinerary_url"
          label="Itinerario de viaje (Opcional)"
          multiple
          specsList={[
            'Nuestro equipo preparará un itinerario y una carta de intención por ti.',
            'Si prefieres adjuntar el tuyo propio o tienes tiquetes/reservas ya comprados, súbelos aquí.'
          ]}
        />
      </div>
    </div>
  )
}
