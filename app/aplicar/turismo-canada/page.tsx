"use client"

import { useState, useEffect } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'

// Reusing USA components for progress and navigation
import { ProgressBar } from '../turismo-usa/_components/ProgressBar'
import { StepNavigation } from '../turismo-usa/_components/StepNavigation'

import { submitCanadaApplication } from './_actions/submit-application'

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
    const age = new Date().getFullYear() - new Date(data.step2.date_of_birth).getFullYear()
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

export default function TurismoCanadaApplication() {
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
      step3: { other_names: [] },
      step4: { residence_history: [] },
      step5: { education_history: [], military_details: [], work_history: [] },
      step6: { travel_history: [] },
      step9: { children: [], parents: [] },
      step10: { phones: [] }
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

      const response = await submitCanadaApplication(formDataToSend)

      if (!response.success) {
        alert(response.error || 'Hubo un error al enviar la aplicación.')
        setIsSubmitting(false)
        return
      }
      
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
      case 1: return <Step1 />
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

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] pt-12 md:pt-20 pb-20 selection:bg-[#C8FF00]/30 overflow-x-hidden">
      
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
        <div className="flex justify-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LATAM VISA Logo" className="h-16 sm:h-20 object-contain" />
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
