import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { knowledgeService } from '../services/knowledgeService'

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'knowledge')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

interface UploadDocumentBody {
  title?: string
  category_ids?: string // JSON string of category IDs
  metadata?: string // JSON string of additional metadata
}

interface QueryKnowledgeBody {
  query: string
  limit?: number
  similarity_threshold?: number
  category_ids?: number[]
}

interface GetDocumentsQuery {
  category?: string
  status?: string
  page?: string
  limit?: string
}

export async function knowledgeRoutes(fastify: FastifyInstance) {
  // Register multipart plugin
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB for documents
    }
  })

  // Upload and process document
  fastify.post('/api/knowledge/upload', async (request, reply) => {
    try {
      const parts = request.parts()
      let documentData: any = {}
      let uploadedFile: any = null

      for await (const part of parts) {
        if (part.type === 'file') {
          // Validate file type
          const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/markdown',
            'application/json'
          ]
          const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.json']
          
          const isValidFile = allowedTypes.includes(part.mimetype) || 
                             allowedExtensions.some(ext => part.filename.toLowerCase().endsWith(ext))
          
          if (!isValidFile) {
            return reply.status(400).send({
              success: false,
              error: 'File must be PDF, DOCX, TXT, MD, or JSON'
            })
          }

          // Save file
          const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${part.filename}`
          const filepath = path.join(uploadsDir, filename)
          
          await pipeline(part.file, fs.createWriteStream(filepath))
          
          uploadedFile = {
            filename: part.filename,
            filepath,
            size: fs.statSync(filepath).size,
            mimetype: part.mimetype
          }
        } else {
          // Handle form fields
          const value = (part as any).value
          if (part.fieldname === 'category_ids' || part.fieldname === 'metadata') {
            try {
              documentData[part.fieldname] = JSON.parse(value)
            } catch {
              documentData[part.fieldname] = value
            }
          } else {
            documentData[part.fieldname] = value
          }
        }
      }

      if (!uploadedFile) {
        return reply.status(400).send({
          success: false,
          error: 'No file provided'
        })
      }

      // Process the document
      const document = await knowledgeService.processDocument({
        title: documentData.title || uploadedFile.filename,
        filename: uploadedFile.filename,
        file_path: uploadedFile.filepath,
        file_type: uploadedFile.mimetype,
        file_size: uploadedFile.size,
        metadata: documentData.metadata || {},
        category_ids: documentData.category_ids || []
      })

      reply.code(201).send({
        success: true,
        data: document,
        message: 'Document uploaded and processing started'
      })
    } catch (error) {
      console.error('Error uploading knowledge document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to upload document'
      })
    }
  })

  // Query knowledge base
  fastify.post('/api/knowledge/query', async (request: FastifyRequest<{ Body: QueryKnowledgeBody }>, reply) => {
    try {
      const { query, limit = 5, similarity_threshold = 0.7, category_ids } = request.body

      if (!query?.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Query is required'
        })
      }

      const results = await knowledgeService.queryKnowledge({
        query: query.trim(),
        limit,
        similarity_threshold,
        category_ids
      })

      reply.send({
        success: true,
        data: {
          query,
          results,
          total: results.length
        }
      })
    } catch (error) {
      console.error('Error querying knowledge base:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to query knowledge base'
      })
    }
  })

  // Get all knowledge documents
  fastify.get('/api/knowledge/documents', async (request: FastifyRequest<{ Querystring: GetDocumentsQuery }>, reply) => {
    try {
      const { category, status, page = '1', limit = '20' } = request.query
      
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum

      const result = await knowledgeService.getDocuments({
        category,
        status,
        limit: limitNum,
        offset
      })

      reply.send({
        success: true,
        data: {
          documents: result.documents,
          pagination: {
            total: result.total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(result.total / limitNum)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching knowledge documents:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch documents'
      })
    }
  })

  // Get document by ID
  fastify.get('/api/knowledge/documents/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const document = await knowledgeService.getDocumentById(request.params.id)
      
      if (!document) {
        return reply.status(404).send({
          success: false,
          error: 'Document not found'
        })
      }

      reply.send({
        success: true,
        data: document
      })
    } catch (error) {
      console.error('Error fetching document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch document'
      })
    }
  })

  // Delete document
  fastify.delete('/api/knowledge/documents/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const deleted = await knowledgeService.deleteDocument(request.params.id)
      
      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Document not found'
        })
      }

      reply.send({
        success: true,
        message: 'Document deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to delete document'
      })
    }
  })

  // Get categories
  fastify.get('/api/knowledge/categories', async (request, reply) => {
    try {
      const categories = await knowledgeService.getCategories()
      
      reply.send({
        success: true,
        data: categories
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch categories'
      })
    }
  })

  // Create category
  fastify.post('/api/knowledge/categories', async (request: FastifyRequest<{ 
    Body: { name: string, description?: string, color?: string } 
  }>, reply) => {
    try {
      const { name, description, color } = request.body

      if (!name?.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Category name is required'
        })
      }

      const category = await knowledgeService.createCategory({
        name: name.trim(),
        description,
        color
      })

      reply.code(201).send({
        success: true,
        data: category
      })
    } catch (error) {
      console.error('Error creating category:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to create category'
      })
    }
  })

  // Get knowledge base stats
  fastify.get('/api/knowledge/stats', async (request, reply) => {
    try {
      const stats = await knowledgeService.getKnowledgeStats()
      
      reply.send({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching knowledge stats:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch knowledge stats'
      })
    }
  })

  // Reprocess document (re-chunk and re-embed)
  fastify.post('/api/knowledge/documents/:id/reprocess', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const document = await knowledgeService.reprocessDocument(request.params.id)
      
      if (!document) {
        return reply.status(404).send({
          success: false,
          error: 'Document not found'
        })
      }

      reply.send({
        success: true,
        data: document,
        message: 'Document reprocessing started'
      })
    } catch (error) {
      console.error('Error reprocessing document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to reprocess document'
      })
    }
  })
}