import { FastifyInstance } from 'fastify'
import pool from '../db'
import { LLMClient, type LLMProvider } from '../services/llmClient'
import { calculateWordCount } from '../services/streamingService'

// Create a singleton instance of LLMClient
const llmClient = new LLMClient()

export async function packRoutes(fastify: FastifyInstance) {
    // OPTIONS handler for CORS preflight
    fastify.options('/api/packs/draft', async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        reply.header('Access-Control-Allow-Headers', 'Content-Type')
        reply.code(204).send()
    })

    // POST /api/packs/draft - Generate draft content with SSE streaming
    fastify.post<{
        Body: {
            pack_id?: string
            brief_id: string
            audience?: string
            provider?: LLMProvider
            model?: string
        }
    }>('/api/packs/draft', async (request, reply) => {
        const { pack_id, brief_id, audience, provider, model } = request.body

        // Validate required fields
        if (!brief_id) {
            return reply.status(400).send({
                success: false,
                error: 'brief_id is required',
            })
        }

        try {
            // Fetch brief from database
            const briefResult = await pool.query(
                'SELECT * FROM briefs WHERE brief_id = $1',
                [brief_id]
            )

            if (briefResult.rows.length === 0) {
                return reply.status(404).send({
                    success: false,
                    error: 'Brief not found',
                })
            }

            const brief = briefResult.rows[0]

            // Build prompt from brief
            let prompt = `Tạo nội dung draft dựa trên brief sau:\n\n`
            prompt += `**Tiêu đề:** ${brief.title || 'N/A'}\n\n`

            if (brief.content) {
                prompt += `**Nội dung brief:**\n${brief.content}\n\n`
            }

            if (audience) {
                prompt += `**Đối tượng mục tiêu:** ${audience}\n\n`
            }

            prompt += `\nHãy tạo nội dung draft chi tiết, chuyên nghiệp và phù hợp với brief trên.`

            // Determine provider
            const availableProviders = llmClient.getAvailableProviders()
            if (availableProviders.length === 0) {
                return reply.status(400).send({
                    success: false,
                    error: 'No AI providers configured',
                })
            }

            const selectedProvider: LLMProvider = provider && availableProviders.includes(provider as LLMProvider)
                ? (provider as LLMProvider)
                : availableProviders[0] // Default to first available

            // Set up SSE headers
            reply.raw.setHeader('Content-Type', 'text/event-stream')
            reply.raw.setHeader('Cache-Control', 'no-cache')
            reply.raw.setHeader('Connection', 'keep-alive')
            reply.raw.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
            reply.raw.setHeader('Access-Control-Allow-Origin', '*') // CORS for SSE
            reply.raw.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            // Send initial connection message
            reply.raw.write(`data: ${JSON.stringify({ type: 'start', provider: selectedProvider })}\n\n`)

            let fullContent = ''
            let packId = pack_id

            // Stream content from LLM using LLMClient
            try {
                for await (const chunk of llmClient.streamCompletion(selectedProvider, {
                    prompt,
                    model,
                    temperature: 0.7,
                    maxTokens: 2000,
                })) {
                    fullContent += chunk

                    // Send chunk to client via SSE
                    reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
                }

                // Calculate word count
                const wordCount = calculateWordCount(fullContent)

                // Save or update content pack in database
                if (packId) {
                    // Update existing pack
                    await pool.query(
                        `UPDATE content_packs 
             SET draft_content = $1, 
                 word_count = $2, 
                 status = 'draft',
                 updated_at = CURRENT_TIMESTAMP
             WHERE pack_id = $3`,
                        [fullContent, wordCount, packId]
                    )
                } else {
                    // Create new pack
                    const insertResult = await pool.query(
                        `INSERT INTO content_packs (brief_id, draft_content, word_count, status)
             VALUES ($1, $2, $3, 'draft')
             RETURNING pack_id`,
                        [brief_id, fullContent, wordCount]
                    )
                    packId = insertResult.rows[0].pack_id
                }

                // Send completion message
                reply.raw.write(
                    `data: ${JSON.stringify({
                        type: 'done',
                        pack_id: packId,
                        word_count: wordCount,
                        total_length: fullContent.length,
                    })}\n\n`
                )
            } catch (streamError) {
                console.error('Streaming error:', streamError)
                const errorMessage = streamError instanceof Error ? streamError.message : 'Streaming failed'

                // If Gemini model error, suggest using a different provider
                let finalErrorMessage = errorMessage
                if (errorMessage.includes('gemini') && errorMessage.includes('404')) {
                    finalErrorMessage = `${errorMessage}. Hãy thử sử dụng provider khác như 'deepseek' hoặc 'openai'.`
                }

                reply.raw.write(
                    `data: ${JSON.stringify({
                        type: 'error',
                        error: finalErrorMessage,
                    })}\n\n`
                )
            }

            // Close SSE connection
            reply.raw.end()
        } catch (error) {
            console.error('Error in /api/packs/draft:', error)

            // If headers not sent, send error response
            if (!reply.sent) {
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to generate draft',
                })
            } else {
                // If SSE already started, send error via SSE
                reply.raw.write(
                    `data: ${JSON.stringify({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Failed to generate draft',
                    })}\n\n`
                )
                reply.raw.end()
            }
        }
    })

    // GET /api/packs/:pack_id - Get pack by ID
    fastify.get<{ Params: { pack_id: string } }>('/api/packs/:pack_id', async (request, reply) => {
        try {
            const { pack_id } = request.params

            const result = await pool.query(
                `SELECT cp.*, b.title as brief_title, b.content as brief_content
         FROM content_packs cp
         LEFT JOIN briefs b ON cp.brief_id = b.brief_id
         WHERE cp.pack_id = $1`,
                [pack_id]
            )

            if (result.rows.length === 0) {
                return reply.status(404).send({
                    success: false,
                    error: 'Content pack not found',
                })
            }

            return {
                success: true,
                data: result.rows[0],
            }
        } catch (error) {
            console.error('Error fetching pack:', error)
            reply.status(500).send({
                success: false,
                error: 'Failed to fetch content pack',
            })
        }
    })

    // GET /api/packs - Get all packs
    fastify.get('/api/packs', async (request, reply) => {
        try {
            const result = await pool.query(
                `SELECT cp.*, b.title as brief_title
         FROM content_packs cp
         LEFT JOIN briefs b ON cp.brief_id = b.brief_id
         ORDER BY cp.created_at DESC`
            )

            return {
                success: true,
                data: result.rows,
            }
        } catch (error) {
            console.error('Error fetching packs:', error)
            reply.status(500).send({
                success: false,
                error: 'Failed to fetch content packs',
            })
        }
    })

    // PUT /api/packs/:pack_id - Update pack draft content
    fastify.put<{ Params: { pack_id: string }; Body: { draft_content: string } }>(
        '/api/packs/:pack_id',
        async (request, reply) => {
            try {
                const { pack_id } = request.params
                const { draft_content } = request.body

                if (!draft_content) {
                    return reply.status(400).send({
                        success: false,
                        error: 'draft_content is required',
                    })
                }

                // Calculate word count
                const wordCount = calculateWordCount(draft_content)

                const result = await pool.query(
                    `UPDATE content_packs 
             SET draft_content = $1, 
                 word_count = $2, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE pack_id = $3
             RETURNING *`,
                    [draft_content, wordCount, pack_id]
                )

                if (result.rows.length === 0) {
                    return reply.status(404).send({
                        success: false,
                        error: 'Content pack not found',
                    })
                }

                return {
                    success: true,
                    data: result.rows[0],
                }
            } catch (error) {
                console.error('Error updating pack:', error)
                reply.status(500).send({
                    success: false,
                    error: 'Failed to update content pack',
                })
            }
        }
    )

    // GET /api/packs/review - Get packs ready for review
    fastify.get('/api/packs/review', async (request, reply) => {
        try {
            const result = await pool.query(
                `SELECT cp.*, b.title as brief_title
         FROM content_packs cp
         LEFT JOIN briefs b ON cp.brief_id = b.brief_id
         WHERE cp.status IN ('draft', 'review')
         ORDER BY cp.updated_at DESC`
            )

            return {
                success: true,
                data: result.rows,
            }
        } catch (error) {
            console.error('Error fetching packs for review:', error)
            reply.status(500).send({
                success: false,
                error: 'Failed to fetch packs for review',
            })
        }
    })

    // GET /api/packs/:pack_id/comments - Get comments for a pack
    fastify.get<{ Params: { pack_id: string } }>('/api/packs/:pack_id/comments', async (request, reply) => {
        try {
            const { pack_id } = request.params

            const result = await pool.query(
                `SELECT * FROM pack_comments
         WHERE pack_id = $1
         ORDER BY created_at DESC`,
                [pack_id]
            )

            return {
                success: true,
                data: result.rows,
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
            reply.status(500).send({
                success: false,
                error: 'Failed to fetch comments',
            })
        }
    })

    // POST /api/packs/:pack_id/comments - Add a comment to a pack
    fastify.post<{ Params: { pack_id: string }; Body: { comment_text: string; author?: string } }>(
        '/api/packs/:pack_id/comments',
        async (request, reply) => {
            try {
                const { pack_id } = request.params
                const { comment_text, author = 'Reviewer' } = request.body

                if (!comment_text || !comment_text.trim()) {
                    return reply.status(400).send({
                        success: false,
                        error: 'comment_text is required',
                    })
                }

                const result = await pool.query(
                    `INSERT INTO pack_comments (pack_id, comment_text, author, status)
             VALUES ($1, $2, $3, 'pending')
             RETURNING *`,
                    [pack_id, comment_text.trim(), author]
                )

                return {
                    success: true,
                    data: result.rows[0],
                }
            } catch (error) {
                console.error('Error adding comment:', error)
                reply.status(500).send({
                    success: false,
                    error: 'Failed to add comment',
                })
            }
        }
    )

    // PUT /api/packs/:pack_id/status - Update pack status
    fastify.put<{ Params: { pack_id: string }; Body: { status: string } }>(
        '/api/packs/:pack_id/status',
        async (request, reply) => {
            try {
                const { pack_id } = request.params
                const { status } = request.body

                const validStatuses = ['draft', 'review', 'approved', 'published']
                if (!status || !validStatuses.includes(status)) {
                    return reply.status(400).send({
                        success: false,
                        error: `status must be one of: ${validStatuses.join(', ')}`,
                    })
                }

                const result = await pool.query(
                    `UPDATE content_packs 
             SET status = $1, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE pack_id = $2
             RETURNING *`,
                    [status, pack_id]
                )

                if (result.rows.length === 0) {
                    return reply.status(404).send({
                        success: false,
                        error: 'Content pack not found',
                    })
                }

                return {
                    success: true,
                    data: result.rows[0],
                }
            } catch (error) {
                console.error('Error updating pack status:', error)
                reply.status(500).send({
                    success: false,
                    error: 'Failed to update pack status',
                })
            }
        }
    )
}

