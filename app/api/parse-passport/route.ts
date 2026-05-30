import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as mrz from 'mrz'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    
    let isPdf = false
    let mediaType = ''

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      isPdf = true
      mediaType = 'application/pdf'
    } else if (file.type.startsWith('image/')) {
      mediaType = file.type
    } else {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    const documentContent = isPdf ? {
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: base64String
      }
    } : {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType as any,
        data: base64String
      }
    }

    let mrzOcrPromise: Promise<any> | null = null

    if (!isPdf) {
      mrzOcrPromise = anthropic.messages.create({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 300,
        system: 'Extract ONLY the 2 or 3 lines of the Machine Readable Zone (MRZ) from the bottom of the passport. Return ONLY a valid JSON array of strings, with no markdown formatting. Example: ["P<USASMITH<<JOHN<<<<<<<<<<<<<<<<<<<<", "1234567890USA1234567M1234567<<<<<<<9"]',
        messages: [
          {
            role: 'user',
            content: [
              documentContent,
              { type: 'text', text: 'Extract the MRZ lines.' }
            ]
          }
        ]
      })
    }

    const visionPrompt = `You are a passport data extractor. Extract ONLY these fields from the passport image and return ONLY valid JSON, no markdown, no explanation:
{
  "place_of_birth": "string or null",
  "date_of_issue": "string (DD/MM/YYYY) or null",
  "issuing_country": "string (full country name) or null",
  "full_name": "string or null",
  "surname": "string or null",
  "given_names": "string or null",
  "document_number": "string or null",
  "nationality": "string or null",
  "date_of_birth": "string (DD/MM/YYYY) or null",
  "date_of_expiry": "string (DD/MM/YYYY) or null"
}
If a field is not visible or unclear, return null for that field.`

    const visionPromise = anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251001',
      max_tokens: 1000,
      system: visionPrompt,
      messages: [
        {
          role: 'user',
          content: [
            documentContent,
            { type: 'text', text: 'Extract passport data exactly as requested in JSON.' }
          ]
        }
      ]
    })

    const [mrzOcrRes, visionRes] = await Promise.all([
      mrzOcrPromise || Promise.resolve(null), 
      visionPromise
    ])

    let mrzParsed: any = null
    if (mrzOcrRes) {
      try {
        const mrzText = (mrzOcrRes.content[0] as any).text.trim()
        const mrzLines = JSON.parse(mrzText)
        if (Array.isArray(mrzLines) && mrzLines.length > 0) {
          mrzParsed = mrz.parse(mrzLines)
        }
      } catch (e) {
        console.error('MRZ parsing failed:', e)
      }
    }

    let visionData: any = {}
    try {
      const visionText = (visionRes.content[0] as any).text.trim()
      visionData = JSON.parse(visionText)
    } catch (e) {
      console.error('Vision JSON parsing failed:', e)
      return NextResponse.json({ success: false, error: 'Failed to parse Vision output as JSON' }, { status: 500 })
    }

    // 6. Merge MRZ result (higher priority) with Claude result (fills gaps)
    const merged: any = {
      surname: null,
      given_names: null,
      full_name: null,
      document_number: null,
      nationality: null,
      date_of_birth: null,
      date_of_expiry: null,
      place_of_birth: null,
      date_of_issue: null,
      issuing_country: null
    }

    const sources: any = {}

    const formatMrzDate = (mrzDateStr: string) => {
      if (!mrzDateStr || mrzDateStr.length !== 6) return null
      const y = parseInt(mrzDateStr.slice(0, 2))
      const m = mrzDateStr.slice(2, 4)
      const d = mrzDateStr.slice(4, 6)
      // basic century guessing (MRZ only has 2 digit year)
      const currentYear = new Date().getFullYear() % 100
      const century = y > currentYear + 15 ? 1900 : 2000
      return `${d}/${m}/${century + y}`
    }

    // Fields from MRZ
    if (mrzParsed && mrzParsed.fields) {
      const f = mrzParsed.fields
      if (f.lastName) { merged.surname = f.lastName; sources.surname = 'mrz' }
      if (f.firstName) { merged.given_names = f.firstName; sources.given_names = 'mrz' }
      if (f.documentNumber) { merged.document_number = f.documentNumber; sources.document_number = 'mrz' }
      if (f.nationality) { merged.nationality = f.nationality; sources.nationality = 'mrz' }
      if (f.birthDate) { merged.date_of_birth = formatMrzDate(f.birthDate); sources.date_of_birth = 'mrz' }
      if (f.expirationDate) { merged.date_of_expiry = formatMrzDate(f.expirationDate); sources.date_of_expiry = 'mrz' }
    }

    // Fallback/fill gaps with visionData
    const visionFields = [
      'place_of_birth', 'date_of_issue', 'issuing_country', 
      'full_name', 'surname', 'given_names', 'document_number', 
      'nationality', 'date_of_birth', 'date_of_expiry'
    ]

    for (const field of visionFields) {
      if (visionData[field]) {
        if (!merged[field]) {
          merged[field] = visionData[field]
          sources[field] = 'vision'
        } else if (merged[field] === visionData[field] && sources[field] === 'mrz') {
          sources[field] = 'both'
        }
      }
    }

    // Synthesize full_name if missing
    if (!merged.full_name && merged.given_names && merged.surname) {
      merged.full_name = `${merged.given_names} ${merged.surname}`
      sources.full_name = sources.given_names === 'mrz' && sources.surname === 'mrz' ? 'mrz' : 'vision'
    }

    // 7. Return merged JSON
    return NextResponse.json({
      success: true,
      data: merged,
      sources
    })

  } catch (error: any) {
    console.error('Passport parse error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
