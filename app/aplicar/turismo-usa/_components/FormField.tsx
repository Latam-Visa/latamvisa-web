import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  name: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, name, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1">
        {label}
        {required && <span className="text-[#DC2626]">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <p className="text-xs text-[#525252] mt-1">{hint}</p>
      )}
      
      {error && (
        <p className="text-xs text-[#DC2626] mt-1 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
