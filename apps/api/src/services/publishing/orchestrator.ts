import { q } from '../../db.ts'
import { PublishingJob, PublishingResult, PublishingPlatform } from './types.ts'
import { TwitterService, LinkedInService, FacebookService, InstagramService } from './social-media.ts'
import { SendGridService, MailchimpService } from './email.ts'
import { WordPressService, MediumService } from './cms.ts'
import { WebhookManager, WEBHOOK_EVENTS } from './webhooks.ts'

export class PublishingOrchestrator {
    private services: Map<PublishingPlatform, any> = new Map()
    private webhookManager: WebhookManager

    constructor() {
        this.webhookManager = new WebhookManager()
        this.initializeServices()
    }

    private initializeServices() {
        this.services.set('twitter', new TwitterService())
        this.services.set('linkedin', new LinkedInService())
        this.services.set('facebook', new FacebookService())
        this.services.set('instagram', new InstagramService())
        this.services.set('sendgrid', new SendGridService())
        this.services.set('mailchimp', new MailchimpService())
        this.services.set('wordpress', new WordPressService())
        this.services.set('medium', new MediumService())
    }

    async publishPack(packId: string, platforms: PublishingPlatform[], content: Record<string, any>): Promise<void> {
        console.log(`Starting publishing process for pack ${packId} to platforms:`, platforms)

        // Trigger webhook for publishing started
        await this.webhookManager.trigger(WEBHOOK_EVENTS.PUBLISHING_STARTED, {
            pack_id: packId,
            platforms,
            started_at: new Date().toISOString()
        })

        // Create publishing jobs for each platform
        const jobs: PublishingJob[] = []

        for (const platform of platforms) {
            const job = await this.createPublishingJob(packId, platform, content)
            jobs.push(job)
        }

        // Process jobs asynchronously
        const results = await Promise.allSettled(
            jobs.map(job => this.processPublishingJob(job))
        )

        // Update pack status
        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failureCount = results.filter(r => r.status === 'rejected').length

        await this.updatePackPublishingStatus(packId, successCount, failureCount, results)

        // Trigger completion webhook
        if (failureCount === 0) {
            await this.webhookManager.trigger(WEBHOOK_EVENTS.PUBLISHING_COMPLETED, {
                pack_id: packId,
                platforms,
                results: results.map(r => r.status === 'fulfilled' ? r.value : null),
                completed_at: new Date().toISOString()
            })
        } else {
            await this.webhookManager.trigger(WEBHOOK_EVENTS.PUBLISHING_FAILED, {
                pack_id: packId,
                platforms,
                errors: results.filter(r => r.status === 'rejected').map(r => r.reason),
                failed_at: new Date().toISOString()
            })
        }
    }

    private async createPublishingJob(packId: string, platform: PublishingPlatform, content: Record<string, any>): Promise<PublishingJob> {
        const contentData = this.formatContentForPlatform(platform, content)

        const result = await q(`
            INSERT INTO publishing_queue 
            (pack_id, platform, content_type, content_data, status, scheduled_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING queue_id
        `, [
            packId,
            platform,
            this.getContentType(platform),
            JSON.stringify(contentData),
            'pending',
            new Date()
        ])

        return {
            queue_id: result[0].queue_id,
            pack_id: packId,
            platform,
            content_type: this.getContentType(platform),
            content_data: contentData,
            status: 'pending',
            scheduled_at: new Date(),
            retry_count: 0,
            max_retries: 3
        }
    }

    private async processPublishingJob(job: PublishingJob): Promise<PublishingResult> {
        const service = this.services.get(job.platform)
        if (!service) {
            throw new Error(`No service available for platform: ${job.platform}`)
        }

        // Update job status to processing
        await q(`
            UPDATE publishing_queue 
            SET status = 'processing', updated_at = NOW()
            WHERE queue_id = $1
        `, [job.queue_id])

        try {
            // Validate content
            console.log(`Validating content for ${job.platform} job ${job.queue_id}:`, JSON.stringify(job.content_data, null, 2))
            const validation = await service.validateContent(job.content_data)
            console.log(`Validation result for ${job.platform} job ${job.queue_id}:`, validation)
            if (!validation.valid) {
                throw new Error(`Content validation failed: ${validation.errors.join(', ')}`)
            }

            // Publish content
            const result = await service.publish(job)

            // Store result
            const resultId = await this.storePublishingResult(result)

            // Update job status
            await q(`
                UPDATE publishing_queue 
                SET status = 'published', published_at = NOW(), updated_at = NOW()
                WHERE queue_id = $1
            `, [job.queue_id])

            return { ...result, result_id: resultId }

        } catch (error) {
            console.error(`Publishing failed for job ${job.queue_id}:`, error)

            // Update job status
            await q(`
                UPDATE publishing_queue 
                SET status = 'failed', error_message = $2, updated_at = NOW()
                WHERE queue_id = $1
            `, [job.queue_id, error instanceof Error ? error.message : 'Unknown error'])

            throw error
        }
    }

    private formatContentForPlatform(platform: PublishingPlatform, content: Record<string, any>): Record<string, any> {
        switch (platform) {
            case 'twitter':
                return {
                    text: content.text || content.title,
                    thread: content.thread || []
                }

            case 'linkedin':
                return {
                    text: content.text || content.title,
                    visibility: 'PUBLIC'
                }

            case 'facebook':
                return {
                    message: content.text || content.title,
                    page_id: content.page_id || process.env.FACEBOOK_PAGE_ID
                }

            case 'instagram':
                return {
                    caption: content.text || content.title,
                    media_url: content.media_url || content.image_url,
                    media_type: 'IMAGE'
                }

            case 'sendgrid':
            case 'mailchimp':
                const emailContent = {
                    subject: content.subject || content.title,
                    html_content: content.html_content || content.html || content.content,
                    text_content: content.text_content || content.text || content.content,
                    to: content.recipients || [content.email],
                    from_email: content.from_email || process.env.DEFAULT_FROM_EMAIL || 'noreply@contentmultiplier.com',
                    from_name: content.from_name || 'Content Multiplier'
                }
                console.log(`Formatting content for ${platform}:`, JSON.stringify(emailContent, null, 2))
                return emailContent

            case 'wordpress':
                return {
                    title: content.title,
                    content: content.content,
                    status: 'publish'
                }

            case 'medium':
                return {
                    title: content.title,
                    content: content.content,
                    contentFormat: 'html',
                    publishStatus: 'public'
                }

            default:
                return content
        }
    }

    private getContentType(platform: PublishingPlatform): string {
        switch (platform) {
            case 'twitter':
            case 'linkedin':
            case 'facebook':
            case 'instagram':
                return 'post'
            case 'sendgrid':
            case 'mailchimp':
                return 'newsletter'
            case 'wordpress':
            case 'medium':
                return 'article'
            default:
                return 'content'
        }
    }

    private async storePublishingResult(result: PublishingResult): Promise<number> {
        const dbResult = await q(`
            INSERT INTO publishing_results 
            (queue_id, platform, external_id, external_url, published_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING result_id
        `, [
            result.queue_id,
            result.platform,
            result.external_id,
            result.external_url,
            result.published_at
        ])

        return dbResult[0].result_id
    }

    private async updatePackPublishingStatus(packId: string, successCount: number, failureCount: number, results: any[]): Promise<void> {
        const status = failureCount === 0 ? 'published' : failureCount === results.length ? 'failed' : 'partially_published'

        await q(`
            UPDATE content_packs 
            SET publishing_status = $2, last_published_at = NOW(), publishing_errors = $3
            WHERE pack_id = $1
        `, [
            packId,
            status,
            JSON.stringify(results.filter(r => r.status === 'rejected').map(r => r.reason))
        ])
    }

    // Retry failed jobs
    async retryFailedJobs(): Promise<void> {
        const failedJobs = await q(`
            SELECT * FROM publishing_queue 
            WHERE status = 'failed' 
            AND retry_count < max_retries
            ORDER BY created_at ASC
            LIMIT 50
        `)

        for (const job of failedJobs) {
            await q(`
                UPDATE publishing_queue 
                SET retry_count = retry_count + 1, status = 'pending', updated_at = NOW()
                WHERE queue_id = $1
            `, [job.queue_id])

            // Process the job again
            this.processPublishingJob(job).catch(error => {
                console.error(`Retry failed for job ${job.queue_id}:`, error)
            })
        }
    }

    // Get publishing status for a pack
    async getPublishingStatus(packId: string): Promise<any> {
        const [pack] = await q(`
            SELECT publishing_status, last_published_at, publishing_errors
            FROM content_packs 
            WHERE pack_id = $1
        `, [packId])

        const jobs = await q(`
            SELECT pq.*, pr.external_id, pr.external_url, pr.published_at
            FROM publishing_queue pq
            LEFT JOIN publishing_results pr ON pq.queue_id = pr.queue_id
            WHERE pq.pack_id = $1
            ORDER BY pq.created_at DESC
        `, [packId])

        return {
            pack_status: pack,
            jobs: jobs.map(job => ({
                platform: job.platform,
                status: job.status,
                external_url: job.external_url,
                published_at: job.published_at,
                error_message: job.error_message
            }))
        }
    }

    // Schedule publishing for later
    async schedulePublishing(packId: string, platforms: PublishingPlatform[], content: Record<string, any>, scheduledAt: Date): Promise<void> {
        for (const platform of platforms) {
            const contentData = this.formatContentForPlatform(platform, content)

            await q(`
                INSERT INTO publishing_queue 
                (pack_id, platform, content_type, content_data, status, scheduled_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                packId,
                platform,
                this.getContentType(platform),
                JSON.stringify(contentData),
                'pending',
                scheduledAt
            ])
        }
    }
}

