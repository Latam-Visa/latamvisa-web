"use client"

import { useState, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'

import { ProgressBar } from './_components/ProgressBar'
import { StepNavigation } from './_components/StepNavigation'
import { Step1Contact } from './_components/Step1Contact'
import { Step2Personal } from './_components/Step2Personal'
import { Step3Passport } from './_components/Step3Passport'
import { Step4Travel } from './_components/Step4Travel'
import { Step5VisaHistory } from './_components/Step5VisaHistory'
import { Step6Family } from './_components/Step6Family'
import { Step7Work } from './_components/Step7Work'
import { Step8Additional } from './_components/Step8Additional'
import { submitUsaApplication } from './_actions/submit-application'
import { getUploadUrl } from './_actions/upload-url'
import { createClient } from '@/lib/supabase/client'
import { PassportConfirmModal } from '../turismo-uk/components/PassportConfirmModal'

import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema, step7Schema, step8Schema } from './_schemas'

// Combined schema for the whole form
const formSchema = z.object({
  step1Contact: step1Schema,
  step2Personal: step2Schema,
  step3Passport: step3Schema,
  step4Travel: step4Schema,
  step5VisaHistory: step5Schema,
  step6Family: step6Schema,
  step7Work: step7Schema,
  step8Additional: step8Schema,
})

type FormData = z.infer<typeof formSchema>

const TOTAL_STEPS = 8
const STORAGE_KEY = 'usa_visa_application_draft'

// Índice = número de paso (el 0 no se valida)
const STEP_KEYS = [
  'step1Contact',
  'step1Contact',
  'step2Personal',
  'step3Passport',
  'step4Travel',
  'step5VisaHistory',
  'step6Family',
  'step7Work',
  'step8Additional',
] as const

// Etiquetas legibles para el resumen de errores. Si un campo no está acá,
// se muestra el nombre "humanizado" para que NUNCA quede un error invisible.
const FIELD_LABELS: Record<string, string> = {
  usaVisaType: 'Primera solicitud o renovación',
  arrivalDate: 'Fecha de llegada a USA',
  departureDate: 'Fecha de salida de USA',
  citiesToVisit: 'Ciudades que quieres visitar',
  touristPlaces: 'Lugares turísticos',
  place: 'Lugar turístico',
  accommodation: 'Dónde te vas a quedar',
  address: 'Dirección completa',
  zip: 'Código postal',
  phone: 'Teléfono del lugar',
  tripPaidBy: 'Quién paga el viaje',
  payerName: 'Nombre de quien paga',
  payerPhone: 'Teléfono de quien paga',
  payerEmail: 'Email de quien paga',
  payerRelationship: 'Relación con quien paga',
  travelsWithOthers: '¿Viajas con más personas?',
  travelCompanions: 'Acompañantes',
  fullName: 'Nombre completo',
  relationship: 'Relación',
}

const humanizeField = (path: string) => {
  const last = path.split('.').filter(p => !/^\d+$/.test(p)).pop() || path
  if (FIELD_LABELS[last]) return FIELD_LABELS[last]
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim()
}

// Aplana el árbol de errores de react-hook-form a una lista plana.
// Esto garantiza que un error en un campo que NO se renderiza igual se vea.
const flattenErrors = (node: any, prefix = ''): { path: string; message: string }[] => {
  if (!node || typeof node !== 'object') return []
  if (typeof node.message === 'string' && node.message.length > 0) {
    return [{ path: prefix, message: node.message }]
  }
  const out: { path: string; message: string }[] = []
  for (const key of Object.keys(node)) {
    if (key === 'ref' || key === 'type' || key === 'types') continue
    out.push(...flattenErrors(node[key], prefix ? `${prefix}.${key}` : key))
  }
  return out
}

export const maxDuration = 60;

export default function TurismoUsaApplication() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [passportData, setPassportData] = useState<any>(null)
  const [passportStatus, setPassportStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle')
  const [passportError, setPassportError] = useState('')
  const [passportWasScanned, setPassportWasScanned] = useState(false)
  const [passportFileUrl, setPassportFileUrl] = useState<string|null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftData, setDraftData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      step4Travel: {
        accommodation: [{ type: '', address: '' }],
        travelCompanions: [],
        touristPlaces: [{ place: '' }],
      },
      step6Family: {
        familyInUsaDetails: []
      }
    }
  })

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDraftData(parsed)
        setShowDraftModal(true)
      } catch (e) {
        console.error('Failed to parse draft', e)
      }
    }
  }, [])

  // Autosave
  const { setValue } = methods

  const formValues = useWatch({ control: methods.control })
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Don't save if it's completely empty
      if (Object.keys(formValues).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          step: currentStep,
          data: formValues
        }))
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [formValues])

  const handleLoadDraft = () => {
    if (draftData && draftData.data) {
      methods.reset(draftData.data)
      setCurrentStep(draftData.step || 1)
    } else if (draftData) {
      methods.reset(draftData)
      setCurrentStep(1)
    }
    setShowDraftModal(false)
  }

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setShowDraftModal(false)
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsValidating(true)
    const stepKey = (STEP_KEYS[currentStep] || 'step1Contact') as keyof FormData

    const isStepValid = await methods.trigger(stepKey)
    setIsValidating(false)

    if (isStepValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(s => s + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        methods.handleSubmit(onSubmit)()
      }
    } else {
      // Show toast
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 4000)

      // Auto-scroll to first error
      const stepErrors = methods.formState.errors[stepKey]
      if (stepErrors) {
        // Find the first key that has an error
        const getFirstErrorKey = (obj: any, prefix = ''): string => {
          for (const key in obj) {
            if (obj[key]?.message) return prefix ? `${prefix}.${key}` : key
            if (typeof obj[key] === 'object') {
              const nested = getFirstErrorKey(obj[key], prefix ? `${prefix}.${key}` : key)
              if (nested) return nested
            }
          }
          return ''
        }
        
        const firstErrorPath = getFirstErrorKey(stepErrors, stepKey)
        if (firstErrorPath) {
          // React hook form uses standard name attributes
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorPath}"]`) || document.querySelector(`[name^="${firstErrorPath}"]`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              element.parentElement?.classList.add('animate-[shake_0.5s_ease-in-out]')
              setTimeout(() => {
                element.parentElement?.classList.remove('animate-[shake_0.5s_ease-in-out]')
              }, 500)
            }
          }, 100)
        }
      }
    }
  }

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('data', JSON.stringify(data))

      const response = await submitUsaApplication(formDataToSend)

      if (!response.success) {
        alert(response.error || 'Hubo un error al enviar la aplicación. Por favor, intenta de nuevo.')
        setIsSubmitting(false)
        return
      }

      // Clear local storage on final submit success
      localStorage.removeItem(STORAGE_KEY)
      setShowSuccess(true)
      setTimeout(() => {
        window.location.href = 'https://latamvisatravel.com'
      }, 2500)
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado al contactar con el servidor.')
      setIsSubmitting(false)
    }
  }


  const handlePassportUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setPassportStatus('error')
      setPassportError('El archivo pesa más de 5MB. Sube una foto más ligera.')
      return
    }

    setPassportStatus('uploading')
    setPassportError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-passport', {
        method: 'POST',
        body: formData
      })
      const result = await res.json()

      if (result.success) {
        setPassportData(result)
        setPassportStatus('success')
        
        try {
          const { success: uploadSuccess, url, path, error: uploadError } = await getUploadUrl(file.type)
          if (uploadSuccess && url && path) {
            const uploadRes = await fetch(url, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type }
            })
            if (uploadRes.ok) {
              setValue('step3Passport.passportPhotoPath' as any, path)
              setPassportFileUrl(path)
            } else {
              console.error('Failed to upload file to signed URL')
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading passport photo in step 0:', uploadErr)
        }
      } else {
        setPassportStatus('error')
        setPassportError(result.error || 'No pudimos leer el pasaporte. Podés continuar manualmente.')
      }
    } catch (e) {
      setPassportStatus('error')
      setPassportError('Error de red al intentar procesar el pasaporte.')
    }
  }

  const renderStep0 = () => {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">Primero, sube tu pasaporte</h2>
          <p className="text-[#525252]">Extraemos tus datos automáticamente para que no tengas que escribirlos a mano.</p>
        </div>

        {passportStatus === 'uploading' ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl">
            <Loader2 className="w-10 h-10 animate-spin text-[#C8FF00] mb-4" />
            <p className="text-lg font-bold text-[#0A0A0A]">Leyendo tu pasaporte...</p>
            <p className="text-sm text-[#525252] mt-2 text-center max-w-sm">Nuestra IA está extrayendo los datos. Esto puede tomar unos segundos.</p>
          </div>
        ) : (
          <div 
            className="bg-[#F5F5F0] p-4 md:p-6 rounded-xl border-2 border-dashed border-[#C8FF00] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors hover:bg-[#F5F5F0]/80"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handlePassportUpload(e.dataTransfer.files[0])
              }
            }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start gap-4 flex-1">
              <div className="w-16 h-16 shrink-0 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8 text-[#C8FF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[#0A0A0A] font-bold mb-1">Arrastra tu archivo aquí o haz clic para subir</p>
                <p className="text-[#888] text-sm">Aceptamos imágenes (JPG, PNG) y PDF. Tamaño máximo: 5MB.</p>
              </div>
            </div>
            <label className="shrink-0 cursor-pointer bg-[#C8FF00] text-black font-bold py-3 px-6 rounded-lg hover:bg-[#B5E600] transition-colors shadow-sm whitespace-nowrap">
              Seleccionar archivo
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePassportUpload(e.target.files[0])
                  }
                }}
              />
            </label>
          </div>
        )}

        {passportStatus === 'error' && (
          <div className="bg-[#FEF2F2] border border-[#DC2626] p-4 rounded-xl">
            <p className="text-[#DC2626] font-medium mb-4 text-center">{passportError || 'No pudimos leer el pasaporte. Podés continuar manualmente.'}</p>
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={() => setCurrentStep(1)} 
                className="bg-white border border-[#DC2626] text-[#DC2626] font-bold py-2 px-6 rounded-lg hover:bg-[#FEF2F2] transition-colors"
              >
                Continuar sin escanear
              </button>
            </div>
          </div>
        )}

        {passportData && (
          <PassportConfirmModal
            data={passportData.data}
            sources={passportData.sources || {}}
            onConfirm={(confirmed) => {
              if (confirmed.first_name || confirmed.last_name) {
                const fullName = [confirmed.first_name, confirmed.last_name].filter(Boolean).join(' ')
                if (fullName) setValue('step1Contact.fullName' as any, fullName)
              }
              if (confirmed.date_of_birth) setValue('step2Personal.dateOfBirth' as any, confirmed.date_of_birth)
              if (confirmed.date_of_issue) setValue('step3Passport.passportIssueDate' as any, confirmed.date_of_issue)
              if (confirmed.date_of_expiry) setValue('step3Passport.passportExpiryDate' as any, confirmed.date_of_expiry)
              if (confirmed.document_number) setValue('step3Passport.passportNumber' as any, confirmed.document_number)
              if (confirmed.issuing_country) setValue('step3Passport.passportIssueCountry' as any, confirmed.issuing_country)
              if (confirmed.nationality) setValue('step2Personal.nationality' as any, confirmed.nationality)
              if (confirmed.place_of_birth) setValue('step2Personal.cityOfBirth' as any, confirmed.place_of_birth)
              
              setPassportWasScanned(true)
              setPassportData(null)
              setCurrentStep(1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onClose={() => setPassportData(null)}
          />
        )}
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderStep0()
      case 1: return (
        <>
          {passportWasScanned && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#F0FDE4', color: '#2F4A00' }}>
              ✓ Datos extraídos de tu pasaporte — revisá que todo esté correcto
            </div>
          )}
          <Step1Contact />
        </>
      )
      case 2: return <Step2Personal />
      case 3: return <Step3Passport />
      case 4: return <Step4Travel />
      case 5: return <Step5VisaHistory />
      case 6: return <Step6Family />
      case 7: return <Step7Work />
      case 8: return <Step8Additional />
      default: return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Escaneo Inteligente'
      case 1: return 'Información de contacto'
      case 2: return 'Información personal'
      case 3: return 'Información del pasaporte'
      case 4: return 'Sobre tu viaje a Estados Unidos'
      case 5: return 'Historial de visas a Estados Unidos'
      case 6: return 'Información de tu familia'
      case 7: return 'Trabajo y educación'
      case 8: return 'Información adicional'
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 0: return 'Sube tu pasaporte para autocompletar'
      case 1: return 'Empecemos con cómo contactarte y tu situación actual'
      case 2: return 'Datos que aparecerán en tu DS-160'
      case 3: return 'Los datos exactos de tu pasaporte vigente'
      case 4: return 'Cuéntanos los detalles de tu plan de viaje'
      case 5: return 'Necesitamos saber si ya has aplicado antes'
      case 6: return 'Datos de tus padres y familia en USA si aplica'
      case 7: return 'Tu situación laboral y formación académica'
      case 8: return 'Últimos detalles importantes y tu foto tipo visa'
      default: return ''
    }
  }

  // Resumen de errores del paso actual (red de seguridad: si un campo con error
  // no está renderizado, igual aparece acá y el usuario no queda trabado sin saber por qué)
  const currentStepKey = currentStep > 0 ? STEP_KEYS[currentStep] : null
  const stepErrorList = currentStepKey
    ? flattenErrors((methods.formState.errors as any)?.[currentStepKey])
    : []

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] pt-12 md:pt-20 pb-20 selection:bg-[#C8FF00]/30 overflow-x-hidden">
      
      {/* Toast Notification */}
      {showErrorToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Tenés algunos campos por completar. Revisalos abajo.</span>
        </div>
      )}

      {isSubmitting && !showSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-4">
          <Loader2 className="w-12 h-12 text-[#C8FF00] animate-spin mb-6" />
          <h2 className="text-[#0A0A0A] text-2xl font-bold mb-2 text-center">Enviando tu aplicación...</h2>
          <p className="text-[#525252] font-medium mb-1 text-center">Esto puede tomar unos segundos</p>
          <p className="text-[#A3A3A3] text-sm text-center">No cierres esta ventana</p>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAF7] px-4 animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-[#C8FF00] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(200,255,0,0.4)]">
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#0A0A0A] text-2xl font-bold mb-2 text-center">¡Tu aplicación fue enviada con éxito!</h2>
          <p className="text-[#525252] font-medium text-center">Te contactaremos pronto por WhatsApp.</p>
        </div>
      )}

      {showDraftModal && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white border border-[#E5E5E5] p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-[#0A0A0A] text-xl font-bold mb-3">Progreso guardado</h3>
            <p className="text-[#525252] text-sm mb-6 leading-relaxed">
              Tenemos un progreso guardado de tu última sesión. ¿Quieres continuar donde lo dejaste? 
              <br/><br/>
              <span className="text-[#A3A3A3] text-xs">Nota: Las fotos/archivos no se guardan; deberás volver a subirlos si estabas en ese paso.</span>
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLoadDraft} className="w-full bg-[#C8FF00] text-[#0A0A0A] font-bold py-3 rounded-lg hover:bg-[#B5E600] transition-colors shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
                Continuar aplicación
              </button>
              <button onClick={handleClearDraft} className="w-full bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold py-3 rounded-lg hover:bg-[#0A0A0A] hover:text-white transition-colors">
                Empezar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LATAM VISA Logo" className="h-16 sm:h-20 object-contain" />
        </div>
        <FormProvider {...methods}>
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
            <ProgressBar 
              currentStep={Math.max(1, currentStep)} 
              totalSteps={TOTAL_STEPS} 
              title={getStepTitle()} 
              subtitle={getStepSubtitle()} 
            />

            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-6 sm:p-8 transition-all duration-500 ease-in-out">
              {renderStep()}
            </div>

            {currentStep > 0 && stepErrorList.length > 0 && (
              <div className="bg-[#FEF2F2] border border-[#DC2626] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <p className="font-bold text-[#DC2626]">
                    {stepErrorList.length === 1
                      ? 'Falta 1 campo por corregir'
                      : `Faltan ${stepErrorList.length} campos por corregir`}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {stepErrorList.map(err => (
                    <li key={err.path} className="text-sm text-[#7F1D1D] flex gap-2">
                      <span aria-hidden>•</span>
                      <span>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.querySelector(`[name="${currentStepKey}.${err.path}"]`)
                              || document.querySelector(`[name^="${currentStepKey}.${err.path}"]`)
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            ;(el as HTMLElement | null)?.focus?.()
                          }}
                          className="font-semibold underline underline-offset-2 hover:text-[#DC2626]"
                        >
                          {humanizeField(err.path)}
                        </button>
                        {': '}
                        {err.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentStep > 0 && (
              <StepNavigation
                currentStep={currentStep} 
                totalSteps={TOTAL_STEPS} 
                onBack={handleBack} 
                isNextDisabled={isSubmitting || isValidating}
              />
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
