import { FastifyPluginAsync } from 'fastify'
import { q } from '../db.ts'
import { OAuthService } from '../services/publishing/oauth.ts'
import { PublishingOrchestrator } from '../services/publishing/orchestrator.ts'
import { WebhookManager, WEBHOOK_EVENTS } from '../services/publishing/webhooks.ts'
import { logEvent } from '../services/telemetry.ts'

const routes: FastifyPluginAsync = async (app) => {
    const orchestrator = new PublishingOrchestrator()
    const webhookManager = new WebhookManager()

    // OAuth authentication endpoints
    app.get('/auth/:platform', async (req: any, reply) => {
        const { platform } = req.params
        const userId = req.user_id || 'default_user' // In real app, get from auth

        // Handle API-key based platforms that don't use OAuth
        const apiKeyPlatforms = ['mailchimp', 'sendgrid']
        if (apiKeyPlatforms.includes(platform)) {
            // Check if credentials already exist
            const [existing] = await q(
                'SELECT platform, is_active FROM publishing_credentials WHERE user_id = $1 AND platform = $2',
                [userId, platform]
            )
            
            if (existing && existing.is_active) {
                return { 
                    ok: true, 
                    message: `${platform} is already configured with API key`,
                    already_configured: true 
                }
            } else {
                return reply.status(400).send({
                    ok: false,
                    error: `${platform} requires API key configuration. Please contact administrator.`,
                    requires_api_key: true
                })
            }
        }

        try {
            const authUrl = await OAuthService.getAuthUrl(platform, userId)
            return { auth_url: authUrl }
        } catch (error) {
            return reply.status(400).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            })
        }
    })

    app.post('/auth/:platform/callback', async (req: any, reply) => {
        const { platform } = req.params
        const { code, state } = req.body
        const userId = req.user_id || 'default_user'

        try {
            const credentials = await OAuthService.exchangeCode(platform, code, state, userId)
            return { ok: true, credentials }
        } catch (error) {
            return reply.status(400).send({
                ok: false,
                error: error instanceof Error ? error.message : 'OAuth callback failed'
            })
        }
    })

    app.get('/auth/:platform/callback', async (req: any, reply) => {
        const { platform } = req.params
        const { code, state } = req.query
        const userId = req.user_id || 'default_user'

        console.log('OAuth callback received:', { platform, code: code?.substring(0, 10) + '...', state: state?.substring(0, 10) + '...', userId })

        try {
            const credentials = await OAuthService.exchangeCode(platform, code, state, userId)
            console.log('OAuth exchange successful:', { platform, userId, credentialId: credentials.credential_id })
            return reply.type('text/html').send(`
                <html>
                    <body>
                        <h2>Authentication Successful!</h2>
                        <p>You have successfully connected your ${platform} account.</p>
                        <script>
                            window.close();
                            if (window.opener) {
                                window.opener.postMessage({type: 'oauth_success', platform: '${platform}'}, '*');
                            }
                        </script>
                    </body>
                </html>
            `)
        } catch (error) {
            return reply.type('text/html').send(`
                <html>
                    <body>
                        <h2>Authentication Failed</h2>
                        <p>Error: ${error instanceof Error ? error.message : 'OAuth callback failed'}</p>
                        <script>window.close();</script>
                    </body>
                </html>
            `)
        }
    })

    // Publishing endpoints
    app.post('/publish', async (req: any, reply) => {
        const { pack_id, platforms, content, scheduled_at } = req.body

        if (!pack_id || !platforms || !Array.isArray(platforms)) {
            return reply.status(400).send({
                ok: false,
                error: 'pack_id and platforms array are required'
            })
        }

        try {
            if (scheduled_at) {
                await orchestrator.schedulePublishing(pack_id, platforms, content, new Date(scheduled_at))
                return { ok: true, message: 'Publishing scheduled' }
            } else {
                await orchestrator.publishPack(pack_id, platforms, content)
                return { ok: true, message: 'Publishing started' }
            }
        } catch (error) {
            console.error('Publishing error:', error)
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Publishing failed'
            })
        }
    })

    app.get('/status/:pack_id', async (req: any, reply) => {
        const { pack_id } = req.params

        try {
            const status = await orchestrator.getPublishingStatus(pack_id)
            return { ok: true, status }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to get status'
            })
        }
    })

    app.post('/retry/:pack_id', async (req: any, reply) => {
        const { pack_id } = req.params

        try {
            await orchestrator.retryFailedJobs()
            return { ok: true, message: 'Retry jobs started' }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Retry failed'
            })
        }
    })

    // Webhook management
    app.post('/webhooks', async (req: any, reply) => {
        const { name, url, secret, events, headers } = req.body
        const userId = req.user_id || 'default_user'

        if (!name || !url || !secret || !events) {
            return reply.status(400).send({
                ok: false,
                error: 'name, url, secret, and events are required'
            })
        }

        try {
            await webhookManager.register({
                webhook_id: '',
                user_id: userId,
                name,
                url,
                secret,
                events,
                headers,
                is_active: true
            })

            return { ok: true, message: 'Webhook registered' }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Webhook registration failed'
            })
        }
    })

    app.get('/webhooks', async (req: any, reply) => {
        const userId = req.user_id || 'default_user'

        try {
            const webhooks = await q(`
                SELECT webhook_id, name, url, events, is_active, created_at
                FROM webhook_configurations 
                WHERE user_id = $1
                ORDER BY created_at DESC
            `, [userId])

            return { ok: true, webhooks }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to get webhooks'
            })
        }
    })

    app.delete('/webhooks/:webhook_id', async (req: any, reply) => {
        const { webhook_id } = req.params
        const userId = req.user_id || 'default_user'

        try {
            await q(`
                UPDATE webhook_configurations 
                SET is_active = false, updated_at = NOW()
                WHERE webhook_id = $1 AND user_id = $2
            `, [webhook_id, userId])

            return { ok: true, message: 'Webhook deactivated' }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to deactivate webhook'
            })
        }
    })

    // Platform credentials management
    app.get('/credentials', async (req: any, reply) => {
        const userId = req.user_id || 'default_user'

        try {
            const credentials = await q(`
                SELECT platform, credential_type, is_active, expires_at, created_at
                FROM publishing_credentials 
                WHERE user_id = $1
                ORDER BY platform
            `, [userId])

            return { ok: true, credentials }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to get credentials'
            })
        }
    })

    app.delete('/credentials/:platform', async (req: any, reply) => {
        const { platform } = req.params
        const userId = req.user_id || 'default_user'

        try {
            await OAuthService.revokeCredentials(userId, platform)
            return { ok: true, message: 'Credentials revoked' }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to revoke credentials'
            })
        }
    })

    // Test webhook endpoint (for development)
    app.post('/test/webhook', async (req: any, reply) => {
        const { event_type, payload } = req.body

        if (!event_type) {
            return reply.status(400).send({
                ok: false,
                error: 'event_type is required'
            })
        }

        try {
            await webhookManager.trigger(event_type, payload || {})
            return { ok: true, message: 'Webhook triggered' }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Webhook trigger failed'
            })
        }
    })

    // Publishing analytics
    app.get('/analytics/:pack_id', async (req: any, reply) => {
        const { pack_id } = req.params

        try {
            const analytics = await q(`
                SELECT 
                    pr.platform,
                    pr.external_id,
                    pr.external_url,
                    pr.metrics,
                    pr.published_at,
                    pq.status,
                    pq.error_message
                FROM publishing_results pr
                JOIN publishing_queue pq ON pr.queue_id = pq.queue_id
                WHERE pq.pack_id = $1
                ORDER BY pr.published_at DESC
            `, [pack_id])

            return { ok: true, analytics }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to get analytics'
            })
        }
    })

    // Platform-specific content formatting
    app.post('/format/:platform', async (req: any, reply) => {
        const { platform } = req.params
        const { content } = req.body

        if (!content) {
            return reply.status(400).send({
                ok: false,
                error: 'content is required'
            })
        }

        try {
            const formatted = orchestrator['formatContentForPlatform'](platform, content)
            return { ok: true, formatted }
        } catch (error) {
            return reply.status(500).send({
                ok: false,
                error: error instanceof Error ? error.message : 'Content formatting failed'
            })
        }
    })
}

export default routes

