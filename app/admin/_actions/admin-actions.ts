"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type Destination = 'usa' | 'canada' | 'uk' | 'schengen' | 'australia'

const TABLES: Record<Destination, string> = {
  usa: 'visa_applications_usa',
  canada: 'visa_applications_canada',
  uk: 'visa_applications_uk',
  schengen: 'visa_applications_schengen',
  australia: 'aplicaciones_turismo_australia',
}

export async function updateApplicationStatus(id: string, status: string, destination: Destination = 'usa') {
  const table = TABLES[destination]
  const { error } = await supabaseAdmin
    .from(table)
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function updateApplicationNotes(id: string, admin_notes: string, destination: Destination = 'usa') {
  const table = TABLES[destination]
  const { error } = await supabaseAdmin
    .from(table)
    .update({ admin_notes })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function deleteApplication(id: string, destination: Destination = 'usa') {
  const table = TABLES[destination]
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function getPdfDownloadUrl(pdf_path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET || 'visa-applications')
    .createSignedUrl(pdf_path, 60) // 60 seconds
    
  if (error || !data) throw new Error(error?.message || 'Error generating URL')
  
  return data.signedUrl
}
