import { NextResponse } from 'next/server'

// TEMPORARY diagnostic route — delete after use. Gated by the existing
// /api/admin/* middleware (requires admin_auth cookie).
export async function GET() {
  return NextResponse.json({
    N8N_DOCS_WEBHOOK_URL: process.env.N8N_DOCS_WEBHOOK_URL || null,
  })
}
