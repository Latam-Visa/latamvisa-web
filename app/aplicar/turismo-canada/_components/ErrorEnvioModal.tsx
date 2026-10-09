import { Loader2, MessageCircle, RotateCcw } from 'lucide-react'

const WHATSAPP = '61426779734'

// Pantalla cuando no se pudo guardar el envío. Nunca muestra el error
// técnico: el borrador sigue guardado en este navegador y el equipo ya
// recibió una alerta.
export function ErrorEnvioModal({
  onReintentar,
  reintentando,
  nombre,
}: {
  onReintentar: () => void
  reintentando: boolean
  nombre?: string | null
}) {
  const texto = encodeURIComponent(
    `Hola, intenté enviar mi aplicación de visa de Canadá${nombre ? ` (${nombre})` : ''} y no se pudo enviar. ¿Me ayudan?`,
  )

  return (
    <div role="alertdialog" aria-labelledby="error-envio-titulo" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <h3 id="error-envio-titulo" className="text-[#0A0A0A] text-xl font-bold mb-3">
          No pudimos enviar tu aplicación
        </h3>
        <p className="text-[#525252] text-sm mb-6 leading-relaxed">
          No pudimos enviar tu aplicación, tus datos están guardados. Intenta de nuevo o escríbenos por WhatsApp.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onReintentar}
            disabled={reintentando}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#C8FF00] text-[#0A0A0A] font-bold py-3 min-h-[48px] rounded-lg hover:bg-[#B5E600] transition-colors disabled:opacity-60"
          >
            {reintentando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {reintentando ? 'Enviando…' : 'Intentar de nuevo'}
          </button>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${texto}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold py-3 min-h-[48px] rounded-lg hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Escribir por WhatsApp (+61 426 779 734)
          </a>
        </div>
      </div>
    </div>
  )
}
