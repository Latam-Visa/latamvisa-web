import { createClient } from '@supabase/supabase-js'
import type { Bandana } from './config'

// Anon key a propósito: RLS solo deja ver los productos activos.
const publico = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder', {
    auth: { persistSession: false },
  })

const CAMPOS = 'id, slug, name, description, price_aud, images'

export async function listarBandanas(): Promise<Bandana[]> {
  const { data, error } = await publico().from('bandana_products').select(CAMPOS).eq('active', true).order('created_at')
  // Con ISR, lanzar conserva la última versión buena en vez de cachear una tienda vacía.
  if (error) throw new Error(`bandana_products: ${error.message}`)
  return (data || []) as Bandana[]
}

export async function buscarBandana(slug: string): Promise<Bandana | null> {
  const { data, error } = await publico().from('bandana_products').select(CAMPOS).eq('active', true).eq('slug', slug).maybeSingle()
  if (error) throw new Error(`bandana_products: ${error.message}`)
  return data as Bandana | null
}
