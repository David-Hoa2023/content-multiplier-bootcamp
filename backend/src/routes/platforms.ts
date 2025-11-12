import { FastifyPluginAsync } from 'fastify'
import pool from '../db'
import { PlatformRegistry, createPlatform } from '../platforms/registry'
import { PlatformConfig } from '../platforms/base/BasePlatform'

interface CreatePlatformConfigRequest {
  platform_type: string
  platform_name: string
  configuration: Record<string, any>
  credentials?: Record<string, any>
  test_connection?: boolean
}

interface UpdatePlatformConfigRequest {
  platform_name?: string
  configuration?: Record<string, any>
  credentials?: Record<string, any>
  is_active?: boolean
}

interface TestConnectionRequest {
  platform_type: string
  configuration: Record<string, any>
  credentials?: Record<string, any>
}

const platformRoutes: FastifyPluginAsync = async (fastify, opts) => {
  
  // Get all supported platforms and their capabilities
  fastify.get('/platforms/supported', async (request, reply) => {
    try {
      const platforms = PlatformRegistry.getAllPlatformCapabilities()
      const categorized = PlatformRegistry.getPlatformsByCategory()
      
      return {
        success: true,
        data: {
          all: platforms,
          by_category: categorized,
          total_count: platforms.length
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get supported platforms'
      })
    }
  })

  // Get platform templates
  fastify.get('/platforms/templates', async (request, reply) => {
    try {
      const { platform_type } = request.query as { platform_type?: string }
      
      let query = 'SELECT * FROM platform_templates'
      const params = []
      
      if (platform_type) {
        query += ' WHERE platform_type = $1'
        params.push(platform_type)
      }
      
      query += ' ORDER BY is_system_template DESC, template_name ASC'
      
      const result = await pool.query(query, params)
      
      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get platform templates'
      })
    }
  })

  // Get all platform configurations for user
  fastify.get('/platforms/configurations', async (request, reply) => {
    try {
      const { platform_type, is_active } = request.query as { 
        platform_type?: string
        is_active?: boolean 
      }
      
      let query = `
        SELECT id, platform_type, platform_name, configuration, 
               is_active, is_connected, last_tested_at, test_result,
               created_at, updated_at
        FROM platform_configurations 
        WHERE user_id = $1
      `
      const params = [1] // Default user for now
      
      if (platform_type) {
        query += ` AND platform_type = $${params.length + 1}`
        params.push(platform_type)
      }
      
      if (is_active !== undefined) {
        query += ` AND is_active = $${params.length + 1}`
        params.push(is_active)
      }
      
      query += ' ORDER BY platform_type, platform_name'
      
      const result = await pool.query(query, params)
      
      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get platform configurations'
      })
    }
  })

  // Get single platform configuration
  fastify.get('/platforms/configurations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const result = await pool.query(
        `SELECT id, platform_type, platform_name, configuration, 
                is_active, is_connected, last_tested_at, test_result,
                created_at, updated_at
         FROM platform_configurations 
         WHERE id = $1 AND user_id = $2`,
        [id, 1]
      )
      
      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
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
        error: 'Failed to get platform configuration'
      })
    }
  })

  // Create new platform configuration
  fastify.post('/platforms/configurations', async (request, reply) => {
    const { 
      platform_type, 
      platform_name, 
      configuration, 
      credentials,
      test_connection = false 
    } = request.body as CreatePlatformConfigRequest
    
    try {
      // Validate platform type
      if (!PlatformRegistry.isPlatformSupported(platform_type)) {
        return reply.status(400).send({
          success: false,
          error: `Unsupported platform type: ${platform_type}`
        })
      }

      // Create platform instance and validate configuration
      const platform = createPlatform(platform_type)
      const config: PlatformConfig = {
        platform_type,
        platform_name,
        configuration,
        credentials,
        is_active: true
      }

      const validation = await platform.validateConfig(config)
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: 'Configuration validation failed',
          details: validation.errors,
          warnings: validation.warnings
        })
      }

      let isConnected = false
      let testResult = 'Not tested'

      // Test connection if requested
      if (test_connection) {
        try {
          const testResponse = await platform.testConnection(config)
          isConnected = testResponse.success
          testResult = testResponse.message || (testResponse.success ? 'Connected' : 'Failed')
        } catch (error: any) {
          testResult = `Test failed: ${error.message}`
        }
      }

      // Store credentials as JSON (in production, consider encryption)
      let credentialsToStore = null
      if (credentials) {
        credentialsToStore = credentials
      }

      // Insert into database
      const result = await pool.query(
        `INSERT INTO platform_configurations 
         (user_id, platform_type, platform_name, configuration, credentials, 
          is_active, is_connected, last_tested_at, test_result)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          1, // Default user
          platform_type,
          platform_name,
          configuration,
          credentialsToStore,
          true,
          isConnected,
          test_connection ? new Date() : null,
          testResult
        ]
      )

      const created = result.rows[0]
      // Don't return encrypted credentials
      delete created.credentials

      return {
        success: true,
        data: created,
        message: `Platform configuration created${isConnected ? ' and connected' : ''} successfully`
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create platform configuration'
      })
    }
  })

  // Update platform configuration
  fastify.put('/platforms/configurations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as UpdatePlatformConfigRequest
    
    try {
      // Get existing configuration
      const existing = await pool.query(
        'SELECT * FROM platform_configurations WHERE id = $1 AND user_id = $2',
        [id, 1]
      )
      
      if (existing.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        })
      }

      const current = existing.rows[0]

      // Build update query
      const updateFields = []
      const params = []
      let paramIndex = 1

      if (updates.platform_name) {
        updateFields.push(`platform_name = $${paramIndex}`)
        params.push(updates.platform_name)
        paramIndex++
      }

      if (updates.configuration) {
        updateFields.push(`configuration = $${paramIndex}`)
        params.push(updates.configuration)
        paramIndex++
      }

      if (updates.credentials) {
        updateFields.push(`credentials = $${paramIndex}`)
        params.push(updates.credentials)
        paramIndex++
      }

      if (updates.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex}`)
        params.push(updates.is_active)
        paramIndex++
      }

      updateFields.push(`updated_at = NOW()`)
      
      params.push(id)
      const whereClause = `WHERE id = $${paramIndex} AND user_id = ${1}`

      const query = `
        UPDATE platform_configurations 
        SET ${updateFields.join(', ')}
        ${whereClause}
        RETURNING id, platform_type, platform_name, configuration, 
                  is_active, is_connected, last_tested_at, test_result,
                  created_at, updated_at
      `

      const result = await pool.query(query, params)

      return {
        success: true,
        data: result.rows[0],
        message: 'Platform configuration updated successfully'
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to update platform configuration'
      })
    }
  })

  // Test platform connection
  fastify.post('/platforms/test-connection', async (request, reply) => {
    const { platform_type, configuration, credentials } = request.body as TestConnectionRequest
    
    try {
      if (!PlatformRegistry.isPlatformSupported(platform_type)) {
        return reply.status(400).send({
          success: false,
          error: `Unsupported platform type: ${platform_type}`
        })
      }

      const platform = createPlatform(platform_type)
      const config: PlatformConfig = {
        platform_type,
        platform_name: 'Test Configuration',
        configuration,
        credentials,
        is_active: true
      }

      const testResult = await platform.testConnection(config)

      return {
        success: true,
        data: testResult
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to test platform connection'
      })
    }
  })

  // Test existing platform configuration
  fastify.post('/platforms/configurations/:id/test', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      // Get configuration with credentials
      const result = await pool.query(
        'SELECT * FROM platform_configurations WHERE id = $1 AND user_id = $2',
        [id, 1]
      )
      
      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        })
      }

      const config = result.rows[0]
      
      // Get credentials directly from JSON field
      const credentials = config.credentials || null

      const platform = createPlatform(config.platform_type)
      const platformConfig: PlatformConfig = {
        id: config.id,
        platform_type: config.platform_type,
        platform_name: config.platform_name,
        configuration: config.configuration,
        credentials,
        is_active: config.is_active
      }

      const testResult = await platform.testConnection(platformConfig)

      // Update test result in database
      await pool.query(
        'UPDATE platform_configurations SET is_connected = $1, last_tested_at = NOW(), test_result = $2 WHERE id = $3',
        [testResult.success, testResult.message || 'Test completed', id]
      )

      return {
        success: true,
        data: testResult
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to test platform configuration'
      })
    }
  })

  // Delete platform configuration
  fastify.delete('/platforms/configurations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const result = await pool.query(
        'DELETE FROM platform_configurations WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, 1]
      )
      
      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        })
      }
      
      return {
        success: true,
        message: 'Platform configuration deleted successfully'
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete platform configuration'
      })
    }
  })

  // Get platform analytics
  fastify.get('/platforms/analytics', async (request, reply) => {
    try {
      const { platform_config_id, days = 30 } = request.query as { 
        platform_config_id?: string
        days?: number 
      }
      
      let query = `
        SELECT 
          pc.platform_type,
          pc.platform_name,
          COUNT(pa.id) as total_events,
          COUNT(DISTINCT pa.derivative_id) as unique_content,
          COUNT(CASE WHEN pa.event_type = 'published' THEN 1 END) as published_count,
          COUNT(CASE WHEN pa.event_type = 'clicked' THEN 1 END) as click_count,
          COUNT(CASE WHEN pa.event_type = 'opened' THEN 1 END) as open_count
        FROM platform_configurations pc
        LEFT JOIN platform_analytics pa ON pc.id = pa.platform_config_id 
          AND pa.occurred_at >= NOW() - INTERVAL '${days} days'
        WHERE pc.user_id = $1
      `
      
      const params = [1] // Default user
      
      if (platform_config_id) {
        query += ' AND pc.id = $2'
        params.push(platform_config_id)
      }
      
      query += ' GROUP BY pc.id, pc.platform_type, pc.platform_name ORDER BY pc.platform_type'
      
      const result = await pool.query(query, params)
      
      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get platform analytics'
      })
    }
  })

  // Publish content to a platform
  fastify.post('/platforms/publish', async (request, reply) => {
    try {
      const {
        platform_config_id,
        platform_type,
        content,
        derivative_id,
        scheduled_time
      } = request.body as {
        platform_config_id?: number
        platform_type: string
        content: string
        derivative_id?: number
        scheduled_time?: string | null
      }

      // For now, simulate publishing since we don't have actual platform integrations
      // In a real implementation, this would:
      // 1. Load the platform configuration
      // 2. Create platform instance
      // 3. Call platform.publish(content, options)
      // 4. Update derivative status in database
      // 5. Log the publishing event

      const isSuccessful = Math.random() > 0.1 // 90% success rate for demo

      if (isSuccessful) {
        // Update derivative status if derivative_id provided
        if (derivative_id) {
          const updateQuery = `
            UPDATE derivatives 
            SET status = 'published', published_at = NOW() 
            WHERE id = $1
          `
          await pool.query(updateQuery, [derivative_id])
        }

        // Log the publishing event for analytics
        if (platform_config_id) {
          const analyticsQuery = `
            INSERT INTO platform_analytics (platform_config_id, derivative_id, event_type, occurred_at, metadata)
            VALUES ($1, $2, 'content_published', NOW(), $3)
          `
          await pool.query(analyticsQuery, [
            platform_config_id,
            derivative_id || null,
            JSON.stringify({
              content_length: content.length,
              platform_type,
              scheduled_time
            })
          ])
        }

        return {
          success: true,
          data: {
            platform_type,
            published_at: new Date().toISOString(),
            content_id: derivative_id,
            message: `Successfully published to ${platform_type}`
          }
        }
      } else {
        // Simulate failure
        return reply.status(400).send({
          success: false,
          error: `Failed to publish to ${platform_type}: Simulated platform error`
        })
      }

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to publish content'
      })
    }
  })
}

export default platformRoutes