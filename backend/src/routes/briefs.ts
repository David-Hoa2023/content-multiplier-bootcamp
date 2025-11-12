import { FastifyInstance } from 'fastify'
import pool from '../db'

export async function briefRoutes(fastify: FastifyInstance) {
  // GET all briefs
  fastify.get('/briefs', async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT * FROM briefs ORDER BY created_at DESC'
      )
      return { success: true, data: result.rows }
    } catch (error) {
      console.error('Error fetching briefs:', error)
      reply.status(500).send({ success: false, error: 'Failed to fetch briefs' })
    }
  })

  // GET single brief by ID
  fastify.get<{ Params: { id: string } }>('/briefs/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const result = await pool.query('SELECT * FROM briefs WHERE brief_id = $1', [id])

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Brief not found' })
      }

      return { success: true, data: result.rows[0] }
    } catch (error) {
      console.error('Error fetching brief:', error)
      reply.status(500).send({ success: false, error: 'Failed to fetch brief' })
    }
  })

  // POST create brief from content plan
  fastify.post<{ Params: { planId: string } }>('/briefs/create-from-plan/:planId', async (request, reply) => {
    try {
      const { planId } = request.params
      console.log('📝 Creating brief from content plan:', planId)

      // Get content plan with idea information
      const planResult = await pool.query(
        `SELECT 
          cp.*,
          i.id as idea_id,
          i.title as idea_title,
          i.description as idea_description,
          i.persona as idea_persona,
          i.industry as idea_industry
        FROM content_plans cp
        LEFT JOIN ideas i ON cp.idea_id = i.id
        WHERE cp.id = $1`,
        [planId]
      )

      if (planResult.rows.length === 0) {
        console.error('❌ Content plan not found:', planId)
        return reply.status(404).send({ success: false, error: 'Content plan not found' })
      }

      const plan = planResult.rows[0]
      console.log('✅ Found content plan:', { id: plan.id, idea_title: plan.idea_title })

      // Create brief content from content plan
      const briefTitle = plan.idea_title || `Brief từ kế hoạch #${planId}`
      
      let briefContent = `# ${briefTitle}\n\n`
      
      if (plan.idea_description) {
        briefContent += `## Mô tả ý tưởng\n${plan.idea_description}\n\n`
      }

      if (plan.target_audience) {
        briefContent += `## Đối tượng mục tiêu\n${plan.target_audience}\n\n`
      }

      if (plan.plan_content) {
        briefContent += `## Kế hoạch nội dung\n${plan.plan_content}\n\n`
      }

      if (plan.key_points) {
        briefContent += `## Các điểm chính\n${plan.key_points}\n\n`
      }

      if (plan.idea_persona) {
        briefContent += `## Persona\n${plan.idea_persona}\n\n`
      }

      if (plan.idea_industry) {
        briefContent += `## Ngành nghề\n${plan.idea_industry}\n\n`
      }

      // Insert brief into database
      const briefResult = await pool.query(
        `INSERT INTO briefs (title, content)
         VALUES ($1, $2)
         RETURNING *`,
        [briefTitle, briefContent.trim()]
      )

      console.log('✅ Brief created successfully:', briefResult.rows[0].brief_id)
      
      reply.status(201).send({ 
        success: true, 
        data: briefResult.rows[0],
        message: 'Brief created successfully from content plan'
      })
    } catch (error) {
      console.error('❌ Error creating brief from content plan:', error)
      reply.status(500).send({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create brief from content plan' 
      })
    }
  })

  // POST create new brief
  fastify.post<{ Body: { title?: string; content: string } }>('/briefs', async (request, reply) => {
    try {
      const { title, content } = request.body

      if (!content || !content.trim()) {
        return reply.status(400).send({ success: false, error: 'content is required' })
      }

      const result = await pool.query(
        `INSERT INTO briefs (title, content)
         VALUES ($1, $2)
         RETURNING *`,
        [title || null, content.trim()]
      )

      reply.status(201).send({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Error creating brief:', error)
      reply.status(500).send({ success: false, error: 'Failed to create brief' })
    }
  })

  // PUT update brief
  fastify.put<{ Params: { id: string }; Body: { title?: string; content?: string } }>(
    '/briefs/:id',
    async (request, reply) => {
      try {
        const { id } = request.params
        const { title, content } = request.body

        const result = await pool.query(
          `UPDATE briefs
           SET title = COALESCE($1, title),
               content = COALESCE($2, content),
               updated_at = CURRENT_TIMESTAMP
           WHERE brief_id = $3
           RETURNING *`,
          [title || null, content ? content.trim() : null, id]
        )

        if (result.rows.length === 0) {
          return reply.status(404).send({ success: false, error: 'Brief not found' })
        }

        return { success: true, data: result.rows[0] }
      } catch (error) {
        console.error('Error updating brief:', error)
        reply.status(500).send({ success: false, error: 'Failed to update brief' })
      }
    }
  )

  // DELETE brief
  fastify.delete<{ Params: { id: string } }>('/briefs/:id', async (request, reply) => {
    try {
      const { id } = request.params

      const result = await pool.query('DELETE FROM briefs WHERE brief_id = $1 RETURNING *', [id])

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Brief not found' })
      }

      return { success: true, message: 'Brief deleted successfully', data: result.rows[0] }
    } catch (error) {
      console.error('Error deleting brief:', error)
      reply.status(500).send({ success: false, error: 'Failed to delete brief' })
    }
  })
}

