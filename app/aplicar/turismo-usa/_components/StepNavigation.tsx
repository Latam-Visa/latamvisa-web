import { ArrowLeft, ArrowRight, Send } from 'lucide-react'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  isNextDisabled?: boolean
}

export function StepNavigation({ currentStep, totalSteps, onBack, isNextDisabled }: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E5E5E5]">
      <div>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold hover:bg-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isNextDisabled}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C8FF00] text-[#0A0A0A] font-bold hover:bg-[#B5E600] transition-colors shadow-[0_4px_0_0_rgba(0,0,0,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentStep === totalSteps ? (
          <>
            <span>Enviar aplicación</span>
            <Send className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Siguiente</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
