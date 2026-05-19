"use client"

import { useState } from 'react'
import { updateApplicationStatus, updateApplicationNotes, deleteApplication } from '../../../_actions/admin-actions'
import { generateApplicationPdfAction } from '../_actions/generate-pdf'
import { useRouter } from 'next/navigation'
import { FileText, Save, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function AdminDetailsClient({ application }: { application: any }) {
  const router = useRouter()
  const data = application.data
  
  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdatingStatus(true)
    try {
      await updateApplicationStatus(application.id, newStatus)
    } catch (error) {
      alert('Error al actualizar estado')
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveNotes = async () => {
    setIsUpdatingNotes(true)
    try {
      await updateApplicationNotes(application.id, notes)
    } catch (error) {
      alert('Error al guardar notas')
    }
    setIsUpdatingNotes(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      try {
        await deleteApplication(application.id)
        router.push('/admin')
      } catch (error) {
        alert('Error al eliminar')
        setIsDeleting(false)
      }
    }
  }

  const handlePdfClick = async () => {
    setIsDownloading(true)
    try {
      const result = await generateApplicationPdfAction(application.id)
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      } else {
        alert(result.error || 'No pudimos generar el PDF')
      }
    } catch (err) {
      alert('Error inesperado al generar PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Columna Principal - Datos */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6">
          <h3 className="text-lg font-bold border-b border-[#E5E5E5] pb-4 mb-4">Información del Contacto</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#525252]">Nombre completo</p>
              <p className="font-medium">{data.step1Contact.fullName}</p>
            </div>
            <div>
              <p className="text-[#525252]">Email</p>
              <p className="font-medium">{data.step1Contact.email}</p>
            </div>
            <div>
              <p className="text-[#525252]">Teléfono</p>
              <p className="font-medium">{data.step1Contact.phone}</p>
            </div>
            <div>
              <p className="text-[#525252]">Ciudad / País</p>
              <p className="font-medium">{data.step1Contact.city}, {data.step1Contact.country}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6">
          <h3 className="text-lg font-bold border-b border-[#E5E5E5] pb-4 mb-4">Detalles del Viaje</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#525252]">Tipo de Visa</p>
              <p className="font-medium">{data.step4Travel.usaVisaType}</p>
            </div>
            <div>
              <p className="text-[#525252]">Motivo</p>
              <p className="font-medium">{data.step4Travel.tripPurpose}</p>
            </div>
            <div>
              <p className="text-[#525252]">Fechas estimadas</p>
              <p className="font-medium">
                {data.step4Travel.arrivalDate} al {data.step4Travel.departureDate}
              </p>
            </div>
            <div>
              <p className="text-[#525252]">Quien paga el viaje</p>
              <p className="font-medium">{data.step4Travel.tripPaidBy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Secundaria - Acciones */}
      <div className="space-y-6">
        
        {/* Acciones principales */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Gestión</h3>
          
          <div>
            <label className="block text-sm font-medium text-[#525252] mb-1">Estado de Solicitud</label>
            <select 
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
            >
              <option value="pending">Pendiente</option>
              <option value="in-progress">En Proceso</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>

          <button
            onClick={handlePdfClick}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-black py-2 rounded-lg text-sm font-bold hover:bg-[#b8ef00] transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isDownloading ? 'Generando...' : application.pdf_url ? 'Descargar PDF' : 'Generar PDF'}
          </button>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-3">
          <h3 className="font-bold text-lg border-b border-[#E5E5E5] pb-2">Notas Internas</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotaciones sobre este cliente..."
            className="w-full h-32 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]"
          />
          <button
            onClick={handleSaveNotes}
            disabled={isUpdatingNotes}
            className="w-full flex items-center justify-center gap-2 bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] py-2 rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            {isUpdatingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Notas
          </button>
        </div>

        {/* Metadatos y Delete */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 space-y-4">
          <div className="text-xs text-[#525252] space-y-1 border-b border-[#E5E5E5] pb-4">
            <p><strong>Recibida:</strong> {format(new Date(application.created_at), "d MMM yyyy, HH:mm", { locale: es })}</p>
            <p><strong>IP:</strong> {application.ip_address}</p>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 text-[#DC2626] py-2 rounded-lg text-sm font-medium hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar Solicitud
          </button>
        </div>

      </div>
    </div>
  )
}
