import { FastifyInstance } from 'fastify'
import { TwitterBotService } from '../services/publishing/twitter-bot.ts'
import { q } from '../db.ts'

const twitterBot = new TwitterBotService()

export default async function twitterBotRoutes(fastify: FastifyInstance) {
    // Start the Twitter bot
    fastify.post('/api/twitter-bot/start', async (request, reply) => {
        try {
            await twitterBot.start()
            return { success: true, message: 'Twitter bot started successfully' }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Stop the Twitter bot
    fastify.post('/api/twitter-bot/stop', async (request, reply) => {
        try {
            await twitterBot.stop()
            return { success: true, message: 'Twitter bot stopped successfully' }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Get Twitter bot status
    fastify.get('/api/twitter-bot/status', async (request, reply) => {
        try {
            const status = await twitterBot.getStatus()
            return { success: true, data: status }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Get Twitter bot configuration
    fastify.get('/api/twitter-bot/config', async (request, reply) => {
        try {
            const result = await q(`
                SELECT configuration FROM platform_configurations 
                WHERE platform = 'twitter_bot' AND is_active = true
                LIMIT 1
            `)

            if (result.length === 0) {
                reply.status(404)
                return { success: false, error: 'Twitter bot configuration not found' }
            }

            return { success: true, data: result[0].configuration }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Update Twitter bot configuration
    fastify.put('/api/twitter-bot/config', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    enabled: { type: 'boolean' },
                    interval_hours: { type: 'number', minimum: 1, maximum: 168 },
                    content_topics: { 
                        type: 'array', 
                        items: { type: 'string' },
                        minItems: 1
                    },
                    max_tweets_per_day: { type: 'number', minimum: 1, maximum: 24 },
                    schedule_times: {
                        type: 'array',
                        items: { 
                            type: 'string',
                            pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
                        }
                    }
                },
                required: ['enabled']
            }
        }
    }, async (request, reply) => {
        try {
            const config = request.body as any

            await q(`
                UPDATE platform_configurations 
                SET configuration = $1, updated_at = NOW()
                WHERE platform = 'twitter_bot'
            `, [JSON.stringify(config)])

            // Restart bot if it's running and config changed
            const status = await twitterBot.getStatus()
            if (status.running) {
                await twitterBot.stop()
                if (config.enabled) {
                    await twitterBot.start()
                }
            }

            return { success: true, message: 'Twitter bot configuration updated' }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Get Twitter content templates
    fastify.get('/api/twitter-bot/templates', async (request, reply) => {
        try {
            const templates = await q(`
                SELECT * FROM twitter_content_templates 
                WHERE is_active = true
                ORDER BY name
            `)

            return { success: true, data: templates }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Create Twitter content template
    fastify.post('/api/twitter-bot/templates', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    prompt: { type: 'string', minLength: 10 },
                    topics: { 
                        type: 'array', 
                        items: { type: 'string' },
                        minItems: 1
                    },
                    tone: { 
                        type: 'string', 
                        enum: ['professional', 'casual', 'humorous', 'educational'] 
                    },
                    max_length: { type: 'number', minimum: 50, maximum: 280 },
                    hashtags: { 
                        type: 'array', 
                        items: { type: 'string' } 
                    },
                    mentions: { 
                        type: 'array', 
                        items: { type: 'string' } 
                    }
                },
                required: ['name', 'prompt', 'topics', 'tone']
            }
        }
    }, async (request, reply) => {
        try {
            const template = request.body as any
            const templateId = `template_${Date.now()}`

            await q(`
                INSERT INTO twitter_content_templates 
                (template_id, name, prompt, topics, tone, max_length, hashtags, mentions)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                templateId,
                template.name,
                template.prompt,
                template.topics,
                template.tone,
                template.max_length || 280,
                template.hashtags || [],
                template.mentions || []
            ])

            return { success: true, data: { template_id: templateId } }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Update Twitter content template
    fastify.put('/api/twitter-bot/templates/:templateId', async (request, reply) => {
        try {
            const { templateId } = request.params as { templateId: string }
            const template = request.body as any

            await q(`
                UPDATE twitter_content_templates 
                SET name = $2, prompt = $3, topics = $4, tone = $5, 
                    max_length = $6, hashtags = $7, mentions = $8, updated_at = NOW()
                WHERE template_id = $1
            `, [
                templateId,
                template.name,
                template.prompt,
                template.topics,
                template.tone,
                template.max_length || 280,
                template.hashtags || [],
                template.mentions || []
            ])

            return { success: true, message: 'Template updated successfully' }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Delete Twitter content template
    fastify.delete('/api/twitter-bot/templates/:templateId', async (request, reply) => {
        try {
            const { templateId } = request.params as { templateId: string }

            await q(`
                UPDATE twitter_content_templates 
                SET is_active = false, updated_at = NOW()
                WHERE template_id = $1
            `, [templateId])

            return { success: true, message: 'Template deleted successfully' }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Get Twitter bot posting history
    fastify.get('/api/twitter-bot/history', async (request, reply) => {
        try {
            const { limit = 50, offset = 0 } = request.query as { limit?: number, offset?: number }

            const history = await q(`
                SELECT 
                    pq.pack_id,
                    pq.platform,
                    pq.content_data,
                    pq.status,
                    pq.published_at,
                    pq.error_message,
                    pr.external_url,
                    pr.metrics
                FROM publishing_queue pq
                JOIN content_packs cp ON pq.pack_id = cp.pack_id
                LEFT JOIN publishing_results pr ON pq.queue_id = pr.queue_id
                WHERE pq.platform = 'twitter' 
                AND cp.derivatives->>'twitter_bot_generated' = 'true'
                ORDER BY pq.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset])

            return { success: true, data: history }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })

    // Generate a test tweet (without posting)
    fastify.post('/api/twitter-bot/test-generate', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    template_id: { type: 'string' },
                    topic: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { template_id, topic } = request.body as { template_id?: string, topic?: string }
            
            // Get the template
            let template
            if (template_id) {
                const templateResult = await q(`
                    SELECT * FROM twitter_content_templates 
                    WHERE template_id = $1 AND is_active = true
                `, [template_id])
                
                if (templateResult.length === 0) {
                    reply.status(404)
                    return { success: false, error: 'Template not found' }
                }
                template = templateResult[0]
            } else {
                // Use default template
                template = {
                    prompt: 'Create an engaging tweet about {topic} with a professional tone. Keep it under 280 characters.',
                    tone: 'professional',
                    max_length: 280,
                    hashtags: ['#Tech', '#AI']
                }
            }

            // Generate content using the TwitterBotService
            try {
                const botService = new TwitterBotService()
                const content = await botService.generateContentFromTemplate(template, topic || 'technology')

                return { 
                    success: true, 
                    data: content
                }
            } catch (llmError) {
                console.log('LLM generation failed, returning mock content for testing:', llmError.message)
                
                // Return mock content for testing when LLM fails
                const mockContent = {
                    text: `💡 Quick ${topic || 'tech'} tip: Always validate your inputs and handle errors gracefully! This keeps your applications robust and user-friendly. 🚀 #TechTip #Programming #BestPractices`,
                    hashtags: template.hashtags || ['#TechTip', '#Programming'],
                    thread: template.max_length > 280 ? [
                        `2/2 Remember: Good error handling isn't just about catching exceptions - it's about providing meaningful feedback to users and logging useful information for developers. Happy coding! 💻`
                    ] : undefined
                }

                return { 
                    success: true, 
                    data: mockContent,
                    note: 'Mock content generated due to LLM configuration issue'
                }
            }
        } catch (error) {
            reply.status(500)
            return { success: false, error: error.message }
        }
    })
}