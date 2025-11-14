import { FastifyPluginAsync } from 'fastify'
import pool from '../db'
import { PlatformRegistry, createPlatform } from '../platforms/registry'
import { PlatformConfig } from '../platforms/base/BasePlatform'
import { 
  PlatformCredentialsService, 
  PlatformCredentials,
  PlatformConfig as PlatformConfigWithCredentials
} from '../services/platformCredentialsService'

interface CreatePlatformConfigRequest {
  platform_type: string
  platform_name: string
  configuration: Record<string, any>
  credentials?: PlatformCredentials
  test_connection?: boolean
}

interface UpdatePlatformConfigRequest {
  platform_name?: string
  configuration?: Record<string, any>
  credentials?: PlatformCredentials
  is_active?: boolean
}

interface TestConnectionRequest {
  platform_type: string
  configuration: Record<string, any>
  credentials?: PlatformCredentials
}

const platformRoutes: FastifyPluginAsync = async (fastify, opts) => {
  const credentialsService = new PlatformCredentialsService(pool);
  
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

  // Get all platform configurations for user (without credentials)
  fastify.get('/platforms/configurations', async (request, reply) => {
    try {
      const { platform_type, is_active } = request.query as { 
        platform_type?: string
        is_active?: boolean 
      }
      
      const configs = await credentialsService.getPlatformConfigs({
        platform_type,
        is_active,
        user_id: 1 // Default user for now
      });
      
      return {
        success: true,
        data: configs
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get platform configurations'
      })
    }
  })

  // Get single platform configuration (without credentials for security)
  fastify.get('/platforms/configurations/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const configs = await credentialsService.getPlatformConfigs({
        user_id: 1 // Default user for now
      });
      
      const config = configs.find(c => c.id === parseInt(id));
      
      if (!config) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        })
      }
      
      return {
        success: true,
        data: config
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

      // Validate credentials if provided
      if (credentials) {
        const validation = credentialsService.validateCredentials(platform_type, credentials);
        if (!validation.valid) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid credentials provided',
            details: `Missing required fields: ${validation.missing.join(', ')}`
          });
        }
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
      if (test_connection && credentials) {
        try {
          const testResponse = await platform.testConnection(config)
          isConnected = testResponse.success
          testResult = testResponse.message || (testResponse.success ? 'Connected' : 'Failed')
        } catch (error: any) {
          testResult = `Test failed: ${error.message}`
        }
      }

      // Store configuration with encrypted credentials
      const configToStore: PlatformConfigWithCredentials = {
        platform_type,
        platform_name,
        configuration,
        credentials,
        is_active: true,
        is_connected: isConnected,
        last_tested_at: test_connection ? new Date() : undefined,
        test_result: testResult,
        user_id: 1 // Default user
      };

      const created = await credentialsService.storePlatformConfig(configToStore);

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
      // Validate credentials if provided
      if (updates.credentials) {
        // First need to get the platform type to validate credentials
        const existing = await credentialsService.getPlatformConfigs({ user_id: 1 });
        const existingConfig = existing.find(c => c.id === parseInt(id));
        
        if (!existingConfig) {
          return reply.status(404).send({
            success: false,
            error: 'Platform configuration not found'
          });
        }

        const validation = credentialsService.validateCredentials(existingConfig.platform_type, updates.credentials);
        if (!validation.valid) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid credentials provided',
            details: `Missing required fields: ${validation.missing.join(', ')}`
          });
        }
      }

      const updated = await credentialsService.updatePlatformConfig(parseInt(id), updates);

      return {
        success: true,
        data: updated,
        message: 'Platform configuration updated successfully'
      }
    } catch (error: any) {
      fastify.log.error(error)
      
      if (error.message === 'Platform configuration not found') {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        });
      }
      
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
      // Get configuration with encrypted credentials
      const config = await credentialsService.getPlatformConfigWithCredentials(parseInt(id));
      
      if (!config) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        });
      }

      if (!config.credentials) {
        return reply.status(400).send({
          success: false,
          error: 'No credentials configured for this platform'
        });
      }

      const platform = createPlatform(config.platform_type);
      const platformConfig: PlatformConfig = {
        id: config.id,
        platform_type: config.platform_type,
        platform_name: config.platform_name,
        configuration: config.configuration,
        credentials: config.credentials,
        is_active: config.is_active
      };

      const testResult = await platform.testConnection(platformConfig);

      // Update test result in database
      await credentialsService.updateTestResults(
        parseInt(id),
        testResult.success,
        testResult.message || 'Test completed'
      );

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
      const deleted = await credentialsService.deletePlatformConfig(parseInt(id));
      
      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Platform configuration not found'
        });
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
            INSERT INTO platform_analytics (platform_config_id, derivative_id, event_type, occurred_at, event_data)
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

  // Get published content with analytics
  fastify.get('/platforms/published-content', async (request, reply) => {
    try {
      const query = `
        SELECT 
          d.id,
          d.platform,
          d.content,
          d.character_count,
          d.published_at,
          d.hashtags,
          d.mentions,
          d.media_urls,
          pc.platform_name,
          pc.platform_type,
          pa.event_data,
          pa.occurred_at as analytics_logged_at,
          cp.pack_id,
          b.title as brief_title
        FROM derivatives d
        LEFT JOIN platform_configurations pc ON d.platform_config_id = pc.id
        LEFT JOIN platform_analytics pa ON pa.derivative_id = d.id
        LEFT JOIN content_plans cpl ON d.content_plan_id = cpl.id
        LEFT JOIN content_packs cp ON d.pack_id = cp.pack_id::text
        LEFT JOIN briefs b ON cp.brief_id = b.brief_id
        WHERE d.status = 'published'
        ORDER BY d.published_at DESC
      `;

      const result = await pool.query(query);
      
      const publishedContent = result.rows.map(row => ({
        id: row.id,
        platform: row.platform,
        content: row.content,
        character_count: row.character_count,
        published_at: row.published_at,
        hashtags: row.hashtags,
        mentions: row.mentions,
        media_urls: row.media_urls,
        platform_config: {
          name: row.platform_name,
          type: row.platform_type
        },
        analytics: row.event_data ? {
          ...row.event_data,
          logged_at: row.analytics_logged_at
        } : null,
        content_pack: {
          pack_id: row.pack_id,
          brief_title: row.brief_title
        }
      }));

      return {
        success: true,
        data: publishedContent,
        total: publishedContent.length
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch published content'
      })
    }
  })
}

export default platformRoutes