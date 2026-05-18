import { renderToBuffer } from '@react-pdf/renderer'
import { UsaApplicationPDF } from './UsaApplicationPDF'
import { UsaApplicationFormData } from '../types/application'
import React from 'react'

export async function generateApplicationPdf(
  data: any,
  photoUrls?: {
    passport?: string
    previousVisa?: string
    visaPhoto?: string
  }
): Promise<Buffer> {
  const pdfElement = React.createElement(UsaApplicationPDF, { data, photoUrls })
  // Need to cast to any due to @react-pdf/renderer internal types mismatch sometimes
  const buffer = await renderToBuffer(pdfElement as any)
  return buffer
}
