import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { 
  createDocument, 
  getDocuments, 
  getDocumentById,
  updateDocument,
  deleteDocument,
  searchDocuments,
  getAuthors,
  getAllTags
} from '../services/documentsService'
import { CreateDocumentRequest, SearchDocumentsRequest } from '../types/documents'

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

interface CreateDocumentBody {
  title: string
  author?: string
  published_date?: string
  tags?: string[]
  content: string
  file_path?: string
  file_type?: string
  file_size?: number
}

interface UpdateDocumentBody {
  title?: string
  author?: string
  published_date?: string
  tags?: string[]
  content?: string
}

interface GetDocumentsQuery {
  author?: string
  tags?: string
  status?: string
  page?: string
  limit?: string
}

interface SearchDocumentsQuery {
  q?: string
  author?: string
  tags?: string
  page?: string
  limit?: string
}

export async function documentRoutes(fastify: FastifyInstance) {
  // Register multipart plugin
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  })

  // Create document (regular form data)
  fastify.post<{ Body: CreateDocumentBody }>('/api/documents', async (request, reply) => {
    try {
      const document = await createDocument(request.body)
      reply.code(201).send({
        success: true,
        data: document
      })
    } catch (error) {
      console.error('Error creating document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to create document'
      })
    }
  })

  // Create document with file upload
  fastify.post('/api/documents/upload', async (request, reply) => {
    try {
      const parts = request.parts()
      let documentData: any = {}
      let uploadedFile: any = null

      for await (const part of parts) {
        if (part.type === 'file') {
          // Handle file upload
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
          if (part.fieldname === 'tags') {
            documentData[part.fieldname] = JSON.parse(value)
          } else {
            documentData[part.fieldname] = value
          }
        }
      }

      // If file was uploaded, extract content from text files
      if (uploadedFile) {
        const allowedTextTypes = ['text/plain', 'text/markdown', 'application/json']
        const textExtensions = ['.txt', '.md', '.json']
        
        if (allowedTextTypes.includes(uploadedFile.mimetype) || 
            textExtensions.some(ext => uploadedFile.filename.endsWith(ext))) {
          try {
            const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf-8')
            if (!documentData.content) {
              documentData.content = fileContent
            }
          } catch (error) {
            console.error('Error reading file content:', error)
          }
        }

        documentData.file_path = uploadedFile.filepath
        documentData.file_type = uploadedFile.mimetype
        documentData.file_size = uploadedFile.size
      }

      const document = await createDocument(documentData)
      reply.code(201).send({
        success: true,
        data: document
      })
    } catch (error) {
      console.error('Error creating document with file:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to create document with file'
      })
    }
  })

  // Get documents with filtering
  fastify.get<{ Querystring: GetDocumentsQuery }>('/api/documents', async (request, reply) => {
    try {
      const { author, tags, status, page = '1', limit = '20' } = request.query
      
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum
      
      const { documents, total } = await getDocuments({
        author,
        tags: tags ? tags.split(',') : undefined,
        status,
        limit: limitNum,
        offset
      })
      
      reply.send({
        success: true,
        data: {
          documents,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching documents:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch documents'
      })
    }
  })

  // Search documents
  fastify.get<{ Querystring: SearchDocumentsQuery }>('/api/documents/search', async (request, reply) => {
    try {
      const { q, author, tags, page = '1', limit = '20' } = request.query
      
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum
      
      const searchRequest: SearchDocumentsRequest = {
        query: q,
        author,
        tags: tags ? tags.split(',') : undefined,
        limit: limitNum,
        offset
      }
      
      const result = await searchDocuments(searchRequest)
      
      reply.send({
        success: true,
        data: {
          results: result.results,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit)
          }
        }
      })
    } catch (error) {
      console.error('Error searching documents:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to search documents'
      })
    }
  })

  // Get document by ID
  fastify.get<{ Params: { id: string } }>('/api/documents/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)
      const document = await getDocumentById(id)
      
      if (!document) {
        reply.code(404).send({
          success: false,
          error: 'Document not found'
        })
        return
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

  // Update document
  fastify.put<{ Params: { id: string }, Body: UpdateDocumentBody }>('/api/documents/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)
      const document = await updateDocument(id, request.body)
      
      if (!document) {
        reply.code(404).send({
          success: false,
          error: 'Document not found'
        })
        return
      }
      
      reply.send({
        success: true,
        data: document
      })
    } catch (error) {
      console.error('Error updating document:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to update document'
      })
    }
  })

  // Delete document
  fastify.delete<{ Params: { id: string } }>('/api/documents/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)
      const deleted = await deleteDocument(id)
      
      if (!deleted) {
        reply.code(404).send({
          success: false,
          error: 'Document not found'
        })
        return
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

  // Get all authors
  fastify.get('/api/documents/meta/authors', async (request, reply) => {
    try {
      const authors = await getAuthors()
      reply.send({
        success: true,
        data: authors
      })
    } catch (error) {
      console.error('Error fetching authors:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch authors'
      })
    }
  })

  // Get all tags
  fastify.get('/api/documents/meta/tags', async (request, reply) => {
    try {
      const tags = await getAllTags()
      reply.send({
        success: true,
        data: tags
      })
    } catch (error) {
      console.error('Error fetching tags:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch tags'
      })
    }
  })

  // POST /api/images/upload - Upload image file
  fastify.post('/api/images/upload', async (request, reply) => {
    try {
      const parts = request.parts()
      let uploadedFile: any = null

      for await (const part of parts) {
        if (part.type === 'file') {
          // Validate image file
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
          
          const isImage = allowedImageTypes.includes(part.mimetype) || 
                         allowedExtensions.some(ext => part.filename.toLowerCase().endsWith(ext))
          
          if (!isImage) {
            return reply.status(400).send({
              success: false,
              error: 'File must be an image (jpg, png, gif, webp, svg)'
            })
          }

          // Handle image upload
          const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${part.filename}`
          const filepath = path.join(uploadsDir, filename)
          
          await pipeline(part.file, fs.createWriteStream(filepath))
          
          uploadedFile = {
            filename: part.filename,
            filepath,
            url: `/uploads/${filename}`,
            size: fs.statSync(filepath).size,
            mimetype: part.mimetype
          }
        }
      }

      if (!uploadedFile) {
        return reply.status(400).send({
          success: false,
          error: 'No image file provided'
        })
      }

      reply.code(200).send({
        success: true,
        data: {
          url: uploadedFile.url,
          filename: uploadedFile.filename,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype
        }
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      reply.code(500).send({
        success: false,
        error: 'Failed to upload image'
      })
    }
  })

  // GET /uploads/:filename - Serve uploaded images
  fastify.get('/uploads/:filename', async (request, reply) => {
    try {
      const { filename } = request.params as { filename: string }
      const filepath = path.join(uploadsDir, filename)
      
      if (!fs.existsSync(filepath)) {
        return reply.status(404).send({ success: false, error: 'File not found' })
      }

      const stat = fs.statSync(filepath)
      const stream = fs.createReadStream(filepath)
      
      reply.type(path.extname(filename))
      reply.header('Content-Length', stat.size)
      reply.header('Cache-Control', 'public, max-age=31536000')
      
      return reply.send(stream)
    } catch (error) {
      console.error('Error serving image:', error)
      reply.code(500).send({ success: false, error: 'Failed to serve image' })
    }
  })
}