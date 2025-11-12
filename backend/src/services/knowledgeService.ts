import pool from '../db'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { generateEmbedding } from './embeddingService'

interface ProcessDocumentRequest {
  title: string
  filename: string
  file_path: string
  file_type: string
  file_size: number
  metadata?: Record<string, any>
  category_ids?: number[]
}

interface QueryKnowledgeRequest {
  query: string
  limit: number
  similarity_threshold: number
  category_ids?: number[]
}

interface GetDocumentsRequest {
  category?: string
  status?: string
  limit: number
  offset: number
}

interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
}

class KnowledgeService {
  // Extract text content from different file types
  private async extractTextFromFile(filePath: string, fileType: string): Promise<string> {
    try {
      if (fileType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath)
        const data = await pdf(dataBuffer)
        return data.text
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath })
        return result.value
      } else if (fileType.startsWith('text/') || filePath.endsWith('.txt') || filePath.endsWith('.md')) {
        return fs.readFileSync(filePath, 'utf-8')
      } else if (fileType === 'application/json' || filePath.endsWith('.json')) {
        const jsonContent = fs.readFileSync(filePath, 'utf-8')
        return JSON.stringify(JSON.parse(jsonContent), null, 2)
      }
      
      throw new Error(`Unsupported file type: ${fileType}`)
    } catch (error) {
      console.error('Error extracting text from file:', error)
      throw error
    }
  }

  // Split text into chunks for embedding
  private chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.')
          
          // Add overlap by starting new chunk with last part of current chunk
          const words = currentChunk.split(' ')
          const overlapWords = words.slice(-Math.min(overlap, words.length - 1))
          currentChunk = overlapWords.join(' ')
        }
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.')
    }

    return chunks.filter(chunk => chunk.trim().length > 10) // Filter out very short chunks
  }

  // Process uploaded document
  async processDocument(request: ProcessDocumentRequest): Promise<any> {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Insert document record
      const documentResult = await client.query(`
        INSERT INTO knowledge_documents (title, filename, file_path, file_type, file_size, metadata, status, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, 'processing', 1)
        RETURNING *
      `, [
        request.title,
        request.filename,
        request.file_path,
        request.file_type,
        request.file_size,
        JSON.stringify(request.metadata || {})
      ])

      const document = documentResult.rows[0]

      // Associate with categories
      if (request.category_ids && request.category_ids.length > 0) {
        for (const categoryId of request.category_ids) {
          await client.query(`
            INSERT INTO knowledge_document_categories (document_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [document.id, categoryId])
        }
      }

      await client.query('COMMIT')

      // Process document asynchronously
      this.processDocumentAsync(document.id, request.file_path, request.file_type)
        .catch(error => console.error('Error in async document processing:', error))

      return document
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // Asynchronous document processing (chunking and embedding)
  private async processDocumentAsync(documentId: string, filePath: string, fileType: string): Promise<void> {
    const client = await pool.connect()
    
    try {
      console.log(`Processing document ${documentId}...`)
      
      // Extract text content
      const textContent = await this.extractTextFromFile(filePath, fileType)
      
      // Update document with extracted text
      await client.query(`
        UPDATE knowledge_documents 
        SET content_text = $1, status = 'chunking'
        WHERE id = $2
      `, [textContent, documentId])

      // Split into chunks
      const chunks = this.chunkText(textContent)
      console.log(`Created ${chunks.length} chunks for document ${documentId}`)

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        try {
          // Generate embedding
          const embeddingResult = await generateEmbedding(chunk)
          const embedding = embeddingResult.embedding
          
          // Store chunk with embedding
          await client.query(`
            INSERT INTO knowledge_chunks (document_id, chunk_text, chunk_index, token_count, embedding)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            documentId,
            chunk,
            i,
            chunk.split(' ').length, // Simple token count approximation
            JSON.stringify(embedding)
          ])
        } catch (error) {
          console.error(`Error processing chunk ${i} for document ${documentId}:`, error)
          // Continue with other chunks even if one fails
        }
      }

      // Update document status to ready
      await client.query(`
        UPDATE knowledge_documents 
        SET status = 'ready', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [documentId])

      console.log(`Document ${documentId} processed successfully`)
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error)
      
      // Update document status to error
      await client.query(`
        UPDATE knowledge_documents 
        SET status = 'error', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [documentId])
    } finally {
      client.release()
    }
  }

  // Query knowledge base using semantic search
  async queryKnowledge(request: QueryKnowledgeRequest): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbeddingResult = await generateEmbedding(request.query)
      const queryEmbedding = queryEmbeddingResult.embedding
      
      // Build the SQL query
      let sql = `
        SELECT 
          kc.chunk_text,
          kc.chunk_index,
          kd.id as document_id,
          kd.title as document_title,
          kd.filename,
          kd.file_type,
          kd.created_at,
          1 - (kc.embedding <=> $1::vector) AS similarity_score
        FROM knowledge_chunks kc
        JOIN knowledge_documents kd ON kc.document_id = kd.id
        WHERE kd.status = 'ready'
          AND 1 - (kc.embedding <=> $1::vector) >= $2
      `
      
      const params = [JSON.stringify(queryEmbedding), request.similarity_threshold]
      let paramIndex = 3

      // Filter by categories if specified
      if (request.category_ids && request.category_ids.length > 0) {
        sql += ` AND kd.id IN (
          SELECT kdc.document_id 
          FROM knowledge_document_categories kdc 
          WHERE kdc.category_id = ANY($${paramIndex})
        )`
        params.push(request.category_ids)
        paramIndex++
      }

      sql += ` ORDER BY similarity_score DESC LIMIT $${paramIndex}`
      params.push(request.limit)

      const result = await pool.query(sql, params)
      
      return result.rows.map(row => ({
        chunk_text: row.chunk_text,
        chunk_index: row.chunk_index,
        similarity_score: parseFloat(row.similarity_score),
        document: {
          id: row.document_id,
          title: row.document_title,
          filename: row.filename,
          file_type: row.file_type,
          created_at: row.created_at
        }
      }))
    } catch (error) {
      console.error('Error querying knowledge base:', error)
      throw error
    }
  }

  // Get documents with filtering
  async getDocuments(request: GetDocumentsRequest): Promise<{ documents: any[], total: number }> {
    try {
      let whereConditions = []
      let params = []
      let paramIndex = 1

      if (request.category) {
        whereConditions.push(`kd.id IN (
          SELECT kdc.document_id 
          FROM knowledge_document_categories kdc 
          JOIN knowledge_categories kc ON kdc.category_id = kc.id 
          WHERE kc.name = $${paramIndex}
        )`)
        params.push(request.category)
        paramIndex++
      }

      if (request.status) {
        whereConditions.push(`kd.status = $${paramIndex}`)
        params.push(request.status)
        paramIndex++
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

      // Get total count
      const countResult = await pool.query(`
        SELECT COUNT(*)::int as total
        FROM knowledge_documents kd
        ${whereClause}
      `, params)

      // Get documents
      const documentsResult = await pool.query(`
        SELECT 
          kd.*,
          COALESCE(
            json_agg(
              json_build_object('id', kc.id, 'name', kc.name, 'color', kc.color)
            ) FILTER (WHERE kc.id IS NOT NULL), 
            '[]'
          ) as categories,
          (SELECT COUNT(*)::int FROM knowledge_chunks WHERE document_id = kd.id) as chunk_count
        FROM knowledge_documents kd
        LEFT JOIN knowledge_document_categories kdc ON kd.id = kdc.document_id
        LEFT JOIN knowledge_categories kc ON kdc.category_id = kc.id
        ${whereClause}
        GROUP BY kd.id
        ORDER BY kd.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, request.limit, request.offset])

      return {
        documents: documentsResult.rows,
        total: countResult.rows[0].total
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  }

  // Get document by ID
  async getDocumentById(id: string): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT 
          kd.*,
          COALESCE(
            json_agg(
              json_build_object('id', kc.id, 'name', kc.name, 'color', kc.color)
            ) FILTER (WHERE kc.id IS NOT NULL), 
            '[]'
          ) as categories,
          (SELECT COUNT(*)::int FROM knowledge_chunks WHERE document_id = kd.id) as chunk_count
        FROM knowledge_documents kd
        LEFT JOIN knowledge_document_categories kdc ON kd.id = kdc.document_id
        LEFT JOIN knowledge_categories kc ON kdc.category_id = kc.id
        WHERE kd.id = $1
        GROUP BY kd.id
      `, [id])

      return result.rows[0] || null
    } catch (error) {
      console.error('Error fetching document by ID:', error)
      throw error
    }
  }

  // Delete document and its chunks
  async deleteDocument(id: string): Promise<boolean> {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Get file path for cleanup
      const docResult = await client.query('SELECT file_path FROM knowledge_documents WHERE id = $1', [id])
      
      if (docResult.rows.length === 0) {
        return false
      }

      const filePath = docResult.rows[0].file_path

      // Delete chunks (will cascade)
      await client.query('DELETE FROM knowledge_chunks WHERE document_id = $1', [id])
      
      // Delete document
      await client.query('DELETE FROM knowledge_documents WHERE id = $1', [id])

      // Delete file from filesystem
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (error) {
        console.error('Error deleting file:', error)
        // Don't fail the transaction for file deletion errors
      }

      await client.query('COMMIT')
      return true
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // Get all categories
  async getCategories(): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT 
          kc.*,
          COUNT(kdc.document_id)::int as document_count
        FROM knowledge_categories kc
        LEFT JOIN knowledge_document_categories kdc ON kc.id = kdc.category_id
        GROUP BY kc.id
        ORDER BY kc.name
      `)

      return result.rows
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  // Create category
  async createCategory(request: CreateCategoryRequest): Promise<any> {
    try {
      const result = await pool.query(`
        INSERT INTO knowledge_categories (name, description, color)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [request.name, request.description, request.color || '#3B82F6'])

      return result.rows[0]
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  // Get knowledge base statistics
  async getKnowledgeStats(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_documents,
          COUNT(*) FILTER (WHERE status = 'ready')::int as ready_documents,
          COUNT(*) FILTER (WHERE status = 'processing')::int as processing_documents,
          COUNT(*) FILTER (WHERE status = 'error')::int as error_documents,
          SUM(file_size)::bigint as total_file_size,
          (SELECT COUNT(*)::int FROM knowledge_chunks) as total_chunks
        FROM knowledge_documents
      `)

      return result.rows[0]
    } catch (error) {
      console.error('Error fetching knowledge stats:', error)
      throw error
    }
  }

  // Reprocess document (re-chunk and re-embed)
  async reprocessDocument(id: string): Promise<any> {
    const client = await pool.connect()
    
    try {
      // Get document info
      const docResult = await client.query('SELECT * FROM knowledge_documents WHERE id = $1', [id])
      
      if (docResult.rows.length === 0) {
        return null
      }

      const document = docResult.rows[0]

      // Delete existing chunks
      await client.query('DELETE FROM knowledge_chunks WHERE document_id = $1', [id])

      // Update status to processing
      await client.query('UPDATE knowledge_documents SET status = \'processing\' WHERE id = $1', [id])

      // Start async processing
      this.processDocumentAsync(id, document.file_path, document.file_type)
        .catch(error => console.error('Error in async document reprocessing:', error))

      return document
    } catch (error) {
      console.error('Error reprocessing document:', error)
      throw error
    } finally {
      client.release()
    }
  }
}

export const knowledgeService = new KnowledgeService()