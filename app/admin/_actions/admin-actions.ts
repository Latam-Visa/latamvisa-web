"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(id: string, status: string) {
  const { error } = await supabaseAdmin
    .from('visa_applications_usa')
    .update({ status })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function updateApplicationNotes(id: string, admin_notes: string) {
  const { error } = await supabaseAdmin
    .from('visa_applications_usa')
    .update({ admin_notes })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function deleteApplication(id: string) {
  const { error } = await supabaseAdmin
    .from('visa_applications_usa')
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
