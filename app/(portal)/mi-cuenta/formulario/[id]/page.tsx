import { redirect } from 'next/navigation'

/* Ruta vieja del formulario dentro de la cuenta. Ahora el cliente llena el
   mismo formulario público (con paso 0 de pasaporte) en "modo cuenta"; esta
   ruta solo redirige por si alguien tiene el link guardado. El formulario
   vuelve a verificar sesión y propiedad de la solicitud. */
export default function FormularioPage({ params }: { params: { id: string } }) {
  redirect(`/aplicar/turismo-australia?solicitud=${encodeURIComponent(params.id)}`)
}
