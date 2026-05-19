import { renderToBuffer } from '@react-pdf/renderer'
import { UsaApplicationPDF } from './UsaApplicationPDF'
import React from 'react'

export async function generateApplicationPdf(data: any, photoUrls?: Record<string, string>): Promise<Buffer> {
  const pdfElement = React.createElement(UsaApplicationPDF, { data, photoUrls })
  const buffer = await renderToBuffer(pdfElement as any)
  return buffer
}
