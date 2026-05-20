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

export default function TurismoUsaApplication() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
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
  const formValues = useWatch({ control: methods.control })
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Don't save if it's completely empty
      if (Object.keys(formValues).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues))
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [formValues])

  const handleLoadDraft = () => {
    if (draftData) {
      methods.reset(draftData)
    }
    setShowDraftModal(false)
  }

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setShowDraftModal(false)
  }

  const handleNext = async () => {
    setIsValidating(true)
    let stepKey: keyof FormData = 'step1Contact'
    if (currentStep === 1) stepKey = 'step1Contact'
    else if (currentStep === 2) stepKey = 'step2Personal'
    else if (currentStep === 3) stepKey = 'step3Passport'
    else if (currentStep === 4) stepKey = 'step4Travel'
    else if (currentStep === 5) stepKey = 'step5VisaHistory'
    else if (currentStep === 6) stepKey = 'step6Family'
    else if (currentStep === 7) stepKey = 'step7Work'
    else if (currentStep === 8) stepKey = 'step8Additional'

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

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Contact />
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

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] pt-32 pb-20 selection:bg-[#C8FF00]/30 overflow-x-hidden">
      
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
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LATAM VISA Logo" className="h-10 sm:h-12 object-contain" />
        </div>
        <FormProvider {...methods}>
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
            <ProgressBar 
              currentStep={currentStep} 
              totalSteps={TOTAL_STEPS} 
              title={getStepTitle()} 
              subtitle={getStepSubtitle()} 
            />

            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-6 sm:p-8 transition-all duration-500 ease-in-out">
              {renderStep()}
            </div>

            <StepNavigation 
              currentStep={currentStep} 
              totalSteps={TOTAL_STEPS} 
              onBack={handleBack} 
              isNextDisabled={isSubmitting || isValidating}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
