import { PublishingService, PublishingJob, PublishingResult, WordPressContent, MediumContent } from './types.ts'
import { q } from '../../db.ts'

export class WordPressService implements PublishingService {
    platform = 'wordpress' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const { username, password, site_url } = credentials
            const response = await fetch(`${site_url}/wp-json/wp/v2/users/me`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await this.getCredentials(job.pack_id)
        const content = job.content_data as WordPressContent

        const postData = {
            title: content.title,
            content: content.content,
            excerpt: content.excerpt,
            status: content.status,
            categories: content.categories,
            tags: content.tags,
            featured_media: content.featured_media
        }

        const response = await fetch(`${credentials.site_url}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`WordPress API error: ${error}`)
        }

        const result = await response.json() as any
        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'wordpress',
            external_id: result.id.toString(),
            external_url: result.link,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await this.getCredentials('')
        const response = await fetch(`${credentials.site_url}/wp-json/wp/v2/posts/${result.external_id}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) return {}

        const data = await response.json() as any
        return {
            views: data.meta?.views || 0,
            comments: data.comment_count || 0,
            likes: data.meta?.likes || 0
        }
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.title || content.title.length === 0) {
            errors.push('WordPress post title is required')
        }

        if (!content.content || content.content.length === 0) {
            errors.push('WordPress post content is required')
        }

        if (content.status && !['draft', 'publish', 'private'].includes(content.status)) {
            errors.push('Invalid WordPress post status')
        }

        return { valid: errors.length === 0, errors }
    }

    private async getCredentials(_packId: string): Promise<any> {
        const [cred] = await q(
            'SELECT encrypted_credentials FROM publishing_credentials WHERE platform = $1 AND is_active = true LIMIT 1',
            ['wordpress']
        )

        if (!cred) {
            throw new Error('WordPress credentials not configured')
        }

        return JSON.parse(cred.encrypted_credentials)
    }
}

export class MediumService implements PublishingService {
    platform = 'medium' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const { access_token } = credentials
            const response = await fetch('https://api.medium.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await this.getCredentials(job.pack_id)
        const content = job.content_data as MediumContent

        // Get user's publications
        const userResponse = await fetch('https://api.medium.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!userResponse.ok) {
            throw new Error('Failed to get Medium user info')
        }

        const user = await userResponse.json() as any
        const userId = user.data.id

        // Create the post
        const postData = {
            title: content.title,
            contentFormat: content.contentFormat,
            content: content.content,
            publishStatus: content.publishStatus,
            tags: content.tags,
            canonicalUrl: content.canonicalUrl
        }

        const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Medium API error: ${error}`)
        }

        const result = await response.json() as any
        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'medium',
            external_id: result.data.id,
            external_url: result.data.url,
            published_at: new Date()
        }
    }

    async getMetrics(_result: PublishingResult): Promise<Record<string, any>> {
        // Medium doesn't provide public metrics via API
        return {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.title || content.title.length === 0) {
            errors.push('Medium post title is required')
        }

        if (!content.content || content.content.length === 0) {
            errors.push('Medium post content is required')
        }

        if (content.contentFormat && !['html', 'markdown'].includes(content.contentFormat)) {
            errors.push('Invalid Medium content format')
        }

        if (content.publishStatus && !['draft', 'public', 'unlisted'].includes(content.publishStatus)) {
            errors.push('Invalid Medium publish status')
        }

        if (content.title && content.title.length > 100) {
            errors.push('Medium title exceeds 100 character limit')
        }

        return { valid: errors.length === 0, errors }
    }

    private async getCredentials(_packId: string): Promise<any> {
        const [cred] = await q(
            'SELECT encrypted_credentials FROM publishing_credentials WHERE platform = $1 AND is_active = true LIMIT 1',
            ['medium']
        )

        if (!cred) {
            throw new Error('Medium credentials not configured')
        }

        return JSON.parse(cred.encrypted_credentials)
    }
}

