import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NuevaTraduccionClient } from './_components/NuevaTraduccionClient'

export default function NuevaTraduccionPage() {
  return (
    <div className="space-y-6 max-w-[720px] mx-auto w-full pb-10">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/traducciones"
          aria-label="Volver a traducciones"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold font-[PPMonumentExtended] text-[#0A0A0A]">Nueva traducción</h2>
          <p className="text-sm text-[#6B6B6B]">Sube los documentos que te llegaron por Gmail o WhatsApp.</p>
        </div>
      </div>

      <NuevaTraduccionClient />
    </div>
  )
}
