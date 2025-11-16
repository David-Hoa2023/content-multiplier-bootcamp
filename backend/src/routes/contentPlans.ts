import { FastifyInstance } from 'fastify'
import pool from '../db'
import { CreateContentPlanInput, UpdateContentPlanInput } from '../types'
import { generateContent, getAvailableProviders, AIProvider } from '../services/aiService'

export async function contentPlanRoutes(fastify: FastifyInstance) {
  // GET all content plans with idea information
  fastify.get('/content-plans', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT 
          cp.*,
          i.id as idea_id,
          i.title as idea_title,
          i.description as idea_description,
          i.persona as idea_persona,
          i.industry as idea_industry,
          i.status as idea_status
        FROM content_plans cp
        LEFT JOIN ideas i ON cp.idea_id = i.id
        ORDER BY cp.created_at DESC`
      )
      
      // Format response to include idea data
      const formattedData = result.rows.map(row => ({
        id: row.id,
        idea_id: row.idea_id,
        plan_content: row.plan_content,
        target_audience: row.target_audience,
        key_points: row.key_points,
        created_at: row.created_at,
        idea: row.idea_id ? {
          id: row.idea_id,
          title: row.idea_title,
          description: row.idea_description,
          persona: row.idea_persona,
          industry: row.idea_industry,
          status: row.idea_status
        } : null
      }))
      
      return { success: true, data: formattedData }
    } catch (error) {
      console.error('Error fetching content plans:', error)
      reply.status(500).send({ success: false, error: 'Failed to fetch content plans' })
    }
  })

  // GET all content plans for a specific idea
  fastify.get<{ Params: { ideaId: string } }>('/content-plans/idea/:ideaId', async (request, reply) => {
    try {
      const { ideaId } = request.params
      
      // Verify idea exists
      const ideaCheck = await pool.query('SELECT id FROM ideas WHERE id = $1', [ideaId])
      if (ideaCheck.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Idea not found' })
      }

      const result = await pool.query(
        'SELECT * FROM content_plans WHERE idea_id = $1 ORDER BY created_at DESC',
        [ideaId]
      )
      return { success: true, data: result.rows }
    } catch (error) {
      console.error('Error fetching content plans for idea:', error)
      reply.status(500).send({ success: false, error: 'Failed to fetch content plans' })
    }
  })

  // GET single content plan by ID with idea information
  fastify.get<{ Params: { id: string } }>('/content-plans/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const result = await pool.query(
        `SELECT 
          cp.*,
          i.id as idea_id,
          i.title as idea_title,
          i.description as idea_description,
          i.persona as idea_persona,
          i.industry as idea_industry,
          i.status as idea_status,
          i.created_at as idea_created_at
        FROM content_plans cp
        LEFT JOIN ideas i ON cp.idea_id = i.id
        WHERE cp.id = $1`,
        [id]
      )

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Content plan not found' })
      }

      // Format response to separate idea data
      const contentPlan = result.rows[0]
      const ideaData = contentPlan.idea_id ? {
        id: contentPlan.idea_id,
        title: contentPlan.idea_title,
        description: contentPlan.idea_description,
        persona: contentPlan.idea_persona,
        industry: contentPlan.idea_industry,
        status: contentPlan.idea_status,
        created_at: contentPlan.idea_created_at
      } : null

      // Clean up the content plan object
      delete contentPlan.idea_title
      delete contentPlan.idea_description
      delete contentPlan.idea_persona
      delete contentPlan.idea_industry
      delete contentPlan.idea_status
      delete contentPlan.idea_created_at

      return { 
        success: true, 
        data: {
          contentPlan,
          idea: ideaData
        }
      }
    } catch (error) {
      console.error('Error fetching content plan:', error)
      reply.status(500).send({ success: false, error: 'Failed to fetch content plan' })
    }
  })

  // POST create new content plan
  fastify.post<{ Body: CreateContentPlanInput }>('/content-plans', async (request, reply) => {
    try {
      const { idea_id, plan_content, target_audience, key_points } = request.body

      if (!idea_id) {
        return reply.status(400).send({ success: false, error: 'idea_id is required' })
      }

      if (!plan_content || !plan_content.trim()) {
        return reply.status(400).send({ success: false, error: 'plan_content is required' })
      }

      // Verify idea exists
      const ideaCheck = await pool.query('SELECT id FROM ideas WHERE id = $1', [idea_id])
      if (ideaCheck.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Idea not found' })
      }

      const result = await pool.query(
        `INSERT INTO content_plans (idea_id, plan_content, target_audience, key_points)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          idea_id,
          plan_content.trim(),
          target_audience ? target_audience.trim() : null,
          key_points ? key_points.trim() : null
        ]
      )

      reply.status(201).send({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Error creating content plan:', error)
      reply.status(500).send({ success: false, error: 'Failed to create content plan' })
    }
  })

  // PUT update content plan
  fastify.put<{ Params: { id: string }; Body: UpdateContentPlanInput }>(
    '/content-plans/:id',
    async (request, reply) => {
      try {
        const { id } = request.params
        const { plan_content, target_audience, key_points } = request.body

        // Check if content plan exists
        const checkResult = await pool.query('SELECT * FROM content_plans WHERE id = $1', [id])
        if (checkResult.rows.length === 0) {
          return reply.status(404).send({ success: false, error: 'Content plan not found' })
        }

        const result = await pool.query(
          `UPDATE content_plans
           SET plan_content = COALESCE($1, plan_content),
               target_audience = COALESCE($2, target_audience),
               key_points = COALESCE($3, key_points)
           WHERE id = $4
           RETURNING *`,
          [
            plan_content ? plan_content.trim() : null,
            target_audience ? target_audience.trim() : null,
            key_points ? key_points.trim() : null,
            id
          ]
        )

        return { success: true, data: result.rows[0] }
      } catch (error) {
        console.error('Error updating content plan:', error)
        reply.status(500).send({ success: false, error: 'Failed to update content plan' })
      }
    }
  )

  // DELETE content plan
  fastify.delete<{ Params: { id: string } }>('/content-plans/:id', async (request, reply) => {
    try {
      const { id } = request.params

      const result = await pool.query('DELETE FROM content_plans WHERE id = $1 RETURNING *', [id])

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Content plan not found' })
      }

      return { success: true, message: 'Content plan deleted successfully', data: result.rows[0] }
    } catch (error) {
      console.error('Error deleting content plan:', error)
      reply.status(500).send({ success: false, error: 'Failed to delete content plan' })
    }
  })

  // POST generate content plan from idea using AI
  fastify.post<{
    Params: { ideaId: string }
    Body: {
      provider?: AIProvider
      model?: string
      temperature?: number
    }
  }>('/content-plans/generate-from-idea/:ideaId', async (request, reply) => {
    try {
      const { ideaId } = request.params
      const { provider, model, temperature } = request.body

      // Get idea from database
      const ideaResult = await pool.query('SELECT * FROM ideas WHERE id = $1', [ideaId])
      if (ideaResult.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Idea not found' })
      }

      const idea = ideaResult.rows[0]

      // Check available AI providers
      const availableProviders = await getAvailableProviders()
      if (availableProviders.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'No AI providers configured. Please add at least one API key to .env file.',
        })
      }

      // Auto-select provider if not provided or not available
      // Priority order: deepseek -> gemini -> anthropic -> openai (OpenAI last due to billing issues)
      const priorityOrder: AIProvider[] = ['deepseek', 'gemini', 'anthropic', 'openai']
      const requestedProvider = provider || 'deepseek'
      let selectedProvider = requestedProvider

      if (!availableProviders.includes(requestedProvider)) {
        selectedProvider = priorityOrder.find(p => availableProviders.includes(p)) || availableProviders[0]
        console.log(`⚠️ Provider '${requestedProvider}' not available. Auto-selecting '${selectedProvider}'`)
      }

      // Build detailed prompt for content plan generation
      let prompt = `Bạn là một chuyên gia về content planning. Hãy tạo một bản kế hoạch nội dung chi tiết dựa trên ý tưởng sau:\n\n`
      prompt += `**Tiêu đề ý tưởng:** ${idea.title}\n`
      if (idea.description) {
        prompt += `**Mô tả:** ${idea.description}\n`
      }
      if (idea.persona) {
        prompt += `**Đối tượng mục tiêu:** ${idea.persona}\n`
      }
      if (idea.industry) {
        prompt += `**Ngành nghề:** ${idea.industry}\n`
      }

      prompt += `\nHãy tạo một bản kế hoạch nội dung chi tiết với định dạng JSON sau:\n`
      prompt += `{\n`
      prompt += `  "plan_content": "Nội dung kế hoạch chi tiết (2-3 đoạn văn, bao gồm mục tiêu, chiến lược, và cách tiếp cận)",\n`
      prompt += `  "target_audience": "Mô tả chi tiết về đối tượng người đọc mục tiêu (1-2 câu)",\n`
      prompt += `  "key_points": "Các điểm chính của kế hoạch, mỗi điểm một dòng (ít nhất 3-5 điểm)"\n`
      prompt += `}\n\n`
      prompt += `Lưu ý:\n`
      prompt += `- plan_content phải chi tiết và hành động được\n`
      prompt += `- target_audience phải cụ thể và rõ ràng\n`
      prompt += `- key_points phải được liệt kê rõ ràng, mỗi điểm một dòng\n`
      prompt += `- Chỉ trả về JSON, không có text thêm`

      // Generate content plan using AI with automatic fallback
      console.log(`Generating content plan for idea ${ideaId} using ${selectedProvider}...`)
      let aiResult = await generateContent({
        prompt,
        provider: selectedProvider,
        model,
        temperature: temperature || 0.7,
        maxTokens: 1500,
      })

      // If first provider fails, try fallback providers
      if (!aiResult.success) {
        console.log(`⚠️ Provider '${selectedProvider}' failed: ${aiResult.error}. Trying fallback providers...`)

        const fallbackProviders = availableProviders.filter(p => p !== selectedProvider)
        for (const fallbackProvider of fallbackProviders) {
          console.log(`🔄 Trying fallback provider: ${fallbackProvider}`)
          aiResult = await generateContent({
            prompt,
            provider: fallbackProvider,
            temperature: temperature || 0.7,
            maxTokens: 1500,
          })

          if (aiResult.success) {
            console.log(`✅ Fallback provider '${fallbackProvider}' succeeded`)
            selectedProvider = fallbackProvider
            break
          }
          console.log(`⚠️ Fallback provider '${fallbackProvider}' also failed: ${aiResult.error}`)
        }
      }

      if (!aiResult.success || !aiResult.content) {
        return reply.status(500).send({
          success: false,
          error: aiResult.error || 'Failed to generate content plan',
          provider: selectedProvider,
        })
      }

      // Parse AI response (try to extract JSON from response)
      let planData: {
        plan_content: string
        target_audience: string
        key_points: string
      }

      try {
        // Try to extract JSON from response (handle markdown code blocks)
        let jsonString = aiResult.content.trim()
        
        // Remove markdown code blocks if present
        const jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
        if (jsonMatch) {
          jsonString = jsonMatch[1]
        }

        // Try to find JSON object in the response
        const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          jsonString = jsonObjectMatch[0]
        }

        planData = JSON.parse(jsonString)
      } catch (parseError) {
        // If JSON parsing fails, use the raw content and structure it manually
        console.warn('Failed to parse JSON response, using raw content:', parseError)
        const lines = aiResult.content.split('\n').filter(line => line.trim())
        
        planData = {
          plan_content: aiResult.content.substring(0, 500) || 'Không thể parse nội dung từ AI',
          target_audience: idea.persona || 'Đối tượng mục tiêu chưa được xác định',
          key_points: lines.slice(0, 5).join('\n') || 'Các điểm chính chưa được xác định',
        }
      }

      // Validate parsed data
      if (!planData.plan_content || !String(planData.plan_content).trim()) {
        return reply.status(500).send({
          success: false,
          error: 'Generated content plan is invalid or empty',
        })
      }

      // Save to database
      const insertResult = await pool.query(
        `INSERT INTO content_plans (idea_id, plan_content, target_audience, key_points)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          ideaId,
          planData.plan_content ? String(planData.plan_content).trim() : '',
          planData.target_audience && typeof planData.target_audience === 'string' ? planData.target_audience.trim() : null,
          planData.key_points && typeof planData.key_points === 'string' ? planData.key_points.trim() : null,
        ]
      )

      return {
        success: true,
        data: insertResult.rows[0],
        provider: selectedProvider,
        model: aiResult.model,
        tokensUsed: aiResult.tokensUsed,
      }
    } catch (error) {
      console.error('Error generating content plan from idea:', error)
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content plan',
      })
    }
  })
}

