import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { AdminDetailsClient } from './_components/AdminDetailsClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const { data: app, error } = await supabaseAdmin
    .from('visa_applications_usa')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !app) {
    notFound()
  }

  // Generate 1-hour signed URLs for the three photo slots
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'visa-applications'
  const signedPhotoUrls: { passport?: string; previousVisa?: string; visaPhoto?: string } = {}

  try {
    if (app.passport_photo_url) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(app.passport_photo_url, 3600)
      if (data) signedPhotoUrls.passport = data.signedUrl
    }
    if (app.previous_visa_photo_url) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(app.previous_visa_photo_url, 3600)
      if (data) signedPhotoUrls.previousVisa = data.signedUrl
    }
    if (app.visa_photo_url) {
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(app.visa_photo_url, 3600)
      if (data) signedPhotoUrls.visaPhoto = data.signedUrl
    }
  } catch (e) {
    console.error('[ADMIN_DETAIL] Error generating signed URLs:', e)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-[PPMonumentExtended]">Detalles de Solicitud</h2>
          <p className="text-[#525252] text-sm">ID: {app.id}</p>
        </div>
      </div>

      <AdminDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
    </div>
  )
}
