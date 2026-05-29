import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { AdminDetailsClient } from './_components/AdminDetailsClient'
import { CanadaDetailsClient } from './_components/CanadaDetailsClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getSignedPhotoUrl(bucket: string, path: string | string[] | null | undefined): Promise<string | string[] | undefined> {
  if (!path) return undefined
  try {
    if (Array.isArray(path)) {
      const promises = path.map(async (p) => {
        const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(p, 3600)
        return (!error && data) ? data.signedUrl : undefined
      })
      const results = await Promise.all(promises)
      return results.filter(Boolean) as string[]
    } else {
      const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 3600)
      if (error || !data) return undefined
      return data.signedUrl
    }
  } catch {
    return undefined
  }
}

export default async function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  let app = null
  let destination = 'usa'
  
  const { data: usaApp } = await supabaseAdmin
    .from('visa_applications_usa')
    .select('*')
    .eq('id', params.id)
    .single()

  if (usaApp) {
    app = usaApp
    destination = 'usa'
  } else {
    const { data: canApp } = await supabaseAdmin
      .from('visa_applications_canada')
      .select('*')
      .eq('id', params.id)
      .single()

    if (canApp) {
      app = canApp
      destination = 'canada'
    } else {
      notFound()
    }
  }

  const bucket = destination === 'usa' ? (process.env.SUPABASE_STORAGE_BUCKET || 'visa-documents') : 'visa-applications'

  let signedPhotoUrls = {}
  
  if (destination === 'usa') {
    const [passport, visaPhoto, previousVisa] = await Promise.all([
      getSignedPhotoUrl(bucket, app.passport_photo_url),
      getSignedPhotoUrl(bucket, app.visa_photo_url),
      getSignedPhotoUrl(bucket, app.previous_visa_photo_url),
    ])
    signedPhotoUrls = { passport, visaPhoto, previousVisa }
  } else {
    const d = app
    const [docIdPassport, docTies, docBankStatements, docTravelItinerary, docFormsLetters, docUsVisa] = await Promise.all([
      getSignedPhotoUrl(bucket, d.doc_id_passport),
      getSignedPhotoUrl(bucket, d.doc_ties),
      getSignedPhotoUrl(bucket, d.doc_bank_statements),
      getSignedPhotoUrl(bucket, d.doc_travel_itinerary),
      getSignedPhotoUrl(bucket, d.doc_forms_letters),
      getSignedPhotoUrl(bucket, d.doc_us_visa),
    ])
    signedPhotoUrls = { docIdPassport, docTies, docBankStatements, docTravelItinerary, docFormsLetters, docUsVisa }
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
          <h2 className="text-2xl font-bold font-[PPMonumentExtended]">
            Detalles de Solicitud <span className="text-sm bg-black text-[#C8FF00] px-2 py-1 rounded-md ml-2 align-middle">{destination === 'usa' ? 'USA' : 'CANADÁ'}</span>
          </h2>
          <p className="text-[#525252] text-sm">ID: {app.id}</p>
        </div>
      </div>

      {destination === 'usa' ? (
        <AdminDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      ) : (
        <CanadaDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      )}
    </div>
  )
}
