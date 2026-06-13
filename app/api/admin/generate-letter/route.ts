import { NextResponse } from 'next/server'
import { generateIntentionLetterBg as genCanada } from '@/app/aplicar/turismo-canada/_actions/generate-intention-letter'
import { generateIntentionLetterBg as genUK } from '@/app/aplicar/turismo-uk/_actions/generate-intention-letter'
import { generateIntentionLetterBg as genSchengen } from '@/app/aplicar/turismo-schengen/_actions/generate-intention-letter'

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { applicationId, destination } = await request.json()
    if (!applicationId || !destination) {
      return NextResponse.json({ success: false, error: 'Falta applicationId o destination' }, { status: 400 })
    }

    console.log(`[API_LETTER] Starting for ${applicationId} (${destination})`)

    let result;
    if (destination === 'canada') {
      result = await genCanada(applicationId)
    } else if (destination === 'uk') {
      result = await genUK(applicationId)
    } else if (destination === 'schengen') {
      result = await genSchengen(applicationId)
    } else {
      return NextResponse.json({ success: false, error: 'Destino no válido' })
    }

    console.log(`[API_LETTER] Done. Success: ${result.success}`)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error(`[API_LETTER_ERROR]`, err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
