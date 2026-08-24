// Some client-generated PDFs (seen from TCPDF-based tools like Colpensiones'
// exporter) prepend a UTF-8 BOM and/or stray CRLFs before the %PDF header.
// PDF viewers tolerate this, but strict consumers (Anthropic's API, in the
// n8n translation pipeline) reject the file outright. Stripping everything
// before the first %PDF marker fixes it without touching valid files.
const PDF_MARKER = [0x25, 0x50, 0x44, 0x46] // "%PDF"

// Garbage prefixes seen in practice are a handful of bytes (BOM + CRLFs);
// searching a generous window instead of the whole file keeps this cheap
// even for large PDFs.
const SEARCH_WINDOW = 4096

function findPdfHeaderOffset(bytes: Uint8Array): number {
  const limit = Math.min(bytes.length - PDF_MARKER.length, SEARCH_WINDOW)
  for (let i = 0; i <= limit; i++) {
    if (
      bytes[i] === PDF_MARKER[0] &&
      bytes[i + 1] === PDF_MARKER[1] &&
      bytes[i + 2] === PDF_MARKER[2] &&
      bytes[i + 3] === PDF_MARKER[3]
    ) {
      return i
    }
  }
  return -1
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

// Returns the original File unchanged for non-PDFs. For PDFs, strips any
// bytes before the %PDF header; if no header is found within the search
// window, logs a warning and returns the file untouched.
export async function sanitizePdfFile(file: File): Promise<File> {
  if (!isPdfFile(file)) return file

  const bytes = new Uint8Array(await file.arrayBuffer())
  const offset = findPdfHeaderOffset(bytes)

  if (offset === -1) {
    console.warn(`[PDF_SANITIZE] No se encontró el header %PDF en "${file.name}" — se sube sin modificar.`)
    return file
  }

  if (offset === 0) return file

  const cleaned = bytes.subarray(offset)
  return new File([cleaned], file.name, { type: 'application/pdf' })
}
