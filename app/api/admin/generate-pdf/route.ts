import { NextResponse } from 'next/server'
import { generateApplicationPdfAction } from '@/app/admin/applications/[id]/_actions/generate-pdf'

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json()
    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'Falta applicationId' })
    }
    
    // We can call the action function directly since it's just a normal async function 
    // when called from an API Route (it won't go through the Server Action Webpack proxy boundary)
    const result = await generateApplicationPdfAction(applicationId)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error inesperado' })
  }
}
