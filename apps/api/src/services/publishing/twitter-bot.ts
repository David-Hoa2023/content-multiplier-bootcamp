import { llm } from '../llm.ts'
import { TwitterService } from './social-media.ts'
import { PublishingOrchestrator } from './orchestrator.ts'
import { loadLLMSettings } from '../settingsStore.ts'
import { q } from '../../db.ts'

export interface TwitterBotConfig {
    enabled: boolean
    interval_hours: number
    prompt_template: string
    content_topics: string[]
    max_tweets_per_day: number
    schedule_times: string[] // ['09:00', '15:00', '21:00']
}

export interface TwitterContentTemplate {
    template_id: string
    name: string
    prompt: string
    topics: string[]
    tone: 'professional' | 'casual' | 'humorous' | 'educational'
    max_length: number
    hashtags?: string[]
    mentions?: string[]
}

export class TwitterBotService {
    private twitterService: TwitterService
    private orchestrator: PublishingOrchestrator
    private isRunning: boolean = false
    private intervalId: NodeJS.Timeout | null = null

    constructor() {
        this.twitterService = new TwitterService()
        this.orchestrator = new PublishingOrchestrator()
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('Twitter bot is already running')
            return
        }

        const config = await this.getBotConfig()
        if (!config.enabled) {
            console.log('Twitter bot is disabled in configuration')
            return
        }

        this.isRunning = true
        console.log(`Starting Twitter bot with ${config.interval_hours}h interval`)

        // Start the scheduled posting
        this.scheduleNextPost(config)
        
        // Log the start event
        await this.logBotEvent('started', { config })
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            console.log('Twitter bot is not running')
            return
        }

        this.isRunning = false
        if (this.intervalId) {
            clearTimeout(this.intervalId)
            this.intervalId = null
        }

        console.log('Twitter bot stopped')
        await this.logBotEvent('stopped', {})
    }

    async getStatus(): Promise<{
        running: boolean
        config: TwitterBotConfig
        last_post: any
        next_scheduled: Date | null
        stats: any
    }> {
        const config = await this.getBotConfig()
        const lastPost = await this.getLastBotPost()
        const stats = await this.getBotStats()

        return {
            running: this.isRunning,
            config,
            last_post: lastPost,
            next_scheduled: this.getNextScheduledTime(config),
            stats
        }
    }

    private async scheduleNextPost(config: TwitterBotConfig): Promise<void> {
        if (!this.isRunning) return

        const nextTime = this.getNextScheduledTime(config)
        if (!nextTime) return

        const delay = nextTime.getTime() - Date.now()
        console.log(`Next Twitter post scheduled for: ${nextTime.toISOString()}`)

        this.intervalId = setTimeout(async () => {
            try {
                await this.generateAndPost(config)
            } catch (error) {
                console.error('Error in scheduled Twitter post:', error)
                await this.logBotEvent('post_failed', { error: error.message })
            }

            // Schedule the next post
            this.scheduleNextPost(config)
        }, delay)
    }

    private getNextScheduledTime(config: TwitterBotConfig): Date | null {
        if (config.schedule_times.length === 0) {
            // Fallback to interval-based scheduling
            return new Date(Date.now() + config.interval_hours * 60 * 60 * 1000)
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        // Find the next scheduled time today
        for (const timeStr of config.schedule_times.sort()) {
            const [hours, minutes] = timeStr.split(':').map(Number)
            const scheduledTime = new Date(today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000)
            
            if (scheduledTime > now) {
                return scheduledTime
            }
        }

        // If no more times today, schedule for first time tomorrow
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const [hours, minutes] = config.schedule_times[0].split(':').map(Number)
        return new Date(tomorrow.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000)
    }

    private async generateAndPost(config: TwitterBotConfig): Promise<void> {
        // Check daily limit
        const todaysPosts = await this.getTodaysPostCount()
        if (todaysPosts >= config.max_tweets_per_day) {
            console.log(`Daily tweet limit reached (${config.max_tweets_per_day})`)
            return
        }

        // Generate content
        const template = await this.selectContentTemplate(config.content_topics)
        const content = await this.generateTweetContent(template, config)

        // Create a synthetic pack for the bot post
        const packId = await this.createBotContentPack(content)

        // Publish the tweet
        await this.orchestrator.publishPack(packId, ['twitter'], {
            text: content.text,
            thread: content.thread
        })

        await this.logBotEvent('post_published', { 
            pack_id: packId, 
            content: content.text.substring(0, 100) + '...'
        })
    }

    private async generateTweetContent(template: TwitterContentTemplate, config: TwitterBotConfig): Promise<{
        text: string
        thread?: string[]
    }> {
        const prompt = this.buildPrompt(template, config)
        
        // Get the configured LLM settings
        const llmSettings = loadLLMSettings()
        const model = llmSettings?.model || 'gpt-4o-mini'
        
        const response = await llm.completeJSON({
            model: model,
            system: 'You are a Twitter content creator. Generate engaging tweets based on the provided template and topics.',
            user: prompt,
            jsonSchema: {
                type: 'object',
                properties: {
                    text: { type: 'string', maxLength: 280 },
                    thread: { 
                        type: 'array', 
                        items: { type: 'string', maxLength: 280 },
                        maxItems: 5
                    },
                    hashtags: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                required: ['text']
            }
        })

        return response
    }

    private buildPrompt(template: TwitterContentTemplate, config: TwitterBotConfig): string {
        const randomTopic = config.content_topics[Math.floor(Math.random() * config.content_topics.length)]
        
        return template.prompt
            .replace('{topic}', randomTopic)
            .replace('{tone}', template.tone)
            .replace('{max_length}', template.max_length.toString())
            + (template.hashtags ? `\n\nSuggested hashtags: ${template.hashtags.join(', ')}` : '')
            + (template.mentions ? `\n\nMentions to consider: ${template.mentions.join(', ')}` : '')
    }

    private async selectContentTemplate(topics: string[]): Promise<TwitterContentTemplate> {
        // Get templates that match the topics
        const templates = await q(`
            SELECT * FROM twitter_content_templates 
            WHERE topics && $1 
            ORDER BY RANDOM() 
            LIMIT 1
        `, [topics])

        if (templates.length === 0) {
            // Return default template
            return {
                template_id: 'default',
                name: 'Default Template',
                prompt: 'Create an engaging tweet about {topic} with a {tone} tone. Keep it under {max_length} characters.',
                topics: topics,
                tone: 'professional',
                max_length: 280
            }
        }

        return templates[0]
    }

    private async createBotContentPack(content: any): Promise<string> {
        const packId = `bot_${Date.now()}`
        
        // First create a brief for the bot content
        const briefId = `brief_${Date.now()}`
        await q(`
            INSERT INTO briefs (brief_id, idea_id, status, created_at)
            VALUES ($1, 'twitter_bot', 'completed', NOW())
        `, [briefId])
        
        // Create content pack with bot metadata in derivatives
        await q(`
            INSERT INTO content_packs (pack_id, brief_id, status, derivatives, created_at)
            VALUES ($1, $2, 'ready_for_review', $3, NOW())
        `, [packId, briefId, JSON.stringify({
            twitter_bot_generated: true,
            twitter_content: content,
            generated_at: new Date().toISOString()
        })])

        return packId
    }

    private async getBotConfig(): Promise<TwitterBotConfig> {
        const result = await q(`
            SELECT configuration FROM platform_configurations 
            WHERE platform = 'twitter_bot' AND is_active = true
            LIMIT 1
        `)

        if (result.length === 0) {
            // Return default configuration
            return {
                enabled: false,
                interval_hours: 12,
                prompt_template: 'Create an engaging tweet about {topic}',
                content_topics: ['AI', 'technology', 'programming', 'startups'],
                max_tweets_per_day: 3,
                schedule_times: ['09:00', '15:00', '21:00']
            }
        }

        return result[0].configuration
    }

    private async getTodaysPostCount(): Promise<number> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

        const result = await q(`
            SELECT COUNT(*) as count FROM publishing_queue pq
            JOIN content_packs cp ON pq.pack_id = cp.pack_id
            WHERE pq.platform = 'twitter' 
            AND pq.status = 'published'
            AND cp.derivatives->>'twitter_bot_generated' = 'true'
            AND pq.published_at >= $1 
            AND pq.published_at < $2
        `, [today, tomorrow])

        return parseInt(result[0].count)
    }

    private async getLastBotPost(): Promise<any> {
        const result = await q(`
            SELECT pq.*, pr.external_url, pr.published_at 
            FROM publishing_queue pq
            JOIN content_packs cp ON pq.pack_id = cp.pack_id
            LEFT JOIN publishing_results pr ON pq.queue_id = pr.queue_id
            WHERE pq.platform = 'twitter' 
            AND cp.derivatives->>'twitter_bot_generated' = 'true'
            ORDER BY pq.created_at DESC
            LIMIT 1
        `)

        return result[0] || null
    }

    private async getBotStats(): Promise<any> {
        const result = await q(`
            SELECT 
                COUNT(*) as total_posts,
                COUNT(CASE WHEN pq.status = 'published' THEN 1 END) as successful_posts,
                COUNT(CASE WHEN pq.status = 'failed' THEN 1 END) as failed_posts
            FROM publishing_queue pq
            JOIN content_packs cp ON pq.pack_id = cp.pack_id
            WHERE pq.platform = 'twitter' 
            AND cp.derivatives->>'twitter_bot_generated' = 'true'
        `)

        return result[0] || { total_posts: 0, successful_posts: 0, failed_posts: 0 }
    }

    private async logBotEvent(event_type: string, data: any): Promise<void> {
        await q(`
            INSERT INTO events (event_type, payload, created_at)
            VALUES ($1, $2, NOW())
        `, [`twitter_bot.${event_type}`, JSON.stringify(data)])
    }

    // Public method for generating content from a template (used by API)
    async generateContentFromTemplate(template: any, topic: string): Promise<{
        text: string
        thread?: string[]
        hashtags?: string[]
    }> {
        const prompt = this.buildPrompt(template, { content_topics: [topic] })
        
        // Get the configured LLM settings
        const llmSettings = loadLLMSettings()
        const model = llmSettings?.model || 'gpt-4o-mini'
        
        const response = await llm.completeJSON({
            model: model,
            system: 'You are a Twitter content creator. Generate engaging tweets based on the provided template and topics.',
            user: prompt,
            jsonSchema: {
                type: 'object',
                properties: {
                    text: { type: 'string', maxLength: 280 },
                    thread: { 
                        type: 'array', 
                        items: { type: 'string', maxLength: 280 },
                        maxItems: 5
                    },
                    hashtags: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                required: ['text']
            }
        })

        return response
    }
}