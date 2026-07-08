const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../app/admin/applications/[id]/_components/AustraliaDetailsClient.tsx');

const content = `"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { updateApplicationStatus, updateApplicationNotes } from '../../_actions/admin-actions'

export function AustraliaDetailsClient({ application: app, signedPhotoUrls }: any) {
  const [status, setStatus] = useState(app.status || 'pending')
  const [notes, setNotes] = useState(app.admin_notes || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdatingStatus(true)
    try {
      await updateApplicationStatus(app.id, newStatus, 'australia' as any)
    } catch (error) {
      console.error(error)
      alert('Error al actualizar estado')
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveNotes = async () => {
    setIsUpdatingNotes(true)
    try {
      await updateApplicationNotes(app.id, notes, 'australia' as any)
      alert('Notas guardadas')
    } catch (error) {
      console.error(error)
      alert('Error al guardar notas')
    }
    setIsUpdatingNotes(false)
  }

  const renderDoc = (title: string, url: string | undefined | string[]) => {
    if (!url) return null
    if (Array.isArray(url)) {
      return (
        <div className="mb-2">
          <span className="font-semibold">{title}:</span>
          <div className="flex flex-col gap-1 mt-1">
            {url.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Ver documento {i+1}</a>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className="mb-2">
        <span className="font-semibold">{title}:</span>{' '}
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Ver documento</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">Estado:</span>
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="border p-2 rounded"
            >
              <option value="pending">Pendiente</option>
              <option value="reviewing">En revisión</option>
              <option value="processing">Procesando</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>
          <div>
            <span className="font-medium block mb-2">Notas internas:</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border p-2 rounded min-h-[100px]"
              placeholder="Escribe notas aquí..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={isUpdatingNotes}
              className="mt-2 bg-black text-white px-4 py-2 rounded"
            >
              {isUpdatingNotes ? 'Guardando...' : 'Guardar Notas'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Intention Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className="mb-4">{app.ai_letter_status}</Badge>
          {app.ai_intention_letter ? (
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border">
              {app.ai_intention_letter}
            </div>
          ) : (
            <p className="text-gray-500">Aún no se ha generado o falló.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto bg-gray-50 p-4 border rounded">
            {JSON.stringify(app, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDoc('Pasaporte Actual', signedPhotoUrls.doc_passport_current)}
          {renderDoc('Pasaporte Anterior', signedPhotoUrls.doc_passport_old)}
          {renderDoc('Páginas Selladas', signedPhotoUrls.doc_passport_stamp_pages)}
          {renderDoc('DNI', signedPhotoUrls.doc_national_id)}
          {renderDoc('Visa USA', signedPhotoUrls.doc_usa_visa)}
          {renderDoc('Registro Civil', signedPhotoUrls.doc_civil_registry)}
          {renderDoc('Carta Residencia', signedPhotoUrls.doc_residence_letter)}
          {renderDoc('Propiedad / Vehículo', signedPhotoUrls.doc_vehicle_ownership)}
          {renderDoc('Extractos Bancarios', signedPhotoUrls.doc_bank_statements)}
          {renderDoc('Pensión', signedPhotoUrls.doc_pension_proof)}
          {renderDoc('Itinerario', signedPhotoUrls.doc_itinerary)}
          {renderDoc('Pasaporte Host', signedPhotoUrls.host_doc_passport_id)}
          {renderDoc('Visa Host', signedPhotoUrls.host_doc_australian_visa)}
          {renderDoc('Dir Host', signedPhotoUrls.host_doc_proof_of_address)}
          {renderDoc('Relación Host', signedPhotoUrls.host_doc_relationship_evidence)}
          {renderDoc('Carta Empleo Host', signedPhotoUrls.host_doc_employment_letter)}
          {renderDoc('Ahorros Host', signedPhotoUrls.host_doc_savings)}
          {renderDoc('Contrato Arriendo Host', signedPhotoUrls.host_doc_tenancy_agreement)}
          {renderDoc('Carta Invitación', signedPhotoUrls.host_doc_sponsor_letter)}
          {renderDoc('Plan Actividades', signedPhotoUrls.host_doc_activity_plan)}
        </CardContent>
      </Card>
    </div>
  )
}
`;

fs.writeFileSync(clientPath, content);
console.log('AustraliaDetailsClient.tsx generated');
