import pool from '../db'
import { 
  Document, 
  DocumentChunk, 
  CreateDocumentRequest, 
  SearchDocumentsRequest,
  SearchResult,
  DocumentSearchResponse 
} from '../types/documents'
import { processDocumentForSearch, generateEmbedding, cosineSimilarity } from './embeddingService'

/**
 * Create a new document with metadata
 */
export async function createDocument(data: CreateDocumentRequest): Promise<Document> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Insert document
    const documentQuery = `
      INSERT INTO documents (title, author, published_date, tags, content, file_path, file_type, file_size, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'processing')
      RETURNING *
    `
    
    const documentResult = await client.query(documentQuery, [
      data.title,
      data.author || null,
      data.published_date || null,
      data.tags || [],
      data.content,
      data.file_path || null,
      data.file_type || null,
      data.file_size || null
    ])
    
    const document = documentResult.rows[0] as Document
    
    // Process document for search (chunking and embeddings)
    try {
      const processedChunks = await processDocumentForSearch(data.content)
      
      // Insert chunks and embeddings
      for (const { chunk, embedding } of processedChunks) {
        const chunkQuery = `
          INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count)
          VALUES ($1, $2, $3, $4, $5)
        `
        
        await client.query(chunkQuery, [
          document.id,
          chunk.index,
          chunk.content,
          `[${embedding.join(',')}]`, // Format as vector literal
          chunk.tokenCount
        ])
      }
      
      // Update document status to ready
      await client.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        ['ready', document.id]
      )
      document.status = 'ready'
      
    } catch (embeddingError) {
      console.error('Error processing document for search:', embeddingError)
      
      // Update document status to error
      await client.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        ['error', document.id]
      )
      document.status = 'error'
    }
    
    await client.query('COMMIT')
    return document
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get all documents with optional filtering
 */
export async function getDocuments(filters: {
  author?: string
  tags?: string[]
  status?: string
  limit?: number
  offset?: number
} = {}): Promise<{ documents: Document[], total: number }> {
  let query = 'SELECT * FROM documents'
  let countQuery = 'SELECT COUNT(*) FROM documents'
  const conditions = []
  const values = []
  let paramIndex = 1
  
  // Build WHERE conditions
  if (filters.author) {
    conditions.push(`author ILIKE $${paramIndex}`)
    values.push(`%${filters.author}%`)
    paramIndex++
  }
  
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`tags && $${paramIndex}`)
    values.push(filters.tags)
    paramIndex++
  }
  
  if (filters.status) {
    conditions.push(`status = $${paramIndex}`)
    values.push(filters.status)
    paramIndex++
  }
  
  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`
    query += whereClause
    countQuery += whereClause
  }
  
  // Add ordering and pagination
  query += ' ORDER BY created_at DESC'
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`
    values.push(filters.limit)
    paramIndex++
  }
  
  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`
    values.push(filters.offset)
    paramIndex++
  }
  
  const [documentsResult, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values.slice(0, values.length - (filters.limit ? 1 : 0) - (filters.offset ? 1 : 0)))
  ])
  
  return {
    documents: documentsResult.rows as Document[],
    total: parseInt(countResult.rows[0].count)
  }
}

/**
 * Search documents by similarity
 */
export async function searchDocuments(request: SearchDocumentsRequest): Promise<DocumentSearchResponse> {
  const limit = request.limit || 20
  const offset = request.offset || 0
  const page = Math.floor(offset / limit) + 1
  
  if (!request.query) {
    // If no query, return regular filtered results
    const { documents, total } = await getDocuments({
      author: request.author,
      tags: request.tags,
      status: 'ready',
      limit,
      offset
    })
    
    return {
      results: documents.map(doc => ({ document: doc, chunks: [] })),
      total,
      page,
      limit
    }
  }
  
  try {
    // Generate embedding for search query
    const queryEmbeddingResult = await generateEmbedding(request.query)
    const queryEmbedding = queryEmbeddingResult.embedding
    
    // Search for similar chunks using vector similarity
    let searchQuery = `
      SELECT 
        d.*,
        dc.id as chunk_id,
        dc.chunk_index,
        dc.content as chunk_content,
        dc.embedding,
        dc.token_count,
        (dc.embedding <=> $1::vector) as similarity_distance
      FROM documents d
      JOIN document_chunks dc ON d.id = dc.document_id
      WHERE d.status = 'ready' AND dc.embedding IS NOT NULL
    `
    
    const conditions = []
    const values = [queryEmbedding]
    let paramIndex = 2
    
    // Add filters
    if (request.author) {
      conditions.push(`d.author ILIKE $${paramIndex}`)
      values.push(`%${request.author}%`)
      paramIndex++
    }
    
    if (request.tags && request.tags.length > 0) {
      conditions.push(`d.tags && $${paramIndex}`)
      values.push(request.tags)
      paramIndex++
    }
    
    if (conditions.length > 0) {
      searchQuery += ` AND ${conditions.join(' AND ')}`
    }
    
    searchQuery += ` ORDER BY similarity_distance ASC LIMIT ${limit} OFFSET ${offset}`
    
    const result = await pool.query(searchQuery, values)
    const rows = result.rows
    
    // Group results by document and calculate similarity scores
    const documentMap = new Map<number, SearchResult>()
    
    for (const row of rows) {
      if (!documentMap.has(row.id)) {
        documentMap.set(row.id, {
          document: {
            id: row.id,
            title: row.title,
            author: row.author,
            published_date: row.published_date,
            tags: row.tags,
            content: row.content,
            file_path: row.file_path,
            file_type: row.file_type,
            file_size: row.file_size,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at
          },
          chunks: [],
          similarity_score: 0
        })
      }
      
      const searchResult = documentMap.get(row.id)!
      
      // Use similarity distance from database query
      const similarity = 1 - row.similarity_distance // Convert distance to similarity score
      
      searchResult.chunks.push({
        id: row.chunk_id,
        document_id: row.id,
        chunk_index: row.chunk_index,
        content: row.chunk_content,
        embedding: row.embedding,
        token_count: row.token_count,
        created_at: row.created_at
      })
      
      // Update max similarity score for document
      searchResult.similarity_score = Math.max(searchResult.similarity_score || 0, similarity)
    }
    
    // Sort by similarity score
    const results = Array.from(documentMap.values()).sort((a, b) => 
      (b.similarity_score || 0) - (a.similarity_score || 0)
    )
    
    return {
      results,
      total: results.length,
      page,
      limit
    }
    
  } catch (error) {
    console.error('Error searching documents:', error)
    
    // Fallback to regular search
    const { documents, total } = await getDocuments({
      author: request.author,
      tags: request.tags,
      status: 'ready',
      limit,
      offset
    })
    
    return {
      results: documents.map(doc => ({ document: doc, chunks: [] })),
      total,
      page,
      limit
    }
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: number): Promise<Document | null> {
  const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id])
  return result.rows[0] || null
}

/**
 * Update document
 */
export async function updateDocument(id: number, data: Partial<CreateDocumentRequest>): Promise<Document | null> {
  const fields = []
  const values = []
  let paramIndex = 1
  
  if (data.title !== undefined) {
    fields.push(`title = $${paramIndex}`)
    values.push(data.title)
    paramIndex++
  }
  
  if (data.author !== undefined) {
    fields.push(`author = $${paramIndex}`)
    values.push(data.author)
    paramIndex++
  }
  
  if (data.published_date !== undefined) {
    fields.push(`published_date = $${paramIndex}`)
    values.push(data.published_date)
    paramIndex++
  }
  
  if (data.tags !== undefined) {
    fields.push(`tags = $${paramIndex}`)
    values.push(data.tags)
    paramIndex++
  }
  
  if (data.content !== undefined) {
    fields.push(`content = $${paramIndex}`)
    values.push(data.content)
    paramIndex++
  }
  
  if (fields.length === 0) {
    return getDocumentById(id)
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)
  
  const query = `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const result = await pool.query(query, values)
  
  return result.rows[0] || null
}

/**
 * Delete document
 */
export async function deleteDocument(id: number): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Delete chunks first (cascaded by foreign key, but explicit for clarity)
    await client.query('DELETE FROM document_chunks WHERE document_id = $1', [id])
    
    // Delete document
    const result = await client.query('DELETE FROM documents WHERE id = $1', [id])
    
    await client.query('COMMIT')
    return result.rowCount > 0
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get all unique authors
 */
export async function getAuthors(): Promise<string[]> {
  const result = await pool.query(`
    SELECT DISTINCT author 
    FROM documents 
    WHERE author IS NOT NULL AND author != '' 
    ORDER BY author
  `)
  
  return result.rows.map(row => row.author)
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const result = await pool.query(`
    SELECT DISTINCT unnest(tags) as tag 
    FROM documents 
    WHERE tags IS NOT NULL 
    ORDER BY tag
  `)
  
  return result.rows.map(row => row.tag)
}