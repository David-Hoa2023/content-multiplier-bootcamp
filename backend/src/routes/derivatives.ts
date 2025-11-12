import { FastifyPluginAsync } from 'fastify'
import pool from '../db'

interface Derivative {
  id?: number
  pack_id: string
  content_plan_id?: number
  platform: string
  content: string
  character_count?: number
  hashtags?: string[]
  mentions?: string[]
  media_urls?: string[]
  status?: string
  scheduled_at?: string
  published_at?: string
  analytics?: any
}

interface GenerateDerivativesRequest {
  pack_id: string
  content_plan_id?: number
  original_content: string
  platforms: Array<{
    platform: string
    character_limit: number
  }>
}

const derivativesRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Get all derivatives
  fastify.get('/derivatives', async (request, reply) => {
    try {
      const result = await pool.query(`
        SELECT d.*, cp.plan_content, cp.target_audience
        FROM derivatives d
        LEFT JOIN content_plans cp ON d.content_plan_id = cp.id
        ORDER BY d.created_at DESC
      `)
      
      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch derivatives'
      })
    }
  })

  // Get derivatives by pack_id
  fastify.get('/derivatives/pack/:packId', async (request, reply) => {
    const { packId } = request.params as { packId: string }
    
    try {
      const result = await pool.query(
        'SELECT * FROM derivatives WHERE pack_id = $1 ORDER BY platform',
        [packId]
      )
      
      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch pack derivatives'
      })
    }
  })

  // Generate derivatives using AI
  fastify.post('/derivatives/generate', async (request, reply) => {
    const { pack_id, content_plan_id, original_content, platforms } = request.body as GenerateDerivativesRequest
    
    try {
      const derivatives: Derivative[] = []
      
      for (const platformConfig of platforms) {
        const { platform, character_limit } = platformConfig
        
        // Generate platform-specific content
        let platformContent = original_content
        
        // Platform-specific adjustments
        switch (platform.toLowerCase()) {
          case 'twitter':
            // Shorten for Twitter, add hashtags
            platformContent = await generateTwitterContent(original_content, character_limit)
            break
            
          case 'linkedin':
            // Professional tone for LinkedIn
            platformContent = await generateLinkedInContent(original_content, character_limit)
            break
            
          case 'facebook':
            // Engaging tone for Facebook
            platformContent = await generateFacebookContent(original_content, character_limit)
            break
            
          case 'instagram':
            // Visual-focused, with emojis and hashtags
            platformContent = await generateInstagramContent(original_content, character_limit)
            break
            
          case 'tiktok':
            // Short, catchy content for TikTok
            platformContent = await generateTikTokContent(original_content, character_limit)
            break
            
          default:
            // Default: truncate to character limit
            platformContent = original_content.substring(0, character_limit)
        }
        
        // Extract hashtags and mentions
        const hashtags = extractHashtags(platformContent)
        const mentions = extractMentions(platformContent)
        
        // Save to database
        const result = await pool.query(
          `INSERT INTO derivatives 
           (pack_id, content_plan_id, platform, content, character_count, hashtags, mentions, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            pack_id,
            content_plan_id,
            platform,
            platformContent,
            platformContent.length,
            hashtags,
            mentions,
            'draft'
          ]
        )
        
        derivatives.push(result.rows[0])
      }
      
      return {
        success: true,
        data: derivatives,
        message: `Generated ${derivatives.length} derivatives`
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to generate derivatives'
      })
    }
  })

  // Update derivative
  fastify.put('/derivatives/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as Partial<Derivative>
    
    try {
      // Recalculate character count and extract hashtags/mentions
      if (updates.content) {
        updates.character_count = updates.content.length
        updates.hashtags = extractHashtags(updates.content)
        updates.mentions = extractMentions(updates.content)
      }
      
      const result = await pool.query(
        `UPDATE derivatives 
         SET content = $2, character_count = $3, hashtags = $4, mentions = $5, 
             status = $6, scheduled_at = $7, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          id,
          updates.content,
          updates.character_count,
          updates.hashtags,
          updates.mentions,
          updates.status,
          updates.scheduled_at
        ]
      )
      
      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Derivative not found'
        })
      }
      
      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to update derivative'
      })
    }
  })

  // Schedule derivatives for publishing
  fastify.post('/derivatives/schedule', async (request, reply) => {
    const { derivative_ids, scheduled_times } = request.body as {
      derivative_ids: number[]
      scheduled_times: string[]
    }
    
    try {
      const scheduled = []
      
      for (let i = 0; i < derivative_ids.length; i++) {
        const derivativeId = derivative_ids[i]
        const scheduledTime = scheduled_times[i]
        
        // Update derivative status
        await pool.query(
          'UPDATE derivatives SET status = $1, scheduled_at = $2 WHERE id = $3',
          ['scheduled', scheduledTime, derivativeId]
        )
        
        // Add to publishing queue
        const result = await pool.query(
          `INSERT INTO publishing_queue (derivative_id, platform, scheduled_time, status)
           SELECT id, platform, $2, 'pending' FROM derivatives WHERE id = $1
           RETURNING *`,
          [derivativeId, scheduledTime]
        )
        
        scheduled.push(result.rows[0])
      }
      
      return {
        success: true,
        data: scheduled,
        message: `Scheduled ${scheduled.length} derivatives for publishing`
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to schedule derivatives'
      })
    }
  })

  // Delete derivative
  fastify.delete('/derivatives/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const result = await pool.query(
        'DELETE FROM derivatives WHERE id = $1 RETURNING id',
        [id]
      )
      
      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Derivative not found'
        })
      }
      
      return {
        success: true,
        message: 'Derivative deleted successfully'
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete derivative'
      })
    }
  })
}

// Helper functions
function extractHashtags(content: string): string[] {
  const regex = /#\w+/g
  const matches = content.match(regex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

function extractMentions(content: string): string[] {
  const regex = /@\w+/g
  const matches = content.match(regex)
  return matches ? matches.map(mention => mention.substring(1)) : []
}

// Platform-specific content generation functions
async function generateTwitterContent(content: string, limit: number): Promise<string> {
  // Simplify: truncate and add relevant hashtags
  const maxLength = limit - 30 // Leave room for hashtags
  let tweet = content.substring(0, maxLength)
  
  // Add ellipsis if truncated
  if (content.length > maxLength) {
    tweet = tweet.substring(0, tweet.lastIndexOf(' ')) + '...'
  }
  
  // Add hashtags
  tweet += '\n\n#ContentStrategy #Marketing #SocialMedia'
  
  return tweet
}

async function generateLinkedInContent(content: string, limit: number): Promise<string> {
  // Professional tone, structured format
  const sections = content.split('\n').filter(s => s.trim())
  let linkedInPost = '📊 Key Insights:\n\n'
  
  for (const section of sections.slice(0, 3)) {
    linkedInPost += `• ${section.trim()}\n`
  }
  
  linkedInPost += '\n💡 What are your thoughts on this?\n\n'
  linkedInPost += '#ProfessionalDevelopment #BusinessStrategy #Innovation'
  
  return linkedInPost.substring(0, limit)
}

async function generateFacebookContent(content: string, limit: number): Promise<string> {
  // Engaging, conversational tone
  let fbPost = '🎯 ' + content.substring(0, 200)
  
  if (content.length > 200) {
    fbPost += '\n\n👉 Read more...\n'
  }
  
  fbPost += '\n\n💬 Share your experience in the comments!'
  
  return fbPost.substring(0, limit)
}

async function generateInstagramContent(content: string, limit: number): Promise<string> {
  // Visual-focused with emojis and hashtags
  let igPost = '✨ ' + content.substring(0, 150) + '\n\n'
  
  // Add line of emojis
  igPost += '📸 ⚡ 🚀 💫\n\n'
  
  // Add hashtags
  igPost += '#InstaDaily #ContentCreator #CreativeLife #DigitalMarketing '
  igPost += '#SocialMediaTips #MarketingStrategy #BusinessGrowth'
  
  return igPost.substring(0, limit)
}

async function generateTikTokContent(content: string, limit: number): Promise<string> {
  // Short, catchy, trend-focused
  const keyPoints = content.split('.').filter(s => s.trim()).slice(0, 3)
  let tiktokPost = '🔥 Quick Tips:\n\n'
  
  keyPoints.forEach((point, index) => {
    tiktokPost += `${index + 1}. ${point.trim()}\n`
  })
  
  tiktokPost += '\n👇 Save for later! #FYP #LearnOnTikTok'
  
  return tiktokPost.substring(0, limit)
}

export default derivativesRoutes