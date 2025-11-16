/**
 * PDF parsing utility for Node.js
 * Uses pdf-parse with custom options to avoid DOM-related errors
 */

let pdfParseMod: any

export async function getPdfParse() {
  if (!pdfParseMod) {
    const mod = await import('pdf-parse')
    // Handle both CommonJS and ESM default exports
    pdfParseMod = (mod as any).default ?? mod
  }
  return pdfParseMod
}

/**
 * Parse PDF buffer with options that avoid DOM dependencies
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const pdfParse = await getPdfParse()

  try {
    // Use custom render page function to avoid canvas/DOMMatrix issues
    const options = {
      // Don't render pages - just extract raw text
      pagerender: function(pageData: any) {
        return pageData.getTextContent().then(function(textContent: any) {
          let text = ''
          for (const item of textContent.items) {
            text += (item as any).str + ' '
          }
          return text
        })
      }
    }

    const data = await pdfParse(buffer, options)
    return data.text || ''
  } catch (error) {
    console.error('Error parsing PDF:', error)
    // Fallback: try without custom renderer
    try {
      const data = await pdfParse(buffer)
      return data.text || ''
    } catch (fallbackError) {
      console.error('PDF fallback parsing also failed:', fallbackError)
      throw new Error('Failed to parse PDF file')
    }
  }
}

