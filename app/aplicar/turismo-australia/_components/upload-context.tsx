'use client'

/* Inyección del destino de subida de documentos.

   El formulario público sube a `australia/{uuid-desechable}/...` vía la acción
   get-upload-url. El formulario dentro del portal necesita subir a una carpeta
   amarrada a la solicitud (`australia/sol-{solicitudId}/...`) para que el admin
   encuentre los archivos aunque el cliente no haya terminado.

   Para no duplicar DocumentUploader/Step14, el destino viaja por contexto. El
   valor por defecto es la acción pública: sin provider, el comportamiento es
   idéntico al de siempre. */

import { createContext, useContext } from 'react'
import { getUploadUrl as getUploadUrlPublico } from '../_actions/get-upload-url'

export type GetUploadUrl = (
  fileType: string
) => Promise<{ success: boolean; url?: string; path?: string; error?: string }>

const SubidaContext = createContext<GetUploadUrl>(getUploadUrlPublico)

export function SubidaProvider({
  getUploadUrl,
  children,
}: {
  getUploadUrl: GetUploadUrl
  children: React.ReactNode
}) {
  return <SubidaContext.Provider value={getUploadUrl}>{children}</SubidaContext.Provider>
}

export function useGetUploadUrl(): GetUploadUrl {
  return useContext(SubidaContext)
}
