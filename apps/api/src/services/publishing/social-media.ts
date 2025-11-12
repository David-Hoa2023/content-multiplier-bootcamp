import { PublishingService, PublishingJob, PublishingResult, TwitterContent, LinkedInContent, FacebookContent, InstagramContent } from './types.ts'
import { OAuthService } from './oauth.ts'

export class TwitterService implements PublishingService {
    platform = 'twitter' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const creds = await OAuthService.getCredentials(credentials.user_id, 'twitter')
            const response = await fetch('https://api.twitter.com/2/users/me', {
                headers: {
                    'Authorization': `Bearer ${creds.access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        // Get real stored credentials
        const credentials = await OAuthService.getCredentials('default_user', 'twitter')
        console.log('Using real Twitter credentials for posting')
        const content = job.content_data as TwitterContent

        // Handle thread posts
        if (content.thread && content.thread.length > 0) {
            return await this.publishThread(credentials, content)
        }

        // Single tweet
        console.log('Making Twitter API call to post tweet:', content.text?.substring(0, 50) + '...')
        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: content.text,
                reply: content.reply_to ? { in_reply_to_tweet_id: content.reply_to } : undefined
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Twitter API error: ${error}`)
        }

        const result = await response.json()
        return {
            result_id: 0, // Will be set by caller
            queue_id: job.queue_id,
            platform: 'twitter',
            external_id: result.data.id,
            external_url: `https://twitter.com/user/status/${result.data.id}`,
            published_at: new Date()
        }
    }

    private async publishThread(credentials: any, content: TwitterContent): Promise<PublishingResult> {
        let lastTweetId: string | undefined
        const tweets = [content.text, ...(content.thread || [])]

        for (const tweetText of tweets) {
            const response = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${credentials.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: tweetText,
                    reply: lastTweetId ? { in_reply_to_tweet_id: lastTweetId } : undefined
                })
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(`Twitter thread error: ${error}`)
            }

            const result = await response.json()
            lastTweetId = result.data.id
        }

        return {
            result_id: 0,
            queue_id: 0,
            platform: 'twitter',
            external_id: lastTweetId,
            external_url: `https://twitter.com/user/status/${lastTweetId}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await OAuthService.getCredentials('', 'twitter')
        const response = await fetch(`https://api.twitter.com/2/tweets/${result.external_id}?tweet.fields=public_metrics`, {
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) return {}

        const data = await response.json()
        return data.data?.public_metrics || {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.text || content.text.length === 0) {
            errors.push('Tweet text is required')
        }

        if (content.text && content.text.length > 280) {
            errors.push('Tweet text exceeds 280 character limit')
        }

        if (content.thread && content.thread.length > 25) {
            errors.push('Thread cannot exceed 25 tweets')
        }

        return { valid: errors.length === 0, errors }
    }
}

export class LinkedInService implements PublishingService {
    platform = 'linkedin' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const creds = await OAuthService.getCredentials(credentials.user_id, 'linkedin')
            const response = await fetch('https://api.linkedin.com/v2/people/~', {
                headers: {
                    'Authorization': `Bearer ${creds.access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await OAuthService.getCredentials('default_user', 'linkedin')
        const content = job.content_data as LinkedInContent

        // Get user's LinkedIn ID
        const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!profileResponse.ok) {
            throw new Error('Failed to get LinkedIn profile')
        }

        const profile = await profileResponse.json()
        const authorUrn = `urn:li:person:${profile.id}`

        // Create the post
        const postData = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: content.text
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': content.visibility
            }
        }

        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postData)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`LinkedIn API error: ${error}`)
        }

        const result = await response.json()
        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'linkedin',
            external_id: result.id,
            external_url: `https://www.linkedin.com/feed/update/${result.id}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        // LinkedIn metrics require additional API calls and permissions
        return {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.text || content.text.length === 0) {
            errors.push('LinkedIn post text is required')
        }

        if (content.text && content.text.length > 3000) {
            errors.push('LinkedIn post text exceeds 3000 character limit')
        }

        if (content.visibility && !['PUBLIC', 'CONNECTIONS'].includes(content.visibility)) {
            errors.push('Invalid visibility setting')
        }

        return { valid: errors.length === 0, errors }
    }
}

export class FacebookService implements PublishingService {
    platform = 'facebook' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const creds = await OAuthService.getCredentials(credentials.user_id, 'facebook')
            const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${creds.access_token}`)
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await OAuthService.getCredentials('default_user', 'facebook')
        const content = job.content_data as FacebookContent

        const postData = new URLSearchParams({
            message: content.message,
            access_token: credentials.access_token
        })

        if (content.link) {
            postData.append('link', content.link)
        }

        const response = await fetch(`https://graph.facebook.com/v18.0/${content.page_id}/feed`, {
            method: 'POST',
            body: postData
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Facebook API error: ${error}`)
        }

        const result = await response.json()
        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'facebook',
            external_id: result.id,
            external_url: `https://facebook.com/${result.id}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await OAuthService.getCredentials('', 'facebook')
        const response = await fetch(`https://graph.facebook.com/v18.0/${result.external_id}/insights?access_token=${credentials.access_token}`)

        if (!response.ok) return {}

        const data = await response.json()
        return data.data || {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.message || content.message.length === 0) {
            errors.push('Facebook post message is required')
        }

        if (!content.page_id) {
            errors.push('Facebook page ID is required')
        }

        return { valid: errors.length === 0, errors }
    }
}

export class InstagramService implements PublishingService {
    platform = 'instagram' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const creds = await OAuthService.getCredentials(credentials.user_id, 'instagram')
            const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${creds.access_token}`)
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await OAuthService.getCredentials(job.pack_id, 'instagram')
        const content = job.content_data as InstagramContent

        // Instagram requires a two-step process:
        // 1. Create media container
        // 2. Publish the media

        const containerData = new URLSearchParams({
            image_url: content.media_url,
            caption: content.caption,
            access_token: credentials.access_token
        })

        const containerResponse = await fetch('https://graph.facebook.com/v18.0/me/media', {
            method: 'POST',
            body: containerData
        })

        if (!containerResponse.ok) {
            const error = await containerResponse.text()
            throw new Error(`Instagram container creation error: ${error}`)
        }

        const container = await containerResponse.json()

        // Publish the media
        const publishData = new URLSearchParams({
            creation_id: container.id,
            access_token: credentials.access_token
        })

        const publishResponse = await fetch('https://graph.facebook.com/v18.0/me/media_publish', {
            method: 'POST',
            body: publishData
        })

        if (!publishResponse.ok) {
            const error = await publishResponse.text()
            throw new Error(`Instagram publish error: ${error}`)
        }

        const result = await publishResponse.json()
        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'instagram',
            external_id: result.id,
            external_url: `https://instagram.com/p/${result.id}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await OAuthService.getCredentials('', 'instagram')
        const response = await fetch(`https://graph.facebook.com/v18.0/${result.external_id}/insights?access_token=${credentials.access_token}`)

        if (!response.ok) return {}

        const data = await response.json()
        return data.data || {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.caption || content.caption.length === 0) {
            errors.push('Instagram caption is required')
        }

        if (!content.media_url) {
            errors.push('Instagram media URL is required')
        }

        if (content.caption && content.caption.length > 2200) {
            errors.push('Instagram caption exceeds 2200 character limit')
        }

        return { valid: errors.length === 0, errors }
    }
}

