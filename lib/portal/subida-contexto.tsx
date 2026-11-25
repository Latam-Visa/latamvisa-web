'use client'

/* Destino de subida de documentos en "modo cuenta". Sin provider el valor es
   null y cada DocumentUploader usa su acción pública de siempre; con provider,
   los archivos van a la carpeta de la solicitud. */

import { createContext, useContext } from 'react'

export type GetUploadUrl = (
  fileType: string
) => Promise<{ success: boolean; url?: string; path?: string; error?: string }>

const SubidaCuentaContext = createContext<GetUploadUrl | null>(null)

export function SubidaCuentaProvider({ getUploadUrl, children }: { getUploadUrl: GetUploadUrl | null; children: React.ReactNode }) {
  return <SubidaCuentaContext.Provider value={getUploadUrl}>{children}</SubidaCuentaContext.Provider>
}

export function useSubidaCuenta(): GetUploadUrl | null {
  return useContext(SubidaCuentaContext)
}
