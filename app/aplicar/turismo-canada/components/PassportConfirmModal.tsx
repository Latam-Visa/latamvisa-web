"use client"

import { useState } from 'react'

export interface PassportData {
  surname?: string | null
  given_names?: string | null
  full_name?: string | null
  document_number?: string | null
  nationality?: string | null
  date_of_birth?: string | null
  date_of_expiry?: string | null
  place_of_birth?: string | null
  date_of_issue?: string | null
  issuing_country?: string | null
}

export interface PassportConfirmModalProps {
  data: PassportData
  sources: Record<string, 'mrz' | 'vision' | 'both'>
  onConfirm: (confirmedData: PassportData) => void
  onClose: () => void
}

const FIELD_LABELS: Record<keyof PassportData, string> = {
  surname: 'Apellido(s)',
  given_names: 'Nombre(s)',
  full_name: 'Nombre completo',
  document_number: 'Número de pasaporte',
  nationality: 'Nacionalidad',
  date_of_birth: 'Fecha de nacimiento',
  date_of_expiry: 'Fecha de vencimiento',
  place_of_birth: 'Lugar de nacimiento',
  date_of_issue: 'Fecha de emisión',
  issuing_country: 'País emisor'
}

export function PassportConfirmModal({ data, sources, onConfirm, onClose }: PassportConfirmModalProps) {
  const [formData, setFormData] = useState<PassportData>({
    surname: data.surname || '',
    given_names: data.given_names || '',
    full_name: data.full_name || '',
    document_number: data.document_number || '',
    nationality: data.nationality || '',
    date_of_birth: data.date_of_birth || '',
    date_of_expiry: data.date_of_expiry || '',
    place_of_birth: data.place_of_birth || '',
    date_of_issue: data.date_of_issue || '',
    issuing_country: data.issuing_country || ''
  })

  const handleChange = (field: keyof PassportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderBadge = (field: string) => {
    if (!sources) return null
    const source = sources[field]
    if (!source) return null
    if (source === 'mrz') return <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">✓ Escaneado</span>
    if (source === 'vision') return <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">✓ IA</span>
    if (source === 'both') return <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">✓ Verificado</span>
    return null
  }

  const fieldsToRender: (keyof PassportData)[] = [
    'given_names', 'surname', 'document_number', 'nationality',
    'date_of_birth', 'place_of_birth', 'date_of_issue', 'date_of_expiry', 'issuing_country'
  ]

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col">
        <div className="shrink-0 mb-6">
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">¿Son correctos tus datos?</h2>
          <p className="text-[#525252] text-sm">Revisá cada campo. Podés editar lo que esté mal.</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {fieldsToRender.map(field => (
            <div key={field} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#525252]">{FIELD_LABELS[field]}</label>
                {renderBadge(field)}
              </div>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder="No detectado — escribí aquí"
                className="w-full bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-[#0A0A0A] text-sm focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="shrink-0 pt-6 mt-2 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(formData)}
            className="w-full bg-[#C8FF00] text-black font-bold py-3 rounded-lg hover:bg-[#B5E600] transition-colors shadow-sm"
          >
            Confirmar y continuar
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-[#525252] font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
