import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { AdminDetailsClient } from './_components/AdminDetailsClient'
import { CanadaDetailsClient } from './_components/CanadaDetailsClient'
import { UKDetailsClient } from './_components/UKDetailsClient'
import { SchengenDetailsClient } from './_components/SchengenDetailsClient'
import { AustraliaDetailsClient } from './_components/AustraliaDetailsClient'
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
      const { data: ukApp } = await supabaseAdmin
        .from('visa_applications_uk')
        .select('*')
        .eq('id', params.id)
        .single()

      if (ukApp) {
        app = ukApp
        destination = 'uk'
      } else {
        const { data: schengenApp } = await supabaseAdmin
          .from('visa_applications_schengen')
          .select('*')
          .eq('id', params.id)
          .single()

        if (schengenApp) {
          app = schengenApp
          destination = 'schengen'
        } else {
          const { data: ausApp } = await supabaseAdmin
            .from('aplicaciones_turismo_australia')
            .select('*')
            .eq('id', params.id)
            .single()

          if (ausApp) {
            app = ausApp
            destination = 'australia'
          } else {
            notFound()
          }
        }
      }
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
  } else if (destination === 'canada') {
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
  } else if (destination === 'uk') {
    const d = app
    const [passport, photo, bankStatements, employmentProof, tiesProof, otherVisa, itinerary] = await Promise.all([
      getSignedPhotoUrl(bucket, d.passport_file_url),
      getSignedPhotoUrl(bucket, d.photo_file_url),
      getSignedPhotoUrl(bucket, d.bank_statements_url),
      getSignedPhotoUrl(bucket, d.employment_proof_url),
      getSignedPhotoUrl(bucket, d.ties_proof_url),
      getSignedPhotoUrl(bucket, d.other_visa_url),
      getSignedPhotoUrl(bucket, d.itinerary_url),
    ])
    // Also handle dynamic documents array
    let extraDocs: any[] = []
    if (d.documents && Array.isArray(d.documents)) {
      const docPromises = d.documents.map(async (doc: any) => {
        const url = await getSignedPhotoUrl(bucket, doc.url)
        return { ...doc, signedUrl: url }
      })
      extraDocs = await Promise.all(docPromises)
    }

    signedPhotoUrls = { 
      passport, photo, bankStatements, employmentProof, tiesProof, otherVisa, itinerary, extraDocs 
    }
  } else if (destination === 'schengen') {
    const d = app
    const [passport, photo, travelInsurance, bankStatements, accommodation, flightItinerary, employmentProof, tiesProof] = await Promise.all([
      getSignedPhotoUrl(bucket, d.passport_file_url),
      getSignedPhotoUrl(bucket, d.photo_file_url),
      getSignedPhotoUrl(bucket, d.travel_insurance_url),
      getSignedPhotoUrl(bucket, d.bank_statements_url),
      getSignedPhotoUrl(bucket, d.accommodation_url),
      getSignedPhotoUrl(bucket, d.flight_itinerary_url),
      getSignedPhotoUrl(bucket, d.employment_proof_url),
      getSignedPhotoUrl(bucket, d.ties_proof_url),
    ])
    
    let extraDocs: any[] = []
    if (d.documents && Array.isArray(d.documents)) {
      const docPromises = d.documents.map(async (doc: any) => {
        const url = await getSignedPhotoUrl(bucket, doc.url)
        return { ...doc, signedUrl: url }
      })
      extraDocs = await Promise.all(docPromises)
    }

    signedPhotoUrls = {
      passport, photo, travelInsurance, bankStatements, accommodation, flightItinerary, employmentProof, tiesProof, extraDocs
    }
  } else if (destination === 'australia') {
    const d = app
    const [doc_group1_arraigo, doc_group2_fondos, doc_group3_viajes, doc_national_id_url] = await Promise.all([
      getSignedPhotoUrl(bucket, d.doc_group1_arraigo),
      getSignedPhotoUrl(bucket, d.doc_group2_fondos),
      getSignedPhotoUrl(bucket, d.doc_group3_viajes),
      getSignedPhotoUrl(bucket, d.doc_national_id_url),
    ])

    signedPhotoUrls = { doc_group1_arraigo, doc_group2_fondos, doc_group3_viajes, doc_national_id_url }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/solicitudes"
          className="flex items-center justify-center bg-white border border-[#E5E5E5] text-[#0A0A0A] p-2 rounded-lg hover:border-[#0A0A0A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-[PPMonumentExtended]">
            Detalles de Solicitud <span className="text-sm bg-black text-[#C8FF00] px-2 py-1 rounded-md ml-2 align-middle">{destination === 'usa' ? 'USA' : destination === 'canada' ? 'CANADÁ' : destination === 'uk' ? 'UK' : destination === 'australia' ? 'AUSTRALIA' : 'SCHENGEN'}</span>
          </h2>
          <p className="text-[#525252] text-sm">ID: {app.id}</p>
        </div>
      </div>

      {destination === 'usa' ? (
        <AdminDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      ) : destination === 'canada' ? (
        <CanadaDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      ) : destination === 'uk' ? (
        <UKDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      ) : destination === 'australia' ? (
        <AustraliaDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      ) : (
        <SchengenDetailsClient application={app} signedPhotoUrls={signedPhotoUrls} />
      )}
    </div>
  )
}

