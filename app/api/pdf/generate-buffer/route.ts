import { NextResponse } from 'next/server'
import { generateApplicationPdf } from '@/lib/pdf/generate-pdf'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const pdfBuffer = await generateApplicationPdf(formData, {})
    
    // Return the raw buffer as binary data
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error: any) {
    console.error('[API_PDF_BUFFER] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
