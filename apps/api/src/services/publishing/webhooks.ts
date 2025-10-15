import crypto from 'crypto'
import { q } from '../../db.ts'
import { WebhookService, WebhookConfig, WebhookDelivery } from './types.ts'

export class WebhookManager implements WebhookService {
    async register(config: WebhookConfig): Promise<void> {
        const webhookId = `webhook_${crypto.randomUUID()}`

        await q(`
            INSERT INTO webhook_configurations 
            (webhook_id, user_id, name, url, secret, events, headers, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            webhookId,
            config.user_id,
            config.name,
            config.url,
            config.secret,
            config.events,
            config.headers || {},
            config.is_active
        ])
    }

    async trigger(eventType: string, payload: Record<string, any>): Promise<void> {
        // Get all active webhooks that listen to this event
        const webhooks = await q(`
            SELECT webhook_id, url, secret, headers, events
            FROM webhook_configurations 
            WHERE is_active = true AND $1 = ANY(events)
        `, [eventType])

        // Create delivery records for each webhook
        for (const webhook of webhooks) {
            const deliveryId = await this.createDelivery({
                webhook_id: webhook.webhook_id,
                event_type: eventType,
                payload,
                status: 'pending',
                attempts: 0,
                max_attempts: 3,
                next_retry_at: new Date(Date.now() + 1000) // 1 second delay
            })

            // Queue for immediate delivery
            await this.deliver({
                delivery_id: deliveryId,
                webhook_id: webhook.webhook_id,
                event_type: eventType,
                payload,
                status: 'pending',
                attempts: 0,
                max_attempts: 3,
                next_retry_at: new Date(Date.now() + 1000)
            })
        }
    }

    async deliver(delivery: WebhookDelivery): Promise<boolean> {
        try {
            const webhook = await this.getWebhookConfig(delivery.webhook_id)
            if (!webhook) {
                throw new Error('Webhook configuration not found')
            }

            // Create signature
            const signature = this.createSignature(delivery.payload, webhook.secret)

            // Prepare headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Event': delivery.event_type,
                'X-Webhook-Delivery': delivery.delivery_id.toString(),
                'User-Agent': 'Content-Multiplier-Webhook/1.0',
                ...webhook.headers
            }

            // Send webhook
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    event: delivery.event_type,
                    data: delivery.payload,
                    timestamp: new Date().toISOString(),
                    delivery_id: delivery.delivery_id
                }),
                timeout: 30000 // 30 second timeout
            })

            // Update delivery status
            await this.updateDeliveryStatus(delivery.delivery_id, {
                status: response.ok ? 'delivered' : 'failed',
                response_code: response.status,
                response_body: await response.text().catch(() => ''),
                delivered_at: response.ok ? new Date() : undefined,
                next_retry_at: response.ok ? undefined : new Date(Date.now() + this.getRetryDelay(delivery.attempts + 1))
            })

            return response.ok

        } catch (error) {
            console.error('Webhook delivery failed:', error)

            // Update delivery status
            await this.updateDeliveryStatus(delivery.delivery_id, {
                status: 'failed',
                response_body: error instanceof Error ? error.message : 'Unknown error',
                next_retry_at: new Date(Date.now() + this.getRetryDelay(delivery.attempts + 1))
            })

            return false
        }
    }

    async retryFailed(): Promise<void> {
        // Get failed deliveries that are ready for retry
        const failedDeliveries = await q(`
            SELECT delivery_id, webhook_id, event_type, payload, attempts, max_attempts
            FROM webhook_deliveries 
            WHERE status = 'failed' 
            AND attempts < max_attempts 
            AND next_retry_at <= NOW()
            ORDER BY created_at ASC
            LIMIT 100
        `)

        for (const delivery of failedDeliveries) {
            // Increment attempt count
            await q(`
                UPDATE webhook_deliveries 
                SET attempts = attempts + 1, status = 'pending'
                WHERE delivery_id = $1
            `, [delivery.delivery_id])

            // Retry delivery
            await this.deliver({
                delivery_id: delivery.delivery_id,
                webhook_id: delivery.webhook_id,
                event_type: delivery.event_type,
                payload: delivery.payload,
                status: 'pending',
                attempts: delivery.attempts + 1,
                max_attempts: delivery.max_attempts,
                next_retry_at: new Date()
            })
        }
    }

    private async createDelivery(delivery: Partial<WebhookDelivery>): Promise<number> {
        const result = await q(`
            INSERT INTO webhook_deliveries 
            (webhook_id, event_type, payload, status, attempts, max_attempts, next_retry_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING delivery_id
        `, [
            delivery.webhook_id,
            delivery.event_type,
            JSON.stringify(delivery.payload),
            delivery.status,
            delivery.attempts,
            delivery.max_attempts,
            delivery.next_retry_at
        ])

        return result[0].delivery_id
    }

    private async updateDeliveryStatus(deliveryId: number, updates: Partial<WebhookDelivery>): Promise<void> {
        const setClause = Object.keys(updates)
            .filter(key => updates[key as keyof WebhookDelivery] !== undefined)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ')

        if (setClause) {
            await q(`
                UPDATE webhook_deliveries 
                SET ${setClause}, updated_at = NOW()
                WHERE delivery_id = $1
            `, [deliveryId, ...Object.values(updates).filter(v => v !== undefined)])
        }
    }

    private async getWebhookConfig(webhookId: string): Promise<WebhookConfig | null> {
        const [config] = await q(`
            SELECT webhook_id, user_id, name, url, secret, events, headers, is_active
            FROM webhook_configurations 
            WHERE webhook_id = $1
        `, [webhookId])

        if (!config) return null

        return {
            webhook_id: config.webhook_id,
            user_id: config.user_id,
            name: config.name,
            url: config.url,
            secret: config.secret,
            events: config.events,
            headers: config.headers,
            is_active: config.is_active
        }
    }

    private createSignature(payload: Record<string, any>, secret: string): string {
        const payloadString = JSON.stringify(payload)
        const signature = crypto
            .createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex')
        return `sha256=${signature}`
    }

    private getRetryDelay(attempt: number): number {
        // Exponential backoff: 1s, 4s, 16s, 64s, etc.
        return Math.min(1000 * Math.pow(4, attempt - 1), 300000) // Max 5 minutes
    }

    // Verify webhook signature (for incoming webhooks)
    static verifySignature(payload: string, signature: string, secret: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex')

        const providedSignature = signature.replace('sha256=', '')

        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(providedSignature, 'hex')
        )
    }
}

// Webhook event types
export const WEBHOOK_EVENTS = {
    PACK_PUBLISHED: 'pack.published',
    PACK_DRAFT_CREATED: 'pack.draft_created',
    DERIVATIVES_CREATED: 'pack.derivatives_created',
    IDEA_SELECTED: 'idea.selected',
    BRIEF_APPROVED: 'brief.approved',
    PUBLISHING_STARTED: 'publishing.started',
    PUBLISHING_COMPLETED: 'publishing.completed',
    PUBLISHING_FAILED: 'publishing.failed'
} as const

// Webhook payload examples
export const WEBHOOK_PAYLOADS = {
    [WEBHOOK_EVENTS.PACK_PUBLISHED]: {
        pack_id: 'pack_123',
        status: 'published',
        title: 'Content Title',
        url: 'https://example.com/content',
        published_at: '2024-01-01T00:00:00Z',
        platforms: ['twitter', 'linkedin']
    },
    [WEBHOOK_EVENTS.DERIVATIVES_CREATED]: {
        pack_id: 'pack_123',
        derivatives: {
            linkedin: ['Post 1', 'Post 2', 'Post 3'],
            x: ['Tweet 1', 'Tweet 2', 'Tweet 3'],
            newsletter: 'Newsletter content...'
        },
        created_at: '2024-01-01T00:00:00Z'
    }
} as const

