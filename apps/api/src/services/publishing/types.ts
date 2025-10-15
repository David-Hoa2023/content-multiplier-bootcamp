// Publishing Integration Types
export interface PublishingCredentials {
    credential_id: string
    user_id: string
    platform: PublishingPlatform
    credential_type: 'oauth' | 'api_key' | 'webhook'
    encrypted_credentials: Record<string, any>
    metadata?: Record<string, any>
    is_active: boolean
    expires_at?: Date
}

export type PublishingPlatform =
    | 'twitter'
    | 'linkedin'
    | 'facebook'
    | 'instagram'
    | 'sendgrid'
    | 'mailchimp'
    | 'wordpress'
    | 'medium'
    | 'custom_webhook'

export interface PublishingJob {
    queue_id: number
    pack_id: string
    platform: PublishingPlatform
    content_type: 'post' | 'article' | 'newsletter' | 'video_script'
    content_data: Record<string, any>
    status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'
    scheduled_at: Date
    published_at?: Date
    error_message?: string
    retry_count: number
    max_retries: number
}

export interface PublishingResult {
    result_id: number
    queue_id: number
    platform: PublishingPlatform
    external_id?: string
    external_url?: string
    metrics?: Record<string, any>
    published_at: Date
}

export interface WebhookConfig {
    webhook_id: string
    user_id: string
    name: string
    url: string
    secret: string
    events: string[]
    headers?: Record<string, string>
    is_active: boolean
}

export interface WebhookDelivery {
    delivery_id: number
    webhook_id: string
    event_type: string
    payload: Record<string, any>
    status: 'pending' | 'delivered' | 'failed'
    response_code?: number
    response_body?: string
    attempts: number
    max_attempts: number
    next_retry_at?: Date
    delivered_at?: Date
}

// Platform-specific content formats
export interface TwitterContent {
    text: string
    media_urls?: string[]
    reply_to?: string
    thread?: string[]
}

export interface LinkedInContent {
    text: string
    media_urls?: string[]
    visibility: 'PUBLIC' | 'CONNECTIONS'
    company_id?: string
}

export interface FacebookContent {
    message: string
    link?: string
    media_urls?: string[]
    page_id: string
}

export interface InstagramContent {
    caption: string
    media_url: string
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL'
    alt_text?: string
}

export interface EmailContent {
    subject: string
    html_content: string
    text_content: string
    to: string[]
    cc?: string[]
    bcc?: string[]
    from_name?: string
    from_email: string
}

export interface WordPressContent {
    title: string
    content: string
    excerpt?: string
    status: 'draft' | 'publish' | 'private'
    categories?: string[]
    tags?: string[]
    featured_media?: string
}

export interface MediumContent {
    title: string
    content: string
    contentFormat: 'html' | 'markdown'
    publishStatus: 'draft' | 'public' | 'unlisted'
    tags?: string[]
    canonicalUrl?: string
}

// Publishing service interfaces
export interface PublishingService {
    platform: PublishingPlatform
    authenticate(credentials: PublishingCredentials): Promise<boolean>
    publish(job: PublishingJob): Promise<PublishingResult>
    getMetrics(result: PublishingResult): Promise<Record<string, any>>
    validateContent(content: any): Promise<{ valid: boolean; errors: string[] }>
}

export interface WebhookService {
    register(config: WebhookConfig): Promise<void>
    trigger(eventType: string, payload: Record<string, any>): Promise<void>
    deliver(delivery: WebhookDelivery): Promise<boolean>
    retryFailed(): Promise<void>
}

