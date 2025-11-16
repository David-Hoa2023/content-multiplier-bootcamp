/**
 * Lazy-load wrapper for pdf-parse to avoid module system issues at startup
 * This prevents "process.getBuiltinModule is not a function" errors
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

