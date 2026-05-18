import React from 'react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  title: string
  subtitle: string
}

export function ProgressBar({ currentStep, totalSteps, title, subtitle }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-[#0A0A0A] text-xl md:text-2xl font-bold font-[PPMonumentExtended]">
          <span className="text-[#525252]">Paso {currentStep} de {totalSteps} — </span>
          {title}
        </h2>
        <p className="text-[#525252] text-sm md:text-base">{subtitle}</p>
      </div>

      <div className="flex gap-2 w-full h-2 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div
              key={stepNumber}
              className={`h-full flex-1 rounded-full transition-all duration-500 ${
                isCompleted 
                  ? 'bg-[#C8FF00]' 
                  : isCurrent 
                    ? 'bg-[#C8FF00] animate-pulse' 
                    : 'bg-[#E5E5E5]'
              }`}
            />
          )
        })}
      </div>
      <p className="text-xs text-[#A3A3A3]">Tu progreso se guarda automáticamente</p>
    </div>
  )
}
