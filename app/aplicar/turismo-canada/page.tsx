"use client"

import { useState, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAge } from '@/lib/dates'
import { sanitizePdfFile } from '@/lib/pdf-sanitize'

// Reusing USA components for progress and navigation
import { ProgressBar } from '../turismo-usa/_components/ProgressBar'
import { StepNavigation } from '../turismo-usa/_components/StepNavigation'

import { ErrorEnvioModal } from './_components/ErrorEnvioModal'
import { convertirHeicAJpeg, esHeic, mensajeArchivoGrande } from '@/lib/aplicaciones/archivos-cliente'

import { 
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, 
  step6Schema, step7Schema, step8Schema, step9Schema, step10Schema 
} from './_schemas'

// Dummy step components for the shell (to be replaced later)
import { Step1 } from './_components/Step1'
import { Step2 } from './_components/Step2'
import { Step3 } from './_components/Step3'
import { Step4 } from './_components/Step4'
import { Step5 } from './_components/Step5'
import { Step6 } from './_components/Step6'
import { Step7 } from './_components/Step7'
import { Step8 } from './_components/Step8'
import { Step9 } from './_components/Step9'
import { Step10 } from './_components/Step10'
import { PassportConfirmModal } from './components/PassportConfirmModal'

// Combined schema for the whole form
const baseFormSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
  step8: step8Schema,
  step9: step9Schema,
  step10: step10Schema,
})

// Cross-step validation (e.g., bank statements required if applicant is >= 18)
const formSchema = baseFormSchema.superRefine((data, ctx) => {
  if (data.step2.date_of_birth) {
    const age = getAge(data.step2.date_of_birth)
    if (age >= 18 && !data.step10.doc_bank_statements) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Requerido para mayores de 18 años',
        path: ['step10', 'doc_bank_statements']
      })
    }
  }
})

type FormData = z.infer<typeof formSchema>

const TOTAL_STEPS = 10
const STORAGE_KEY = 'latamvisa-canada-draft'
// Id del envío: se crea al primer intento y se reutiliza en los reintentos,
// así un doble clic o un reintento no duplican la aplicación.
const SUBMISSION_KEY = 'latamvisa-canada-submission-id'
const TIMEOUT_ENVIO_MS = 45_000

function leerLocal(clave: string): string | null {
  try { return localStorage.getItem(clave) } catch { return null }
}
function escribirLocal(clave: string, valor: string | null) {
  try { valor === null ? localStorage.removeItem(clave) : localStorage.setItem(clave, valor) } catch {}
}

function idDeEnvio(): string {
  const existente = leerLocal(SUBMISSION_KEY)
  if (existente) return existente
  const nuevo = crypto.randomUUID()
  escribirLocal(SUBMISSION_KEY, nuevo)
  return nuevo
}

// Reporta al equipo los fallos que el servidor no ve (sin conexión, timeout).
function reportarFalloCliente(info: Record<string, unknown>) {
  try {
    fetch('/api/aplicar/alerta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulario: 'Canadá', ...info }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export default function TurismoCanadaApplication() {
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
  const [errorEnvio, setErrorEnvio] = useState<{ data: any } | null>(null)

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      step3: { other_names: [] },
      step4: { residence_history: [] },
      step5: { education_history: [], military_details: [], work_history: [] },
      step6: { travel_history: [] },
      step9: { children: [], parents: [] },
      step10: { phones: [] }
    }
  })

  const { setValue } = methods

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Check if it's the new format {step, data} or the old raw data format
        if (parsed.step && parsed.data) {
          setDraftData(parsed)
        } else if (parsed.step1) {
          setDraftData({ step: 1, data: parsed })
        }
        setShowDraftModal(true)
      } catch (e) {
        console.error('Failed to parse draft', e)
      }
    }
  }, [])

  // Autosave
  const formValues = useWatch({ control: methods.control })
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Object.keys(formValues).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          step: currentStep,
          data: formValues
        }))
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [formValues, currentStep])

  const handleLoadDraft = () => {
    if (draftData && draftData.data) {
      methods.reset(draftData.data)
      setCurrentStep(draftData.step || 1)
    }
    setShowDraftModal(false)
  }

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    escribirLocal(SUBMISSION_KEY, null)
    setShowDraftModal(false)
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsValidating(true)
    const stepKey = `step${currentStep}` as keyof FormData

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
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 4000)

      const stepErrors = methods.formState.errors[stepKey]
      if (stepErrors) {
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
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorPath}"]`) || document.querySelector(`[name^="${firstErrorPath}"]`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              if (typeof (element as any).focus === 'function') {
                (element as any).focus({ preventScroll: true })
              }
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

  // validar (ya hecho por el formulario) -> guardar -> éxito. Si algo falla,
  // el borrador sigue en localStorage y se muestra una pantalla amable.
  const onSubmit = async (data: any) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrorEnvio(null)
    const submissionId = idDeEnvio()
    const contacto = { nombre: [data?.step2?.given_name, data?.step2?.surname].filter(Boolean).join(' '), email: data?.step10?.email }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_ENVIO_MS)

    try {
      const res = await fetch('/api/aplicar/canada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          paso: currentStep,
          data,
          passportScanPath: passportFileUrl ?? methods.getValues('step0_passport_url' as any) ?? null,
        }),
        signal: controller.signal,
      })
      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        // Si el servidor respondió con JSON, ya envió la alerta; si no (504,
        // HTML de error), la manda el navegador.
        if (!json) reportarFalloCliente({ etapa: `respuesta HTTP ${res.status}`, paso: currentStep, submissionId, ...contacto, mensaje: `Respuesta no JSON (${res.status} ${res.statusText})` })
        setErrorEnvio({ data })
        return
      }

      localStorage.removeItem(STORAGE_KEY)
      escribirLocal(SUBMISSION_KEY, null)
      setShowSuccess(true)
      setTimeout(() => {
        window.location.href = 'https://latamvisatravel.com'
      }, 2500)
    } catch (error: any) {
      console.error(error)
      reportarFalloCliente({
        etapa: error?.name === 'AbortError' ? 'timeout del navegador' : 'red',
        paso: currentStep,
        submissionId,
        ...contacto,
        mensaje: `${error?.name || 'Error'}: ${error?.message || ''}`,
      })
      setErrorEnvio({ data })
    } finally {
      clearTimeout(timer)
      setIsSubmitting(false)
    }
  }

  const handlePassportUpload = async (original: File) => {
    const MAX_PASAPORTE = 5 * 1024 * 1024
    // Una foto HEIC grande queda bastante más liviana al pasar a JPEG, así que
    // el límite se revisa después de convertir.
    if (!esHeic(original) && original.size > MAX_PASAPORTE) {
      setPassportStatus('error')
      setPassportError(mensajeArchivoGrande(original, MAX_PASAPORTE))
      return
    }

    setPassportStatus('uploading')
    setPassportError('')

    let file = original
    try {
      file = await convertirHeicAJpeg(original)
    } catch {
      setPassportStatus('error')
      setPassportError('No pudimos convertir esta foto de iPhone. Toma una captura de pantalla del pasaporte o súbelo como PDF.')
      return
    }
    if (file.size > MAX_PASAPORTE) {
      setPassportStatus('error')
      setPassportError(mensajeArchivoGrande(file, MAX_PASAPORTE))
      return
    }

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
        
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `canada/passport_scan_${Date.now()}.${fileExt}`
        const fileToUpload = file.type === 'application/pdf' ? await sanitizePdfFile(file) : file
        const { data: uploadData } = await supabase.storage
          .from('visa-applications')
          .upload(fileName, fileToUpload, { upsert: true, contentType: fileToUpload.type })
        if (uploadData) {
          setValue('step0_passport_url' as any, uploadData.path)
          setPassportFileUrl(uploadData.path)
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
                accept="image/*,.heic,.heif,application/pdf" 
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
              // Step 2 personal data
              if (confirmed.surname) setValue('step2.surname' as any, confirmed.surname)
              if (confirmed.given_names) setValue('step2.given_name' as any, confirmed.given_names)
              
              // Dates are now in YYYY-MM-DD format, compatible with date inputs
              if (confirmed.date_of_birth) setValue('step2.date_of_birth' as any, confirmed.date_of_birth)
              if (confirmed.date_of_issue) setValue('step2.passport_issue_date' as any, confirmed.date_of_issue)
              if (confirmed.date_of_expiry) setValue('step2.passport_expiry_date' as any, confirmed.date_of_expiry)

              // Document type from MRZ (PA = regular passport)
              if (confirmed.document_type) setValue('step2.document_type' as any, confirmed.document_type)
              
              // Step 2 passport fields
              if (confirmed.document_number) {
                setValue('step2.passport_number' as any, confirmed.document_number)
                setValue('step2.passport_number_confirm' as any, confirmed.document_number)
              }
              
              // Nationality and issuing country for passport section
              if (confirmed.issuing_country) {
                const code = countryNameToCode[confirmed.issuing_country] || confirmed.issuing_country
                setValue('step2.passport_country_code' as any, code)
              }
              if (confirmed.nationality) {
                const code = countryNameToCode[confirmed.nationality] || confirmed.nationality
                setValue('step2.passport_nationality' as any, code)
              }
              
              // Step 3 birth data
              if (confirmed.place_of_birth) {
                const birthPlace = confirmed.place_of_birth || ''

                const countryCodeMap: Record<string, string> = {
                  'COL': 'CO', 'COLOMBIA': 'CO', 'CO': 'CO',
                  'VEN': 'VE', 'VENEZUELA': 'VE', 'VE': 'VE',
                  'MEX': 'MX', 'MEXICO': 'MX', 'MX': 'MX',
                  'PER': 'PE', 'PERU': 'PE', 'PE': 'PE',
                  'ECU': 'EC', 'ECUADOR': 'EC', 'EC': 'EC',
                  'ARG': 'AR', 'ARGENTINA': 'AR', 'AR': 'AR',
                  'BRA': 'BR', 'BRASIL': 'BR', 'BRAZIL': 'BR', 'BR': 'BR',
                  'CHL': 'CL', 'CHILE': 'CL', 'CL': 'CL',
                  'BOL': 'BO', 'BOLIVIA': 'BO', 'BO': 'BO',
                  'URY': 'UY', 'URUGUAY': 'UY', 'UY': 'UY',
                  'PRY': 'PY', 'PARAGUAY': 'PY', 'PY': 'PY',
                  'AUS': 'AU', 'AUSTRALIA': 'AU', 'AU': 'AU',
                  'USA': 'US', 'ESTADOS UNIDOS': 'US', 'US': 'US',
                  'ESP': 'ES', 'ESPAÑA': 'ES', 'SPAIN': 'ES', 'ES': 'ES',
                  'GBR': 'GB', 'UK': 'GB', 'GB': 'GB',
                }

                const parts = birthPlace.toUpperCase().trim().split(/\s+/)
                let detectedCountry: string | null = null

                for (let i = parts.length - 1; i >= 0; i--) {
                  if (countryCodeMap[parts[i]]) {
                    detectedCountry = countryCodeMap[parts[i]]
                    break
                  }
                }

                let cleanCity = birthPlace
                if (detectedCountry) {
                  const lastPart = parts[parts.length - 1]
                  cleanCity = birthPlace.replace(new RegExp(lastPart + '$', 'i'), '').trim()
                }

                if (cleanCity) setValue('step3.birth_city' as any, cleanCity)
                if (detectedCountry) setValue('step3.birth_country' as any, detectedCountry)
              }
              
              // Mark passport as scanned for banner
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
          <Step1 />
        </>
      )
      case 2: return <Step2 />
      case 3: return <Step3 />
      case 4: return <Step4 />
      case 5: return <Step5 />
      case 6: return <Step6 />
      case 7: return <Step7 />
      case 8: return <Step8 />
      case 9: return <Step9 />
      case 10: return <Step10 />
      default: return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Escaneo Inteligente'
      case 1: return 'Detalles de Aplicación'
      case 2: return 'Datos Personales'
      case 3: return 'Identificación'
      case 4: return 'Historial de Residencia'
      case 5: return 'Educación y Trabajo'
      case 6: return 'Historial de Viajes'
      case 7: return 'Historial Penal'
      case 8: return 'Historial Médico'
      case 9: return 'Familia'
      case 10: return 'Documentos'
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 0: return 'Sube tu pasaporte para autocompletar'
      case 1: return 'Motivo del viaje y fechas'
      case 2: return 'Datos de pasaporte y visados previos'
      case 3: return 'Nacionalidad y otros nombres'
      case 4: return 'Direcciones y residencias anteriores'
      case 5: return 'Estudios, empleos y fondos económicos'
      case 6: return 'Viajes en los últimos 5 años'
      case 7: return 'Antecedentes y seguridad'
      case 8: return 'Exámenes y condiciones de salud'
      case 9: return 'Estado civil y detalles de padres/hijos'
      case 10: return 'Carga de archivos requeridos'
      default: return ''
    }
  }

  const countryNameToCode: Record<string, string> = {
    'Colombia': 'CO', 'Australia': 'AU', 'Mexico': 'MX',
    'México': 'MX', 'Venezuela': 'VE', 'Peru': 'PE',
    'Perú': 'PE', 'Ecuador': 'EC', 'Bolivia': 'BO',
    'Chile': 'CL', 'Argentina': 'AR', 'Brazil': 'BR',
    'Brasil': 'BR', 'Uruguay': 'UY', 'Paraguay': 'PY',
    'Panama': 'PA', 'Panamá': 'PA', 'Spain': 'ES',
    'España': 'ES', 'United States': 'US', 'Canada': 'CA',
    'New Zealand': 'NZ', 'United Kingdom': 'GB',
    'France': 'FR', 'Germany': 'DE', 'Italy': 'IT',
    'Portugal': 'PT', 'Netherlands': 'NL', 'Japan': 'JP',
    'China': 'CN', 'India': 'IN', 'South Korea': 'KR',
    'Costa Rica': 'CR', 'Guatemala': 'GT', 'Honduras': 'HN',
    'El Salvador': 'SV', 'Nicaragua': 'NI', 'Cuba': 'CU',
    'Dominican Republic': 'DO', 'República Dominicana': 'DO'
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] pt-4 pb-20 selection:bg-[#C8FF00]/30 overflow-x-hidden">
      
      {showErrorToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Tenés algunos campos por completar. Revisalos abajo.</span>
        </div>
      )}

      {isSubmitting && !showSuccess && !errorEnvio && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-4">
          <Loader2 className="w-12 h-12 text-[#3D5A00] animate-spin mb-6" />
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

      {errorEnvio && !showSuccess && (
        <ErrorEnvioModal
          reintentando={isSubmitting}
          nombre={[errorEnvio.data?.step2?.given_name, errorEnvio.data?.step2?.surname].filter(Boolean).join(' ') || null}
          onReintentar={() => onSubmit(errorEnvio.data)}
        />
      )}

      {showDraftModal && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white border border-[#E5E5E5] p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-[#0A0A0A] text-xl font-bold mb-3">Progreso guardado</h3>
            <p className="text-[#525252] text-sm mb-6 leading-relaxed">
              Tenemos un progreso guardado de tu última sesión. ¿Quieres continuar donde lo dejaste? 
              <br/><br/>
              <span className="text-[#A3A3A3] text-xs">Nota: Los documentos no se guardan; deberás volver a subirlos si estabas en ese paso.</span>
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
        <style jsx global>{`
          .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) input, 
          .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) select, 
          .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) textarea {
            border-color: #DC2626 !important;
            background-color: #FEF2F2 !important;
          }
        `}</style>
        <div className="flex justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LATAM VISA Logo" className="h-16 sm:h-20 object-contain" />
        </div>



        {currentStep === 0 && (
          <div className="flex items-start gap-2 bg-[#F5F5F0] border border-[#E5E5E5] rounded-xl p-4 mb-3 text-xs text-[#525252] max-w-3xl mx-auto">
            <span className="text-sm leading-tight shrink-0">🔒</span>
            <p className="leading-relaxed">
              Tus datos y documentos se almacenan cifrados en servidores seguros. Solo el equipo de LATAM VISA tiene acceso, exclusivamente para procesar tu aplicación. Nunca compartimos tu información con terceros.
            </p>
          </div>
        )}

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
