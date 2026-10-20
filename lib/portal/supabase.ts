import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente con la sesión del cliente (llave anon + cookies). Todo lo que lee
// el portal con este cliente pasa por RLS. La service key nunca sale de
// lib/supabase/admin.ts y solo se usa en el servidor.
export function clientePortal(): SupabaseClient {
  const store = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Server Component: no puede escribir cookies (el middleware ya refrescó).
        }
      },
    },
  })
}

// getUser valida el JWT contra Supabase; getSession solo leería la cookie.
export async function usuarioActual() {
  const supabase = clientePortal()
  const { data } = await supabase.auth.getUser()
  return { supabase, user: data.user ?? null }
}

export const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.latamvisatravel.com'

// Google se prende cuando esté configurado en Supabase y Google Cloud.
export const GOOGLE_ACTIVO = process.env.NEXT_PUBLIC_PORTAL_GOOGLE === 'on'
