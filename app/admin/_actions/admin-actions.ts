"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(id: string, status: string, destination: 'usa' | 'canada' = 'usa') {
  const table = destination === 'usa' ? 'visa_applications_usa' : 'visa_applications_canada'
  const { error } = await supabaseAdmin
    .from(table)
    .update({ status })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function updateApplicationNotes(id: string, admin_notes: string, destination: 'usa' | 'canada' = 'usa') {
  const table = destination === 'usa' ? 'visa_applications_usa' : 'visa_applications_canada'
  const { error } = await supabaseAdmin
    .from(table)
    .update({ admin_notes })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin')
  revalidatePath(`/admin/applications/${id}`)
}

export async function deleteApplication(id: string, destination: 'usa' | 'canada' = 'usa') {
  const table = destination === 'usa' ? 'visa_applications_usa' : 'visa_applications_canada'
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
