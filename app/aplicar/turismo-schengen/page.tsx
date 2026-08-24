"use client"

import { useState, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sanitizePdfFile } from '@/lib/pdf-sanitize'

// Reusing USA components for progress and navigation
import { ProgressBar } from '../turismo-usa/_components/ProgressBar'
import { StepNavigation } from '../turismo-usa/_components/StepNavigation'

import { submitSchengenApplication } from './_actions/submit-application'

import { 
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, 
  step6Schema, step7Schema, step8Schema, step9Schema 
} from './_schemas'

import { Step1 } from './_components/Step1'
import { Step2 } from './_components/Step2'
import { Step3 } from './_components/Step3'
import { Step4 } from './_components/Step4'
import { Step5 } from './_components/Step5'
import { Step6 } from './_components/Step6'
import { Step7 } from './_components/Step7'
import { Step8 } from './_components/Step8'
import { Step9 } from './_components/Step9'
import { PassportConfirmModal } from './components/PassportConfirmModal'
import { Step0PassportScan } from './_components/Step0PassportScan'

// Combined schema for the whole form
const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
  step8: step8Schema,
  step9: step9Schema,
})

type FormData = z.infer<typeof formSchema>

const TOTAL_STEPS = 9
const STORAGE_KEY = 'latamvisa-schengen-draft'

export default function TurismoSchengenApplication() {
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
      step5: { previous_visas: [] },
      step6: { means_of_support: [] },
      step9: { documents: [], bank_statements_url: [] }
    }
  })

  const { setValue } = methods

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('data', JSON.stringify(data))

      const response = await submitSchengenApplication(formDataToSend)

      if (!response.success) {
        alert(response.error || 'Hubo un error al enviar la aplicación.')
        setIsSubmitting(false)
        return
      }
      
      localStorage.removeItem(STORAGE_KEY)
      setShowSuccess(true)
      setTimeout(() => {
        // Redirect to success page or anywhere
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
      setPassportError('El archivo pesa más de 5MB. Sube un archivo más ligero.')
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
        
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `schengen/passport_scan_${Date.now()}.${fileExt}`
        const fileToUpload = file.type === 'application/pdf' ? await sanitizePdfFile(file) : file
        const { data: uploadData } = await supabase.storage
          .from('visa-applications')
          .upload(fileName, fileToUpload, { upsert: true, contentType: fileToUpload.type })
        if (uploadData) {
          setValue('step9.passport_file_url' as any, uploadData.path)
          setPassportFileUrl(uploadData.path)
        }
      } else {
        setPassportStatus('error')
        setPassportError(result.error || 'No pudimos leer el pasaporte. Sube una imagen más clara.')
      }
    } catch (error) {
      setPassportStatus('error')
      setPassportError('Error de red. Intenta de nuevo.')
    }
  }

  const confirmPassportData = (confirmed: any) => {
    if (confirmed) {
      setValue('step1.surname', confirmed.surname || '')
      setValue('step1.first_names', confirmed.given_names || '')
      setValue('step1.date_of_birth', confirmed.date_of_birth || '')
      setValue('step2.passport_number', confirmed.document_number || '')
      setValue('step2.passport_issue_date', confirmed.date_of_issue || '')
      setValue('step2.passport_expiry_date', confirmed.date_of_expiry || '')
      setValue('step2.passport_issuing_country', confirmed.issuing_country || '')
      setValue('step1.current_nationality', confirmed.nationality || '')
      setValue('step1.place_of_birth', confirmed.place_of_birth || '')
    }
    setPassportWasScanned(true)
    setPassportStatus('idle')
    setPassportData(null)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelPassportData = () => {
    setPassportData(null)
    setPassportStatus('idle')
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E5E5E5] p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#C8FF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">¡Aplicación Enviada!</h2>
          <p className="text-[#525252]">Hemos recibido tu expediente para la Visa Schengen y te enviamos un correo de confirmación. Te redirigiremos a la página de inicio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      <div className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-[PPMonumentExtended] text-[#0A0A0A] mb-3">
            Visa Schengen
          </h1>
          <p className="text-[#525252] text-lg leading-relaxed max-w-2xl">
            Preparación de tu expediente. Por favor, completa la información solicitada tal como aparece en tus documentos oficiales.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 md:p-10">
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {currentStep === 0 && (
                <Step0PassportScan
                  status={passportStatus}
                  error={passportError}
                  onUpload={handlePassportUpload}
                  onSkip={() => handleNext()}
                />
              )}
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step3 />}
              {currentStep === 4 && <Step4 />}
              {currentStep === 5 && <Step5 />}
              {currentStep === 6 && <Step6 />}
              {currentStep === 7 && <Step7 />}
              {currentStep === 8 && <Step8 />}
              {currentStep === 9 && <Step9 passportFileUrl={passportFileUrl} />}
            </form>
          </FormProvider>
        </div>

        <div className="mt-8">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onBack={handleBack}
            onNext={handleNext}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
          />
        </div>
      </div>

      {passportData && passportStatus === 'success' && (
        <PassportConfirmModal
          data={passportData.data || passportData}
          sources={passportData.sources || {}}
          onConfirm={confirmPassportData}
          onClose={cancelPassportData}
        />
      )}

      {showErrorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-[slide-up_0.3s_ease-out]">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">Por favor completa los campos marcados en rojo</span>
        </div>
      )}

      {showDraftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-[#0A0A0A]">¿Retomar solicitud?</h3>
            <p className="text-[#525252]">
              Encontramos una solicitud en progreso. ¿Deseas continuar desde donde lo dejaste o empezar una nueva?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLoadDraft}
                className="w-full bg-[#C8FF00] text-black font-bold py-3 rounded-xl hover:bg-[#b8ef00] transition-colors"
              >
                Continuar solicitud
              </button>
              <button
                onClick={handleClearDraft}
                className="w-full border border-[#E5E5E5] text-[#0A0A0A] font-medium py-3 rounded-xl hover:bg-[#F5F5F0] transition-colors"
              >
                Empezar de cero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
