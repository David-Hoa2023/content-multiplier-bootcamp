import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export interface TextChunk {
  content: string
  index: number
  tokenCount: number
}

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
}

/**
 * Split text into chunks for embedding
 */
export function chunkText(text: string, maxTokens: number = 500, overlap: number = 50): TextChunk[] {
  // Simple chunking by sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks: TextChunk[] = []
  
  let currentChunk = ''
  let currentTokens = 0
  let chunkIndex = 0
  
  for (const sentence of sentences) {
    const sentenceTokens = Math.ceil(sentence.length / 4) // Rough token estimate
    
    if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
        tokenCount: currentTokens
      })
      
      // Start new chunk with overlap
      const overlapSentences = sentences.slice(Math.max(0, sentences.indexOf(sentence) - overlap), sentences.indexOf(sentence))
      currentChunk = overlapSentences.join('. ') + (overlapSentences.length > 0 ? '. ' : '') + sentence
      currentTokens = Math.ceil(currentChunk.length / 4)
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence
      currentTokens += sentenceTokens
    }
  }
  
  // Add last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      tokenCount: currentTokens
    })
  }
  
  return chunks
}

/**
 * Generate embedding for text using Gemini
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!geminiClient) {
    throw new Error('Gemini API key not configured')
  }

  try {
    const model = geminiClient.getGenerativeModel({ model: 'text-embedding-004' })
    const result = await model.embedContent(text)

    return {
      embedding: result.embedding.values,
      tokenCount: Math.ceil(text.length / 4) // Rough token estimate
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Process document: chunk text and generate embeddings
 */
export async function processDocumentForSearch(content: string): Promise<Array<{ chunk: TextChunk, embedding: number[] }>> {
  const chunks = chunkText(content)
  const results: Array<{ chunk: TextChunk, embedding: number[] }> = []
  
  for (const chunk of chunks) {
    try {
      const embeddingResult = await generateEmbedding(chunk.content)
      results.push({
        chunk: {
          ...chunk,
          tokenCount: embeddingResult.tokenCount
        },
        embedding: embeddingResult.embedding
      })
    } catch (error) {
      console.error(`Error processing chunk ${chunk.index}:`, error)
      // Continue processing other chunks
    }
  }
  
  return results
}