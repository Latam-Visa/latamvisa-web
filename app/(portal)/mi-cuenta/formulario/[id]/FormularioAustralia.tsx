'use client'

/* Formulario de Australia dentro de la cuenta del cliente.

   Reutiliza los 14 pasos, los schemas y la navegación del formulario público
   (app/aplicar/turismo-australia). Lo que cambia aquí:
   - El borrador se guarda en el servidor, dentro de la solicitud, no en
     localStorage: así sobrevive a cambios de dispositivo y queda ligado a la cuenta.
   - Las subidas van a la carpeta de la solicitud (SubidaProvider), para que el
     admin encuentre los archivos aunque el cliente no haya terminado.
   - Al enviar se crea la aplicación amarrada a la solicitud y se marca 'enviada'. */

import { useEffect, useRef, useState } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

import { ProgressBar } from '@/app/aplicar/turismo-usa/_components/ProgressBar'
import { StepNavigation } from '@/app/aplicar/turismo-usa/_components/StepNavigation'
import { SubidaProvider } from '@/app/aplicar/turismo-australia/_components/upload-context'
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  step6Schema, step7Schema, step8Schema, step9Schema, step10Schema,
  step11Schema, step12Schema, step13Schema, step14Schema,
} from '@/app/aplicar/turismo-australia/_schemas'
import { Step1 } from '@/app/aplicar/turismo-australia/_components/Step1'
import { Step2 } from '@/app/aplicar/turismo-australia/_components/Step2'
import { Step3 } from '@/app/aplicar/turismo-australia/_components/Step3'
import { Step4 } from '@/app/aplicar/turismo-australia/_components/Step4'
import { Step5 } from '@/app/aplicar/turismo-australia/_components/Step5'
import { Step6 } from '@/app/aplicar/turismo-australia/_components/Step6'
import { Step7 } from '@/app/aplicar/turismo-australia/_components/Step7'
import { Step8 } from '@/app/aplicar/turismo-australia/_components/Step8'
import { Step9 } from '@/app/aplicar/turismo-australia/_components/Step9'
import { Step10 } from '@/app/aplicar/turismo-australia/_components/Step10'
import { Step11 } from '@/app/aplicar/turismo-australia/_components/Step11'
import { Step12 } from '@/app/aplicar/turismo-australia/_components/Step12'
import { Step13 } from '@/app/aplicar/turismo-australia/_components/Step13'
import { Step14 } from '@/app/aplicar/turismo-australia/_components/Step14'

import { guardarBorrador, urlDeSubida, enviarAustralia } from './acciones'

const formSchema = z.object({
  step1: step1Schema, step2: step2Schema, step3: step3Schema, step4: step4Schema,
  step5: step5Schema, step6: step6Schema, step7: step7Schema, step8: step8Schema,
  step9: step9Schema, step10: step10Schema, step11: step11Schema, step12: step12Schema,
  step13: step13Schema, step14: step14Schema,
})
type FormData = z.infer<typeof formSchema>

const TOTAL_STEPS = 14

const DEFAULTS: any = {
  step1: { visa_stream: 'tourist', reasons_for_visit: [] },
  step3: { other_names_list: [], other_citizenships: [] },
  step4: {},
  step6: { non_accompanying_family: [] },
  step14: { doc_group1_arraigo: [], doc_group2_fondos: [], doc_group3_viajes: [] },
}

function getFirstErrorKey(obj: any, prefix = ''): string {
  for (const key in obj) {
    if (obj[key]?.message) return prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object') {
      const nested = getFirstErrorKey(obj[key], prefix ? `${prefix}.${key}` : key)
      if (nested) return nested
    }
  }
  return ''
}

function scrollAndFocusField(fieldPath: string) {
  setTimeout(() => {
    const element = document.querySelector(`[name="${fieldPath}"]`) || document.querySelector(`[name^="${fieldPath}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (typeof (element as any).focus === 'function') (element as any).focus({ preventScroll: true })
      element.parentElement?.classList.add('animate-[shake_0.5s_ease-in-out]')
      setTimeout(() => element.parentElement?.classList.remove('animate-[shake_0.5s_ease-in-out]'), 500)
    }
  }, 100)
}

const STEPS: Record<number, JSX.Element> = {
  1: <Step1 />, 2: <Step2 />, 3: <Step3 />, 4: <Step4 />, 5: <Step5 />,
  6: <Step6 />, 7: <Step7 />, 8: <Step8 />, 9: <Step9 />, 10: <Step10 />,
  11: <Step11 />, 12: <Step12 />, 13: <Step13 />, 14: <Step14 />,
}

const TITULOS: Record<number, [string, string]> = {
  1: ['Detalles de Aplicación', 'Motivo del viaje y fechas'],
  2: ['Datos Personales', 'Datos de pasaporte'],
  3: ['Identificación', 'Nacionalidad y otros nombres'],
  4: ['Residencia', 'Direcciones y contacto'],
  5: ['Acompañantes', 'Con quién viajas'],
  6: ['Familia', 'Familiares que no viajan'],
  7: ['Viaje', 'Fechas, estadía y contactos'],
  8: ['Trabajo', 'Empleo e ingresos'],
  9: ['Fondos', 'Financiación del viaje'],
  10: ['Salud', 'Declaraciones de salud'],
  11: ['Carácter', 'Declaraciones de carácter'],
  12: ['Historial de Visas', 'Visas previas'],
  13: ['Declaraciones', 'Consentimientos oficiales'],
  14: ['Documentos', 'Carga de archivos de soporte'],
}

export default function FormularioAustralia({
  solicitudId,
  borradorInicial,
}: {
  solicitudId: string
  borradorInicial: { data?: any; step?: number } | null
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(borradorInicial?.step && borradorInicial.step >= 1 ? borradorInicial.step : 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [guardado, setGuardado] = useState<'idle' | 'guardando' | 'ok'>('idle')

  // Subidas acotadas a esta solicitud (carpeta australia/sol-<id>/...).
  const getUploadUrl = (fileType: string) => urlDeSubida(solicitudId, fileType)

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: { ...DEFAULTS, ...(borradorInicial?.data || {}) },
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Autoguardado del borrador en el servidor. Se salta el primer render (los
  // valores recién cargados no necesitan reescribirse) y agrupa los cambios.
  const formValues = useWatch({ control: methods.control })
  const primerRender = useRef(true)
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    setGuardado('guardando')
    const timeout = setTimeout(async () => {
      const res = await guardarBorrador(solicitudId, formValues, currentStep)
      setGuardado(res.ok ? 'ok' : 'idle')
    }, 800)
    return () => clearTimeout(timeout)
  }, [formValues, currentStep, solicitudId])

  const onInvalidSubmit = (errors: any) => {
    let firstInvalidStep = TOTAL_STEPS
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (errors[`step${i}`]) { firstInvalidStep = i; break }
    }
    setCurrentStep(firstInvalidStep)
    setShowErrorToast(true)
    setTimeout(() => setShowErrorToast(false), 5000)
    const stepErrors = errors[`step${firstInvalidStep}`]
    if (stepErrors) {
      const firstErrorPath = getFirstErrorKey(stepErrors, `step${firstInvalidStep}`)
      if (firstErrorPath) scrollAndFocusField(firstErrorPath)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const res = await enviarAustralia(solicitudId, data)
      if (!res.success) {
        alert(res.error || 'Hubo un error al enviar tu formulario.')
        setIsSubmitting(false)
        return
      }
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/mi-cuenta')
        router.refresh()
      }, 2200)
    } catch (e) {
      console.error(e)
      alert('Ocurrió un error inesperado al enviar. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    setIsValidating(true)
    const stepKey = `step${currentStep}` as keyof FormData
    const isStepValid = await methods.trigger(stepKey)
    setIsValidating(false)

    if (isStepValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((s) => s + 1)
      } else {
        methods.handleSubmit(onSubmit, onInvalidSubmit)()
      }
    } else {
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 4000)
      const stepErrors = methods.formState.errors[stepKey]
      if (stepErrors) {
        const firstErrorPath = getFirstErrorKey(stepErrors, stepKey)
        if (firstErrorPath) scrollAndFocusField(firstErrorPath)
      }
    }
  }

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const [titulo, subtitulo] = TITULOS[currentStep] || ['', '']

  return (
    <div className="text-[#0A0A0A]">
      {showErrorToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">Tienes campos por completar. Revísalos abajo.</span>
        </div>
      )}

      {isSubmitting && !showSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-4">
          <Loader2 className="w-12 h-12 text-[#3D5A00] animate-spin mb-6" />
          <h2 className="text-2xl font-bold mb-2 text-center">Enviando tu formulario...</h2>
          <p className="text-[#525252] text-center">Esto puede tomar unos segundos. No cierres esta ventana.</p>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAF7] px-4">
          <div className="w-16 h-16 bg-[#C8FF00] rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9 text-[#0d2b0d]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">¡Formulario enviado!</h2>
          <p className="text-[#525252] text-center">Lo estamos revisando. Te llevamos a tu cuenta…</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-monument uppercase text-lg sm:text-xl text-[#0d2b0d] leading-tight">Formulario · Australia</h1>
        <span className="text-xs text-[#0d2b0d]/50 shrink-0 min-h-[16px]">
          {guardado === 'guardando' ? 'Guardando…' : guardado === 'ok' ? 'Guardado' : ''}
        </span>
      </div>

      <style jsx global>{`
        .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) input,
        .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) select,
        .flex.flex-col.gap-1\\.5.w-full:has(p.text-xs.text-\\[\\#DC2626\\]) textarea {
          border-color: #DC2626 !important;
          background-color: #FEF2F2 !important;
        }
      `}</style>

      <FormProvider {...methods}>
        <SubidaProvider getUploadUrl={getUploadUrl}>
          <form onSubmit={(e) => { e.preventDefault(); handleNext() }} className="space-y-6">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} title={titulo} subtitle={subtitulo} />

            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-5 sm:p-7">
              {STEPS[currentStep]}
            </div>

            <StepNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onBack={handleBack}
              isNextDisabled={isSubmitting || isValidating}
            />
          </form>
        </SubidaProvider>
      </FormProvider>
    </div>
  )
}
