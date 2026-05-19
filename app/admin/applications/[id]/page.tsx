import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { AdminDetailsClient } from './_components/AdminDetailsClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getSignedPhotoUrl(bucket: string, path: string | null | undefined): Promise<string | undefined> {
  if (!path) return undefined
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 3600)
    if (error || !data) return undefined
    return data.signedUrl
  } catch {
    return undefined
  }
}

export default async function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const { data: app, error } = await supabaseAdmin
    .from('visa_applications_usa')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !app) {
    notFound()
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'visa-documents'

  const [passportPhotoUrl, visaPhotoUrl, previousVisaPhotoUrl] = await Promise.all([
    getSignedPhotoUrl(bucket, app.passport_photo_url),
    getSignedPhotoUrl(bucket, app.visa_photo_url),
    getSignedPhotoUrl(bucket, app.previous_visa_photo_url),
  ])

  const signedPhotoUrls = {
    passport: passportPhotoUrl,
    visaPhoto: visaPhotoUrl,
    previousVisa: previousVisaPhotoUrl,
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
